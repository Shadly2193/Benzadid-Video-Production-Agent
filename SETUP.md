# SETUP: install the Benzadid Reel Agents on a new computer

> **For the AI assistant (Claude Code) reading this:** the user wants this system working on their machine.
> Do every step below in order and verify each one. Ask the user only when the guide says **USER**.
> Windows 10/11 is the tested platform; macOS/Linux commands are given where they differ.

---

## 0. What you need (overview)
| Tool | Version tested | Used for |
|---|---|---|
| **Claude Code** (desktop app or CLI) + a Claude subscription | latest | runs the agents (`.claude/agents`, `.claude/skills`) |
| **Git** | any recent | clone/update the repo |
| **Python** | 3.12.x (64-bit) | transcription, grading tools, audio mix, face/hand tracking |
| **FFmpeg (full build)** | 9.x, with **libplacebo, zscale, rubberband** | grading, HDR→SDR, speed change, mixing, export |
| **Node.js** | 24.x LTS | Remotion (motion graphics renderer) |
| Disk space | ~8 GB free | Python env, AI models, renders |
| RAM | 16 GB recommended | Whisper large-v3 on CPU |

Everything runs on **CPU**. A GPU is optional.

### NOT included in this repo (you must create or download these, ~8 GB total)
They are too large or machine-specific for GitHub. The steps below create every one of them.
| Missing item | Size | Created by |
|---|---|---|
| `_engine/venv/` (Python environment + packages) | ~1.7 GB | Step 2 |
| Whisper **large-v3** model (main transcription) | ~3 GB | Step 3 |
| Whisper **medium** model (fast fallback) | ~1.5 GB | Step 3 |
| rembg `u2net_human_seg` (person cut-out) | ~170 MB | Step 3 |
| RobustVideoMatting (video person matte, via torch.hub) | ~15 MB | Step 3 |
| Demucs `htdemucs` (voice/music separation) | ~80 MB | Step 3 (or downloads on first use) |
| CLAP `laion/clap-htsat-unfused` (sound-effect search) | ~600 MB | Step 3 (or downloads on first use) |
| `_engine/reel/node_modules/` (Remotion) | ~830 MB | Step 4 |
| Remotion headless Chrome | ~150 MB | Step 4 |
| `_engine/reel/public/` (per-job media) | varies | filled by the agents during each job |
| `Raw Videos/`, `Edited Videos/` | — | Step 5 (you create them) |

---

## 1. Install the base tools
**USER:** install Claude Code and sign in (https://claude.com/claude-code). Then open this folder in Claude Code.

### Windows (run in PowerShell)
```
winget install --id Git.Git -e
winget install --id Python.Python.3.12 -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Gyan.FFmpeg -e
```
Close and reopen the terminal, then verify:
```
git --version
python --version        # must be 3.12.x
node --version          # v24.x
ffmpeg -hide_banner -filters | findstr /i "libplacebo zscale rubberband"
```
All three filters (**libplacebo, zscale, rubberband**) must be listed. If any is missing, install the **full** build from https://www.gyan.dev/ffmpeg/builds/ and put its `bin` folder on PATH.

### macOS
`brew install git python@3.12 node ffmpeg`. Check the filters the same way. If libplacebo or rubberband is missing, install `ffmpeg-full` or build from source.

---

## 2. Python environment (inside the repo)
```
cd _engine
python -m venv venv
venv\Scripts\python -m pip install --upgrade pip        # macOS/Linux: venv/bin/python
venv\Scripts\python -m pip install -r ..\requirements.txt
```
Verify:
```
venv\Scripts\python -c "import faster_whisper, mediapipe, cv2, rembg, librosa, torch; print('python ok')"
```

## 3. AI models (download once, ~5 GB)
Run from `_engine`:
```
venv\Scripts\python -c "from faster_whisper import WhisperModel; WhisperModel('large-v3', device='cpu', compute_type='int8')"
venv\Scripts\python -c "from faster_whisper import WhisperModel; WhisperModel('medium', device='cpu', compute_type='int8')"
venv\Scripts\python -c "from rembg import new_session; new_session('u2net_human_seg')"
venv\Scripts\python -c "import torch; torch.hub.set_dir('models/torch/hub'); torch.hub.load('PeterL1n/RobustVideoMatting','mobilenetv3', trust_repo=True)"
venv\Scripts\python -c "from demucs.pretrained import get_model; get_model('htdemucs')"
venv\Scripts\python -c "from transformers import ClapModel, ClapProcessor; ClapModel.from_pretrained('laion/clap-htsat-unfused'); ClapProcessor.from_pretrained('laion/clap-htsat-unfused')"
```
Check: models are cached in `~/.cache/huggingface/hub` (Whisper, CLAP), `~/.u2net` (rembg) and `_engine/models/torch/hub` (RVM).
- Whisper large-v3 handles Bangla and English transcription and word timings.
- rembg / mediapipe handle the person cut-out (text and logos behind the head) and face/hand tracking.
- Demucs and CLAP models download automatically the first time they are used.

## 4. Remotion (motion graphics)
```
cd _engine\reel
npm install
npx remotion browser ensure
```
`_engine/reel/public/` is not in the repo. It holds per-job media and is filled automatically by the agents during a job.

## 5. Folder layout after setup
```
benzadid-reel-agents/
├── .claude/agents/        ← the production + content team (one .md per agent)
├── .claude/skills/        ← entry commands: /reel-edit, /content-plan, /analyze-reference, /checkin
├── _team/                 ← rules, brand, grade presets, SOUND_MAP, case studies, SFX + music library, reference bible
├── _engine/               ← python tools + Remotion project
├── My Expectation videos reference/ , My Own Video References/   ← reference reels
├── Usable BGMs From SUNO/ ← background music
├── videos/                ← sample raw + edited (trial 004)
├── Raw Videos/            ← CREATE: put new raw footage here, one numbered folder per reel
└── Edited Videos/         ← CREATE: finished exports land here
```
Create the two folders: `mkdir "Raw Videos" "Edited Videos"`.

## 6. Smoke test (prove everything works)
1. `ffmpeg -version` and the filter check pass.
2. Python import check passes.
3. Copy `videos/004_raw/RAW 1.MOV` to `Raw Videos/900. Smoke test/`.
4. In Claude Code type: `/reel-edit "900. Smoke test"`. The Director should open `_job/`, write GOAL.md, and stop at **GATE 1** with a storyboard.

## 7. Make it yours (USER)
- Edit `_team/BRAND.md`: your name, title, colours, fonts and logo. The current values are the original author's (Dr. Shadly Benzadid, Benzadid Intelligence).
- Read `_team/STYLE_RULES.md` and `_team/case_studies/` before your first job.
- Grade presets in `_team/grade_presets/` only fit the setup they were made for. A new room or camera needs a new 3-option grade approval.

## Troubleshooting
| Problem | Fix |
|---|---|
| `UnicodeEncodeError` when printing Bangla | set `PYTHONUTF8=1` and `PYTHONIOENCODING=utf-8` |
| Whisper is very slow | close other heavy apps; use `cpu_threads=8`; transcribe short clips |
| iPhone HDR video looks blown out or orange | tonemap HLG with `libplacebo` (bt.2390) or `zscale npl=600 + hable`. See `_team/GRADE_STANDARD.md` |
| A file over 100 MB won't push to GitHub | renders belong in `Edited Videos/` (git-ignored) |
