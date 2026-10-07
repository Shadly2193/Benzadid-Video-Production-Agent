"""Builds the visual Pattern Library menu (Bengali) with embedded reference frames + SFX samples."""
import os, glob, base64, subprocess, json, html

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
REF = os.path.join(ROOT, "My Expectation videos reference")
SFX = os.path.join(ROOT, "_engine", "reel", "public", "sfx")
OUT = os.path.join(ROOT, "_team", "01_REFERENCE_BIBLE", "menu.html")
vids = {os.path.basename(p)[:3]: p for p in glob.glob(os.path.join(REF, "E*.mp4"))}

def frame(e, t):
    r = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", vids[e], "-frames:v", "1", "-vf", "scale=220:-1",
                        "-q:v", "6", "-f", "image2", "-c:v", "mjpeg", "-"], capture_output=True)
    return "data:image/jpeg;base64," + base64.b64encode(r.stdout).decode()

def audio(n):
    return "data:audio/mpeg;base64," + base64.b64encode(open(os.path.join(SFX, n + ".mp3"), "rb").read()).decode()

FORMATS = [
 ("F1", "বসে কথা বলা + caption + মাঝে মাঝে insert", "আপনি এক জায়গায় বসে কথা বলবেন। নিচে লেখা আসবে, মাঝে মাঝে zoom আর ছোট ছবি/screen card ভেসে আসবে।", "আপনার নিজের সাধারণ video", [("E02", 1.8), ("E06", 9.0), ("E11", 3.2)]),
 ("F2", "কথা ↔ পুরো পর্দার লেখা-card", "আপনি কথা বলবেন, মাঝে মাঝে পুরো পর্দা জুড়ে রঙিন লেখার card আসবে (যেমন ৩টা নিয়ম)।", "টিপস / নিয়ম বোঝানো", [("E05", 0.5), ("E05", 2.2), ("E05", 6.5)]),
 ("F3", "হেঁটে কথা + লেখা মাথার পেছনে", "কয়েক জায়গায় হেঁটে কথা বলবেন; বড় লেখা আপনার মাথার পেছনে বসবে, হাতের তালুতে ছবি আসবে।", "premium personal brand", [("E16", 1.5), ("E16", 6.0), ("E12", 1.0)]),
 ("F4", "মুখ ছাড়া motion graphics", "শুধু আপনার voice। একই background, প্রতি বাক্যে একটা বস্তু (দাঁত, হৃদয়, laptop…) আর লেখা।", "শিক্ষামূলক post (English v2 এটাই)", [("E14", 2.0), ("E08", 1.5), ("E01", 5.0)]),
 ("F5", "লম্বা কথা/podcast → reel", "লম্বা recording থেকে ৩০–৪৫ সেকেন্ড; শুরুতে আপনার মুখ, মাঝে ব্যাখ্যার animation, শেষে আবার মুখ।", "podcast / lecture", [("E10", 1.5), ("E10", 6.0), ("E10", 16.0)]),
 ("F6", "সিনেমার মতো শুরু → তারপর মুখ", "প্রথম ৫–৬ সেকেন্ড অন্ধকার HUD-এ লেখা আর camera move, তারপর আপনি।", "বড় ঘোষণা / launch", [("E03", 1.0), ("E03", 2.6), ("E03", 6.5)]),
 ("F7", "Website ব্যবসার promo (phone/laptop mockup)", "Client website phone/laptop-এর ভেতরে চলবে, cursor click, সংখ্যা গুনে ওঠা, chart।", "Benzadid service promo", [("E13", 2.0), ("E13", 8.0), ("E13", 30.0)]),
 ("F8", "Client-এর ফলাফল (case study)", "আপনি গল্প বলবেন, মাঝে client-এর কাজের B-roll আর বড় সংখ্যা ('৳… / ১০০ appointment')।", "client success", [("E11", 3.5), ("E11", 8.0), ("E11", 40.0)]),
 ("F9", "শরীর ঘিরে বাঁকা লেখা (signature)", "লেখা আপনার কাঁধ/হাত ঘিরে বেঁকে বেঁকে আসে — শুধু hook লাইনের জন্য।", "শুরুর ৩ সেকেন্ড", [("E15", 1.0), ("E15", 1.5), ("E15", 4.0)]),
]
HOOKS = [
 ("H1", "কথার মাঝখান থেকে শুরু, কোনো 'হ্যালো' নেই", ("E02", 0.2)),
 ("H2", "ছোট শব্দ + বিশাল মূল শব্দ, একটা একটা করে আসে", ("E16", 1.0)),
 ("H3", "শুরুতেই টাকা/সংখ্যা গুনে ওঠে", ("E13", 1.6)),
 ("H4", "ঝাপসা থেকে পরিষ্কার হয়, তারপর camera ঝটকা দিয়ে সরে", ("E01", 1.0)),
 ("H5", "অন্ধকারে লেখা জোড়া লাগে, camera পিছিয়ে যায়", ("E03", 2.0)),
 ("H6", "শব্দের একটা অক্ষরের জায়গায় আসল বস্তু", ("E08", 1.6)),
 ("H7", "মানুষটা লাল ছায়া হয়ে ঝলক দিয়ে আসে", ("E15", 0.05)),
 ("H8", "Countdown/timer যা শেষ পর্যন্ত চলে", ("E06", 2.5)),
 ("H9", "হাতের তালুতে ছবি এসে বসে", ("E16", 2.4)),
]
CAPS = [
 ("C1", "দুই স্তর: বুকে ছোট subtitle + উপরে বড় মূল শব্দ", ("E02", 3.0)),
 ("C2", "বস্তুর উপরে-নিচে লেখার গুচ্ছ (E14 / English v2)", ("E14", 3.0)),
 ("C3", "মোটা বাঁকা বড় হাতের লেখা; হলুদ=সংখ্যা, লাল=নেতিবাচক", ("E06", 1.0)),
 ("C4", "Karaoke: পরের শব্দ আবছা, বলার সাথে উজ্জ্বল", ("E05", 0.6)),
 ("C5", "ছোট সাদা পরিষ্কার লেখা (premium, শান্ত)", ("E11", 10.0)),
 ("C6", "মূল শব্দ মাথার পেছনে", ("E16", 1.2)),
 ("C7", "লেখা শরীর ঘিরে বাঁকা", ("E15", 2.5)),
]
TRANS = [
 ("T2", "Camera ঝটকা দিয়ে উপরে/পাশে সরে, ঝাপসা হয়ে পরের দৃশ্য", ("E01", 2.8)),
 ("T3", "রঙিন আলোর ঝলক (orange/yellow flash)", ("E05", 0.85)),
 ("T4", "জোর দিতে হঠাৎ সাদা-কালো বা লাল রঙ", ("E06", 14.5)),
 ("T5", "শুধু বস্তুর উপর pixel ভেঙে জোড়া লাগা", ("E14", 0.8)),
 ("T6", "অন্ধকারে spotlight-এর গোল আলো", ("E10", 25.0)),
 ("T7", "একই জগতে camera একটানা চলে (কাট নেই)", ("E04", 1.5)),
]
SOUNDS = [
 ("tick", "১. Tick", "লেখা আসলে — সবচেয়ে ছোট", "light_tap"),
 ("pop", "২. Pop", "বস্তু/card/badge আসলে", "pop_bubble"),
 ("whoosh", "৩. নরম whoosh", "camera নড়লে / দৃশ্য বদলালে", "wind"),
 ("swish", "৪. দ্রুত swish", "লেখা ধাক্কা দিয়ে আসলে", "swoosh_fast"),
 ("glitch", "৫. Digital blip", "pixel transition (E14)", "glitch_small"),
 ("riser", "৬. Riser", "বড় কিছুর ঠিক আগে উঠতে থাকা শব্দ", "riser_trailer"),
 ("impact", "৭. Impact / boom", "নতুন অংশ / প্রথম মুখ দেখা — ৮–১০ সেকেন্ডে একবার", "impact_cool"),
 ("ding", "৮. Ding", "সাফল্য / notification", "ding_happy"),
]

data = {"formats": [{"id": i, "name": n, "what": w, "use": u, "imgs": [frame(e, t) for e, t in fr], "refs": " · ".join(sorted({e for e, _ in fr}))} for i, n, w, u, fr in FORMATS],
        "hooks": [{"id": i, "name": n, "img": frame(*fr), "ref": fr[0]} for i, n, fr in HOOKS],
        "caps": [{"id": i, "name": n, "img": frame(*fr), "ref": fr[0]} for i, n, fr in CAPS],
        "trans": [{"id": i, "name": n, "img": frame(*fr), "ref": fr[0]} for i, n, fr in TRANS],
        "sounds": [{"id": i, "name": n, "when": w, "src": audio(f)} for i, n, w, f in SOUNDS]}
tpl = open(os.path.join(os.path.dirname(__file__), "menu_template.html"), encoding="utf-8").read()
open(OUT, "w", encoding="utf-8").write(tpl.replace("/*DATA*/", "const DATA=" + json.dumps(data, ensure_ascii=False) + ";"))
print(OUT, os.path.getsize(OUT) // 1024, "KB")
