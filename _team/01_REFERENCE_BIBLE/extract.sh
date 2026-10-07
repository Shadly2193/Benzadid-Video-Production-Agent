#!/bin/sh
# Bible raw data: hook sheet (0-3s @10fps), full sheet (2fps), scene cuts, audio loudness
cd "$(dirname "$0")"
for f in "../../My Expectation videos reference/"E*.mp4; do
  id=$(basename "$f" | cut -c1-3); mkdir -p "$id"
  ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of json "$f" > "$id/probe.json"
  ffmpeg -v error -y -t 3 -i "$f" -vf "fps=10,scale=216:-1,tile=6x5" -frames:v 1 "$id/hook_0-3s_10fps.jpg"
  ffmpeg -v error -y -i "$f" -vf "fps=2,scale=180:-1,tile=10x8" "$id/sheet_2fps_%02d.jpg"
  ffmpeg -v info -i "$f" -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 > "$id/cuts.txt"
  ffmpeg -v error -i "$f" -vn -ac 1 -ar 16000 "$id/audio.wav" -y
  echo "$id done: $(wc -l < "$id/cuts.txt") cuts"
done
