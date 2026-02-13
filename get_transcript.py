from youtube_transcript_api import YouTubeTranscriptApi
import sys
import json

def get_transcript(video_id):
    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        # Try to find english, or auto-generated english
        try:
             transcript = transcript_list.find_transcript(['en'])
        except:
             try:
                 transcript = transcript_list.find_generated_transcript(['en'])
             except:
                 # Fallback to any transcript if english fails? Or just let it fail
                 # Let's try to get translation if needed?
                 # ideally we want 'en'
                 transcript = transcript_list.find_transcript(['en'])

        fetched = transcript.fetch()

        # Format consistent with what we need
        formatted = [{"text": i.text, "offset": i.start, "duration": i.duration} for i in fetched]
        print(json.dumps(formatted))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_transcript.py <video_id>", file=sys.stderr)
        sys.exit(1)

    video_id = sys.argv[1]
    get_transcript(video_id)
