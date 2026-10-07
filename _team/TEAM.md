# Benzadid Agent Team — how the team works
Root of everything: `Video Editing/`. Agents: `.claude/agents/*.md`. Skills (entry points): `.claude/skills/*/SKILL.md`.

## Entry points (what Shadly types)
| Command | Who runs it | What happens |
|---|---|---|
| `/reel-edit <folder>` | Director (main session) | Raw folder → publish-ready reel, with 2 approval gates |
| `/content-plan` | Assistant (main session) | Today's/this week's content: idea → script → recording brief |
| `/analyze-reference <file>` | Director | New reference → Bible entry E17+, SFX harvest, Pattern Library update |
| `/checkin` | Assistant (scheduled 11:00 & 15:00 BDT) | "Can you record today?" flow |

## Teams
**Leader:** Assistant (`/content-plan`, `/checkin`) — personal assistant + team lead. Owns the calendar and pushes (max 2–3 asks/day).
**Content:** content-strategist · content-researcher · scriptwriter · recording-coach · visual-designer · publisher · content-analyst
**Production:** Director (`/reel-edit`) → reel-analyst (Ingest & Analyst) → reel-editor (Story Editor) → performance-judge → broll-researcher → colorist → motion-designer (plan) → caption-specialist → sound-designer (plan) → GATE 1 → motion build → sound mix → finisher-qa
Full responsibilities (189 tasks, one owner each): `team_roles.html` / `team_roles.json`. Communication: `COMMS.md` (GOAL / BOARD / DECISIONS).
Claude Code subagents cannot call each other: the main session (Director / Assistant) runs them in order and passes files.

## The JOB folder contract (every reel)
`<raw folder>/_job/` — every agent reads the previous files and writes only its own:
| File | Written by | Content |
|---|---|---|
| `00_brief.json` | Director | brand, language, target length, platform, Shadly's notes, assets list, chosen format F1–F9 |
| `01_analysis.json` | reel-analyst | per file: duration, fps, HDR?, rotation, loudness, face present, speakers, scene list |
| `02_transcript.json` | reel-editor | word timestamps (Whisper large-v3), language |
| `03_edl.json` | reel-editor | keep-ranges (cuts), duplicates removed, silences trimmed, story order, target 30–60s |
| `04_takes.json` | performance-judge | per sentence: best take + reason (eyes, energy, fluency, face score) |
| `05_visual_plan.json` | motion-designer (+broll-researcher) | per sentence: shot/format, hook pattern, caption style, B-roll/asset, camera move, transition |
| `GOAL.md` · `BOARD.md` · `DECISIONS.md` | Director / everyone / Director | see COMMS.md |
| `05c_captions.json` + `captions.srt` | caption-specialist | every caption unit: words, times, zone, style, font |
| `05d_grade.json` + previews | colorist | per-clip filter chain, before/after stats |
| `05b_broll/` | broll-researcher | screenshots, screen recordings, sources.md (URL + permission note) |
| `06_sound_plan.json` | sound-designer | music choice, every SFX: time, SOUND_MAP id, library file, level, reason |
| `07_storyboard.jpg` + `07_storyboard.md` | Director | GATE 1 — shown to Shadly before any render |
| `08_render/` | motion-designer / finisher | Remotion or HyperFrames project + picture render (muted) |
| `09_mix.wav` | sound-designer → finisher | ffmpeg mix, −14 LUFS |
| `10_qa_report.md` | finisher-qa | scorecard (all checks pass/fail) + 4fps frame sheet |
| Output | finisher-qa | `Edited Videos/<project>/<name> - vN.mp4` + phone copy; never overwrite |

## Knowledge every agent must read first
`STYLE_RULES.md` (binding) · `01_REFERENCE_BIBLE/PATTERN_LIBRARY.md` · `SOUND_MAP.md` · `GRADE_STANDARD.md` · `BRAND.md` · relevant `E*_bible.md`.

## Gates (never skip)
- GATE 1 storyboard + visual/sound plan → Shadly "ok" before render.
- GATE 2 v1 delivered → Shadly timestamped feedback → Director writes every lesson into STYLE_RULES.md → vN+1.

## Tools (all local, free)
`_engine/venv` (Python: whisper, mediapipe, rembg, librosa, CLAP, demucs, RVM) · `_engine/reel` (Remotion) · `_engine/hyperframes/hf.sh` · ffmpeg · `_team/tools/`: grade_auto.py, grade_measure.py, text_behind.py, sfx_search.py, sfx_fetch_mixkit.py, sfx_harvest2.py, spec_sheets.py, build_sound_map.py.
