from youtube_transcript_api import YouTubeTranscriptApi
import sys
import json

def get_transcript(video_id):
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)

        transcript = None

        # Priority 1: Manual English
        try:
            transcript = transcript_list.find_manually_created_transcript(['en'])
        except:
            pass

        # Priority 2: Generated English
        if not transcript:
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
            except:
                pass

        # Priority 3: Any English (fallback)
        if not transcript:
             try:
                transcript = transcript_list.find_transcript(['en'])
             except:
                pass

        # Priority 4: First available (Desperation)
        if not transcript:
            try:
                # iterates and returns the first one
                for t in transcript_list:
                    transcript = t
                    break
            except:
                pass

        if not transcript:
            raise Exception("No suitable transcript found.")

        fetched = transcript.fetch()

        # Format consistent with what we need
        formatted = [{"text": i.text, "offset": i.start, "duration": i.duration} for i in fetched]
        print(json.dumps(formatted))
    except Exception as e:
        # Check if it's a "TranscriptsDisabled" or similar known error structure
        error_msg = str(e)
        if "TranscriptsDisabled" in error_msg:
             error_msg = "Transcripts are disabled for this video."
        elif "NoTranscriptFound" in error_msg:
             error_msg = "No English transcript found."

        print(json.dumps({"error": error_msg}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_transcript.py <video_id>", file=sys.stderr)
        sys.exit(1)

    video_id = sys.argv[1]
    get_transcript(video_id)
