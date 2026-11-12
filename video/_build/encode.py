import json, os, subprocess, sys
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.abspath(__file__))
FF = imageio_ffmpeg.get_ffmpeg_exe()

silent = os.path.join(ROOT, "out", "video_silent.mp4")
audio = os.path.join(ROOT, "out", "audio_master.wav")
srt = os.path.join(os.path.dirname(ROOT), "AmThucPhuongNam_GoiYCaNhanHoa_5min.srt")
final = os.path.join(os.path.dirname(ROOT), "AmThucPhuongNam_GoiYCaNhanHoa_5min.mp4")

for p in (silent, audio):
    if not os.path.exists(p):
        print("missing:", p)
        sys.exit(1)

cmd = [FF, "-y", "-hide_banner", "-loglevel", "error",
       "-i", silent, "-i", audio,
       "-map", "0:v:0", "-map", "1:a:0",
       "-c:v", "copy",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
       "-shortest", "-movflags", "+faststart",
       final]
print("mux:", final)
subprocess.run(cmd, check=True)

print("\n--- streams (ffmpeg -i) ---")
info = subprocess.run([FF, "-hide_banner", "-i", final], capture_output=True, text=True)
for line in info.stderr.splitlines():
    if "Stream #" in line or "Duration:" in line:
        print(line.strip())

print("--- full decode ---")
d = subprocess.run([FF, "-v", "error", "-i", final, "-f", "null", "-"], capture_output=True, text=True)
print("decode errors:", (d.stderr.strip() or "none"))

print("--- audio loudness ---")
l = subprocess.run([FF, "-hide_banner", "-i", final, "-af", "loudnorm=I=-19:TP=-2:LRA=9:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
print(l.stderr[l.stderr.rfind("{"):l.stderr.rfind("}") + 1])

tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))
print("planned duration:", tl["total"], "frames:", round(tl["total"] * tl["fps"]))
print("size MB:", round(os.path.getsize(final) / 1e6, 2))
