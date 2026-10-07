import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInterT} from '@remotion/google-fonts/InterTight';
import plan from './p3plan.json';

// Project 003 — English version, E14 grammar in the Benzadid white/black/teal palette:
// teal duotone imagery on a vignette field, condensed type that types itself in, pixel-dissolve cuts,
// halo rings behind subjects, focus zooms with a whoosh. No subtitle panels.
const {fontFamily: ANTON} = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const {fontFamily: INTER} = loadInterT('italic', {weights: ['500'], subsets: ['latin']});

const INK = '#0E1A18';
const TEAL = '#0F7C6E';
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const pop = (f: number, d = 13, s = 170) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
const P = (f: string) => staticFile('p3/' + f);

type W = {w: string; sz: string; t: number};
type Line = {t: number; words: W[]};
type Scene = {id: string; kind: string; s: number; e: number; lines: Line[]};
const scenes = plan.scenes as Scene[];
const FOCUS = plan.focus as Record<string, number>;

// ---------------- shared look ----------------
const Defs: React.FC = () => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<defs>
			{/* teal duotone: luminance -> deep teal (#0E3F39) .. paper white (#F7F8F7) */}
			<filter id="duo" colorInterpolationFilters="sRGB">
				<feColorMatrix type="saturate" values="0" />
				<feComponentTransfer>
					<feFuncR type="table" tableValues="0.055 0.30 0.969" />
					<feFuncG type="table" tableValues="0.247 0.47 0.973" />
					<feFuncB type="table" tableValues="0.224 0.44 0.969" />
				</feComponentTransfer>
			</filter>
		</defs>
	</svg>
);
const Field: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill>
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, #FBFCFB 0%, #EEF3F2 36%, #CFDDDA 72%, #A6BFBA 100%)'}} />
		{Array.from({length: 18}, (_, i) => {
			const x = random('x' + i) * 1080, y0 = random('y' + i) * 1920, r = 3 + random('r' + i) * 5;
			const y = (y0 - f * (0.5 + random('v' + i))) % 1920;
			return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + 1920 : y, width: r, height: r, borderRadius: r, background: 'rgba(15,124,110,0.18)'}} />;
		})}
	</AbsoluteFill>
);
const Halo: React.FC<{f: number; x?: number; y?: number; r?: number}> = ({f, x = 540, y = 900, r = 430}) => {
	const s = pop(f - 2, 14, 90);
	const pulse = 1 + Math.sin(f / 10) * 0.015;
	return (
		<>
			<div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0) 70%)', transform: `scale(${s * pulse})`}} />
			<div style={{position: 'absolute', left: x - r * 0.92, top: y - r * 0.92, width: 1.84 * r, height: 1.84 * r, borderRadius: '50%', border: `2px solid rgba(15,124,110,0.28)`, transform: `scale(${s * (1.05 + Math.sin(f / 14) * 0.02)})`, opacity: s}} />
		</>
	);
};

// ---------------- E14 typography: condensed caps type themselves in; tiny italic connectors ----------------
const Typed: React.FC<{w: W; now: number}> = ({w, now}) => {
	const el = now - w.t;
	if (el < 0) return null;
	const chars = Array.from(w.w);
	const n = Math.min(chars.length, Math.floor(el / 0.028) + 1);
	const big = w.sz !== 'S';
	const s = pop(fr(el), 12, 220);
	const glow = '0 0 28px rgba(247,248,247,0.95), 0 0 10px rgba(247,248,247,0.9)';
	if (!big) return <span style={{fontFamily: INTER, fontStyle: 'italic', fontWeight: 500, fontSize: 66, color: INK, textShadow: glow, opacity: s, alignSelf: 'center'}}>{w.w}</span>;
	return (
		<span style={{fontFamily: ANTON, fontSize: w.w.length > 14 ? 150 : 200, lineHeight: 0.98, color: w.sz === 'T' ? TEAL : INK, letterSpacing: 1, textShadow: glow, transform: `scale(${0.94 + 0.06 * s})`, display: 'inline-block'}}>
			{chars.slice(0, n).join('')}
		</span>
	);
};
const Lines: React.FC<{sc: Scene; f: number; pos: 'top' | 'bottom' | 'mid'}> = ({sc, f, pos}) => {
	const now = sc.s + f / FPS;
	const started = sc.lines.filter((l) => l.t <= now + 0.02);
	const BUL_SET = ['INNOVATIVE', 'PREMIUM', 'INTERNATIONAL STANDARD', 'WORLD CLASS'];
	const isBul = (l: Line) => BUL_SET.includes(l.words[0].w);
	// max two lines on screen; portfolio bullets replace each other (v2 behaviour)
	const shown = started.length && isBul(started[started.length - 1]) ? started.slice(-1) : started.slice(-2);
	const top = pos === 'top' ? 400 : pos === 'mid' ? 760 : 1120;
	return (
		<div style={{position: 'absolute', left: 30, right: 30, top, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
			{shown.map((l, i) => (
				<div key={i} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 18, textAlign: 'center'}}>
					{l.words.map((w, j) => <Typed key={j} w={w} now={now} />)}
				</div>
			))}
		</div>
	);
};

