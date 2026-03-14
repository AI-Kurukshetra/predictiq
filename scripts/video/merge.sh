#!/bin/bash
set -e

AUDIO_DIR="scripts/video/audio"
VIDEO_DIR="scripts/video"

echo "=== Step 1: Create silence padding (500ms) ==="
ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 $VIDEO_DIR/silence.mp3

echo "=== Step 2: Build concat list ==="
> $VIDEO_DIR/audio-list.txt
for f in $(ls -1 $AUDIO_DIR/*.mp3 | sort); do
  echo "file '$f'" >> $VIDEO_DIR/audio-list.txt
  echo "file '$VIDEO_DIR/silence.mp3'" >> $VIDEO_DIR/audio-list.txt
done

echo "=== Step 3: Concatenate all audio ==="
ffmpeg -y -f concat -safe 0 -i $VIDEO_DIR/audio-list.txt $VIDEO_DIR/narration-full.mp3

echo "=== Step 4: Find recorded video ==="
VIDEO_FILE=$(ls -t $VIDEO_DIR/*.webm | head -1)
echo "Using: $VIDEO_FILE"

echo "=== Step 5: Merge video + audio ==="
ffmpeg -y \
  -i "$VIDEO_FILE" \
  -i "$VIDEO_DIR/narration-full.mp3" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  "$VIDEO_DIR/predictiq-demo-final.mp4"

DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$VIDEO_DIR/predictiq-demo-final.mp4")
echo ""
echo "Done: $VIDEO_DIR/predictiq-demo-final.mp4 (${DURATION}s)"
