# GRADE_STANDARD — adaptive "standard grade" (measured 2026-10-06)
Not a LUT. Each video is measured, then nudged gently toward these targets. Tool: `tools/grade_auto.py` (prints the ffmpeg filter + before/after preview).
Source data: `01_REFERENCE_BIBLE/grade_refs.json` (clean talking-head refs E02, E06, E10, E11, E12; frames with graphics excluded as outliers).

| Measure | References (range) | Our target | Limit of correction |
|---|---|---|---|
| Black point (L, 2nd pct) | 0–5 | 2.5 | levels only |
| White point (L, 98th pct) | 92–99 | 95 | levels only |
| Skin lightness (cheek L) | 38–53 | 50 | gamma 0.85–1.20 |
| Skin saturation | 0.37–0.57 | 0.45 | saturation ×0.85–1.15 |
| Skin hue | 19–31° | ~22° (peach) | via white balance only |
| Highlight cast | refs vary (E02/E11 warm by style) | **keep camera warmth** (Shadly 2026-10-06); correct only if B/R outside 0.65–1.05 | channel gain ±8% |
| Contrast | IQR 39–58 | +3% | eq contrast 1.03 |

## Pipeline order
1. HDR (HLG/PQ) → SDR tonemap (zscale + hable) — mandatory for iPhone.
2. `grade_auto.py` filter (WB → levels → gamma/sat → contrast).
3. Optional per-video "accent mood" (≤ ±5% warmth) only if Director asks; never orange/teal crush, never purple.
4. QA: re-measure the output; skin must land inside reference ranges above, else flag.

Test: `03_TESTS/grade_test_before-after.jpg` (Client-A doctor raw, left before / right after): orange cast removed, whites cleaner, skin natural.

## Setup presets (approved by Shadly)
- **SETUP-01, home sofa + brown striped curtain + warm room light, iPhone HLG vertical** → use the "2 Calm cinematic" chain in `grade_presets/SETUP_home_sofa_curtain_warmlight_iphoneHLG.json`. Approved for JOB-005 on 2026-10-07. Use it only when the setup matches (same room, same light, same camera). Any other setup needs a fresh grade from 3 options approved as stills.
