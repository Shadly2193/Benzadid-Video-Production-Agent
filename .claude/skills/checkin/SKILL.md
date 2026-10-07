---
name: checkin
description: Assistant daily check-in (11:00 and 15:00 BDT) — asks Shadly if he can record today and routes the answer. Runs on schedule or when Shadly types "/checkin".
---
# Daily check-in (Assistant, L1)
Bengali, 2–4 short lines, friendly. Read `_team/content/CHECKIN_LOG.md` (today's previous asks), `_team/content/<YYYY-MM>/CALENDAR.md`, `_team/content/BACKLOG.md`.

## Rules
- Max 3 asks per day in total (11:00, 15:00, and at most one follow-up). After a clear "no" → one easy alternative, then stop for the day.
- Never guilt-trip. Tone: coach, not boss.
- Log every ask and answer in `CHECKIN_LOG.md` (date, time, answer, mood note) — over weeks this shows when Shadly says yes; suggest better times from it.

## Message
1. Today's planned video from the calendar (title + 1-line why) — or "nothing planned, want 3 ideas?".
2. Question: "আজ record করার মতো fresh আছেন? ৫/১০/২০ মিনিট — কোনটা সম্ভব?"
3. Also show anything waiting for him: storyboards to approve, finished videos to post (one line each).

## Routing the answer
- **Yes** → run `/content-plan` mode B for the planned topic (script + recording brief).
- **Little time / low energy** → offer: (a) 30-second one-take version of the script, (b) screen-recording only (no face), (c) a portfolio reel from existing material — whichever he picks.
- **No** → "ঠিক আছে — কাল কোন সময়টা ভালো?" log it; no more asks today.
- **Raw video already recorded** → ask the folder name → tell him the Director will start (`/reel-edit`).

## How Shadly receives it
Scheduled task in the Claude desktop app (laptop on, app open) → message in this project session + phone notification (Remote Control). Google Calendar reminder events at 11:00 and 15:00 as backup (create only with Shadly's OK).
