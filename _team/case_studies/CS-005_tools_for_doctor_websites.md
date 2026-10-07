# CASE STUDY CS-005 — "ডাক্তারের Website বানাতে আমি কোন Tools ব্যবহার করি"
Date: 2026-10-06 → 10-07 · Raw: 74 s talking head, iPhone HLG HDR, pre-cut in CapCut · Final: v4, 64.5 s, 1.12×.
Every agent reads this before starting a talking-head job. Goal: make v1 shippable, not v4.

## Brief (what Shadly asked)
Keep all dialogue. Hook in 2 s. Show official tool logos on their words. Use the empty left space. Doctor-site hero visuals. Name + title on "আমি". Grade close to his home setup. SUNO BGM. Meaning-matched SFX.

## Correction rounds: 4 (v1 → v4)
| # | Shadly's correction | Agent mistake | Root cause | Prevention rule (now in STYLE_RULES / agents) |
|---|---|---|---|---|
| v1 | Grade blurry, orange, face blown out, worse than raw | Wrong HLG→SDR conversion, then a warm grade on top | No proper tonemap. The "RAW" reference preview itself was wrong (blown), so the colorist matched a broken reference | Tonemap HLG with libplacebo bt.2390 or zscale npl≥600 + hable. Show 3 grade stills next to a phone-like reference and get approval BEFORE any render |
| v1 | Siren-like opening sound | Loud riser + impact on the hook | "Hook = loud" assumption | Calm, smooth, sweet SFX by default. No risers or blasts in the first 2 s |
| v1 | Elements cover my face | Graphics placed without face tracking | No face-overlap check | Per-frame face track + automatic 0-overlap QA. Large elements use FOCUS-ZOOM (dim + blur the subject, zoom in, zoom out), with a wind whoosh on every move |
| v1 | Same hero images came back again | Visual repeated after an insert | No uniqueness check | Each visual appears once and exits when its line ends |
| v1 | Claude window + "once?" + numbers mixed together | One graphic nested inside another | Two ideas packed into one widget | One idea per graphic. Never nest |
| v1 | Too slow; CapCut logo at the end | Kept 1.0× speed; kept the CapCut end card | No check for app watermarks; no pacing judgement | Always scan the tail and head for app watermarks. Suggest 1.1–1.15× for slow talk, pitch-preserved (rubberband) |
| v1 | "MY AI STACK" not in my speech, sits on top | Invented text over the face | No depth layering | Text that isn't spoken goes behind the head (person matte) and exits fast |
| v2 | Captions/elements early or late at 27–34 s and 41–45 s | Times were ESTIMATED (energy), off by up to 3.6 s | ASR (Whisper) dropped Bangla words in that window and estimates shipped as "risk notes" | SYNC RULE: anchor every cue to a verified word onset on the FINAL audio. Re-transcribe ASR gaps as short clips with the script as prompt. sync_report |Δ|≤0.12 s. Any EST = FAIL |
| v3 | Client-B doctor phone card shows a blank grey screen | Used a screen recording whose first seconds are a blank page load (same bug as ClientC Dental earlier, fixed only for ClientC Dental) | Fixed one instance, not the class of bug. No blank-frame check on inserted media | Trim the load phase from every web capture (or use the loaded still). QA checks every inserted media frame for blank or low-detail content. When fixing a bug, search for and fix ALL instances of the same kind |

## What worked (keep)
Focus-zoom. Logos behind the head. Big ✓ / ✗. Separate number counter. Outro name + logo orbit around the hand. Calm SFX bed. The SUNO "Futuristic AI Explainer" BGM. Short phrase captions with tool names in orange. Director gates (grade approval, storyboard).

## Director lessons
1. Look at every preview yourself before sending it. The v2-grade stills reached Shadly while banding and the wrong reference were still in them.
2. An "honest risk" note is not a fix. If a risk can be verified, verify it before delivery.
3. When fixing a bug, fix every instance of that kind of bug, not just the one Shadly saw.

## Shadly's verdict (2026-10-07)
"Fantastic, professional video editing." Shadly is very happy with the team's work. This was the first full trial, and the bar for future videos is higher still. Final = v4.
- The grade for this exact setup (home sofa, curtain, warm room light, iPhone HLG) is saved as preset SETUP-01 (see GRADE_STANDARD.md). Reuse it only for the same setup.
