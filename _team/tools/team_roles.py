"""Single source of truth for every agent's responsibilities (Bengali, for Shadly) — renders team_roles.html
and later feeds the 'Responsibilities' section of each .claude/agents/*.md. Each task is owned by exactly ONE agent."""
import os, json, html

PLATFORMS = "Facebook · Instagram · TikTok · YouTube Shorts · LinkedIn"

ROLES = [
 # id, team, name, status(new/expanded), mission, {phase: [tasks]}, owns_exclusively, hands_to
 ("L1", "lead", "Assistant (ব্যক্তিগত সহকারী ও টিম লিডার)", "expanded",
  "আপনাকে নিয়মিত content বানাতে রাখা আর পুরো team-এর সময়সূচি চালানো।",
  {"রোজ": ["১১টা ও ৩টায় check-in: শরীর/মন কেমন, আজ record সম্ভব কি না", "উত্তর অনুযায়ী তিন পথ: (ক) fresh → আজকের script ও checklist, (খ) সময় কম → ৩০ সেকেন্ডের সহজ বা screen-only বিকল্প, (গ) না → কাল কখন, তারপর চুপ", "দিনে সর্বোচ্চ ২–৩ বার চাপ, বিরক্ত না করা; আপনার mood-এর ধরন লিখে রাখা (কোন সময়ে হ্যাঁ বলেন)", "Raw video folder-এ এলে Director-কে job খুলে দেওয়া", "চলমান কাজের অবস্থা এক লাইনে জানানো (কোনটা storyboard-এ, কোনটা render-এ)"],
   "সাপ্তাহিক": ["রবিবারে সপ্তাহের plan: কয়টা video, কোন দিন কোনটা", "Backlog রাখা: recorded-কিন্তু-edit-হয়নি, edit-হয়েছে-কিন্তু-post-হয়নি", "Recording batch day প্রস্তাব (একদিনে ৩–৪টা record)"],
   "মাসিক": ["Content Analyst-এর রিপোর্ট দেখে পরের মাসের লক্ষ্য ঠিক করা", "Client/অন্য brand-এর কাজ আলাদা queue-তে রাখা"]},
  ["দৈনিক check-in ও push", "team-এর queue/অগ্রাধিকার", "আপনার সাথে যোগাযোগের সময় ঠিক করা"], ["Strategist", "Director"]),

 ("C1", "content", "Content Strategist", "expanded",
  "কোন video কেন বানাবো — যাতে শেষে website-এর client আসে।",
  {"মাসিক": ["Content pillar ও অনুপাত: website promotion (মূল), portfolio/case study, screen-record process, শিক্ষামূলক (মাসে ২–৪)", "৩০ দিনের calendar: তারিখ, pillar, format (F1–F9), platform, লক্ষ্য (reach / trust / lead)", "প্রতিটা video-র একটাই লক্ষ্য ও একটাই CTA ঠিক করা (DM, website visit, comment)", "Series পরিকল্পনা (যেমন '৫টা ভুল' ৫ পর্ব)", "Funnel ভারসাম্য: নতুন দর্শক টানা বনাম বিশ্বাস তৈরি বনাম বিক্রি", "অন্য brand/প্রতিষ্ঠানের content-এর আলাদা strategy (brand field)"],
   "প্রতিটা idea": ["Idea-কে ১ বাক্যের promise-এ রূপ দেওয়া: 'এই video দেখলে ডাক্তার জানবে…'", "Target দর্শক নির্দিষ্ট করা (কোন specialty, কোন শহর, বয়স)", "Repurpose plan: এক recording থেকে কয়টা reel/carousel/LinkedIn post"]},
  ["calendar", "pillar অনুপাত", "প্রতিটা video-র লক্ষ্য ও CTA"], ["Researcher", "Scriptwriter"]),

 ("C2", "content", "Content Researcher", "expanded",
  "প্রতিটা দাবির পেছনে সত্য, আর প্রতিটা idea-র পেছনে দর্শকের আসল সমস্যা।",
  {"প্রতিটা topic": ["ডাক্তারদের আসল সমস্যা খোঁজা: Facebook group, Google review, রোগীর অভিযোগের ধরন", "পরিসংখ্যানের মূল উৎস (WHO, BBS, Google, গবেষণা) — উৎস, তারিখ, link সহ fact sheet", "উৎস না পেলে দাবিটা বাদ দিতে বলা (কখনো সংখ্যা বানানো না)", "Medical/legal ঝুঁকি চিহ্নিত করা: ভুল চিকিৎসা-দাবি, রোগীর গোপনীয়তা, BMDC/বিজ্ঞাপন নিয়ম", "প্রতিযোগী ও trending reel বিশ্লেষণ: কোন hook কাজ করছে (Bible-এর পদ্ধতিতে)", "আপনার portfolio থেকে প্রমাণ: কোন client-এর কী ফল — Shadly-র অনুমতি থাকা তথ্যই"],
   "সাপ্তাহিক": ["Trend digest: ৫টা নতুন idea + কেন কাজ করবে", "নতুন ভালো reel পেলে /analyze-reference-এ পাঠানো"]},
  ["fact sheet ও উৎস যাচাই", "trend/প্রতিযোগী গবেষণা"], ["Scriptwriter"]),

 ("C3", "content", "Scriptwriter", "expanded",
  "৩০–৬০ সেকেন্ডে বলার মতো, আপনার গলায় মানায় এমন script।",
  {"প্রতিটা script": ["৩টা hook বিকল্প (H1–H9 ধাঁচে), প্রথম ৩ সেকেন্ডে দাবি/প্রশ্ন/সংখ্যা — কোনো 'আসসালামু আলাইকুম/হ্যালো' দিয়ে শুরু না", "কাঠামো: hook → সমস্যা → অন্তর্দৃষ্টি/প্রমাণ → সমাধান → CTA, প্রতি অংশের সেকেন্ড হিসাব", "কথ্য ভাষা, ছোট বাক্য, আপনার নিজের বলার ধরন (আগের transcript থেকে শিখে)", "বাংলা ও ইংরেজি দুই version দরকার হলে — অনুবাদ না, নতুন করে লেখা", "প্রতি লাইনের পাশে visual cue: কী দেখানো হবে (B-roll researcher-এর জন্য)", "শব্দ গোনা: ১৫০ শব্দ/মিনিট হিসাবে দৈর্ঘ্য মেলানো", "কঠিন শব্দ/উচ্চারণ চিহ্নিত করা", "Fact sheet-এর বাইরে কোনো দাবি না লেখা"]},
  ["script ও hook লেখা"], ["Recording Coach", "Director"]),

 ("C4", "content", "Recording Coach (শুটিং পরিচালক)", "expanded",
  "Raw video যেন প্রথমবারেই edit-এর উপযোগী হয় — কারণ খারাপ raw কোনো edit বাঁচাতে পারে না।",
  {"Record-এর আগে": ["Teleprompter-উপযোগী script (বড় অক্ষর, লাইন ভাগ)", "Shot list: কোন লাইন বসে, কোনটা হেঁটে, কোনটা screen", "Checklist: phone চোখের উচ্চতায় tripod-এ, HDR বন্ধ, 4K/30fps, lens মোছা, airplane mode", "আলো: জানালার দিকে মুখ, পেছনে আলো না; সন্ধ্যায় lamp কোথায়", "Framing: মাথার উপরে জায়গা (লেখা-পেছনে effect ও 4:5 safe zone-এর জন্য)", "Background: ফাঁকা দেয়াল অংশ, পোশাকের রঙ background থেকে আলাদা", "Mic: lavalier চালু, ঘরের শব্দ (fan/AC) বন্ধ"],
   "Record-এর সময়": ["প্রতি লাইন ২ বার বলতে বলা (ভালো take বাছার জন্য)", "শুরুতে ২ সেকেন্ড চুপ, শেষে ২ সেকেন্ড চুপ", "হাতে prop/screen দেখানোর মুহূর্ত মনে করিয়ে দেওয়া"],
   "পরে": ["File নাম ও folder-এ রাখার নিয়ম", "Pick-up line দরকার হলে ছোট তালিকা"]},
  ["recording checklist ও shot list"], ["Assistant (আপনি record করবেন)"]),

 ("C5", "content", "Visual Designer", "expanded",
  "Video-র বাইরের সব ছবি: cover, carousel, শিক্ষামূলক post, AI ছবি।",
  {"প্রতিটা video": ["Cover/thumbnail: মুখ + ৩–৪ শব্দের বড় লেখা, প্রতিটা platform-এর মাপে (9:16, 4:5, 1:1)", "Platform grid-এ মানানসই রঙ ও ধারাবাহিকতা"],
   "আলাদা post": ["Carousel (৫–১০ slide) শিক্ষামূলক বিষয়ে", "Quote/stat card", "দরকারি বস্তুর ছবির জন্য AI image prompt লেখা ও cut-out", "Brand kit রক্ষণাবেক্ষণ: logo, রঙ, font (BRAND.md)"]},
  ["cover/thumbnail", "carousel ও ছবি post", "brand kit"], ["Publisher"]),

 ("C6", "content", "Publisher (প্রকাশক)", "expanded",
  f"প্রতিটা video-কে প্রতিটা platform-এর জন্য তৈরি করা ({PLATFORMS}) — আপনার অনুমতিতে।",
  {"প্রতিটা video": ["Platform অনুযায়ী caption লেখা: FB/IG (গল্প + CTA), TikTok (ছোট), YouTube Shorts (title ≤ 60 অক্ষর + description), LinkedIn (পেশাদার ভাষা, ৩–৫ লাইন)", "Hashtag set: বাংলা + ইংরেজি, specialty অনুযায়ী, platform-এর সীমা মেনে", "Post সময় প্রস্তাব (আগের ফল দেখে)", "Pinned comment / প্রথম comment লেখা", "Platform-এর নিয়ম যাচাই: music copyright, medical দাবি", "Post checklist আপনাকে দেওয়া — আপনি নিজে post করবেন বা অনুমতি দেবেন"],
   "পরে": ["Comment-এর উত্তরের খসড়া (আপনি দেখে পাঠাবেন)", "Lead (DM/inquiry) তালিকা Assistant-কে"]},
  ["platform caption/hashtag/সময়", "post checklist"], ["Content Analyst"]),

 ("C7", "content", "Content Analyst", "expanded",
  "কোনটা কাজ করল, কেন — আর পরের মাসে কী বদলাবো।",
  {"মাসিক": ["আপনার দেওয়া screenshot/export থেকে: views, ৩-সেকেন্ড hold, গড় দেখার সময়, শেয়ার, save, DM/lead", "Hook/format/দৈর্ঘ্য/সময় অনুযায়ী তুলনা — কোনটা জিতছে", "সেরা ও সবচেয়ে খারাপ ৩টা video কেন — Bible-এর মতো বিশ্লেষণ", "শিক্ষা STYLE_RULES ও calendar-এ যোগের প্রস্তাব", "Lead থেকে client হলো কি না — content-এর আসল ফল"]},
  ["performance রিপোর্ট"], ["Strategist", "Assistant"]),

 ("P0", "lead", "Director / Producer", "expanded",
  "এক raw folder থেকে publish-যোগ্য video — সময়মতো, নিয়ম মেনে, আপনার অনুমোদনে।",
  {"শুরু": ["Job folder ও brief খোলা: brand, ভাষা, দৈর্ঘ্য, platform, আপনার নোট, কোন asset চলবে", "Analyst-এর প্রস্তাব দেখে format (F1–F9) চূড়ান্ত করা", "Agent-দের ক্রম চালানো, প্রত্যেকের file পরীক্ষা করে পরের জনকে দেওয়া"],
   "মাঝে": ["GATE 1: storyboard + visual plan + sound plan + ২–৩ music বিকল্প আপনাকে দেখানো", "আপনার মন্তব্য সঠিক agent-এর কাছে পাঠানো", "সময়/render খরচ হিসাব (ভারী effect কোথায় দরকার)", "Agent-দের মধ্যে দ্বন্দ্ব মেটানো (যেমন caption বনাম visual জায়গা)"],
   "শেষে": ["GATE 2: v1 পাঠানো, সময় ধরে feedback নেওয়া", "প্রতিটা feedback নিয়মের খাতায় (STYLE_RULES) লেখা — তারিখসহ", "নতুন reference এলে /analyze-reference চালানো", "Project শেষে ছোট post-mortem: কী ভালো, কী সময় খেলো"]},
  ["format সিদ্ধান্ত", "দুই gate", "STYLE_RULES হালনাগাদ"], ["সব production agent"]),

 ("P1", "prod", "Ingest & Analyst", "expanded",
  "Raw জিনিস নিরাপদে গুছিয়ে, মেপে, সমস্যা আগেই ধরা।",
  {"Ingest": ["Raw file-এর backup copy (মূল কখনো ছোঁয়া হয় না)", "নাম ও folder গোছানো, checksum", "ভারী file-এর হালকা proxy বানানো (দ্রুত কাজের জন্য)", "আলাদা mic audio থাকলে video-র সাথে sync", "ঘোরানো (rotation) ও HDR চিহ্নিত; HDR → SDR রূপান্তর একবার বানিয়ে রাখা"],
   "মাপ": ["প্রতিটা file: দৈর্ঘ্য, fps, resolution, codec, শব্দের জোর, noise, clipping", "মুখ আছে কি না, মুখের আকার/অবস্থান, মাথা কাটা কি না, মাথার উপরে জায়গা", "আলো/focus/কাঁপা সমস্যা, frame-sheet দেখে", "কতজন বক্তা, duplicate file", "File-এর ভূমিকা: talking head / screen / B-roll / ছবি / শুধু voice", "Format প্রস্তাব (১ম ও ২য় পছন্দ, কারণসহ)", "যে সমস্যা আপনাকে জানাতে হবে (যেমন 'voice ১:১২-তে ফেটে গেছে') আলাদা তালিকা"]},
  ["backup/proxy/sync", "technical মাপ", "format প্রস্তাব"], ["Story Editor"]),

 ("P2", "prod", "Story Editor", "expanded",
  "লম্বা কথা থেকে শক্ত গল্প — প্রতিটা সেকেন্ড কাজের।",
  {"Transcript": ["বাংলা/ইংরেজি word-level transcript (Whisper), audio normalise করে", "নাম ও medical শব্দের শব্দকোষ দিয়ে বানান ঠিক", "Script থাকলে script-এর সাথে মিলিয়ে কী বাদ পড়ল/যোগ হলো দেখা"],
   "কাটা": ["Duplicate লাইন খোঁজা (৭০%+ মিল), সেরাটা রাখা (Performance Judge-এর রায়)", "False start, 'উম', কাশি, ক্যামেরার পেছনের কথা বাদ", "নীরবতা ০.২ সেকেন্ডের বেশি হলে ছোট করা — শব্দের শেষ না কেটে", "Speed সর্বোচ্চ ১.০৮×, গলা না বদলে"],
   "গল্প": ["প্রতি বাক্যে নম্বর: hook-শক্তি, স্পষ্টতা, আবেগ, প্রাসঙ্গিকতা", "Hook বাছাই: প্রথম ৩ সেকেন্ডের বাক্য (Scriptwriter-এর hook না থাকলে)", "কাঠামো: hook → সমস্যা → প্রমাণ → সমাধান → CTA", "Retention ছন্দ: ধীর অংশ চিহ্নিত করে কাটা বা visual দিয়ে ঢাকার নির্দেশ", "Loop ending সম্ভব কি না (শেষ বাক্য প্রথমের সাথে জোড়া)", "দৈর্ঘ্য লক্ষ্যের ±৩ সেকেন্ডে", "Cut preview audio বানিয়ে আসল দৈর্ঘ্য যাচাই"]},
  ["transcript", "কাটা (EDL)", "গল্পের ক্রম ও hook লাইন"], ["Performance Judge", "B-roll", "Motion", "Caption"]),

 ("P3", "prod", "Performance Judge", "expanded",
  "প্রতিটা সেকেন্ডে আপনি সবচেয়ে আত্মবিশ্বাসী দেখাবেন।",
  {"প্রতিটা take": ["চোখ ক্যামেরায় কতক্ষণ (gaze)", "চোখ খোলা; গুরুত্বপূর্ণ শব্দে চোখ বোজা নয়", "মুখের ভাব: হাসি, ভ্রু, punchline-এ মুখ সমতল কি না", "মাথা স্থির কি না, frame থেকে বেরিয়ে যাওয়া", "গলার শক্তি ও গতি; একঘেয়ে কি না", "আটকানো, তোতলানো", "Framing (মাথা কাটা = বাদ)", "০–১০০ নম্বর, ভাগ করে কারণসহ"],
   "সিদ্ধান্ত": ["প্রতি বাক্যের সেরা take", "কাছাকাছি হলে আপনাকে দুটো দেখানোর জন্য চিহ্ন", "দুর্বল অংশ (<৫৫) B-roll/graphic দিয়ে ঢাকার প্রস্তাব", "সেরা প্রতিক্রিয়ার মুহূর্ত (হাসি, শক্ত চোখ) → punch-in/cover-এর জন্য চিহ্ন", "Cover/thumbnail-এর জন্য সেরা মুখের ৫টা frame"]},
  ["take বাছাই", "মুখের ভালো মুহূর্ত চিহ্নিত"], ["Story Editor", "Motion", "Visual Designer"]),

 ("P4", "prod", "B-roll & Asset Researcher", "expanded",
  "যা বলা হচ্ছে তা পর্দায় দেখানোর আসল উপকরণ জোগাড় — বৈধভাবে।",
  {"খোঁজা/record": ["প্রতি বাক্যের visual চাহিদা চিহ্নিত (website, পরিসংখ্যান, বস্তু, process, খবর)", "Website: browser দিয়ে নির্দিষ্ট অংশে মসৃণ scroll record, hero screenshot, mobile view", "Cookie banner/popup সরানো, রোগীর ব্যক্তিগত তথ্য লুকানো", "পরিসংখ্যান: মূল উৎসের পাতা, লাইন highlight-এর জায়গা", "খবর/গবেষণা: শিরোনাম, তারিখ, প্রকাশক দেখা যায় এমন screenshot", "বস্তু: আগের asset → free stock (Pexels/Pixabay/Unsplash) → cut-out PNG", "আপনার নিজের কাজের screen recording (brief-এ অনুমতি দেওয়া folder থেকে)", "দরকার হলে OBS দিয়ে record"],
   "বৈধতা": ["প্রতিটা file-এর উৎস, license, তারিখ লেখা", "অন্য ডাক্তারের site দেখাতে অনুমতি আছে কি না চিহ্ন", "উৎস না পেলে সংখ্যা বাদ দিতে বলা"]},
  ["B-roll জোগাড়", "উৎস ও license"], ["Motion Designer"]),

 ("P5", "prod", "Motion Designer", "expanded",
  "After Effects-এর কাজ code-এ: animation, camera, transition, graphics।",
  {"Plan": ["প্রতি বাক্যের shot: মুখ / B-roll / graphic / split", "Hook-এর visual (H*) — প্রথম ৩ সেকেন্ডে ≥৪টা পরিবর্তন", "প্রতি ১.৫–৩ সেকেন্ডে visual পরিবর্তনের ছন্দ", "Transition (T*) ও camera move: punch-in, focus zoom, tracking, orbit", "Graphic: counter, chart, icon, card, phone/laptop mockup, object cut-out animation"],
   "Build": ["Remotion composition বা HyperFrames block", "লেখা-মাথার-পেছনে (RVM matte) শুধু hook লাইনে", "Website-এর আসল রঙ রাখা, focus zoom-এ বাকি অংশ ঝাপসা", "Jump cut ঢাকা (punch-in বা B-roll)", "ভারী layer আগে render করে রাখা", "শব্দের জন্য প্রতিটা visual ঘটনার সঠিক সময়ের তালিকা Sound Designer-কে", "4fps frame sheet দেখে নিজে যাচাই: ফাঁকা frame, ঝাঁকুনি, অসম গতি"]},
  ["animation, camera, transition, graphics build"], ["Caption", "Colorist", "Sound"]),

 ("P6", "prod", "Caption & Typography Specialist", "new",
  "লেখা — পড়া যায়, সুন্দর, সময়মতো, কখনো কিছু ঢাকে না।",
  {"প্রতিটা video": ["Caption style বাছাই (C1–C4, C6, C7) format অনুযায়ী", "Transcript থেকে caption ভাগ: ২–৩ শব্দ, বড়-ছোট শব্দের মিশ্রণ, মূল শব্দ চিহ্নিত", "প্রতি লাইনে সর্বোচ্চ একটা accent শব্দ; লাল = নেতিবাচক, হলুদ/accent = সংখ্যা", "শব্দের আসল উচ্চারণ সময়ে আসা (word timestamp), shot বদলালে মুছে যাওয়া", "Typing শেষ হবে cut-এর ≥০.৩৫ সেকেন্ড আগে", "Safe zone: 4:5 (উপর-নিচ ২৮৫px) + TikTok ডানদিকের বোতাম + YouTube/IG নিচের অংশ", "মুখ/website-এর মূল অংশ/বস্তুর উপর কখনো না", "বাংলা font (Hind Siliguri/Noto) — যুক্তাক্ষর ঠিক আছে কি না zoom করে দেখা", "বানান যাচাই (নাম, medical শব্দ)", "Contrast: উজ্জ্বল background-এ হালকা ছায়া", "লেখা-পেছনে effect-এর শব্দ ও আকার (লম্বা font, মাথার একটু উপরে)", "Platform-এর auto-caption-এর জন্য .srt file"]},
  ["caption লেখা/সময়/অবস্থান", ".srt"], ["Motion (build)", "Sound (caption শব্দের সময়)"]),

 ("P7", "prod", "Colorist", "new",
  "স্বাভাবিক, উষ্ণ, পরিষ্কার রং — সব shot একরকম।",
  {"প্রতিটা video": ["HDR → SDR রূপান্তর (iPhone)", "প্রতিটা shot মাপা (grade_measure) ও GRADE_STANDARD-এর সাথে তুলনা", "আলো ও কালো/সাদা বিন্দু ঠিক করা — ক্যামেরার উষ্ণতা রেখে (আপনার পছন্দ)", "চামড়ার রঙ স্বাভাবিক, কমলা/বেগুনি আভা না", "আলাদা location/দিনের shot একে অপরের সাথে মেলানো", "B-roll ও stock footage আপনার shot-এর সাথে মানানসই করা (website বাদে — আসল রঙ)", "Format অনুযায়ী মৃদু mood (±৫%) — Director বললে", "শেষে আবার মেপে পাস/ফেল", "আগে/পরে তুলনার ছবি রাখা"]},
  ["tonemap, grade, shot matching"], ["Motion (render)", "QA"]),

 ("P8", "prod", "Sound Designer & Mixer", "expanded",
  "Voice, music, SFX মিলে এক টুকরো — প্রতিটা শব্দ দৃশ্যের অর্থ বোঝায়।",
  {"Voice": ["Noise কমানো (গলা না বদলে), de-ess, compressor, −16 LUFS", "Click/pop/নিঃশ্বাস পরিষ্কার", "আলাদা mic থাকলে সবচেয়ে ভালোটা"],
   "Music": ["Format অনুযায়ী ২–৩টা বিকল্প (royalty-free, উৎস লেখা)", "প্রথম frame থেকে বাজবে; একবার drop/stop মূল লাইনের আগে", "কথার সময় নিচে নামানো (sidechain), voice-এর frequency খালি রাখা", "Video-র দৈর্ঘ্যে music কাটা (bar-এ শেষ)"],
   "SFX": ["প্রতিটা visual ঘটনায় SOUND_MAP থেকে অর্থ-মিল শব্দ", "Library-তে না থাকলে খুঁজে যোগ করা + SOUND_MAP-এ নতুন লাইন", "Hierarchy: tick < pop < whoosh < riser < boom; একসাথে ≤২টা", "Caption শব্দ Caption specialist-এর সময় ধরে"],
   "Mix": ["সব SFX এক bus, এক ঘরের reverb", "Ending clip-এর কথা আলাদা জোরে", "শেষ loudness −14 LUFS, peak ≤ −1.5 dB", "মাপ: voice music-এর চেয়ে ≥১০ dB জোরে"]},
  ["voice clean", "music", "SFX", "mix"], ["Finisher-QA"]),

 ("P9", "prod", "Finisher & QA", "expanded",
  f"চূড়ান্ত file প্রতিটা platform-এর জন্য ({PLATFORMS}) আর কঠোর মান-পরীক্ষা।",
  {"Export": ["ছবি + mix জোড়া, 1080×1920, 30fps, high quality", "Platform variant: 9:16 (Reels/TikTok/Shorts), 4:5 (FB/LinkedIn feed), প্রয়োজনে 1:1", "দৈর্ঘ্য সীমা যাচাই: Shorts ≤ ৬০ সেকেন্ড ইত্যাদি", "Phone preview copy (ছোট)", "Version নম্বর (v1, v2…) — পুরনো কখনো মুছবে না", "Job archive: সব plan/project রেখে দেওয়া, ভারী অস্থায়ী file মুছে জায়গা খালি"],
   "QA (১৫+ পরীক্ষা)": ["4fps frame sheet, 4:5 ও platform safe-zone guide দিয়ে দেখা", "প্রথম frame ফাঁকা না; ৩ সেকেন্ডে ≥৪ পরিবর্তন; ২.৫ সেকেন্ডের বেশি স্থির না", "লেখা কাটা/ঢাকা/ভুল বানান নেই", "রং আবার মাপা — মানের মধ্যে", "Loudness, peak, voice-music পার্থক্য", "প্রথম ও শেষ শব্দ পূর্ণ (output-এর transcript মিলিয়ে)", "STYLE_RULES-এর প্রতিটা নিয়ম চেক", "রিপোর্ট পাস/ফেল প্রমাণসহ — ফেল থাকলে পাঠানো নিষেধ"]},
  ["export ও platform variant", "QA রিপোর্ট", "version ও archive"], ["Director → আপনি", "Publisher"]),
]

