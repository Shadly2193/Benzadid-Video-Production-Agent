"""Search the SFX library by meaning (CLAP text->audio + title match).
Build index once:  python sfx_search.py --build
Search:            python sfx_search.py "coins falling" [-n 5] [--group money]
Library: _team/sfx_library (index.json from sfx_fetch_mixkit.py). Index: sfx_library/clap_index.npz"""
import os, sys, json, numpy as np

LIB = os.path.join(os.path.dirname(__file__), "..", "sfx_library")
IDX = os.path.join(LIB, "clap_index.npz")
_m = None

def model():
    global _m
    if _m is None:
        from transformers import ClapModel, ClapProcessor
        _m = (ClapModel.from_pretrained("laion/clap-htsat-unfused").eval(), ClapProcessor.from_pretrained("laion/clap-htsat-unfused"))
    return _m

def _norm(e):
    e = getattr(e, "pooler_output", e)
    return (e / e.norm(dim=-1, keepdim=True)).detach().numpy()

def build():
    import librosa, torch, subprocess
    m, p = model(); meta = json.load(open(os.path.join(LIB, "index.json"), encoding="utf-8"))
    ids, files, embs, durs = [], [], [], []
    items = list(meta.items())
    for i in range(0, len(items), 16):
        batch, ok = [], []
        for sid, it in items[i:i + 16]:
            try:
                y, _ = librosa.load(os.path.join(LIB, it["file"]), sr=48000, mono=True, duration=4)
                d = librosa.get_duration(path=os.path.join(LIB, it["file"]))
            except Exception:
                continue
            batch.append(y); ok.append((sid, it["file"], d))
        if not batch: continue
        with torch.no_grad():
            e = _norm(m.get_audio_features(**p(audio=batch, sampling_rate=48000, return_tensors="pt", padding=True)))
        for (sid, f, d), v in zip(ok, e):
            ids.append(sid); files.append(f); embs.append(v); durs.append(d)
        print(len(ids), flush=True)
    np.savez(IDX, ids=np.array(ids), files=np.array(files), emb=np.array(embs), dur=np.array(durs))

def search(q, n=5, group=None):
    import torch
    m, p = model(); z = np.load(IDX); meta = json.load(open(os.path.join(LIB, "index.json"), encoding="utf-8"))
    with torch.no_grad():
        t = _norm(m.get_text_features(**p(text=[q], return_tensors="pt", padding=True)))[0]
    sim = z["emb"] @ t
    words = set(q.lower().split())
    for i, sid in enumerate(z["ids"]):                      # title keyword bonus
        if words & set(meta[sid]["title"].lower().split()): sim[i] += 0.08
    order = np.argsort(-sim)
    out = []
    for i in order:
        f = str(z["files"][i])
        if group and not f.startswith(group + "/"): continue
        out.append({"file": f, "title": meta[str(z["ids"][i])]["title"], "score": round(float(sim[i]), 3), "dur": round(float(z["dur"][i]), 2)})
        if len(out) >= n: break
    return out

if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "--build": build(); sys.exit()
    n = int(a[a.index("-n") + 1]) if "-n" in a else 5
    g = a[a.index("--group") + 1] if "--group" in a else None
    for r in search(a[0], n, g): print(r)
