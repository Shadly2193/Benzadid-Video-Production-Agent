import cv2, numpy as np, mediapipe as mp, subprocess
from mediapipe.tasks.python import vision, BaseOptions
opt=vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path="work/selfie.tflite"),running_mode=vision.RunningMode.VIDEO,output_confidence_masks=True)
seg=vision.ImageSegmenter.create_from_options(opt)
cap=cv2.VideoCapture("reel/public/talk.mp4"); fps=cap.get(5); W,H=1080,1920
ff=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","gray","-s",f"{W}x{H}","-r","30","-i","-","-c:v","libx264","-crf","18","-pix_fmt","yuv420p","work/mask.mp4"],stdin=subprocess.PIPE)
i=0; prev=None
while True:
    ok,fr=cap.read()
    if not ok: break
    small=cv2.resize(fr,(432,768))
    r=seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB,data=cv2.cvtColor(small,cv2.COLOR_BGR2RGB)),int(i*1000/fps))
    m=r.confidence_masks[0].numpy_view().copy()
    if m.ndim==3: m=m[...,0]
    m=cv2.resize(m,(W,H),interpolation=cv2.INTER_LINEAR)
    if prev is not None: m=0.6*m+0.4*prev   # temporal smoothing to stop flicker
    prev=m
    a=np.clip((m-0.35)/0.3,0,1)
    a=cv2.GaussianBlur(a,(0,0),2.5)
    ff.stdin.write((a*255).astype(np.uint8).tobytes()); i+=1
ff.stdin.close(); ff.wait(); print("frames",i)
