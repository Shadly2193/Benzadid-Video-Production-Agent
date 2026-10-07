"""Analyse every track in 'Usable BGMs From SUNO/' -> _team/music_library/bgm_index.json + bgm_index.md + energy sheet.
Per track: duration, BPM, key, beat grid, energy curve (1 s), sections (intro/build/full/outro), drop times, and
best start points for 15/30/45/60 s cuts (cut starts on a beat; prefers a window that contains a drop ~2-6 s in)."""
import os, json, glob, numpy as np, librosa, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SRC = os.path.join(ROOT, "Usable BGMs From SUNO"); OUT = os.path.join(ROOT, "_team", "music_library")
KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
maj = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mnr = np.array([6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
res = []; files = sorted(glob.glob(os.path.join(SRC, "*.mp3")) + glob.glob(os.path.join(SRC, "*.wav")))
fig, axs = plt.subplots(len(files), 1, figsize=(16, 2.2 * len(files)))
for ax, p in zip(np.atleast_1d(axs), files):
    y, sr = librosa.load(p, sr=22050, mono=True); dur = len(y) / sr
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr); bt = librosa.frames_to_time(beats, sr=sr)
    ch = librosa.feature.chroma_cqt(y=librosa.effects.harmonic(y), sr=sr).mean(1)
    key = max([(np.corrcoef(np.roll(maj,k),ch)[0,1], KEYS[k]+' major') for k in range(12)] + [(np.corrcoef(np.roll(mnr,k),ch)[0,1], KEYS[k]+' minor') for k in range(12)])[1]
    hop = sr  # 1 s energy
    e = np.array([np.sqrt(np.mean(y[i:i+hop]**2)) for i in range(0, len(y)-hop, hop)]); edb = 20*np.log10(e+1e-9); edb -= edb.max()
    on = librosa.onset.onset_strength(y=y, sr=sr); dens = np.array([on[int(i*sr/512):int((i+1)*sr/512)].mean() for i in range(len(e))]); dens /= dens.max()+1e-9
    level = np.clip((edb + 24) / 24, 0, 1) * 0.6 + dens * 0.4          # 0..1 "intensity"
    sm = np.convolve(level, np.ones(4)/4, 'same')
    lab = np.where(sm > 0.72, 'full', np.where(sm > 0.5, 'build', 'calm'))
    secs = []; s0 = 0
    for i in range(1, len(lab)+1):
        if i == len(lab) or lab[i] != lab[s0]:
            if i - s0 >= 3 or not secs: secs.append({"from": s0, "to": i, "type": str(lab[s0])})
            else: secs[-1]["to"] = i
            s0 = i
    drops = [int(i) for i in range(3, len(level)) if level[i] - level[i-3:i].mean() > 0.18]
    dd = [];  [dd.append(d) for d in drops if not dd or d - dd[-1] > 6]
    def best(L):
        cands = []
        for d in dd:
            for lead in (2, 3, 4, 6):
                s = d - lead
                if s >= 0 and s + L <= dur: cands.append((float(np.mean(level[s:s+L])) + 0.15, s, d))
        for s in range(0, int(dur - L), 2): cands.append((float(np.mean(level[s:s+L])), s, None))
        sc, s, d = max(cands)
        sb = float(bt[np.argmin(np.abs(bt - s))]) if len(bt) else float(s)
        return {"start": round(sb, 2), "end": round(sb + L, 2), "drop_at_video_s": (None if d is None else round(d - sb, 1)), "avg_intensity": round(sc - (0.15 if d is not None else 0), 2)}
    r = {"file": os.path.basename(p), "duration_s": round(dur, 1), "bpm": int(round(float(np.atleast_1d(tempo)[0]))), "key": key,
         "sections": secs, "drops_s": dd, "intensity_per_s": [round(float(v), 2) for v in level],
         "cuts": {str(L): best(L) for L in (15, 30, 45, 60) if L < dur}}
    res.append(r)
    ax.plot(level, color='#FF6A00'); ax.set_ylim(0, 1.05); ax.set_xlim(0, len(level))
    for d in dd: ax.axvline(d, color='red', ls='--', lw=1)
    for s in secs: ax.axvspan(s["from"], s["to"], color={'calm':'#cfe3ff','build':'#ffe7b0','full':'#ffc1b0'}[s["type"]], alpha=.35)
    ax.set_title(f'{r["file"]} — {r["duration_s"]}s, {r["bpm"]} BPM, {key}  (blue calm / yellow build / red full, dashed = drop)', fontsize=10)
plt.tight_layout(); plt.savefig(os.path.join(OUT, "bgm_energy_sheet.png"), dpi=60)
json.dump(res, open(os.path.join(OUT, "bgm_index.json"), "w"), indent=1)
md = ["# BGM index (Usable BGMs From SUNO): built by _team/tools/bgm_analyze.py; re-run after adding tracks", "",
      "| # | file | dur | BPM | key | shape (sections) | drops (s) | best 30 s cut | best 60 s cut |", "|---|---|---|---|---|---|---|---|---|"]
for i, r in enumerate(res, 1):
    shape = " → ".join(f'{s["type"]} {s["from"]}-{s["to"]}' for s in r["sections"])
    c30 = r["cuts"].get("30", {}); c60 = r["cuts"].get("60", {})
    md.append(f'| {i} | {r["file"]} | {r["duration_s"]} | {r["bpm"]} | {r["key"]} | {shape} | {r["drops_s"]} | {c30.get("start")}–{c30.get("end")} (drop at {c30.get("drop_at_video_s")}) | {c60.get("start")}–{c60.get("end")} |')
open(os.path.join(OUT, "bgm_index.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
for r in res: print(r["file"], r["duration_s"], r["bpm"], r["key"], [ (s["type"], s["from"], s["to"]) for s in r["sections"]], r["drops_s"], r["cuts"].get("30"))
