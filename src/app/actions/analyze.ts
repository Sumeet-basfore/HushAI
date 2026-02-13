"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from "child_process";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Helper to extract video ID
function getVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function analyzeTranscript(url: string) {
  try {
    console.log(`Analyzing: ${url}`);

    // 1. Validate URL & Extract ID
    const videoId = getVideoId(url);
    if (!videoId) {
      return { success: false, error: "Invalid YouTube URL" };
    }

    // 2. Fetch Transcript via Python Script
    console.log(`Fetching transcript for ID: ${videoId}`);
    const scriptPath = path.join(process.cwd(), "get_transcript.py");

    // Wrap python execution in a promise
    const transcriptData = await new Promise<any[]>((resolve, reject) => {
      const pythonProcess = spawn("python3", [scriptPath, videoId]);

      let dataString = "";
      let errorString = "";

      pythonProcess.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorString += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script error:", errorString);
          // Try to parse error json if possible
          try {
             const errObj = JSON.parse(errorString);
             reject(new Error(errObj.error || "Unknown python error"));
          } catch {
             reject(new Error("Failed to fetch transcript. The video might not have captions or is restricted."));
          }
          return;
        }

        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          console.error("Failed to parse python output:", dataString);
          reject(new Error("Failed to parse transcript data"));
        }
      });
    });

    if (!transcriptData || transcriptData.length === 0) {
      return { success: false, error: "No transcript found." };
    }

    // Combine text
    const fullText = transcriptData.map((item) => item.text).join(" ");

    // Truncate if too long
    const maxLength = 100000;
    const textToAnalyze = fullText.length > maxLength
      ? fullText.substring(0, maxLength)
      : fullText;

    console.log(`Transcript length: ${textToAnalyze.length}`);

    // 3. Send to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze the following YouTube video transcript and identifying the most "viral" segments.

      Output ONLY a raw JSON array of strings, where each string is a catchy, viral hook or summary of a key segment.
      Do not output markdown code blocks. Just the JSON array.

      Transcript:
      "${textToAnalyze}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text);

    // Clean up potential markdown formatting if Gemini ignores instructions
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let hooks: string[] = [];
    try {
      hooks = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      return { success: false, error: "AI response format error" };
    }

    return { success: true, data: { hooks } };

  } catch (error: any) {
    console.error("Error in analyzeTranscript:", error);
    return { success: false, error: error.message || "Failed to analyze video." };
  }
}
