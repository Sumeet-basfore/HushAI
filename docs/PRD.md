Product Overview
App Name: HushAI
Tagline: The Zero-Cost Viral Intelligence Tool for Creators
Launch Goal: A working prototype that delivers immediate value
Target Launch: 14 Days

Who It's For
Primary User: Sumeet (The Student Creator)
Sumeet is a university student who wants to start a content creation side hustle to earn extra cash.

His Current Pain:

Creative Block: He stares at a blank screen, unsure what to post.

Budget Zero: He can't afford $30/month for Opus Clips or editors.

Overwhelmed: Editing and captioning take hours he doesn't have.

What He Needs:

Speed: Instant viral ideas from existing content.

Free: A tool that costs $0 to run.

Actionable: Output he can use immediately (copy-paste).

User Story
"Meet Sumeet. He wants to be a creator but has no ideas and no money. He finds a 2-hour podcast on YouTube that relates to his niche. He pastes the link into HushAI. Within 60 seconds, he gets 5 viral hook ideas, a script for a short video, and a set of hashtags. He records the video on his phone using the script, posts it, and gets back to studying."

The Problem We're Solving
The "Broke vs. Scale" Gap:

Existing Free Tools (CapCut): Require hours of manual labor.

Existing Paid Tools (Opus): Cost $30/month and have strict credit limits ("Credit Anxiety").

HushAI Solution: Automates the "intelligence" layer (hooks, scripts, tags) using free-tier AI, offering the speed of paid tools without the cost.

User Journey
Discovery → Input → Value
Input (The "Magic" Box)

Sumeet lands on a clean, minimal dashboard.

He sees two options: "Paste YouTube Link" or "Upload Audio File."

He pastes a YouTube URL.

Processing (The "Wait")

The system extracts the transcript (zero data cost).

AI analyzes the text for viral potential.

Vibe: Clean progress bars, professional status updates (e.g., "Finding viral hooks...", "Generating hashtags...").

Success (The "Copy-Paste" Dashboard)

Sumeet sees a list of 3-5 "Viral Moments."

Each moment has:

Timestamp: "04:23 - 05:12"

Viral Hook: "Why 90% of Startups Fail (And How to Fix It)"

Why it Works: "High emotional valence, contrarian take."

Generated Script: A short-form script based on that segment.

He clicks "Copy" and goes to film.

MVP Features
Must Have for Launch (P0)
1. YouTube Link Processing
What: Extracts transcript directly from a YouTube URL without downloading video.

Tech: youtube-transcript library (client-side or serverless).

Success Criteria:

[ ] Works on 90% of standard YouTube videos.

[ ] Fails gracefully if no caption track exists.

2. Viral Hook Extraction (The Brain)
What: Uses Google Gemini (Free Tier) to read the transcript and identify the best segments.

User Story: As Sumeet, I want to know exactly which part of a 2-hour video is interesting so I don't have to watch it all.

Output: Start/End timestamps and a "Virality Score" (1-10).

3. Hashtag & Caption Generator
What: Generates metadata for TikTok/Shorts/Reels.

User Story: As Sumeet, I want ready-to-post captions so I don't have to think about SEO.

Success Criteria:

[ ] Generates 3-5 relevant hashtags per clip.

[ ] Writes a catchy 2-sentence caption.

4. Local Audio Upload (The "Raw" Option)
What: Allows users to upload a raw audio/video file if they don't have a YouTube link.

Tech: FFmpeg.wasm (Client-side processing) + Groq (Whisper API).

Constraint: File stays on user's device; only audio is sent to API to keep costs at $0.

5. "Clean" Result Dashboard
What: A professional, readable list of results.

Design: Simple cards, clear typography, one-click "Copy" buttons. No 3D distractions.

NOT in MVP (Saving for Version 2)
Video Rendering: No burning in captions or cropping video (too complex/expensive for day 14).

3D "Game" Elements: Removed to focus on utility and speed.

User Accounts: (Optional) Can launch without login first to reduce friction, or add simple Supabase Auth if needed for saving history.

How We'll Know It's Working
Launch Success Metric
"The Immediate Use Test"

Target: The user generates an output and clicks "Copy" within 30 seconds of seeing the results.

Qualitative: You (the founder) use it to create 5 real videos for your own channel.

Look & Feel
Design Vibe: Clean, Professional, Minimal.

Colors: Black, White, and one accent color (e.g., Electric Blue or Green).

Font: Inter or similar clean sans-serif.

Layout: Single-column focus.

Simple Wireframe
[HushAI Logo]
┌───────────────────────────────────────┐
│  [ Paste YouTube Link Here...      ]  │ [ ANALYZE ]
└───────────────────────────────────────┘
          OR [ Upload File ]

------------- RESULTS -----------------

[ CARD: Viral Clip #1 ]
🔥 Score: 9.5/10
⏰ 14:20 - 15:45
📝 Hook: "The Secret to Zero-Cost Marketing"
---------------------------------------
[ Script ]
"Did you know you can build an app for $0?
Here is the secret strategy..."
[ COPY SCRIPT ]
---------------------------------------
#marketing #startup #hushai
Technical Considerations (The Zero-Cost Stack)
Platform: Web (Next.js)
Hosting: Vercel (Hobby Tier)
Database: Supabase (Free Tier)
AI Models:

Text Analysis: Google Gemini Flash 2.5 (Free Tier via AI Studio)

Transcription: Groq Whisper Large v3 (Free Tier)
Client-Side Processing: FFmpeg.wasm for local file handling.

Budget & Constraints
Budget: $0 (Strict adherence to free tiers).
Timeline: 14 Days to working prototype.
Rate Limits: Must handle API rate limits gracefully (e.g., "System busy, retrying in 2s...").


