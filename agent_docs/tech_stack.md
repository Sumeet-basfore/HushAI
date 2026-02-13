# Tech Stack & Tools

## Core
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Icons:** Lucide React

## Backend & Data
- **Backend Logic:** Next.js Server Actions (`app/actions/`)
- **Database:** Supabase (PostgreSQL) - *Optional for MVP, mainly for history.*
- **Auth:** None (MVP), or Supabase Auth (Phase 2).

## AI & Processing (The Zero-Cost Stack)
- **Text Analysis:** Google Gemini 1.5 Flash (via Google AI Studio SDK)
- **Transcription:** Groq SDK (Whisper Large v3)
- **YouTube Extraction:** `youtube-transcript`
- **Local Processing:** `ffmpeg.wasm` (Client-side audio extraction)

## Infrastructure
- **Hosting:** Vercel (Hobby Tier)
