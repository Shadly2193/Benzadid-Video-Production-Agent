import json
P=json.load(open("reel/src/plan.json",encoding="utf-8"))
caps=P["captions"]; gs=lambda i: caps[i]["s"]
BEAT0, BPM = 13.46, 123.05; SPB=60/BPM          # music drop lands on "আমি কী করলাম?"
MUSIC_FROM = 15.98 - BEAT0                        # drop at 15.98s inside the track
snap=lambda t,tol=0.12: min([BEAT0+k*SPB for k in range(-40,80)], key=lambda b: abs(b-t)) if True else t
def sn(t,tol=0.12):
    b=snap(t); return round(b,2) if abs(b-t)<=tol else round(t,2)
scenes=[
 {"type":"talk","s":0,"e":gs(3),"dof":True,"zoom":1.04,"big":{"at":gs(1),"lines":[{"t":"CASE","size":250},{"t":"STUDY","size":250,"gold":True}]}},
 {"type":"talk","s":gs(3),"e":gs(6),"zoom":1.0},
 {"type":"card","s":sn(gs(3)),"e":gs(6),"img":"Client-A.png","name":"Client-A doctor","role":"Endo-vascular Surgeon","chip":"MY MENTOR","chipAt":gs(5)},
 {"type":"talk","s":gs(6),"e":gs(8),"dof":True,"bw":True,"zoom":1.14,"hideCaps":True,"big":{"at":gs(6),"lines":[{"t":"স্যারের আগের","size":110},{"t":"WEBSITE","size":200,"gold":True},{"t":"কেমন ছিলো?","size":120}]}},
 {"type":"laptop","s":6.7,"e":11.65,"src":"site_old.mp4","grey":True,"kicker":"BEFORE","title":"আগের Website","tag":"OLD",
  "segs":[{"at":6.7,"from":0},{"at":gs(10)-0.1,"from":7},{"at":gs(11)-0.1,"from":9.2}],
  "notes":[{"at":gs(8)+0.15,"text":"শুধু ১টা Page","shape":"underline","x":120,"y":40,"w":700,"h":60},
           {"at":gs(9)+0.05,"text":"STATIC","shape":"stamp","x":540,"y":300},
           {"at":gs(10)+0.1,"text":"তথ্য কম","shape":"arrow","x":560,"y":200,"w":280,"h":220},
           {"at":gs(11)+0.1,"text":"Contact Info","shape":"circle","x":60,"y":120,"w":620,"h":260}]},
 {"type":"talk","s":11.65,"e":gs(14),"zoom":1.12},
]
sfx=[{"t":0.02,"n":"sub_knock","v":0.6,"d":1.5},
     {"t":gs(1),"n":"bass_short","v":0.65,"d":1.2},{"t":gs(1),"n":"whoosh_light_pop","v":0.4},
     {"t":sn(gs(3)),"n":"swoosh_small","v":0.45},
     {"t":gs(5),"n":"pop_hard","v":0.35,"d":0.5},
     {"t":gs(6),"n":"drum_bass_hit","v":0.7,"d":1.5},
     {"t":6.7,"n":"whoosh_fast","v":0.5},
     {"t":gs(9)+0.05,"n":"pop_bubble","v":0.5},
     {"t":gs(11)+0.1,"n":"pop_bubble","v":0.4},
     {"t":11.55,"n":"swoosh_fast","v":0.45},
     {"t":BEAT0,"n":"impact_cool","v":0.6,"d":2.0}]
plan={"duration":48.3,"music":{"file":"music_mustard.mp3","from":round(MUSIC_FROM,3),"base":0.13,
      "levels":[{"s":gs(6),"e":gs(8),"v":0.2},{"s":BEAT0,"e":BEAT0+1.0,"v":0.32},{"s":45.3,"e":48.3,"v":0.4}]},
      "scenes":scenes,"captions":caps,"sfx":sorted(sfx,key=lambda x:x["t"])}
json.dump(plan,open("reel/src/plan3.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
print("music from",round(MUSIC_FROM,2)); print([ (s["type"],s["s"],s["e"]) for s in scenes])
