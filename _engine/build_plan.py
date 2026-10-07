"""Builds reel/src/plan.json from the corrected script + Whisper word timings + gaze-away ranges."""
import json, re, difflib

DUR = 48.3
SPEECH_START, SPEECH_END = 0.86, 45.2

# Corrected script (from the published O02 captions), as two-tier caption groups: (small top line, big keyword line)
G = [
 ("একজন ডাক্তারের", "ওয়েবসাইটের"), ("", "Case Study"), ("", "দেখাই"),
 ("", "Client-A doctor"), ("একজন", "Endo-vascular Surgeon"), ("আমার", "Mentor"),
 ("স্যারের আগের", "Website"), ("", "কেমন ছিলো?"),
 ("শুধু ১টা", "Landing Page"), ("", "Static Design"), ("স্যারের", "হালকা বিবরণ"), ("চেম্বারের", "Contact Information"),
 ("এরপর", "কী হলো?"), ("স্যার আমার", "Support নিলেন"), ("আমি", "কী করলাম?"), ("পুরো", "Website"), ("নতুনভাবে", "Design করলাম"),
 ("Frontend এ", "কী কী আছে?"), ("Introductory Video সহ", "Hero সেকশন"), ("দুই", "ভাষার Website"),
 ("বাংলায় Click করলে", "বাংলায় দেখাবে"), ("English এ Click করলে", "English এ"),
 ("Patient এর", "Painpoint ভিত্তিক"), ("", "Hooking Copy"), ("স্যারের", "পরিচয় সেকশন"), ("", "Symptom Checker"),
 ("যাতে রোগী নিজের", "Symptom বুঝে"), ("", "পরামর্শ নেন"), ("", "কেন করেছি?"), ("Conversion", "এর জন্য"),
 ("আর", "কী আছে?"), ("ছবিসহ", "Disease সেকশন"), ("স্যারের", "Journal Publication"), ("স্যারের", "Blog Articles"), ("স্যারের", "Chamber Location"),
 ("মোবাইলে এই Website", "দেখতে কেমন?"), ("", "এইরকম"), ("Backend এ", "কী কী আছে?"), ("স্যার", "Blog লিখতে পারবেন"), ("ছবি", "Upload করতে"),
 ("Publication", "Add করতে পারবেন"), ("নিজের", "Information Update"), ("", "করতে পারবেন"), ("এইভাবে ডাক্তারের", "Website বানিয়ে দেই"),
]

# rough phonetic Bangla spelling of English words so they can match Whisper's Bangla output
PHON = {"case": "কেস", "study": "স্টাডি", "dr.": "ডক্টর", "Client-A": "আরিফ", "endo-vascular": "এন্ডোভাস্কুলার", "surgeon": "সার্জন",
        "mentor": "মেন্টর", "website": "ওয়েবসাইট", "landing": "ল্যান্ডিং", "page": "পেজ", "static": "স্ট্যাটিক", "contact": "কন্টাক্ট",
        "information": "ইনফরমেশন", "support": "সাপোর্ট", "design": "ডিজাইন", "frontend": "ফ্রন্টএন্ড", "introductory": "ইন্ট্রোডাক্টরি",
        "video": "ভিডিও", "hero": "হিরো", "click": "ক্লিক", "english": "ইংলিশ", "patient": "পেশেন্ট", "painpoint": "পেইনপয়েন্ট",
        "hooking": "হুকিং", "copy": "কপি", "symptom": "সিম্পটম", "checker": "চেকার", "conversion": "কনভার্শন", "disease": "ডিজিজ",
        "journal": "জার্নাল", "publication": "পাবলিকেশন", "blog": "ব্লগ", "articles": "আর্টিকেল", "chamber": "চেম্বার", "location": "লোকেশন",
        "backend": "ব্যাকএন্ড", "upload": "আপলোড", "add": "অ্যাড", "update": "আপডেট"}

def norm(w):
    w = PHON.get(w.lower(), w)
    w = re.sub(r"[^ঀ-৿]", "", w)
    # collapse spelling variants Whisper commonly confuses
    for a, b in [("ো", "ো"), ("ড়", "র"), ("ঢ়", "র"), ("ং", "ন"), ("য়", "য"), ("ৃ", "রি"), ("্", ""), ("ী", "ি"), ("ূ", "ু"), ("শ", "স"), ("ষ", "স"), ("ণ", "ন"), ("ঁ", "")]:
        w = w.replace(a, b)
    return w

words = json.load(open("work/words.json", encoding="utf-8"))
wtxt, wt = "", []
for w in words:
    n = norm(w["w"])
    for k, ch in enumerate(n):
        wtxt += ch
        wt.append(w["s"] + (w["e"] - w["s"]) * k / max(len(n), 1))

