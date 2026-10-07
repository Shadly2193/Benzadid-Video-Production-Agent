"""no-vocals spectrogram sheets (6s rows, 0.25s grid) for eyeballing SFX: pops = short vertical lines, whoosh/riser = diagonal sweeps, boom = low broadband burst"""
import sys, os, glob, subprocess, librosa, librosa.display, numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
ref, out = sys.argv[1], sys.argv[2]
for v in sorted(glob.glob(os.path.join(ref, "E*.mp4"))):
    vid = os.path.basename(v)[:3]; od = os.path.join(out, vid); os.makedirs(od, exist_ok=True)
    nv = os.path.join(od, "htdemucs", vid, "no_vocals.wav")
    if not os.path.exists(nv):
        wav = os.path.join(od, f"{vid}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v, "-vn", "-ac", "2", "-ar", "44100", wav], check=True)
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-o", od, wav], check=True)
    y, sr = librosa.load(nv, sr=22050, mono=True)
    S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=1024, hop_length=128)), ref=np.max)
    dur = len(y) / sr; rows = int(np.ceil(dur / 6))
    for p in range(0, rows, 4):
        n = min(4, rows - p); fig, ax = plt.subplots(n, 1, figsize=(18, 3.4 * n), squeeze=False)
        for i in range(n):
            a = (p + i) * 6; b = min(dur, a + 6)
            librosa.display.specshow(S[:, int(a * sr / 128):int(b * sr / 128)], sr=sr, hop_length=128, y_axis="log", x_axis="time", ax=ax[i][0])
            ax[i][0].set_xticks(np.arange(0, b - a + .01, 0.25)); ax[i][0].set_title(f"{vid} {a}-{b:.0f}s"); ax[i][0].grid(axis="x", alpha=.3)
        plt.tight_layout(); plt.savefig(os.path.join(od, f"spec_{p // 4:02d}.png"), dpi=60); plt.close()
    print(vid, "ok", flush=True)
