import asyncio, json, os, subprocess, glob
import imageio_ffmpeg

ROOT = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(ROOT, "assets", "voice")
FF = imageio_ffmpeg.get_ffmpeg_exe()
sc = json.load(open(os.path.join(ROOT, "script.json"), encoding="utf-8"))
rate = sc["meta"]["rate"]
voice = sc["meta"]["voice"]

todo = []
for s in sc["scenes"]:
    for i, text in enumerate(s["narration"]):
        k = f"{s['id']}_{i+1}"
        wav = os.path.join(V, k + ".wav")
        if not (os.path.exists(wav) and os.path.getsize(wav) > 10000):
            todo.append((k, text))
print("missing", len(todo), flush=True)

async def main():
    import edge_tts
    for k, text in todo:
        mp3 = os.path.join(V, k + ".mp3")
        wav = os.path.join(V, k + ".wav")
        ok = False
        for attempt in range(30):
            try:
                c = edge_tts.Communicate(text, voice, rate=rate)
                await c.save(mp3)
                if os.path.exists(mp3) and os.path.getsize(mp3) > 3000:
                    ok = True
                    break
            except Exception as e:
                print(k, "retry", attempt + 1, type(e).__name__, flush=True)
            await asyncio.sleep(1.0 + attempt * 0.7)
        if not ok:
            raise RuntimeError("failed " + k)
        subprocess.run([FF, "-y", "-i", mp3, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le", wav], check=True)
        print("ok", k, flush=True)

asyncio.run(main())
print("done", flush=True)
