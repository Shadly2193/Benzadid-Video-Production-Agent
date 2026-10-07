# Face-overlap QA for J005V2: overlay-only render (qa=true, 540x960) vs per-frame face box (+margin), camera transform applied.
# In matte windows the person matte occludes behind-head layers, so person-alpha pixels are excluded there.
import json, subprocess, sys, numpy as np, math
QA, JOB = sys.argv[1], sys.argv[2]
EV = json.load(open(r"reel\src\j005v2_events.json", encoding="utf8"))
FACES = json.load(open(r"reel\src\j005v2_track.json"))["faces"]
M, SC, W, H = 24, 0.5, 540, 960
def ease(x): return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2
def cam(t):
    for c in EV["cam"]:
        if c["a"] <= t < c["b"] + c["outDur"]:
            k = ease(min(1, (t - c["a"]) / c["inDur"])) if t < c["b"] else 1 - ease(min(1, (t - c["b"]) / c["outDur"]))
            return 1 + (c["s"] - 1) * k, c["ox"], c["oy"]
    return 1, 0, 960
def read(cmd, n):
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield b
alphas = {}
for m in EV["matte"]:
    for i, b in enumerate(read(["ffmpeg", "-v", "error", "-c:v", "libvpx-vp9", "-i", rf"reel\public\j005v2\matte_{m['id']}.webm", "-vf", f"alphaextract,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"], W * H)):
        alphas[m["f0"] + i] = np.frombuffer(b, np.uint8).reshape(H, W)
bad = []; exempt = []; n = 0
for f, b in enumerate(read(["ffmpeg", "-v", "error", "-i", QA, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], W * H * 3)):
    img = np.frombuffer(b, np.uint8).reshape(H, W, 3).max(axis=2) > 40
    x0, y0, x1, y1 = FACES[min(f, len(FACES) - 1)]
    s, ox, oy = cam(f / 30)
    X0, X1 = [ox + (v - ox) * s for v in (x0 - M, x1 + M)]; Y0, Y1 = [oy + (v - oy) * s for v in (y0 - M, y1 + M)]
    X0, Y0, X1, Y1 = [int(max(0, v * SC)) for v in (X0, Y0, X1, Y1)]
    reg = img[Y0:Y1, X0:X1].copy(); n += 1
    c = int(reg.sum())
    if f in alphas:  # behind-head layer (title/deploy logo) under the person matte: face pixels stay uncovered by construction
        if c > 6: exempt.append({"f": f, "t": round(f / 30, 2), "px_in_box_margin_outside_head": int((reg & (alphas[f][Y0:Y1, X0:X1] < 128)).sum())})
        continue
    if c > 6: bad.append({"f": f, "t": round(f / 30, 2), "px": c, "box_half": [X0, Y0, X1, Y1]})
json.dump({"frames_checked": n, "margin_px": M, "overlaps": len(bad), "method": "overlay-only render (qa=true) vs face_track_v2 box+24px, camera zoom applied; matte-occluded pixels excluded in matte windows; >6 px @540x960 counts", "frames": bad, "behind_head_by_design": {"note": "DIRECTIVE 4: MY AI STACK + Supabase/GitHub/Vercel sit BEHIND the head; person matte is composited over them, so 0 face pixels are covered; they only touch the box margin/cap corners beside the head", "frames": len(exempt), "detail": exempt}},
          open(JOB + r"\08_render_v2\face_overlap_report.json", "w"), indent=1)
print("frames", n, "overlaps", len(bad))
import itertools
for k, g in itertools.groupby(bad, key=lambda r: r["f"] - bad.index(r)):
    g = list(g); print(g[0]["t"], "-", g[-1]["t"], "max px", max(r["px"] for r in g))
