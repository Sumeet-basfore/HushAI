# AGENTS.md — Master Plan for HushAI

## Project Overview
**App:** HushAI
**Goal:** The Zero-Cost Viral Intelligence Tool for Creators
**Stack:** Next.js 14+ (App Router), Tailwind CSS, Shadcn/UI, Supabase, Google Gemini, Groq Whisper.
**Current Phase:** Phase 1 — Foundation

## How I Should Think
1. **Understand Intent First**: You are building for "Sumeet," a broke student creator. Keep it free, fast, and simple.
2. **Design First**: Always use Shadcn/UI. Keep it "Clean & Minimal" (Black/White + Electric Blue #2563EB).
3. **Plan Before Coding**: Briefly describe what you are about to build before writing code.
4. **Server Actions**: Use Server Actions for all backend logic. Do NOT build complex API routes.
5. **Zero-Cost Constraint**: strict adherence to free tiers. No paid APIs.

## Plan → Execute → Verify
1. **Plan:** Outline the approach (e.g., "I will create the Analyze Server Action").
2. **Execute:** Write the code.
3. **Verify:** Ask the user to test the feature (e.g., "Paste a link and see if it logs the transcript").

## Context Files
- `agent_docs/tech_stack.md`: The Vibe-Coder stack details.
- `agent_docs/product_requirements.md`: The features we need to build.
- `agent_docs/project_brief.md`: Design and Workflow rules.

## Current State
**Last Updated:** Day 1
**Working On:** Initial Setup & UI Skeleton
**Blocked By:** None

## Roadmap (14 Days)

### Phase 1: The Skeleton (Days 1-3)
- [x] Initialize Next.js app with TypeScript & Tailwind
- [x] Install Shadcn/UI core components (Card, Button, Input, Tabs)
- [x] Build the "Hero" section (Input box for YouTube link)
- [x] Deploy to Vercel and verify live URL

### Phase 2: The Brain (Days 4-7)
- [x] Install `youtube-transcript` library (Switched to Python `youtube-transcript-api`)
- [x] Create Server Action: `analyzeTranscript(url)`
- [x] Connect Google Gemini API (Switched to OpenRouter)
- [x] Display raw viral hooks on the frontend

### Phase 3: The Polish & Uploads (Days 8-11)
- [ ] Implement FFmpeg.wasm for local audio extraction
- [ ] Connect Groq Whisper API for audio transcription
- [ ] Design the "Viral Result Cards" (Copy-paste dashboard)

### Phase 4: Launch Prep (Days 12-14)
- [ ] Add error handling (Rate limits, invalid links)
- [ ] Mobile responsiveness check
- [ ] Final "Immediate Use Test"

## What NOT To Do
- Do NOT use paid API tiers.
- Do NOT suggest complex video rendering (FFmpeg is for audio extraction only).
- Do NOT delete files without confirmation.
- Do NOT expose API keys in client-side code.
