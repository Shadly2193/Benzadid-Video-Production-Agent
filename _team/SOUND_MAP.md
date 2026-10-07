# SOUND_MAP — what sound plays when (575 base scenarios × 4 format profiles)
Built from sound_map_data.py (edit there, then run build_sound_map.py). Agents read `sound_map.json`.
**How the Sound Designer uses it:** for every visual event and every spoken noun in the edit plan, find the matching row (category → trigger), apply the profile of the chosen format, then search the library by `query`. If nothing matches, pick the sound that literally explains what is shown (STYLE_RULES: meaning first). Never more than 2 overlapping SFX; the hierarchy tick < pop < whoosh < riser < impact always holds.

## Format profiles
| Profile | Formats | Rule |
|---|---|---|
| calm | F1, F5, F8 (talking head, podcast, case study) | -3 dB vs default; skip CAP ticks except keywords; whooshes low-passed 6 kHz |
| energetic | F6, F7 (cold open, agency promo) | default levels; allow layered swish+thump; up to 2 SFX/s |
| faceless | F4, F2 cards (motion graphic) | default; every object entrance gets its sound; pops pitched to music key if possible |
| signature | F3, F9 (walking, curved typography) | -2 dB; prefer air/shimmer over clicks; impacts only on title slams |

## CAP — Caption & text events
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on first frame of the text animation

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| CAP-001 | Small connector word appears (C1/C2 tiny italic) | none, or ultra-soft tick only if nothing else plays in 0.5s | ui tick soft |
| CAP-002 | Keyword appears big (C1 top tier / C2 headline) | soft pop or tick, single | ui pop soft |
| CAP-003 | Keyword SLAM (scale overshoot, heavy caps) | short swish + low thump layered | swish punch |
| CAP-004 | Typed headline, per character (C2 E14 style) | soft typewriter/keyboard ticks, 1 per 2–3 chars, not every char | typewriter soft key |
| CAP-005 | Typed sentence on dark HUD (E03) | digital ticks + faint data chirps | digital typing hud |
| CAP-006 | Karaoke: word lights up (C4) | nothing per word; music carries it | - |
| CAP-007 | Karaoke: highlighted brand-colour word | tiny tick on that word only | ui tick |
| CAP-008 | Heavy italic caps line appears (C3) | punchy swish | swish fast |
| CAP-009 | Number word in yellow (C3) | bright tick + mini ding tail | ui ding small |
| CAP-010 | Negative word in red (C3: 'WRONG', 'NEVER', 'MISTAKE') | low dull thud or error buzz | error buzz soft |
| CAP-011 | Question line ('WHY?') | short rising whoosh into the word, stop on word | whoosh rise short |
| CAP-012 | Two-tier lockup builds (small + big) | tick on small, pop on big | ui tick + pop |
| CAP-013 | Keyword behind head (C6) emerges from behind | soft air swell | air whoosh soft |
| CAP-014 | Word on body path / rotated (C7) | quick swish following direction | swish pass |
| CAP-015 | Silhouette flash then text (H7) | camera flash pop + reverse hit | camera flash pop |
| CAP-016 | Highlight bar wipes behind word | marker swipe | marker swipe |
| CAP-017 | Underline / oval drawn around word | pen scribble short | pen scribble |
| CAP-018 | Strike-through on wrong word | pen scratch + error tick | pen scratch |
| CAP-019 | Hand-drawn arrow points at object | quick marker stroke | marker stroke |
| CAP-020 | Sticker/label pops ('FREE', 'NEW') | bubbly pop | pop bubbly |
| CAP-021 | Emoji 3D pops | cartoon boing small | cartoon pop |
| CAP-022 | Quote marks appear | paper tap | paper tap |
| CAP-023 | Text glitch in (RGB split) | digital glitch 0.15s | glitch short |
| CAP-024 | Text pixel-assemble | digital blip arpeggio | digital blip |
| CAP-025 | Text blur-in with glow (E03) | soft shimmer | shimmer soft |
| CAP-026 | Big title fills screen (F2 card) | deep whoosh + sub hit | whoosh hit |
| CAP-027 | Vertical word scrolls through frame (E05 REFERENCES) | long air pass | air pass long |
| CAP-028 | List bullet 1/2/3 lands | pops rising in pitch per item | pop ascending |
| CAP-029 | Numbered badge pops (① ② ③) | button click | button click |
| CAP-030 | Previous bullet dims as next lands | none | - |
| CAP-031 | Text clears on shot change | none (the transition sound covers it) | - |
| CAP-032 | Subtitle line replaces itself (running subtitle) | none | - |
| CAP-033 | Keyword in money colour (৳ / $) | coin tick | coin single |
| CAP-034 | Keyword 'FREE' | sparkle | sparkle short |
| CAP-035 | Keyword 'SECRET' | whisper swish / lock click | lock click |
| CAP-036 | Keyword 'FAST / QUICK' | zip | zip fast |
| CAP-037 | Keyword 'SLOW' | low stretched whoosh | slow whoosh |
| CAP-038 | Keyword 'STOP' | brake/record stop | tape stop |
| CAP-039 | Keyword 'BOOM / EXPLODE' | impact | impact |
| CAP-040 | Keyword 'LOVE / HEART' | soft heartbeat single | heartbeat single |
| CAP-041 | Keyword 'TRUST / SAFE' | soft chime | chime soft |
| CAP-042 | Keyword 'WIN / SUCCESS / BEST' | positive notification | success chime |
| CAP-043 | Keyword 'FAIL / LOSE' | descending tone | fail tone |
| CAP-044 | Keyword 'GROW / INCREASE' | rising pluck | rise pluck |
| CAP-045 | Keyword 'DROP / DECREASE' | falling tone | fall tone |
| CAP-046 | Keyword 'WORLD / GLOBAL / INTERNATIONAL' | airy pad swell | air swell |
| CAP-047 | Keyword 'PREMIUM / LUXURY' | glass ting | glass ting |
| CAP-048 | Keyword 'INNOVATIVE / IDEA' | light bulb click + ding | light switch ding |
| CAP-049 | Keyword 'AI' | digital chirp | digital chirp |
| CAP-050 | Keyword 'DOCTOR' / name title | soft page chime | page chime |
| CAP-051 | Name lower-third (Dr. Shadly) | soft swish + chime | lower third swish |
| CAP-052 | CTA 'Comment X' / 'DM me' | notification ping | notification ping |
| CAP-053 | CTA 'Follow' | button click + pop | button click |
| CAP-054 | Timer/countdown text ticks (H8) | clock tick each second | clock tick |
| CAP-055 | Big number counts up | tick train, speed follows count, end ding | counter ticks |
| CAP-056 | Percent bar fills | rising sweep | rise sweep |
| CAP-057 | Price tag appears | cash register small | cash register |
| CAP-058 | Date / year appears (1915, 2025) | typewriter clack | typewriter single |
| CAP-059 | Bangla keyword slam | same as English rules; never extra | - |
| CAP-060 | Caption on top of busy music drop | skip SFX, let drop speak | - |

