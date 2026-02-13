"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function analyzeTranscript(url: string) {
  try {
    console.log(`Analyzing: ${url}`);

    // 1. Validate URL
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      return { success: false, error: "Invalid YouTube URL" };
    }

    // 2. Fetch Transcript
    // youtube-transcript throws if no transcript found or disabled
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url);

    if (!transcriptItems || transcriptItems.length === 0) {
      return { success: false, error: "No transcript found for this video." };
    }

    // Combine text
    const fullText = transcriptItems.map((item) => item.text).join(" ");

    // Truncate if too long (Gemini Flash has large context, but let's be safe/efficient)
    // ~1 hour of talking is roughly 10k words. Flash can handle 1M tokens.
    // We'll send the whole thing unless it's absurdly huge.
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
