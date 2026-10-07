import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, continueRender, delayRender} from 'remotion';
import {loadFont as loadInterT} from '@remotion/google-fonts/InterTight';
import cap from './t001_captions_v2.json';

// TEST-001 Client-A doctor case study — built from 05_visual_plan.json + 05c_captions.json (GATE 1 approved).
// Picture only (render --muted). Captions own ALL words (Bangla); graphics carry no duplicate words.
const {fontFamily: INTER} = loadInterT('normal', {weights: ['500', '700', '800'], subsets: ['latin']});
const FPS = 30;
// Body is authored in v1 clock (43.0 s); v2 = body remapped via 03_timemap (+0.933 after 12.152) + S5 insert.
const T001_TOTAL = 43.0;
export const T001V2_TOTAL = 43.933;
const INS0 = 12.152, INS1 = 13.086;
const fr = (s: number) => Math.round(s * FPS);
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.inOut(Easing.cubic);
const RED = '#E10600', INK = '#0B0E10', GREY = '#6B6B6B';
const P = (f: string) => staticFile('t001/' + f);
const HIND = '"Hind Siliguri"';
const sp = (f: number, d = 14, s = 170) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});

// ---------- fonts from public (Hind Siliguri + Anton) ----------
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

// ---------- constant world ----------
const World: React.FC = () => (
	<AbsoluteFill style={{background: INK}}>
		<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
		<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(225,6,0,0.10) 0%, rgba(0,0,0,0) 55%)'}} />
	</AbsoluteFill>
);

