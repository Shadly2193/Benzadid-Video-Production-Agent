import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, continueRender, delayRender} from 'remotion';
import E from './j005v2_events.json';
import TR from './j005v2_track.json';

// JOB-005 v2. All times = v2 seconds (base_v2.mp4, 64.53 s). Props: qa=true -> overlays only (no base, no matte) for face-overlap QA.
export const J005V2_TOTAL = 64.533;
const FPS = 30;
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OR = '#FF6A00', CREAM = '#FFF0E0', INK = '#1a0d05';
const P = (f: string) => staticFile('j005/' + f);
const Q = (f: string) => staticFile('j005v2/' + f);
const HIND = '"Hind Siliguri"';
const fr = (s: number) => Math.round(s * FPS);
const EV = (E as any).ev as {id: string; t: number; t1?: number}[];
const T = (id: string) => EV.find((e) => e.id === id)!.t;
const T1 = (id: string) => EV.find((e) => e.id === id)!.t1 as number;
const sp = (f: number, d = 14, s = 200) => (f < 0 ? 0 : spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}}));
const FACES = (TR as any).faces as number[][];
const HANDS = (TR as any).hands as {f: number; x: number; y: number}[];
const ease = Easing.inOut(Easing.cubic);

const useFonts = () => {
	const [h] = useState(() => delayRender('fonts'));
	useEffect(() => {
		const list = [
			new FontFace('Hind Siliguri', `url(${P('fonts/HindSiliguri-SemiBold.ttf')})`, {weight: '600'}),
			new FontFace('Hind Siliguri', `url(${P('fonts/HindSiliguri-Bold.ttf')})`, {weight: '700'}),
			new FontFace('AntonLocal', `url(${P('fonts/Anton-Regular.ttf')})`, {weight: '400'}),
		];
		Promise.all(list.map((f) => f.load())).then((fs) => {
			fs.forEach((f) => (document.fonts as any).add(f));
			continueRender(h);
		}).catch(() => continueRender(h));
	}, [h]);
};

// element life by id: spring in at t, fast out at t1 (gone at t1+0.2)
const useLife = (id: string) => {
	const f = useCurrentFrame();
	const t = f / FPS, t0 = T(id), t1 = T1(id);
	if (t < t0 || t >= t1 + 0.2) return {s: 0, op: 0, t, f, lf: 0};
	const sin = sp(f - fr(t0));
	const out = interpolate(t, [t1, t1 + 0.2], [1, 0], C);
	return {s: sin * (0.75 + 0.25 * out), op: Math.min(1, sin * 1.6) * out, t, f, lf: f - fr(t0)};
};

// ---------- camera / focus-zoom ----------
type Cam = {a: number; b: number; s: number; ox: number; oy: number; inDur: number; outDur: number};
export const camAt = (t: number) => {
	for (const c of (E as any).cam as Cam[]) {
		if (t >= c.a && t < c.b + c.outDur) {
			const k = t < c.b ? ease(Math.min(1, (t - c.a) / c.inDur)) : 1 - ease(Math.min(1, (t - c.b) / c.outDur));
			return {k, s: 1 + (c.s - 1) * k, ox: c.ox, oy: c.oy};
		}
	}
	return {k: 0, s: 1, ox: 0, oy: 960};
};

const glass: React.CSSProperties = {
	background: 'linear-gradient(135deg, rgba(22,16,12,0.80), rgba(36,24,16,0.66))',
	backdropFilter: 'blur(18px) saturate(1.2)', WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
	border: '2px solid rgba(255,225,190,0.32)', borderRadius: 30,
	boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
};

