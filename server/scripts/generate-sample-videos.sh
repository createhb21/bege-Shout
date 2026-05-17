#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO_DIR="$ROOT_DIR/public/videos"
mkdir -p "$VIDEO_DIR"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required to generate sample videos." >&2
  exit 1
fi

ffmpeg -y \
  -f lavfi -i "testsrc=size=360x640:rate=24" \
  -f lavfi -i "sine=frequency=660:sample_rate=44100:duration=2" \
  -t 2 \
  -pix_fmt yuv420p \
  -c:v libx264 \
  -c:a aac \
  "$VIDEO_DIR/sample-sunset-loop.mp4" >/dev/null 2>&1

ffmpeg -y \
  -f lavfi -i "color=c=0x101826:size=360x640:rate=24" \
  -f lavfi -i "sine=frequency=330:sample_rate=44100:duration=2" \
  -vf "drawgrid=w=60:h=60:t=2:c=0x7ee7ff,drawbox=x=70:y=220:w=220:h=120:color=0x7ee7ff@0.35:t=fill" \
  -t 2 \
  -pix_fmt yuv420p \
  -c:v libx264 \
  -c:a aac \
  "$VIDEO_DIR/sample-night-walk.mp4" >/dev/null 2>&1

ffmpeg -y \
  -f lavfi -i "color=c=0xffd7a8:size=360x640:rate=24" \
  -f lavfi -i "sine=frequency=520:sample_rate=44100:duration=2" \
  -vf "drawbox=x=40:y=180:w=280:h=160:color=0xff7b54:t=fill,drawbox=x=80:y=220:w=200:h=80:color=0x1b1b1b@0.5:t=fill" \
  -t 2 \
  -pix_fmt yuv420p \
  -c:v libx264 \
  -c:a aac \
  "$VIDEO_DIR/sample-studio-pulse.mp4" >/dev/null 2>&1

printf 'Generated sample videos in %s\n' "$VIDEO_DIR"
