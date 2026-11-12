#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build voice-over, music, SFX, mixed master audio and SRT from one timeline."""
import asyncio, json, math, os, random, subprocess, sys, time, wave
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(ROOT, "assets")
VOICE = os.path.join(ASSETS, "voice")
os.makedirs(VOICE, exist_ok=True)
os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)

SR = 48000
FPS = 25
FF = __import__("imageio_ffmpeg").get_ffmpeg_exe()
SCRIPT = json.load(open(os.path.join(ROOT, "script.json"), encoding="utf-8"))
VOICE_NAME = SCRIPT["meta"]["voice"]
RATE = SCRIPT["meta"]["rate"]

def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-1200:])
    return p

def mp3_to_wav(src, dst):
    run([FF, "-y", "-i", src, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", dst])

def read_wav(path):
    with wave.open(path, "rb") as w:
        n, sw, ch, fr = w.getnframes(), w.getsampwidth(), w.getnchannels(), w.getframerate()
        raw = w.readframes(n)
    assert sw == 2 and ch == 1 and fr == SR
    return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0

def write_wav_stereo(path, data):
    x = np.clip(data, -1.0, 1.0)
    pcm = (x * 32767.0).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())

def trim_silence(x, thresh_db=-45.0, pad=0.035):
    th = 10 ** (thresh_db / 20.0)
    env = np.abs(x)
    idx = np.where(env > th)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]

def normalize_line(x, target_rms_db=-20.0, peak_ceiling_db=-3.0):
    rms = np.sqrt(np.mean(x ** 2) + 1e-12)
    gain = 10 ** (target_rms_db / 20.0) / rms
    peak = np.max(np.abs(x)) * gain
    ceiling = 10 ** (peak_ceiling_db / 20.0)
    if peak > ceiling:
        gain *= ceiling / peak
    return x * gain

async def synth(text, path, attempts=10):
    import edge_tts
    for i in range(attempts):
        try:
            c = edge_tts.Communicate(text, VOICE_NAME, rate=RATE)
            await c.save(path)
            if os.path.exists(path) and os.path.getsize(path) > 3000:
                return True
        except Exception as e:
            print(f"    retry {i+1}/{attempts}: {type(e).__name__}")
        if os.path.exists(path):
            try: os.remove(path)
            except OSError: pass
        await asyncio.sleep(0.9 + i * 0.6)
    return False

async def synth_all(sentences):
    os.makedirs(VOICE, exist_ok=True)
    for idx, s in enumerate(sentences):
        mp3 = os.path.join(VOICE, f"{s['key']}.mp3")
        wav = os.path.join(VOICE, f"{s['key']}.wav")
        if os.path.exists(wav) and os.path.getsize(wav) > 10000:
            continue
        ok = await synth(s["text"], mp3)
        if not ok:
            raise RuntimeError("TTS failed for " + s["key"])
        mp3_to_wav(mp3, wav)
        print(f"  ✓ {s['key']}  {s['text'][:52]}…")

