import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export interface ExtractionProgress {
  status: 'loading' | 'extracting' | 'chunking' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface AudioChunk {
  blob: Blob;
  startTime: number;
  duration: number;
  index: number;
}

export class FFmpegManager {
  private ffmpeg: FFmpeg | null = null;
  private maxFileSizeMB = 500; // Maximum video file size in MB
  private targetChunkDurationMinutes = 45; // Process videos in 45-minute chunks
  private groqFileLimitMB = 25; // Groq has 25MB limit

  async load(onProgress?: (progress: ExtractionProgress) => void) {
    if (this.ffmpeg) return this.ffmpeg;

    const ffmpeg = new FFmpeg();

    // Load ffmpeg.wasm from a CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

    try {
      onProgress?.({ status: 'loading', progress: 0, message: 'Loading FFmpeg...' });
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      this.ffmpeg = ffmpeg;
      onProgress?.({ status: 'loading', progress: 100, message: 'FFmpeg loaded' });
      return ffmpeg;
    } catch (error) {
      console.error("Failed to load FFmpeg:", error);
      onProgress?.({ status: 'error', progress: 0, message: 'Failed to load FFmpeg' });
      throw error;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (500MB limit for browser processing)
    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is ${this.maxFileSizeMB}MB.`
      };
    }

    // Check file type
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      return {
        valid: false,
        error: 'Invalid file format. Please upload a video or audio file.'
      };
    }

    return { valid: true };
  }

  async extractAudio(
    videoFile: File, 
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<Blob> {
    const validation = this.validateFile(videoFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const ffmpeg = await this.load(onProgress);
    const inputName = 'input' + this.getExtension(videoFile.name);
    const outputName = 'output.mp3';

    try {
      onProgress?.({ status: 'extracting', progress: 10, message: 'Reading video file...' });
      
      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      
      onProgress?.({ status: 'extracting', progress: 30, message: 'Extracting audio...' });

      // Optimized settings for long videos:
      // - 16k bitrate for smaller files (Groq handles low quality well)
      // - Mono channel to reduce size
      // - 16kHz sample rate (adequate for speech)
      // These settings produce ~7MB per hour
      await ffmpeg.exec([
        '-i', inputName,
        '-vn',                    // No video
        '-acodec', 'libmp3lame',  // MP3 codec
        '-b:a', '16k',            // Very low bitrate (7MB/hour)
        '-ar', '16000',           // 16kHz sample rate (speech optimized)
        '-ac', '1',               // Mono channel
        '-f', 'mp3',              // Force MP3 format
        outputName
      ]);

      onProgress?.({ status: 'extracting', progress: 90, message: 'Finalizing...' });

      // Read result
      const data = await ffmpeg.readFile(outputName);
      
      onProgress?.({ status: 'complete', progress: 100, message: 'Extraction complete' });

      // Cleanup
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new Blob([data as any], { type: 'audio/mp3' });
      
    } catch (error) {
      onProgress?.({ 
        status: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Extraction failed' 
      });
      
      // Cleanup on error
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      } catch {}
      
      throw error;
    }
  }

  async extractAudioInChunks(
    videoFile: File,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<AudioChunk[]> {
    const validation = this.validateFile(videoFile);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const ffmpeg = await this.load(onProgress);
    const inputName = 'input' + this.getExtension(videoFile.name);
    
    try {
      onProgress?.({ status: 'chunking', progress: 5, message: 'Analyzing video duration...' });
      
      // Write file to FFmpeg FS
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      
      // Get video duration
      const duration = await this.getVideoDuration(ffmpeg, inputName);
      
      if (!duration || duration <= this.targetChunkDurationMinutes * 60) {
        // Video is short enough, process normally
        const blob = await this.extractAudio(videoFile, onProgress);
        return [{ blob, startTime: 0, duration: duration || 0, index: 0 }];
      }

      // Calculate chunks
      const chunkDuration = this.targetChunkDurationMinutes * 60; // seconds
      const numChunks = Math.ceil(duration / chunkDuration);
      const chunks: AudioChunk[] = [];

      onProgress?.({ 
        status: 'chunking', 
        progress: 10, 
        message: `Processing ${numChunks} chunks of ~${this.targetChunkDurationMinutes} minutes each...` 
      });

      // Extract audio in chunks
      for (let i = 0; i < numChunks; i++) {
        const startTime = i * chunkDuration;
        const currentChunkDuration = Math.min(chunkDuration, duration - startTime);
        const outputName = `chunk_${i}.mp3`;
        
        const progressPercent = 10 + (i / numChunks) * 80;
        onProgress?.({ 
          status: 'chunking', 
          progress: progressPercent, 
          message: `Processing chunk ${i + 1}/${numChunks}...` 
        });

        await ffmpeg.exec([
          '-ss', startTime.toString(),
          '-t', currentChunkDuration.toString(),
          '-i', inputName,
          '-vn',
          '-acodec', 'libmp3lame',
          '-b:a', '16k',
          '-ar', '16000',
          '-ac', '1',
          '-f', 'mp3',
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = new Blob([data as any], { type: 'audio/mp3' });
        
        chunks.push({
          blob,
          startTime,
          duration: currentChunkDuration,
          index: i
        });

        // Clean up chunk file
        await ffmpeg.deleteFile(outputName).catch(() => {});
      }

      onProgress?.({ status: 'complete', progress: 100, message: 'All chunks processed' });

      // Cleanup
      await ffmpeg.deleteFile(inputName).catch(() => {});

      return chunks;
      
    } catch (error) {
      onProgress?.({ 
        status: 'error', 
        progress: 0, 
        message: error instanceof Error ? error.message : 'Chunk extraction failed' 
      });
      
      // Cleanup
      try {
        await ffmpeg.deleteFile(inputName);
      } catch {}
      
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getVideoDuration(_ffmpeg: FFmpeg, _inputName: string): Promise<number> {
    try {
      // Use ffprobe-like approach by attempting to get info
      // This is a workaround since ffprobe isn't available in ffmpeg.wasm
      // We'll estimate based on file size or use a default
      return 0; // Return 0 to trigger single-file processing
    } catch {
      return 0;
    }
  }

  private getExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? `.${ext}` : '.mp4';
  }
}

// Helper to load blob URL
async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

export const ffmpegManager = new FFmpegManager();