## TRN — Transitions
Default level: SFX peak **-9 dB** relative to voice peak (each SFX peak-normalised first) · timing: peak of the sound on the cut frame; whoosh starts 0.15–0.3s before

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| TRN-001 | Hard cut, same location | none | - |
| TRN-002 | Hard cut, new location (F3/E16) | soft air whoosh into cut | air whoosh |
| TRN-003 | Whip pan / tilt with blur (T2) | fast whoosh matching direction | whip whoosh |
| TRN-004 | Light-leak / gradient flash (T3) | airy shimmer swell | flash shimmer |
| TRN-005 | White flash | camera flash / soft hit | flash hit |
| TRN-006 | Colour state change to B&W (T4) | low thump + filter-down | low thump |
| TRN-007 | Red mono emphasis (T4) | tension hit | tension hit |
| TRN-008 | Back to colour from B&W | reverse swell | reverse swell |
| TRN-009 | Pixel dissolve on object (T5) | digital blip arpeggio | digital blip |
| TRN-010 | Spotlight iris open/close (T6) | deep whoosh + low hum | iris whoosh |
| TRN-011 | Keyhole / door wipe | door creak short + whoosh | door whoosh |
| TRN-012 | Ink blot spread wipe | liquid swell | ink splash |
| TRN-013 | Continuous camera through world (T7) | one long soft wind, no per-object hits | wind long |
| TRN-014 | Zoom through object into next scene | rising whoosh, cut at peak | zoom whoosh |
| TRN-015 | Card shrink to corner (PiP) | swish small | swish small |
| TRN-016 | Page turn / paper slide | page flip | page flip |
| TRN-017 | Slide-in from edge with shadow (E04) | paper swish | paper swish |
| TRN-018 | Glitch transition | glitch burst | glitch burst |
| TRN-019 | Defocus flash (T8) | subtle air puff | air puff |
| TRN-020 | Palette inversion dark↔light (E13) | click + whoosh | invert click |
| TRN-021 | Smear / letter stretch transition (E07) | stretched whoosh | stretch whoosh |
| TRN-022 | Match cut on motion | none or continued motion sound | - |
| TRN-023 | Cut to black 'breath' scene | music drops out, room tone only | - |
| TRN-024 | Black to reveal | riser into impact | riser impact |
| TRN-025 | Section change (step 1→2) | whoosh + pop | whoosh pop |
| TRN-026 | Chapter change (new location / outfit) | music phrase change + air whoosh | air whoosh |
| TRN-027 | Intro to talking head after cold open (F6) | impact + sub | impact sub |
| TRN-028 | Return from explainer to face (F5) | reverse swell | reverse swell |
| TRN-029 | Split-screen opens | double swish | swish double |
| TRN-030 | Split-screen closes | single swish reverse | swish reverse |
| TRN-031 | Grid of cards folds | multiple soft clicks | click multi |
| TRN-032 | Phone-UI overlay slides on | phone swipe | phone swipe |
| TRN-033 | Before/after slider wipe | slider swish | slider |
| TRN-034 | Rewind effect | tape rewind | tape rewind |
| TRN-035 | Freeze frame | camera shutter + tape stop | freeze shutter |
| TRN-036 | Speed ramp up | rising whoosh | speed up whoosh |
| TRN-037 | Speed ramp down / slow-mo | deep slowed whoosh | slow mo |
| TRN-038 | Shake / impact zoom | impact | impact |
| TRN-039 | Fade to end card | music resolves, soft chime | end chime |
| TRN-040 | Loop back to start (seamless reel) | reverse whoosh into frame 1 | reverse whoosh |

