import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadTiro} from '@remotion/google-fonts/TiroBangla';
import {loadFont as loadPlay} from '@remotion/google-fonts/PlayfairDisplay';
import {Backdrop, BG, INK, TEAL} from './P2';
import plan from './p2plan_v2.json';

// v2 of the General Surgeon reel. Same scenes/motion as v1 (P2Final) with:
//  - all subtitles centred in the 4:5-safe band (top 400 / bottom 420 px are bleed)
//  - mask-reveal word animation + teal marker sweep on keywords (sounds unchanged)
//  - portfolio showcase (Sikdar / ClientB / ClientD / Client-A) on the bullet words
//  - louder BGM with voice ducking

const {fontFamily: ANEK} = loadAnek('normal', {weights: ['700', '800'], subsets: ['bengali', 'latin']});
const {fontFamily: TIRO} = loadTiro('italic', {weights: ['400'], subsets: ['bengali', 'latin']});
const {fontFamily: PLAY} = loadPlay('italic', {weights: ['400', '700'], subsets: ['latin']});

const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (f: number, d = 12, s = 170) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
const P = (f: string) => staticFile('p2/' + f);

type Word = {t: number; w: string; st: string; p: string};
type Scene = {id: string; s: number; e: number; tr: string; words: Word[]};
const scenes = plan.scenes as Scene[];
const OVERLAP = 0.3;
const SAFE_TOP = 760; // centred subtitle band 760–1160
const SAFE_H = 400;

// ---------------- centred subtitles: mask-reveal + teal marker on keywords ----------------
const styleOf = (st: string, size: number): React.CSSProperties => {
	if (st === 'i') return {fontFamily: TIRO, fontStyle: 'italic', fontSize: size * 0.56, color: INK};
	if (st === 'l') return {fontFamily: PLAY, fontStyle: 'italic', fontWeight: 400, fontSize: size * 0.95, color: INK};
	if (st === 'bullet') return {fontFamily: PLAY, fontStyle: 'italic', fontWeight: 700, fontSize: size * 0.9, color: TEAL};
	if (st === 't') return {fontFamily: ANEK, fontWeight: 800, fontSize: size, color: TEAL, letterSpacing: -2};
	return {fontFamily: ANEK, fontWeight: 800, fontSize: size, color: INK, letterSpacing: -2};
};
const KEY = new Set(['b', 't', 'bullet']);
const MaskWord: React.FC<{w: Word; lf: number; size: number; color?: string}> = ({w, lf, size, color}) => {
	const s = interpolate(lf, [0, 7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const mark = interpolate(lf, [5, 13], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	const base = styleOf(w.st, size);
	const c = color && w.st !== 't' && w.st !== 'bullet' ? color : base.color;
	return (
		<span style={{position: 'relative', display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08, lineHeight: 1.12, verticalAlign: 'bottom'}}>
			{KEY.has(w.st) ? <span style={{position: 'absolute', left: 0, bottom: size * 0.1, height: size * 0.16, width: `${mark * 100}%`, background: color ? 'rgba(15,124,110,0.55)' : 'rgba(15,124,110,0.18)', borderRadius: 4}} /> : null}
			<span style={{...base, color: c, position: 'relative', display: 'inline-block', transform: `translateY(${(1 - s) * 105}%)`}}>{w.w}</span>
		</span>
	);
};
const Phrase: React.FC<{sc: Scene; f: number; size?: number; color?: string; filter?: (w: Word) => boolean}> = ({sc, f, size = 120, color, filter}) => {
	const now = sc.s + f / FPS;
	const ws = sc.words.filter((w) => w.st !== 'type' && (!filter || filter(w)));
	const started = ws.filter((w) => w.t <= now + 0.02);
	if (!started.length) return null;
	const cur = started[started.length - 1].p;
	const group = ws.filter((w) => w.p === cur);
	const next = sc.words.find((w) => w.t > group[0].t && w.p !== cur && (!filter || filter(w)));
	const out = next ? interpolate(now, [next.t - 0.1, next.t], [1, 0], clamp) : 1;
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'center', columnGap: size * 0.22, textAlign: 'center', opacity: out}}>
			{group.map((w, i) => {
				const lf = fr(now - w.t);
				return lf < 0 ? null : <MaskWord key={i} w={w} lf={lf} size={size} color={color} />;
			})}
		</div>
	);
};
// glass panel that holds the subtitle, always centred in the safe band
const Center: React.FC<{children: React.ReactNode; dark?: boolean; top?: number; h?: number}> = ({children, dark, top = SAFE_TOP, h = SAFE_H}) => (
	<div style={{position: 'absolute', left: 40, right: 40, top, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
		<div style={{maxWidth: 1000, padding: '18px 40px 22px', borderRadius: 36, background: dark ? 'rgba(14,15,17,0.45)' : 'rgba(247,248,247,0.80)', backdropFilter: 'blur(16px)', boxShadow: dark ? 'none' : '0 20px 50px rgba(14,15,17,0.10)', border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.7)'}}>
			{children}
		</div>
	</div>
);
const wordAt = (sc: Scene, txt: string) => sc.words.find((w) => w.w === txt)!.t - sc.s;
const Ghost: React.FC<{t: string; f: number; y: number; size?: number}> = ({t, f, y, size = 330}) => (
	<div style={{position: 'absolute', top: y, left: -60 - f * 1.2, whiteSpace: 'nowrap', fontFamily: ANEK, fontWeight: 800, fontSize: size, color: 'rgba(14,15,17,0.05)', letterSpacing: -10}}>{t}</div>
);

// ================= scenes (v1 visuals, re-composed around the centred subtitle) =================
const Surgeon: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const inn = pop(f, 15, 90);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="SURGEON" f={f} y={90} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 400, height: 1900, transform: `translateY(${(1 - inn) * 260}px) scale(${interpolate(f, [0, 60], [1, 1.05]) * (0.9 + 0.1 * inn)})`, transformOrigin: '50% 30%', opacity: Math.min(1, inn * 1.6), filter: 'drop-shadow(0 40px 60px rgba(14,15,17,0.18))'}} />
			<Center>
				<Phrase sc={sc} f={f} size={190} />
			</Center>
		</AbsoluteFill>
	);
};

