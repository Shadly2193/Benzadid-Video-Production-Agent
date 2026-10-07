# re-detect missing face frames in IMAGE mode (VIDEO mode lost track 46.8-64.5), then interpolate any remaining gaps
import cv2, json, numpy as np, mediapipe as mp, sys
from mediapipe.tasks.python import vision, BaseOptions
JOB = sys.argv[1]; W, H = 1080, 1920
J = json.load(open(JOB + r"\face_track_v2.json"))
fl = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="work/face_landmarker.task"), running_mode=vision.RunningMode.IMAGE, num_faces=1, min_face_detection_confidence=0.3))
cap = cv2.VideoCapture(JOB + r"\sdr_v2\base_v2.mp4"); i = 0
F = J["faces"]
while True:
    ok, fr = cap.read()
    if not ok: break
    if not F[i]["det"]:
        r = fl.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)))
        if r.face_landmarks:
            xs = [p.x * W for p in r.face_landmarks[0]]; ys = [p.y * H for p in r.face_landmarks[0]]
            h = max(ys) - min(ys)
            F[i]["box"] = [round(min(xs)), round(min(ys) - 0.45 * h), round(max(xs)), round(max(ys))]; F[i]["det"] = True; F[i]["src"] = "image"
    i += 1
det = [k for k, f in enumerate(F) if f["det"]]
for k, f in enumerate(F):
    if not f["det"]:
        a = max([d for d in det if d < k], default=None); b = min([d for d in det if d > k], default=None)
        if a is None: f["box"] = F[b]["box"]
        elif b is None: f["box"] = F[a]["box"]
        else:
            w = (k - a) / (b - a); f["box"] = [round(F[a]["box"][j] * (1 - w) + F[b]["box"][j] * w) for j in range(4)]
        f["src"] = "interp"
json.dump(J, open(JOB + r"\face_track_v2.json", "w"))
json.dump({"faces": [f["box"] for f in F], "hands": J["hands"]}, open(r"reel\src\j005v2_track.json", "w"))
print("still interp", sum(1 for f in F if f.get("src") == "interp"))