## CAM — Camera moves & zooms
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: sound starts with the move, peak at the move's midpoint

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| CAM-001 | Punch-in 100→115% on sentence (T1) | none (most of the time) / very soft air | - |
| CAM-002 | Punch-in on punchline | soft thump | soft thump |
| CAM-003 | Focus zoom to detail (scalpel / screen) | soft wind (Shadly preference) | wind soft |
| CAM-004 | Slow push-in for emotion | low pad swell | pad swell |
| CAM-005 | Dolly back reveal | air swell reverse | air reveal |
| CAM-006 | Track down a website | soft scroll + air | scroll soft |
| CAM-007 | Lateral glide past cards | single long wind, no per-card hits | wind long |
| CAM-008 | Camera shake | rumble short | rumble |
| CAM-009 | Rack focus blur→sharp | soft shimmer | focus shimmer |
| CAM-010 | Orbit around 3D object | slow circular whoosh | orbit whoosh |
| CAM-011 | Drone top-down | wind high | wind high |
| CAM-012 | Tilt up to sky | air rise | air rise |
| CAM-013 | Crash zoom | whoosh hit | crash zoom |
| CAM-014 | Parallax drift (constant) | none | - |
| CAM-015 | Reframe to make room for text (E08) | none | - |
| CAM-016 | Zoom out to show grid of all work | swell + soft chime | swell chime |
| CAM-017 | Push into laptop screen | air whoosh + faint fan hum | laptop push |
| CAM-018 | Zoom into phone screen | whoosh + phone tap | phone zoom |
| CAM-019 | Handheld follow (walking) | none (natural ambience) | - |
| CAM-020 | Snap zoom on face (reaction) | comedic zip | zoom zip |

## UI — Web / app / screen
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual action frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| UI-001 | Mouse cursor moves | none | - |
| UI-002 | Mouse click | mouse click | mouse click |
| UI-003 | Double click | double click | double click |
| UI-004 | Button press on site | UI button click | ui button |
| UI-005 | Hover glow on button | tiny tick | ui hover |
| UI-006 | Page scroll | soft scroll wheel | scroll wheel |
| UI-007 | Fast scroll | scroll whoosh | scroll fast |
| UI-008 | Page load | subtle digital whoosh | page load |
| UI-009 | Loading spinner | soft loop blips | loading blip |
| UI-010 | Form field typing | keyboard typing light | keyboard typing |
| UI-011 | Form submit success | success chime | success |
| UI-012 | Error message | error buzz | error |
| UI-013 | Notification banner | notification | notification |
| UI-014 | Phone tap | phone tap | phone tap |
| UI-015 | Phone swipe | swipe | phone swipe |
| UI-016 | Phone unlock | unlock click | unlock |
| UI-017 | Message sent (WhatsApp) | message whoosh | message sent |
| UI-018 | Message received | message pop | message received |
| UI-019 | Like / heart tap | pop + sparkle | like pop |
| UI-020 | Comment appears | bubble pop | comment pop |
| UI-021 | Follower count rises | tick train + ding | counter ticks |
| UI-022 | Appointment booked | calendar ding | booking chime |
| UI-023 | Google search typed | typing + search click | search typing |
| UI-024 | Search results appear | soft whoosh | results whoosh |
| UI-025 | Google Maps pin drop | pin drop | pin drop |
| UI-026 | Star rating fills 1–5 | 5 ascending ticks | star rating |
| UI-027 | Review card appears | card pop | card pop |
| UI-028 | Website hero reveal | soft swell + click | hero reveal |
| UI-029 | Mobile view toggle | switch click | switch |
| UI-030 | Dark mode toggle | switch click + whoosh | toggle |
| UI-031 | Code being written | fast keyboard | keyboard fast |
| UI-032 | Code compiles / build success | success blip | build success |
| UI-033 | Website goes live | launch whoosh + chime | launch |
| UI-034 | Domain / URL typed | typing | typing |
| UI-035 | Admin panel edit saved | save click | save |
| UI-036 | Drag & drop | drag swish + drop tap | drag drop |
| UI-037 | Popup modal opens | pop | modal pop |
| UI-038 | Popup closes | reverse pop | modal close |
| UI-039 | Video play button | play click | play click |
| UI-040 | Screenshot taken | camera shutter | screenshot |
| UI-041 | Chat AI answer streams | soft digital typing | ai typing |
| UI-042 | AI generates image | magic shimmer | magic |
| UI-043 | Analytics chart rises | rising pluck | chart rise |
| UI-044 | Analytics chart falls | falling tone | chart fall |
| UI-045 | Laptop open | laptop open | laptop open |
| UI-046 | Laptop close | laptop close | laptop close |
| UI-047 | Phone vibrate | vibration | phone vibrate |
| UI-048 | Email sent | email whoosh | email sent |
| UI-049 | Instagram story swipe | swipe | swipe |
| UI-050 | Facebook ad shown | notification soft | notification |
| UI-051 | QR code scan | scanner beep | scan beep |
| UI-052 | Payment success (bKash/card) | payment success | payment success |
| UI-053 | Website speed test score | counter ticks + ding | score |
| UI-054 | SEO rank climbs | rising arpeggio | rank up |
| UI-055 | Broken old website shown | glitch + error | broken glitch |
| UI-056 | Website before → after | slider swish + chime | before after |
| UI-057 | Multiple websites grid | soft click per card (max 4) | grid click |
| UI-058 | Browser tab opens | tab pop | tab pop |