script = []  # (group index, tier, word)
for gi, (top, big) in enumerate(G):
    for tier, line in (("top", top), ("big", big)):
        for tok in line.split():
            script.append([gi, tier, tok, None])

stxt, sidx = "", []
for i, (_, _, tok, _) in enumerate(script):
    n = norm(tok) or "x"
    sidx.append(len(stxt))
    stxt += n

sm = difflib.SequenceMatcher(None, stxt, wtxt, autojunk=False)
cmap = {}
for a, b, size in sm.get_matching_blocks():
    for k in range(size):
        cmap[a + k] = wt[b + k]

for i, pos in enumerate(sidx):
    end = sidx[i + 1] if i + 1 < len(sidx) else len(stxt)
    hits = [cmap[p] for p in range(pos, end) if p in cmap]
    if hits:
        script[i][3] = hits[0] - (pos and 0)
# interpolate gaps, enforce monotonic
known = [(i, s[3]) for i, s in enumerate(script) if s[3] is not None]
known = [(-1, SPEECH_START)] + known + [(len(script), SPEECH_END)]
for (i0, t0), (i1, t1) in zip(known, known[1:]):
    for j in range(i0 + 1, i1):
        script[j][3] = t0 + (t1 - t0) * (j - i0) / (i1 - i0)
last = 0
for s in script:
    s[3] = max(s[3], last + 0.08); last = s[3]

caps = []
for gi, (top, big) in enumerate(G):
    ws = [s for s in script if s[0] == gi]
    caps.append({"s": round(ws[0][3] - 0.06, 2),
                 "top": [{"t": s[2], "s": round(s[3] - 0.04, 2)} for s in ws if s[1] == "top"],
                 "big": [{"t": s[2], "s": round(s[3] - 0.04, 2)} for s in ws if s[1] == "big"]})
for a, b in zip(caps, caps[1:]):
    a["e"] = b["s"]
caps[-1]["e"] = SPEECH_END + 0.2
gs = lambda gi: caps[gi]["s"]

# ---- emphasis hits (red bg, text behind person): on-camera questions ----
hits = [
    {"s": gs(6), "e": gs(8), "words": [{"t": "স্যারের আগের", "size": 110}, {"t": "WEBSITE", "size": 200, "color": "y"}, {"t": "কেমন ছিলো?", "size": 130}]},
    {"s": gs(14), "e": gs(17), "words": [{"t": "আমি কী করলাম?", "size": 110}, {"t": "পুরো Website", "size": 150, "color": "y"}, {"t": "নতুনভাবে Design", "size": 120}]},
    {"s": gs(28), "e": gs(30), "words": [{"t": "কেন করেছি?", "size": 120}, {"t": "CONVERSION", "size": 165, "color": "y"}]},
]

# ---- covers: must fully hide every looking-away range; split by script anchors ----
away = json.load(open("work/away.json"))
away = [[a, min(b, SPEECH_END + 0.1)] for a, b in away if a < SPEECH_END]
C = [  # (anchor group, src, from, kicker, title, tag, grey)
    (8, "site_old.mp4", 0, "আগের WEBSITE", "শুধু ১টা Static Landing Page", "BEFORE", True),
    (10, "site_old.mp4", 8, "আগের WEBSITE", "হালকা বিবরণ + চেম্বারের তথ্য", "BEFORE", True),
    (18, "site_new.mp4", 0, "FRONTEND", "Introductory Video সহ Hero", "AFTER", False),
    (19, "site_new.mp4", 4, "বাংলা ⇄ ENGLISH", "দুই ভাষার Website", "AFTER", False),
    (22, "site_new.mp4", 8, "HOOKING COPY", "রোগীর Painpoint ভিত্তিক লেখা", "AFTER", False),
    (24, "site_new.mp4", 106, "ABOUT", "স্যারের পরিচয়", "AFTER", False),
    (25, "site_new.mp4", 26, "রোগী নিজেই বুঝবে", "Symptom Checker", "AFTER", False),
    (31, "site_new.mp4", 48, "CONDITIONS", "ছবিসহ Disease", "AFTER", False),
    (32, "site_new.mp4", 118, "ACADEMIC", "Journal Publication", "AFTER", False),
    (33, "site_new.mp4", 94, "BLOG", "Blog Articles", "AFTER", False),
    (34, "site_new.mp4", 90, "LOCATION", "Chamber Location", "AFTER", False),
    (37, "site_new.mp4", 98, "BACKEND · ADMIN", "Backend-এ কী কী আছে?", "ADMIN", False),
    (38, "site_new.mp4", 125, "স্যার নিজেই", "Blog লিখবেন, ছবি Upload করবেন", "ADMIN", False),
    (40, "site_new.mp4", 114, "স্যার নিজেই", "Publication ও Info Update", "ADMIN", False),
]
covers = []
for a, b in away:
    inside = [c for c in C if a - 1.2 <= gs(c[0]) < b]
    if not inside:  # nothing anchored here: reuse the nearest cover content
        inside = [min(C, key=lambda c: abs(gs(c[0]) - a))]
    starts = [a] + [max(a, gs(c[0])) for c in inside[1:]]
    ends = starts[1:] + [b]
    for c, s, e in zip(inside, starts, ends):
        if e - s < 0.25:
            continue
        covers.append({"s": round(s - 0.05, 2), "e": round(e + 0.05, 2), "src": c[1], "from": c[2], "kicker": c[3], "title": c[4], "tag": c[5], "grey": c[6]})
