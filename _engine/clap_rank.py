import librosa, numpy as np, torch, json, sys
from transformers import ClapModel, ClapProcessor
names=sys.argv[1:]
m=ClapModel.from_pretrained("laion/clap-htsat-unfused"); p=ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
texts=["hard hitting hip hop beat with heavy 808 bass and punchy kick drums","energetic trap instrumental beat","rap vocals, a man rapping lyrics","singing voice with lyrics","calm soft ambient music","cheesy corporate background music"]
with torch.no_grad(): te=m.get_text_features(**p(text=texts,return_tensors="pt",padding=True)); te=getattr(te,"pooler_output",te); te=te/te.norm(dim=-1,keepdim=True)
res={}
for n in names:
    y,sr=librosa.load(f"assets/mixkit/cand/{n}.mp3",sr=48000,mono=True)
    tempo,beats=librosa.beat.beat_track(y=librosa.resample(y,orig_sr=48000,target_sr=22050),sr=22050)
    sc=[]
    for st in (8,30,55):
        seg=y[int(st*sr):int((st+10)*sr)]
        if len(seg)<sr*5: continue
        with torch.no_grad():
            ae=m.get_audio_features(**p(audio=seg,sampling_rate=48000,return_tensors="pt")); ae=getattr(ae,"pooler_output",ae); ae=ae/ae.norm(dim=-1,keepdim=True)
        sc.append((ae@te.T).squeeze(0).numpy())
    s=np.mean(sc,0); res[n]={"bpm":float(np.atleast_1d(tempo)[0]),**{k:round(float(v),3) for k,v in zip(["808","trap","rap_vox","sing_vox","calm","cheesy"],s)}}
    print(n,res[n],flush=True)
json.dump(res,open("work/clap.json","w"),indent=1)