## MONEY — Money, business, numbers
Default level: SFX peak **-11 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| MONEY-001 | Taka notes appear | paper money rustle | money rustle |
| MONEY-002 | Coins fall | coins drop | coins drop |
| MONEY-003 | Single coin | coin ting | coin |
| MONEY-004 | Money rain | money shower | money rain |
| MONEY-005 | Cash register / sale | cash register | cash register |
| MONEY-006 | Wallet opens | zipper / leather | wallet |
| MONEY-007 | Money lost / wasted | coin falling down drain + low tone | money lose |
| MONEY-008 | Money saved | piggy bank coin + ding | piggy bank |
| MONEY-009 | Price drop | falling tone + tick | price drop |
| MONEY-010 | Profit rises | rising arpeggio | profit |
| MONEY-011 | Invoice / bill | paper + stamp | stamp |
| MONEY-012 | Contract signed | pen sign | pen sign |
| MONEY-013 | Handshake deal | soft clap/hand | handshake |
| MONEY-014 | Calculator | calculator keys | calculator |
| MONEY-015 | Bank transfer | digital whoosh + ding | transfer |
| MONEY-016 | Credit card swipe | card swipe | card swipe |
| MONEY-017 | Gold / premium | glass ting | ting |
| MONEY-018 | Discount % | pop + sparkle | discount |
| MONEY-019 | Expensive! | cash register + gasp-free sting | sting |
| MONEY-020 | Free! | sparkle | sparkle |
| MONEY-021 | Budget chart | pencil + tick | chart |
| MONEY-022 | Stock market down | falling synth | market down |
| MONEY-023 | Stock up | rising synth | market up |
| MONEY-024 | ROI / results reveal | drum hit + chime | reveal hit |
| MONEY-025 | Clients count up | tick train | counter |
| MONEY-026 | Package tiers ($550/$800) | card pop each | card pop |
| MONEY-027 | Add-on +$200 | plus pop | plus pop |
| MONEY-028 | Money flying away | wind + paper | paper wind |
| MONEY-029 | Bag of money drops | heavy thud | money bag |
| MONEY-030 | Hourly rate / time is money | clock tick + coin | clock coin |

## TIME — Time
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| TIME-001 | Clock appears | clock tick | clock tick |
| TIME-002 | Clock spins fast | fast ticking | fast clock |
| TIME-003 | Alarm 2AM | alarm short | alarm |
| TIME-004 | Calendar pages flip | page flips fast | calendar flip |
| TIME-005 | Hourglass | sand trickle | sand |
| TIME-006 | Deadline | tension tick + hit | deadline |
| TIME-007 | Years pass | time whoosh reverse | time pass |
| TIME-008 | Stopwatch start | stopwatch click | stopwatch |
| TIME-009 | Countdown 3-2-1 | beeps | countdown beep |
| TIME-010 | Late / missed | descending tone | missed |
| TIME-011 | Instant / seconds | zip | zip |
| TIME-012 | Waiting room | soft clock + room tone | waiting room |
| TIME-013 | Morning | birds light | birds |
| TIME-014 | Night | crickets light | crickets |
| TIME-015 | Weekend | light chime | chime |

## MED — Medical & clinic (doctor audience)
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame; keep realistic and gentle, never gory

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| MED-001 | Scalpel shown | metal glint (dagger shing, soft) | metal shing |
| MED-002 | Incision line drawn | fine slice | slice soft |
| MED-003 | Surgical instruments tray | metal clink | metal clink |
| MED-004 | Suture / stitch lands | soft tick per stitch | stitch tick |
| MED-005 | Heartbeat / ECG | heartbeat + monitor beep | ecg beep |
| MED-006 | Flatline (danger) | monitor flat tone (short, careful) | flatline |
| MED-007 | Stethoscope | soft heartbeat muffled | stethoscope |
| MED-008 | Syringe | syringe squirt soft | syringe |
| MED-009 | Pills | pill bottle rattle | pills |
| MED-010 | X-ray / scan | scanner hum | scanner |
| MED-011 | MRI | low mechanical hum | mri |
| MED-012 | Lab test tube | glass clink | test tube |
| MED-013 | Dental drill | short drill whir (very brief) | dental drill |
| MED-014 | Tooth sparkle (clean) | sparkle ting | tooth sparkle |
| MED-015 | Dental chair recline | hydraulic | chair hydraulic |
| MED-016 | Braces / aligner click | plastic click | plastic click |
| MED-017 | Eye / retina | soft whoosh + focus | eye focus |
| MED-018 | Brain | neural shimmer | neural |
| MED-019 | Bone / ortho | soft knock | bone knock |
| MED-020 | Ambulance | siren distant short | siren |
| MED-021 | Hospital corridor | room tone + footsteps | hospital ambience |
| MED-022 | Doctor's chamber door | door open | door |
| MED-023 | Patient waiting room | murmur soft | murmur |
| MED-024 | Prescription written | pen writing | pen write |
| MED-025 | Medical report printed | printer | printer |
| MED-026 | Hand wash / sanitizer | water/squirt | sanitizer |
| MED-027 | Gloves snap | glove snap | glove snap |
| MED-028 | Mask on | fabric rustle | fabric |
| MED-029 | Diagnosis reveal | soft chime | chime |
| MED-030 | Recovery / healthy | warm swell | warm swell |
| MED-031 | Pain / problem | low tension tone | tension |
| MED-032 | Medical certificate / degree | paper + stamp | stamp |
| MED-033 | Award / trophy | trophy ting + applause short | trophy |
| MED-034 | Appointment phone call | phone ring short | phone ring |
| MED-035 | Telemedicine call connects | video call connect | call connect |
| MED-036 | Health app notification | notification | notification |
| MED-037 | Microscope | focus click | microscope |
| MED-038 | Laparoscopy screen | monitor beep soft | monitor |
| MED-039 | Operation theatre lights on | light switch heavy + hum | ot light |
| MED-040 | Blood pressure cuff | pump squeeze | bp pump |
| MED-041 | Thermometer beep | beep | thermometer |
| MED-042 | Wheelchair | wheel roll | wheel |
| MED-043 | Baby / pediatric | soft rattle | rattle |
| MED-044 | Skin / derma | soft shimmer | shimmer |
| MED-045 | Heart (cardiology icon) | single heartbeat | heartbeat |

