# E16 — Walking talking-head, real-estate story (720×1280, 30fps, 37.1s)
Format: **Talking-head, walking/standing, multi-location, text-behind-person.** Evidence: hook_0-3s_10fps.jpg, sheet_2fps_01.jpg.

## Hook 0–3s (10fps)
- 0.0s: no text, subject walking toward camera on a balcony. Movement itself is the hook.
- 0.1–0.5s: **"LAST YEAR"** builds letter-by-letter (fade+scale), lilac #B9A0E6-ish, heavy grotesk, ~7% frame width per letter group, placed at head height **BEHIND the head** (head occludes letters from 2.0s → person matte confirmed).
- 0.7s: small white sans "I started" pops under it at chin level (~2% height) = big/small pairing.
- 1.8s: object (magazine cover photo) pops onto her **open palm**, tracks the hand → hand-anchored prop.
- 2.4s: hard cut to new location on the word change; new pair "Quarterly / recap" white, two lines, behind head.
- Changes in first 3s: 5 (title build, subtitle, prop, cut, new title) → ~1 change / 0.6s.

## Rhythm
- ~12 locations in 37s → location cut every ~3s, always on a sentence boundary. (Scene detector at 0.3 missed same-palette cuts: re-run at 0.15.)
- Subject always centred, full or ¾ body, walking or gesturing — never static.

## Captions
- One keyword at a time, word-synced. Key word large and coloured (lilac "LAST YEAR", purple "grateful", orange "story", gold "$10 MILLION"); connectors tiny white.
- Position: head/upper-chest zone, mostly behind the head. Kept inside the 4:5 centre.
- Colour changes per section (lilac → white → purple → orange), not one fixed colour.

## Graphics
- Photo cards: polaroid/magazine frames pop beside or onto the hand (0.3s scale-in), arranged in grids/fans (e.g. 6 family photos fanned behind her at 7–9s, 5-photo collage at 31s).
- UI card: map app card (North Carolina) floats top-centre at 24s = "phone UI pop-up" element.
- Big number moment: "$10 MILLION" gold behind body + "closed over" — the money moment gets the biggest type.
- Ending: no graphics, close-up, soft words only → emotional calm outro.

## Techniques needed in our engine
1. Person matte per frame (Robust Video Matting) → text layer between bg and person. **Priority.**
2. Hand tracking (mediapipe hands) → prop anchored to palm.
3. Letter-build title animation; per-section accent colour.
4. Photo-card pop/fan/grid layouts.
5. Location cuts on sentence boundaries.

## Open (needs audio pass)
SFX timing per text pop, music BPM/ducking → pending librosa/CLAP pass.