def build_timeline():
    scenes = []
    t = 0.0
    sentences = []
    for sc in SCRIPT["scenes"]:
        for j, text in enumerate(sc["narration"]):
            sentences.append({"key": f"{sc['id']}_{j+1}", "text": text, "scene": sc["id"]})
        scenes.append(sc)
    asyncio.run(synth_all(sentences))

    timeline = []
    t = 0.0
    for sc in SCRIPT["scenes"]:
        keys = [f"{sc['id']}_{j+1}" for j in range(len(sc["narration"]))]
        clips = []
        for k in keys:
            x = read_wav(os.path.join(VOICE, k + ".wav"))
            x = trim_silence(x)
            x = normalize_line(x)
            clips.append(x)
        durs = [len(c) / SR for c in clips]
        n = len(clips)
        planned = float(sc["planned"])
        lead, tail = 0.18, 0.32
        gap = 0.26
        need = lead + sum(durs) + gap * (n - 1) + tail
        if sc["kind"] == "quiz":
            # question then countdown then answer -> handled in mix; reserve 4s
            gap = 0.25
            need += 4.15
        dur = planned
        if need > planned:
            dur = math.ceil(need * FPS) / FPS
            print(f"  ! {sc['id']} extended {planned:.2f}s -> {dur:.2f}s")
        # distribute spare time into gaps (max 0.8s) if narration is short
        spare = dur - need
        if spare > 0 and n > 1:
            extra = min(spare * 0.7, 0.55 * (n - 1))
            gap += extra / (n - 1)
        timeline.append({
            "id": sc["id"], "num": sc["num"], "kind": sc["kind"], "topic": sc["topic"],
            "start": round(t, 3), "dur": round(dur, 3), "gap": round(gap, 3),
            "quiz": sc.get("quiz"), "clips": clips, "durs": durs,
        })
        t += dur
    total = t
    # timings
    t = 0.0
    for entry in timeline:
        entry["start"] = round(t, 3)
        t += entry["dur"]
    return timeline, total

def place_sentences(timeline):
    """compute per-sentence absolute times, quiz-aware"""
    data = []
    for sc in timeline:
        st = sc["start"]
        durs = sc["durs"]
        gap = sc["gap"]
        times = []
        if sc["kind"] == "quiz":
            q_dur = durs[0]
            q_start = st + 0.20
            countdown_start = q_start + q_dur + 0.15
            countdown_end = countdown_start + 4.0
            a_start = countdown_end + 0.15
            times.append((q_start, q_start + q_dur))
            times.append((a_start, a_start + durs[1]))
            sc["countdown"] = (round(countdown_start, 3), round(countdown_end, 3))
            sc["reveal"] = round(a_start, 3)
        else:
            cur = st + 0.18
            for d in durs:
                times.append((cur, cur + d))
                cur += d + gap
        sc["times"] = [(round(a, 3), round(b, 3)) for a, b in times]
        for i, (a, b) in enumerate(sc["times"]):
            text = SCRIPT["scenes"][sc["num"] - 1]["narration"][i]
            data.append({"scene": sc["id"], "text": text, "start": a, "end": b})
    return data

def write_srt(cues, path):
    def ts(x):
        ms = int(round(x * 1000))
        h, ms = divmod(ms, 3600000)
        m, ms = divmod(ms, 60000)
        s, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
    def wrap(text, limit=56):
        if len(text) <= limit:
            return text
        words = text.split()
        best = None
        for i in range(1, len(words)):
            a, b = " ".join(words[:i]), " ".join(words[i:])
            if len(a) <= limit and len(b) <= limit:
                sc = abs(len(a) - len(b))
                if best is None or sc < best[0]:
                    best = (sc, a, b)
        if best:
            return best[1] + "\n" + best[2]
        return text
    out = []
    for i, c in enumerate(cues, 1):
        out.append(str(i))
        out.append(f"{ts(c['start'])} --> {ts(c['end'])}")
        out.append(wrap(c["text"]))
        out.append("")
    open(path, "w", encoding="utf-8").write("\n".join(out))

def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12.0)

