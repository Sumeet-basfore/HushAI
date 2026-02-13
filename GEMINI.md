# GEMINI.md — Antigravity Configuration for HushAI

## Project Context
**App:** HushAI (Viral Content Tool)
**Stack:** Next.js 14 (App Router), Tailwind CSS, Shadcn/UI, Supabase
**AI/ML:** Google Gemini 1.5 Flash (Text), Groq Whisper (Audio)
**Constraint:** Zero-Cost ($0) strict adherence
**User Level:** Vibe-Coder (Level A) — I guide, you build.

## Core Directives
1.  **Master Plan (AGENTS.md):** ALWAYS read `AGENTS.md` first to understand the current phase and active task. Do not deviate from the roadmap.
2.  **Design System (Shadcn/UI):**
    * **Strict UI Rule:** Use Shadcn/UI components for *everything*. Do not build custom CSS components unless absolutely necessary.
    * **Vibe:** Minimal, Black & White, "Electric Blue" (#2563EB) accents, Inter font.
    * **Command:** Use `npx shadcn-ui@latest add [component]` to install.
3.  **Architecture (Server Actions):**
    * **Logic:** All backend logic (Gemini/Groq calls) goes into `app/actions/`.
    * **Security:** Never expose API keys on the client. Use `process.env`.
    * **Pattern:** Server Actions should return `{ success: boolean, data: any, error: string }`.
4.  **Zero-Cost Engineering:**
    * **Constraint:** If a feature typically costs money (e.g., video rendering), find a free workaround (e.g., FFmpeg.wasm) or strict free-tier limit.
    * **Model:** Use Gemini 1.5 Flash for text/analysis (Fast & Free).
    * **Audio:** Use Groq Whisper Large v3 for transcription.

## Workflow: Plan → Execute → Verify
1.  **Plan:** Before writing code, propose a bullet-point plan of what you will change.
2.  **Execute:** Write the code in small, functional chunks.
3.  **Verify:** Ask me to test specific parts (e.g., "Paste a YouTube link and check the console").

## "Vibe-Coder" Persona
* **Be Proactive:** If you see a missing file (like `.env`), tell me to create it.
* **Be Concise:** Don't explain *how* React works. Just show me the code.
* **Error Handling:** If I report an error, fix it immediately. Do not apologize; just provide the solution.

## Key Commands
* `npm run dev` — Start the server
* `npx shadcn-ui@latest add [component]` — Install UI components
* `npm install [package]` — Install dependencies
