import json, sys
from faster_whisper import WhisperModel
from scipy.io import wavfile
sr_, a_ = wavfile.read(sys.argv[1]); src = (a_.astype("float32")/32768.0)
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(src, language="bn", word_timestamps=True, vad_filter=False, condition_on_previous_text=False, initial_prompt="ডাক্তার আরিফ, ভাস্কুলার সার্জন, ওয়েবসাইট, কেস স্টাডি, ব্যাকএন্ড, ব্লগ, চেম্বার, লোকেশন, সিম্পটম", beam_size=5)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end} for w in s.words]})
    print(f"{s.start:6.2f}-{s.end:6.2f} {s.text}", flush=True)
json.dump(out, open("work/transcript2.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
