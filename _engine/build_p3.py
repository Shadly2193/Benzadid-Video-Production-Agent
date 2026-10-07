"""Project 003 (English): timeline for scenes, 2–3-word subtitle lines (big/small), focus zooms and SFX.
Times are the ORIGINAL voiceover word starts (Whisper), mapped through the cut map and the 1.06x speed-up."""
import json, librosa, numpy as np

FPS, SPEED = 30, 1.06
cut = json.load(open("work/p3/cutmap.json"))
VO_LEN = round(sum(e - s for s, e, _ in cut) / SPEED, 3)

def m(t):
    for s, e, n in cut:
        if s - 0.03 <= t <= e + 0.03:
            return round((n + (min(max(t, s), e) - s)) / SPEED, 3)
    nxt = [n for s, e, n in cut if s > t]
    return round(nxt[0] / SPEED, 3) if nxt else VO_LEN

# line = (orig time, [(text, size)])   size: S = small italic connector, B = big condensed keyword, T = big teal keyword
SCENES = [
    ("surgeon",  "focus", [(5.48, [("every", "S"), ("SURGEON", "B")]), (6.68, [("begins the same way", "S")])]),
    ("scalpel",  "focus", [(8.06, [("with a", "S"), ("SCALPEL", "T")])]),
    ("incision", "video", [(9.98, [("a single, precise", "S")]), (10.96, [("INCISION", "B")])]),
    ("cut",      "line",  [(12.20, [("from that first", "S"), ("CUT", "T")])]),
    ("layers",   "object",[(13.94, [("the surgery unfolds", "S")]), (15.40, [("LAYER", "B")]), (15.78, [("BY LAYER", "T")])]),
    ("suture",   "focus", [(16.66, [("and the cleaner the", "S")]), (17.92, [("INCISION", "B")])]),
    ("stitch",   "photo", [(18.62, [("the more beautiful", "S")]), (19.70, [("THE STITCH", "T")]), (20.24, [("at the very end", "S")])]),
    ("art",      "object",[(21.48, [("that's", "S"), ("SURGICAL", "B")]), (22.50, [("ART", "T")])]),
    ("laptop",   "laptop",[(22.78, [("so when I designed", "S")]), (24.50, [("this", "S"), ("GENERAL SURGEON'S", "B")]), (25.58, [("WEBSITE", "T")])]),
    ("hero",     "focus", [(25.96, [("I built that", "S"), ("ART", "T")]), (27.84, [("right into the", "S")]), (28.74, [("HERO SECTION", "B")])]),
    ("scroll",   "scroll",[(29.14, [("as you", "S"), ("SCROLL", "T")]), (30.40, [("the", "S"), ("TEXT GLIDES IN", "B")]), (31.84, [("and the", "S"), ("WEBSITE BEGINS", "T")])]),
    ("shadly",   "person",[(33.02, [("I'm", "S"), ("DR. SHADLY", "B")]), (34.56, [("my team and I", "S")])]),
    ("portfolio","portfolio", [(35.94, [("build websites", "S")]), (36.80, [("ONLY FOR DOCTORS", "B")]),
                               (37.90, [("INNOVATIVE", "T")]), (38.66, [("PREMIUM", "T")]), (39.52, [("INTERNATIONAL STANDARD", "T")]), (41.18, [("WORLD CLASS", "T")])]),
]
# per-word reveal: inside a line, words land at their own Whisper time when known
WORDT = {"SURGEON": 6.12, "SCALPEL": 8.80, "CUT": 13.50, "SURGICAL": 22.12, "ART": 27.48, "GENERAL SURGEON'S": 24.82, "SCROLL": 30.10,
         "TEXT GLIDES IN": 30.98, "WEBSITE BEGINS": 32.42, "DR. SHADLY": 34.00, "HERO SECTION": 28.74}

scenes = []
for i, (sid, kind, lines) in enumerate(SCENES):
    s = 0.0 if i == 0 else round(m(lines[0][0]) - 0.15, 3)
    L = []
    for (t, words) in lines:
        ws = []
        for txt, sz in words:
            wt = WORDT.get(txt, t) if not (sid == "art" and txt == "ART") else 22.50
            ws.append({"w": txt, "sz": sz, "t": m(max(t, wt) if txt in WORDT else t)})
        L.append({"t": m(t), "words": ws})
    scenes.append({"id": sid, "kind": kind, "s": s, "lines": L})
