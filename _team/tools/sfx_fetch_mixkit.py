"""Download royalty-free SFX (Mixkit Free License: commercial use, no attribution) by category into _team/sfx_library/<group>/.
Writes sfx_library/index.json (title, file, source, license). Idempotent: skips files already present.
Usage: python sfx_fetch_mixkit.py [max_per_category]"""
import os, re, sys, json, time, urllib.request, html as H

LIB = os.path.join(os.path.dirname(__file__), "..", "sfx_library")
# our groups -> mixkit category slugs
GROUPS = {
 "ui": ["click", "interface", "tap", "notification", "beep", "bleep", "mouse", "keyboard", "type", "typewriter", "laptop", "phone", "correct", "wrong", "error", "alerts"],
 "transition": ["whoosh", "woosh", "swoosh", "swish", "transition", "sweep", "swell", "zoom", "whip", "slide", "rewind", "glitch", "static"],
 "impact": ["impact", "hit", "boom", "thud", "bass", "drum", "punch", "stomp", "cinematic", "intro"],
 "money": ["money", "coin", "casino", "slot-machine", "win", "lose"],
 "medical": ["hospital", "heartbeat", "teeth", "breathe", "metal", "glass", "emergency", "siren"],
 "tech": ["technology", "high-tech", "sci-fi", "robot", "electricity", "laser", "video-game", "arcade", "synth", "tones"],
 "paper": ["paper", "page", "write"],
 "magic": ["magic", "sparkle", "fairy", "spell", "chimes", "ding", "bell"],
 "time": ["clock", "countdown", "alarm"],
 "objects": ["doors", "lock", "key", "camera", "drop", "pop", "bubbles", "balloon", "wood", "tools", "light", "spin", "toy", "squeak", "cartoon", "funny"],
 "nature": ["wind", "rain", "thunder", "storm", "waves", "water", "forest", "bird", "crickets", "morning", "night", "fire"],
 "city": ["city", "traffic", "car-horn", "bus", "car", "motorcycle", "train", "public-places", "crowd", "office", "restaurant", "supermarket"],
 "human": ["applause", "clapping", "cheer", "laugh", "gasp", "footsteps", "walk", "run", "jump", "falling", "kiss", "wow"],
 "music_stings": ["suspense-music", "happy", "sad", "orchestra", "piano", "game-show", "festive"],
}
UA = {"User-Agent": "Mozilla/5.0"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()

def items(slug):
    s = get(f"https://mixkit.co/free-sound-effects/{slug}/").decode("utf-8", "ignore")
    out = []
    for m in re.finditer(r'preview-url-value="(https://assets\.mixkit\.co/active_storage/sfx/(\d+)/\d+-preview\.mp3)"', s):
        t = re.search(r'item-grid-card__title">\s*([^<]+?)\s*<', s[m.end():m.end() + 3000])
        out.append((m.group(2), m.group(1), H.unescape(t.group(1)) if t else f"sfx {m.group(2)}"))
    return out

def main(maxn=12):
    os.makedirs(LIB, exist_ok=True)
    idx_path = os.path.join(LIB, "index.json")
    idx = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {}
    for g, slugs in GROUPS.items():
        os.makedirs(os.path.join(LIB, g), exist_ok=True)
        for slug in slugs:
            try:
                its = items(slug)[:maxn]
            except Exception as e:
                print("skip", slug, e); continue
            for sid, url, title in its:
                if sid in idx: continue
                name = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")[:50] + f"_{sid}.mp3"
                fp = os.path.join(LIB, g, name)
                try:
                    open(fp, "wb").write(get(url))
                except Exception as e:
                    print("fail", sid, e); continue
                idx[sid] = {"title": title, "group": g, "tag": slug, "file": f"{g}/{name}", "source": url, "license": "Mixkit Free License"}
                time.sleep(0.2)
            print(g, slug, len(its), flush=True)
            json.dump(idx, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("total", len(idx))

if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 12)
