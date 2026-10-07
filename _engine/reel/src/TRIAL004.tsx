// TRIAL-004 — built from _job/05_visual_plan.json (v2), captions 05c_captions.json, grade 05d (baked into face_cut.mp4, speed 1.0).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing, continueRender, delayRender} from 'remotion';
import caps from './trial004_captions.json';

const FPS = 30;
export const TRIAL004_TOTAL = 9.0;
const P = (f: string) => staticFile('trial004/' + f);
const F = (t: number) => Math.round(t * FPS);
const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ORANGE = '#FF6A00';
const RED = '#E10600';
const INK = '#0A0603';
const BG = '#F2F4F6';
const GREY = '#C9CED6';
const HIND = 'Hind Siliguri';
const sp = (f: number, d = 12, s = 180) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
const Fill: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1080, height: 1920};

const useFonts = () => {
	const [h] = useState(() => delayRender('fonts'));
	useEffect(() => {
		const ff = new FontFace(HIND, `url(${P('HindSiliguri-Bold.ttf')})`, {weight: '700'});
		ff.load().then((f) => {(document.fonts as any).add(f); continueRender(h);}).catch(() => continueRender(h));
	}, [h]);
};

// ---------- face (graded cut clip; cut time == clip time) ----------
const Face: React.FC<{t0: number; z0: number; z1: number; dur: number; snap?: boolean}> = ({t0, z0, z1, dur, snap}) => {
	const f = useCurrentFrame();
	let z = interpolate(f, [0, F(dur)], [z0, z1], {...C, easing: Easing.inOut(Easing.quad)});
	if (snap) z = z * interpolate(f, [0, 3], [0.94, 1], C);
	return (
		<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
			<OffthreadVideo src={P('face_cut.mp4')} muted startFrom={F(t0)} style={{...Fill, transform: `scale(${z})`, transformOrigin: '540px 900px'}} />
		</AbsoluteFill>
	);
};
const faceZoom = (f: number, z0: number, z1: number, dur: number) => interpolate(f, [0, F(dur)], [z0, z1], {...C, easing: Easing.inOut(Easing.quad)});
const mapPt = (x: number, y: number, z: number) => [540 + (x - 540) * z, 900 + (y - 900) * z];

