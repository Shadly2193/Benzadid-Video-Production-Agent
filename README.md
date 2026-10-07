# Benzadid Reel Agents

An AI video-production team that runs inside **Claude Code**. It turns a raw talking-head video into a publish-ready vertical reel: grade, cuts, motion graphics, captions, music, sound effects and QA. Two approval gates keep a human in control.

Built by **Dr. Shadly Benzadid** (Benzadid Intelligence). Private repository: do not redistribute.

## The team
| Step | Agent | Job |
|---|---|---|
| P0 | Director (`/reel-edit`) | runs the team, holds the gates, turns feedback into rules |
| 1 | reel-analyst | ingests and analyses the raw footage |
| 2 | reel-editor | transcript, story edit, EDL |
| 3 | performance-judge | picks the best takes |
| 4 | broll-researcher | logos, proof and B-roll |
| 5 | colorist | HDR→SDR + grade (3 options approved as stills first) |
| 6 | motion-designer | Remotion graphics, focus-zoom, face-safe layout |
| 7 | caption-specialist | phrase captions synced to words |
| 8 | sound-designer | calm meaning-matched SFX, BGM, −14 LUFS mix |
| 9 | finisher-qa | exports + pass/fail scorecard (face, sync, blanks, watermark, loudness) |

The content team (`/content-plan`, `/checkin`) covers strategy, research, scripts, recording briefs, visuals, publishing and analytics.

## Start here
1. Follow **[SETUP.md](SETUP.md)**. Tip: open the folder in Claude Code and say *"read SETUP.md and set this up for me"*.
2. Put raw footage in `Raw Videos/<NNN. topic>/`.
3. Type `/reel-edit "<NNN. topic>"` and answer the Director's questions.

## Key knowledge files
- `_team/STYLE_RULES.md`: learned rules (each one comes from real feedback)
- `_team/case_studies/`: past jobs: corrections, root causes, prevention
- `_team/GRADE_STANDARD.md` + `_team/grade_presets/`: grading
- `_team/SOUND_MAP.md`, `_team/sfx_library/`, `Usable BGMs From SUNO/`: sound
- `_team/01_REFERENCE_BIBLE/`: analysed reference reels and the pattern library

## Notes
- Client names in examples are anonymised (Client-A, Client-B…).
- Music and SFX are shared for use by repo members; check each source's licence before commercial use.
