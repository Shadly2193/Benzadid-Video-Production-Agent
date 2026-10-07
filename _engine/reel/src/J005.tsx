import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, continueRender, delayRender} from 'remotion';
import EV from './j005_events.json';

export const J005_TOTAL = 74.3;
const FPS = 30;
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OR = '#FF6A00', CREAM = '#FFF0E0', INK = '#1a0d05';
const P = (f: string) => staticFile('j005/' + f);
const HIND = '"Hind Siliguri"';
const fr = (s: number) => Math.round(s * FPS);
const T = (id: string) => (EV as any[]).find((e) => e.id === id)!.t as number;
const sp = (f: number, d = 12, s = 200) => (f < 0 ? 0 : spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}}));

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

// life: springy in at t0, out at t1 -> scale + opacity (0 when not alive)
const useLife = (t0: number, t1: number) => {
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t < t0 || t > t1 + 0.3) return {s: 0, op: 0, t, f, lf: f - fr(t0)};
	const sin = sp(f - fr(t0));
	const out = interpolate(t, [t1, t1 + 0.22], [1, 0], C);
	return {s: sin * (0.7 + 0.3 * out), op: Math.min(1, sin * 1.6) * out, t, f, lf: f - fr(t0)};
};

const glass: React.CSSProperties = {
	background: 'linear-gradient(135deg, rgba(30,14,5,0.78), rgba(50,22,6,0.62))',
	backdropFilter: 'blur(18px) saturate(1.3)', WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
	border: '2px solid rgba(255,225,190,0.38)', borderRadius: 34,
	boxShadow: '0 24px 60px rgba(20,8,0,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
};