// ---------- icons (generic, no brands) ----------
const Mag: React.FC<{s?: number; c?: string}> = ({s = 40, c = '#666'}) => (
	<svg width={s} height={s} viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke={c} strokeWidth="2.6" /><line x1="15" y1="15" x2="21" y2="21" stroke={c} strokeWidth="2.6" strokeLinecap="round" /></svg>
);
const Avatar: React.FC<{s: number; c?: string}> = ({s, c = '#B8BEC8'}) => (
	<svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#E6E9EE" /><circle cx="20" cy="15" r="7" fill={c} /><path d="M6 35c3-8 9-11 14-11s11 3 14 11" fill={c} /></svg>
);
const Tooth: React.FC<{s: number; c: string}> = ({s, c}) => (
	<svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 4c-2-1.4-6-1.6-7 1.6-.9 3 .4 5.4 1.2 8 .8 2.7 1 6 2.7 6.3 1.6.3 1.6-4 3.1-4s1.5 4.3 3.1 4c1.7-.3 1.9-3.6 2.7-6.3.8-2.6 2.1-5 1.2-8C18 2.4 14 2.6 12 4z" fill={c} /></svg>
);
const Stars: React.FC<{n?: number; c?: string; s?: number}> = ({n = 5, c = '#F5B800', s = 30}) => (
	<div style={{display: 'flex', gap: 4}}>{Array.from({length: n}).map((_, i) => (
		<svg key={i} width={s} height={s} viewBox="0 0 24 24"><path d="M12 2l3 6.6 7 .7-5.3 4.8 1.6 7L12 17.5 5.7 21l1.6-7L2 9.3l7-.7z" fill={c} /></svg>
	))}</div>
);
const Bar: React.FC<{w: number; h?: number; c?: string}> = ({w, h = 18, c = GREY}) => <div style={{width: w, height: h, borderRadius: h / 2, background: c}} />;
const LogoShape: React.FC<{s: number; c: string; draw?: number}> = ({s, c, draw = 1}) => (
	<div style={{width: s, height: s, borderRadius: s * 0.26, border: `${Math.max(4, s * 0.06)}px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: `inset(0 ${100 - draw * 100}% 0 0)`}}>
		<Tooth s={s * 0.6} c={c} />
	</div>
);

// ---------- captions (05c, C2 word pop) ----------
type W = {w: string; t: number; colour: string};
type U = {id: string; t_in: number; t_out: number; words: W[]; y: number; size_px: number; legibility: string};
const Captions: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const u = (caps.units as U[]).find((x) => t >= x.t_in - 1e-6 && t < x.t_out - 1e-6);
	if (!u) return null;
	const plate = u.legibility.startsWith('dark plate');
	const pop = (wt: number) => {
		const k = f - F(wt);
		return interpolate(k, [0, 2, 4], [0.85, 1.06, 1.0], C);
	};
	const line = (stroke: boolean) => u.words.map((w, i) => {
		const on = t >= w.t - 1e-6;
		return (
			<span key={i} style={{display: 'inline-block', margin: '0 14px', visibility: on ? 'visible' : 'hidden', transform: `scale(${on ? pop(w.t) : 1})`,
				...(!stroke && plate && w.colour === RED ? {background: RED, color: '#fff', borderRadius: 22, padding: '4px 22px 0', margin: '0 6px'} : {}),
				color: stroke ? INK : (plate && w.colour === RED ? '#fff' : w.colour), WebkitTextStroke: stroke ? `12px ${INK}` : undefined,
				textShadow: stroke ? '0 4px 16px rgba(0,0,0,.55)' : undefined}}>{w.w}</span>
		);
	});
	const txt: React.CSSProperties = {fontFamily: HIND, fontWeight: 700, fontSize: u.size_px, lineHeight: 1.25, whiteSpace: 'nowrap', textAlign: 'center'};
	const pk = f - F(u.t_in);
	return (
		<div style={{position: 'absolute', left: 0, width: 1080, top: u.y, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center'}}>
			{plate ? (
				<div style={{background: 'rgba(10,6,3,0.82)', borderRadius: 28, padding: '22px 28px 10px', boxShadow: '0 8px 24px rgba(0,0,0,.35)', maxWidth: 900, transform: `scale(${interpolate(pk, [0, 3], [0.92, 1], C)})`}}>
					<div style={txt}>{line(false)}</div>
				</div>
			) : (
				<div style={{position: 'relative', maxWidth: 900}}>
					<div style={{...txt, position: 'absolute', inset: 0}}>{line(true)}</div>
					<div style={{...txt, position: 'relative'}}>{line(false)}</div>
				</div>
			)}
		</div>
	);
};

// ---------- whip helper ----------
const whip = (f: number, dir: 'up' | 'down' | 'left') => {
	const p = interpolate(f, [0, 6], [1, 0], {...C, easing: Easing.out(Easing.cubic)});
	const blur = p * 22;
	const tr = dir === 'up' ? `translateY(${p * 1920}px)` : dir === 'down' ? `translateY(${-p * 1920}px)` : `translateX(${p * 1080}px)`;
	return {transform: tr};
};

// ================= S1 face + day strip + patient =================
const S1: React.FC = () => {
	const f = useCurrentFrame();
	const days = 7;
	const active = Math.min(days - 1, Math.floor(Math.max(0, f - 6) / 2.4));
	const pat = sp(f - F(0.82), 9, 220);
	return (
		<AbsoluteFill>
			<Face t0={0} z0={1.18} z1={1.24} dur={1.44} />
			<div style={{position: 'absolute', left: 48, top: 340, display: 'flex', gap: 8, padding: 14, borderRadius: 26, background: 'rgba(255,255,255,0.9)', boxShadow: '0 10px 30px rgba(0,0,0,.25)', transform: `scale(${interpolate(f, [0, 4], [0.7, 1], C)})`, transformOrigin: 'left center'}}>
				{Array.from({length: days}).map((_, i) => {
					const s = interpolate(f - i * 1.2, [0, 3], [0, 1], C);
					const on = i === active;
					return <div key={i} style={{width: 40, height: 64, borderRadius: 14, background: on ? ORANGE : '#E3E6EB', transform: `scale(${s}) translateY(${on ? -6 : 0}px)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8}}>
						<div style={{width: 18, height: 6, borderRadius: 3, background: on ? '#fff' : '#B8BEC8'}} />
					</div>;
				})}
			</div>
			{f >= F(0.82) && (
				<div style={{position: 'absolute', left: 836, top: 360, width: 190, height: 190, borderRadius: 95, background: 'rgba(255,255,255,0.92)', boxShadow: '0 10px 30px rgba(0,0,0,.3)', transform: `scale(${0.6 + 0.4 * pat})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width="130" height="130" viewBox="0 0 48 48">
						<circle cx="20" cy="13" r="7" fill="none" stroke={INK} strokeWidth="3" />
						<path d="M6 44c1-10 6-16 14-16 3 0 5 .8 7 2" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
						<rect x="28" y="24" width="14" height="22" rx="3" fill="none" stroke={ORANGE} strokeWidth="3" />
						<line x1="33" y1="42" x2="37" y2="42" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" />
					</svg>
				</div>
			)}
		</AbsoluteFill>
	);
};

// ================= S2 phone search =================
const QUERY = 'dentist near me';
const S2: React.FC = () => {
	const f = useCurrentFrame();
	const w = whip(f, 'up');
	const tilt = interpolate(f, [0, 8], [12, 0], {...C, easing: Easing.out(Easing.cubic)});
	const push = interpolate(f, [0, F(0.84)], [1, 1.08], C);
	const tapT = F(1.60 - 1.44);
	const ripple = interpolate(f - tapT, [0, 6], [0, 1], C);
	const nChars = Math.max(0, Math.min(QUERY.length, Math.floor((f - F(1.74 - 1.44)) / (0.035 * FPS)) + 1));
	const typed = f >= F(1.74 - 1.44) ? QUERY.slice(0, nChars) : '';
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, #FFFFFF 0%, ${BG} 100%)`, ...w}}>
			<div style={{position: 'absolute', left: 170, top: 250, width: 740, height: 1400, borderRadius: 90, background: '#16181C', transform: `scale(${push}) rotate(${tilt}deg)`, transformOrigin: '540px 950px', boxShadow: '0 40px 80px rgba(0,0,0,.25)'}}>
				<div style={{position: 'absolute', left: 22, top: 22, right: 22, bottom: 22, borderRadius: 70, background: '#FFFFFF', overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 290, top: 18, width: 120, height: 30, borderRadius: 15, background: '#16181C'}} />
					{/* search bar */}
					<div style={{position: 'absolute', left: 40, top: 140, width: 616, height: 104, borderRadius: 52, background: '#fff', border: `3px solid ${f >= tapT ? ORANGE : '#DADDE2'}`, boxShadow: '0 6px 18px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', padding: '0 30px', gap: 20}}>
						<Mag s={46} />
						<div style={{fontFamily: 'Arial, sans-serif', fontSize: 40, color: '#1A1A1A', whiteSpace: 'nowrap'}}>{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: ORANGE}}>|</span></div>
					</div>
					{f >= tapT && f < tapT + 8 && (
						<div style={{position: 'absolute', left: 520 - 60 * ripple, top: 192 - 60 * ripple, width: 120 * ripple, height: 120 * ripple, borderRadius: '50%', border: `4px solid ${ORANGE}`, opacity: 1 - ripple}} />
					)}
					{/* grey suggestion bars above caption band */}
					{[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 60, top: 300 + i * 70, display: 'flex', gap: 16, alignItems: 'center', opacity: interpolate(f, [4 + i * 2, 8 + i * 2], [0, 1], C)}}><Mag s={30} c="#B8BEC8" /><Bar w={320 - i * 60} /></div>)}
					{/* keyboard low band */}
					<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 440, background: '#D9DCE1', padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: 16}}>
						{[10, 9, 7].map((n, r) => (
							<div key={r} style={{display: 'flex', gap: 10, justifyContent: 'center'}}>
								{Array.from({length: n}).map((_, k) => {
									const hit = typed.length > 0 && (typed.length * 7 + r * 3) % n === k && f % 2 === 0;
									return <div key={k} style={{width: 56, height: 74, borderRadius: 10, background: hit ? ORANGE : '#fff', boxShadow: '0 2px 0 rgba(0,0,0,.18)'}} />;
								})}
							</div>
						))}
						<div style={{alignSelf: 'center', width: 360, height: 74, borderRadius: 10, background: '#fff'}} />
					</div>
				</div>
			</div>
			{/* fingertip */}
			{f >= tapT - 4 && f < tapT + 10 && (
				<div style={{position: 'absolute', left: 690, top: interpolate(f - tapT, [-4, 0], [520, 420], C), width: 70, height: 70, borderRadius: 35, background: 'rgba(10,6,3,0.25)', border: '4px solid rgba(255,255,255,0.9)'}} />
			)}
		</AbsoluteFill>
	);
};

