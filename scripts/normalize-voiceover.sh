#!/bin/sh
# Normalizes raw voiceover WAV clips to -14 LUFS (YouTube loudness target)
# and encodes lightweight MP3 files into public/voiceover/ for Git + Remotion.
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="${RAW_DIR:-$ROOT_DIR/work/voiceover-raw}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/public/voiceover}"
LOUDNORM="${LOUDNORM:-I=-14:TP=-1.5:LRA=11}"
BITRATE="${BITRATE:-192k}"

mkdir -p "$OUT_DIR"

count=0
for src in "$RAW_DIR"/*.wav "$RAW_DIR"/*.WAV; do
  [ -f "$src" ] || continue
  base="$(basename "$src")"
  stem="${base%.*}"
  dest="$OUT_DIR/${stem}.mp3"
  ffmpeg -y -loglevel error -i "$src" \
    -af "loudnorm=${LOUDNORM}" \
    -ar 44100 -ac 1 -c:a libmp3lame -b:a "$BITRATE" \
    "$dest"
  echo "normalized -> public/voiceover/${stem}.mp3"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "No .wav files found in $RAW_DIR" >&2
  exit 1
fi
echo "Normalized $count clip(s) into $OUT_DIR"
