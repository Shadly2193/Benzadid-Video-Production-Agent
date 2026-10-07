"""Measure the colour 'look' of videos: luma black/mid/white points, contrast, saturation, skin hue/sat (YCrCb skin mask).
Usage: python grade_measure.py <video> [<video>...]  -> prints JSON per video (sampled 12 frames)."""
import sys, json, subprocess, numpy as np, cv2

import os, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
_TASK = os.path.join(os.path.dirname(__file__), "..", "..", "_engine", "work", "face_landmarker.task")
FACE = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_buffer=open(_TASK, "rb").read()), num_faces=1))

def face_box(img):
    r = FACE.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    if not r.face_landmarks: return []
    xs = [p.x for p in r.face_landmarks[0]]; ys = [p.y for p in r.face_landmarks[0]]
    h, w = img.shape[:2]; x0, y0 = int(min(xs) * w), int(min(ys) * h)
    return [(x0, y0, int(max(xs) * w) - x0, int(max(ys) * h) - y0)]

def frames(path, n=12):
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True).stdout)
    out = []
    for i in range(n):
        t = d * (i + 0.5) / n
        r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1", "-vf", "scale=360:-2", "-f", "image2pipe", "-c:v", "png", "-"], capture_output=True)
        img = cv2.imdecode(np.frombuffer(r.stdout, np.uint8), cv2.IMREAD_COLOR)
        if img is not None: out.append(img)
    return out

def measure(path):
    Ls, S, skinH, skinS, skinL, wb = [], [], [], [], [], []
    for img in frames(path):
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
        L = lab[..., 0] * 100 / 255
        Ls.append(L.ravel())
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
        S.append(hsv[..., 1].ravel() / 255)
        faces = face_box(img)
        m = np.zeros(img.shape[:2], bool)
        for (x, y, w, h) in faces[:1]:
            m[y + int(h * .45):y + int(h * .75), x + int(w * .2):x + int(w * .8)] = True   # cheeks/nose band
        if m.any():
            skinH.append(hsv[..., 0][m].mean() * 2); skinS.append(hsv[..., 1][m].mean() / 255); skinL.append(L[m].mean())
        bright = L >= np.percentile(L, 97)
        if bright.sum() > 20: wb.append([(lab[..., 1][bright].mean() - 128), (lab[..., 2][bright].mean() - 128)])
    L = np.concatenate(Ls); Sa = np.concatenate(S)
    p = np.percentile(L, [2, 25, 50, 75, 98])
    return {"black_p2": round(p[0], 1), "q1": round(p[1], 1), "mid_p50": round(p[2], 1), "q3": round(p[3], 1), "white_p98": round(p[4], 1),
            "contrast_iqr": round(p[3] - p[1], 1), "sat_mean": round(float(Sa.mean()), 3),
            "skin_hue_deg": round(float(np.mean(skinH)), 1) if skinH else None, "skin_sat": round(float(np.mean(skinS)), 3) if skinS else None,
            "skin_L": round(float(np.mean(skinL)), 1) if skinL else None,
            "highlight_cast_a_b": [round(float(x), 1) for x in np.mean(wb, axis=0)]}

if __name__ == "__main__":
    print(json.dumps({p.split("/")[-1].split("\\")[-1][:40]: measure(p) for p in sys.argv[1:]}, indent=1))
