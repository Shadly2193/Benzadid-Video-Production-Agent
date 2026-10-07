"""Generate .claude/agents/*.md from team_roles.py (responsibilities, Bengali) + _team/playbooks/*.md (technical how-to)
+ the shared COMMS protocol. Edit roles/playbooks, then re-run. L1 (Assistant) and P0 (Director) are skills, not subagents."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
from team_roles import ROLES

SLUG = {"P1": ("reel-analyst", "Production step 1 — Ingest & Analyst: backs up, proxies, syncs and measures every raw file; recommends the format."),
        "P2": ("reel-editor", "Production step 2 — Story Editor: transcript, duplicate/silence removal, story structure and hook line, cut list (EDL)."),
        "P3": ("performance-judge", "Production step 3 — scores every on-camera take (eyes, expression, energy, fluency) and picks the best takes."),
        "P4": ("broll-researcher", "Production step 4 — sources and records every B-roll/proof asset (websites, stats with real sources, objects) with licences."),
        "P5": ("motion-designer", "Production step 5 — visual plan and build: shots, hooks, camera moves, transitions, graphics in Remotion/HyperFrames."),
        "P6": ("caption-specialist", "Production step 5b — captions and typography: chunking, timing, placement in platform safe zones, Bangla rendering, .srt."),
        "P7": ("colorist", "Production step 5c — HDR→SDR, adaptive natural-warm grade, shot matching; outputs per-clip filters."),
        "P8": ("sound-designer", "Production step 6 — voice clean-up, music, meaning-matched SFX from SOUND_MAP and the library, final mix −14 LUFS."),
        "P9": ("finisher-qa", "Production step 7 — export per platform (9:16/4:5), versioning, archive, and the full pass/fail QA scorecard."),
        "C1": ("content-strategist", "Content team — monthly calendar, pillars, one goal and CTA per video, repurpose plans (brand-aware)."),
        "C2": ("content-researcher", "Content team — fact sheets with real sources, doctor pain points, risk checks, trend/competitor scans."),
        "C3": ("scriptwriter", "Content team — 30–60 s scripts in Shadly's voice (Bangla/English) with 3 hook options and visual cues."),
        "C4": ("recording-coach", "Content team — recording brief: teleprompter text, shot list, camera/light/sound/framing checklist, pick-ups."),
        "C5": ("visual-designer", "Content team — covers/thumbnails per platform, carousels, stat cards, AI image prompts, brand kit owner."),
        "C6": ("publisher", "Content team — per-platform captions/hashtags/titles/post times (FB, IG, TikTok, Shorts, LinkedIn); posts only with Shadly's OK."),
        "C7": ("content-analyst", "Content team — monthly performance report from Shadly's screenshots; what wins and what to change.")}

COMMS = """## Communication (binding — full text `_team/COMMS.md`)
1. Before work read `GOAL.md`, `DECISIONS.md` and open `BOARD.md` items addressed to you; append `H- <you>: I understand the goal as "…"`.
2. Check the files you receive; problems → `F-` entry to their owner. Never silently fix another agent's work.
3. Unclear → `Q-` entry to the right agent; pause only the blocked part.
4. Finish with an `H-` hand-off note: what you made, what the next agent must know, risks.
5. Disagreement → Director decides. Goal/brand/facts/money/other doctors/anything published → `S-` entry (Shadly decides).
6. Nobody is above anybody; everyone serves GOAL.md."""

def main():
    out = os.path.join(ROOT, ".claude", "agents"); os.makedirs(out, exist_ok=True)
    n = 0
    for rid, team, name, st, mission, phases, owns, hands in ROLES:
        if rid not in SLUG: continue
        slug, desc = SLUG[rid]
        pb = open(os.path.join(ROOT, "_team", "playbooks", f"{slug}.md"), encoding="utf-8").read().strip()
        resp = "\n".join(f"**{p}**\n" + "\n".join(f"- {t}" for t in ts) for p, ts in phases.items())
        body = f"""---
name: {slug}
description: {desc}
---
# {rid} · {name}
**Mission:** {mission}
Always read first: `_team/TEAM.md`, `_team/COMMS.md`, `_team/STYLE_RULES.md` (binding), the job's `GOAL.md` / `DECISIONS.md` / `BOARD.md`.
Language with Shadly: Bengali. Files/specs: English is fine.

## Responsibilities (you own these — nobody else does them)
{resp}

**Owned exclusively:** {", ".join(owns)} · **Hands work to:** {", ".join(hands)}

{COMMS}

## Playbook (how)
{pb}
"""
        open(os.path.join(out, f"{slug}.md"), "w", encoding="utf-8").write(body); n += 1
    print(n, "agents written to", out)

if __name__ == "__main__":
    main()