def make_music(total, path):
    rng = random.Random(7)
    nrng = np.random.default_rng(7)
    n = int((total + 2.0) * SR)
    t = np.arange(n, dtype=np.float64) / SR
    L = np.zeros(n); R = np.zeros(n)
    bpm = 60.0
    bar = 60.0 / bpm * 4  # 4 beats
    chords = [
        [45, 52, 57, 60, 64],   # Am7
        [41, 48, 53, 57, 60],   # Fmaj7
        [48, 55, 60, 64, 67],   # Cmaj7
        [43, 50, 55, 59, 62],   # G
    ]
    nbars = int(np.ceil((total + 2) / bar))
    for b in range(nbars):
        start = b * bar
        chord = chords[b % len(chords)]
        seg = slice(int(start * SR), min(n, int((start + bar + 0.6) * SR)))
        if seg.start >= n: break
        tt = t[seg] - start
        env = np.minimum(1.0, tt / 1.2) * np.exp(-np.maximum(0, tt - bar * 0.55) / 1.1)
        env = np.minimum(env, 1.0)
        left = np.zeros(seg.stop - seg.start); right = np.zeros_like(left)
        for k, note in enumerate(chord):
            f = midi(note)
            det = 1 + rng.uniform(-0.0018, 0.0018)
            ph = rng.uniform(0, 2 * np.pi)
            wave_ = (np.sin(2 * np.pi * f * det * tt + ph) * 0.55
                     + np.sin(2 * np.pi * f * 2 * tt + ph) * 0.12)
            pan = 0.5 + 0.28 * math.sin(k * 1.7)
            left += wave_ * (1 - pan) * 0.16
            right += wave_ * pan * 0.16
        # airy noise
        air = np.convolve(nrng.standard_normal(len(tt)), np.ones(48) / 48, mode="same")
        left += air * 0.010; right += air * 0.010
        L[seg] += left * env; R[seg] += right * env
        # soft pluck
        if b % 2 == 0:
            f = midi(chord[3] + 12)
            tpl = tt
            pl = np.sin(2 * np.pi * f * tpl) * np.exp(-tpl / 0.45) * 0.05
            L[seg] += pl * 0.7; R[seg] += pl
    music = np.stack([L, R], axis=1)
    music *= 0.9 / max(1e-6, np.max(np.abs(music)))
    write_wav_stereo(path, music)

def make_sfx(total, path):
    n = int((total + 1) * SR)
    buf = np.zeros((n, 2), dtype=np.float32)
    def add(x, at, gain=1.0):
        i = int(at * SR)
        j = min(n, i + len(x))
        if i < 0 or i >= n: return
        seg = x[: j - i] * gain
        if seg.ndim == 1:
            seg = seg[:, None]
        buf[i:j] += seg
    rng = np.random.default_rng(3)
    # whoosh 0.55s
    m = int(0.55 * SR)
    tt = np.arange(m) / SR
    noise = rng.standard_normal(m)
    kern = np.ones(int(0.02 * SR)) / int(0.02 * SR)
    noise = np.convolve(noise, kern, mode="same")
    sweep = np.sin(2 * np.pi * (180 + 900 * tt / 0.55) * tt)
    whoosh = (0.5 * noise + 0.5 * sweep) * np.hanning(m) ** 1.6
    whoosh = (whoosh / max(1e-6, np.max(np.abs(whoosh)))) * 0.09
    # tick
    m2 = int(0.06 * SR); t2 = np.arange(m2) / SR
    tick = np.sin(2 * np.pi * 1250 * t2) * np.exp(-t2 / 0.012) * 0.16
    # ding
    m3 = int(0.85 * SR); t3 = np.arange(m3) / SR
    ding = (np.sin(2 * np.pi * 880 * t3) * 0.32 + np.sin(2 * np.pi * 1320 * t3) * 0.18
            + np.sin(2 * np.pi * 1760 * t3) * 0.08) * np.exp(-t3 / 0.28)
    return {"whoosh": whoosh, "tick": tick, "ding": ding, "add": add, "buf": buf, "n": n}