const Scalpel: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const z = interpolate(f, [0, 16], [1, 2.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const line = interpolate(f, [18, 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t="SCALPEL" f={f} y={1580} size={300} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 400, height: 1900, transform: `translate(${interpolate(f, [0, 16], [0, -110], clamp)}px, ${interpolate(f, [0, 16], [0, -120], clamp)}px) scale(${z + interpolate(f, [16, 90], [0, 0.1], clamp)})`, transformOrigin: '62% 58%', filter: `blur(${interpolate(f, [3, 9, 16], [0, 7, 0], clamp)}px)`}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 600 1300 L 820 600 L 1010 600" stroke={TEAL} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
				<circle cx={600} cy={1300} r={14 * line} fill={TEAL} />
			</svg>
			<div style={{position: 'absolute', right: 50, top: 470, background: 'rgba(255,255,255,0.94)', borderRadius: 22, padding: '6px 26px', boxShadow: '0 16px 40px rgba(14,15,17,0.18)', opacity: interpolate(f, [24, 30], [0, 1], clamp), transform: `scale(${0.8 + 0.2 * pop(f - 24)})`}}>
				<span style={{fontFamily: ANEK, fontWeight: 800, fontSize: 104, color: TEAL, letterSpacing: -2}}>SCALPEL</span>
			</div>
			<Center>
				<Phrase sc={sc} f={f} size={140} />
			</Center>
		</AbsoluteFill>
	);
};

const Incision: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const cut = interpolate(f, [24, 50], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: BG}} />
			<AbsoluteFill style={{transform: `scale(${interpolate(f, [0, 90], [1.25, 1.36])})`, transformOrigin: '40% 55%'}}>
				<OffthreadVideo src={P('incision.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.06) contrast(1.02) saturate(0.95)'}} />
			</AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 140 1250 C 360 1232, 620 1262, 900 1240" stroke={TEAL} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cut} style={{filter: `drop-shadow(0 0 10px ${TEAL})`}} />
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(14,15,17,0.10) 100%)'}} />
			<Center top={700} h={360}>
				<Phrase sc={sc} f={f} size={150} />
			</Center>
		</AbsoluteFill>
	);
};