// ---------------- focus zoom: push in to a point, surroundings soften (depth) ----------------
const Focus: React.FC<{src: string; f: number; at: number; from?: [number, number, number]; to: [number, number, number]; duo?: boolean}> = ({src, f, at, from = [0.5, 0.5, 1.0], to, duo = true}) => {
	const p = interpolate(f, [fr(at), fr(at) + 14], [0, 1], {...clamp, easing: ease});
	const drift = interpolate(f, [fr(at) + 14, fr(at) + 120], [0, 0.06], clamp);
	const z = from[2] + (to[2] - from[2]) * p + drift;
	const fx = from[0] + (to[0] - from[0]) * p, fy = from[1] + (to[1] - from[1]) * p;
	const blurMid = interpolate(f, [fr(at), fr(at) + 6, fr(at) + 14], [0, 5, 0], clamp);
	const style = (extra: React.CSSProperties): React.CSSProperties => ({position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})`, filter: `${duo ? 'url(#duo)' : ''} ${extra.filter ?? ''}`, ...extra});
	return (
		<AbsoluteFill>
			<Img src={P(src)} style={style({filter: `blur(${6 * p + blurMid}px)`})} />
			<Img src={P(src)} style={style({filter: `blur(${blurMid}px)`, WebkitMaskImage: `radial-gradient(circle at ${fx * 100}% ${fy * 100}%, black ${interpolate(p, [0, 1], [90, 26])}%, transparent ${interpolate(p, [0, 1], [130, 52])}%)`})} />
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${interpolate(p, [0, 1], [70, 40])}%, rgba(14,63,57,${0.12 + 0.18 * p}) 100%)`}} />
		</AbsoluteFill>
	);
};