def build_audio(timeline, total, cues):
    # voice stem
    n = int((total + 1.0) * SR)
    voice = np.zeros(n, dtype=np.float32)
    for sc, entry in zip(SCRIPT["scenes"], timeline):
        for clip, (a, b) in zip(entry["clips"], entry["times"]):
            x = np.asarray(clip, dtype=np.float32)
            i = int(a * SR)
            j = min(n, i + len(x))
            voice[i:j] += x[: j - i]
    # music
    vmono = voice.copy()
    voice = np.stack([vmono, vmono], axis=1)
    music_path = os.path.join(ASSETS, "music.wav")
    make_music(total, music_path)
    with wave.open(music_path, "rb") as w:
        mraw = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32) / 32768.0
    music = mraw.reshape(-1, 2)[:n]
    # voice activity envelope for ducking
    win = int(0.05 * SR)
    env = np.sqrt(np.convolve(vmono ** 2, np.ones(win) / win, mode="same"))
    active = env > 10 ** (-42 / 20.0)
    # smooth: fast attack, slow release
    duck = np.zeros_like(env)
    a_att, a_rel = math.exp(-1 / (0.05 * SR)), math.exp(-1 / (0.45 * SR))
    cur = 0.0
    for i in range(0, len(active), 160):
        blk = active[i:i + 160]
        target = 1.0 if blk.any() else 0.0
        coef = a_att if target > cur else a_rel
        cur = target + (cur - target) * coef
        duck[i:i + 160] = cur
    duck = np.clip(np.convolve(duck, np.ones(480) / 480, mode="same"), 0, 1)
    music_gain_db = -30.0 - 8.5 * duck
    mg = (10 ** (music_gain_db / 20.0)).astype(np.float32)
    music = music * mg[:, None]
    # sfx
    sfx = make_sfx(total, None)
    add = sfx["add"]
    for entry in timeline:
        st = entry["start"]
        if entry["num"] > 1:
            add(sfx["whoosh"], st - 0.18, 0.55)
        if entry.get("countdown"):
            c0, c1 = entry["countdown"]
            for k in range(4):
                add(sfx["tick"], c0 + k * 1.0, 0.8)
            add(sfx["ding"], entry["reveal"], 0.7)
        if entry["kind"] == "summary":
            add(sfx["ding"], st + 0.25, 0.45)
    mix = voice[:n] + music[:n] + sfx["buf"][:n]
    # gentle high-pass to clean rumble
    mix = mix - np.mean(mix, axis=0, keepdims=True)
    raw_path = os.path.join(ROOT, "out", "mix_raw.wav")
    write_wav_stereo(raw_path, mix)
    # two-pass loudnorm
    def ln(src, dst, extra=None):
        base = [FF, "-y", "-i", src, "-af",
                "loudnorm=I=-19:TP=-2:LRA=9" + (extra or ""), "-ar", "48000", "-ac", "2"]
        run(base + ([dst] if dst else ["-f", "null", "-"]))
    p = subprocess.run([FF, "-hide_banner", "-i", raw_path, "-af",
                        "loudnorm=I=-19:TP=-2:LRA=9:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    txt = p.stderr
    j0, j1 = txt.rfind("{"), txt.rfind("}")
    meas = json.loads(txt[j0:j1 + 1])
    master = os.path.join(ROOT, "out", "audio_master.wav")
    ln(raw_path, master,
       f":measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:measured_LRA={meas['input_lra']}:measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}:linear=true")
    print("  loudnorm measured:", meas["input_i"], meas["input_tp"])
    # report final loudness
    p2 = subprocess.run([FF, "-hide_banner", "-i", master, "-af", "loudnorm=I=-19:TP=-2:LRA=9:print_format=json",
                         "-f", "null", "-"], capture_output=True, text=True)
    t2 = p2.stderr
    print("  ", t2[t2.rfind("{"):t2.rfind("}") + 1])
    return master

def main():
    timeline, total = build_timeline()
    cues = place_sentences(timeline)
    print(f"timeline total: {total:.2f}s ({int(total//60)}:{total%60:05.2f})")
    srt = os.path.join(os.path.dirname(ROOT), "AmThucPhuongNam_GoiYCaNhanHoa_5min.srt")
    write_srt(cues, srt)
    data = {"meta": SCRIPT["meta"], "total": total, "fps": FPS,
            "scenes": [{k: v for k, v in e.items() if k != "clips"} for e in timeline],
            "cues": cues}
    for e in data["scenes"]:
        e["times"] = [list(x) for x in e["times"]]
    json.dump(data, open(os.path.join(ROOT, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    master = build_audio(timeline, total, cues)
    print("master:", master, "srt:", srt)

if __name__ == "__main__":
    main()
