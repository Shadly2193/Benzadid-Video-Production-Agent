import json, numpy as np
from scipy.io import wavfile
from faster_whisper import WhisperModel
sr,a=wavfile.read("work/voice.wav"); a=a.astype("float32")/32768
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
out=[]
for st in range(0,48,8):
    seg=a[int(st*sr):int(min(st+9,48.3)*sr)]
    segs,_=m.transcribe(seg,language="bn",word_timestamps=True,vad_filter=False,beam_size=1,condition_on_previous_text=False)
    for s in segs:
        for w in s.words:
            t=st+w.start
            if st>0 and t<st+0.5: continue   # overlap region handled by previous chunk
            if t>=st+8.5: continue
            out.append({"w":w.word.strip(),"s":round(st+w.start,2),"e":round(st+w.end,2)})
    print("chunk",st,flush=True)
json.dump(out,open("work/words.json","w",encoding="utf-8"),ensure_ascii=False,indent=0)
for w in out: print(f"{w['s']:5.2f} {w['w']}")
