"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function transcribeAudio(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    console.log(`Transcribing file: ${file.name} (${file.size} bytes)`);

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
      response_format: "json", // or verbose_json
      language: "en", // Optional: force English
      temperature: 0.0,
    });

    console.log("Transcription successful");
    return { success: true, data: { text: transcription.text } };

  } catch (error: unknown) {
    console.error("Transcription error:", error);
    const msg = error instanceof Error ? error.message : "Transcription failed";
    return { success: false, error: msg };
  }
}