// ================= scenes =================
type SP = {sc: Scene; f: number};
const Surgeon: React.FC<SP> = ({sc, f}) => (
	<AbsoluteFill>
		<Field f={f} />
		<Focus src="surgeon_scene.jpg" f={f} at={FOCUS.surgeon} from={[0.5, 0.4, 1.02]} to={[0.42, 0.22, 1.25]} />
		<Lines sc={sc} f={f} pos="bottom" />
	</AbsoluteFill>
);
const Scalpel: React.FC<SP> = ({sc, f}) => (
	<AbsoluteFill>
		<Field f={f} />
		<Focus src="surgeon_scene.jpg" f={f} at={FOCUS.scalpel} from={[0.42, 0.22, 1.25]} to={[0.17, 0.8, 2.6]} />
		<Lines sc={sc} f={f} pos="top" />
	</AbsoluteFill>
);
const Incision: React.FC<SP> = ({sc, f}) => {
	const cut = interpolate(f, [24, 46], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	return (
		<AbsoluteFill>
			<Field f={f} />
			<AbsoluteFill style={{transform: `scale(${interpolate(f, [0, 60], [1.3, 1.4])})`, transformOrigin: '40% 60%'}}>
				<OffthreadVideo src={P('incision.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duo)'}} />
			</AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 140 1300 C 360 1282, 620 1312, 900 1290" stroke={TEAL} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cut} style={{filter: `drop-shadow(0 0 12px ${TEAL})`}} />
			</svg>
			<Lines sc={sc} f={f} pos="top" />
		</AbsoluteFill>
	);
};
const Cut: React.FC<SP> = ({sc, f}) => {
	const d = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
	const sweep = interpolate(f, [10, 34], [-0.2, 1.2], clamp);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<Halo f={f} y={1000} r={380} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<linearGradient id="cutg" x1="0" x2="1">
						<stop offset={Math.max(0, sweep - 0.12)} stopColor={TEAL} />
						<stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#FFFFFF" />
						<stop offset={Math.min(1, sweep + 0.12)} stopColor={TEAL} />
					</linearGradient>
				</defs>
				<path d="M 120 1010 C 380 985, 700 1035, 960 1000" stroke="url(#cutg)" strokeWidth={12} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} style={{filter: `drop-shadow(0 0 16px ${TEAL})`}} />
			</svg>
			<Lines sc={sc} f={f} pos="top" />
		</AbsoluteFill>
	);
};
const BANDS = [0, 0.4, 0.56, 0.63, 1];
const Layers: React.FC<SP> = ({sc, f}) => {
	const by = fr(sc.lines[2].t - sc.s);
	const ex = interpolate(f, [by - 4, by + 10], [0, 1], {...clamp, easing: ease});
	const inn = pop(f, 14, 110);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<Halo f={f} y={820} r={460} />
			<div style={{position: 'absolute', left: 90, top: 300, width: 900, height: 1612, transform: `scale(${0.85 + 0.15 * inn}) translateY(${(1 - inn) * 120}px)`, opacity: inn}}>
				{BANDS.slice(0, -1).map((b, i) => (
					<Img key={i} src={P('layers.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'url(#duo) drop-shadow(0 30px 40px rgba(14,63,57,0.25))', clipPath: `inset(${b * 100}% 0 ${(1 - BANDS[i + 1]) * 100}% 0)`, transform: `translateY(${(i - 1.5) * 90 * ex}px) rotate(${(i - 1.5) * 2 * ex}deg)`}} />
				))}
			</div>
			<Lines sc={sc} f={f} pos="bottom" />
		</AbsoluteFill>
	);
};
const Suture: React.FC<SP> = ({sc, f}) => (
	<AbsoluteFill>
		<Field f={f} />
		<Focus src="suture_hands.jpg" f={f} at={FOCUS.suture} from={[0.5, 0.5, 1.02]} to={[0.72, 0.42, 1.9]} />
		<Lines sc={sc} f={f} pos="bottom" />
	</AbsoluteFill>
);
// approximate stitch path in stitch.jpg (fractions of the image), used for teal stitch highlights
const STITCH = Array.from({length: 7}, (_, i) => ({x: 0.6 - i * 0.055, y: 0.3 + i * 0.05}));
const Stitch: React.FC<SP> = ({sc, f}) => {
	const st = fr(sc.lines[1].t - sc.s);
	const z = interpolate(f, [0, 80], [1.05, 1.15]);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '45% 45%'}}>
				<Img src={P('stitch.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duo)'}} />
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{STITCH.map((p, i) => {
						const d = interpolate(f, [st + 3 + i * 4, st + 7 + i * 4], [0, 1], clamp);
						const x = p.x * 1080, y = p.y * 1920;
						return <path key={i} d={`M ${x - 40} ${y - 26} L ${x + 40} ${y + 26}`} stroke={TEAL} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} style={{filter: `drop-shadow(0 0 8px ${TEAL})`}} />;
					})}
				</svg>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(14,63,57,0.25) 100%)'}} />
			<Lines sc={sc} f={f} pos="bottom" />
		</AbsoluteFill>
	);
};
const Art: React.FC<SP> = ({sc, f}) => {
	const inn = pop(f, 14, 120);
	const wipe = interpolate(f, [2, 22], [100, 0], {...clamp, easing: ease});
	return (
		<AbsoluteFill>
			<Field f={f} />
			<Halo f={f} y={800} r={470} />
			<Img src={P('art.png')} style={{position: 'absolute', left: 40, top: 160, width: 1000, transform: `scale(${0.9 + 0.1 * inn}) rotate(${(1 - inn) * -6}deg)`, filter: 'drop-shadow(0 30px 40px rgba(14,63,57,0.25))', clipPath: `inset(0 0 ${wipe}% 0)`}} />
			<Lines sc={sc} f={f} pos="bottom" />
		</AbsoluteFill>
	);
};
const Laptop: React.FC<{f: number; src: string; from: number; rate?: number; scale?: number; origin?: string}> = ({f, src, from, rate = 1, scale = 1, origin = '50% 50%'}) => (
	<div style={{position: 'absolute', left: 40, top: 900, width: 1000, transform: `scale(${scale}) translateY(${Math.sin(f / 22) * 6}px)`, transformOrigin: origin}}>
		<div style={{background: '#1B1F1E', borderRadius: '26px 26px 8px 8px', padding: 18, boxShadow: '0 60px 100px rgba(14,63,57,0.35)'}}>
			<div style={{height: 560, borderRadius: 8, overflow: 'hidden', background: '#fff'}}>
				<OffthreadVideo src={P(src)} muted startFrom={fr(from)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</div>
		</div>
		<div style={{height: 24, margin: '0 -50px', background: 'linear-gradient(#D9E2E0,#A9B9B6)', borderRadius: '0 0 28px 28px'}} />
	</div>
);
const LaptopScene: React.FC<SP> = ({sc, f}) => {
	const inn = pop(f, 15, 110);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - inn) * 400}px)`, opacity: inn}}>
				<Laptop f={f} src="site_surgeon.mp4" from={0} rate={0.35} />
			</div>
			<Lines sc={sc} f={f} pos="top" />
		</AbsoluteFill>
	);
};
const Hero: React.FC<SP> = ({sc, f}) => {
	const p = interpolate(f, [fr(FOCUS.hero), fr(FOCUS.hero) + 14], [0, 1], {...clamp, easing: ease});
	const frame = interpolate(f, [fr(FOCUS.hero) + 14, fr(FOCUS.hero) + 30], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<div style={{position: 'absolute', inset: 0, filter: `blur(${interpolate(p, [0, 0.5, 1], [0, 4, 0])}px)`}}>
				<Laptop f={f} src="site_surgeon.mp4" from={0.9} rate={0.25} scale={1 + 0.45 * p} origin="50% 85%" />
			</div>
			<div style={{position: 'absolute', left: 50, top: 820, width: 980, height: 760, border: `6px solid ${TEAL}`, borderRadius: 18, opacity: frame, transform: `scale(${1.04 - 0.04 * frame})`, boxShadow: `0 0 30px rgba(15,124,110,0.5)`}} />
			<Lines sc={sc} f={f} pos="top" />
		</AbsoluteFill>
	);
};
const Scroll: React.FC<SP> = ({sc, f}) => {
	const click = 18;
	const cp = pop(f - click, 8, 300);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<Laptop f={f} src="site_surgeon.mp4" from={5.5} rate={1} />
			<div style={{position: 'absolute', left: interpolate(f, [0, click], [880, 640], {...clamp, easing: ease}), top: interpolate(f, [0, click], [1500, 1180], {...clamp, easing: ease}), transform: `scale(${1 - 0.15 * Math.max(0, 1 - Math.abs(f - click) / 4)})`}}>
				<svg width={70} height={90} viewBox="0 0 24 30"><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" /></svg>
				<div style={{position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: 30, border: `4px solid ${TEAL}`, opacity: f >= click ? 1 - cp * 0.9 : 0, transform: `scale(${0.4 + cp})`}} />
			</div>
			<Lines sc={sc} f={f} pos="top" />
		</AbsoluteFill>
	);
};
const Shadly: React.FC<SP> = ({sc, f}) => {
	const up = pop(f - 2, 15, 110);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<Halo f={f} y={820} r={480} />
			<Img src={P('shadly.png')} style={{position: 'absolute', left: 40, top: 300, width: 1000, transform: `translateY(${(1 - up) * 220}px) scale(${interpolate(f, [0, 60], [1, 1.05])})`, opacity: up, filter: 'url(#duo) contrast(1.05) drop-shadow(0 30px 50px rgba(14,63,57,0.35))'}} />
			<Lines sc={sc} f={f} pos="bottom" />
		</AbsoluteFill>
	);
};

// portfolio = v2 showcase (phone -> Sikdar / ClientB / ClientD / Client-A deck -> 2x2 grid) + a floating object per bullet
const CARDS = [
	{src: 'card_sikdar.mp4', url: 'sikdardentalpoint.com', rate: 1, obj: 'bulb.png'},
	{src: 'card_clientb.mp4', url: 'Client-B doctor.com', rate: 1, obj: 'diamond.png'},
	{src: 'site_surgeon.mp4', url: 'drclientd.com', rate: 0.5, obj: 'globe.png'},
	{src: 'card_arif.mp4', url: 'Client-A doctoruddinkhan.com', rate: 0.6, obj: 'trophy.png'},
];
const BUL = ['INNOVATIVE', 'PREMIUM', 'INTERNATIONAL STANDARD', 'WORLD CLASS'];
const Portfolio: React.FC<SP> = ({sc, f}) => {
	const bl = BUL.map((b) => fr(sc.lines.flatMap((l) => l.words).find((w) => w.w === b)!.t - sc.s));
	const k = bl.filter((b) => f >= b).length;
	const grid = interpolate(f, [bl[3], bl[3] + 14], [0, 1], {...clamp, easing: ease});
	const phone = pop(f, 14, 130);
	const phoneOut = interpolate(f, [bl[0] - 6, bl[0] + 6], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<Field f={f} />
			<div style={{position: 'absolute', left: 300, top: 300, width: 480, height: 990, borderRadius: 66, background: '#0E1A18', padding: 15, boxShadow: '0 60px 120px rgba(14,63,57,0.35)', opacity: phoneOut, transform: `translateY(${(1 - phone) * 600 + Math.sin(f / 20) * 8}px) rotate(${(1 - phone) * 8 - 3}deg) scale(${1 - (1 - phoneOut) * 0.2})`}}>
				<div style={{width: '100%', height: '100%', borderRadius: 52, overflow: 'hidden'}}>
					<OffthreadVideo src={P('site_bi_phone.mp4')} muted startFrom={fr(8)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
				</div>
			</div>
			{CARDS.map((c, i) => {
				if (i >= k) return null;
				const age = k - 1 - i;
				const inn = pop(f - bl[i], 15, 140);
				const deckY = 360 - age * 70, deckS = 1 - age * 0.09, deckR = (i % 2 ? 1 : -1) * age * 2.5;
				const col = i % 2, row = Math.floor(i / 2);
				const x = interpolate(grid, [0, 1], [30, (col ? 548 : 22) - 30]);
				const y = interpolate(grid, [0, 1], [deckY, 330 + row * 330]);
				const w = interpolate(grid, [0, 1], [1020 * deckS, 510]);
				return (
					<div key={i} style={{position: 'absolute', left: x + ((1020 - 1020 * deckS) / 2) * (1 - grid), top: y, width: w, transform: `translateX(${(1 - inn) * 1200}px) rotate(${interpolate(grid, [0, 1], [deckR, 0]) + (1 - inn) * 10}deg)`, filter: `blur(${grid > 0.5 ? 0 : Math.min(6, age * 3)}px)`, opacity: grid > 0.5 ? 1 : 1 - age * 0.18}}>
						<div style={{borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 50px 100px rgba(14,63,57,0.3)'}}>
							<div style={{height: 34, background: '#EEF3F2', display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16}}>
								{['#ff5f57', '#febc2e', '#28c840'].map((cc) => <div key={cc} style={{width: 10, height: 10, borderRadius: 5, background: cc}} />)}
								<div style={{marginLeft: 12, fontFamily: 'Arial', fontSize: 13, color: '#888'}}>{c.url}</div>
							</div>
							<div style={{aspectRatio: '16 / 9'}}>
								<Sequence from={bl[i]} layout="none">
									<OffthreadVideo src={P(c.src)} muted playbackRate={c.rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
								</Sequence>
							</div>
						</div>
					</div>
				);
			})}
			{/* floating object for the current bullet (bulb / diamond / globe / trophy), duotone like E14 */}
			{CARDS.map((c, i) => {
				if (i !== k - 1 || grid > 0.5) return null;
				const s = pop(f - bl[i] - 4, 11, 180);
				return <Img key={'o' + i} src={P(c.obj)} style={{position: 'absolute', right: 10, top: 120, width: 360, transform: `scale(${s}) rotate(${(1 - s) * 20}deg) translateY(${Math.sin(f / 12) * 10}px)`, filter: 'url(#duo) drop-shadow(0 30px 30px rgba(14,63,57,0.3))'}} />;
			})}
			<Lines sc={sc} f={f} pos={k === 0 ? 'bottom' : 'bottom'} />
		</AbsoluteFill>
	);
};
const Ending: React.FC<SP> = ({sc, f}) => {
	const now = sc.s + f / FPS;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<OffthreadVideo src={P('ending.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 1120, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				{sc.lines[0].words.map((w, i) => {
					const el = now - w.t;
					if (el < 0) return null;
					const chars = Array.from(w.w);
					return <span key={i} style={{fontFamily: ANTON, fontSize: 190, lineHeight: 0.98, color: w.sz === 'T' ? '#7FE0D2' : '#FFFFFF', textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>{chars.slice(0, Math.min(chars.length, Math.floor(el / 0.028) + 1)).join('')}</span>;
				})}
			</div>
		</AbsoluteFill>
	);
};
const MAP: Record<string, React.FC<SP>> = {surgeon: Surgeon, scalpel: Scalpel, incision: Incision, cut: Cut, layers: Layers, suture: Suture, stitch: Stitch, art: Art, laptop: LaptopScene, hero: Hero, scroll: Scroll, shadly: Shadly, portfolio: Portfolio, ending: Ending};

// ---------------- E14 pixel-dissolve entry (clip to revealed blocks) ----------------
const pixelClip = (p: number, seed: string) => {
	if (p >= 1) return undefined;
	const C = 12, R = 21, w = 1080 / C, h = 1920 / R;
	let d = '';
	for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (random(seed + x + '_' + y) < p) d += `M${x * w} ${y * h}h${w + 1}v${h + 1}h${-w - 1}z`;
	return `path('${d || 'M0 0'}')`;
};
const Run: React.FC<{sc: Scene}> = ({sc}) => {
	const f = useCurrentFrame();
	const C = MAP[sc.id];
	const smooth = sc.id === 'scalpel'; // scalpel continues the surgeon shot: no dissolve, the focus zoom is the transition
	const p = smooth ? 1 : interpolate(f, [0, 8], [0, 1], clamp);
	return (
		<AbsoluteFill style={{clipPath: pixelClip(p, sc.id)}}>
			<C sc={sc} f={f} />
			{sc.id === 'ending' ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 7], [0.9, 0], clamp)}} /> : null}
		</AbsoluteFill>
	);
};

export const P3: React.FC = () => {
	const duck = plan.duck as number[];
	const total = plan.total;
	const endS = scenes[scenes.length - 1].s;
	return (
		<AbsoluteFill style={{background: '#EEF3F2'}}>
			<Defs />
			{scenes.map((sc) => (
				<Sequence key={sc.id} from={fr(sc.s)} durationInFrames={fr(sc.e - sc.s) + (sc.id === 'ending' ? 0 : 9)}>
					<Run sc={sc} />
				</Sequence>
			))}
			<Audio src={staticFile(plan.vo)} />
			<Audio
				src={staticFile(plan.music.file)}
				startFrom={fr(plan.music.from)}
				volume={(x) => {
					const t = x / FPS;
					const v = duck[Math.min(duck.length - 1, Math.floor(t * 10))] ?? 0;
					const base = t < endS ? 0.42 - 0.14 * Math.min(1, v * 1.6) : 0.45; // clearly audible bed, dips under the voice
					return base * interpolate(t, [0, 0.6], [0.4, 1], clamp) * interpolate(t, [total - 1.0, total], [1, 0], clamp);
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
