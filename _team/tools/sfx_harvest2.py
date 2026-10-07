"""Sound Harvester v2. One reference video -> SFX events that (a) are NOT on the music beat grid and/or (b) land on a
visual event (cut / text pop / zoom), each matched by CLAP audio-audio similarity to our royalty-free library.
Reuses demucs no_vocals from v1 if present. Usage: python sfx_harvest2.py <video> <out_dir>"""
import sys, os, json, subprocess, glob, re
import numpy as np, librosa, soundfile as sf, torch
from transformers import ClapModel, ClapProcessor

LIB = os.path.join(os.path.dirname(__file__), "..", "..", "_engine", "reel", "public", "sfx")
SR = 48000

def visual_events(video):
    """per-frame change score (0..1) -> times of visual events"""
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", video, "-vf", "scale=160:-1,select='gte(scene,0)',metadata=print:key=lavfi.scene_score",
                        "-an", "-f", "null", "-"], capture_output=True, text=True)
    t, out = None, []
    for line in r.stderr.splitlines():
        m = re.search(r"pts_time:([0-9.]+)", line)
        if m: t = float(m.group(1))
        m = re.search(r"scene_score=([0-9.]+)", line)
        if m and t is not None: out.append((t, float(m.group(1))))
    if not out: return np.array([])
    s = np.array([v for _, v in out]); ts = np.array([x for x, _ in out])
    thr = max(0.02, np.percentile(s, 90))
    return ts[s >= thr]

def embed_audio(model, proc, clips):
    embs = []
    for i in range(0, len(clips), 16):
        inp = proc(audio=clips[i:i + 16], sampling_rate=SR, return_tensors="pt", padding=True)
        with torch.no_grad():
            e = model.get_audio_features(**inp)
        e = getattr(e, "pooler_output", e)
        embs.append(torch.nn.functional.normalize(e, dim=-1).numpy())
    return np.concatenate(embs)

def library(model, proc):
    names, clips = [], []
    for f in sorted(glob.glob(os.path.join(LIB, "*.mp3"))):
        y, _ = librosa.load(f, sr=SR, mono=True, duration=1.2)
        names.append(os.path.splitext(os.path.basename(f))[0]); clips.append(y)
    return names, embed_audio(model, proc, clips)

def run(video, out_dir, model, proc, lib_names, lib_emb):
    vid = os.path.basename(video)[:3]
    od = os.path.join(out_dir, vid); os.makedirs(od, exist_ok=True)
    nv = os.path.join(od, "htdemucs", vid, "no_vocals.wav")
    if not os.path.exists(nv):
        wav = os.path.join(od, f"{vid}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "2", "-ar", "44100", wav], check=True)
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-o", od, wav], check=True)
    y, _ = librosa.load(nv, sr=SR, mono=True)
    tempo, beats = librosa.beat.beat_track(y=y, sr=SR, units="time")
    tempo = float(np.atleast_1d(tempo)[0])
    env = librosa.onset.onset_strength(y=y, sr=SR)
    on = librosa.onset.onset_detect(onset_envelope=env, sr=SR, units="time", delta=0.2, wait=6)
    vis = visual_events(video)
    near = lambda arr, t, w: arr.size and np.min(np.abs(arr - t)) <= w
    cands = []
    for t in on:
        on_beat = near(beats, t, 0.05)
        on_vis = near(vis, t, 0.12)
        if on_beat and not on_vis: continue           # music hit only
        a, b = max(0, int((t - 0.05) * SR)), min(len(y), int((t + 1.0) * SR))
        if b - a < SR * 0.2: continue
        cands.append((float(t), y[a:b], bool(on_vis), bool(on_beat)))
    events = []
    if cands:
        emb = embed_audio(model, proc, [c[1] for c in cands])
        sim = emb @ lib_emb.T
        for (t, seg, on_vis, on_beat), s in zip(cands, sim):
            k = int(s.argmax())
            db = float(20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9))
            name = f"{vid}_{t:06.2f}.wav"
            sf.write(os.path.join(od, name), seg, SR)
            events.append({"t": round(t, 2), "match": lib_names[k], "sim": round(float(s[k]), 2),
                           "on_visual": on_vis, "on_beat": on_beat, "rms_db": round(db, 1), "clip": name})
    for old in glob.glob(os.path.join(od, f"{vid}_*_*.wav")): os.remove(old)   # v1 clips
    res = {"video": vid, "tempo": round(tempo, 1), "visual_events": len(vis), "sfx": events}
    json.dump(res, open(os.path.join(od, "sfx_events_v2.json"), "w"), indent=1)
    return res

if __name__ == "__main__":
    model = ClapModel.from_pretrained("laion/clap-htsat-unfused"); proc = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
    names, lemb = library(model, proc)
    r = run(sys.argv[1], sys.argv[2], model, proc, names, lemb)
    vis = sum(e["on_visual"] for e in r["sfx"])
    print(f"{r['video']} tempo {r['tempo']} sfx {len(r['sfx'])} (on visual {vis})", flush=True)