// ================= result card =================
const Card: React.FC<{y: number; s?: number; badge?: number; you?: boolean; dim?: boolean}> = ({y, s = 1, badge = 0, you, dim}) => (
	<div style={{position: 'absolute', left: 90, top: y, width: 900, height: 230, borderRadius: 34, background: '#fff', border: you ? `6px solid ${ORANGE}` : '2px solid #E3E6EB', boxShadow: '0 14px 34px rgba(0,0,0,.12)', transform: `scale(${s})`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', filter: dim ? 'grayscale(1) brightness(0.92)' : undefined}}>
		{you ? <LogoShape s={130} c={ORANGE} /> : <Avatar s={130} />}
		<div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
			<Bar w={380} h={26} c={you ? '#3A3F47' : '#9AA1AC'} />
			<Bar w={280} />
			<Stars s={30} />
		</div>
		<svg width="40" height="52" viewBox="0 0 24 32" style={{marginLeft: 'auto'}}><path d="M12 1C6 1 2 5.5 2 11c0 7.5 10 19 10 19s10-11.5 10-19C22 5.5 18 1 12 1z" fill={you ? ORANGE : '#B8BEC8'} /><circle cx="12" cy="11" r="4" fill="#fff" /></svg>
		{badge > 0 && (
			<div style={{position: 'absolute', right: -18, top: -26, display: 'flex', gap: 8, transform: `scale(${badge})`}}>
				<div style={{width: 76, height: 76, borderRadius: 38, background: RED, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(225,6,0,.4)'}}>
					<svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="#fff" strokeWidth="4" strokeLinecap="round" /></svg>
				</div>
				<div style={{width: 76, height: 76, borderRadius: 38, background: '#fff', border: `4px solid ${RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width="36" height="36" viewBox="0 0 24 24"><path d="M12 3v16M5 12l7 7 7-7" stroke={RED} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
				</div>
			</div>
		)}
	</div>
);
const SearchHead: React.FC<{y?: number}> = ({y = 120}) => (
	<div style={{position: 'absolute', left: 90, top: y, width: 900, height: 100, borderRadius: 50, background: '#fff', border: '2px solid #DADDE2', display: 'flex', alignItems: 'center', gap: 20, padding: '0 32px'}}>
		<Mag s={42} /><div style={{fontFamily: 'Arial, sans-serif', fontSize: 38, color: '#1A1A1A'}}>dentist near me</div>
	</div>
);
const DashedSlot: React.FC<{y: number; c?: string; h?: number; children?: React.ReactNode}> = ({y, c = '#AEB4BE', h = 230, children}) => (
	<div style={{position: 'absolute', left: 90, top: y, width: 900, height: h, borderRadius: 34, border: `5px dashed ${c}`, background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px'}}>{children}</div>
);

// ================= S3 results =================
const S3: React.FC = () => {
	const f = useCurrentFrame();
	const flash = f === 0 ? 0.4 : 0;
	const glide = interpolate(f, [0, F(1.48)], [0, -40], {...C, easing: Easing.inOut(Easing.quad)});
	const card = (i: number) => interpolate(f - F(0.02) - i * 3.6, [0, 6], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const st = (t: number) => (f >= F(t - 2.28) ? interpolate(f - F(t - 2.28), [0, 4], [1.4, 1], C) : 0);
	const ys = [300, 590, 1190];
	return (
		<AbsoluteFill style={{background: BG}}>
			<div style={{...Fill, transform: `translateY(${glide}px)`}}>
				<SearchHead y={170} />
				{ys.map((y, i) => (
					<div key={i} style={{opacity: card(i), transform: `translateY(${(1 - card(i)) * 40}px)`}}>
						<Card y={y + 20} badge={st([2.9, 3.1, 3.3][i])} />
					</div>
				))}
				{f >= F(3.40 - 2.28) && <div style={{opacity: interpolate(f - F(3.40 - 2.28), [0, 5], [0, 1], C)}}><DashedSlot y={1490} h={150} /></div>}
			</div>
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// ================= S4 face 'কারণ' =================
const S4: React.FC = () => {
	const f = useCurrentFrame();
	const q = sp(f - F(0.06), 8, 240);
	const defocus = 0;
	return (
		<AbsoluteFill>
			<div style={{...Fill}}>
				<Face t0={3.76} z0={1.22} z1={1.25} dur={0.5} snap />
			</div>
			{f >= F(0.06) && f < F(0.46) && (
				<div style={{position: 'absolute', left: 840, top: 380, width: 140, height: 140, borderRadius: 70, background: ORANGE, color: '#fff', fontFamily: 'Arial Black, Arial, sans-serif', fontWeight: 900, fontSize: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${q}) rotate(${(1 - q) * -30}deg)`, boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>?</div>
			)}
		</AbsoluteFill>
	);
};

// ================= S5 empty slot -> নেই =================
const S5: React.FC = () => {
	const f = useCurrentFrame();
	const t = 4.26 + f / FPS;
	const w = whip(f, 'down');
	const zoom = interpolate(f, [0, F(1.3)], [1, 1.15], {...C, easing: Easing.inOut(Easing.quad)});
	const draw = interpolate(t, [4.92, 5.22], [0, 1], C);
	const globe = interpolate(t, [5.30, 5.40], [0, 1], C);
	const neg = t >= 5.64;
	const kx = f - F(1.38);
	const x = neg ? interpolate(kx, [0, 4], [1.6, 1], C) : 0;
	const shake = neg && kx < 4 ? (kx % 2 ? 6 : -6) : 0;
	return (
		<AbsoluteFill style={{background: BG, ...w}}>
			<div style={{...Fill, transform: `translateX(${shake}px)`}}>
				<div style={{...Fill, transform: `scale(${zoom})`, transformOrigin: '540px 1320px', filter: neg ? 'grayscale(1) brightness(0.85)' : undefined}}>
					<SearchHead y={170} />
					<Card y={320} />
					<Card y={600} />
				</div>
				<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: '540px 1320px'}}>
					<DashedSlot y={1200} h={260} c={neg ? RED : '#AEB4BE'}>
						{draw > 0 && <LogoShape s={150} c={neg ? '#B8BEC8' : '#8C939E'} draw={draw} />}
						{draw > 0 && <div style={{display: 'flex', flexDirection: 'column', gap: 16, opacity: draw}}><Bar w={340 * draw} h={26} c="#C9CED6" /><Bar w={240 * draw} /></div>}
						{globe > 0 && (
							<svg width="110" height="110" viewBox="0 0 24 24" style={{marginLeft: 'auto', opacity: neg ? Math.max(0, 1 - kx / 4) : globe * 0.6, transform: neg ? `scale(${1 + kx * 0.1})` : undefined}}>
								<circle cx="12" cy="12" r="9" fill="none" stroke="#8C939E" strokeWidth="1.8" /><ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="#8C939E" strokeWidth="1.5" /><line x1="3" y1="12" x2="21" y2="12" stroke="#8C939E" strokeWidth="1.5" />
							</svg>
						)}
					</DashedSlot>
				</div>
				{neg && (
					<div style={{position: 'absolute', left: 340, top: 420, width: 400, height: 400, borderRadius: 200, background: 'rgba(225,6,0,0.12)', border: `14px solid ${RED}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${x})`}}>
						<svg width="260" height="260" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke={RED} strokeWidth="3.6" strokeLinecap="round" /></svg>
					</div>
				)}
			</div>
		</AbsoluteFill>
	);
};

// ================= S6 face CTA + ring + calendar =================
// fingertip measured on face_cut.mp4 (unscaled px): 6.04 (292,760) 6.14 (328,720) 6.24 (380,760) 6.32 (360,900)
const S6: React.FC = () => {
	const f = useCurrentFrame();
	const t = 5.94 + f / FPS;
	const z = faceZoom(f, 1.24, 1.08, 0.96);
	const flash = f === 0 ? 0.4 : 0;
	const rx = interpolate(t, [6.04, 6.14, 6.24, 6.32], [292, 328, 380, 360], C);
	const ry = interpolate(t, [6.04, 6.14, 6.24, 6.32], [760, 720, 760, 860], C);
	const [px, py] = mapPt(rx, ry, z);
	const ringOn = t >= 6.06 && t < 6.34;
	const rp = (f - F(6.06 - 5.94)) / 8;
	const cal = interpolate(t, [6.42, 6.55], [0, 1], {...C, easing: Easing.out(Easing.cubic)});
	const sweep = interpolate(t, [6.42, 6.80], [0, 360], C);
	const check = interpolate(t, [6.55, 6.75], [0, 1], C);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
				<OffthreadVideo src={P('face_cut.mp4')} muted startFrom={F(5.94)} style={{...Fill, transform: `scale(${z})`, transformOrigin: '540px 900px'}} />
			</AbsoluteFill>
			{ringOn && [0, 0.5].map((d, i) => {
				const p = Math.max(0, Math.min(1, rp - d)) ;
				return <div key={i} style={{position: 'absolute', left: px - 50 - 60 * p, top: py - 50 - 60 * p, width: 100 + 120 * p, height: 100 + 120 * p, borderRadius: '50%', border: `${8 - 4 * p}px solid ${ORANGE}`, opacity: 1 - p * 0.8, boxShadow: `0 0 24px ${ORANGE}`}} />;
			})}
			{t >= 6.42 && (
				<div style={{position: 'absolute', left: 50, top: 340, width: 170, height: 170, borderRadius: 34, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,.3)', opacity: cal, transform: `translateX(${(1 - cal) * -60}px)`, overflow: 'hidden'}}>
					<div style={{height: 46, background: ORANGE}} />
					<svg width="170" height="124" viewBox="0 0 170 124">
						<circle cx="85" cy="62" r="40" fill="none" stroke="#3A3F47" strokeWidth="6" />
						<line x1="85" y1="62" x2={85 + 30 * Math.sin((sweep * Math.PI) / 180)} y2={62 - 30 * Math.cos((sweep * Math.PI) / 180)} stroke={ORANGE} strokeWidth="6" strokeLinecap="round" />
					</svg>
					{check > 0 && (
						<div style={{position: 'absolute', right: 6, bottom: 6, width: 64, height: 64, borderRadius: 32, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * check})`}}>
							<svg width="40" height="40" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset={24 * (1 - check)} /></svg>
						</div>
					)}
				</div>
			)}
			<AbsoluteFill style={{background: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// ================= S7 laptop build =================
const S7: React.FC = () => {
	const f = useCurrentFrame();
	const t = 6.90 + f / FPS;
	const w = whip(f, 'left');
	const push = interpolate(f, [0, F(1.02)], [1, 1.1], C);
	const b = (t0: number) => interpolate(t, [t0, t0 + 0.12], [0, 1], {...C, easing: Easing.out(Easing.back(2))});
	const chip = interpolate(t, [7.44, 7.92], [0, 1], C);
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, #FFFFFF 0%, ${BG} 100%)`, ...w}}>
			<div style={{position: 'absolute', left: 60, top: 300, width: 960, transform: `scale(${push})`, transformOrigin: '540px 300px'}}>
				<div style={{width: 960, height: 520, borderRadius: '30px 30px 0 0', background: '#16181C', padding: 18}}>
					<div style={{width: '100%', height: '100%', borderRadius: 14, background: '#fff', overflow: 'hidden', position: 'relative'}}>
						<div style={{height: 40, background: '#ECEEF1', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px'}}>
							{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
							<div style={{marginLeft: 20, width: 420, height: 22, borderRadius: 11, background: '#fff'}} />
						</div>
						{/* block 1 nav */}
						<div style={{height: 70, display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px', opacity: b(7.0), transform: `translateY(${(1 - b(7.0)) * -30}px)`}}>
							<LogoShape s={50} c={ORANGE} /><div style={{flex: 1}} /><Bar w={80} h={14} /><Bar w={80} h={14} /><Bar w={80} h={14} />
						</div>
						{/* block 2 hero */}
						<div style={{margin: '6px 26px', height: 230, borderRadius: 18, background: `linear-gradient(120deg, ${INK}, #3A1A06)`, display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px', opacity: b(7.2), transform: `scale(${0.8 + 0.2 * b(7.2)})`}}>
							<div style={{display: 'flex', flexDirection: 'column', gap: 16}}><Bar w={340} h={30} c="#FFF0E0" /><Bar w={260} h={18} c="#8C7F72" /><Bar w={200} h={18} c="#8C7F72" /></div>
							<div style={{marginLeft: 'auto'}}><Tooth s={150} c={ORANGE} /></div>
						</div>
						{/* block 3 calendar button */}
						<div style={{margin: '16px 26px', display: 'flex', gap: 16, opacity: b(7.44), transform: `translateY(${(1 - b(7.44)) * 30}px)`}}>
							<div style={{height: 64, padding: '0 28px', borderRadius: 32, background: ORANGE, display: 'flex', alignItems: 'center', gap: 14}}>
								<svg width="36" height="36" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="2.4" /><line x1="3" y1="10" x2="21" y2="10" stroke="#fff" strokeWidth="2.4" /><line x1="8" y1="3" x2="8" y2="7" stroke="#fff" strokeWidth="2.4" /><line x1="16" y1="3" x2="16" y2="7" stroke="#fff" strokeWidth="2.4" /></svg>
								<Bar w={120} h={14} c="#fff" />
							</div>
							<Bar w={160} h={64} c="#ECEEF1" />
						</div>
					</div>
				</div>
				<div style={{width: 1060, marginLeft: -50, height: 34, borderRadius: '0 0 30px 30px', background: '#2A2D33'}} />
			</div>
			{/* mobile preview, low band, same block times */}
			<div style={{position: 'absolute', left: 380, top: 1190, width: 320, height: 480, borderRadius: 44, background: '#16181C', padding: 12, opacity: interpolate(f, [0, 6], [0, 1], C), transform: `translateY(${interpolate(f, [0, 8], [80, 0], {...C, easing: Easing.out(Easing.cubic)})}px)`, boxShadow: '0 20px 40px rgba(0,0,0,.2)'}}>
				<div style={{width: '100%', height: '100%', borderRadius: 34, background: '#fff', overflow: 'hidden', padding: '30px 16px', display: 'flex', flexDirection: 'column', gap: 14}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 10, opacity: b(7.0), transform: `translateY(${(1 - b(7.0)) * -20}px)`}}><LogoShape s={40} c={ORANGE} /><div style={{flex: 1}} /><Bar w={50} h={10} /></div>
					<div style={{height: 170, borderRadius: 14, background: `linear-gradient(120deg, ${INK}, #3A1A06)`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: b(7.2), transform: `scale(${0.8 + 0.2 * b(7.2)})`}}><Tooth s={90} c={ORANGE} /></div>
					<div style={{height: 48, borderRadius: 24, background: ORANGE, opacity: b(7.44), transform: `translateY(${(1 - b(7.44)) * 20}px)`}} />
					<Bar w={240} h={14} /><Bar w={180} h={14} />
				</div>
			</div>
			{/* code chips low band (sides) */}
			{t >= 7.44 && [0, 1, 2].map((i) => {
				const p = Math.max(0, Math.min(1, chip * 1.6 - i * 0.25));
				return (
					<div key={i} style={{position: 'absolute', left: [90, 760, 110][i], top: [1440, 1400, 1600][i] - p * 160, padding: '14px 26px', borderRadius: 22, background: i === 1 ? ORANGE : INK, color: '#fff', fontFamily: 'Consolas, monospace', fontWeight: 700, fontSize: 48, opacity: p, transform: `scale(${0.7 + 0.3 * p})`, boxShadow: '0 10px 24px rgba(0,0,0,.25)'}}>{'</>'}</div>
				);
			})}
		</AbsoluteFill>
	);
};

// ================= S8 face =================
const S8: React.FC = () => <Face t0={7.92} z0={1.15} z1={1.2} dur={0.4} snap />;

// ================= S9 payoff =================
const S9: React.FC = () => {
	const f = useCurrentFrame();
	const t = 8.32 + f / FPS;
	const w = whip(f, 'up');
	const zo = interpolate(f, [0, F(0.68)], [1.12, 1], {...C, easing: Easing.out(Easing.cubic)});
	const chk = t >= 8.55 ? sp(f - F(0.23), 9, 240) : 0;
	return (
		<AbsoluteFill style={{background: BG, ...w}}>
			<div style={{...Fill, transform: `scale(${zo})`}}>
				<SearchHead y={170} />
				<Card y={330} you s={1.04} />
				<div style={{position: 'absolute', left: 900, top: 290, width: 90, height: 90, borderRadius: 45, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk})`, boxShadow: '0 8px 20px rgba(255,106,0,.45)'}}>
					<svg width="54" height="54" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
				</div>
				<div style={{position: 'absolute', left: 30, top: 380, width: 60, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width="54" height="100" viewBox="0 0 24 44"><path d="M12 42V6M3 15l9-10 9 10" stroke={ORANGE} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
				</div>
				<Card y={610} dim />
				<Card y={1200} dim />
			</div>
		</AbsoluteFill>
	);
};

const SHOTS: [number, number, React.FC][] = [
	[0.0, 1.44, S1], [1.44, 2.28, S2], [2.28, 3.76, S3], [3.76, 4.26, S4], [4.26, 5.94, S5],
	[5.94, 6.90, S6], [6.90, 7.92, S7], [7.92, 8.32, S8], [8.32, 9.0, S9],
];

export const TRIAL004: React.FC = () => {
	useFonts();
	return (
		<AbsoluteFill style={{background: INK}}>
			{SHOTS.map(([a, b, Comp], i) => (
				<Sequence key={i} from={F(a)} durationInFrames={F(b) - F(a) + (i < SHOTS.length - 1 ? 6 : 0)}><Comp /></Sequence>
			))}
			<Captions />
		</AbsoluteFill>
	);
};
