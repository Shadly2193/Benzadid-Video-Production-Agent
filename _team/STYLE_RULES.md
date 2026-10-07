# STYLE_RULES — the team's learned rules (grows with every piece of Shadly feedback)
Every rule: source = measured reference (Bible) or Shadly feedback with date. Agents must obey; QA checks them.

## Approved menu (Shadly, 2026-10-06)
- Formats: F1–F9 all approved. Director picks per raw folder.
- Hooks: H1, H2, H4, H5, H6, H7, H8, H9 approved. **H3 (money/number counter opener) not picked** → only use counters inside the video, not as the opener, unless Shadly asks.
- Captions: C1, C2, C3, C4, C6, C7 approved. **C5 (minimal small white) not picked** → never default to plain small captions.
- Transitions: T2–T7 approved (+ punch-in T1 always).

## Sound (Shadly, 2026-10-06)
- The 8 sample sounds are a ladder, **not the library**. The Sound Designer must choose the SFX that best *explains* each visual and each spoken idea: money → coins/cash; typing on screen → keys; website click → UI click; heartbeat topic → heartbeat; surgery → metal instrument; phone notification → notification; page scroll → soft scroll; etc. Literal, meaning-matched sound first, generic whoosh/pop only for motion.
- Library must keep growing by category (UI, money, medical, nature/air, impacts, transitions, paper, tech, human). Every new reference → Sound Harvester → add royalty-free look-alikes.
- **SOUND_MAP.md / sound_map.json** (575 scenarios × 4 format profiles, 18 categories incl. captions, transitions, camera, UI, money, medical, dental, BD context) is the Sound Designer's lookup table. Extend it whenever a new case appears.
- Measured rules (SFX_CATALOGUE.md): SFX on visual events not on beat; tick < pop < whoosh < riser < impact; ≤1 impact per 8–10s; soft low-passed whooshes (Shadly 2026-10-05: "whoosh too strong → wind").

## SFX must be HEARD (Shadly, 2026-10-06 — TEST-001 v1 had inaudible SFX: "কোনো SFX ই শুনলাম না")
- SFX priority is top. Every visual event gets an audible, meaning-matched sound. Peak-normalise each SFX file, then place it at −8 to −14 dB below the voice PEAK (impacts −6 to −8; UI ticks −12 to −16). Never stack attenuation (file gain + bus + loudnorm) without measuring.
- Sound designer and QA must MEASURE: the SFX-only stem's short-term loudness at each cue must be within 18 dB of the voice; a check that only says "SFX below voice" is not enough. QA listens by numbers: if any 5-s window with ≥2 visual events has no SFX above −30 LUFS-S → FAIL.
- A failed or missing QA run = nothing is delivered as final.

## Colour (Shadly, 2026-10-06)
- Accent colour chosen per video (subject-driven), one accent, ≤1 accent word per line.
- **Grading is a standard, not a fixed LUT and not heavy "cinematic":** natural skin, clean whites, gentle contrast, like the references (E02, E05, E11, E16 measured). Adapt per footage (exposure, white balance, HDR→SDR), never orange/teal-crush. Grade must be measured against reference stats (see GRADE_STANDARD.md, to be built).
- **Shadly 2026-10-06 (grade test): preferred the natural, warmer ungraded look over the neutralised one.** → Keep camera warmth; only fix exposure/levels gently and correct white balance when the cast is strong. Warm is fine; *orange* (project 001) is not.
- Never: orange cast (project 001 failure), purple (project 003 rule), over-saturation.

## Text behind person (Shadly, 2026-10-06, test v1→v2)
- Tall condensed font (Anton, vertical stretch ~1.35), ~92% frame width, placed slightly ABOVE the head: most of the word readable, only the lower part hidden by hair/head so the word can be guessed.
- v2 approved by Shadly 2026-10-06. Optional: soft drop shadow on the text for separation (Shadly suggestion) — use when background is busy/bright.
- Requires headroom in the shot: the word must still sit inside the 4:5 safe zone → Recording Coach asks for camera framing with the head at ~35–40% height.

## Captions — one language per moment (Shadly, 2026-10-06)
- Never show the same word twice in two languages at once (e.g. "DESIGN" + "ডিজাইন"). One clear caption per moment; default = the language spoken.

## Content handling (Shadly, 2026-10-06 — corrected: "blurry", not "bloody")
- Shadly dislikes BLURRED patches as a fix. Never blur faces/areas to hide things; crop/reframe/zoom so unwanted content is out of frame, or skip that part.
- Clinical/operation images from client websites may be shown.

## Carried from projects 001–003
- HDR iPhone footage → always tonemap (zscale+hable).
- Subtitles never overlap the hero visual; clear all text on shot change; finish typing ≥0.35s before cut.
- Keep everything inside 4:5 safe zone (Facebook crop).
- Never cut a word tail: normalise before silence detection, verify last word end.
- Audio mixed outside the renderer (ffmpeg bus, ducking, −14 LUFS); ending/clip dialogue lifted, music ducked.
- Versions never overwritten (v1, v2…).

