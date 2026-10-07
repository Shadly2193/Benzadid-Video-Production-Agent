# SFX Catalogue — measured from E01–E16 (no-vocals spectrograms, `_sfx/E*/spec_*.png`)
Method: Demucs removes voice → spectrogram read at 0.25s grid → events matched to the frame sheets. Auto-labelling (CLAP) was tried and rejected (it called music kicks "heartbeat"); spectrogram reading + frame sync is the reliable method. Times = seconds in the reference.

## 1. The 10 SFX families that actually appear
| # | Family | Spectrogram signature | Used on | Seen in (examples) | Our closest library file / action |
|---|---|---|---|---|---|
| 1 | **Micro tick / click** (10–30 ms) | thin vertical line 1–8 kHz | every keyword caption pop, not every word | E02 0.25/1.0/1.18/2.7/3.1/4.8s; E03 hook 0.25–0.65 (4 ticks); E06 3.5 | `light_tap`, `key_single` → need softer "UI tick" pack |
| 2 | **Bloop / pop** (tonal 300–1000 Hz, short down-chirp) | short curved tone blob | object/card/badge appears; list items 1-2-3 | E01 0.38/0.98/1.1; E06 10.45/10.65/10.85 (dots 1-2-3); E12 0.5–1.3 (each pinned card); E13 15.1 | `pop_bubble`, `bubble_click`, `pop_long` |
| 3 | **Tick train / counter roll** | rapid comb of high ticks 0.5–0.8s | rolling numbers | E11 2.95–3.65 & 4.85–5.6 ("0.5 MILLION", "1,000"); E13 1.3–2.5 ($29→$1,000) | **missing** → add "counter tick loop" |
| 4 | **Soft whoosh / air swell** (0.3–0.8s, rise-fall broadband, mostly <4 kHz) | lens-shaped noise cloud | camera moves, page/scene slides, object fly-ins | E03 1.0/1.75/3.4; E05 0.0–0.3, 4.9; E07 1.9/7.5; E10 2.9/4.5/7.2/9.0/11.6 (every insert change); E13 0.25–0.75, 9.3 | `wind` (our soft one), `air_sweep`, `short_wind_swoosh` |
| 5 | **Fast swish** (vertical broadband 2–8 kHz, <0.15s) | sharp noise stripe | text slam / whip transition | E04 every object entrance (2–3/s); E13 2.1/2.5 | `swoosh_fast`, `whoosh_light_pop` |
| 6 | **Impact / sub boom** (broadband top + 40–80 Hz tail 0.3–1s) | vertical + low "tail" | first face reveal, section start, big claim | E03 4.05 (face cut); E06 1.95 & 4.85; E13 20.8 | `impact_cool`, `impact_deep`, `sub_knock` |
| 7 | **Riser / sweep up** (harmonics rising 0.5–1.5s) | upward fan lines | build into reveal / step change | E06 15.6–17 ; E05 1.1–4.0 sub drone; E13 15.2–15.8 | `riser_trailer` (too long) → need 0.8s riser |
| 8 | **Shimmer / sparkle / ding** (2–8 kHz tonal sparkle) | high dotted line cluster | "magic" moment, success, notification | E06 18.65; E11 6.1; E13 22.1 (1.5 kHz ding) | `ding_happy`, `notify_positive`, `page_chime` |
| 9 | **Glitch / digital stutter** | broken vertical bars | glitch text, pixel transitions | E13 19.2–19.7; E14 pixel dissolves | `glitch_small`, `glitch_text` |
| 10 | **Music stop / drop** (all music removed for 0.5–2s, or beat drop) | full-band gap then return | before the key line or the CTA | E02 20.1s (music cuts, voice alone); E01 ~15s black "breath" scene → 808 drop; E09 1.2–3.1 & 14.8–15.7 gaps | edit action (mix), no file |

## 2. Rules derived
1. **SFX ride visual events, never the beat.** Every SFX above sits on a cut, text slam, object pop or camera move (frame-verified).
2. **Density by format**: talking-head 1 SFX / 1.5–3s (E02, E11); motion graphic 1–3 / s (E04, E12, E13); minimal/premium almost none — music only (E08, E14 mostly pops on scene change).
3. **Hierarchy**: tick (caption) < pop (object) < whoosh (move) < impact (section). Biggest sound = most important visual; impacts ≤ 1 per 8–10s.
4. **Music carries energy**: trap/808 beds in E02, E03, E06, E07, E12 (kick every ~0.5–0.6s ≈ 100–120 BPM); lo-fi/ambient in E04, E08, E10. Beat drop / music cut used once per video as a pattern interrupt.
5. **Counters always get a tick train; lists always get 1-2-3 pops rising in pitch** (E06).
6. Whooshes are **soft and low-passed** in premium edits (E10, E14) — matches Shadly's "too strong whoosh" feedback.

## 3. Library gaps to fill (royalty-free: Mixkit / Pixabay / Freesound CC0)
- UI micro-tick set (5 variants, very short)
- Counter tick loop (0.5–1s)
- Short riser 0.6–1.0s
- Soft air whoosh set (3 lengths, low-passed)
- 808 sub hit (dry) for face reveal
- Paper/card swish (for collage styles E04)
- Ding/notification soft (premium)

## 4. E14–E16 additions
- **E14**: pixel-dissolve = **digital blip arpeggio** (tonal ~250 Hz pulses with harmonics, 6–8 blips over 0.6s) at 1.4–2.1s and 13.75–14.2s → exactly the "pixel assemble" visual; double pops at 12.7/12.85; shimmer cluster 14.95 (ring pulse). Music = steady minimal kick ~0.4–0.5s spacing. → add family **11: digital blip arpeggio** (for pixel transitions).
- **E15**: low **bloop on each kinetic word** (~250 Hz, every 1.2–1.5s: 1.25, 5.25, 6.6, 7.9, 9.2, 10.9…) + vertical swishes on word slams (0.25, 1.85, 3.35, 4.5) over a sustained synth pad (~900 Hz line).
- **E16**: thin **1–2 kHz pops on every caption word/prop** (0.7, 1.35, 1.6, 3.9, 4.55, 4.8, 5.0), sub impact at 1.15 (title slam), **riser sweep** at 6.0 into location cut, sub drop 9.65, pop sequences when photos fan (13.1–13.8), whoosh+impact at 21.7.

Status: all 16 read (2026-10-05).