## TECH — Tech, AI, digital
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| TECH-001 | AI robot appears | robot chirp | robot chirp |
| TECH-002 | Neural network lines | data shimmer | data |
| TECH-003 | Chip / processor | electric zap soft | zap |
| TECH-004 | Server / cloud | server hum + whoosh | server |
| TECH-005 | Data flowing | digital stream | data stream |
| TECH-006 | Hologram UI | hologram shimmer | hologram |
| TECH-007 | Scan line | scanner sweep | scan |
| TECH-008 | Lock / security | lock click | lock |
| TECH-009 | Unlock | unlock | unlock |
| TECH-010 | Hack / glitch | glitch | glitch |
| TECH-011 | WiFi / signal | signal blips | signal |
| TECH-012 | Battery charge | charge rise | charge |
| TECH-013 | Power on | power up | power up |
| TECH-014 | Power off | power down | power down |
| TECH-015 | Camera recording (REC) | beep start | rec beep |
| TECH-016 | Microphone | mic tap | mic tap |
| TECH-017 | Headphones | soft click | click |
| TECH-018 | 3D printer | mechanical whir | printer 3d |
| TECH-019 | Satellite / globe digital | space swell | space |
| TECH-020 | Rocket launch (growth) | rocket whoosh | rocket |
| TECH-021 | Light bulb idea | bulb click + ding | bulb |
| TECH-022 | Gear / process | mechanical gear | gear |
| TECH-023 | Magnet | magnet hum | magnet |
| TECH-024 | Laser | laser zap | laser |
| TECH-025 | Pixel art | 8-bit blip | 8bit |
| TECH-026 | Game / level up | level up | level up |
| TECH-027 | Download | download whoosh | download |
| TECH-028 | Upload | upload rise | upload |
| TECH-029 | Sync | sync chime | sync |
| TECH-030 | Delete | trash crumple | trash |

## OBJ — Everyday objects & meaning
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| OBJ-001 | Book opens | book open | book |
| OBJ-002 | Pages flip | page flip | page |
| OBJ-003 | Pen writes | pen write | pen |
| OBJ-004 | Pencil sketch | pencil | pencil |
| OBJ-005 | Paper crumple (bad idea) | crumple | crumple |
| OBJ-006 | Paper tear | tear | paper tear |
| OBJ-007 | Sticky note | paper slap | sticky |
| OBJ-008 | Stamp approved | stamp | stamp |
| OBJ-009 | Envelope / letter | paper slide | envelope |
| OBJ-010 | Box / package | cardboard | box |
| OBJ-011 | Gift opened | ribbon + sparkle | gift |
| OBJ-012 | Key / unlock success | key jingle | keys |
| OBJ-013 | Door opens (opportunity) | door open | door |
| OBJ-014 | Door closes | door close | door close |
| OBJ-015 | Light switch | switch | switch |
| OBJ-016 | Candle | match strike | match |
| OBJ-017 | Fire (passion) | fire whoosh | fire |
| OBJ-018 | Water drop | drop | drop |
| OBJ-019 | Glass breaks (shock) | glass break short | glass break |
| OBJ-020 | Balloon pop | pop | balloon |
| OBJ-021 | Bell | bell | bell |
| OBJ-022 | Whistle | whistle | whistle |
| OBJ-023 | Magnifying glass (search) | zoom shimmer | magnify |
| OBJ-024 | Puzzle piece fits | click fit | puzzle |
| OBJ-025 | Lego / building blocks | plastic clicks | lego |
| OBJ-026 | Hammer / building | hammer | hammer |
| OBJ-027 | Brick wall (obstacle) | thud | thud |
| OBJ-028 | Ladder climb | steps | climb |
| OBJ-029 | Stairs / growth steps | ascending taps | steps up |
| OBJ-030 | Trophy | ting | trophy |
| OBJ-031 | Medal | medal clink | medal |
| OBJ-032 | Crown | regal shimmer | crown |
| OBJ-033 | Diamond | diamond sparkle | diamond |
| OBJ-034 | Globe spins | air whoosh | globe |
| OBJ-035 | Map pin | pin drop | pin |
| OBJ-036 | Compass | click | compass |
| OBJ-037 | Rocket | rocket | rocket |
| OBJ-038 | Car (speed) | car pass | car pass |
| OBJ-039 | Motorbike | engine rev short | engine |
| OBJ-040 | Running person | footsteps fast | running |
| OBJ-041 | Shoes lace up | lace | lace |
| OBJ-042 | Plane | plane pass | plane |
| OBJ-043 | Train | train pass | train |
| OBJ-044 | Fishing hook drops | hook plop | plop |
| OBJ-045 | Arrow hits target | arrow thunk | arrow |
| OBJ-046 | Dart | dart | dart |
| OBJ-047 | Chess move (strategy) | chess piece tap | chess |
| OBJ-048 | Dice | dice roll | dice |
| OBJ-049 | Camera photo | shutter | shutter |
| OBJ-050 | Polaroid print | polaroid eject | polaroid |
| OBJ-051 | Film reel | projector | projector |
| OBJ-052 | Mirror (self) | shimmer | shimmer |
| OBJ-053 | Umbrella (protection) | umbrella open | umbrella |
| OBJ-054 | Shield | metal block | shield |
| OBJ-055 | Parachute | fabric whoosh | parachute |
| OBJ-056 | Crutches (weakness) | wood knock | wood |
| OBJ-057 | Bubble | bubble | bubble |
| OBJ-058 | Spring / bounce | boing | boing |
| OBJ-059 | Brain thinking | soft neural | neural |
| OBJ-060 | Eye blink | blink tick | blink |
| OBJ-061 | Ear / listen | air muffle | muffle |
| OBJ-062 | Megaphone (announce) | megaphone | megaphone |
| OBJ-063 | Loudspeaker | mic feedback very short | feedback |
| OBJ-064 | Microphone podcast | mic tap | mic |
| OBJ-065 | Coffee cup | cup clink + pour | coffee |
| OBJ-066 | Tea Bangla cha | pour + clink | tea |