const LAYERS = [
	{bn: 'চামড়া', c: '#E9C7AE'},
	{bn: 'চর্বি', c: '#F2DE9E'},
	{bn: 'মাংসপেশি', c: '#B9504B'},
];
const Layers: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const open = fr(wordAt(sc, 'Layer'));
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="LAYERS" f={f} y={80} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 1200, perspective: 1600, transform: `scale(${interpolate(f, [0, 110], [1, 1.08])})`}}>
				{LAYERS.map((l, i) => {
					const s = pop(f - 6 - i * 8, 13, 150);
					const gap = interpolate(f, [open, open + 24], [0, 1], clamp) * 210;
					return (
						<div key={i} style={{position: 'absolute', left: 140, width: 800, height: 260, top: 40 + i * (190 + gap), transform: `rotateX(58deg) rotateZ(-38deg) translateY(${(1 - s) * -300}px)`, opacity: s}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(135deg, ${l.c}, ${l.c}cc)`, boxShadow: '0 50px 70px rgba(14,15,17,0.18), inset 0 2px 0 rgba(255,255,255,0.6)'}} />
						</div>
					);
				})}
				{LAYERS.map((l, i) => {
					const s = pop(f - open - 4 - i * 5, 14, 160);
					const gap = interpolate(f, [open, open + 24], [0, 1], clamp) * 210;
					return (
						<div key={'l' + i} style={{position: 'absolute', right: 60, top: 70 + i * (190 + gap), opacity: s, transform: `translateX(${(1 - s) * 60}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
							<div style={{width: 90, height: 3, background: TEAL}} />
							<div style={{fontFamily: ANEK, fontWeight: 700, fontSize: 48, color: TEAL}}>{l.bn}</div>
						</div>
					);
				})}
			</div>
			<Center>
				<Phrase sc={sc} f={f} size={140} />
			</Center>
		</AbsoluteFill>
	);
};

const Stitch: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const sut = fr(wordAt(sc, 'Suturing'));
	const glow = interpolate(f, [8, 50], [-0.2, 1.2], clamp);
	const N = 9;
	const Y = 1330; // incision line sits just under the subtitle band
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t={f < sut ? 'PRECISION' : 'STITCH'} f={f} y={120} />
			<div style={{position: 'absolute', left: -40, right: -40, top: Y - 250, height: 520, borderRadius: 60, background: 'linear-gradient(180deg,#F0D2BE,#E3B89C)', boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.08), 0 30px 60px rgba(14,15,17,0.12)', transform: `scale(${interpolate(f, [0, 240], [1, 1.06])})`}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<linearGradient id="sweep2" x1="0" x2="1">
						<stop offset={Math.max(0, glow - 0.15)} stopColor="#9B3B36" />
						<stop offset={Math.min(1, Math.max(0, glow))} stopColor="#FFFFFF" />
						<stop offset={Math.min(1, glow + 0.15)} stopColor="#9B3B36" />
					</linearGradient>
				</defs>
				<path d={`M 60 ${Y} C 300 ${Y - 15}, 700 ${Y + 15}, 1020 ${Y - 5}`} stroke="url(#sweep2)" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f, [0, 14], [0, 1], clamp)} />
				{Array.from({length: N}, (_, i) => {
					const x = 120 + i * 105;
					const d = interpolate(f, [sut + 10 + i * 5, sut + 16 + i * 5], [0, 1], clamp);
					return <path key={i} d={`M ${x - 34} ${Y - 80} Q ${x} ${Y} ${x + 34} ${Y + 80}`} stroke={TEAL} fill="none" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />;
				})}
				<circle cx={1000} cy={Y} r={22 * pop(f - sut - 10 - N * 5, 8, 260)} fill={TEAL} />
			</svg>
			<Center top={640} h={380}>
				<Phrase sc={sc} f={f} size={130} />
			</Center>
		</AbsoluteFill>
	);
};

