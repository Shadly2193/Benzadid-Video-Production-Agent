"""Sound Harvester: reference video -> separated stems -> SFX event list (time, type, loudness) + reference clips.
Usage: python sfx_harvest.py <video_or_folder> <out_dir>
Clips are for matching only; publish royalty-free look-alikes, never these."""
import sys, os, json, subprocess, glob
import numpy as np, librosa, soundfile as sf, torch
from transformers import ClapModel, ClapProcessor

LABELS = ["whoosh", "swoosh", "wind", "riser", "impact boom", "sub bass drop", "pop", "bubble pop", "click", "mouse click",
          "keyboard typing", "typewriter", "camera shutter", "ding bell", "chime", "glitch digital noise", "cash register",
          "coin", "paper swipe", "page turn", "camera flash", "notification sound", "swipe ui", "tape stop",
          "record scratch", "heartbeat", "applause", "laugh", "music drum beat", "music melody", "speech voice"]
NOT_SFX = {"music drum beat", "music melody", "speech voice"}

def separate(wav, out):
    stem = os.path.join(out, "htdemucs", os.path.splitext(os.path.basename(wav))[0])
    if not os.path.exists(os.path.join(stem, "no_vocals.wav")):
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-o", out, wav], check=True)
    return os.path.join(stem, "no_vocals.wav")

def harvest(video, out_dir, model, proc):
    vid = os.path.basename(video)[:3]
    od = os.path.join(out_dir, vid); os.makedirs(od, exist_ok=True)
    wav = os.path.join(od, f"{vid}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "2", "-ar", "44100", wav], check=True)
    nv = separate(wav, od)
    y, sr = librosa.load(nv, sr=48000, mono=True)
    # transient onsets that stand out from the music bed
    env = librosa.onset.onset_strength(y=y, sr=sr)
    on = librosa.onset.onset_detect(onset_envelope=env, sr=sr, units="time", delta=0.25, wait=8)
    events, clips = [], []
    for t in on:
        a, b = max(0, int((t - 0.05) * sr)), min(len(y), int((t + 1.0) * sr))
        seg = y[a:b]
        if len(seg) < sr * 0.2: continue
        clips.append((t, seg))
    if not clips: return []
    probs = []
    for i in range(0, len(clips), 24):
        inp = proc(text=LABELS, audio=[c[1] for c in clips[i:i + 24]], sampling_rate=48000, return_tensors="pt", padding=True)
        with torch.no_grad():
            probs.append(model(**inp).logits_per_audio.softmax(-1).numpy())
    probs = np.concatenate(probs)
    for (t, seg), p in zip(clips, probs):
        k = int(p.argmax()); lab = LABELS[k]
        if lab in NOT_SFX or p[k] < 0.25: continue
        db = float(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9))
        name = f"{vid}_{t:06.2f}_{lab.replace(' ', '_')}.wav"
        sf.write(os.path.join(od, name), seg, sr)
        events.append({"t": round(float(t), 2), "type": lab, "conf": round(float(p[k]), 2), "rms_db": round(db, 1), "clip": name})
    json.dump(events, open(os.path.join(od, "sfx_events.json"), "w"), indent=1)
    return events

if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    vids = sorted(glob.glob(os.path.join(src, "*.mp4"))) if os.path.isdir(src) else [src]
    model = ClapModel.from_pretrained("laion/clap-htsat-unfused"); proc = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
    summary = {}
    for v in vids:
        ev = harvest(v, out, model, proc)
        summary[os.path.basename(v)[:3]] = {}
        for e in ev: summary[os.path.basename(v)[:3]][e["type"]] = summary[os.path.basename(v)[:3]].get(e["type"], 0) + 1
        print(os.path.basename(v)[:3], len(ev), "sfx", summary[os.path.basename(v)[:3]], flush=True)
    json.dump(summary, open(os.path.join(out, "sfx_summary.json"), "w"), indent=1)
