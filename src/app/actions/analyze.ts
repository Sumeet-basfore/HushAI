"use server";

import OpenAI from "openai";
import { spawn } from "child_process";
import path from "path";

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Helper to extract video ID
function getVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export async function analyzeTranscript(url: string, scriptLength: "short" | "long" = "short", longFormWords: number = 1000) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        } catch {
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

    // Use shared analysis logic
    return await analyzeText(fullText, scriptLength, longFormWords);

  } catch (error: unknown) {
    console.error("Error in analyzeTranscript:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze video";
    return { success: false, error: errorMessage };
  }
}

export async function analyzeText(text: string, scriptLength: "short" | "long" = "short", longFormWords: number = 1000) {
    try {
        // Truncate if too long
        const maxLength = 100000;
        const textToAnalyze = text.length > maxLength
          ? text.substring(0, maxLength)
          : text;

        console.log(`Analyzing text length: ${textToAnalyze.length}`);

        // Calculate word counts based on script type
        // Short form: 60 seconds at ~130-150 words per minute = ~130-150 words
        // Long form: user-selected word count
        const shortFormWords = 140; // Fixed for 60 seconds
        const longFormWordsFinal = scriptLength === "long" ? longFormWords : 1000;

        // 3. Send to OpenRouter (using Gemini via OpenRouter)
        // Using a free model available on OpenRouter
        const model = "arcee-ai/trinity-large-preview:free";

        const systemPrompt = `
          Analyze the following content and generate ORIGINAL, INSPIRED viral content - NOT a copy or direct summary.
          
          The key is to use the provided content as INSPIRATION to create fresh, unique scripts that capture the essence and style while being completely original content.
          
          Generate the following based on script type:
          ${scriptLength === "short" ? `
          - SHORT FORM: Exactly ~${shortFormWords} words (designed for 60-second video)
          - Create an engaging, punchy script optimized for short-form platforms (Reels, TikTok, YouTube Shorts)
          - Include hook, value proposition, and call-to-action
          ` : `
          - LONG FORM: Approximately ${longFormWordsFinal} words (designed for ${Math.round(longFormWordsFinal / 130)}-minute video)
          - Create a comprehensive, well-structured script for long-form content (YouTube, LinkedIn)
          - Include intro hook, main body with key points, and conclusion with CTA
          `}
          
          Output ONLY a raw JSON object with the following structure:
          {
            "hooks": ["3-5 catchy viral hooks"],
            "scripts": [
              { "title": "Short Form Script (60 seconds)", "content": "..." },
              { "title": "Long Form Script (~${longFormWordsFinal} words)", "content": "..." }
            ],
            "description": "A compelling YouTube video description with SEO keywords.",
            "captions": ["3 Instagram/LinkedIn caption options"],
            "hashtags": ["15-20 relevant hashtags"],
            "related_ideas": ["5 future content ideas based on this topic"]
          }
          
          IMPORTANT: 
          - Create ORIGINAL content inspired by the source material, not direct copying
          - The scripts should capture the STYLE, TONE, and TOPIC from the inspiration
          - Do not output markdown code blocks. Just the JSON object.
        `;

        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: textToAnalyze }
          ],
        });

        const responseText = completion.choices[0].message.content || "";
        console.log("OpenRouter response:", responseText);

        // Clean up potential markdown formatting if AI ignores instructions
    // Match first { to last } to extract JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resultData: any = {};
    try {
      resultData = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse AI JSON:", responseText);
      return { success: false, error: "AI response format error. Raw: " + responseText.substring(0, 100) + "..." };
    }

    return { success: true, data: resultData };
    } catch (error: unknown) {
        console.error("Error in analyzeText:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to analyze text";
        return { success: false, error: errorMessage };
    }
}