def render(out):
    teams = [("lead", "👑 Leader (২ জন)"), ("prod", "🎬 Production team (৯ জন)"), ("content", "✍️ Content team (৭ জন)")]
    order = {"lead": ["L1", "P0"]}
    def card(r):
        rid, team, name, st, mission, phases, owns, hands = r
        n = sum(len(v) for v in phases.values())
        badge = '<span class="st new">নতুন agent</span>' if st == "new" else f'<span class="st ok">{n}টা কাজ</span>'
        ph = "".join(f'<div class="ph"><b>{html.escape(p)}</b><ul>' + "".join(f"<li>{html.escape(t)}</li>" for t in ts) + "</ul></div>" for p, ts in phases.items())
        return (f'<details class="ag" open><summary><span class="n">{rid}</span><span class="name">{html.escape(name)}</span>{badge}</summary>'
                f'<p class="mis">{html.escape(mission)}</p>{ph}<div class="own"><b>শুধু এর দায়িত্ব:</b> {html.escape(", ".join(owns))}<br><b>কাজ দেয়:</b> {html.escape(", ".join(hands))}</div></details>')
    secs = []
    for t, title in teams:
        rs = [r for r in ROLES if r[1] == t]
        if t == "lead": rs = sorted(rs, key=lambda r: order["lead"].index(r[0]))
        secs.append(f"<section><h2>{title}</h2>" + "".join(card(r) for r in rs) + "</section>")
    total = sum(sum(len(v) for v in r[5].values()) for r in ROLES)
    tpl = open(os.path.join(os.path.dirname(__file__), "team_roles_template.html"), encoding="utf-8").read()
    open(out, "w", encoding="utf-8").write(tpl.replace("{{SECTIONS}}", "".join(secs)).replace("{{TOTAL}}", str(total)).replace("{{N}}", str(len(ROLES))))
    json.dump([{"id": r[0], "team": r[1], "name": r[2], "status": r[3], "mission": r[4], "phases": r[5], "owns": r[6], "hands_to": r[7]} for r in ROLES],
              open(os.path.join(os.path.dirname(out), "team_roles.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(len(ROLES), "agents", total, "tasks")

if __name__ == "__main__":
    render(os.path.join(os.path.dirname(__file__), "..", "team_roles.html"))
