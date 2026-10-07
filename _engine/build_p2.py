"""Builds reel/src/p2plan.json: scene timings, word-by-word subtitle timings, transitions and frame-locked SFX
for project 002 (General Surgeon website). All times derive from the original voiceover word timings
mapped through the cut map, so audio, text and SFX share one clock."""
import json, librosa, numpy as np

FPS = 30
cut = json.load(open("work/p2/cutmap.json"))  # [orig_start, orig_end, new_start]
VO_LEN = sum(e - s for s, e, _ in cut)

def m(t):
    """original voiceover time -> edited timeline time"""
    for s, e, n in cut:
        if s - 0.02 <= t <= e + 0.02:
            return round(n + (min(max(t, s), e) - s), 3)
    nxt = [n for s, e, n in cut if s > t]
    return nxt[0] if nxt else VO_LEN

# (orig time, word, style)  style: i = serif italic, b = bold, t = teal bold, l = latin italic
P = {
    "P1": [(4.59, "একজন", "i"), (5.21, "সার্জন", "b")],
    "P2": [(5.75, "প্রথমে", "i"), (6.49, "তার", "i"), (6.69, "Scalpel", "b"), (7.29, "দিয়েই", "b")],
    "P3": [(7.79, "Incision", "l"), (8.43, "দেন", "t")],
    "P4": [(8.61, "এবং", "i"), (9.41, "সার্জারী", "b"), (9.91, "শুরু", "b"), (10.09, "করেন", "b")],
    "P5": [(10.66, "Incision", "l"), (11.30, "এর পর থেকেই", "i")],
    "P6": [(12.12, "Layer", "l"), (12.74, "by", "l"), (12.98, "Layer", "l"), (13.42, "সার্জারী করে থাকেন", "i")],
    "P7": [(14.54, "Incision", "l"), (15.46, "যত", "i"), (15.74, "নিখুঁত", "b"), (16.14, "এবং", "i"), (16.58, "সুন্দর", "t"), (16.96, "হয়", "i")],
    "P8": [(17.30, "সব কাজ শেষ করে", "i"), (18.74, "Suturing", "l"), (19.72, "এর সময়েও", "i"), (20.16, "ঠিক ততটাই", "i"), (21.12, "সুন্দর করে", "b"), (21.80, "Stitch", "t"), (22.20, "দেয়া যায়", "i")],
    "P9": [(22.86, "এই", "i"), (23.84, "Surgical", "l"), (24.20, "Art", "l"), (24.76, "এর কথা মাথায় রেখেই", "i")],
    "P10": [(26.28, "আমি চেষ্টা করেছি", "i")],
    "P11": [(27.76, "এই জেনারেল সার্জনের", "i"), (29.12, "ওয়েবসাইটের", "i"), (29.70, "হিরো সেকশনে", "b")],
    "P12": [(30.56, "আমি এমনভাবে", "i"), (31.96, "ডিজাইন করবো", "b"), (32.68, "যাতে", "i")],
    "P13": [(33.14, "স্ক্রলিং এর", "b"), (33.98, "সাথে সাথেই", "i"), (34.62, "সুন্দর ভাবে", "i"), (35.76, "টেক্সট চলে আসে", "type")],
    "P14": [(39.08, "এবং", "i"), (39.28, "ওয়েবসাইটের", "i"), (39.84, "শুরুটা হয়", "b")],
    "P15": [(40.44, "আমি", "i"), (41.28, "Dr. Shadly", "b")],
    "P16": [(41.98, "আমি এবং আমার টিম", "i")],
    "P17": [(43.50, "সর্বোচ্চ", "b"), (44.26, "চেষ্টা করছি", "i")],
    "P18": [(44.92, "শুধুমাত্র", "i"), (45.62, "ডক্টরদের জন্য", "b")],
    "P19": [(46.64, "এইরকম", "i"), (48.12, "Innovative", "bullet"), (48.72, "আইডিয়া দিয়ে", "i")],
    "P20": [(49.56, "Premium Looking", "bullet")],
    "P21": [(50.56, "International Standard", "bullet")],
    "P22": [(52.04, "World Class", "bullet"), (52.98, "লেভেলের", "i")],
    "P23": [(53.46, "website ডেভেলপ করে দেয়ার", "i")],
}
W = {k: [{"t": m(t), "w": w, "st": st, "p": k} for t, w, st in v] for k, v in P.items()}
start = lambda k: W[k][0]["t"]

