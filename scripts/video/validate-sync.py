import json
import os
from mutagen.mp3 import MP3

TIMING_PATH = "scripts/video/scene-timings.json"
AUDIO_DIR = "scripts/video/audio"
MAX_DRIFT_MS = 500

def validate():
    with open(TIMING_PATH, "r") as f:
        timings = json.load(f)

    total_audio = 0
    issues = []

    print("=" * 60)
    print("SYNC VALIDATION REPORT")
    print("=" * 60)

    for scene in timings["scenes"]:
        audio_path = os.path.join(AUDIO_DIR, f"{scene['id']}.mp3")

        if not os.path.exists(audio_path):
            issues.append(f"MISSING: {audio_path}")
            print(f"  {scene['id']}: FILE MISSING")
            continue

        audio = MP3(audio_path)
        actual_ms = int(audio.info.length * 1000)
        expected_ms = scene["audio_duration_ms"]
        drift = abs(actual_ms - expected_ms)
        total_audio += actual_ms

        status = "OK" if drift < MAX_DRIFT_MS else "DRIFT"
        print(f"  {status} {scene['id']}: {actual_ms}ms (expected {expected_ms}ms)")

        if drift >= MAX_DRIFT_MS:
            issues.append(f"{scene['id']}: {drift}ms drift")

    print("=" * 60)
    print(f"Total audio: {total_audio // 1000}s")
    print(f"Expected:    {timings['total_duration_ms'] // 1000}s")

    sync_report = "scripts/video/sync-report.json"
    if os.path.exists(sync_report):
        with open(sync_report) as f:
            sync = json.load(f)
        max_drift = max(abs(s["drift_ms"]) for s in sync)
        avg_drift = sum(abs(s["drift_ms"]) for s in sync) / len(sync)
        print(f"\nVideo sync: max {max_drift}ms, avg {avg_drift:.0f}ms")

    if not issues:
        print("\nALL GOOD")
    else:
        print(f"\n{len(issues)} issue(s):")
        for i in issues:
            print(f"  - {i}")

if __name__ == "__main__":
    validate()
