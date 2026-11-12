import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(ROOT, "timeline.json"), encoding="utf-8"))

# Subtitle-only wording: narration keeps the spoken form for TTS, subtitles show the written form.
DISPLAY = {
    "SVD đạt RMSE không phẩy tám hai, và precision at five gần sáu mươi chín phần trăm.":
        "SVD đạt RMSE 0,82, và precision@5 gần 68,5%.",
}

# Quiz content is visual-only, so keep it in sync with the script (timeline carries audio timings).
script = json.load(open(os.path.join(ROOT, "script.json"), encoding="utf-8"))
qmap = {s["id"]: s["quiz"] for s in script["scenes"] if s.get("quiz")}
for e in tl["scenes"]:
    if e["id"] in qmap:
        e["quiz"] = qmap[e["id"]]


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
    return best[1] + "\n" + best[2] if best else text


out = []
for i, c in enumerate(tl["cues"], 1):
    text = DISPLAY.get(c["text"], c["text"])
    c["text"] = text
    out.append(str(i))
    out.append(f"{ts(c['start'])} --> {ts(c['end'])}")
    out.append(wrap(text))
    out.append("")
srt = os.path.join(os.path.dirname(ROOT), "AmThucPhuongNam_GoiYCaNhanHoa_5min.srt")
open(srt, "w", encoding="utf-8").write("\n".join(out))

data = {
    "meta": tl["meta"],
    "total": tl["total"],
    "fps": tl["fps"],
    "scenes": tl["scenes"],
    "cues": tl["cues"],
}
js = "window.DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
open(os.path.join(ROOT, "data.js"), "w", encoding="utf-8").write(js)
print("srt:", srt)
print("data.js:", os.path.join(ROOT, "data.js"), len(js), "bytes")
print("scenes:", len(data["scenes"]), "cues:", len(data["cues"]), "total:", data["total"])
