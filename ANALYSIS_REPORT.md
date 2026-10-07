# Video Analysis Report — Benzadid Intelligence Reels
তারিখ: 2026-10-04 · বিশ্লেষণ: ২৭টা video (নিজের ১৪ + expectation ১৩)
পদ্ধতি: প্রতি video থেকে ১২টা frame + ffprobe metadata + scene-cut detection। Audio এখনো কানে শোনা/বিশ্লেষণ হয়নি।

---

## ১. আপনার নিজের video-র pattern (O1–O14)

| বিষয় | যা পেয়েছি |
|---|---|
| Format | 720×1280, 30fps, 25–60 সেকেন্ড |
| Hook | প্রায় সব video শুরু হয় কাগজে হাতে লেখা লাইন দিয়ে ("ডাক্তারদের ওয়েবসাইটে যেই ৩টা ভুল…") — এটা ভালো, আপনার signature |
| Structure | প্রশ্ন → উত্তর → screen demo → আবার প্রশ্ন ("এরপর?", "কি লাভ?", "তাহলে কি দরকার?", "Backend কী?") |
| Shot | Medium talking head, ক্যাপ, পর্দা/বইয়ের তাক/দেয়াল background |
| Caption | মাঝখানে ১টা বাংলা শব্দ, সাদা — CapCut auto-caption ধাঁচ |
| B-roll | Client website-এর screen (phone দিয়ে laptop screen শুট করা) |
| Ending | Lower-third: "Dr. Shadly Benzadid — Ex Dental Surgeon, Now AI Generalist" |
| Brand | নিচে ডানে benzadid intelligence watermark |
| Cut rate | O1/O3/O8: প্রতি ১.৫–২ সেকেন্ডে cut (ভালো)। O4/O5/O6/O13: পুরো video-তে ৩–৪টা cut (ধীর) |

### যা ভালো হচ্ছে
- হাতে লেখা hook — unique, চোখ আটকায়।
- Q&A structure — viewer-কে ধরে রাখার জন্য সঠিক কৌশল।
- **O8** (halftone B&W + কমলা bold keyword) আর **O2** (orange-glow caption) — এগুলো আপনার সেরা কাজ, প্রায় pro লেভেলের কাছাকাছি।
- O1-এর eye/retina website showcase visually strong।

### Brutal সমস্যা (amateur লাগার আসল কারণ)
1. **Screen phone দিয়ে শুট করা।** Moiré, glare, বাঁকা angle, ঝাপসা (O12 প্রায় পড়াই যায় না)। এটাই সবচেয়ে বড় amateur signal। সমাধান: OBS/Windows screen recorder দিয়ে সরাসরি record।
2. **Caption style ১৪ video-তে অন্তত ৬ রকম।** কখনো সাদা plain, কখনো orange glow, কখনো Impact-style, কখনো vertical। কোনো fixed brand identity নেই।
3. **এক শব্দের caption।** দ্রুত চোখ বুলালে বাক্য বোঝা যায় না; keyword highlight নেই।
4. **Background/lighting প্রতিবার আলাদা।** পর্দা, বইয়ের তাক, দেয়াল, সবুজ আলো — চেনা "set" নেই।
5. **কিছু video-তে cut খুব কম** (O4, O5, O6, O13) — ৩০–৪০ সেকেন্ড একই frame।
6. **Watermark caption-এর সাথে ধাক্কা খায়** কিছু frame-এ।

---

## ২. Expectation video-গুলো — প্রতিটার কৌশল ও আমার সম্ভাব্যতা

সম্ভাব্যতা = আমি (FFmpeg + Remotion + AI tool) দিয়ে কতটা কাছে যেতে পারবো।