// ---------- logos ----------
const MONO = new Set(['openai', 'github', 'vercel', 'supabase_si']);
const Logo: React.FC<{k: string; size: number; color?: string}> = ({k, size, color = '#fff'}) =>
	MONO.has(k) ? (
		<div style={{width: size, height: size, background: color, WebkitMaskImage: `url(${P('logos/' + k + '.svg')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center'}} />
	) : (
		<Img src={P('logos/' + k + '.svg')} style={{width: size, height: size}} />
	);

const X0 = 36, CW = 480;
const ToolChip: React.FC<{id: string; logo: string | string[]; name: string; sub: string; y: number; t1: number; tint?: string; extra?: React.ReactNode}> = ({id, logo, name, sub, y, t1, tint = '#fff', extra}) => {
	const {s, op} = useLife(T(id), t1);
	if (!op) return null;
	const logos = Array.isArray(logo) ? logo : [logo];
	return (
		<div style={{position: 'absolute', left: X0, top: y, width: CW, height: 150, ...glass, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', transform: `scale(${s})`, transformOrigin: 'left center', opacity: op}}>
			<div style={{display: 'flex', gap: 8}}>{logos.map((l) => <Logo key={l} k={l} size={82} color={tint} />)}</div>
			<div style={{display: 'flex', flexDirection: 'column'}}>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 48, color: CREAM, lineHeight: 1.05}}>{name}</div>
				<div style={{fontFamily: HIND, fontWeight: 600, fontSize: 28, color: OR, letterSpacing: 1}}>{sub}</div>
			</div>
			{extra}
		</div>
	);
};

// ---------- small icons ----------
const Ic: React.FC<{k: string; size?: number; color?: string}> = ({k, size = 40, color = OR}) => {
	const st = {fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const d: Record<string, React.ReactNode> = {
		db: <><ellipse cx={12} cy={5} rx={8} ry={3} {...st} /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" {...st} /></>,
		repo: <><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" {...st} /><path d="M5 18a2 2 0 0 1 2-2h12" {...st} /></>,
		check: <path d="M5 12l5 5 9-10" {...st} />,
		x: <path d="M6 6l12 12M18 6L6 18" {...st} />,
		ui: <><rect x={3} y={4} width={18} height={14} rx={2} {...st} /><path d="M3 8h18" {...st} /></>,
		server: <><rect x={3} y={4} width={18} height={6} rx={1.5} {...st} /><rect x={3} y={14} width={18} height={6} rx={1.5} {...st} /><path d="M7 7h.01M7 17h.01" {...st} /></>,
	};
	return <svg width={size} height={size} viewBox="0 0 24 24">{d[k]}</svg>;
};

// ---------- base video ----------
const Base: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const punch = t >= 70.4 ? 1 + 0.09 * Easing.out(Easing.cubic)(Math.min(1, (t - 70.4) / 0.35)) : 1;
	const z = 1 + 0.02 * Math.min(1, t / 3) + (t >= 70.4 ? punch - 1 : 0);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '65% 45%'}}>
				<OffthreadVideo src={P('graded.mp4')} muted style={{width: 1080, height: 1920}} />
			</AbsoluteFill>
			{/* soft left scrim so panels read on busy curtain */}
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(18,8,2,0.34) 0%, rgba(18,8,2,0) 52%)'}} />
		</AbsoluteFill>
	);
};

const Flash: React.FC<{t0: number; n?: number; op?: number}> = ({t0, n = 5, op = 0.9}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#FFE9CC', opacity: interpolate(f - fr(t0), [0, n], [op, 0], C)}} />;
};

// ---------- HOOK 0-3.5 ----------
const MiniPhone: React.FC<{w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, h, children, style}) => (
	<div style={{width: w, height: h, borderRadius: w * 0.14, background: '#0c0603', padding: w * 0.04, boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(0,0,0,.55), inset 0 0 0 2px #4a3526', ...style}}>
		<div style={{width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
	</div>
);
const MiniDesk: React.FC<{w: number; children: React.ReactNode; style?: React.CSSProperties}> = ({w, children, style}) => (
	<div style={{width: w, borderRadius: 16, background: '#0c0603', padding: 8, boxSizing: 'border-box', boxShadow: '0 30px 60px rgba(0,0,0,.55), inset 0 0 0 2px #4a3526', ...style}}>
		<div style={{width: '100%', height: (w - 16) * 0.625, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#000'}}>{children}</div>
	</div>
);
const Warm: React.FC = () => (
	<>
		<AbsoluteFill style={{background: 'rgba(255,140,50,0.16)', mixBlendMode: 'soft-light'}} />
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(30,12,2,0.35))'}} />
	</>
);

const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const phone = useLife(T('hookphone'), 1.95);
	if (t > 3.9) return null;
	const out = interpolate(t, [3.5, 3.8], [1, 0], C);
	const ts = sp(f - fr(0.4), 9, 260);
	const letter = (txt: string, y: number, sz: number, col: string) => (
		<div style={{fontFamily: 'AntonLocal', fontSize: sz, color: col, lineHeight: 1, textAlign: 'center', transform: 'scaleY(1.25)', textShadow: '0 8px 30px rgba(0,0,0,.6)', marginTop: y}}>{txt}</div>
	);
	const logos = ['openai', 'gemini-color', 'claude-color', 'google-color', 'supabase_si', 'vercel'];
	return (
		<div style={{opacity: out}}>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, rgba(255,106,0,0.22), rgba(0,0,0,0) 60%)', opacity: interpolate(t, [0, 0.4], [0, 1], C)}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 150, transform: `scale(${1.5 - 0.5 * ts})`, opacity: Math.min(1, ts * 2)}}>
				{letter('MY AI', 0, 150, CREAM)}
				{letter('STACK', 40, 210, OR)}
			</div>
			{phone.op > 0 ? (
				<MiniPhone w={230} h={470} style={{position: 'absolute', left: 56, top: 700, transform: `scale(${phone.s}) rotate(${-7 * phone.s}deg) translateY(${-8 * Math.sin(t * 2)}px)`, opacity: phone.op}}>
					<OffthreadVideo src={P('clientb_mobile_rec.webm')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					<Warm />
				</MiniPhone>
			) : null}
			{logos.map((l, i) => {
				const t0 = T('hk' + i);
				const s = sp(f - fr(t0), 9, 280);
				if (!s) return null;
				const col = i % 3, row = Math.floor(i / 3);
				return (
					<div key={l} style={{position: 'absolute', left: 40 + col * 118, top: 760 + row * 120, width: 104, height: 104, ...glass, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: Math.min(1, s * 2), zIndex: 3}}>
						<Logo k={l} size={60} />
					</div>
				);
			})}
		</div>
	);
};

// ---------- PLAN tree 4-12.4 ----------
const Badge: React.FC<{id: string; n: string; label: string; t1: number}> = ({id, n, label, t1}) => {
	const {s, op} = useLife(T(id), t1);
	if (!op) return null;
	return (
		<div style={{position: 'absolute', left: X0, top: 330, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${s})`, transformOrigin: 'left center', opacity: op}}>
			<div style={{fontFamily: 'AntonLocal', fontSize: 64, color: OR, transform: 'scaleY(1.2)'}}>{n}</div>
			<div style={{fontFamily: 'AntonLocal', fontSize: 50, color: CREAM, letterSpacing: 3, textShadow: '0 4px 14px rgba(0,0,0,.6)'}}>{label}</div>
		</div>
	);
};
const Node: React.FC<{id: string; text: string; y: number; t1: number; tag?: boolean; line?: boolean}> = ({id, text, y, t1, tag, line = true}) => {
	const {s, op, f} = useLife(T(id), t1);
	if (!op) return null;
	const draw = interpolate(f - fr(T(id)), [0, 8], [0, 1], C);
	return (
		<>
			{line ? <div style={{position: 'absolute', left: X0 + 40, top: y - 40, width: 4, height: 40 * draw, background: OR, opacity: op}} /> : null}
			<div style={{position: 'absolute', left: X0, top: y, ...glass, borderRadius: 26, padding: '12px 28px', fontFamily: HIND, fontWeight: 700, fontSize: 40, color: tag ? OR : CREAM, transform: `scale(${s})`, transformOrigin: 'left center', opacity: op}}>{text}</div>
		</>
	);
};
const Plan: React.FC = () => {
	const t1 = 12.3;
	const f = useCurrentFrame();
	const t = f / FPS;
	const chk = useLife(T('plancheck'), t1);
	return (
		<>
			<Badge id="badge1" n="01" label="PLAN" t1={t1} />
			<Node id="n_sys" text="System design" y={430} t1={t1} line={false} />
			<Node id="n_plan" text="Planning" y={532} t1={t1} />
			<Node id="n_spec" text="Specialty" y={634} t1={t1} tag />
			<Node id="n_cont" text="Content" y={736} t1={t1} tag />
			<Node id="n_struct" text="Structure" y={838} t1={t1} tag />
			{['Home', 'Services', 'About', 'Contact'].map((p, i) => {
				const l = useLife(T('pg' + i), t1);
				if (!l.op) return null;
				return <div key={p} style={{position: 'absolute', left: X0 + (i % 2) * 215, top: 948 + Math.floor(i / 2) * 76, background: OR, color: '#1a0d05', fontFamily: HIND, fontWeight: 700, fontSize: 32, padding: '6px 24px', borderRadius: 22, transform: `scale(${l.s})`, opacity: l.op, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{p}</div>;
			})}
			{chk.op ? <div style={{position: 'absolute', left: X0 + 330, top: 322, width: 84, height: 84, borderRadius: 42, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk.s})`, opacity: chk.op}}><Ic k="check" size={56} color="#1a0d05" /></div> : null}
		</>
	);
};

// ---------- LLM stack 14.5-19.6 ----------
const Stack1: React.FC = () => {
	const t1 = 19.6;
	const st = useLife(T('paid'), t1);
	return (
		<>
			<ToolChip id="chatgpt" logo="openai" name="ChatGPT" sub="PLAN" y={400} t1={t1} />
			<ToolChip id="gemini" logo="gemini-color" name="Gemini" sub="PLAN" y={576} t1={t1} />
			<ToolChip id="claude1" logo="claude-color" name="Claude" sub="PLAN" y={752} t1={t1} />
			{st.op ? (
				<div style={{position: 'absolute', left: X0 + 70, top: 930, transform: `scale(${1.8 - 0.8 * st.s}) rotate(-8deg)`, opacity: st.op, border: `6px solid ${OR}`, borderRadius: 18, padding: '4px 30px', fontFamily: 'AntonLocal', fontSize: 78, color: OR, letterSpacing: 4, background: 'rgba(26,13,5,0.55)'}}>PAID ✓</div>
			) : null}
		</>
	);
};

// ---------- HERO badge + wireframe 21.3-24.7 ----------
const HeroBadge: React.FC = () => {
	const t1 = 24.6;
	const l = useLife(T('wire'), t1);
	const d = interpolate(l.lf, [0, 30], [1, 0], C);
	return (
		<>
			<Badge id="badge2" n="02" label="HERO VISUAL" t1={t1} />
			{l.op ? (
				<div style={{position: 'absolute', left: X0, top: 450, width: CW, height: 300, opacity: l.op, transform: `scale(${l.s})`, transformOrigin: 'left center'}}>
					<svg width={CW} height={300} viewBox="0 0 480 300">
						<rect x={4} y={4} width={472} height={292} rx={22} fill="rgba(255,240,224,0.07)" stroke={OR} strokeWidth={4} strokeDasharray={1500} strokeDashoffset={1500 * d} />
						<rect x={34} y={40} width={230} height={30} rx={8} fill={OR} opacity={interpolate(l.lf, [14, 24], [0, 0.9], C)} />
						<rect x={34} y={90} width={170} height={16} rx={8} fill={CREAM} opacity={interpolate(l.lf, [20, 30], [0, 0.7], C)} />
						<rect x={34} y={120} width={130} height={16} rx={8} fill={CREAM} opacity={interpolate(l.lf, [24, 34], [0, 0.5], C)} />
						<circle cx={370} cy={170} r={80} fill="none" stroke={OR} strokeWidth={4} strokeDasharray={520} strokeDashoffset={520 * interpolate(l.lf, [8, 40], [1, 0], C)} />
						<rect x={34} y={220} width={120} height={38} rx={19} fill={OR} opacity={interpolate(l.lf, [30, 40], [0, 1], C)} />
					</svg>
				</div>
			) : null}
		</>
	);
};

// ---------- HERO showcase 24.7-35.4 ----------
const Showcase: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const t1 = 35.3;
	const par = (a: number) => ({x: Math.sin(t * 0.8 + a) * 10, y: Math.cos(t * 1.1 + a) * 12});
	const h1 = useLife(T('h1'), t1), h2 = useLife(T('h2'), t1), h3 = useLife(T('h3'), t1);
	const fh = t >= T('ClientD') - 0.01 && t < 32.9;
	const fo = interpolate(t, [T('ClientD'), T('ClientD') + 0.25, 32.65, 32.9], [0, 1, 1, 0], C);
	return (
		<>
			{h1.op ? (() => {
				const p = par(0);
				return (
					<MiniPhone w={250} h={520} style={{position: 'absolute', left: 60 + p.x, top: 640 + p.y, transform: `scale(${h1.s}) rotate(${-6 * h1.s + 4}deg)`, opacity: h1.op}}>
						<OffthreadVideo src={P('clientb_mobile_rec.webm')} muted startFrom={Math.max(0, h1.lf)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						<Warm />
					</MiniPhone>
				);
			})() : null}
			{h2.op ? (() => {
				const p = par(2);
				return (
					<MiniDesk w={470} style={{position: 'absolute', left: 30 + p.x * 0.6, top: 360 + p.y * 0.6, transform: `scale(${h2.s}) perspective(900px) rotateY(${14 * h2.s - 6}deg)`, transformOrigin: 'left center', opacity: h2.op}}>
						<OffthreadVideo src={P('clientc_desktop_rec.webm')} muted startFrom={Math.max(0, h2.lf)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
						<Warm />
					</MiniDesk>
				);
			})() : null}
			{h3.op ? (() => {
				const p = par(4);
				return (
					<>
						<MiniDesk w={470} style={{position: 'absolute', left: 30 + p.x * 0.6, top: 340 + p.y * 0.6, transform: `scale(${h3.s}) perspective(900px) rotateY(${10 * h3.s - 4}deg)`, transformOrigin: 'left center', opacity: h3.op}}>
							<OffthreadVideo src={P('clientb_desktop_rec.webm')} muted startFrom={Math.max(0, h3.lf)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
							<Warm />
						</MiniDesk>
						<MiniPhone w={200} h={420} style={{position: 'absolute', left: 150 + p.x, top: 760 + p.y, transform: `scale(${h3.s}) rotate(${5 * h3.s}deg)`, opacity: h3.op}}>
							<OffthreadVideo src={P('clientc_mobile_rec.webm')} muted startFrom={Math.max(0, h3.lf)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
							<Warm />
						</MiniPhone>
					</>
				);
			})() : null}
			{fh ? (
				<AbsoluteFill style={{opacity: fo, transform: `scale(${1.03 - 0.03 * Math.min(1, (t - T('ClientD')) / 0.4)})`}}>
					<OffthreadVideo src={P('clientd916.mp4')} muted startFrom={Math.max(0, fr(t - T('ClientD')))} style={{width: 1080, height: 1920}} />
					<Warm />
					<AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(20,8,0,0.7)'}} />
				</AbsoluteFill>
			) : null}
		</>
	);
};

// ---------- hero tools 35.6-38 ----------
const Tools2: React.FC = () => (
	<>
		<ToolChip id="claude2" logo="claude-color" name="Claude" sub="IMAGINE → BUILD" y={420} t1={38.0} />
		<ToolChip id="flow" logo="google-color" name="Google Flow" sub="IMAGE · VIDEO" y={596} t1={38.0} />
		<ToolChip id="chatgpt2" logo="openai" name="ChatGPT" sub="IMAGE" y={772} t1={38.0} />
	</>
);

// ---------- code window 39.3-47.8 + counter ----------
const CODE: [string, string][][] = [
	[['const ', OR], ['hero ', CREAM], ['= ', '#c9a47c'], ['gsap', '#FFD9A0'], ['.timeline()', CREAM]],
	[['hero.', CREAM], ['from', OR], ["('.title', {", '#FFD9A0']],
	[['  y: ', '#c9a47c'], ['80', OR], [', opacity: ', '#c9a47c'], ['0', OR]],
	[['})', '#FFD9A0']],
	[['// scroll + parallax', '#8a7a6a']],
	[['ScrollTrigger', CREAM], ['.create', OR], ['({ scrub: ', CREAM], ['true', OR], [' })', CREAM]],
];
const CodeWin: React.FC = () => {
	const {s, op, t, lf} = useLife(T('code'), 47.8);
	if (!op) return null;
	let budget = Math.max(0, (t - 39.6) * 38);
	return (
		<div style={{position: 'absolute', left: X0, top: 440, width: CW + 20, height: 430, ...glass, borderRadius: 26, transform: `scale(${s})`, transformOrigin: 'left center', opacity: op, background: 'rgba(22,10,3,0.72)', padding: 20, boxSizing: 'border-box'}}>
			<div style={{display: 'flex', gap: 10, marginBottom: 18}}>{['#FF6A00', '#FFB066', '#c9a47c'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}<div style={{marginLeft: 12, fontFamily: HIND, fontSize: 22, color: '#a8917a', fontWeight: 600}}>hero.animation.js</div></div>
			{CODE.map((line, i) => (
				<div key={i} style={{fontFamily: 'Consolas, "Courier New", monospace', fontSize: 25, lineHeight: 1.65, whiteSpace: 'pre', height: 41}}>
					{line.map(([txt, col], j) => {
						const n = Math.max(0, Math.min(txt.length, Math.floor(budget)));
						budget -= txt.length;
						return <span key={j} style={{color: col}}>{txt.slice(0, n)}</span>;
					})}
					{Math.floor(lf / 8) % 2 === 0 && budget > -999 && budget < 0 && budget > -1 ? '▍' : ''}
				</div>
			))}
			<div style={{marginTop: 14, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)'}}><div style={{height: 8, borderRadius: 4, background: OR, width: `${interpolate(t, [39.6, 47.0], [0, 94], C)}%`}} /></div>
		</div>
	);
};
const Counter: React.FC = () => {
	const t1 = 51.0;
	const x = useLife(T('xmark'), 47.7);
	const c = useLife(T('counter'), t1 + 0.05);
	const d = useLife(T('cdone'), 52.4);
	const q = useLife(T('q'), 46.9);
	const t = c.t;
	const n = Math.min(15, 1 + Math.floor((t - 47.9) / 0.2));
	return (
		<>
			{q.op ? <div style={{position: 'absolute', left: X0 + 360, top: 380, fontFamily: 'AntonLocal', fontSize: 130, color: OR, transform: `scale(${q.s}) rotate(10deg)`, opacity: q.op}}>?</div> : null}
			{x.op ? <div style={{position: 'absolute', left: X0 + 150, top: 470, width: 200, height: 200, borderRadius: 100, background: 'rgba(200,40,10,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${x.s})`, opacity: x.op}}><Ic k="x" size={120} color="#fff" /></div> : null}
			{c.op ? (
				<div style={{position: 'absolute', left: X0, top: 440, width: CW, height: 380, ...glass, transform: `scale(${c.s})`, transformOrigin: 'left center', opacity: c.op, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{fontFamily: 'AntonLocal', fontSize: 40, color: CREAM, letterSpacing: 6}}>TRY</div>
					<div style={{fontFamily: 'AntonLocal', fontSize: 190, color: n >= 15 ? CREAM : OR, lineHeight: 1.05, transform: `scale(${1 + 0.1 * Math.max(0, 1 - ((t - 47.9) % 0.2) * 12)})`}}>×{n}</div>
					<div style={{display: 'flex', gap: 8, marginTop: 8}}>{Array.from({length: 15}, (_, i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: i < n ? OR : 'rgba(255,255,255,0.2)'}} />)}</div>
				</div>
			) : null}
			{d.op ? <div style={{position: 'absolute', left: X0 + 330, top: 400, width: 120, height: 120, borderRadius: 60, background: OR, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${d.s})`, opacity: d.op, zIndex: 5}}><Ic k="check" size={84} color="#1a0d05" /></div> : null}
		</>
	);
};

// ---------- frontend / backend 52.8-57.3 ----------
const SplitCards: React.FC = () => {
	const a = useLife(T('front'), 57.3), b = useLife(T('back'), 57.3);
	const card = (l: typeof a, y: number, icon: string, name: string, sub: string) =>
		l.op ? (
			<div style={{position: 'absolute', left: X0, top: y, width: CW, height: 220, ...glass, display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', transform: `translateX(${(1 - l.s) * -300}px) scale(${0.9 + 0.1 * l.s})`, opacity: l.op, transformOrigin: 'left center'}}>
				<div style={{width: 100, height: 100, borderRadius: 28, background: 'rgba(255,106,0,0.18)', border: `3px solid ${OR}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Ic k={icon} size={62} /></div>
				<div><div style={{fontFamily: 'AntonLocal', fontSize: 56, color: CREAM, letterSpacing: 2}}>{name}</div><div style={{fontFamily: HIND, fontWeight: 600, fontSize: 28, color: OR}}>{sub}</div></div>
			</div>
		) : null;
	return (
		<>
			{card(a, 430, 'ui', 'FRONTEND', 'UI · animation')}
			{card(b, 680, 'server', 'BACKEND', 'logic · data')}
			{a.op && b.op ? <div style={{position: 'absolute', left: X0 + 235, top: 650, width: 4, height: 30, background: OR}} /> : null}
		</>
	);
};

// ---------- deploy chips 59.9-66.3 ----------
const Deploy: React.FC = () => {
	const live = useLife(T('live'), 67.6);
	return (
		<>
			<ToolChip id="supabase" logo="supabase_si" tint="#3ECF8E" name="Supabase" sub="DATABASE" y={420} t1={66.6} extra={<div style={{marginLeft: 'auto'}}><Ic k="db" size={44} color="#3ECF8E" /></div>} />
			<ToolChip id="github" logo="github" name="GitHub" sub="CODE" y={596} t1={66.6} extra={<div style={{marginLeft: 'auto'}}><Ic k="repo" size={44} color={CREAM} /></div>} />
			<ToolChip id="vercel" logo="vercel" name="Vercel" sub="LIVE" y={772} t1={66.6} extra={live.op ? <div style={{marginLeft: 'auto', width: 30, height: 30, borderRadius: 15, background: '#3ECF8E', boxShadow: `0 0 ${14 + 10 * Math.sin(live.t * 8)}px #3ECF8E`, transform: `scale(${live.s})`}} /> : null} />
		</>
	);
};

// ---------- outro 70.4+ ----------
const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const lt = useLife(T('lt'), 74.4);
	const wall = useLife(T('wall'), 74.4);
	const sweep = interpolate(t, [70.6, 71.0], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const logos = ['openai', 'gemini-color', 'claude-color', 'google-color', 'supabase_si', 'github', 'vercel'];
	return (
		<>
			{t >= 70.4 && t < 70.9 ? <Flash t0={70.4} n={6} op={0.6} /> : null}
			{lt.op ? (
				<div style={{position: 'absolute', left: 50, bottom: 270, width: 800, transform: `translateX(${(1 - sweep) * -900}px)`, opacity: lt.op}}>
					<div style={{...glass, borderRadius: 26, padding: '22px 36px 24px', borderLeft: `10px solid ${OR}`}}>
						<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 68, color: CREAM, lineHeight: 1.1}}>Dr. Shadly Benzadid</div>
						<div style={{fontFamily: HIND, fontWeight: 600, fontSize: 36, color: OR, marginTop: 6}}>Ex Dental Surgeon · AI Generalist</div>
					</div>
				</div>
			) : null}
			{wall.op ? (
				<div style={{position: 'absolute', left: X0, top: 470, width: CW, display: 'flex', flexWrap: 'wrap', gap: 18}}>
					{logos.map((l, i) => {
						const s = sp(f - fr(T('wall') + i * 0.09), 9, 260);
						return <div key={l} style={{width: 108, height: 108, ...glass, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, opacity: Math.min(1, s * 2) * wall.op}}><Logo k={l} size={62} color={l === 'supabase_si' ? '#3ECF8E' : '#fff'} /></div>;
					})}
				</div>
			) : null}
		</>
	);
};