## Background music: the SUNO library (Shadly, 2026-10-06)
- BGM comes **only** from `Usable BGMs From SUNO/`. Before every job, run `_team/tools/bgm_analyze.py` (it only re-reads that folder). Then read `_team/music_library/bgm_index.md` and `bgm_energy_sheet.png`: BPM, key, and the calm → build → full shape of each track. Every track starts slow and grows. **Listen to the analysis before choosing; never just start from 0:00.**
- **Rotation:** use the next track in `_team/music_library/bgm_rotation_log.md`. Never use the same track in two videos in a row. After the last track, wrap back to the first. When a track repeats, use a **different section** from the one used last time (the log records which seconds were used).
- `Futuristic AI Explainer (1).mp3` is a byte-identical duplicate of `Futuristic AI Explainer.mp3`. Treat them as one track.
- **Cut only the part you need.** Choose the window from the track's shape so that the build or drop lands on the video's key moment: the hook payoff, the "solution" line, or the reveal. `cuts` in `bgm_index.json` gives candidates. Start the cut on a beat. Use a short fade-in (≤0.3 s) unless it starts on a drop, and a 0.5–1.0 s fade-out at the end. Cuts in the picture may follow the music's beat grid.
- **Music follows the story:** stop the music dead for 0.4–1.5 s on a punchline or question (as in E02/E06/E09/E16), then bring it back on a hit.
- **Level:** music + SFX bed sits **8–10 dB under the voice** during speech, measured from stems. 22 dB under (v2) is a FAIL.

## Lessons from TRIAL 004 (Shadly, 2026-10-06)
- **Voice:** never time-stretch (no rubberband or playbackRate ≠ 1) and never heavy-denoise (no afftdn on a clean recording). Those caused the "echo". Use a light expander, EQ and compressor only.
- **SFX:** prefer sounds synthesised for the exact event (length, pitch, sweep) or high-quality library sounds. Fewer, bigger, layered hits beat many thin ticks. Every icon or element entrance has a sound. Silence before a hit makes it land.
- **Captions sit in the middle of the frame** (chest level, y ≈ 900–1150 on 1920), as in the references. Graphics move around the caption, not the other way.
- **A new project uses only its own material.** Never bring a client's site, name or brand from another project. Invented visuals must be generic.

## Lessons from TRIAL-004 agent run (Director, 2026-10-06)
- **No blur in transitions.** No blur, defocus or motion-blur filters, ever. Whips are hard pushes or slides; a punch is a scale only; a flash is at most 1 frame of ≤40% white. QA checks every transition at the full 30 fps.
- **Gain and fix requests name the stem.** Say "voice" or "SFX" or "music" for every level change. If a request is ambiguous, the owner asks a Q- on BOARD before acting.
- **Generic graphics must look premium, not like grey wireframes.** Give UI mockups depth (soft shadows, slight 3D tilt or parallax), use the brand palette (#0a0603 / #FF6A00 / cream) instead of flat grey, and add motion detail: elements settle with overshoot, small secondary motion, and real-looking placeholder content (icons, avatars, star rows). Each graphic shot needs one "hero" moment.
- **Risers are pitched sweeps.** Use a rising tone or filter sweep that clearly climbs into the hit, not a broad noise swell. Hits are layered: transient + body + sub.

## General lessons from JOB-005 (Shadly, 2026-10-07): apply to all projects
- Project-specific creative directions live ONLY in that job's `_job/V*_DIRECTIVE.md` and are never copied into other projects. Every video gets its own unique ideas and story.
- Grade options must be approved as stills BEFORE any full render. Never clip the face, never wash or haze the image.
- Never cover the face with graphics. When a graphic must be large, dim and blur the subject and focus-zoom in on the graphic instead.
- No visual repeats inside a video. Never nest one graphic inside another.
- Strip CapCut (or any app) end cards and watermarks from raw files.
- Speed changes keep pitch (rubberband), and every cue time is recomputed exactly.

## SYNC RULE: no estimated cue times (Shadly, 2026-10-07, JOB-005 v2: two windows out of sync)
- Root cause: Bangla ASR (Whisper) dropped words in raw 32.8–45.6 s, so the Director and agents placed captions and elements by energy-based ESTIMATES (±1 s). Speeding up 1.12× carried those errors over. Nobody checked sync per word before delivery.
- Rules:
  1. Every caption and element must be anchored to a real word onset (target ≤0.1 s before the word). Never ship a time marked EST.
  2. If ASR has a gap longer than 2 s, re-transcribe that window as a short clip with the script text as initial_prompt (beam 5). Cross-check with onset energy and silence gaps. Fall back to a script-forced alignment.
  3. Timing comes only from the FINAL audio (after any speed change). Re-derive it there, don't just divide the old estimates.
  4. QA must produce sync_report.json (word onset vs element-in, |Δ| ≤0.12 s for every item). Any EST or failed item = FAIL, not a "risk note".

## Case studies (read before every job)
- `_team/case_studies/CS-*.md`: Shadly's corrections, the root causes and the prevention rules. CS-005 (2026-10-07): grade/HLG, face rule, sync, blank web captures, CapCut, calm SFX.
- Inserted media (web captures, screen recordings): trim the blank load phase, and QA every frame for blank cards.
- When fixing a bug, fix all instances of that kind of bug.