| # | Style | মূল কৌশল | সম্ভাব্যতা |
|---|---|---|---|
| E2 | Talking head + serif caption | পরিষ্কার serif caption, keyword বড় ও হলুদ, ছোট picture-in-picture | **৯০%+** |
| E11 | Cinematic talking head | Minimal সাদা caption, keyword bold, B-roll cutaway, warm grade | **৯০%** (শুটিং quality আপনার হাতে) |
| E6 | YouTube-edu (হলুদ accent) | হলুদ বড় caption, নম্বর badge, B&W punch-in, UI card pop-up, screen insert gradient-এ | **৮৫–৯০%** |
| E5 | Talking head ↔ typography card | ব্যক্তির shot-এর মাঝে পুরো-screen kinetic typography (কমলা/নীল) | **৮৫–৯০%** |
| E8 | Minimal motion graphic | Brain PNG + serif bullet text reveal, সাদা bg | **৮৫%** (asset লাগবে) |
| E10 | Podcast + editorial insert | Speaker clip ↔ ধূসর bg-এ cutout object + serif text | **৭৫–৮০%** |
| E4 | Paper collage | Cream grid bg, কাটা-ছবি collage, বড় condensed text, spotlight | **৭০–৮০%** (অনেক PNG asset) |
| E9 | Monochrome AI explainer | সাদা-কালো 3D icon, phone mockup, text reveal | **৭০–৭৫%** |
| E13 | Dark ad-agency | Phone mockup, লাল accent, "#1…#5" list, grid line | **৭৫%** |
| E1 | Hormozi-style editorial | Paper texture, RGB split glitch, brain/eye asset, handwritten font, red string board | **৬৫–৭৫%** |
| E12 | Real-estate presenter | ব্যক্তির পেছনে/সামনে ভাসমান card, হাতে ধরা card, text ব্যক্তির পেছনে | **৫০–৬০%** (body tracking দুর্বল) |
| E3 | Cinematic tech | Lens flare, light leak, film burn, HUD frame | **৫০–৬০%** (flare overlay file লাগবে) |
| E7 | Luxury real-estate ad | Drone shot, model walk, text-behind-subject | **৪০%** — এটা editing না, **production** (drone, location, model) |

### সারকথা
- **আপনার কাজের সাথে সবচেয়ে মানানসই ও ৯০% সম্ভব:** E2, E11, E6, E5 — সব talking-head-based, আপনার Q&A format-এ সরাসরি বসে।
- **Motion-graphic heavy (E1, E4, E8, E9, E10, E13):** সম্ভব, কিন্তু প্রতিটা দৃশ্যের জন্য cutout ছবি (brain, eye, tooth, phone) লাগবে। AI দিয়ে image বানিয়ে background remove করা যায় — সময়সাপেক্ষ।
- **৯০% অসম্ভব:** E7 (shoot quality), E12 (hand-tracking, 3D card), E3 (After Effects-গ্রেড compositing)।

---

## ৩. Technical সীমাবদ্ধতা (honest)
- **Bangla transcription:** Whisper বাংলায় মোটামুটি; প্রতি video-তে কিছু শব্দ হাতে ঠিক করতে হবে।
- **Text-behind-subject / ব্যক্তি cutout:** AI segmentation (rembg/MediaPipe) দিয়ে সম্ভব, কিন্তু আপনার laptop-এ ১ মিনিটের video-তে অনেক সময় লাগবে।
- **Music/SFX:** আমি বানাতে/download করতে পারবো না — একটা SFX pack (whoosh, pop, ding, riser, bass hit) ও কিছু music আপনাকে দিতে হবে (Pixabay/YouTube Audio Library free)।
- **3D object ঘোরানো:** হবে না। Static PNG + parallax/float animation দিয়ে কাছাকাছি।

---

## ৪. প্রস্তাবিত পরিকল্পনা

### Phase 1 — "Benzadid Reel Kit" (একবার বানাবো, বারবার ব্যবহার)
Remotion (code-based video) template, Midnight Magma brand-এ:
- Fixed caption style: ২–৪ শব্দ, keyword কমলা #FF6A00 + scale-pop, প্রতিটা caption-এ ছোট "pop" SFX
- Q&A প্রশ্ন card (বড় typography, full-screen ০.৮ সেকেন্ড, whoosh সহ)
- B&W halftone punch-in (O8-এর সেরা effect-কে standard বানানো)
- Screen-insert: website recording gradient bg-এ ভাসমান rounded card (E6 ধাঁচ)
- Auto zoom punch-in (প্রতি ৩–৪ সেকেন্ডে ১০৮–১১৫%)
- Hook: হাতে লেখা কাগজ shot রেখে, উপরে animated underline + riser SFX
- Fixed lower-third + end card
- Music auto-ducking

### Phase 2 — আপনার workflow
১. Raw video + website-এর screen recording (OBS দিয়ে) folder-এ রাখবেন
২. আমি transcribe → আপনি ভুল শব্দ ঠিক করবেন (৫ মিনিট)
৩. আমি silence কাটবো, caption/effect/SFX বসাবো, render করবো
৪. Feedback → revise

### Phase 3 — Motion-graphic insert (E8/E10 ধাঁচ)
Topic-ভিত্তিক cutout asset library (tooth, eye, bone, brain, phone mockup) ধীরে ধীরে বানানো।

### শুরুর আগে লাগবে
- `faster-whisper`, `rembg` (Python) ও Remotion (Node) install — Node/Python/FFmpeg আগে থেকেই আছে
- একটা নতুন raw talking-head video (৩০–৬০ সেকেন্ড, edit ছাড়া)
- ঐ video-র জন্য screen recording (থাকলে)
- SFX pack + ১–২টা background music