const Art: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const a = fr(wordAt(sc, 'Surgical'));
	const draw = interpolate(f, [a, a + 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', right: -380, top: 240, height: 1900, opacity: 0.16, filter: 'grayscale(1)', transform: `scale(${interpolate(f, [0, 130], [1.05, 1.15])})`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center'}}>
				<div style={{overflow: 'hidden', height: 230}}><div style={{fontFamily: PLAY, fontStyle: 'italic', fontSize: 220, color: INK, lineHeight: 1.0, transform: `translateY(${(1 - interpolate(f - a, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)})) * 105}%)`}}>Surgical</div></div>
				<div style={{overflow: 'hidden', height: 290}}><div style={{fontFamily: PLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 280, color: TEAL, lineHeight: 1.0, transform: `translateY(${(1 - interpolate(f - a - 6, [0, 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)})) * 105}%)`}}>Art</div></div>
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 120 1210 C 320 1130, 520 1290, 720 1210 S 960 1150, 980 1180" stroke={TEAL} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
			</svg>
			<Center top={1230} h={220}>
				<Phrase sc={sc} f={f} size={120} filter={(w) => w.w !== 'Surgical' && w.w !== 'Art'} />
			</Center>
		</AbsoluteFill>
	);
};

const Browser: React.FC<{src: string; from: number; rate?: number; h?: number; url?: string}> = ({src, from, rate = 1, h = 640, url = 'drclientd.com'}) => (
	<div style={{borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 120px rgba(14,15,17,0.22)', border: '1px solid rgba(14,15,17,0.08)'}}>
		<div style={{height: 46, background: '#EEF1F0', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20}}>
			{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
			<div style={{marginLeft: 20, height: 24, flex: 1, marginRight: 30, borderRadius: 12, background: '#fff', fontFamily: 'Arial', fontSize: 15, color: '#888', display: 'flex', alignItems: 'center', paddingLeft: 14}}>{url}</div>
		</div>
		<div style={{height: h, position: 'relative', overflow: 'hidden'}}>
			<OffthreadVideo src={P(src)} muted startFrom={fr(from)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</div>
	</div>
);

const Hero: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const s = pop(f, 15, 110);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="HERO" f={f} y={1500} size={420} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 330, transform: `translateY(${(1 - s) * 500 + Math.sin(f / 22) * 8}px) rotateX(${(1 - s) * 18}deg) scale(1.06)`, transformOrigin: '50% 100%'}}>
				<Browser src="site_surgeon.mp4" from={0} rate={0.3} h={700} />
			</div>
			<Center top={880} h={400}>
				<Phrase sc={sc} f={f} size={140} />
			</Center>
		</AbsoluteFill>
	);
};

const Scroll: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const tw = sc.words.find((w) => w.st === 'type')!;
	const twf = fr(tw.t - sc.s);
	const chars = Array.from(tw.w);
	const shown = Math.max(0, Math.min(chars.length, Math.floor((f - twf) / (0.055 * FPS)) + 1));
	const typing = f >= twf && f < twf + fr(2.2);
	const wheel = (f * 6) % 40;
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 330, transform: `scale(1.06) translateY(${Math.sin(f / 22) * 8}px)`}}>
				<Browser src="site_surgeon.mp4" from={6} h={700} />
			</div>
			<div style={{position: 'absolute', right: 90, top: 1330, width: 70, height: 116, borderRadius: 36, border: `5px solid ${INK}`, opacity: 0.85}}>
				<div style={{position: 'absolute', left: 28, top: 18 + wheel * 0.8, width: 10, height: 24, borderRadius: 5, background: TEAL}} />
			</div>
			<Center top={880} h={400}>
				{typing ? (
					<div style={{fontFamily: ANEK, fontWeight: 800, fontSize: 130, color: TEAL, letterSpacing: -2, whiteSpace: 'nowrap'}}>
						{chars.slice(0, shown).join('')}
						<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: INK}}>|</span>
					</div>
				) : (
					<Phrase sc={sc} f={f} size={130} />
				)}
			</Center>
		</AbsoluteFill>
	);
};

const Shadly: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const iris = interpolate(f, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const up = pop(f - 6, 15, 110);
	return (
		<AbsoluteFill>
			<Backdrop f={f} dark />
			<div style={{position: 'absolute', left: 540 - 520 * iris, top: 640 - 520 * iris, width: 1040 * iris, height: 1040 * iris, borderRadius: '50%', background: 'radial-gradient(circle, #FFFFFF 0%, #F2F4F3 45%, rgba(242,244,243,0) 70%)'}} />
			<Img src={P('shadly.png')} style={{position: 'absolute', left: 30, top: 380, width: 1020, transform: `translateY(${(1 - up) * 200}px) scale(${interpolate(f, [0, 130], [1.0, 1.06])})`, opacity: up, filter: 'saturate(0.55) contrast(1.05) drop-shadow(0 30px 50px rgba(0,0,0,0.5))'}} />
			<Center dark top={940} h={400}>
				<Phrase sc={sc} f={f} size={140} color="#FFFFFF" />
				<div style={{textAlign: 'center', fontFamily: PLAY, fontStyle: 'italic', fontSize: 38, color: '#CFE7E2', marginTop: 8, opacity: pop(f - 24)}}>Ex-Dental Surgeon · AI Generalist</div>
			</Center>
		</AbsoluteFill>
	);
};