## NAT — Nature, ambience, emotion
Default level: SFX peak **-16 dB** relative to voice peak (each SFX peak-normalised first) · timing: bed under the scene, fade in 0.3s

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| NAT-001 | Sunrise / new start | birds + warm pad | morning birds |
| NAT-002 | Rain (sad/calm) | rain soft | rain |
| NAT-003 | Thunder (problem) | thunder distant | thunder |
| NAT-004 | Wind (change) | wind | wind |
| NAT-005 | Ocean / calm | waves | waves |
| NAT-006 | Forest | forest ambience | forest |
| NAT-007 | City busy | city ambience | city |
| NAT-008 | Dhaka traffic | traffic horns soft | traffic |
| NAT-009 | Crowd / audience | crowd murmur | crowd |
| NAT-010 | Applause (achievement) | applause short | applause |
| NAT-011 | Laugh (light humour) | light laugh | laugh |
| NAT-012 | Gasp-worthy moment | orchestral sting short | sting |
| NAT-013 | Suspense | low drone | drone |
| NAT-014 | Calm / trust | soft pad | pad |
| NAT-015 | Victory | rising brass short | victory |
| NAT-016 | Mistake / oops | comedic boing | oops |
| NAT-017 | Shock | impact + reverse | shock |
| NAT-018 | Sad | low piano note | piano low |
| NAT-019 | Happy | pluck melody short | happy pluck |
| NAT-020 | Curiosity | music box tick | curious |

## PEOPLE — People & actions
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the action frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| PEOPLE-001 | Footsteps walking in | footsteps | footsteps |
| PEOPLE-002 | Sit down | chair | chair |
| PEOPLE-003 | Clap | single clap | clap |
| PEOPLE-004 | Snap fingers (instant) | snap | snap |
| PEOPLE-005 | Thumbs up | pop | pop |
| PEOPLE-006 | Point at screen | tick | tick |
| PEOPLE-007 | Hand wave | air swish | swish |
| PEOPLE-008 | High five | slap | high five |
| PEOPLE-009 | Phone pick up | pick up | phone pick |
| PEOPLE-010 | Typing on laptop | keyboard | keyboard |
| PEOPLE-011 | Writing notes | pen | pen |
| PEOPLE-012 | Heartbeat nervous | heartbeat | heartbeat |
| PEOPLE-013 | Breath / relief | exhale (non-vocal synth) | breath |
| PEOPLE-014 | Doorbell / visitor | doorbell | doorbell |
| PEOPLE-015 | Patient smiling | warm chime | chime |
| PEOPLE-016 | Team working | office ambience | office |
| PEOPLE-017 | Meeting | room tone + paper | meeting |
| PEOPLE-018 | Video call | call connect | call |
| PEOPLE-019 | Presenting on stage | applause soft | applause |
| PEOPLE-020 | Lecture / classroom | chalk | chalk |
| PEOPLE-021 | Student learning | page flip | page |
| PEOPLE-022 | Hand holds object (palm prop H9) | soft pop | pop |
| PEOPLE-023 | Hand pinches tiny person (E14) | cartoon pinch squeak (subtle) | squeak |
| PEOPLE-024 | Falling person | falling whoosh | fall whoosh |
| PEOPLE-025 | Jump | jump whoosh | jump |

## MUSIC — Music structure & mix decisions
Default level: SFX peak **0 dB** relative to voice peak (each SFX peak-normalised first) · timing: music edit points

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| MUSIC-001 | First frame | music already playing (no fade-in from silence) | - |
| MUSIC-002 | Hook ends (3s) | music phrase / drum fill lands | - |
| MUSIC-003 | Key claim line | music drops out 0.5–1.5s (one per video) | - |
| MUSIC-004 | After the drop | beat returns with impact | impact |
| MUSIC-005 | Voice speaking | music ducked −10 to −14 dB via sidechain | - |
| MUSIC-006 | No voice gap > 0.5s | music rises back | - |
| MUSIC-007 | Ending CTA | music resolves on last bar, short tail | - |
| MUSIC-008 | Clip with its own dialogue (ending clip) | music −6 dB more, clip normalised | - |
| MUSIC-009 | Talking-head premium (F1/F8) | lo-fi / soft piano bed | lofi |
| MUSIC-010 | Energetic promo (F6/F7) | trap/808 ~100–120 BPM | trap |
| MUSIC-011 | Faceless education (F4) | minimal electronic ~120 BPM | minimal electronic |
| MUSIC-012 | Emotional story | piano + strings | piano |
| MUSIC-013 | Podcast reel (F5) | ambient pad, very low | ambient |
| MUSIC-014 | Signature typography (F9) | dark cinematic pulse | cinematic pulse |
| MUSIC-015 | Cuts on beat | allowed for montage only (portfolio grid); SFX still on visuals | - |
| MUSIC-016 | SFX bus | high-pass 150 Hz, low-pass 9 kHz, shared short reverb | - |
| MUSIC-017 | Loudness | final −14 LUFS, true peak ≤ −1.5 dB | - |
| MUSIC-018 | Too many SFX in 1s | keep max 2 overlapping; drop the lower-priority one | - |
| MUSIC-019 | Bangla voice sibilance | de-esser before mix | - |
| MUSIC-020 | Room noise | afftdn gentle; never change voice character | - |

