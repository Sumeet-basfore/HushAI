# Testing Strategy 

## Manual Verification
1. **The Link Test:** Paste a valid YouTube link. Does it crash?
2. **The "Wait" Test:** Do the progress bars look active?
3. **The Mobile Check:** Open Chrome DevTools (Mobile View). Is the button clickable?

## Deployment Check
- Every major feature (Phase completion) must be deployed to Vercel to verify the Server Actions work in a production environment (time limits, edge functions).
