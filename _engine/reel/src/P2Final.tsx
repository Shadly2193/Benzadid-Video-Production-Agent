import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadTiro} from '@remotion/google-fonts/TiroBangla';
import {loadFont as loadPlay} from '@remotion/google-fonts/PlayfairDisplay';
import {Backdrop, BG, INK, TEAL} from './P2';
import plan from './p2plan.json';

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
const OVERLAP = 0.3; // outgoing scene stays underneath while the next one transitions in

// ---------------- words: only the phrase currently being spoken is shown; it replaces the previous one ----------------
const styleOf = (st: string, size: number): React.CSSProperties => {
	if (st === 'i') return {fontFamily: TIRO, fontStyle: 'italic', fontSize: size * 0.55, color: INK};
	if (st === 'l') return {fontFamily: PLAY, fontStyle: 'italic', fontWeight: 400, fontSize: size * 1.0, color: INK};
	if (st === 't') return {fontFamily: ANEK, fontWeight: 800, fontSize: size, color: TEAL, letterSpacing: -2};
	return {fontFamily: ANEK, fontWeight: 800, fontSize: size, color: INK, letterSpacing: -2};
};
const Phrase: React.FC<{sc: Scene; f: number; size?: number; color?: string; align?: 'left' | 'center'; filter?: (w: Word) => boolean}> = ({sc, f, size = 130, color, align = 'left', filter}) => {
	const now = sc.s + f / FPS;
	const ws = sc.words.filter((w) => w.st !== 'bullet' && w.st !== 'type' && (!filter || filter(w)));
	const started = ws.filter((w) => w.t <= now + 0.02);
	if (!started.length) return null;
	const cur = started[started.length - 1].p;
	const group = ws.filter((w) => w.p === cur);
	const groupStart = group[0].t;
	const next = sc.words.find((w) => w.t > groupStart && w.p !== cur && (!filter || filter(w)));
	const out = next ? interpolate(now, [next.t - 0.12, next.t], [1, 0], clamp) : 1;
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: size * 0.22, justifyContent: align === 'center' ? 'center' : 'flex-start', opacity: out}}>
			{group.map((w, i) => {
				const lf = fr(now - w.t);
				if (lf < 0) return null;
				const s = pop(lf, 13, 190);
				const base = styleOf(w.st, size);
				return (
					<span key={i} style={{...base, ...(color && w.st !== 't' ? {color} : {}), display: 'inline-block', lineHeight: 1.08, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 34}px) scale(${0.86 + 0.14 * s})`, filter: `blur(${(1 - s) * 9}px)`}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};
const wordAt = (sc: Scene, txt: string) => sc.words.find((w) => w.w === txt)!.t - sc.s;
const Ghost: React.FC<{t: string; f: number; y: number; size?: number; color?: string}> = ({t, f, y, size = 330, color = 'rgba(14,15,17,0.05)'}) => (
	<div style={{position: 'absolute', top: y, left: -60 - f * 1.2, whiteSpace: 'nowrap', fontFamily: ANEK, fontWeight: 800, fontSize: size, color, letterSpacing: -10}}>{t}</div>
);

// ================= scenes =================
const Surgeon: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const inn = pop(f, 15, 90);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="SURGEON" f={f} y={360} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 560, height: 1900, transform: `translateY(${(1 - inn) * 260}px) scale(${interpolate(f, [0, 60], [1, 1.05]) * (0.9 + 0.1 * inn)})`, transformOrigin: '50% 30%', opacity: Math.min(1, inn * 1.6), filter: 'drop-shadow(0 40px 60px rgba(14,15,17,0.18))'}} />
			<div style={{position: 'absolute', left: 70, right: 70, top: 130}}>
				<Phrase sc={sc} f={f} size={230} />
				<div style={{height: 10, width: interpolate(f, [fr(wordAt(sc, 'সার্জন')) + 6, fr(wordAt(sc, 'সার্জন')) + 20], [0, 420], clamp), background: TEAL, borderRadius: 5, marginTop: 8}} />
			</div>
		</AbsoluteFill>
	);
};

const Scalpel: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const z = interpolate(f, [0, 16], [1, 2.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const line = interpolate(f, [18, 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t="SCALPEL" f={f} y={1500} size={300} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 560, height: 1900, transform: `translate(${interpolate(f, [0, 16], [0, -110], clamp)}px, ${interpolate(f, [0, 16], [0, -560], clamp)}px) scale(${z + interpolate(f, [16, 90], [0, 0.1], clamp)})`, transformOrigin: '62% 58%', filter: `blur(${interpolate(f, [3, 9, 16], [0, 7, 0], clamp)}px)`}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 560 1000 L 720 760 L 1010 760" stroke={TEAL} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
				<circle cx={560} cy={1000} r={14 * line} fill={TEAL} />
			</svg>
			<div style={{position: 'absolute', right: 50, top: 650, background: 'rgba(255,255,255,0.94)', borderRadius: 22, padding: '6px 26px', boxShadow: '0 16px 40px rgba(14,15,17,0.18)', opacity: interpolate(f, [24, 30], [0, 1], clamp), transform: `scale(${0.8 + 0.2 * pop(f - 24)})`}}>
				<span style={{fontFamily: ANEK, fontWeight: 800, fontSize: 104, color: TEAL, letterSpacing: -2}}>SCALPEL</span>
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 150}}>
				<Phrase sc={sc} f={f} size={150} />
			</div>
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
			<div style={{position: 'absolute', left: 70, right: 70, top: 200}}>
				<Phrase sc={sc} f={f} size={170} />
			</div>
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
			<Ghost t="LAYERS" f={f} y={1560} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 520, height: 900, perspective: 1600, transform: `scale(${interpolate(f, [0, 110], [1, 1.08])})`}}>
				{LAYERS.map((l, i) => {
					const s = pop(f - 6 - i * 8, 13, 150);
					const gap = interpolate(f, [open, open + 24], [0, 1], clamp) * 120;
					return (
						<div key={i} style={{position: 'absolute', left: 140, width: 800, height: 260, top: 120 + i * (150 + gap), transform: `rotateX(58deg) rotateZ(-38deg) translateY(${(1 - s) * -300}px)`, opacity: s}}>
							<div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(135deg, ${l.c}, ${l.c}cc)`, boxShadow: '0 50px 70px rgba(14,15,17,0.18), inset 0 2px 0 rgba(255,255,255,0.6)'}} />
						</div>
					);
				})}
				{LAYERS.map((l, i) => {
					const s = pop(f - open - 4 - i * 5, 14, 160);
					const gap = interpolate(f, [open, open + 24], [0, 1], clamp) * 120;
					return (
						<div key={'l' + i} style={{position: 'absolute', right: 60, top: 150 + i * (150 + gap), opacity: s, transform: `translateX(${(1 - s) * 60}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
							<div style={{width: 90, height: 3, background: TEAL}} />
							<div style={{fontFamily: ANEK, fontWeight: 700, fontSize: 48, color: TEAL}}>{l.bn}</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 170}}>
				<Phrase sc={sc} f={f} size={150} />
			</div>
		</AbsoluteFill>
	);
};

const Stitch: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const sut = fr(wordAt(sc, 'Suturing'));
	const glow = interpolate(f, [8, 50], [-0.2, 1.2], clamp);
	const N = 9;
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t={f < sut ? 'PRECISION' : 'STITCH'} f={f} y={1560} />
			<div style={{position: 'absolute', left: -40, right: -40, top: 640, height: 560, borderRadius: 60, background: 'linear-gradient(180deg,#F0D2BE,#E3B89C)', boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.08), 0 30px 60px rgba(14,15,17,0.12)', transform: `scale(${interpolate(f, [0, 240], [1, 1.06])})`}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<linearGradient id="sweep" x1="0" x2="1">
						<stop offset={Math.max(0, glow - 0.15)} stopColor="#9B3B36" />
						<stop offset={Math.min(1, Math.max(0, glow))} stopColor="#FFFFFF" />
						<stop offset={Math.min(1, glow + 0.15)} stopColor="#9B3B36" />
					</linearGradient>
				</defs>
				<path d="M 60 920 C 300 905, 700 935, 1020 915" stroke="url(#sweep)" strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f, [0, 14], [0, 1], clamp)} />
				{Array.from({length: N}, (_, i) => {
					const x = 120 + i * 105;
					const d = interpolate(f, [sut + 10 + i * 5, sut + 16 + i * 5], [0, 1], clamp);
					return <path key={i} d={`M ${x - 34} 840 Q ${x} 920 ${x + 34} 1000`} stroke={TEAL} fill="none" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />;
				})}
				<circle cx={1000} cy={920} r={22 * pop(f - sut - 10 - N * 5, 8, 260)} fill={TEAL} />
			</svg>
			<div style={{position: 'absolute', left: 70, right: 70, top: 170}}>
				<Phrase sc={sc} f={f} size={150} />
			</div>
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
				<div style={{fontFamily: PLAY, fontStyle: 'italic', fontWeight: 400, fontSize: 230, color: INK, lineHeight: 0.95, opacity: pop(f - a), transform: `scale(${0.85 + 0.15 * pop(f - a, 14, 120)})`, filter: `blur(${(1 - pop(f - a)) * 12}px)`}}>Surgical</div>
				<div style={{fontFamily: PLAY, fontStyle: 'italic', fontWeight: 700, fontSize: 300, color: TEAL, lineHeight: 0.95, opacity: pop(f - a - 8), transform: `scale(${0.85 + 0.15 * pop(f - a - 8, 14, 120)})`, filter: `blur(${(1 - pop(f - a - 8)) * 12}px)`}}>Art</div>
			</div>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 120 1290 C 320 1210, 520 1370, 720 1290 S 960 1230, 980 1260" stroke={TEAL} strokeWidth={4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
			</svg>
			<div style={{position: 'absolute', left: 70, right: 70, top: 1440}}>
				<Phrase sc={sc} f={f} size={130} filter={(w) => w.w !== 'Surgical' && w.w !== 'Art'} />
			</div>
		</AbsoluteFill>
	);
};

const Browser: React.FC<{f: number; src: string; from: number; rate?: number}> = ({f, src, from, rate = 1}) => (
	<div style={{borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 120px rgba(14,15,17,0.22)', border: '1px solid rgba(14,15,17,0.08)'}}>
		<div style={{height: 46, background: '#EEF1F0', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20}}>
			{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
			<div style={{marginLeft: 20, height: 24, flex: 1, marginRight: 30, borderRadius: 12, background: '#fff', fontFamily: 'Arial', fontSize: 15, color: '#888', display: 'flex', alignItems: 'center', paddingLeft: 14}}>drclientd.com</div>
		</div>
		<div style={{height: 640, position: 'relative', overflow: 'hidden'}}>
			<OffthreadVideo src={P(src)} muted startFrom={fr(from)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</div>
	</div>
);

const Hero: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const s = pop(f, 15, 110);
	const ul = fr(wordAt(sc, 'হিরো সেকশনে'));
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="HERO" f={f} y={1400} size={420} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 560, transform: `translateY(${(1 - s) * 500 + Math.sin(f / 22) * 8}px) rotateX(${(1 - s) * 18}deg) scale(1.06)`, transformOrigin: '50% 100%'}}>
				<Browser f={f} src="site_surgeon.mp4" from={0} rate={0.3} />
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 170}}>
				<Phrase sc={sc} f={f} size={150} />
				<div style={{height: 8, width: interpolate(f, [ul + 6, ul + 20], [0, 560], clamp), background: TEAL, borderRadius: 4, marginTop: 6, opacity: f < fr(wordAt(sc, 'আমি এমনভাবে')) ? 1 : 0}} />
			</div>
		</AbsoluteFill>
	);
};

const Scroll: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const tw = sc.words.find((w) => w.st === 'type')!;
	const twf = fr(tw.t - sc.s);
	const chars = Array.from(tw.w);
	const shown = Math.max(0, Math.min(chars.length, Math.floor((f - twf) / (0.055 * FPS)) + 1));
	const wheel = (f * 6) % 40;
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 470, transform: `scale(1.06) translateY(${Math.sin(f / 22) * 8}px)`}}>
				<Browser f={f} src="site_surgeon.mp4" from={6} />
			</div>
			<div style={{position: 'absolute', left: 500, top: 1250, width: 80, height: 130, borderRadius: 40, border: `5px solid ${INK}`, opacity: 0.85}}>
				<div style={{position: 'absolute', left: 33, top: 20 + wheel, width: 10, height: 26, borderRadius: 5, background: TEAL}} />
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 150}}>
				<Phrase sc={sc} f={f} size={140} />
			</div>
			{f >= twf && f < twf + fr(2.6) ? (
				<div style={{position: 'absolute', left: 70, right: 70, top: 1460, fontFamily: ANEK, fontWeight: 800, fontSize: 120, color: TEAL, letterSpacing: -2}}>
					{chars.slice(0, shown).join('')}
					<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: INK}}>|</span>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

const Shadly: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const iris = interpolate(f, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const up = pop(f - 6, 15, 110);
	return (
		<AbsoluteFill>
			<Backdrop f={f} dark />
			<div style={{position: 'absolute', left: 540 - 520 * iris, top: 720 - 520 * iris, width: 1040 * iris, height: 1040 * iris, borderRadius: '50%', background: 'radial-gradient(circle, #FFFFFF 0%, #F2F4F3 45%, rgba(242,244,243,0) 70%)'}} />
			<Img src={P('shadly.png')} style={{position: 'absolute', left: 30, top: 470, width: 1020, transform: `translateY(${(1 - up) * 200}px) scale(${interpolate(f, [0, 130], [1.0, 1.06])})`, opacity: up, filter: 'saturate(0.55) contrast(1.05) drop-shadow(0 30px 50px rgba(0,0,0,0.5))'}} />
			<div style={{position: 'absolute', left: 60, right: 60, top: 200}}>
				<Phrase sc={sc} f={f} size={150} color="#FFFFFF" align="center" />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1720, textAlign: 'center', fontFamily: PLAY, fontStyle: 'italic', fontSize: 40, color: '#CFE7E2', opacity: pop(f - 24)}}>Ex-Dental Surgeon · AI Generalist</div>
		</AbsoluteFill>
	);
};

const Phone: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const s = pop(f, 14, 130);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="DOCTORS" f={f} y={1500} />
			<div style={{position: 'absolute', left: 290, top: 470, width: 500, height: 1030, borderRadius: 70, background: '#0E0F11', padding: 16, boxShadow: '0 60px 120px rgba(14,15,17,0.35)', transform: `translateY(${(1 - s) * 600 + Math.sin(f / 20) * 8}px) rotate(${(1 - s) * 8 - 3}deg)`}}>
				<div style={{width: '100%', height: '100%', borderRadius: 56, overflow: 'hidden', position: 'relative'}}>
					<OffthreadVideo src={P('site_bi_phone.mp4')} muted startFrom={fr(8)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
				</div>
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, top: 170}}>
				<Phrase sc={sc} f={f} size={150} />
			</div>
		</AbsoluteFill>
	);
};

const Bullets: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const bl = sc.words.filter((w) => w.st === 'bullet');
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<div style={{position: 'absolute', right: -260, top: 380, width: 900, height: 900, borderRadius: '50%', border: `60px solid ${TEAL}`, opacity: 0.12, transform: `rotate(${f}deg) scale(${interpolate(f, [0, 30], [0.6, 1], clamp)})`}} />
			<div style={{position: 'absolute', left: 80, top: 560}}>
				{bl.map((b, i) => {
					const s = pop(f - fr(b.t - sc.s), 13, 170);
					return (
						<div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 46, opacity: s, transform: `translateX(${(1 - s) * -80}px)`, filter: `blur(${(1 - s) * 8}px)`}}>
							<div style={{width: 22, height: 22, borderRadius: 11, background: TEAL, transform: `scale(${pop(f - fr(b.t - sc.s), 8, 260)})`}} />
							<span style={{fontFamily: PLAY, fontStyle: 'italic', fontSize: b.w.length > 14 ? 84 : 112, color: INK, lineHeight: 1}}>{b.w}</span>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 80, right: 80, top: 1430}}>
				<Phrase sc={sc} f={f} size={130} />
			</div>
		</AbsoluteFill>
	);
};

const Ending: React.FC<{sc: Scene; f: number}> = ({sc, f}) => (
	<AbsoluteFill style={{background: '#000'}}>
		<OffthreadVideo src={P('ending_graded.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center'}}>
			<div style={{padding: '12px 36px', borderRadius: 28, background: 'rgba(14,15,17,0.35)', backdropFilter: 'blur(12px)'}}>
				<Phrase sc={sc} f={f} size={120} color="#FFFFFF" align="center" />
			</div>
		</div>
	</AbsoluteFill>
);

const MAP: Record<string, React.FC<{sc: Scene; f: number}>> = {surgeon: Surgeon, scalpel: Scalpel, incision: Incision, layers: Layers, stitch: Stitch, art: Art, hero: Hero, scroll: Scroll, shadly: Shadly, phone: Phone, bullets: Bullets, ending: Ending};

// ---------------- transitions (entry only; outgoing scene sits underneath) ----------------
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
		case 'flash': st = {}; break;
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

export const P2Final: React.FC = () => {
	const total = plan.total;
	const endS = scenes[scenes.length - 1].s;
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
					const base = t < endS ? 0.13 : 0.2;
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