## GFX — Graphic primitives & motion design
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the animation frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| GFX-001 | Line draws on (SVG stroke) | pen stroke / thin swish | line draw |
| GFX-002 | Curved line / bezier draws (E03) | long thin whoosh | line whoosh |
| GFX-003 | Circle draws around object | marker circle | marker circle |
| GFX-004 | Check mark appears | positive tick | check |
| GFX-005 | Cross mark appears | error tick | cross |
| GFX-006 | Plus sign appears | pop | plus |
| GFX-007 | Minus sign appears | low tick | minus |
| GFX-008 | Equals / result | chime | result |
| GFX-009 | Arrow grows | stretch swish | arrow grow |
| GFX-010 | Dots pop in arc (E06 1-7) | ascending pops | dots pop |
| GFX-011 | Grid lines appear | soft digital sweep | grid |
| GFX-012 | Ruler / HUD ticks | tiny ticks | hud ticks |
| GFX-013 | Orbit ellipse draws | airy circle whoosh | orbit |
| GFX-014 | Concentric rings pulse | sonar ping | sonar |
| GFX-015 | Ring pulse behind object (POUNDED) | soft impact + ring | ring impact |
| GFX-016 | Glow flash on element | shimmer | glow |
| GFX-017 | Particles burst | sparkle burst | particles |
| GFX-018 | Dust/particle text assembly (E10) | granular shimmer | granular |
| GFX-019 | Confetti | confetti pop | confetti |
| GFX-020 | Sparks from word (E15) | spark crackle | sparks |
| GFX-021 | Brush stroke under word | brush swish | brush |
| GFX-022 | Torn paper collage piece | paper tear | tear |
| GFX-023 | Polaroid drops in | paper flap | polaroid |
| GFX-024 | Push-pin card flies in (E12) | card whoosh + pin tap | pin tap |
| GFX-025 | Card flips | card flip | card flip |
| GFX-026 | Card stack fans out | card riffle | riffle |
| GFX-027 | Glass HUD panel slides | glass swish | glass |
| GFX-028 | 3D icon tile floats in | soft whoosh | float |
| GFX-029 | Object falls and lands | fall whoosh + soft land | fall land |
| GFX-030 | Object bounces | boing soft | boing |
| GFX-031 | Object swings on rope (E04) | rope creak | rope |
| GFX-032 | Object rotates | rotation whoosh | rotate |
| GFX-033 | Object scales up big | swell | swell |
| GFX-034 | Object shrinks away | reverse swell | shrink |
| GFX-035 | Object slides off screen | swish out | swish out |
| GFX-036 | Object replaces letter (E08) | pop | pop |
| GFX-037 | Duotone object pixel-assembles | digital blip | digital blip |
| GFX-038 | Spotlight turns on | stage light clunk | spotlight |
| GFX-039 | Curtain / reveal | curtain swish | curtain |
| GFX-040 | Shape morph | liquid morph | morph |
| GFX-041 | Liquid fill in text (E07) | water swell | water |
| GFX-042 | Gradient background shift | none | - |
| GFX-043 | Doodle squiggle wiggles | none (too busy) | - |
| GFX-044 | Speed lines stamp (E11 SECRET) | zip stamp | stamp zip |
| GFX-045 | Shock lines !!! (E15) | cartoon alert | alert |
| GFX-046 | AI orb pulses (E07) | airy tonal hum | orb |
| GFX-047 | Audio wave strip reacts | none (visual of voice) | - |
| GFX-048 | Countdown ring (E06) | tick per second | tick |
| GFX-049 | Progress underline fills (E11) | rise sweep | progress |
| GFX-050 | Map card floats (E16) | soft pop | pop |

## DATA — Charts & data
Default level: SFX peak **-13 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the data event

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| DATA-001 | Bar grows | rising tone per bar | bar rise |
| DATA-002 | Bars grow in sequence | ascending plucks | plucks |
| DATA-003 | Line chart draws upward | rising sweep | rise |
| DATA-004 | Line chart crashes (E13) | falling zig-zag tone | fall |
| DATA-005 | Pie slices pop | pop per slice | pop |
| DATA-006 | Percentage counts | tick train | ticks |
| DATA-007 | Before vs after numbers | low tone then bright ding | before after |
| DATA-008 | Stat card appears | card pop | card |
| DATA-009 | Big statistic reveal | hit + shimmer | stat hit |
| DATA-010 | Source citation / article card (E09) | paper slide + tick | article |
| DATA-011 | Table rows fill | soft ticks | ticks |
| DATA-012 | Comparison VS | versus hit | versus |
| DATA-013 | Ranking #1 to #5 (E13) | pop per number | rank pop |
| DATA-014 | Survey result | chime | chime |
| DATA-015 | Google rating 4.9 | star ticks + ding | stars |