// ---------------- portfolio showcase: phone, then one live website per bullet word ----------------
const CARDS = [
	{src: 'card_sikdar.mp4', from: 0, url: 'sikdardentalpoint.com', label: 'Sikdar Dental Point', rate: 1},
	{src: 'card_clientb.mp4', from: 0, url: 'Client-B doctor.com', label: 'Client-B doctor — Ophthalmologist', rate: 1},
	{src: 'site_surgeon.mp4', from: 0, url: 'drclientd.com', label: 'Client-D doctor Foysal ClientD', rate: 0.5},
	{src: 'card_arif.mp4', from: 0, url: 'Client-A doctoruddinkhan.com', label: 'Client-A doctor — Endovascular', rate: 0.6},
];
const Portfolio: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const bl = sc.words.filter((w) => w.st === 'bullet').map((w) => fr(w.t - sc.s));
	const k = bl.filter((b) => f >= b).length; // how many cards are out
	const worldAt = bl[3] ?? 1e9;
	const grid = interpolate(f, [worldAt, worldAt + 14], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const phone = pop(f, 14, 130);
	const phoneOut = interpolate(f, [bl[0] - 6, bl[0] + 6], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="PORTFOLIO" f={f} y={1560} />
			{/* phone with the Benzadid portfolio, floating, until the first card arrives */}
			<div style={{position: 'absolute', left: 290, top: 300, width: 500, height: 1030, borderRadius: 70, background: '#0E0F11', padding: 16, boxShadow: '0 60px 120px rgba(14,15,17,0.35)', opacity: phoneOut, transform: `translateY(${(1 - phone) * 600 + Math.sin(f / 20) * 8}px) rotate(${(1 - phone) * 8 - 3}deg) scale(${1 - (1 - phoneOut) * 0.2})`}}>
				<div style={{width: '100%', height: '100%', borderRadius: 56, overflow: 'hidden'}}>
					<OffthreadVideo src={P('site_bi_phone.mp4')} muted startFrom={fr(8)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
				</div>
			</div>
			{/* cards: newest in front & big; older ones recede up/back; on "World Class" all four snap into a 2x2 grid */}
			{CARDS.map((c, i) => {
				if (i >= k) return null;
				const age = k - 1 - i;
				const inn = pop(f - bl[i], 15, 140);
				const fly = (1 - inn) * 1200;
				const deckY = 380 - age * 70, deckS = 1 - age * 0.09, deckR = (i % 2 ? 1 : -1) * age * 2.5;
				const col = i % 2, row = Math.floor(i / 2);
				const gx = (col ? 548 : 22) - 30, gy = 330 + row * 330;
				const x = interpolate(grid, [0, 1], [30, gx]);
				const y = interpolate(grid, [0, 1], [deckY, gy]);
				const w = interpolate(grid, [0, 1], [1020 * deckS, 510]);
				const rot = interpolate(grid, [0, 1], [deckR, 0]);
				return (
					<div key={i} style={{position: 'absolute', left: x + (1020 - 1020 * deckS) / 2 * (1 - grid), top: y, width: w, transform: `translateX(${fly}px) rotate(${rot + (1 - inn) * 10}deg)`, filter: `blur(${grid > 0.5 ? 0 : Math.min(6, age * 3)}px)`, opacity: grid > 0.5 ? 1 : 1 - age * 0.18, zIndex: i}}>
						<div style={{borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 50px 100px rgba(14,15,17,0.28)'}}>
							<div style={{height: 34, background: '#EEF1F0', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16}}>
								{['#ff5f57', '#febc2e', '#28c840'].map((cc) => <div key={cc} style={{width: 10, height: 10, borderRadius: 5, background: cc}} />)}
								<div style={{marginLeft: 12, fontFamily: 'Arial', fontSize: 13, color: '#888'}}>{c.url}</div>
							</div>
							<div style={{aspectRatio: '16 / 9', position: 'relative'}}>
								<Sequence from={bl[i]} layout="none"><OffthreadVideo src={P(c.src)} muted startFrom={fr(c.from)} playbackRate={c.rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
							</div>
						</div>
					</div>
				);
			})}
			<Center top={k === 0 ? 760 : 1020} h={k === 0 ? 400 : 440}>
				<Phrase sc={sc} f={f} size={128} />
			</Center>
		</AbsoluteFill>
	);
};

const Ending: React.FC<{sc: Scene; f: number}> = ({sc, f}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<OffthreadVideo src={P('ending_graded.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		<Center dark top={1060} h={360}>
			<Phrase sc={sc} f={f} size={120} color="#FFFFFF" />
		</Center>
	</AbsoluteFill>
);

const MAP: Record<string, React.FC<{sc: Scene; f: number}>> = {surgeon: Surgeon, scalpel: Scalpel, incision: Incision, layers: Layers, stitch: Stitch, art: Art, hero: Hero, scroll: Scroll, shadly: Shadly, portfolio: Portfolio, ending: Ending};

// ---------------- transitions (same as v1) ----------------
const Enter: React.FC<{sc: Scene; children: React.ReactNode}> = ({sc, children}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [0, 9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	let st: React.CSSProperties = {};
	switch (sc.tr) {
		case 'fade': st = {opacity: interpolate(f, [0, 12], [0, 1], clamp)}; break;
		case 'zoom': st = {opacity: p, transform: `scale(${1.25 - 0.25 * p})`, filter: `blur(${(1 - p) * 14}px)`}; break;
		case 'blur': st = {opacity: p, filter: `blur(${(1 - p) * 22}px)`}; break;
		case 'whip': st = {transform: `translateX(${(1 - p) * 1100}px)`, filter: `blur(${(1 - p) * 26}px)`}; break;
		case 'morph': st = {opacity: interpolate(f, [0, 6], [0, 1], clamp)}; break;
		case 'rise': st = {opacity: p, transform: `translateY(${(1 - p) * 260}px)`}; break;
		case 'iris': st = {clipPath: `circle(${interpolate(f, [0, 12], [0, 120], {...clamp, easing: Easing.inOut(Easing.cubic)})}% at 50% 42%)`}; break;
	}
	return (
		<AbsoluteFill style={st}>
			{children}
			{sc.tr === 'flash' ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 8], [1, 0], clamp)}} /> : null}
		</AbsoluteFill>
	);
};
const Run: React.FC<{sc: Scene}> = ({sc}) => {
	const f = useCurrentFrame();
	const C = MAP[sc.id];
	return (
		<Enter sc={sc}>
			<C sc={sc} f={f} />
		</Enter>
	);
};

export const P2V2: React.FC = () => {
	const total = plan.total;
	const endS = scenes[scenes.length - 1].s;
	const duck = plan.duck as number[];
	return (
		<AbsoluteFill style={{background: BG}}>
			{scenes.map((sc) => (
				<Sequence key={sc.id} from={fr(sc.s)} durationInFrames={fr(sc.e - sc.s + (sc.id === 'ending' ? 0 : OVERLAP))}>
					<Run sc={sc} />
				</Sequence>
			))}
			<Audio src={staticFile(plan.vo)} />
			<Audio
				src={staticFile(plan.music.file)}
				startFrom={fr(plan.music.from)}
				volume={(x) => {
					const t = x / FPS;
					// louder bed (~+4 dB vs v1) that ducks under the voice and lifts in the gaps
					const v = duck[Math.min(duck.length - 1, Math.floor(t * 10))] ?? 0;
					const base = t < endS ? 0.30 - 0.12 * Math.min(1, v * 1.6) : 0.32;
					return base * interpolate(t, [0, 0.8], [0.3, 1], clamp) * interpolate(t, [total - 1.2, total], [1, 0], clamp);
				}}
			/>
			{(plan.sfx as {t: number; n: string; v: number; d?: number}[]).map((s, i) => (
				<Sequence key={'x' + i} from={fr(s.t)} durationInFrames={s.d ? fr(s.d) : undefined}>
					<Audio src={staticFile('sfx/' + s.n + '.mp3')} volume={s.v} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
