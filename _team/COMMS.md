# COMMS — how the team talks (binding for every agent)
Subagents cannot phone each other mid-task, so the team talks through three shared files in every job folder `_job/` (content work uses `_team/content/<YYYY-MM>/`). Nobody is above anybody; the Director only orders the work and breaks ties.

## The three files
| File | Who writes | Rule |
|---|---|---|
| `GOAL.md` | Director (production) / Strategist (content) | Written first. One message, audience, feeling, CTA, length, platform, brand, Shadly's notes, "what success looks like". Changes only via DECISIONS. |
| `BOARD.md` | Everyone | Questions, flags, hand-off notes. Append-only. |
| `DECISIONS.md` | Director (or Assistant for content) | Every resolved question, dated, with who decided. Final word. |

## BOARD entry format (append at bottom)
```
### [Q-007] 2026-10-06 14:20 · FROM: caption-specialist → TO: motion-designer · STATUS: open
Context: 0:12–0:15 the website hero fills the stage; caption tier 2 would cover the CTA button.
Question: can the zoom end 10% higher so the bottom 300 px are free?
Blocking: captions 0:12–0:15 only (rest continues).
```
Answer by appending under it: `→ ANSWER (motion-designer): yes, camera ends at y=-60 · STATUS: closed`.
Types: `Q-` question · `F-` flag/problem found in someone else's work · `H-` hand-off note · `S-` Shadly needed.

## Six rules
1. **Read before work**: GOAL.md, DECISIONS.md, open BOARD items addressed to you. Then append one line to BOARD: `H- <agent>: I understand the goal as "…"`. If that line contradicts GOAL, the Director corrects it before you continue.
2. **Check what you receive**: validate the previous agent's files (exist, complete, consistent with GOAL). Problems → `F-` entry addressed to that agent; never silently fix someone else's work.
3. **No guessing**: unclear → `Q-` entry; pause only the blocked part, continue the rest.
4. **Hand-off note**: when done, `H-` entry: what you produced, what the next agent must know, risks.
5. **Escalation**: two agents disagree → Director decides in DECISIONS. Goal, brand, facts, money, other doctors' content, anything published → `S-` entry; the Director/Assistant asks Shadly and nothing on that point proceeds without his answer.
6. **Content ↔ Production link**: production GOAL.md quotes the script + fact sheet; if production must change a scripted line, it posts `F-` to scriptwriter; Publisher reads the final DECISIONS before writing captions.

## Director's loop (production) / Assistant's loop (content)
After each agent finishes: read its H- note and any Q/F entries → answer or route → run the next agent (or re-run a previous one with the F- item). Before GATE 1 and before delivery: zero open Q/F items, or each explicitly deferred in DECISIONS.

## Daily summary (Assistant → Shadly)
Per active job: stage, blocked items, questions waiting for Shadly (S-), next step. One short message.
