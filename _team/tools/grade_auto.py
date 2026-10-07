"""Adaptive 'standard grade': measures raw footage, returns an ffmpeg filter that moves it to GRADE_STANDARD targets.
Never a fixed LUT. Run AFTER HDR->SDR tonemap if the source is HLG/PQ.
Usage: python grade_auto.py <video> [--preview out.jpg]   -> prints filter string + before/after stats."""
import sys, json, subprocess, numpy as np, cv2
sys.path.insert(0, __file__.rsplit("\\", 1)[0].rsplit("/", 1)[0])
from grade_measure import frames, face_box

T = {"black": 2.5, "white": 95.0, "skin_L": 50.0, "skin_sat": 0.45, "skin_hue": 22.0}   # GRADE_STANDARD.md
LIM = {"gain": 0.08, "sat": (0.85, 1.15), "gamma": (0.85, 1.2)}                          # gentle only

def stats(imgs):
    Ls, rgbHi, skin = [], [], []
    for img in imgs:
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32); L = lab[..., 0] * 100 / 255; Ls.append(L.ravel())
        hi = L >= np.percentile(L, 96)
        if hi.sum() > 20: rgbHi.append(img[hi].reshape(-1, 3).mean(0)[::-1])
        for (x, y, w, h) in face_box(img):
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
            sl = (slice(y + int(h * .45), y + int(h * .75)), slice(x + int(w * .2), x + int(w * .8)))
            skin.append((L[sl].mean(), hsv[..., 1][sl].mean() / 255, hsv[..., 0][sl].mean() * 2))
    L = np.concatenate(Ls)
    return {"black": float(np.percentile(L, 2)), "white": float(np.percentile(L, 98)),
            "hi_rgb": np.mean(rgbHi, 0).tolist() if rgbHi else [1, 1, 1],
            "skin": np.mean(skin, 0).tolist() if skin else None}

def build(s):
    f = []
    r, g, b = s["hi_rgb"]; m = (r + g + b) / 3
    # Shadly 2026-10-06 preferred the natural warm original over a neutralised one:
    # keep the camera's warmth; correct white balance ONLY for a strong cast (blue/red ratio outside 0.65..1.05).
    if not (0.65 <= b / r <= 1.05):
        tgt = (1.06, 1.0, 0.90)   # still warm
        gains = [min(max(m * w / c, 1 - LIM["gain"]), 1 + LIM["gain"]) for c, w in zip((r, g, b), tgt)]
        f.append("colorchannelmixer=rr={:.3f}:gg={:.3f}:bb={:.3f}".format(*gains))
    lo = max(0.0, (s["black"] - T["black"]) / 100); hi = min(1.0, s["white"] / T["white"])    # levels
    f.append(f"colorlevels=rimin={lo:.3f}:gimin={lo:.3f}:bimin={lo:.3f}:rimax={hi:.3f}:gimax={hi:.3f}:bimax={hi:.3f}")
    gamma, sat = 1.0, 1.0
    if s["skin"]:
        sL, sS, _ = s["skin"]
        gamma = min(max((T["skin_L"] / max(sL, 1)) ** 0.6, LIM["gamma"][0]), LIM["gamma"][1])
        sat = min(max(T["skin_sat"] / max(sS, .05), LIM["sat"][0]), LIM["sat"][1])
    f.append(f"eq=gamma={gamma:.3f}:saturation={sat:.3f}:contrast=1.03")
    return ",".join(f)

if __name__ == "__main__":
    src = sys.argv[1]; imgs = frames(src, 10); s = stats(imgs); flt = build(s)
    print(json.dumps({"before": s, "filter": flt}, indent=1))
    if "--preview" in sys.argv:
        out = sys.argv[sys.argv.index("--preview") + 1]
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "2", "-i", src, "-frames:v", "1", "-filter_complex",
                        f"[0:v]scale=540:-2,split[a][b];[b]{flt}[g];[a][g]hstack", out])
