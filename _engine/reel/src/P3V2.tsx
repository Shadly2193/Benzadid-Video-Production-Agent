import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, random} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadInterT} from '@remotion/google-fonts/InterTight';
import plan from './p3plan_v2.json';

// English v2 — rebuilt on E14's measured grammar:
//  * one constant background for the whole film (only object + words change)
//  * objects are cut-outs on a fixed central stage (y 600–1260); words never sit on them
//  * two word clusters: above the stage and below it; big words ~110px, connectors ~32px
//  * pixel-assemble happens on the OBJECT only; all words clear together on a shot change
//  * audio is mixed outside Remotion (ffmpeg mix pass) — this composition renders picture only
const {fontFamily: ANTON} = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const {fontFamily: INTER} = loadInterT('italic', {weights: ['500'], subsets: ['latin']});

const INK = '#0E1A18';
const TEAL = '#0F7C6E';
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const pop = (f: number, d = 14, s = 150) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
const P = (f: string) => staticFile('p3/' + f);

type W = {w: string; sz: string; t: number};
type Line = {t: number; z: 'top' | 'bot'; words: W[]};
type Scene = {id: string; kind: string; s: number; e: number; lines: Line[]};
const scenes = plan.scenes as Scene[];
const FOCUS = plan.focus as Record<string, number>;

const STAGE = {x: 120, y: 600, w: 840, h: 660}; // the object lives here, nowhere else

const Defs: React.FC = () => (
	<svg width={0} height={0} style={{position: 'absolute'}}>
		<defs>
			<filter id="duo2" colorInterpolationFilters="sRGB">
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
// constant field for the whole film — this is what makes it calm
const Field: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 48%, #FBFCFB 0%, #EEF3F2 34%, #CFDDDA 70%, #A6BFBA 100%)'}} />
			{Array.from({length: 16}, (_, i) => {
				const x = random('x' + i) * 1080, y0 = random('y' + i) * 1920, r = 3 + random('r' + i) * 4;
				const y = (y0 - f * (0.35 + 0.5 * random('v' + i))) % 1920;
				return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + 1920 : y, width: r, height: r, borderRadius: r, background: 'rgba(15,124,110,0.16)'}} />;
			})}
		</AbsoluteFill>
	);
};

// ---------------- words ----------------
const Typed: React.FC<{w: W; now: number}> = ({w, now}) => {
	const el = now - w.t;
	if (el < 0) return null;
	const chars = Array.from(w.w);
	const n = Math.min(chars.length, Math.floor(el / 0.032) + 1);
	if (w.sz === 'S') return <span style={{fontFamily: INTER, fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: INK, opacity: interpolate(el, [0, 0.15], [0, 1], clamp)}}>{chars.slice(0, n).join('')}</span>;
	const size = w.w.length > 16 ? 92 : w.w.length > 11 ? 104 : 118;
	return <span style={{fontFamily: ANTON, fontSize: size, lineHeight: 1.0, color: w.sz === 'T' ? TEAL : INK, letterSpacing: 0.5}}>{chars.slice(0, n).join('')}</span>;
};
const Cluster: React.FC<{lines: Line[]; now: number; top: number; anchor: 'top' | 'bottom'}> = ({lines, now, top, anchor}) => (
	<div style={{position: 'absolute', left: 60, right: 60, ...(anchor === 'top' ? {bottom: 1920 - top} : {top}), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
		{lines.map((l, i) => (
			<div key={i} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 12, textAlign: 'center', maxWidth: 940}}>
				{l.words.map((w, j) => <Typed key={j} w={w} now={now} />)}
			</div>
		))}
	</div>
);
// words above the stage (anchored to its top edge) and below it; bullets replace each other
const Words: React.FC<{sc: Scene; f: number}> = ({sc, f}) => {
	const now = sc.s + f / FPS;
	const started = sc.lines.filter((l) => l.t <= now + 0.02);
	const top = started.filter((l) => l.z === 'top').slice(-2);
	const botAll = started.filter((l) => l.z === 'bot');
	const bot = botAll.length && botAll[botAll.length - 1].words[0].sz === 'T' && sc.id === 'portfolio' ? botAll.slice(-1) : botAll.slice(-2);
	return (
		<>
			<Cluster lines={top} now={now} top={STAGE.y - 30} anchor="top" />
			<Cluster lines={bot} now={now} top={STAGE.y + STAGE.h + 40} anchor="bottom" />
		</>
	);
};

