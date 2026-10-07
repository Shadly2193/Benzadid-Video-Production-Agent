import cv2, json, math, numpy as np, mediapipe as mp, sys
from mediapipe.tasks.python import vision, BaseOptions
src=sys.argv[1]
opt=vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path="work/face_landmarker.task"),
    running_mode=vision.RunningMode.VIDEO, output_facial_transformation_matrixes=True, num_faces=1)
lm=vision.FaceLandmarker.create_from_options(opt)
cap=cv2.VideoCapture(src); fps=cap.get(5); i=0; rows=[]
while True:
    ok,fr=cap.read()
    if not ok: break
    if i%3==0:
        img=mp.Image(image_format=mp.ImageFormat.SRGB,data=cv2.cvtColor(fr,cv2.COLOR_BGR2RGB))
        r=lm.detect_for_video(img,int(i*1000/fps))
        if r.facial_transformation_matrixes:
            M=np.array(r.facial_transformation_matrixes[0])[:3,:3]
            yaw=math.degrees(math.atan2(-M[2,0],math.hypot(M[2,1],M[2,2])))
            pitch=math.degrees(math.atan2(M[2,1],M[2,2]))
            rows.append({"t":round(i/fps,2),"yaw":round(yaw,1),"pitch":round(pitch,1)})
        else: rows.append({"t":round(i/fps,2),"yaw":None,"pitch":None})
    i+=1
json.dump(rows,open("work/gaze.json","w"))
for r in rows[::5]: print(r)
