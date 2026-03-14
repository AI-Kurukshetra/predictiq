import asyncio
import json
import os
import edge_tts
from mutagen.mp3 import MP3

VOICE = "en-US-JennyNeural"
RATE = "-5%"
SCRIPT_PATH = "scripts/video/demo-script.json"
AUDIO_DIR = "scripts/video/audio"
TIMING_PATH = "scripts/video/scene-timings.json"

async def generate_scene_audio(scene, output_path):
    communicate = edge_tts.Communicate(
        text=scene["narration"],
        voice=VOICE,
        rate=RATE
    )
    await communicate.save(output_path)
    audio = MP3(output_path)
    duration_ms = int(audio.info.length * 1000)
    return duration_ms

async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)

    with open(SCRIPT_PATH, "r") as f:
        scenes = json.load(f)

    timings = []
    total_ms = 0

    for scene in scenes:
        output_path = os.path.join(AUDIO_DIR, f"{scene['id']}.mp3")
        print(f"Generating: {scene['id']} — {scene['narration'][:60]}...")

        duration_ms = await generate_scene_audio(scene, output_path)
        padded_duration = duration_ms + 500

        timings.append({
            "id": scene["id"],
            "audio_file": output_path,
            "audio_duration_ms": duration_ms,
            "scene_duration_ms": padded_duration,
            "start_ms": total_ms,
            "end_ms": total_ms + padded_duration
        })

        total_ms += padded_duration
        print(f"  Duration: {duration_ms}ms (padded: {padded_duration}ms)")

    with open(TIMING_PATH, "w") as f:
        json.dump({
            "total_duration_ms": total_ms,
            "total_duration_formatted": f"{total_ms // 60000}:{(total_ms % 60000) // 1000:02d}",
            "voice": VOICE,
            "rate": RATE,
            "scenes": timings
        }, f, indent=2)

    print(f"\nTotal duration: {total_ms // 60000}:{(total_ms % 60000) // 1000:02d}")
    print(f"Timings saved: {TIMING_PATH}")

if __name__ == "__main__":
    asyncio.run(main())