for x, y in zip(covers, covers[1:]):  # chain touching covers exactly
    if y["s"] - x["e"] < 0.3:
        x["e"] = y["s"]

# ---- zooms on on-camera stretches ----
def covered(t):
    return any(c["s"] <= t < c["e"] for c in covers) or any(h["s"] <= t < h["e"] for h in hits)
zooms, alt = [], False
for c in caps:
    if not covered(c["s"] + 0.05):
        alt = not alt
        if alt:
            zooms.append({"s": c["s"], "e": c["e"], "scale": 1.15})
for h in hits:
    zooms.append({"s": h["s"], "e": h["e"], "scale": 1.08})

# ---- sound design ----
sfx = [{"t": 0.0, "n": "impact_intro", "v": 0.55, "d": 2.5}]
for i, c in enumerate(caps):
    if any(h["s"] <= c["s"] < h["e"] for h in hits):
        continue
    sfx.append({"t": c["s"], "n": "pop_bubble" if i % 2 else "click_ui", "v": 0.45})
    if c["big"] and c["top"]:
        sfx.append({"t": c["big"][0]["s"], "n": "whoosh_light_pop", "v": 0.5})
for h in hits:
    sfx += [{"t": h["s"] - 1.4, "n": "riser_trailer", "v": 0.3, "d": 1.5},
            {"t": h["s"], "n": "impact_deep", "v": 0.75, "d": 2.2},
            {"t": h["s"] + 0.25, "n": "glitch_small", "v": 0.25, "d": 0.4}]
prev_end = -9
for c in covers:
    chained = abs(c["s"] - prev_end) < 0.05
    sfx.append({"t": c["s"] - (0 if chained else 0.15), "n": "swoosh_fast" if chained else "whoosh_fast", "v": 0.55})
    sfx.append({"t": c["s"] + 0.3, "n": "camera_shutter", "v": 0.3})
    prev_end = c["e"]
spec = {25: ("notify_correct", 0.45, None), 21: ("key_single", 0.6, None), 23: ("typing_laptop", 0.35, 1.2),
        37: ("glitch_small", 0.35, 0.5), 38: ("typing_laptop", 0.4, 1.6), 39: ("click_select", 0.5, None),
        41: ("typing_laptop", 0.35, 1.0), 36: ("ding_happy", 0.35, 1.5)}
for gi, (n, v, d) in spec.items():
    e = {"t": gs(gi) + 0.1, "n": n, "v": v}
    if d:
        e["d"] = d
    sfx.append(e)
sfx.append({"t": SPEECH_END + 0.1, "n": "notify_positive", "v": 0.45})
sfx.sort(key=lambda x: x["t"])
for s in sfx:
    s["t"] = round(max(0, s["t"]), 2)

plan = {"duration": DUR, "music": {"file": "music_hiphop02.mp3", "from": 0}, "zooms": zooms, "covers": covers, "hits": hits,
        "captions": caps, "sfx": sfx, "lowerThird": {"s": SPEECH_END + 0.1, "e": DUR}}
json.dump(plan, open("reel/src/plan.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
matched = sum(1 for i in range(len(sidx)) if any(p in cmap for p in range(sidx[i], (sidx[i + 1] if i + 1 < len(sidx) else len(stxt)))))
print(f"script words {len(script)}, matched to audio {matched}")
for c in caps:
    print(f"{c['s']:6.2f}-{c['e']:6.2f}  {' '.join(w['t'] for w in c['top'])} | {' '.join(w['t'] for w in c['big'])}")
print("covers:", [(c['s'], c['e'], c['title']) for c in covers])