const MONO = new Set(['openai', 'github', 'vercel', 'supabase_si']);
const Logo: React.FC<{k: string; size: number; color?: string}> = ({k, size, color = '#fff'}) =>
	MONO.has(k) ? (
		<div style={{width: size, height: size, background: color, WebkitMaskImage: `url(${P('logos/' + k + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
	) : (
		<Img src={P('logos/' + k + '.svg')} style={{width: size, height: size}} />
	);

const Ic: React.FC<{k: string; size?: number; color?: string; sw?: number}> = ({k, size = 40, color = OR, sw = 2}) => {
	const st = {fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const d: Record<string, React.ReactNode> = {
		check: <path d="M5 12.5l4.5 4.5L19 7" {...st} />,
		x: <path d="M6 6l12 12M18 6L6 18" {...st} />,
		ui: <><rect x={3} y={4} width={18} height={14} rx={2} {...st} /><path d="M3 8h18" {...st} /></>,
		server: <><rect x={3} y={4} width={18} height={6} rx={1.5} {...st} /><rect x={3} y={14} width={18} height={6} rx={1.5} {...st} /><path d="M7 7h.01M7 17h.01" {...st} /></>,
	};
	return <svg width={size} height={size} viewBox="0 0 24 24">{d[k]}</svg>;
};

// ---------- base with focus-zoom (dim + blur + push) ----------
const Base: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const c = camAt(t);
	return (
		<AbsoluteFill style={{transform: `scale(${c.s})`, transformOrigin: `${c.ox}px ${c.oy}px`, filter: c.k > 0.001 ? `brightness(${1 - 0.55 * c.k}) blur(${12 * c.k}px)` : undefined}}>
			<OffthreadVideo src={Q('base.mp4')} muted style={{width: 1080, height: 1920}} />
		</AbsoluteFill>
	);
};
// person matte (over behind-head layers)
const Matte: React.FC = () => (
	<>
		{(E as any).matte.map((m: any) => (
			<Sequence key={m.id} from={m.f0} durationInFrames={m.f1 - m.f0} layout="none">
				<AbsoluteFill><OffthreadVideo src={Q('matte_' + m.id + '.webm')} transparent muted style={{width: 1080, height: 1920}} /></AbsoluteFill>
			</Sequence>
		))}
	</>
);
// focus-zoom stage: elements inside get pushed with the camera (scale toward them)
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => {
	const c = camAt(useCurrentFrame() / FPS);
	return <AbsoluteFill style={{transform: `scale(${0.92 + 0.08 * c.k})`, transformOrigin: '0px 960px'}}>{children}</AbsoluteFill>;
};

// ---------- HOOK: MY AI STACK behind head ----------
const Title: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t < T('title') || t > T1('title')) return null;
	const inn = interpolate(t, [T('title'), T('title') + 0.35], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const out = interpolate(t, [T('titleout'), T1('title')], [1, 0], {...C, easing: Easing.in(Easing.cubic)});
	const sh = (a: number) => interpolate(t, [a, a + 0.38], [-60, 160], C);
	const pos = t < T('shim2') ? sh(T('shim1')) : sh(T('shim2'));
	const fill = `linear-gradient(100deg, ${CREAM} 0%, ${CREAM} ${pos - 18}%, #ffffff ${pos - 4}%, #FFD2A8 ${pos}%, #ffffff ${pos + 4}%, ${CREAM} ${pos + 18}%, ${CREAM} 100%)`;
	const fillO = `linear-gradient(100deg, ${OR} 0%, ${OR} ${pos - 18}%, #FFE2C6 ${pos}%, ${OR} ${pos + 18}%, ${OR} 100%)`;
	const txt = (s: string, sz: number, bg: string) => (
		<div style={{fontFamily: 'AntonLocal', fontSize: sz, lineHeight: 1, textAlign: 'center', transform: 'scaleY(1.2)', backgroundImage: bg, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', letterSpacing: 6}}>{s}</div>
	);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 210, opacity: inn * out, transform: `translateY(${(1 - inn) * 30 - (1 - out) * 40}px) scale(${0.96 + 0.04 * inn})`, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,.55))'}}>
			{txt('MY AI', 150, fill)}
			<div style={{height: 34}} />
			{txt('STACK', 250, fillO)}
		</div>
	);
};
const HookChips: React.FC = () => {
	const logos = ['openai', 'gemini-color', 'claude-color', 'google-color', 'supabase_si', 'vercel'];
	const f = useCurrentFrame();
	return (
		<>
			{logos.map((l, i) => {
				const L = useLife('hk' + i);
				if (!L.op) return null;
				return (
					<div key={l} style={{position: 'absolute', left: 60 + (i % 3) * 112, top: 760 + Math.floor(i / 3) * 112, width: 96, height: 96, ...glass, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${L.s})`, opacity: L.op}}>
						<Logo k={l} size={56} color={l === 'supabase_si' ? '#3ECF8E' : '#fff'} />
					</div>
				);
			})}
		</>
	);
};

// ---------- PLAN chips (+50 px right vs v1) ----------
const X0 = 86;
const Badge: React.FC<{id: string; n: string; label: string; x?: number}> = ({id, n, label, x = X0}) => {
	const {s, op} = useLife(id);
	if (!op) return null;
	return (
		<div style={{position: 'absolute', left: x, top: 300, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${s})`, transformOrigin: 'left center', opacity: op}}>
			<div style={{fontFamily: 'AntonLocal', fontSize: 64, color: OR, transform: 'scaleY(1.2)'}}>{n}</div>
			<div style={{fontFamily: 'AntonLocal', fontSize: 50, color: CREAM, letterSpacing: 3, textShadow: '0 4px 14px rgba(0,0,0,.6)'}}>{label}</div>
		</div>
	);
};
const Node: React.FC<{id: string; text: string; y: number; tag?: boolean; line?: boolean}> = ({id, text, y, tag, line = true}) => {
	const {s, op, lf} = useLife(id);
	if (!op) return null;
	const draw = interpolate(lf, [0, 8], [0, 1], C);
	return (
		<>
			{line ? <div style={{position: 'absolute', left: X0 + 36, top: y - 34, width: 4, height: 34 * draw, background: OR, opacity: op}} /> : null}
			<div style={{position: 'absolute', left: X0, top: y, ...glass, borderRadius: 24, padding: '8px 24px', fontFamily: HIND, fontWeight: 700, fontSize: 36, color: tag ? OR : CREAM, transform: `scale(${s})`, transformOrigin: 'left center', opacity: op, whiteSpace: 'nowrap'}}>{text}</div>
		</>
	);
};
const Plan: React.FC = () => {
	const chk = useLife('plancheck');
	return (
		<>
			<Badge id="badge1" n="01" label="PLAN" />
			<Node id="n_sys" text="System design" y={410} line={false} />
			<Node id="n_plan" text="Planning" y={506} />
			<Node id="n_spec" text="Specialty" y={602} tag />
			<Node id="n_cont" text="Content" y={698} tag />
			<Node id="n_struct" text="Structure" y={794} tag />
			{['Home', 'Services', 'About', 'Contact'].map((p, i) => {
				const l = useLife('pg' + i);
				if (!l.op) return null;
				return <div key={p} style={{position: 'absolute', left: X0 + (i % 2) * 168, top: 896 + Math.floor(i / 2) * 64, background: OR, color: INK, fontFamily: HIND, fontWeight: 700, fontSize: 28, padding: '4px 20px', borderRadius: 20, transform: `scale(${l.s})`, opacity: l.op, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{p}</div>;
			})}
			{chk.op ? <div style={{position: 'absolute', left: X0 + 200, top: 300, width: 76, height: 76, borderRadius: 38, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk.s})`, opacity: chk.op}}><Ic k="check" size={50} color={INK} sw={3} /></div> : null}
		</>
	);
};

// ---------- compact tool chips ----------
const ToolChip: React.FC<{id: string; logo: string; name: string; sub: string; y: number; tint?: string}> = ({id, logo, name, sub, y, tint = '#fff'}) => {
	const {s, op} = useLife(id);
	if (!op) return null;
	return (
		<div style={{position: 'absolute', left: 60, top: y, width: 340, height: 112, ...glass, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', boxSizing: 'border-box', transform: `scale(${s})`, transformOrigin: 'left center', opacity: op}}>
			<Logo k={logo} size={64} color={tint} />
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 40, color: CREAM, lineHeight: 1.05, whiteSpace: 'nowrap'}}>{name}</div>
				<div style={{fontFamily: HIND, fontWeight: 600, fontSize: 22, color: OR, letterSpacing: 1}}>{sub}</div>
			</div>
		</div>
	);
};
const Stack1: React.FC = () => {
	const q = useLife('paidq'), ok = useLife('paidok');
	const ring = interpolate(ok.lf, [0, 14], [0, 1], C);
	return (
		<>
			<ToolChip id="chatgpt" logo="openai" name="ChatGPT" sub="PLAN" y={400} />
			<ToolChip id="gemini" logo="gemini-color" name="Gemini" sub="PLAN" y={528} />
			<ToolChip id="claude1" logo="claude-color" name="Claude" sub="PLAN" y={656} />
			{q.op ? <div style={{position: 'absolute', left: 60, top: 792, transform: `scale(${q.s})`, transformOrigin: 'left center', opacity: q.op, border: `4px solid ${OR}`, borderRadius: 16, padding: '0 22px', fontFamily: 'AntonLocal', fontSize: 58, color: CREAM, letterSpacing: 3, background: 'rgba(20,12,6,0.7)'}}>PAID?</div> : null}
			{ok.op ? (
				<div style={{position: 'absolute', left: 250, top: 790, width: 0, height: 0}}>
					<div style={{position: 'absolute', left: -18 - 25 * ring, top: 82 - 25 * ring, width: 200 + 50 * ring, height: 200 + 50 * ring, borderRadius: '50%', border: `4px solid ${OR}`, opacity: (1 - ring) * ok.op, boxSizing: 'border-box', transform: 'translate(0,0)'}} />
					<div style={{position: 'absolute', left: 0, top: 100, width: 164, height: 164, borderRadius: 82, background: OR, boxShadow: '0 0 40px rgba(255,106,0,.65), 0 14px 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${ok.s})`, opacity: ok.op}}>
						<Ic k="check" size={118} color="#fff" sw={3.2} />
					</div>
				</div>
			) : null}
		</>
	);
};

// ---------- 02 HERO badge + wireframe ----------
const HeroBadge: React.FC = () => {
	const l = useLife('wire');
	const d = interpolate(l.lf, [0, 30], [1, 0], C);
	const W = 330, Hh = 210;
	return (
		<>
			<Badge id="badge2" n="02" label="HERO VISUAL" x={60} />
			{l.op ? (
				<div style={{position: 'absolute', left: 60, top: 430, width: W, height: Hh, opacity: l.op, transform: `scale(${l.s})`, transformOrigin: 'left center'}}>
					<svg width={W} height={Hh} viewBox="0 0 330 210">
						<rect x={3} y={3} width={324} height={204} rx={18} fill="rgba(255,240,224,0.07)" stroke={OR} strokeWidth={4} strokeDasharray={1100} strokeDashoffset={1100 * d} />
						<rect x={24} y={30} width={150} height={22} rx={6} fill={OR} opacity={interpolate(l.lf, [14, 24], [0, 0.9], C)} />
						<rect x={24} y={66} width={110} height={12} rx={6} fill={CREAM} opacity={interpolate(l.lf, [20, 30], [0, 0.7], C)} />
						<rect x={24} y={88} width={84} height={12} rx={6} fill={CREAM} opacity={interpolate(l.lf, [24, 34], [0, 0.5], C)} />
						<circle cx={252} cy={118} r={56} fill="none" stroke={OR} strokeWidth={4} strokeDasharray={360} strokeDashoffset={360 * interpolate(l.lf, [8, 40], [1, 0], C)} />
						<rect x={24} y={152} width={86} height={28} rx={14} fill={OR} opacity={interpolate(l.lf, [30, 40], [0, 1], C)} />
					</svg>
				</div>
			) : null}
		</>
	);
};

// ---------- device frames ----------
const Phone: React.FC<{w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
	<div style={{width: w, height: h, borderRadius: w * 0.14, background: '#0c0805', padding: w * 0.04, boxSizing: 'border-box', boxShadow: '0 30px 70px rgba(0,0,0,.6), inset 0 0 0 2px #4a3a2e', ...style}}>
		<div style={{width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
	</div>
);
const Desk: React.FC<{w: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, children, style}) => (
	<div style={{width: w, borderRadius: 16, background: '#0c0805', padding: 8, boxSizing: 'border-box', boxShadow: '0 30px 70px rgba(0,0,0,.6), inset 0 0 0 2px #4a3a2e', ...style}}>
		<div style={{width: '100%', height: (w - 16) * 0.625, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
	</div>
);

// ---------- HERO showcase (focus-zoom, each once) ----------
const Showcase: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const a = useLife('hero_clientb'), b = useLife('hero_clientc'), c = useLife('hero_clientd');
	const fl = (k: number) => Math.sin(t * 1.2 + k) * 8;
	const slide = (L: typeof a) => `translateX(${(1 - L.s) * -120}px)`;
	return (
		<Stage>
			{a.op ? (
				<Phone w={290} h={600} style={{position: 'absolute', left: 110, top: 420 + fl(0), transform: `${slide(a)} rotate(${-3 * a.s}deg)`, opacity: a.op}}>
					<Img src={P('clientb_mobile.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</Phone>
			) : null}
			{b.op ? (
				<Desk w={390} style={{position: 'absolute', left: 30, top: 600 + fl(1), transform: slide(b), transformOrigin: 'left center', opacity: b.op}}>
					<Img src={P('clientc_desktop.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
				</Desk>
			) : null}
			{c.op ? (
				<Phone w={300} h={600} style={{position: 'absolute', left: 110, top: 420 + fl(2), transform: `${slide(c)} rotate(${2 * c.s}deg)`, opacity: c.op}}>
					<Sequence from={fr(T('hero_clientd'))} layout="none"><OffthreadVideo src={P('clientd916.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></Sequence>
				</Phone>
			) : null}
		</Stage>
	);
};

// ---------- image-tools chips ----------
const Tools2: React.FC = () => (
	<>
		<ToolChip id="claude2" logo="claude-color" name="Claude" sub="IMAGINE" y={420} />
		<ToolChip id="flow" logo="google-color" name="Google Flow" sub="IMAGE · VIDEO" y={548} />
		<ToolChip id="chatgpt2" logo="openai" name="ChatGPT" sub="IMAGE" y={676} />
	</>
);

// ---------- Claude interface (focus-zoom), OFF exactly at 40.04 ----------
const CODE: [string, string][][] = [
	[['const ', OR], ['hero ', CREAM], ['= ', '#c9a47c'], ['gsap', '#FFD9A0'], ['.timeline()', CREAM]],
	[['hero.', CREAM], ['from', OR], ["('.title', {", '#FFD9A0']],
	[['  y: ', '#c9a47c'], ['80', OR], [', opacity: ', '#c9a47c'], ['0', OR]],
	[['})', '#FFD9A0']],
	[['ScrollTrigger', CREAM], ['.create', OR], ['({', CREAM]],
	[['  scrub: ', '#c9a47c'], ['true', OR], [' })', CREAM]],
];
const ClaudeUI: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const t0 = T('claudeui'), off = T1('claudeui');
	if (t < t0 || t >= off + 0.1) return null;
	const inn = sp(f - fr(t0), 16, 180);
	const out = interpolate(t, [off, off + 0.1], [1, 0], C); // hard OFF in 3 frames
	let budget = Math.max(0, (t - T('typing')) * 34);
	return (
		<Stage>
			<div style={{position: 'absolute', left: 30, top: 400, width: 430, height: 600, borderRadius: 28, background: 'rgba(30,26,22,0.94)', border: '2px solid rgba(255,255,255,0.14)', boxShadow: '0 30px 80px rgba(0,0,0,.6)', opacity: Math.min(1, inn * 1.5) * out, transform: `translateY(${(1 - inn) * 40}px) scale(${0.94 + 0.06 * inn})`, transformOrigin: 'left center', padding: 24, boxSizing: 'border-box', overflow: 'hidden'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}>
					<Logo k="claude-color" size={44} />
					<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 34, color: CREAM}}>Claude</div>
				</div>
				<div style={{marginLeft: 'auto', width: 330, background: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: '12px 16px', fontFamily: HIND, fontWeight: 600, fontSize: 24, color: CREAM, lineHeight: 1.3, opacity: interpolate(t, [t0 + 0.15, t0 + 0.35], [0, 1], C)}}>Build the hero animation from my design + plan</div>
				<div style={{marginTop: 20, background: 'rgba(0,0,0,0.35)', borderRadius: 14, padding: '14px 16px', height: 300, boxSizing: 'border-box'}}>
					{CODE.map((line, i) => (
						<div key={i} style={{fontFamily: 'Consolas, "Courier New", monospace', fontSize: 22, lineHeight: 1.6, whiteSpace: 'pre', height: 44}}>
							{line.map(([txt, col], j) => {
								const n = Math.max(0, Math.min(txt.length, Math.floor(budget)));
								budget -= txt.length;
								return <span key={j} style={{color: col}}>{txt.slice(0, n)}</span>;
							})}
						</div>
					))}
				</div>
			</div>
		</Stage>
	);
};

// ---------- না: big X ----------
const XMark: React.FC = () => {
	const x = useLife('xmark');
	if (!x.op) return null;
	const shake = Math.sin(x.lf * 1.9) * 10 * Math.max(0, 1 - x.lf / 10);
	return (
		<div style={{position: 'absolute', left: 70, top: 610, width: 240, height: 240, borderRadius: 120, background: 'rgba(205,45,20,0.95)', boxShadow: '0 0 50px rgba(205,45,20,.55), 0 16px 34px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px) scale(${x.s})`, opacity: x.op}}>
			<Ic k="x" size={156} color="#fff" sw={3.2} />
		</div>
	);
};

// ---------- counter 1 -> 12 -> 15 (separate, synced to "১২–১৫ বার") ----------
export const TICKS: number[] = [...Array.from({length: 12}, (_, i) => 43.2 + i * (0.42 / 11)), 43.77, 43.92, 44.06]  // v3: 12 on '১২' 43.62, 15 on '১৫' 44.06;
const Counter: React.FC = () => {
	const c = useLife('counter');
	if (!c.op) return null;
	const n = TICKS.filter((x) => c.t >= x).length;
	const last = n ? TICKS[n - 1] : 0;
	const pop = n ? 1 + 0.12 * Math.max(0, 1 - (c.t - last) / 0.12) : 1;
	return (
		<div style={{position: 'absolute', left: 60, top: 520, width: 280, height: 400, ...glass, transform: `scale(${c.s})`, transformOrigin: 'left center', opacity: c.op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{fontFamily: 'AntonLocal', fontSize: 40, color: CREAM, letterSpacing: 8}}>TRIES</div>
			<div style={{fontFamily: 'AntonLocal', fontSize: 200, color: n >= 15 ? CREAM : OR, lineHeight: 1.05, transform: `scale(${pop})`, fontVariantNumeric: 'tabular-nums'}}>{n || 0}</div>
			<div style={{display: 'flex', flexWrap: 'wrap', width: 220, justifyContent: 'center', gap: 6, marginTop: 6}}>{Array.from({length: 15}, (_, i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: i < n ? OR : 'rgba(255,255,255,0.18)'}} />)}</div>
		</div>
	);
};

// ---------- frontend / backend (one at a time) ----------
const Card: React.FC<{id: string; icon: string; name: string; sub: string}> = ({id, icon, name, sub}) => {
	const l = useLife(id);
	if (!l.op) return null;
	return (
		<div style={{position: 'absolute', left: 60, top: 600, width: 340, height: 170, ...glass, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', boxSizing: 'border-box', transform: `translateX(${(1 - l.s) * -200}px)`, opacity: l.op}}>
			<div style={{width: 84, height: 84, borderRadius: 24, background: 'rgba(255,106,0,0.18)', border: `3px solid ${OR}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Ic k={icon} size={52} /></div>
			<div><div style={{fontFamily: 'AntonLocal', fontSize: 46, color: CREAM, letterSpacing: 2}}>{name}</div><div style={{fontFamily: HIND, fontWeight: 600, fontSize: 24, color: OR}}>{sub}</div></div>
		</div>
	);
};

// ---------- deploy logos BEHIND head (matte over) ----------
const faceAt = (f: number) => {
	const a = Math.max(0, f - 4), b = Math.min(FACES.length - 1, f + 4);
	const acc = [0, 0, 0, 0];
	for (let i = a; i <= b; i++) for (let j = 0; j < 4; j++) acc[j] += FACES[i][j] / (b - a + 1);
	return acc;
};
const BehindLogo: React.FC<{id: string; logo: string; name: string; tint?: string}> = ({id, logo, name, tint = '#fff'}) => {
	const l = useLife(id);
	if (!l.op) return null;
	const [x0, y0, x1] = faceAt(l.f);
	const cx = (x0 + x1) / 2, S = 400;
	return (
		<div style={{position: 'absolute', left: cx - S / 2, top: y0 - 250, width: S, height: S, transform: `scale(${0.8 + 0.2 * l.s})`, opacity: l.op, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: `drop-shadow(0 0 30px ${tint === '#fff' ? 'rgba(255,255,255,.25)' : 'rgba(62,207,142,.4)'})`}}>
			<Logo k={logo} size={S} color={tint} />
			<div style={{position: 'absolute', top: -70, left: 0, right: 0, textAlign: 'center', fontFamily: HIND, fontWeight: 700, fontSize: 56, color: tint === '#fff' ? CREAM : tint, textShadow: '0 4px 16px rgba(0,0,0,.7)'}}>{name}</div>
		</div>
	);
};

// ---------- outro: name + orbit around raised hand ----------
const handAt = (f: number) => {
	if (!HANDS.length) return {x: 300, y: 800};
	let best = HANDS[0];
	for (const h of HANDS) if (Math.abs(h.f - f) < Math.abs(best.f - f)) best = h;
	return best;
};
const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const o = useLife('orbit');
	if (t < T('name')) return null;
	const lt = t - T('name');
	const name = 'Dr. Shadly Benzadid';
	const sub = 'Ex Dental Surgeon · AI Generalist';
	const line = interpolate(lt, [0.05, 0.6], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const subIn = interpolate(lt, [0.45, 0.85], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const h = handAt(f);
	const hx = Math.min(h.x, 296), hy = h.y;
	const logos = ['openai', 'gemini-color', 'claude-color', 'google-color', 'supabase_si', 'github', 'vercel'];
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center'}}>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 76, color: CREAM, lineHeight: 1.1, textShadow: '0 6px 24px rgba(0,0,0,.7)'}}>
					{name.split('').map((ch, i) => {
						const p = interpolate(lt, [i * 0.025, i * 0.025 + 0.35], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
						return <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: `blur(${(1 - p) * 6}px)`, whiteSpace: 'pre'}}>{ch}</span>;
					})}
				</div>
				<div style={{margin: '12px auto 0', height: 4, width: 520 * line, background: `linear-gradient(90deg, transparent, ${OR}, transparent)`}} />
				<div style={{marginTop: 12, fontFamily: HIND, fontWeight: 600, fontSize: 40, color: OR, letterSpacing: 2 * subIn, opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)`, textShadow: '0 4px 16px rgba(0,0,0,.7)'}}>{sub}</div>
			</div>
			{o.op ? logos.map((l, i) => {
				const ang = (o.lf / FPS) * 3.2 + (i / logos.length) * Math.PI * 2;
				const R = 92 * o.s;
				return (
					<div key={l} style={{position: 'absolute', left: hx + Math.cos(ang) * R - 24, top: hy + Math.sin(ang) * R * 0.75 - 24, width: 48, height: 48, borderRadius: 14, ...glass, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o.op, transform: `scale(${o.s})`}}>
						<Logo k={l} size={30} color={l === 'supabase_si' ? '#3ECF8E' : '#fff'} />
					</div>
				);
			}) : null}
		</>
	);
};

// ---------- captions (phrase-level, chest) ----------
const CAPS = (E as any).caps as [number, number, string][];
const Caption: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const i = CAPS.findIndex(([a, b]) => t >= a - 0.001 && t < b);
	if (i < 0) return null;
	const [a, b, txt] = CAPS[i];
	const p = sp(f - fr(a), 14, 260);
	const out = interpolate(t, [b - 0.07, b], [1, 0], C);
	const parts = txt.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: 1150, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: out * Math.min(1, p * 2), transform: `translateY(${(1 - p) * 18}px) scale(${0.95 + 0.05 * p})`}}>
			<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 76, lineHeight: 1.15, textAlign: 'center', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.85)', WebkitTextStroke: '9px rgba(12,8,4,0.92)', paintOrder: 'stroke fill'}}>
				{parts.map((s, j) => (s.startsWith('[') ? <span key={j} style={{color: OR}}>{s.slice(1, -1)}</span> : <span key={j}>{s}</span>))}
			</div>
		</div>
	);
};

export const J005V2: React.FC<{qa?: boolean}> = ({qa = false}) => {
	useFonts();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{qa ? null : <Base />}
			{/* behind-head layers */}
			<Title />
			<BehindLogo id="supabase" logo="supabase_si" name="Supabase" tint="#3ECF8E" />
			<BehindLogo id="github" logo="github" name="GitHub" />
			<BehindLogo id="vercel" logo="vercel" name="Vercel" />
			{qa ? null : <Matte />}
			{/* front layers */}
			<HookChips />
			<Plan />
			<Stack1 />
			<HeroBadge />
			<Showcase />
			<Tools2 />
			<ClaudeUI />
			<XMark />
			<Counter />
			<Card id="front" icon="ui" name="FRONTEND" sub="UI · animation" />
			<Card id="back" icon="server" name="BACKEND" sub="logic · data" />
			<Outro />
			<Caption />
		</AbsoluteFill>
	);
};
