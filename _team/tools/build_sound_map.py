"""sound_map_data.py -> _team/SOUND_MAP.md (human) + _team/sound_map.json (agents)."""
import os, json
here = os.path.dirname(__file__)
exec(open(os.path.join(here, "sound_map_data.py"), encoding="utf-8").read())

PROFILES = {
 "calm":      ("F1, F5, F8 (talking head, podcast, case study)", "-3 dB vs default; skip CAP ticks except keywords; whooshes low-passed 6 kHz"),
 "energetic": ("F6, F7 (cold open, agency promo)", "default levels; allow layered swish+thump; up to 2 SFX/s"),
 "faceless":  ("F4, F2 cards (motion graphic)", "default; every object entrance gets its sound; pops pitched to music key if possible"),
 "signature": ("F3, F9 (walking, curved typography)", "-2 dB; prefer air/shimmer over clicks; impacts only on title slams"),
}
rows, md = [], ["# SOUND_MAP — what sound plays when (575 base scenarios × 4 format profiles)",
 "Built from sound_map_data.py (edit there, then run build_sound_map.py). Agents read `sound_map.json`.",
 "**How the Sound Designer uses it:** for every visual event and every spoken noun in the edit plan, find the matching row (category → trigger), apply the profile of the chosen format, then search the library by `query`. If nothing matches, pick the sound that literally explains what is shown (STYLE_RULES: meaning first). Never more than 2 overlapping SFX; the hierarchy tick < pop < whoosh < riser < impact always holds.", "",
 "## Format profiles", "| Profile | Formats | Rule |", "|---|---|---|"]
md += [f"| {k} | {a} | {b} |" for k, (a, b) in PROFILES.items()]
for key, (title, lvl, timing, items) in CATS.items():
    md += ["", f"## {key} — {title}", f"Default level: SFX peak **{lvl} dB** relative to voice peak (each SFX peak-normalised first) · timing: {timing}", "", "| ID | Trigger / scenario | Sound | Library query |", "|---|---|---|---|"]
    for i, (trig, snd, q) in enumerate(items, 1):
        rid = f"{key}-{i:03d}"
        rows.append({"id": rid, "cat": key, "trigger": trig, "sound": snd, "query": q, "level_db": lvl, "timing": timing})
        md.append(f"| {rid} | {trig} | {snd} | {q} |")
json.dump({"profiles": {k: {"formats": a, "rule": b} for k, (a, b) in PROFILES.items()}, "rows": rows},
          open(os.path.join(here, "..", "sound_map.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(here, "..", "SOUND_MAP.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
print(len(rows), "rows")