## DENT — Dental & doctor-website niche (Benzadid)
Default level: SFX peak **-12 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| DENT-001 | Tooth icon appears | tooth ting | tooth ting |
| DENT-002 | Smile reveal | sparkle | sparkle |
| DENT-003 | Dental implant screw | ratchet click soft | ratchet |
| DENT-004 | Root canal file | fine metallic | metal fine |
| DENT-005 | Whitening before/after | sparkle sweep | sparkle sweep |
| DENT-006 | Dental X-ray (OPG) | scanner sweep | scanner |
| DENT-007 | Intraoral scanner | electronic beep | beep |
| DENT-008 | Autoclave | steam hiss short | steam |
| DENT-009 | RVG sensor | click + beep | beep |
| DENT-010 | Chamber signboard | neon buzz / light on | neon |
| DENT-011 | Doctor's website hero | soft swell + click | hero |
| DENT-012 | Doctor profile photo | camera shutter soft | shutter |
| DENT-013 | Degrees and credentials list | paper + ticks | credentials |
| DENT-014 | Patient testimonial card | card pop + warm chime | testimonial |
| DENT-015 | Book appointment button | button click + success | booking |
| DENT-016 | WhatsApp chat button | message pop | whatsapp |
| DENT-017 | Google Business profile | pin + ding | gbp |
| DENT-018 | Clinic location map | pin drop | pin |
| DENT-019 | Services carousel | soft swipe per slide | carousel |
| DENT-020 | Before website: outdated | glitch + dusty | old |
| DENT-021 | After website: modern | shimmer + chime | modern |
| DENT-022 | Bilingual toggle EN/BN | switch click | switch |
| DENT-023 | Admin panel login | lock unlock | unlock |
| DENT-024 | Blog post published | publish whoosh | publish |
| DENT-025 | Video library on site | play click | play |
| DENT-026 | Symptom checker | digital tick | tick |
| DENT-027 | Online payment | payment success | payment |
| DENT-028 | Mobile responsive demo (phone rotates) | rotate whoosh | rotate |
| DENT-029 | Speed score 100 | ticks + ding | score |
| DENT-030 | Patients finding doctor on Google | search typing + results | search |
| DENT-031 | Competitor clinic | neutral tick | tick |
| DENT-032 | Doctor's specialty icon (eye/heart/bone) | matching medical sound | medical |
| DENT-033 | Portfolio card (Sikdar/ClientB/ClientD/Client-A) | soft click per card | click |
| DENT-034 | Benzadid logo | brand sting soft | logo sting |
| DENT-035 | Price/package card | card pop | card |

## SOCIAL — Social media & marketing
Default level: SFX peak **-13 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| SOCIAL-001 | Reel play | play click | play |
| SOCIAL-002 | Views counter | tick train | ticks |
| SOCIAL-003 | Viral / explode | whoosh + impact | viral |
| SOCIAL-004 | Algorithm | digital chirp | chirp |
| SOCIAL-005 | Followers grow | rising arpeggio | grow |
| SOCIAL-006 | Comment section | multiple pops | pops |
| SOCIAL-007 | Share button | whoosh | share |
| SOCIAL-008 | Save bookmark | click | save |
| SOCIAL-009 | DM inbox | message pings | pings |
| SOCIAL-010 | Story ring | tap | tap |
| SOCIAL-011 | Live badge | beep | live |
| SOCIAL-012 | Hashtag | tick | tick |
| SOCIAL-013 | Ad campaign launch | launch | launch |
| SOCIAL-014 | Boost post | rise | rise |
| SOCIAL-015 | Engagement chart | rise | rise |
| SOCIAL-016 | Unfollow / drop | fall | fall |
| SOCIAL-017 | Trending | fire whoosh | fire |

## EDU — Education & explanation devices
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| EDU-001 | Step 1 / 2 / 3 title | whoosh + numbered pop | step |
| EDU-002 | Tip / pro tip label | ding small | tip |
| EDU-003 | Mistake #N | error tick + low thud | mistake |
| EDU-004 | Myth vs fact | buzzer then ding | myth fact |
| EDU-005 | Correct answer | ding | correct |
| EDU-006 | Wrong answer | buzzer soft | wrong |
| EDU-007 | Definition card | page chime | definition |
| EDU-008 | Quote from expert | paper + soft chime | quote |
| EDU-009 | Example box | card pop | card |
| EDU-010 | Summary checklist | tick per item | checklist |
| EDU-011 | Warning sign | alert tone soft | warning |
| EDU-012 | Did you know? | curious music box | curious |
| EDU-013 | Formula E=mc2 (E14) | 8-bit blip + fire whoosh | 8bit fire |
| EDU-014 | Diagram labels pop | tiny ticks | ticks |
| EDU-015 | Zoom into diagram part | soft wind | wind |

## BD — Bangladesh / local context
Default level: SFX peak **-14 dB** relative to voice peak (each SFX peak-normalised first) · timing: on the visual frame

| ID | Trigger / scenario | Sound | Library query |
|---|---|---|---|
| BD-001 | Dhaka skyline | city ambience light | city |
| BD-002 | Rickshaw | rickshaw bell | rickshaw bell |
| BD-003 | Bus / traffic jam | horns distant | horns |
| BD-004 | Chamber at night | crickets + tube light hum | night |
| BD-005 | Rain monsoon | rain | rain |
| BD-006 | Tea stall | cup clink | tea |
| BD-007 | bKash payment | payment success | payment |
| BD-008 | Taka coins | coin | coin |
| BD-009 | Prayer time context | avoid religious audio; use soft ambience | - |
| BD-010 | Village / rural patient | birds + wind | rural |
| BD-011 | Hospital crowd BD | murmur | murmur |
| BD-012 | Pharmacy | pill rattle | pills |
| BD-013 | Mobile phone in hand | tap | tap |
| BD-014 | Facebook page (BD clinics) | notification | notification |
