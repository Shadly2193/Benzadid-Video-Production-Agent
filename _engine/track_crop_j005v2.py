import cv2,json,sys,numpy as np,mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
JOB=sys.argv[1];J=json.load(open(JOB+r"\face_track_v2.json"));F=J["faces"]
fl=vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path="work/face_landmarker.task"),running_mode=vision.RunningMode.IMAGE,num_faces=1,min_face_detection_confidence=0.2))
cap=cv2.VideoCapture(JOB+r"\sdr_v2\base_v2.mp4");i=0;n=0
X0,Y0,S=190,280,700
while True:
    ok,fr=cap.read()
    if not ok:break
    if F[i].get("src")=="interp":
        c=cv2.cvtColor(fr[Y0:Y0+S,X0:X0+S],cv2.COLOR_BGR2RGB)
        r=fl.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.ascontiguousarray(c)))
        if r.face_landmarks:
            xs=[X0+p.x*S for p in r.face_landmarks[0]];ys=[Y0+p.y*S for p in r.face_landmarks[0]];h=max(ys)-min(ys)
            F[i]["box"]=[round(min(xs)),round(min(ys)-0.45*h),round(max(xs)),round(max(ys))];F[i]["src"]="crop";n+=1
    i+=1
det=[k for k,f in enumerate(F) if f.get("src")!="interp"]
for k,f in enumerate(F):
    if f.get("src")=="interp":
        a=max([d for d in det if d<k],default=None);b=min([d for d in det if d>k],default=None)
        if a is None:f["box"]=F[b]["box"]
        elif b is None:f["box"]=F[a]["box"]
        else:
            w=(k-a)/(b-a);f["box"]=[round(F[a]["box"][j]*(1-w)+F[b]["box"][j]*w) for j in range(4)]
json.dump(J,open(JOB+r"\face_track_v2.json","w"))
json.dump({"faces":[f["box"] for f in F],"hands":J["hands"]},open(r"reel\src\j005v2_track.json","w"))
print("crop",n,"interp",sum(1 for f in F if f.get("src")=="interp"))
for t in [47,50,53,55,57,59,61,62.6,63.5,64.4]:print(t,F[int(t*30)]["box"],F[int(t*30)].get("src"))