// ---------- captions ----------
// [t_in, t_out, text]; [x] = accent (English tool names)
const CAPS: [number, number, string][] = [
	[0.0, 0.94, 'একজন ডাক্তারের'], [0.94, 1.98, '[Website] বানাতে আমি'], [1.98, 3.1, 'কি কি [Tools] ব্যবহার করি'], [3.1, 4.0, 'দেখিয়ে দেই'],
	[4.0, 4.9, 'প্রথমে কী করি?'], [5.1, 6.4, '[System design]'], [6.4, 7.15, 'আর [Planning]'], [7.2, 7.95, 'সেটা কিভাবে?'],
	[8.0, 9.4, 'ডাক্তারের [Specialty] বুঝে'], [9.4, 10.35, '[Content] আর'], [10.4, 11.5, '[Website Structure] এর'], [11.55, 12.3, '[Plan] বানাই'],
	[12.5, 13.55, 'সেটার জন্য'], [13.6, 14.35, 'কি কি ব্যবহার করি?'],
	[14.5, 15.3, '[ChatGPT],'], [15.3, 16.2, '[Gemini]'], [16.2, 17.7, 'এবং [Claude]'], [17.8, 18.55, 'সবগুলো [paid version]?'], [18.7, 19.3, 'হ্যাঁ'],
	[19.3, 21.2, '[Planning] এর পর কি করি?'], [21.3, 22.6, '[Hero Section] এর'], [22.7, 23.95, '[Visual develop] করি'], [24.0, 24.7, 'সেটা কিভাবে?'],
	[24.7, 26.9, 'প্রথমে আমার ডাক্তারি জ্ঞান'], [26.9, 28.0, 'কাজে লাগিয়ে'], [28.0, 33.0, 'নিজে নিজে [imagine] করি'],
	[33.7, 35.0, 'সেই [imagination] অনুযায়ী'], [35.0, 36.2, '[image], [video] generate করি'], [36.3, 37.1, '[Google Flow], [ChatGPT]'], [37.1, 38.0, 'এর কম্বিনেশনে'],
	[38.1, 39.3, 'এরপর কি করি?'], [39.3, 41.4, '[Design] আর [Planning] মিলিয়ে'], [41.4, 43.4, '[Animation] এর জন্য'], [43.4, 44.4, '[Claude] কে বলি'], [44.4, 45.4, '[Code] লিখতে'],
	[45.5, 46.9, 'এক বারেই হয়ে যায়?'], [47.0, 47.85, 'না।'], [47.9, 51.0, 'কখনো ১২–১৫ বার [Try]'],
	[51.0, 52.8, 'কোড ঠিকঠাক করে'], [52.8, 54.7, '[Frontend] সাজাই'], [55.7, 57.0, '[Backend] ডেভেলপ করি'], [57.4, 59.8, 'ডাটাবেইজ কোথায় রাখি?'],
	[59.9, 61.1, '[Supabase] এ'], [61.2, 62.7, 'আর [code] কোথায়?'], [62.8, 63.9, '[GitHub] এ'], [64.0, 65.2, '[Live] কোথায়?'], [65.3, 66.0, '[Vercel] এ'],
	[66.0, 68.3, 'এইসব কিছু করে'], [68.3, 69.8, '[Website] বানিয়ে দিচ্ছে?'], [70.4, 71.5, 'আমি।'],
];
const Caption: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const i = CAPS.findIndex(([a, b]) => t >= a - 0.001 && t < b);
	if (i < 0) return null;
	const [a, b, txt] = CAPS[i];
	const p = sp(f - fr(a), 14, 260);
	const out = interpolate(t, [b - 0.08, b], [1, 0], C);
	const parts = txt.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: 1130, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: out * Math.min(1, p * 2), transform: `translateY(${(1 - p) * 22}px) scale(${0.94 + 0.06 * p})`}}>
			<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 80, lineHeight: 1.15, textAlign: 'center', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9)', WebkitTextStroke: '9px rgba(20,8,0,0.92)', paintOrder: 'stroke fill'}}>
				{parts.map((s, j) => s.startsWith('[') ? <span key={j} style={{color: OR}}>{s.slice(1, -1)}</span> : <span key={j}>{s}</span>)}
			</div>
		</div>
	);
};

export const J005: React.FC = () => {
	useFonts();
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<Base />
			<Showcase />
			<Hook />
			<Plan />
			<Stack1 />
			<HeroBadge />
			<Tools2 />
			<CodeWin />
			<Counter />
			<SplitCards />
			<Deploy />
			<Outro />
			<Flash t0={0} n={5} op={0.85} />
			<Caption />
		</AbsoluteFill>
	);
};