// ---------- talking head (pre-graded 05d, 1080x1920) ----------
const Face: React.FC<{dur: number; src: number; z0: number; z1: number; flash?: number; dim?: number; dy?: number; punch?: number; rate?: number; origin?: string}> = ({dur, src, z0, z1, flash = 0, dim = 0, dy = 0, punch = -1, rate = 1.05, origin = '50% 36%'}) => {
	const f = useCurrentFrame();
	const z = interpolate(f, [0, fr(dur)], [z0, z1], C) + (punch >= 0 ? interpolate(f, [punch, punch + 4], [0, 0.06], C) : 0);
	const fl = flash ? interpolate(f, [0, flash], [1, 0], C) : 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translateY(${dy * f / fr(dur)}px) scale(${z})`, transformOrigin: origin}}>
				<OffthreadVideo src={P('th.mp4')} muted startFrom={Math.round(src * FPS)} playbackRate={rate} style={{width: 1080, height: 1920}} />
			</AbsoluteFill>
			{dim ? <AbsoluteFill style={{background: `rgba(6,8,10,${dim})`}} /> : null}
			<AbsoluteFill style={{background: '#fff', opacity: fl}} />
		</AbsoluteFill>
	);
};
const Flash: React.FC<{n?: number}> = ({n = 2}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, n], [1, 0], C)}} />;
};

// ---------- devices ----------
const Laptop: React.FC<{x?: number; y?: number; w?: number; rotY?: number; ty?: number; sc?: number; children: React.ReactNode}> = ({x = 10, y = 560, w = 1060, rotY = 0, ty = 0, sc = 1, children}) => {
	const h = Math.round((w * 9) / 16);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, perspective: 1600, transform: `translateY(${ty}px) scale(${sc})`}}>
			<div style={{transform: `rotateY(${rotY}deg)`, transformOrigin: '50% 50%'}}>
				<div style={{background: '#111', borderRadius: 22, padding: 14, boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px #2a2a2a'}}>
					<div style={{position: 'relative', width: w - 28, height: h - 28, overflow: 'hidden', borderRadius: 6, background: '#000'}}>{children}</div>
				</div>
				<div style={{margin: '0 auto', width: w * 1.1, marginLeft: -w * 0.05, height: 22, background: 'linear-gradient(#3a3a3a,#1a1a1a)', borderRadius: '0 0 20px 20px'}} />
			</div>
		</div>
	);
};
const Fill: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'};

const Chip: React.FC<{text: string; red?: boolean; f: number; x: number; y: number}> = ({text, red, f, x, y}) => {
	const s = sp(f, 12, 220);
	return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: 'left center', background: red ? RED : GREY, color: '#fff', fontFamily: HIND, fontWeight: 700, fontSize: 40, padding: '4px 26px 0', borderRadius: 40, boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>{text}</div>;
};

// ---------- cursor + ripple ----------
const Cursor: React.FC<{x: number; y: number; click?: number[]; f: number}> = ({x, y, click = [], f}) => {
	let s = 1;
	const rings: React.ReactNode[] = [];
	click.forEach((c, i) => {
		const d = f - c;
		if (d >= 0 && d < 6) s = d < 3 ? 1 - 0.05 * d : 0.85 + 0.05 * (d - 3);
		if (d >= 0 && d < 10) {
			const p = d / 9;
			rings.push(<div key={i} style={{position: 'absolute', left: x - 80 * p, top: y - 80 * p, width: 160 * p, height: 160 * p, borderRadius: '50%', border: `3px solid ${RED}`, opacity: 0.85 * (1 - p)}} />);
		}
	});
	return (
		<>
			{rings}
			<svg width={64} height={64} viewBox="0 0 24 24" style={{position: 'absolute', left: x - 6, top: y - 3, transform: `scale(${s})`, transformOrigin: '6px 3px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.35))'}}>
				<path d="M5 2 L5 19 L9.5 14.8 L12.6 21.5 L15.3 20.3 L12.2 13.7 L18.2 13.4 Z" fill="#fff" stroke="#000" strokeWidth={1.1} strokeLinejoin="round" />
			</svg>
		</>
	);
};
// cursor path helper: list of [frame, x, y]
const path = (f: number, pts: [number, number, number][]) => {
	if (f <= pts[0][0]) return {x: pts[0][1], y: pts[0][2]};
	for (let i = 1; i < pts.length; i++) {
		if (f <= pts[i][0]) {
			const p = ease((f - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
			return {x: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * p, y: pts[i - 1][2] + (pts[i][2] - pts[i - 1][2]) * p};
		}
	}
	const l = pts[pts.length - 1];
	return {x: l[1], y: l[2]};
};

// ---------- small icons ----------
const Icon: React.FC<{k: string; size?: number; color?: string}> = ({k, size = 30, color = '#fff'}) => {
	const st = {fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const d: Record<string, React.ReactNode> = {
		page: <><rect x={4} y={3} width={16} height={18} rx={2} {...st} /><path d="M8 8h8M8 12h8M8 16h5" {...st} /></>,
		palette: <><rect x={3} y={4} width={18} height={14} rx={2} {...st} /><path d="M3 8h18" {...st} /></>,
		text: <path d="M4 6h16M4 10h16M4 14h10M4 18h12" {...st} />,
		pin: <><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" {...st} /><circle cx={12} cy={10} r={2.2} {...st} /></>,
		phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" {...st} />,
		cap: <><path d="M2 9l10-5 10 5-10 5z" {...st} /><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" {...st} /></>,
		code: <><rect x={2} y={4} width={20} height={16} rx={2} {...st} /><path d="M2 8h20M9 12l-2 2 2 2M15 12l2 2-2 2" {...st} /></>,
		db: <><ellipse cx={12} cy={5} rx={8} ry={3} {...st} /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" {...st} /></>,
		book: <path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14" {...st} />,
		mail: <><rect x={3} y={5} width={18} height={14} rx={2} {...st} /><path d="M3 7l9 6 9-6" {...st} /></>,
		check: <path d="M5 12l5 5 9-10" {...st} />,
		play: <path d="M8 5l11 7-11 7z" fill={color} />,
	};
	return <svg width={size} height={size} viewBox="0 0 24 24">{d[k]}</svg>;
};

// ---------- captions (05c, exact) ----------
type CW = {w: string; t: number; colour: string; space_after?: boolean};
type CL = {tier: string; text: string; font: string; size_px: number; line_height: number; words: CW[]};
type CU = {id: string; shots: string[]; box: number[]; lines: CL[]; t_in: number; t_out: number; style: string; plate: string | null; accent_stroke: string | null};
const UNITS = (cap as any).units as CU[];
// v2 captions (05c_captions_v2, v2 clock). word_spacing_rule: every word its own inline-block span, full line laid out at
// final positions from the start (opacity 0), real gap after space_after words (0.28em Bangla / 0.22em Anton), only opacity/transform animate.
// Plate is hidden until the unit's first word pops (no empty plate between units).
const Captions: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const u = UNITS.find((x) => t >= x.t_in - 0.001 && t < x.t_out);
	if (!u) return null;
	const first = Math.min(...u.lines.flatMap((l) => l.words.map((w) => w.t)));
	if (f < Math.round(first * FPS)) return null;
	const nx = UNITS[UNITS.indexOf(u) + 1];
	const sameShot = nx && Math.abs(nx.t_in - u.t_out) < 0.06 && nx.box.join() === u.box.join();
	const exitOp = sameShot ? 1 : interpolate(t, [u.t_out - 2 / FPS, u.t_out], [1, 0.0], C);
	const [bx, by, bw, bh] = u.box;
	return (
		<div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: exitOp}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...(u.plate ? {background: 'rgba(8,10,12,0.62)', borderRadius: 22, padding: '16px 28px'} : {})}}>
				{u.lines.map((l, i) => {
					const big = l.tier.startsWith('big');
					const anton = l.font.startsWith('Anton');
					const fam = anton ? 'AntonLocal' : HIND;
					const wt = l.font.includes('SemiBold') ? 600 : 700;
					return (
						<div key={i} style={{whiteSpace: 'pre-wrap', textAlign: 'center', maxWidth: bw - (u.plate ? 56 : 0), lineHeight: l.line_height, fontFamily: fam, fontWeight: wt, fontSize: l.size_px}}>
							{l.words.map((w, j) => {
								const el = (f - Math.round(w.t * FPS)) / 4;
								const p = Math.max(0, Math.min(1, el));
								const shown = el >= 0;
								const coloured = w.colour.toUpperCase() !== '#FFFFFF';
								const stroke = u.accent_stroke && coloured ? {WebkitTextStroke: '12px #0B0E10', paintOrder: 'stroke fill'} : {};
								const tr = big ? `scale(${1.06 - 0.06 * Easing.out(Easing.back(2))(p)})` : `translateY(${12 * (1 - p)}px)`;
								const gap = w.space_after ? (anton ? '0.22em' : '0.28em') : '0';
								return (
									<span key={j} style={{display: 'inline-block', marginRight: big && w.space_after ? `calc(${gap} + 0.08em)` : gap, color: w.colour, opacity: shown ? (big ? 1 : p) : 0, transform: shown ? tr : 'none', transformOrigin: '50% 50%', textShadow: '0 4px 18px rgba(0,0,0,.65), 0 0 2px rgba(0,0,0,.8)', ...(stroke as any)}}>{w.w}</span>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
};

// ---------- progress rail (shots 15-25) ----------
const RAIL = [14.57, 16.0, 19.9, 21.6, 22.65, 25.1, 26.82, 28.1, 29.24, 30.11, 31.01];
const Rail: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t < 13.54 || t >= 32.8) return null;
	const op = interpolate(t, [13.54, 13.8], [0, 1], C);
	return (
		<div style={{position: 'absolute', left: 1000, top: 520, opacity: op}}>
			{Array.from({length: 10}, (_, i) => {
				const on = t >= RAIL[i];
				const s = on ? 1 + 0.6 * Math.max(0, 1 - (t - RAIL[i]) * 4) : 1;
				return <div key={i} style={{width: 16, height: 16, borderRadius: 8, marginBottom: 44, background: on ? RED : 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.55)', transform: `scale(${s})`}} />;
			})}
		</div>
	);
};

// ---------- old-site numbered chips (08-12) ----------
const CHIPS: [number, string][] = [[8.457, 'page'], [8.952, 'palette'], [10.07, 'text'], [10.67, 'pin'], [11.581, 'phone']];
const ListChips: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	if (t < 8.04 || t >= 12.15) return null;
	const strike = interpolate(t, [11.9, 12.05], [0, 1], C);
	return (
		<>
			{CHIPS.map(([at, ic], i) => {
				if (t < at) return null;
				const s = sp(f - fr(at), 11, 230);
				return (
					<div key={i} style={{position: 'absolute', left: 90, top: 330 + i * 96, transform: `scale(${s})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 14, background: '#2A2A2A', borderRadius: 40, padding: '10px 26px 10px 10px', boxShadow: '0 8px 20px rgba(0,0,0,.45)'}}>
						<div style={{width: 54, height: 54, borderRadius: 27, background: '#fff', color: '#2A2A2A', fontFamily: INTER, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
						<Icon k={ic} size={40} color="#B8B8B8" />
						<div style={{position: 'absolute', left: 8, top: '50%', height: 4, width: `${strike * 96}%`, background: '#B8B8B8', borderRadius: 2}} />
					</div>
				);
			})}
		</>
	);
};

// ================= SHOTS (local frame f) =================
type S = {s: number; e: number; el: React.FC};