for a, b in zip(scenes, scenes[1:]):
    a["e"] = b["s"]
scenes[-1]["e"] = round(VO_LEN + 0.15, 3)
END_LEN = 1.5
scenes.append({"id": "ending", "kind": "ending", "s": scenes[-1]["e"], "e": round(scenes[-1]["e"] + END_LEN, 3),
               "lines": [{"t": round(scenes[-1]["e"] + 0.1, 3), "words": [{"w": "PRETTY COOL,", "sz": "B", "t": round(scenes[-1]["e"] + 0.1, 3)}, {"w": "RIGHT?", "sz": "T", "t": round(scenes[-1]["e"] + 0.45, 3)}]}]})
TOTAL = scenes[-1]["e"]

# ---- focus zooms (scene-local seconds): where the camera pushes in and the whoosh fires ----
FOCUS = {"surgeon": 0.9, "scalpel": 0.05, "suture": 0.35, "hero": 0.25}

# ---- SFX ----
SFX = []
def add(t, n, v, d=None):
    e = {"t": round(max(0, t), 3), "n": n, "v": v}
    if d: e["d"] = d
    SFX.append(e)
for sc in scenes:
    s = sc["s"]
    if sc["id"] not in ("scalpel",):                     # E14 signature: every scene change = digital pop
        add(s, "glitch_small", 0.22, 0.18); add(s + 0.01, "pop_bubble", 0.32)
    if sc["id"] in FOCUS:
        add(s + FOCUS[sc["id"]] - 0.12, "whoosh_fast", 0.55)   # whoosh rides the focus-zoom push
    if sc["id"] == "scalpel":
        add(s + 0.55, "dagger_woosh", 0.4)                       # blade glint as the zoom settles
    if sc["id"] == "incision":
        add(s + 0.8, "sword_slash", 0.42)                        # teal line starts drawing at 0.8s
    if sc["id"] == "layers":
        for k in range(4):
            add(s + 0.45 + k * 0.22, "device_click", 0.35)       # each layer separates
    if sc["id"] == "stitch":
        st = next(w["t"] for l in sc["lines"] for w in l["words"] if w["w"] == "THE STITCH")
        for k in range(7):
            add(st + 0.1 + k * 0.13, "typewriter_soft", 0.34)    # each teal stitch lands
    if sc["id"] == "shadly":
        add(s + 0.4, "page_turn_chime", 0.3)
    if sc["id"] == "portfolio":
        for l in sc["lines"]:
            for w in l["words"]:
                if w["w"] in ("INNOVATIVE", "PREMIUM", "INTERNATIONAL STANDARD", "WORLD CLASS"):
                    add(w["t"] - 0.08, "swoosh_fast", 0.42); add(w["t"], "option_select", 0.45)
    if sc["id"] == "scroll":
        add(s + 0.6, "device_click", 0.35)                       # cursor click on the page
SFX.sort(key=lambda x: x["t"])

vy, _ = librosa.load("reel/public/p3/vo.wav", sr=16000)
env = librosa.feature.rms(y=vy, frame_length=3200, hop_length=1600)[0]
env = np.convolve(env / (env.max() + 1e-9), np.ones(4) / 4, mode="same")
plan = {"fps": FPS, "total": round(TOTAL, 3), "voLen": VO_LEN, "vo": "p3/vo.wav", "focus": FOCUS,
        "music": {"file": "p3/music.mp3", "from": 8.0}, "duck": [round(float(x), 3) for x in env], "scenes": scenes, "sfx": SFX}
json.dump(plan, open("reel/src/p3plan.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"VO {VO_LEN}s total {TOTAL:.2f}s sfx {len(SFX)}")
for sc in scenes:
    print(f"  {sc['id']:9s} {sc['s']:6.2f}-{sc['e']:6.2f} ({sc['e']-sc['s']:.1f}s) {sc['kind']:9s} | " + " / ".join(" ".join(w['w'] for w in l['words']) for l in sc['lines']))
