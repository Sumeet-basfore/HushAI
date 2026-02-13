# Product Requirements (MVP)

## Primary User Story
"Sumeet finds a 2-hour podcast. He pastes the link into HushAI. Within 60 seconds, he gets 5 viral hook ideas, a script, and hashtags. He copies them and films."

## Must-Have Features (P0)
1. **YouTube Link Processing:** Extract transcript without downloading video.
2. **Viral Hook Extraction:** Use Gemini to find "high emotional valence" segments.
   - Output: Timestamp, Virality Score (1-10), Hook, Script.
3. **Hashtag Generator:** 3-5 tags per clip.
4. **Local Audio Upload:** Upload file -> Extract Audio -> Send to Groq.
5. **Clean Dashboard:** No distractions, just results and "Copy" buttons.

## Success Metric
- **The Immediate Use Test:** User clicks "Copy" within 30 seconds of result generation.