const Shot01: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<World />
			<Laptop sc={interpolate(f, [0, 11], [0.98, 1], C)}>
				<OffthreadVideo src={P('old_hook.mp4')} muted startFrom={15} style={Fill} />
			</Laptop>
			<Chip text="আগে" f={99} x={40} y={590} />
		</>
	);
};
const Shot02: React.FC = () => {
	const f = useCurrentFrame();
	const sl = interpolate(f, [0, 4], [1, 0], {...C, easing: Easing.out(Easing.cubic)});
	return (
		<>
			<World />
			<Laptop>
				<OffthreadVideo src={P('old_hook.mp4')} muted startFrom={26} style={{...Fill, transform: `translateX(${-(1 - sl) * 880}px)`, filter: `blur(${sl * 8}px)`}} />
				<OffthreadVideo src={P('new_hook.mp4')} muted startFrom={30} style={{...Fill, transform: `translateX(${sl * 880}px)`, filter: `blur(${sl * 8}px)`}} />
			</Laptop>
			<Chip text="এখন" red f={f} x={40} y={590} />
		</>
	);
};
const Shot03: React.FC = () => <Face dur={0.75} src={15.1} z0={1.18} z1={1.21} flash={2} />;
const Shot04: React.FC = () => {
	const f = useCurrentFrame();
	const boost = f >= fr(1.70 - 1.49) && f < fr(2.10 - 1.49);
	const card = f;
	const cs = card >= 0 ? sp(card, 13, 160) : 0;
	return (
		<>
			<Face dur={2.3} src={0.0} z0={1.25} z1={1.27} punch={fr(3.2 - 1.49)} />
			{cs > 0 ? (
				<div style={{position: 'absolute', left: 40, top: 930, width: 620, height: 349, transform: `translateX(${(1 - cs) * -700}px) rotate(${-6 * cs}deg)`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.45)', border: '4px solid #fff'}}>
					<Img src={P('hero_en.jpg')} style={Fill} />
				</div>
			) : null}
			{boost ? (
				<AbsoluteFill>
					<World />
					<Laptop sc={interpolate(f, [fr(0.2), fr(0.6)], [1.0, 1.05], C)}><Img src={P('hero_en.jpg')} style={Fill} /></Laptop>
					<Chip text="এখন" red f={99} x={40} y={590} />
				</AbsoluteFill>
			) : null}
		</>
	);
};
const Shot05: React.FC = () => {
	const f = useCurrentFrame();
	const pc = f - fr(4.11 - 3.79), bd = f - fr(5.94 - 3.79);
	const ps = pc >= 0 ? sp(pc, 12, 200) : 0;
	const bs = bd >= 0 ? sp(bd, 9, 260) : 0;
	return (
		<>
			<Face dur={2.48} src={2.42} z0={1.08} z1={1.15} />
			{ps > 0 ? (
				<div style={{position: 'absolute', left: 690, top: 320, width: 300, height: 368, background: '#fff', borderRadius: 24, padding: 10, transform: `scale(${ps})`, transformOrigin: 'center', boxShadow: '0 24px 50px rgba(0,0,0,.5)'}}>
					<Img src={P('portrait.jpg')} style={{width: 280, height: 343, objectFit: 'cover', borderRadius: 16}} />
				</div>
			) : null}
			{bs > 0 ? (
				<div style={{position: 'absolute', left: 900, top: 625, width: 96, height: 96, borderRadius: 48, background: RED, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${bs})`, boxShadow: '0 10px 24px rgba(0,0,0,.5)'}}>
					<Icon k="cap" size={56} />
				</div>
			) : null}
		</>
	);
};
const Shot06: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<World />
			<Laptop sc={interpolate(f, [0, 24], [1.0, 1.04], C)}>
				<OffthreadVideo src={P('old_hook.mp4')} muted startFrom={0} style={{...Fill, filter: `saturate(${interpolate(f, [0, 20], [1, 0.55], C)})`}} />
			</Laptop>
			<Chip text="আগে" f={f} x={40} y={590} />
		</>
	);
};
const Shot07: React.FC = () => {
	const f = useCurrentFrame();
	const up = 0;
	return (
		<>
			<World />
			<Laptop ty={up} sc={interpolate(f, [0, 29], [1, 1.06], C)}>
				<OffthreadVideo src={P('old_banner_lap.mp4')} muted startFrom={9} style={Fill} />
			</Laptop>
			<Chip text="আগে" f={f} x={40} y={590} />
		</>
	);
};
const Scrim: React.FC = () => <div style={{position: 'absolute', left: 0, right: 0, top: 1280, height: 640, background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.55))'}} />;
const Shot08: React.FC = () => {
	const f = useCurrentFrame();
	const g = interpolate(f, [0, 6], [0.83, 1.08], {...C, easing: ease});
	return (
		<>
			<World />
			<AbsoluteFill style={{transform: `translateY(${interpolate(f, [6, 27], [0, -120], C)}px) scale(${g})`}}>
				<OffthreadVideo src={P('old_banner_bleed.mp4')} muted startFrom={30} style={{width: 1080, height: 1920}} />
			</AbsoluteFill>
			<Scrim />
		</>
	);
};
const Shot09: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<AbsoluteFill style={{transform: `translateY(${interpolate(f, [0, 4], [-200, 0], {...C, easing: Easing.out(Easing.cubic)})}px)`}}>
				<OffthreadVideo src={P('old_static.mp4')} muted startFrom={45} style={{width: 1080, height: 1920}} />
			</AbsoluteFill>
			<Scrim />
		</>
	);
};
// shot 10: focus zoom on the description paragraph (no blur: outside dimmed 45%)
const Shot10: React.FC = () => {
	const f = useCurrentFrame();
	const z = interpolate(f, [0, 8], [0.92, 1.0], {...C, easing: ease}) + interpolate(f, [8, 20], [0, 0.03], C);
	return (
		<>
			<OffthreadVideo src={P('old_static.mp4')} muted startFrom={105} style={{width: 1080, height: 1920, filter: 'brightness(0.45)'}} />
			<div style={{position: 'absolute', left: 0, top: 820, width: 1080, height: 440, transform: `scale(${z})`, boxShadow: '0 30px 70px rgba(0,0,0,.6)', background: '#fff'}}>
				<OffthreadVideo src={P('old_desc.mp4')} muted startFrom={8} style={{width: 1080, height: 440}} />
			</div>
			<Scrim />
		</>
	);
};
const Panel: React.FC<{src: string; h: number; y: number; z?: number; start?: number}> = ({src, h, y, z = 1, start = 0}) => (
	<div style={{position: 'absolute', left: 0, top: y, width: 1080, height: h, overflow: 'hidden', transform: `scale(${z})`, boxShadow: '0 30px 70px rgba(0,0,0,.6)'}}>
		<OffthreadVideo src={P(src)} muted startFrom={start} style={{width: 1080, height: h}} />
	</div>
);
const Shot11: React.FC = () => {
	const f = useCurrentFrame();
	const pin = sp(f - 2, 9, 240);
	return (
		<>
			<World />
			<div style={{position: 'absolute', left: 40, top: 800, width: 1000, height: 721, borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.6)', transform: `scale(${interpolate(f, [0, 27], [1.0, 1.05], C)})`}}><Img src={P('old_map.png')} style={{width: 1000, height: 721}} /></div>
			<div style={{position: 'absolute', left: 535, top: 960 + (1 - pin) * -300, opacity: Math.min(1, pin * 2)}}>
				<svg width={90} height={90} viewBox="0 0 24 24"><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" fill="#6B6B6B" stroke="#fff" strokeWidth={1.5} /><circle cx={12} cy={10} r={2.6} fill="#fff" /></svg>
			</div>
			<Scrim />
		</>
	);
};
const Shot12: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<World />
			<Panel src="old_contact.mp4" h={590} y={860} z={interpolate(f, [0, 17], [1.0, 1.1], C)} start={15} />
			<AbsoluteFill style={{background: '#000', opacity: interpolate(f, [14, 17], [0, 0.4], C)}} />
			<Scrim />
		</>
	);
};
const Shot13: React.FC = () => <Face dur={1.24} src={12.24} z0={1.15} z1={1.16} flash={3} dy={-8} />;
const TopIcon: React.FC<{k: string; f: number}> = ({k, f}) => {
	const s = sp(f, 11, 200);
	return (
		<div style={{position: 'absolute', left: 540 - 75, top: 330, width: 150, height: 150, borderRadius: 34, background: 'rgba(11,14,16,0.72)', border: `4px solid ${RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(0,0,0,.5)'}}>
			<Icon k={k} size={92} />
		</div>
	);
};
const Shot14: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<World />
			<Laptop sc={interpolate(f, [0, 35], [1.0, 1.04], C)} ty={interpolate(f, [0, 6], [80, 0], {...C, easing: Easing.out(Easing.cubic)})}>
				<Img src={P('hero_en.jpg')} style={Fill} />
			</Laptop>
			<Flash n={3} />
			<TopIcon k="code" f={f - 4} />
		</>
	);
};
const Shot15: React.FC = () => {
	const f = useCurrentFrame();
	const r = interpolate(f, [0, 12], [18, 0], {...C, easing: Easing.out(Easing.cubic)});
	const tilt = interpolate(f, [0, 5], [500, 0], {...C, easing: Easing.out(Easing.cubic)});
	const pb = f - fr(14.97 - 14.57);
	return (
		<>
			<World />
			<Laptop rotY={r} ty={tilt}>
				<OffthreadVideo src={P('hero.mp4')} muted style={Fill} />
				{pb >= 0 && pb < 14 ? (
					<div style={{position: 'absolute', left: 516 - 50, top: 283 - 50, width: 100, height: 100, borderRadius: 50, background: 'rgba(225,6,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.3 * Math.sin((pb / 13) * Math.PI)})`, opacity: interpolate(pb, [0, 3, 10, 13], [0, 1, 1, 0])}}>
						<Icon k="play" size={50} />
					</div>
				) : null}
			</Laptop>
		</>
	);
};
// shot 16: bilingual toggle, retimed EN -> BN -> EN, focus zoom on toggle (no blur)
const Shot16: React.FC = () => {
	const f = useCurrentFrame();
	const t = 16.0 + f / FPS;
	const VX = 0, VY = 600, VW = 1080, VH = 607.5;
	const BN = {x: 994, y: VY + 31}, EN = {x: 1041, y: VY + 31};
	const zin = (a: number, b: number) => interpolate(t, [a, b], [0, 1], {...C, easing: ease});
	const zl = Math.min(zin(16.81, 17.0) - zin(17.5, 17.8) + zin(18.25, 18.45) - zin(18.8, 19.1), 1);
	const Z = 1; // no panel zoom (cut headline text at edges); toggle is magnified in a clean inset instead
	const MZ = 2.6, MW = 600, MH = 240, MX = 440, MY = 330;
	const ox = 1010, oy = VY + 31;
	const map = (p: {x: number; y: number}) => ({x: ox + (p.x - ox) * Z, y: oy + (p.y - oy) * Z});
	const glide = interpolate(f, [0, 8], [0.85, 1], {...C, easing: ease});
	const cur = path(f, [[fr(0.71), 1120, 1200], [fr(1.21), BN.x, BN.y + 8], [fr(1.9), BN.x, BN.y + 8], [fr(2.4), 900, 760], [fr(2.4) + 4, 900, 760], [fr(2.45) + 10, EN.x, EN.y + 8]]);
	const cm = map({x: cur.x, y: cur.y});
	const seg = (from: number, dur: number, srcA: number, rate: number) => (
		<Sequence from={fr(from - 16.0)} durationInFrames={fr(dur)}>
			<OffthreadVideo src={P('toggle.mp4')} muted startFrom={Math.round(srcA * FPS)} playbackRate={rate} style={{width: VW, height: VH}} />
		</Sequence>
	);
	return (
		<>
			<World />
			<AbsoluteFill style={{transform: `scale(${glide})`}}>
				<div style={{position: 'absolute', left: VX, top: VY, width: VW, height: VH, overflow: 'hidden', transformOrigin: `${ox}px ${oy - VY}px`, transform: `scale(${Z})`, boxShadow: '0 30px 70px rgba(0,0,0,.6)'}}>
					{seg(16.0, 1.31, 1.2, 1.0)}
					{seg(17.31, 1.3, 2.5, 0.77)}
					{seg(18.61, 1.3, 1.0, 1.07)}
				</div>
				<AbsoluteFill style={{background: '#000', opacity: 0.55 * zl, WebkitMaskImage: `radial-gradient(circle at ${ox - 20}px ${oy}px, transparent 120px, black 200px)`}} />
				{zl > 0.01 ? (
					<div style={{position: 'absolute', left: MX, top: MY, width: MW, height: MH, overflow: 'hidden', borderRadius: 28, border: `4px solid ${RED}`, background: '#000', boxShadow: '0 24px 60px rgba(0,0,0,.6)', opacity: zl, transform: `scale(${0.85 + 0.15 * zl})`, transformOrigin: '90% 100%'}}>
						<div style={{position: 'absolute', left: MW / 2 - 965 * MZ, top: MH / 2 - 46 * MZ, width: VW, height: VH, transform: `scale(${MZ})`, transformOrigin: '0 0'}}>
							{seg(16.0, 1.31, 1.2, 1.0)}
							{seg(17.31, 1.3, 2.5, 0.77)}
							{seg(18.61, 1.3, 1.0, 1.07)}
						</div>
					</div>
				) : null}
				{f >= fr(0.71) ? <Cursor x={cm.x} y={cm.y} f={f} click={[fr(1.31), fr(2.61)]} /> : null}
			</AbsoluteFill>
		</>
	);
};
const Shot17: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<World />
			<Laptop ty={interpolate(f, [0, 5], [-300, 0], {...C, easing: Easing.out(Easing.cubic)})} sc={interpolate(f, [0, 51], [1, 1.03], C)}>
				<OffthreadVideo src={P('pain_wide.mp4')} muted startFrom={45} style={Fill} />
			</Laptop>
		</>
	);
};
const Shot18: React.FC = () => {
	const f = useCurrentFrame();
	const z = interpolate(f, [3, 28], [1, 1.3], {...C, easing: ease});
	return (
		<>
			<World />
			<Laptop ty={interpolate(f, [0, 4], [-300, 0], {...C, easing: Easing.out(Easing.cubic)})}>
				<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 45%'}}>
					<OffthreadVideo src={P('profile.mp4')} muted style={Fill} />
				</AbsoluteFill>
			</Laptop>
		</>
	);
};
const Shot19: React.FC = () => {
	const f = useCurrentFrame();
	const k = (s: number) => fr(s - 22.65);
	// full live page (16:9 source) in the laptop: whole headline visible; video slowed 0.69x so chip selections land on the taps
	const cur = path(f, [[0, 900, 1250], [k(23.15), 419, 712], [k(23.6), 419, 712], [k(23.85), 698, 712], [k(24.3), 698, 712], [k(24.55), 406, 751]]);
	return (
		<>
			<World />
			<Laptop ty={interpolate(f, [0, 6], [120, 0], {...C, easing: ease})} sc={interpolate(f, [0, 73], [1, 1.03], C)}>
				<OffthreadVideo src={P('symptom_wide.mp4')} muted playbackRate={0.69} style={Fill} />
			</Laptop>
			<Cursor x={cur.x} y={cur.y} f={f} click={[k(23.25), k(23.95), k(24.65)]} />
		</>
	);
};
const Shot20: React.FC = () => {
	const f = useCurrentFrame();
	// real Call Now / WhatsApp buttons (crop of live symptom page, 660x136) full-frame, tap + ripple; no face (S14-S15 off-camera)
	const inn = sp(f, 14, 160);
	const BW = 1000, BH = Math.round((136 * BW) / 660), BX = 40, BY = 800;
	const z = interpolate(f, [0, 51], [1, 1.06], C);
	const tap1 = fr(26.27 - 25.1), tap2 = fr(26.55 - 25.1);
	const call = {x: BX + (160 * BW) / 660, y: BY + (70 * BW) / 660};
	const wa = {x: BX + (480 * BW) / 660, y: BY + (70 * BW) / 660};
	const cur = path(f, [[0, 760, 1250], [tap1, call.x + 10, call.y + 10], [tap1 + 4, call.x + 10, call.y + 10], [tap2, wa.x + 10, wa.y + 10]]);
	const press = (t: number) => {
		const d = f - t;
		return d >= 0 && d < 6 ? 1 - 0.06 * Math.sin((d / 6) * Math.PI) : 1;
	};
	const ring = (t: number, p: {x: number; y: number}, col: string) =>
		[0, 5].map((o) => {
			const d = f - t - o;
			if (d < 0 || d > 16) return null;
			const q = d / 16;
			return <div key={o} style={{position: 'absolute', left: p.x - 260 * q, top: p.y - 260 * q, width: 520 * q, height: 520 * q, borderRadius: '50%', border: `6px solid ${col}`, opacity: 0.9 * (1 - q)}} />;
		});
	const glow = interpolate(f, [tap1, tap1 + 6, tap1 + 20], [0, 1, 0.4], C);
	return (
		<>
			<World />
			<AbsoluteFill style={{background: `radial-gradient(circle at ${call.x}px ${call.y}px, rgba(225,6,0,${0.35 * glow}) 0%, rgba(0,0,0,0) 45%)`}} />
			<div style={{position: 'absolute', left: BX, top: BY, width: BW, height: BH, transform: `translateY(${(1 - inn) * 500}px) scale(${z})`, opacity: Math.min(1, inn * 1.6)}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', transform: `scale(${press(tap1) * press(tap2)})`}}>
					<Img src={P('btns_hi.png')} style={{width: BW, height: BH}} />
				</div>
			</div>
			{ring(tap1, call, RED)}
			{ring(tap2, wa, '#ffffff')}
			{f >= 3 ? <Cursor x={cur.x} y={cur.y} f={f} click={[tap1, tap2]} /> : null}
		</>
	);
};
// card stack 21-24
const STACK: [number, number, string, number][] = [[26.82, 28.1, 'disease.mp4', 60], [28.1, 29.24, 'PUB', 0], [29.24, 30.11, 'blog.mp4', 30], [30.11, 31.01, 'chamber.mp4', 15]];
const PubCard: React.FC<{f: number}> = ({f}) => {
	const row = (i: number) => interpolate(f, [6 + i * 4, 12 + i * 4], [0, 1], C);
	const bar = (w: number, h = 16, c = '#E3E3E6') => <div style={{width: w, height: h, borderRadius: 8, background: c}} />;
	return (
		<div style={{width: 960, height: 760, background: '#fff', borderRadius: 26, padding: '44px 54px', boxSizing: 'border-box', fontFamily: INTER, transform: `translateY(${-interpolate(f, [10, 30], [0, 24], C)}px)`}}>
			<div style={{height: 6, width: 120, background: RED, borderRadius: 3}} />
			<div style={{fontSize: 40, fontWeight: 800, color: '#111', marginTop: 20}}>Client-A doctor</div>
			<div style={{fontSize: 24, color: '#555', marginTop: 8}}>MBBS, BCS (Health), FCPS (Surgery), MS (Vascular Surgery)</div>
			<div style={{height: 2, background: '#eee', margin: '28px 0'}} />
			{[0, 1, 2].map((i) => (
				<div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 34, opacity: row(i), transform: `translateY(${(1 - row(i)) * 20}px)`}}>
					<div style={{width: 74, height: 74, borderRadius: 16, background: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon k="book" size={44} color={RED} /></div>
					<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 14}}>{bar(560 - i * 60, 20, '#DADADF')}{bar(380 + i * 40)}</div>
					{bar(90, 34, '#EDEDF0')}
				</div>
			))}
			<div style={{marginTop: 10, color: RED, fontSize: 28, fontWeight: 700}}>Client-A doctorvascularsurgeon.com →</div>
			<div style={{height: 3, background: RED, width: `${interpolate(f, [18, 30], [0, 44], C)}%`, marginTop: 6}} />
		</div>
	);
};
const CardStack: React.FC = () => {
	const f = useCurrentFrame();
	const t = 26.82 + f / FPS;
	return (
		<>
			<World />
			{STACK.map(([s, e, src, st], i) => {
				if (t < s) return null;
				const lf = f - fr(s - 26.82);
				const inn = interpolate(lf, [0, 7], [1, 0], {...C, easing: Easing.out(Easing.cubic)});
				const nextIn = i < 3 && t >= STACK[i + 1][0] ? interpolate(f - fr(STACK[i + 1][0] - 26.82), [0, 7], [0, 1], C) : 0;
				const older = STACK.filter((x) => t >= x[0]).length - 1 - i;
				if (older > 1) return null;
				const isPub = src === 'PUB';
				const H = isPub ? 760 : 540;
				const top = isPub ? 360 : 480;
				return (
					<div key={i} style={{position: 'absolute', left: 60, top, width: 960, height: H, borderRadius: 26, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,.6)', transform: `translateY(${inn * 1300}px) scale(${1 - 0.08 * nextIn}) translateY(${-60 * nextIn}px)`, filter: `brightness(${1 - 0.5 * nextIn})`}}>
						{isPub ? <PubCard f={lf} /> : <OffthreadVideo src={P(src)} muted startFrom={st} style={{width: 960, height: 540}} />}
						{src === 'chamber.mp4'
							? [0, 1].map((k) => {
									const pf = lf - fr(0.3) - k * 4;
									const ps = pf >= 0 ? sp(pf, 8, 260) : 0;
									return ps > 0 ? <div key={k} style={{position: 'absolute', left: 250 + k * 420, top: 150 - (1 - ps) * 120, opacity: Math.min(1, ps * 2)}}><svg width={70} height={70} viewBox="0 0 24 24"><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" fill={RED} stroke="#fff" strokeWidth={1.5} /><circle cx={12} cy={10} r={2.6} fill="#fff" /></svg></div> : null;
							  })
							: null}
					</div>
				);
			})}
		</>
	);
};
const Shot25: React.FC = () => {
	const f = useCurrentFrame();
	const up = interpolate(f, [0, 9], [900, 0], {...C, easing: Easing.out(Easing.cubic)});
	const rx = interpolate(f, [0, 12], [10, 0], C);
	return (
		<>
			<World />
			<div style={{position: 'absolute', left: 260, top: 480, width: 560, height: 1180, perspective: 1600, transformOrigin: '50% 0%', transform: `translateY(${up}px) scale(1.54)`}}>
				<div style={{width: 560, height: 1180, transform: `rotateX(${rx}deg)`, background: '#0a0a0a', borderRadius: 70, padding: 18, boxSizing: 'border-box', boxShadow: '0 40px 90px rgba(0,0,0,.7), inset 0 0 0 3px #333'}}>
					<div style={{position: 'relative', width: 524, height: 1144, borderRadius: 54, overflow: 'hidden', background: '#000'}}>
						<OffthreadVideo src={P('mobile.mp4')} muted style={{width: 524, height: 1136, objectFit: 'cover'}} />
						<div style={{position: 'absolute', left: 262 - 70, top: 14, width: 140, height: 38, borderRadius: 20, background: '#000'}} />
					</div>
				</div>
			</div>
		</>
	);
};
const Shot26: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			<Face dur={1.0} src={36.8} z0={1.2} z1={1.22} flash={2} />
			<TopIcon k="db" f={f - 3} />
		</>
	);
};

// ---------- admin panel mock (illustration in site colours; no invented data) ----------
const SIDE = ['Dashboard', 'Blog', 'Gallery', 'Publications', 'Profile', 'Chambers'];
const AdminUI: React.FC<{t: number; f: number}> = ({t, f}) => {
	const beat = t < 35.12 ? 1 : t < 36.11 ? 2 : t < 37.35 ? 3 : 4;
	const lf = (s: number) => (t - s) * FPS;
	const W = 952, H = 535;
	const bar = (w: number | string, h = 12, c = '#E6E6EA') => <div style={{width: w, height: h, borderRadius: 6, background: c}} />;
	const typed = (txt: string, s: number, cps = 26) => txt.slice(0, Math.max(0, Math.floor((t - s) * cps)));
	const caret = Math.floor(f / 8) % 2 ? '|' : '';
	const card: React.CSSProperties = {background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,.06)'};
	const btn = (txt: string, extra: React.CSSProperties = {}) => <div style={{background: RED, color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, padding: '9px 18px', ...extra}}>{txt}</div>;
	// beat content
	let body: React.ReactNode = null;
	if (beat === 1) {
		const title = typed('Varicose veins: when to see a surgeon', 33.95);
		body = (
			<div style={{...card, height: 360}}>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<div style={{display: 'flex', gap: 14, color: '#555', fontWeight: 800, fontSize: 16}}>{['B', 'I', 'H1', '🔗', '▣'].map((x) => <span key={x}>{x}</span>)}</div>
					{btn('Publish')}
				</div>
				<div style={{border: '2px solid #E10600', borderRadius: 10, padding: '12px 14px', marginTop: 18, fontSize: 24, fontWeight: 700, color: '#111', minHeight: 32}}>{title}{caret}</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24}}>{bar('92%')}{bar('86%')}{bar('64%')}</div>
			</div>
		);
	} else if (beat === 2) {
		const drag = interpolate(t, [35.12, 35.42], [0, 1], {...C, easing: ease});
		const prog = interpolate(t, [35.42, 35.9], [0, 1], C);
		body = (
			<div style={{...card, height: 360, position: 'relative'}}>
				<div style={{border: '3px dashed #C9C9CF', borderRadius: 14, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18, background: prog > 0 ? '#FFF5F5' : '#fff'}}>
					{prog > 0 ? <div style={{width: 300}}><div style={{height: 10, borderRadius: 5, background: '#eee'}}><div style={{height: 10, borderRadius: 5, background: RED, width: `${prog * 100}%`}} /></div>{prog >= 1 ? <div style={{marginTop: 8, display: 'flex', justifyContent: 'center'}}><Icon k="check" size={34} color="#1DB954" /></div> : null}</div> : <Icon k="page" size={40} color="#999" />}
				</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 18}}>
					{[0, 1, 2, 3, 4].map((i) => <div key={i} style={{height: 90, borderRadius: 10, background: '#ECECEF', overflow: 'hidden'}}>{i === 0 && prog >= 1 ? <Img src={P('gallery.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}</div>)}
				</div>
				{prog < 1 ? <div style={{position: 'absolute', left: 520 - drag * 200, top: 120 - drag * 70, width: 170, height: 100, borderRadius: 10, overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,.35)', transform: `rotate(${(1 - drag) * 6}deg)`}}><Img src={P('gallery.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div> : null}
			</div>
		);
	} else if (beat === 3) {
		const open = interpolate(t, [36.36, 36.5], [0, 1], C);
		const fill = (i: number) => interpolate(t, [36.61 + i * 0.15, 36.85 + i * 0.15], [0, 1], C);
		body = (
			<div style={{...card, height: 360, position: 'relative'}}>
				<div style={{display: 'flex', justifyContent: 'flex-end'}}>{btn('+ Add publication')}</div>
				{[0, 1].map((i) => <div key={i} style={{display: 'flex', gap: 14, alignItems: 'center', marginTop: 20}}><Icon k="book" size={28} color={RED} /><div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>{bar('80%', 12, '#DADADF')}{bar('50%')}</div></div>)}
				{open > 0 ? (
					<div style={{position: 'absolute', left: 60, top: 40, right: 60, background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.3)', opacity: open, transform: `scale(${0.92 + 0.08 * open})`}}>
						{['Title', 'Journal', 'Year', 'Link'].map((l, i) => (
							<div key={l} style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12}}>
								<div style={{width: 80, fontSize: 15, color: '#6B6B6B', fontWeight: 700}}>{l}</div>
								<div style={{flex: 1, border: '1.5px solid #DDD', borderRadius: 8, padding: 9}}>{bar(`${fill(i) * (i === 2 ? 20 : 80)}%`, 12, '#CFCFD6')}</div>
							</div>
						))}
						<div style={{display: 'flex', justifyContent: 'flex-end'}}>{btn('Save')}</div>
					</div>
				) : null}
			</div>
		);
	} else {
		const sel = interpolate(t, [37.55, 37.65], [0, 1], C);
		const toast = interpolate(t, [38.6, 38.85], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
		const field = (l: string, v: string, hl = false) => (
			<div style={{marginBottom: 12}}>
				<div style={{fontSize: 13, color: '#6B6B6B', fontWeight: 700}}>{l}</div>
				<div style={{border: hl ? `2px solid ${RED}` : '1.5px solid #DDD', borderRadius: 8, padding: '7px 10px', fontSize: 16, color: '#111', fontWeight: 600, background: hl ? '#FFF5F5' : '#fff'}}>{v}{hl ? caret : ''}</div>
			</div>
		);
		body = (
			<div style={{...card, height: 360, position: 'relative', display: 'flex', gap: 22}}>
				<Img src={P('portrait.jpg')} style={{width: 130, height: 160, objectFit: 'cover', borderRadius: 12}} />
				<div style={{flex: 1}}>
					{field('Name', 'Client-A doctor')}
					{field('Degrees', 'MBBS, BCS (Health), FCPS (Surgery), MS (Vascular Surgery)')}
					{field('Position', 'Assistant Professor of Vascular Surgery, NICVD', sel > 0.5)}
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>{btn('Save changes')}</div>
				</div>
				{toast > 0 ? <div style={{position: 'absolute', right: 20, bottom: 18 - (1 - toast) * 40, opacity: toast, background: '#1DB954', color: '#fff', fontWeight: 800, fontSize: 18, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 30px rgba(0,0,0,.25)'}}><Icon k="check" size={22} />Saved · Live on website</div> : null}
			</div>
		);
	}
	// glide between beats (T7)
	const bStart = [33.8, 35.12, 36.11, 37.35][beat - 1];
	const gl = interpolate(t, [bStart, bStart + 0.3], [1, 0], {...C, easing: ease});
	// cursor per beat (screen coords inside UI)
	let cur: {x: number; y: number} | null = null, clicks: number[] = [];
	if (beat === 1) cur = path(f, [[fr(33.8), 760, 470], [fr(34.1), 520, 150]]);
	if (beat === 2) cur = path(f, [[fr(35.12), 720, 300], [fr(35.42), 520, 230]]);
	if (beat === 3) { cur = path(f, [[fr(36.11), 600, 420], [fr(36.31), 860, 112]]); clicks = [fr(36.31)]; }
	if (beat === 4) { cur = path(f, [[fr(37.35), 700, 450], [fr(37.55), 640, 290], [fr(38.15), 640, 290], [fr(38.45), 860, 345]]); clicks = [fr(37.55), fr(38.45)]; }
	return (
		<div style={{position: 'absolute', inset: 0, width: W, height: H, background: '#F6F6F7', fontFamily: INTER, display: 'flex', flexDirection: 'column'}}>
			<div style={{height: 54, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', borderBottom: '1px solid #eee'}}>
				<div style={{display: 'flex', gap: 10, alignItems: 'center'}}><div style={{background: RED, color: '#fff', fontWeight: 800, fontSize: 16, borderRadius: 8, padding: '5px 12px'}}>Client-A doctor</div><span style={{color: GREY, fontWeight: 700, fontSize: 15}}>Admin</span></div>
				<div style={{display: 'flex', gap: 10, alignItems: 'center', fontSize: 15, fontWeight: 700, color: '#111'}}><Img src={P('portrait.jpg')} style={{width: 34, height: 34, borderRadius: 17, objectFit: 'cover', objectPosition: '50% 20%'}} />Client-A doctor</div>
			</div>
			<div style={{flex: 1, display: 'flex'}}>
				<div style={{width: 190, background: INK, paddingTop: 14}}>
					{SIDE.map((s, i) => {
						const act = (beat === 1 && i === 1) || (beat === 2 && i === 2) || (beat === 3 && i === 3) || (beat === 4 && i === 4);
						return <div key={s} style={{padding: '11px 18px', fontSize: 15, fontWeight: 700, color: act ? '#fff' : '#8a8f96', borderLeft: `4px solid ${act ? RED : 'transparent'}`, background: act ? 'rgba(225,6,0,0.14)' : 'transparent'}}>{s}</div>;
					})}
				</div>
				<div style={{flex: 1, padding: 22, overflow: 'hidden'}}>
					<div style={{transform: `translateY(${gl * 120}px)`, opacity: 1 - gl * 0.3}}>{body}</div>
				</div>
			</div>
			{cur ? <Cursor x={cur.x} y={cur.y} f={f} click={clicks} /> : null}
		</div>
	);
};
const Admin: React.FC = () => {
	const lf = useCurrentFrame();
	const f = lf + fr(33.8);
	const t = f / FPS;
	const up = interpolate(lf, [0, 6], [-500, 0], {...C, easing: Easing.out(Easing.cubic)});
	const z = interpolate(t, [33.8, 35.12], [1, 1.04], C);
	return (
		<>
			<World />
			<Laptop x={50} y={580} w={980} ty={up} sc={z * 1.08}>
				<AbsoluteFill style={{transform: `scale(${interpolate(t, [33.8, 34.2], [1, 1.28], {...C, easing: ease})})`, transformOrigin: '78% 30%'}}>
					<AdminUI t={t} f={f} />
				</AbsoluteFill>
			</Laptop>
		</>
	);
};
const Shot31: React.FC = () => {
	const f = useCurrentFrame();
	const t = 39.2 + f / FPS;
	const p = interpolate(t, [39.5, 40.7], [0, 1], {...C, easing: ease});
	const SW = 1060;
	return (
		<>
			<World />
			<Laptop>
				<Img src={P('hero_en.jpg')} style={Fill} />
				<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${p * 100}%)`}}>
					<OffthreadVideo src={P('old_banner_lap.mp4')} muted startFrom={30} style={Fill} />
				</div>
				<div style={{position: 'absolute', left: p * (SW - 28) - 3, top: 0, width: 6, height: '100%', background: '#fff', boxShadow: '0 0 12px rgba(0,0,0,.5)'}} />
				<div style={{position: 'absolute', left: p * (SW - 28) - 26, top: 220, width: 52, height: 52, borderRadius: 26, background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, fontWeight: 800, color: '#111', fontSize: 20}}>‹ ›</div>
			</Laptop>
			<Chip text="আগে" f={99} x={120} y={590} />
			<Chip text="এখন" red f={f - fr(0.3)} x={880} y={590} />
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 3], [0.7, 0], C)}} />
		</>
	);
};
// last face shot (আমি) + end-card overlay (no extra card shot)
const Shot32: React.FC = () => {
	const f = useCurrentFrame();
	const e = f - fr(41.97 - 41.14);
	const lt = sp(f - 2, 14, 200);
	return (
		<>
			<Sequence durationInFrames={fr(0.83)}><Face dur={0.83} src={47.08} z0={1.2} z1={1.22} /></Sequence>
			<Sequence from={fr(0.83)}><Face dur={1.03} src={47.95} z0={1.22} z1={1.24} dim={0.55} rate={0.12} /></Sequence>
			{e < 0 ? (
				<div style={{position: 'absolute', left: 90, top: 1185, background: '#fff', borderRadius: 40, padding: '12px 30px', fontFamily: INTER, transform: `translateX(${(1 - lt) * -600}px)`, boxShadow: '0 10px 30px rgba(0,0,0,.4)'}}>
					<div style={{fontWeight: 800, fontSize: 34, color: '#111'}}>Dr. Shadly Benzadid</div>
					<div style={{fontWeight: 600, fontSize: 24, color: GREY}}>Benzadid Intelligence</div>
				</div>
			) : null}
			{e >= 0 ? <EndCard e={e} /> : null}
		</>
	);
};
const EndCard: React.FC<{e: number}> = ({e}) => {
	const a = sp(e, 14, 200);
	const dm = sp(e - 6, 10, 220);
	const pulse = 1 + 0.05 * Math.max(0, Math.sin(((e - 18) / 9) * Math.PI)) * (e > 18 && e < 36 ? 1 : 0);
	const brand = interpolate(e, [14, 22], [0, 1], C);
	return (
		<>
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(e, [0, 2], [0.8, 0], C)}} />
			<div style={{position: 'absolute', left: 90, top: 560, width: 900, height: 760, borderRadius: 40, background: 'rgba(11,14,16,0.72)', border: '1.5px solid rgba(255,255,255,0.14)', boxShadow: '0 40px 100px rgba(0,0,0,.6), inset 0 0 120px rgba(225,6,0,0.12)', transform: `scale(${0.9 + 0.1 * a})`, opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6}}>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 96, color: '#fff', lineHeight: 1.2}}>Website চাই?</div>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 150, color: '#fff', lineHeight: 1.15, transform: `scale(${1.15 - 0.15 * dm})`, opacity: Math.min(1, dm * 2)}}><span style={{color: RED}}>DM</span> করুন</div>
				<div style={{marginTop: 18, width: 150, height: 96, borderRadius: 48, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pulse * Math.min(1, dm)})`, boxShadow: '0 12px 40px rgba(225,6,0,.5)'}}><Icon k="mail" size={56} /></div>
				<div style={{marginTop: 34, fontFamily: INTER, fontWeight: 800, fontSize: 44, color: '#fff', letterSpacing: 1, opacity: brand}}>Benzadid Intelligence</div>
			</div>
		</>
	);
};

const SHOTS: S[] = [
	{s: 0, e: 0.37, el: Shot01},
	{s: 0.37, e: 0.74, el: Shot02},
	{s: 0.74, e: 1.49, el: Shot03},
	{s: 1.49, e: 3.79, el: Shot04},
	{s: 3.79, e: 6.27, el: Shot05},
	{s: 6.27, e: 7.07, el: Shot06},
	{s: 7.07, e: 8.04, el: Shot07},
	{s: 8.04, e: 8.95, el: Shot08},
	{s: 8.95, e: 10.02, el: Shot09},
	{s: 10.02, e: 10.67, el: Shot10},
	{s: 10.67, e: 11.58, el: Shot11},
	{s: 11.58, e: 12.15, el: Shot12},
	{s: 12.15, e: 13.39, el: Shot13},
	{s: 13.39, e: 14.57, el: Shot14},
	{s: 14.57, e: 16.0, el: Shot15},
	{s: 16.0, e: 19.9, el: Shot16},
	{s: 19.9, e: 21.6, el: Shot17},
	{s: 21.6, e: 22.65, el: Shot18},
	{s: 22.65, e: 25.1, el: Shot19},
	{s: 25.1, e: 26.82, el: Shot20},
	{s: 26.82, e: 31.01, el: CardStack},
	{s: 31.01, e: 32.8, el: Shot25},
	{s: 32.8, e: 33.8, el: Shot26},
	{s: 33.8, e: 39.2, el: Admin},
	{s: 39.2, e: 41.14, el: Shot31},
	{s: 41.14, e: T001_TOTAL, el: Shot32},
];

// S5 "এরপর কী হলো?" (v2 12.152-13.086, off-camera): old site in laptop drains to grey + dims, then a red sweep teases the new hero.
const ShotS5: React.FC = () => {
	const f = useCurrentFrame();
	const g = interpolate(f, [0, 12], [0, 1], {...C, easing: ease});
	const tease = interpolate(f, [16, 26], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const qp = sp(f - 2, 9, 200);
	return (
		<>
			<World />
			<Laptop sc={interpolate(f, [0, 28], [1.0, 1.05], C)}>
				<OffthreadVideo src={P('old_contact.mp4')} muted startFrom={20} style={{...Fill, filter: `grayscale(${g}) brightness(${1 - 0.45 * g})`}} />
				<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${100 - tease * 38}%)`}}>
					<Img src={P('hero_en.jpg')} style={Fill} />
				</div>
				<div style={{position: 'absolute', top: 0, bottom: 0, width: 8, left: `${100 - tease * 38}%`, background: RED, opacity: tease > 0 && tease < 1 ? 1 : tease >= 1 ? 0.7 : 0, boxShadow: '0 0 30px rgba(225,6,0,.9)'}} />
			</Laptop>
			<div style={{position: 'absolute', left: 540 - 70, top: 1230, width: 140, height: 140, borderRadius: 70, border: `6px solid ${RED}`, transform: `scale(${qp})`, opacity: Math.min(1, qp), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(225,6,0,.45)'}}>
				<div style={{width: 26, height: 26, borderRadius: 13, background: RED, transform: `scale(${1 + 0.25 * Math.sin(f / 3)})`}} />
			</div>
		</>
	);
};

const Body: React.FC = () => (
	<AbsoluteFill style={{background: INK}}>
		{SHOTS.map((sh, i) => {
			const from = fr(sh.s);
			const El = sh.el;
			return (
				<Sequence key={i} from={from} durationInFrames={fr(sh.e) - from} premountFor={15}>
					<El />
				</Sequence>
			);
		})}
		<ListChips />
		<Rail />
	</AbsoluteFill>
);

export const T001V2: React.FC = () => {
	useFonts();
	const a = fr(INS0), b = fr(INS1);
	return (
		<AbsoluteFill style={{background: INK}}>
			<Sequence durationInFrames={a}><Body /></Sequence>
			<Sequence from={a} durationInFrames={b - a}><ShotS5 /></Sequence>
			<Sequence from={b}><Sequence from={-a}><Body /></Sequence></Sequence>
			<Captions />
		</AbsoluteFill>
	);
};
