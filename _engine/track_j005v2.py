# JOB-005 v2: per-frame face box + hand track (outro) + person matte clips (hook, deploy)
import cv2, json, numpy as np, mediapipe as mp, subprocess, sys
from mediapipe.tasks.python import vision, BaseOptions
JOB = sys.argv[1]
SRC = JOB + r"\sdr_v2\base_v2.mp4"
PUB = r"reel\public\j005v2"
W, H = 1080, 1920
fl = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="work/face_landmarker.task"), running_mode=vision.RunningMode.VIDEO, num_faces=1))
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path="work/selfie.tflite"), running_mode=vision.RunningMode.VIDEO, output_confidence_masks=True))
MATTE = {"hook": (0, 60), "deploy": (1575, 1800)}  # frame ranges [a,b)
def enc(name):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                             "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "6M", "-deadline", "realtime", "-cpu-used", "6", "-auto-alt-ref", "0",
                             f"{PUB}/matte_{name}.webm"], stdin=subprocess.PIPE)
pipes = {k: enc(k) for k in MATTE}
cap = cv2.VideoCapture(SRC); i = 0; faces = []; hands = []; prev = None; last = None
while True:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB); ts = int(i * 1000 / 30)
    r = fl.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb), ts)
    if r.face_landmarks:
        xs = [p.x * W for p in r.face_landmarks[0]]; ys = [p.y * H for p in r.face_landmarks[0]]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys); h = y1 - y0
        last = [x0, y0 - 0.45 * h, x1, y1]  # extend up to include cap
    box = last
    faces.append({"f": i, "box": [round(v) for v in box] if box else None, "det": bool(r.face_landmarks)})
    small = cv2.resize(rgb, (432, 768))
    m = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=small), ts).confidence_masks[0].numpy_view().copy()
    if m.ndim == 3: m = m[..., 0]
    m = cv2.resize(m, (W, H)); m = m if prev is None else 0.6 * m + 0.4 * prev; prev = m
    a = cv2.GaussianBlur(np.clip((m - 0.35) / 0.3, 0, 1), (0, 0), 2.0)
    if i >= 1860 and box:  # outro raised hand: topmost person pixel left of face
        xl = int(box[0]) - 40
        reg = a[: int(box[3]), : max(10, xl)] > 0.5
        ys_, xs_ = np.nonzero(reg)
        if len(ys_):
            top = ys_.min(); sel = xs_[ys_ < top + 120]
            hands.append({"f": i, "x": int(sel.mean()), "y": int(top + 90)})
    for k, (fa, fb) in MATTE.items():
        if fa <= i < fb:
            pipes[k].stdin.write(np.dstack([rgb, (a * 255).astype(np.uint8)]).tobytes())
    i += 1
for p in pipes.values(): p.stdin.close(); p.wait()
# backfill missing boxes at start
fb = next(f["box"] for f in faces if f["box"])
for f in faces:
    if not f["box"]: f["box"] = fb
json.dump({"fps": 30, "W": W, "H": H, "note": "box=[x0,y0,x1,y1] landmarks bbox, top extended 45% for cap", "faces": faces, "hands": hands},
          open(JOB + r"\face_track_v2.json", "w"))
json.dump({"faces": [f["box"] for f in faces], "hands": hands}, open(r"reel\src\j005v2_track.json", "w"))
print("frames", i, "detected", sum(f["det"] for f in faces), "hands", len(hands))