// ---------------- object on the stage, assembled from pixels (E14) ----------------
const pixelIn = (f: number, seed: string, dur = 10) => {
	const p = interpolate(f, [0, dur], [0, 1], clamp);
	if (p >= 1) return undefined;
	const C = 14, R = 11, w = STAGE.w / C, h = STAGE.h / R;
	let d = '';
	for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (random(seed + x + '_' + y) < p) d += `M${STAGE.x + x * w} ${STAGE.y + y * h}h${w + 1}v${h + 1}h${-w - 1}z`;
	return `path('${d || 'M0 0'}')`;
};
const Stage: React.FC<{f: number; seed: string; children: React.ReactNode; halo?: boolean}> = ({f, seed, children, halo = true}) => {
	const s = pop(f, 15, 120);
	return (
		<AbsoluteFill style={{clipPath: pixelIn(f, seed)}}>
			{halo ? (
				<div style={{position: 'absolute', left: 540 - 380, top: STAGE.y + STAGE.h / 2 - 380, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 48%, rgba(255,255,255,0) 70%)', transform: `scale(${s * (1 + Math.sin(f / 12) * 0.012)})`}} />
			) : null}
			{children}
		</AbsoluteFill>
	);
};
// focus zoom inside the stage box (photo / cut-out), with depth blur around the focus point
const FocusImg: React.FC<{src: string; f: number; at: number; from: [number, number, number]; to: [number, number, number]; box?: React.CSSProperties}> = ({src, f, at, from, to, box}) => {
	const p = interpolate(f, [fr(at), fr(at) + 14], [0, 1], {...clamp, easing: ease});
	const z = from[2] + (to[2] - from[2]) * p + interpolate(f, [fr(at) + 14, fr(at) + 120], [0, 0.05], clamp);
	const fx = from[0] + (to[0] - from[0]) * p, fy = from[1] + (to[1] - from[1]) * p;
	const blur = interpolate(f, [fr(at), fr(at) + 6, fr(at) + 14], [0, 4, 0], clamp);
	const img = (extra: React.CSSProperties) => <Img src={P(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transformOrigin: `${fx * 100}% ${fy * 100}%`, transform: `scale(${z})`, ...extra}} />;
	return (
		<div style={{position: 'absolute', left: STAGE.x - 60, top: STAGE.y - 80, width: STAGE.w + 120, height: STAGE.h + 160, overflow: 'hidden', WebkitMaskImage: 'radial-gradient(ellipse 60% 58% at 50% 50%, black 62%, transparent 100%)', ...box}}>
			{img({filter: `url(#duo2) blur(${5 * p + blur}px)`})}
			{img({filter: `url(#duo2) blur(${blur}px)`, WebkitMaskImage: `radial-gradient(circle at ${fx * 100}% ${fy * 100}%, black ${interpolate(p, [0, 1], [95, 22])}%, transparent ${interpolate(p, [0, 1], [140, 46])}%)`})}
		</div>
	);
};
const StageImg: React.FC<{src: string; f: number; scale?: number; extra?: React.CSSProperties; duo?: boolean}> = ({src, f, scale = 1, extra, duo = true}) => (
	<Img src={P(src)} style={{position: 'absolute', left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h, objectFit: 'contain', transform: `scale(${scale * interpolate(f, [0, 90], [1, 1.04])})`, filter: `${duo ? 'url(#duo2)' : ''} drop-shadow(0 26px 34px rgba(14,63,57,0.22))`, ...extra}} />
);

// ================= shots =================
type SP = {sc: Scene; f: number};
const Surgeon: React.FC<SP> = ({sc, f}) => (
	<>
		<Stage f={f} seed="surgeon"><FocusImg src="surgeon_cut.png" f={f} at={FOCUS.surgeon} from={[0.5, 0.45, 1.0]} to={[0.45, 0.25, 1.18]} /></Stage>
		<Words sc={sc} f={f} />
	</>
);
const Scalpel: React.FC<SP> = ({sc, f}) => (
	<>
		<FocusImg src="surgeon_cut.png" f={f} at={FOCUS.scalpel} from={[0.45, 0.25, 1.18]} to={[0.16, 0.78, 2.5]} />
		<Words sc={sc} f={f} />
	</>
);
const Incision: React.FC<SP> = ({sc, f}) => {
	const cut = interpolate(f, [24, 46], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	return (
		<>
			<Stage f={f} seed="incision" halo={false}>
				<div style={{position: 'absolute', left: STAGE.x - 60, top: STAGE.y - 80, width: STAGE.w + 120, height: STAGE.h + 160, overflow: 'hidden', mixBlendMode: 'multiply', WebkitMaskImage: 'radial-gradient(ellipse 60% 58% at 50% 50%, black 60%, transparent 100%)'}}>
					<OffthreadVideo src={P('incision.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 62%', filter: 'url(#duo2) brightness(1.08)', transform: 'scale(1.15)'}} />
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute'}}>
					<path d="M 250 1080 C 420 1068, 640 1092, 830 1074" stroke={TEAL} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cut} style={{filter: `drop-shadow(0 0 10px ${TEAL})`}} />
				</svg>
			</Stage>
			<Words sc={sc} f={f} />
		</>
	);
};
const Cut: React.FC<SP> = ({sc, f}) => {
	const d = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
	const sweep = interpolate(f, [10, 34], [-0.2, 1.2], clamp);
	return (
		<>
			<Stage f={f} seed="cut">
				<svg width={1080} height={1920} style={{position: 'absolute'}}>
					<defs>
						<linearGradient id="cutg2" x1="0" x2="1">
							<stop offset={Math.max(0, sweep - 0.12)} stopColor={TEAL} />
							<stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#FFFFFF" />
							<stop offset={Math.min(1, sweep + 0.12)} stopColor={TEAL} />
						</linearGradient>
					</defs>
					<path d="M 200 935 C 400 912, 680 958, 880 925" stroke="url(#cutg2)" strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} style={{filter: `drop-shadow(0 0 14px ${TEAL})`}} />
				</svg>
			</Stage>
			<Words sc={sc} f={f} />
		</>
	);
};
const BANDS = [0, 0.4, 0.56, 0.63, 1];
const Layers: React.FC<SP> = ({sc, f}) => {
	const by = fr(sc.lines[sc.lines.length - 1].t - sc.s);
	const ex = interpolate(f, [by - 4, by + 10], [0, 1], {...clamp, easing: ease});
	return (
		<>
			<Stage f={f} seed="layers">
				{BANDS.slice(0, -1).map((b, i) => (
					<StageImg key={i} src="layers.png" f={f} extra={{clipPath: `inset(${b * 100}% 0 ${(1 - BANDS[i + 1]) * 100}% 0)`, translate: `0 ${(i - 1.5) * 42 * ex}px`}} />
				))}
			</Stage>
			<Words sc={sc} f={f} />
		</>
	);
};
const Suture: React.FC<SP> = ({sc, f}) => (
	<>
		<Stage f={f} seed="suture"><FocusImg src="suture_cut.png" f={f} at={FOCUS.suture} from={[0.5, 0.5, 1.0]} to={[0.72, 0.42, 1.7]} /></Stage>
		<Words sc={sc} f={f} />
	</>
);
const Stitch: React.FC<SP> = ({sc, f}) => {
	const st = fr(sc.lines[1].t - sc.s);
	return (
		<>
			<Stage f={f} seed="stitch">
				<div style={{position: 'absolute', left: STAGE.x - 40, top: STAGE.y - 60, width: STAGE.w + 80, height: STAGE.h + 120, overflow: 'hidden', mixBlendMode: 'multiply', WebkitMaskImage: 'radial-gradient(ellipse 58% 56% at 50% 50%, black 60%, transparent 100%)'}}>
					<Img src={P('stitch.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'url(#duo2) brightness(1.06)', transform: `scale(${interpolate(f, [0, 80], [1.05, 1.12])})`}} />
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute'}}>
					{Array.from({length: 6}, (_, i) => {
						const d = interpolate(f, [st + 3 + i * 4, st + 7 + i * 4], [0, 1], clamp);
						const x = 640 - i * 52, y = 760 + i * 70;
						return <path key={i} d={`M ${x - 30} ${y - 18} L ${x + 30} ${y + 18}`} stroke={TEAL} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />;
					})}
				</svg>
			</Stage>
			<Words sc={sc} f={f} />
		</>
	);
};
const Art: React.FC<SP> = ({sc, f}) => {
	const wipe = interpolate(f, [2, 20], [100, 0], {...clamp, easing: ease});
	return (
		<>
			<Stage f={f} seed="art"><StageImg src="art.png" f={f} duo={false} extra={{clipPath: `inset(0 0 ${wipe}% 0)`}} /></Stage>
			<Words sc={sc} f={f} />
		</>
	);
};
const Laptop: React.FC<{f: number; src: string; from: number; rate?: number; scale?: number; origin?: string}> = ({f, src, from, rate = 1, scale = 1, origin = '50% 50%'}) => (
	<div style={{position: 'absolute', left: 150, top: 700, width: 780, transform: `scale(${scale}) translateY(${Math.sin(f / 22) * 5}px)`, transformOrigin: origin}}>
		<div style={{background: '#1B1F1E', borderRadius: '22px 22px 6px 6px', padding: 14, boxShadow: '0 50px 80px rgba(14,63,57,0.3)'}}>
			<div style={{height: 430, borderRadius: 6, overflow: 'hidden', background: '#fff'}}>
				<OffthreadVideo src={P(src)} muted startFrom={fr(from)} playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</div>
		</div>
		<div style={{height: 20, margin: '0 -40px', background: 'linear-gradient(#D9E2E0,#A9B9B6)', borderRadius: '0 0 24px 24px'}} />
	</div>
);
const LaptopShot: React.FC<SP> = ({sc, f}) => <Words sc={sc} f={f} />;
const Hero: React.FC<SP> = ({sc, f}) => <Words sc={sc} f={f} />;
const Scroll: React.FC<SP> = ({sc, f}) => <Words sc={sc} f={f} />;

// ---- tracking shot #1: one continuous camera move across the website (no cuts) ----
// dolly in from far -> settle on the hero -> track down with the scroll; foreground glass/dust moves faster (parallax)
const WebTrack: React.FC = () => {
	const f = useCurrentFrame();
	const L = scenes.find((x) => x.id === 'laptop')!, H = scenes.find((x) => x.id === 'hero')!, S = scenes.find((x) => x.id === 'scroll')!;
	const t = L.s + f / FPS;
	const k = (a: number, b: number) => interpolate(t, [a, b], [0, 1], {...clamp, easing: ease});
	const dolly = k(L.s, L.s + 1.2) * 0.25 + k(H.s + FOCUS.hero, H.s + FOCUS.hero + 0.55) * 0.35; // 0.85 -> 1.45
	const scale = 0.85 + dolly;
	const down = k(S.s + 0.1, S.e) * 160; // camera tracks down with the page
	const camX = interpolate(t, [L.s, S.e], [30, -30]); // slow lateral drift = tracking feel
	const inn = pop(f, 15, 110);
	const scrollIn = interpolate(t, [S.s, S.s + 0.35], [0, 1], clamp);
	const click = S.s + 0.6;
	const cp = pop(fr(t - click), 8, 300);
	return (
		<AbsoluteFill>
			{/* background parallax: dust drifts slower than the camera */}
			{Array.from({length: 10}, (_, i) => (
				<div key={i} style={{position: 'absolute', left: (random('bx' + i) * 1300 - 110) + camX * 0.4, top: random('by' + i) * 1920 - down * 0.3, width: 10, height: 10, borderRadius: 5, background: 'rgba(15,124,110,0.14)'}} />
			))}
			<div style={{position: 'absolute', left: 150 + camX, top: 700 - down * 0.25, width: 780, transform: `translateY(${(1 - inn) * 400}px) scale(${scale})`, transformOrigin: '50% 40%', opacity: inn}}>
				<div style={{background: '#1B1F1E', borderRadius: '22px 22px 6px 6px', padding: 14, boxShadow: '0 50px 80px rgba(14,63,57,0.3)'}}>
					<div style={{height: 430, borderRadius: 6, overflow: 'hidden', background: '#fff', position: 'relative'}}>
						<OffthreadVideo src={P('site_surgeon.mp4')} muted playbackRate={0.3} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
						<Sequence from={fr(S.s - L.s)} layout="none">
							<OffthreadVideo src={P('site_surgeon.mp4')} muted startFrom={fr(5.5)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: scrollIn}} />
						</Sequence>
						<div style={{position: 'absolute', inset: 6, border: `4px solid ${TEAL}`, borderRadius: 6, opacity: k(H.s + FOCUS.hero + 0.5, H.s + FOCUS.hero + 0.9) * (1 - scrollIn)}} />
					</div>
				</div>
				<div style={{height: 20, margin: '0 -40px', background: 'linear-gradient(#D9E2E0,#A9B9B6)', borderRadius: '0 0 24px 24px'}} />
				{t >= S.s ? (
					<div style={{position: 'absolute', left: interpolate(t, [S.s, click], [700, 470], {...clamp, easing: ease}), top: interpolate(t, [S.s, click], [430, 250], {...clamp, easing: ease})}}>
						<svg width={44} height={56} viewBox="0 0 24 30"><path d="M2 2 L2 24 L8 18 L12 28 L16 26 L12 17 L20 17 Z" fill="#fff" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" /></svg>
						<div style={{position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 22, border: `4px solid ${TEAL}`, opacity: t >= click ? 1 - cp * 0.9 : 0, transform: `scale(${0.4 + cp})`}} />
					</div>
				) : null}
			</div>
			{/* foreground parallax: soft glass discs pass faster than the camera, blurred (depth) */}
			{Array.from({length: 5}, (_, i) => (
				<div key={'g' + i} style={{position: 'absolute', left: random('gx' + i) * 1200 - 60 + camX * 2.4 - (t - L.s) * 40, top: 420 + random('gy' + i) * 1100 - down * 1.4, width: 90 + random('gs' + i) * 80, height: 90 + random('gs' + i) * 80, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7), rgba(15,124,110,0.12))', filter: 'blur(6px)', opacity: 0.55}} />
			))}
		</AbsoluteFill>
	);
};
const Shadly: React.FC<SP> = ({sc, f}) => (
	<>
		<Stage f={f} seed="shadly"><StageImg src="shadly.png" f={f} scale={1.08} /></Stage>
		<Words sc={sc} f={f} />
	</>
);
const CARDS = [
	{src: 'card_sikdar.mp4', url: 'sikdardentalpoint.com', rate: 1, obj: 'bulb.png'},
	{src: 'card_clientb.mp4', url: 'Client-B doctor.com', rate: 1, obj: 'diamond.png'},
	{src: 'site_surgeon.mp4', url: 'drclientd.com', rate: 0.5, obj: 'globe.png'},
	{src: 'card_arif.mp4', url: 'Client-A doctoruddinkhan.com', rate: 0.6, obj: 'trophy.png'},
];
const BUL = ['INNOVATIVE', 'PREMIUM', 'INTERNATIONAL STANDARD', 'WORLD CLASS'];
// ---- tracking shot #2: the camera trucks sideways along a row of live websites; objects pass in the foreground ----
// phone -> Sikdar -> ClientB -> ClientD -> Client-A, then pull back: the row folds into the 2x2 grid on "WORLD CLASS"
const SLOT = 880; // distance between items on the row
const Portfolio: React.FC<SP> = ({sc, f}) => {
	const bl = BUL.map((b) => fr(sc.lines.flatMap((l) => l.words).find((w) => w.w === b)!.t - sc.s));
	// one continuous glide (no stop-start): each card crosses centre exactly on its word, Client-A lands on WORLD CLASS
	const cam = interpolate(f, [bl[0] - 14, bl[0], bl[1], bl[2], bl[3]], [0, 1, 2, 3, 4], {...clamp, easing: (x) => x});
	const camDrift = interpolate(f, [0, bl[0] - 14], [0, 40], clamp); // slow creep while the phone is on screen
	const camX = cam * SLOT + camDrift;
	const grid = interpolate(f, [bl[3] - 4, bl[3] + 14], [0, 1], {...clamp, easing: ease});
	const inn = pop(f, 15, 110);
	const itemX = (i: number) => 540 + i * SLOT - camX; // centre x of item i on screen
	return (
		<>
			{/* background dust: slower than camera */}
			{Array.from({length: 12}, (_, i) => (
				<div key={i} style={{position: 'absolute', left: ((random('px' + i) * 2400 - camX * 0.35) % 1300 + 1300) % 1300 - 110, top: 300 + random('py' + i) * 1400, width: 9, height: 9, borderRadius: 5, background: 'rgba(15,124,110,0.14)'}} />
			))}
			{/* phone */}
			<div style={{position: 'absolute', left: itemX(0) - 150, top: 610, width: 300, height: 640, borderRadius: 44, background: '#0E1A18', padding: 10, boxShadow: '0 40px 80px rgba(14,63,57,0.3)', transform: `translateY(${(1 - inn) * 500}px)`, opacity: 1 - grid}}>
				<div style={{width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden'}}>
					<OffthreadVideo src={P('site_bi_phone.mp4')} muted startFrom={fr(8)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
				</div>
			</div>
			{/* cards on the row; on WORLD CLASS they fold into a 2x2 grid */}
			{CARDS.map((c, i) => {
				const W0 = 760;
				const rowX = itemX(i + 1) - W0 / 2, rowY = 720;
				const col = i % 2, row = Math.floor(i / 2);
				const x = interpolate(grid, [0, 1], [rowX, col ? 548 : 32]);
				const y = interpolate(grid, [0, 1], [rowY, 640 + row * 300]);
				const w = interpolate(grid, [0, 1], [W0, 500]);
				const focus = Math.max(0, 1 - Math.abs(itemX(i + 1) - 540) / SLOT); // 1 when centred
				return (
					<div key={i} style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${interpolate(grid, [0, 1], [0.86 + 0.14 * focus, 1])})`, opacity: interpolate(grid, [0, 1], [0.55 + 0.45 * focus, 1])}}>
						<div style={{borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 40px 80px rgba(14,63,57,0.28)'}}>
							<div style={{height: 28, background: '#EEF3F2', display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 14}}>
								{['#ff5f57', '#febc2e', '#28c840'].map((cc) => <div key={cc} style={{width: 9, height: 9, borderRadius: 5, background: cc}} />)}
								<div style={{marginLeft: 10, fontFamily: 'Arial', fontSize: 12, color: '#888'}}>{c.url}</div>
							</div>
							<div style={{aspectRatio: '16 / 9'}}>
								<Sequence from={Math.max(0, bl[i] - 30)} layout="none"><OffthreadVideo src={P(c.src)} muted playbackRate={c.rate} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
							</div>
						</div>
					</div>
				);
			})}
			{/* foreground objects: pass faster than the camera (parallax), soft depth blur */}
			{CARDS.map((c, i) => {
				const fx = 540 + ((i + 1) * SLOT - camX) * 1.5 + 300;
				return <Img key={'o' + i} src={P(c.obj)} style={{position: 'absolute', left: fx - 115, top: 1000, width: 230, opacity: 1 - grid, filter: `url(#duo2) blur(${Math.min(5, Math.abs(fx - 840) / 120)}px) drop-shadow(0 20px 24px rgba(14,63,57,0.3))`, transform: `translateY(${Math.sin(f / 14 + i) * 10}px)`}} />;
			})}
			<Words sc={sc} f={f} />
		</>
	);
};
const Ending: React.FC<SP> = ({sc, f}) => {
	const now = sc.s + f / FPS;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<OffthreadVideo src={P('ending.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			<div style={{position: 'absolute', left: 60, right: 60, top: 1290, display: 'flex', justifyContent: 'center', columnGap: 18, flexWrap: 'wrap'}}>
				{sc.lines[0].words.map((w, i) => {
					const el = now - w.t;
					if (el < 0) return null;
					const ch = Array.from(w.w);
					return <span key={i} style={{fontFamily: ANTON, fontSize: 110, color: w.sz === 'T' ? '#8FE3D6' : '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.55)'}}>{ch.slice(0, Math.min(ch.length, Math.floor(el / 0.032) + 1)).join('')}</span>;
				})}
			</div>
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 6], [0.7, 0], clamp)}} />
		</AbsoluteFill>
	);
};
const MAP: Record<string, React.FC<SP>> = {surgeon: Surgeon, scalpel: Scalpel, incision: Incision, cut: Cut, layers: Layers, suture: Suture, stitch: Stitch, art: Art, laptop: LaptopShot, hero: Hero, scroll: Scroll, shadly: Shadly, portfolio: Portfolio, ending: Ending};
const Run: React.FC<{sc: Scene}> = ({sc}) => {
	const f = useCurrentFrame();
	const C = MAP[sc.id];
	return <AbsoluteFill><C sc={sc} f={f} /></AbsoluteFill>;
};

// picture only; audio is mixed in the ffmpeg pass
export const P3V2: React.FC = () => (
	<AbsoluteFill>
		<Defs />
		<Field />
		{(() => {
			const L = scenes.find((x) => x.id === 'laptop')!, S = scenes.find((x) => x.id === 'scroll')!;
			return (
				<Sequence from={fr(L.s)} durationInFrames={fr(S.e - L.s)}>
					<WebTrack />
				</Sequence>
			);
		})()}
		{scenes.map((sc) => (
			<Sequence key={sc.id} from={fr(sc.s)} durationInFrames={fr(sc.e - sc.s)}>
				<Run sc={sc} />
			</Sequence>
		))}
	</AbsoluteFill>
);
