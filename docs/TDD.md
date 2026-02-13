# Technical Design Document: HushAI MVP

## 1. The "Vibe-Coder" Architecture
We are building a **Next.js Web App**. This is the industry standard for fast, free, and scalable web apps.

### The Stack (Chosen for Speed & $0 Cost)
* **Frontend (The Look):** Next.js 14+ (App Router) + Tailwind CSS.
* **UI Library (The Pro Polish):** **Shadcn/UI**.
    * *Why:* It provides pre-built, professional components (Buttons, Inputs, Cards) so you don't have to design from scratch.
* **Backend (The Logic):** Next.js Server Actions.
    * *Why:* You write backend code in the same project as your frontend. No separate server to manage.
* **Database (The Memory):** Supabase (PostgreSQL).
    * *Why:* Best free tier, easy to use dashboard.
* **AI Engine (The Brain):**
    * **Text/Video Analysis:** Google Gemini 1.5 Flash (via AI Studio).
    * **Audio Transcription:** Groq (Whisper Large v3).
* **Hosting:** Vercel (Free Hobby Tier).

---

## 2. Solving "The Unprofessional Look"
To ensure the app looks premium without hiring a designer, we will strictly adhere to this **Design System Strategy**:

### The "Clean & Minimal" Prompt Strategy
When asking the AI to generate UI, always append this instruction:
> "Use Shadcn/UI components. Keep the design minimal, using a black and white color palette with 'Electric Blue' (#2563EB) as the primary accent. Use ample whitespace and Inter font for a clean, SaaS aesthetic."

### Core Components to Install
Ask your AI to install these specific Shadcn components immediately:
1.  `Card` (for displaying results)
2.  `Button` (primary actions)
3.  `Input` & `Label` (for the YouTube link)
4.  `Progress` (for the loading state)
5.  `Tabs` (to switch between Link/Upload)

---

## 3. Solving "Connecting APIs"
We will use **Server Actions** to connect Gemini and Groq. This is the safest and easiest way for Vibe-Coders.

### The Pattern
Instead of complex API routing, we will create simple functions.
* **Step 1:** Create `actions/analyze-video.ts`.
* **Step 2:** Write a function `analyzeTranscript(text: string)`.
* **Step 3:** Call this function directly from your "Analyze" button in the UI.

### The "Safe Connect" Workflow
When you ask the AI to build an API connection, use this prompt:
> "Create a Server Action in `app/actions` to connect to [Gemini/Groq].
> 1. Use the official SDK or `fetch`.
> 2. Wrap it in a `try/catch` block to handle errors.
> 3. Return a simple object: `{ success: true, data: ... }` or `{ success: false, error: ... }`.
> Do not expose API keys to the client."

---

## 4. Implementation Roadmap (14 Days)

### Phase 1: The Skeleton (Days 1-3)
**Goal:** A blank app that looks good and deploys.
1.  **Setup:** Initialize Next.js app with TypeScript and Tailwind.
2.  **Design System:** Install Shadcn/UI.
3.  **Homepage:** Create the hero section with the "Paste Link" input.
4.  **Deploy:** Push to GitHub and connect to Vercel (verify it works live).

### Phase 2: The Brain (Days 4-7)
**Goal:** Input a YouTube Link -> Get Text.
1.  **YouTube Logic:** Install `youtube-transcript`.
2.  **Server Action:** Create action to fetch transcript from URL.
3.  **Gemini Connection:** Send transcript to Gemini Flash with the "Viral System Prompt."
4.  **Display:** Show the raw text results on the screen.

### Phase 3: The Polish & Uploads (Days 8-11)
**Goal:** Handle raw files and make it pretty.
1.  **FFmpeg:** Add the client-side audio extractor (complex step - ask AI for "FFmpeg.wasm integration").
2.  **Groq:** Connect the extracted audio to Groq API.
3.  **UI Refine:** Turn raw text results into beautiful "Viral Cards."

### Phase 4: Launch Prep (Days 12-14)
1.  **Error Handling:** What if the video is too long? (Add "Toast" notifications).
2.  **Mobile Check:** Open on your phone. Fix weird spacing.
3.  **Final Deploy:** Ship it.

---

## 5. Master Prompts for Antigravity/Cursor

**Copy these prompts to kickstart specific tasks:**

### Prompt: Initial Project Setup
```text
I am building a Next.js 14 Web App called "HushAI".
It is a viral content repurposing tool.
Stack: Next.js (App Router), Tailwind CSS, Lucide Icons.
Please initialize the project structure.
Then, help me install Shadcn/UI and set up a dark/light mode theme.