# scene list: (id, first phrase, phrases, transition-in)
SC = [
    ("surgeon", "P1", ["P1"], "fade"),
    ("scalpel", "P2", ["P2"], "zoom"),
    ("incision", "P3", ["P3", "P4"], "zoom"),
    ("layers", "P5", ["P5", "P6"], "whip"),
    ("stitch", "P7", ["P7", "P8"], "morph"),
    ("art", "P9", ["P9", "P10"], "whip"),
    ("hero", "P11", ["P11", "P12"], "rise"),
    ("scroll", "P13", ["P13", "P14"], "blur"),
    ("shadly", "P15", ["P15", "P16", "P17"], "iris"),
    ("phone", "P18", ["P18"], "whip"),
    ("bullets", "P19", ["P19", "P20", "P21", "P22", "P23"], "blur"),
]
ENDING = 2.638
scenes = []
for i, (sid, first, phr, tr) in enumerate(SC):
    s = 0.0 if i == 0 else round(start(first) - 0.12, 3)  # visuals land a hair before the word
    scenes.append({"id": sid, "s": s, "tr": tr, "words": [w for p in phr for w in W[p]]})
for a, b in zip(scenes, scenes[1:]):
    a["e"] = b["s"]
scenes[-1]["e"] = round(VO_LEN + 0.15, 3)
end_s = scenes[-1]["e"]
scenes.append({"id": "ending", "s": end_s, "e": round(end_s + ENDING, 3), "tr": "flash", "words": [{"t": round(end_s + 0.25, 3), "w": "কি? ভালো লাগছে?", "st": "b", "p": "END"}]})
TOTAL = scenes[-1]["e"]

# ---- music beat grid (Lil Sky Beats) ----
y, sr = librosa.load("reel/public/p2/lil_sky.mp3", sr=22050, duration=120)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
MUSIC_FROM = 3.0
beats_v = [round(b - MUSIC_FROM, 3) for b in beats if b >= MUSIC_FROM]

# ---- SFX locked to animation keyframes (offsets mirror P2Final.tsx) ----
SFX = []
def add(t, n, v, d=None):
    e = {"t": round(max(0, t), 3), "n": n, "v": v}
    if d: e["d"] = d
    SFX.append(e)
TR_SND = {"fade": ("short_wind_swoosh", 0.35), "zoom": ("whoosh_fast", 0.55), "blur": ("air_sweep", 0.35), "whip": ("swoosh_fast", 0.5),
          "morph": ("light_tap", 0.45), "rise": ("short_wind_swoosh", 0.45), "iris": ("impact_deep", 0.45), "flash": ("pop_bubble", 0.45)}
for sc in scenes:
    n, v = TR_SND[sc["tr"]]
    add(sc["s"] - (0.10 if sc["tr"] in ("zoom", "whip", "blur", "rise") else 0), n, v, 2.0 if n == "impact_deep" else None)
    s = sc["s"]
    if sc["id"] == "surgeon":
        add(s + 0.05, "pop_bubble", 0.3)
    if sc["id"] == "scalpel":
        add(s + 0.40, "dagger_woosh", 0.45)                     # blade glint as zoom settles
        add(s + 26 / FPS, "page_chime", 0.30)                   # SCALPEL label lands (frame 26)
    if sc["id"] == "incision":
        add(s + 24 / FPS, "sword_slash", 0.40)                  # teal incision line starts drawing (frame 24)
    if sc["id"] == "layers":
        for i in range(3):
            add(s + (6 + i * 8) / FPS, "device_click", 0.40)   # each tissue slab lands
    if sc["id"] == "stitch":
        st0 = next(w["t"] for w in sc["words"] if w["w"] == "Suturing") - s
        for i in range(9):
            add(s + st0 + (10 + i * 5) / FPS, "typewriter_soft", 0.38)  # each stitch is drawn
        add(s + st0 + (10 + 9 * 5) / FPS, "pop_bubble", 0.35)           # final knot
    if sc["id"] == "scroll":
        tw = next(w for w in sc["words"] if w["st"] == "type")
        for k in range(len(tw["w"].replace(" ", ""))):
            add(tw["t"] + k * 0.055, "key_single", 0.22)            # typewriter: one key per character
    if sc["id"] == "shadly":
        add(s + 16 / FPS, "page_turn_chime", 0.30)                 # name lands as iris finishes
    if sc["id"] == "phone":
        add(s + 0.35, "notify_positive", 0.25, 1.2)
    if sc["id"] == "bullets":
        for w in sc["words"]:
            if w["st"] == "bullet":
                add(w["t"], "option_select", 0.45)                  # each bullet pops in on its word
SFX.sort(key=lambda x: x["t"])

plan = {"fps": FPS, "total": round(TOTAL, 3), "vo": "p2/vo_final.wav", "voLen": round(VO_LEN, 3),
        "music": {"file": "p2/lil_sky.mp3", "from": MUSIC_FROM, "bpm": float(np.atleast_1d(tempo)[0]), "beats": beats_v[:200]},
        "scenes": scenes, "sfx": SFX}
json.dump(plan, open("reel/src/p2plan.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"VO {VO_LEN:.2f}s  total {TOTAL:.2f}s  bpm {plan['music']['bpm']:.0f}  sfx {len(SFX)}")
for sc in scenes:
    print(f"  {sc['id']:9s} {sc['s']:6.2f}-{sc['e']:6.2f} ({sc['e']-sc['s']:.1f}s) {sc['tr']:6s} | " + " ".join(w['w'] for w in sc['words']))
