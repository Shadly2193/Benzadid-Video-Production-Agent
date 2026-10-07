---
name: analyze-reference
description: Add a new reference reel (downloaded from Facebook/Instagram/Pinterest/TikTok) to the Reference Bible — frames, hook, captions, camera, colour, SFX and music — and update the Pattern Library, SOUND_MAP and sound library. Use for "/analyze-reference <file or folder>" or when Shadly drops videos in _team/00_INBOX_REFERENCES.
---
# Analyze reference (Director)
Input: a video file, or every new file in `_team/00_INBOX_REFERENCES/`. Shadly may add a one-line note ("I like the sound", "the start") — weight that part.

## Steps
1. Next id = E17, E18… Copy to `My Expectation videos reference/E<n> - <short description>.mp4` (keep original in inbox → `_done/`).
2. Frames: run the same extraction as `_team/01_REFERENCE_BIBLE/extract.sh` for this file (hook 0–3 s @10 fps sheet, 2 fps sheets, cuts with scene threshold 0.15). LOOK at every sheet.
3. Sound: `_team/tools/spec_sheets.py` (Demucs no-vocals spectrograms) → read them against the frame sheets: list every SFX (time, family, what visual it serves), music BPM/genre, drops.
4. Colour: `_team/tools/grade_measure.py` → stats; compare with GRADE_STANDARD.
5. Write `_team/01_REFERENCE_BIBLE/E<n>/E<n>_bible.md` in the same structure as E01–E16: format, hook 0–3 s (time-stamped), rhythm, captions, graphics, camera/transitions, colour, sound, engine needs, "for Benzadid".
6. Update: PATTERN_LIBRARY.md (new hook/caption/transition ids if new), SFX_CATALOGUE.md, SOUND_MAP (new rows in `_team/tools/sound_map_data.py` → `build_sound_map.py`), sound library gaps (`sfx_fetch_mixkit.py` or a royalty-free look-alike — never publish ripped sounds), the visual menu (`_team/tools/build_menu.py`) if useful.
7. Tell Shadly in Bengali: 5 things this reference teaches, what we can already do, what needs new engine work, and ask which parts he wants as rules.

Copyright: references are for study only; never reuse their footage, music or sounds in our videos.
