# MUSIC_GUIDE: what music the references use (measured 2026-10-06)
Source: Demucs no-vocal stems of E01–E16, measured with librosa. The raw numbers are in `music_library/music_stats.json` and the spectrogram sheet is `music_library/reference_music_sheet.png`.

## What every reference has in common (rules)
1. **Bass-heavy, empty mids.** In 12 of 16 references, more than 75% of the music energy sits below 250 Hz (sub/808/bass), and almost nothing sits at 250 Hz–2 kHz. That empty mid range leaves room for the voice. → Choose or generate music with sub bass and sparse top melody, and **no busy chords or lead in the mid range**.
2. **Level under the voice:** median 8–10 dB below the voice (range 2–19). Our v2 used 22, which was too quiet. TRIAL 004 used 8, which was right.
3. **Music follows the story:**
   - In E02, E06, E09 and E16 the music **stops dead** for 0.5–5 s on key lines, then comes back on a hit.
   - E16 drops at 6 s.
   - E05 starts with a sub swell.

   Music is a story tool, not wallpaper.
4. **Tempo.** Talking-head reels sit at 90–105 BPM. Fast promos and explainers sit at 117–129 BPM. The only outlier is E04 at 185.
5. **Key is mostly minor** (problem/tension). Major keys appear in solution or luxury pieces.

## Families → which video uses which
| Family | References | BPM | Feel | Use for |
|---|---|---|---|---|
| **A. Stop-start 808** | E02, E06, E09, E12, E13, E16 | 90–105 | dark minimal trap/lo-fi, 808 sub, small pluck or bell, drops out on punchlines | talking-head hooks, problem→solution reels (our main format) |
| **B. Cinematic tech pulse** | E03, E05, E10, E14 | 115–120 | sub drones, pulses, risers, impacts, airy pad | faceless explainers, motion graphics, AI/tech topics |
| **C. Driving promo** | E01, E07, E11 | 117–130 | punchy drums, groove, confident | case studies, portfolio/agency promos, results |
| **D. Ambient luxury bed** | E04, E08 | free | warm continuous pad, no drums | calm brand story, testimonials, premium feel |

## Prompts (Suno / ElevenLabs Music). Always add: instrumental, no vocals
⚠️ On the **free plans of Suno and ElevenLabs, commercial use is not allowed**. Use these prompts only on a paid plan. Until then, use free commercial-safe sources (Pixabay Music, YouTube Audio Library) to find music that matches the same description, or the code-made music (TRIAL 004 mix.py).

**A1: Stop-start 808 (main hook music)**
`dark minimal trap beat, 96 BPM, G minor, deep 808 sub bass, soft plucked bell melody, sparse crisp hi-hats, lots of empty space, no mid-range pads, tension then release, clean modern social media reel background, instrumental, no vocals`

**A2: Problem → solution switch** (tension → drop to bright)
`instrumental track that starts tense and minimal in A minor with a ticking pulse and low sub drone for 8 seconds, then a riser and a punchy drop into a bright confident C major groove with 808 bass and claps, 100 BPM, modern reel background, no vocals`

**B1: Cinematic tech pulse**
`cinematic tech background, 118 BPM, E minor, pulsing sub bass, airy synth pad, subtle glitch textures, risers and deep impacts every 4 bars, futuristic AI explainer, minimal melody, instrumental, no vocals`

**B2: Motion-graphic explainer bed**
`clean motion graphics underscore, 116 BPM, F minor, soft sub drone, light percussion ticks, gentle arpeggiated synth, spacious, builds slowly, documentary explainer, instrumental, no vocals`

**C1: Driving case-study promo**
`confident upbeat agency promo beat, 124 BPM, C major, punchy kick and clap, groovy bass line, short bright synth stabs, energetic but not busy, success story reel, instrumental, no vocals`

**C2: Results / before-after reveal**
`modern hip-hop groove, 102 BPM, D# major, warm 808, crisp snare, short vocal-chop-free synth hook, triumphant feel, room for voice-over, instrumental, no vocals`

**D1: Warm premium bed**
`warm ambient piano and soft pad, 70 BPM, E major, calm premium healthcare brand, no drums, gentle and trustworthy, background for voice-over, instrumental, no vocals`

**D2: Calm testimonial**
`soft acoustic guitar and light ambient pad, 80 BPM, G major, hopeful, gentle, minimal percussion, patient testimonial background, instrumental, no vocals`

## How to store generated or downloaded tracks
Use `_team/music_library/<family>/<name>__<bpm>bpm__<key>__<source>.mp3`. Example: `A/stopstart_01__96bpm__Gm__pixabay.mp3`.
For each track, write one line in `music_library/index.md`: family, BPM, key, mood, the source and its licence (commercial OK? yes/no), and where its drops and stops fall.
The Sound Designer picks the family from the video format, then edits cuts to the drops and mutes music on punchlines (rule 3).
