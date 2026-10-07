import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadHind} from '@remotion/google-fonts/HindSiliguri';
import plan from './plan3.json';

const {fontFamily: ANEK} = loadAnek('normal', {weights: ['500', '700', '800'], subsets: ['bengali', 'latin']});
const {fontFamily: HIND} = loadHind('normal', {weights: ['600', '700'], subsets: ['bengali', 'latin']});

// calm cinematic palette — warm-neutral, no saturated orange
const GOLD = '#FFD84D';
const CREAM = '#F5EFE6';
const INK = '#0E0F12';
const MARK = '#FF5A3C';
const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Line = {t: string; size: number; gold?: boolean};
type TalkScene = {type: 'talk'; s: number; e: number; zoom?: number; dof?: boolean; bw?: boolean; big?: {at: number; lines: Line[]}; hideCaps?: boolean};
type CardScene = {type: 'card'; s: number; e: number; img: string; name: string; role: string; chip: string; chipAt: number};
type Note = {at: number; text: string; shape: 'stamp' | 'circle' | 'arrow' | 'underline'; x: number; y: number; w?: number; h?: number};
type LaptopScene = {type: 'laptop'; s: number; e: number; src: string; grey?: boolean; kicker: string; title: string; tag: string; segs: {at: number; from: number}[]; notes: Note[]};
type Scene = TalkScene | CardScene | LaptopScene;
type W = {t: string; s: number};
type Cap = {s: number; e: number; top: W[]; big: W[]};

const scenes = plan.scenes as Scene[];
const at = (t: number, type: string) => scenes.find((x) => x.type === type && t >= x.s && t < x.e);

// ---------------- talking head base (always running underneath) ----------------
const zoomFor = (frame: number) => {
	const t = frame / FPS;
	const sc = scenes.find((x) => x.type === 'talk' && t >= x.s && t < x.e) as TalkScene | undefined;
	if (!sc || !sc.zoom) return 1;
	const p = spring({frame: frame - f(sc.s), fps: FPS, config: {damping: 16, stiffness: 160}});
	return interpolate(p, [0, 1], [sc.zoom - 0.06, sc.zoom]);
};

const Base: React.FC = () => {
	const frame = useCurrentFrame();
	const z = zoomFor(frame);
	return (
		<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 34%'}}>
			<OffthreadVideo src={staticFile('talk_A.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</AbsoluteFill>
	);
};

// ---------------- depth layer: blurred bg -> big text -> person cut-out ----------------
const Depth: React.FC<{sc: TalkScene}> = ({sc}) => {
	const frame = useCurrentFrame();
	const abs = frame + f(sc.s);
	const z = zoomFor(abs);
	const dur = f(sc.e - sc.s);
	const fadeIn = interpolate(frame, [0, 5], [0, 1], clamp);
	const fadeOut = interpolate(frame, [dur - 4, dur], [1, 0], clamp);
	const bigFrame = sc.big ? frame - f(sc.big.at - sc.s) : -1;
	return (
		<AbsoluteFill style={{opacity: fadeIn * fadeOut, filter: sc.bw ? 'grayscale(1) contrast(1.12) brightness(0.95)' : 'none'}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 34%'}}>
				<OffthreadVideo src={staticFile('bg_plate.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			{/* soft light leak for depth */}
			<AbsoluteFill style={{background: 'radial-gradient(circle at 78% 18%, rgba(255,226,180,0.18), transparent 45%)'}} />
			{sc.big && bigFrame >= 0 ? (
				<AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
					{sc.big.lines.map((l, i) => {
						const s = spring({frame: bigFrame - i * 3, fps: FPS, config: {damping: 13, stiffness: 150}});
						return (
							<div key={i} style={{fontFamily: ANEK, fontWeight: 800, fontSize: l.size, lineHeight: 0.92, letterSpacing: -2, color: l.gold ? GOLD : CREAM, opacity: s, transform: `translateY(${(1 - s) * 60}px) scale(${0.92 + 0.08 * s})`, whiteSpace: 'nowrap', textShadow: '0 20px 60px rgba(0,0,0,0.35)'}}>
								{l.t}
							</div>
						);
					})}
				</AbsoluteFill>
			) : null}
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 34%'}}>
				<OffthreadVideo src={staticFile('person_A.webm')} transparent muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---------------- glass identity card beside the face ----------------
const Card: React.FC<{sc: CardScene}> = ({sc}) => {
	const frame = useCurrentFrame();
	const dur = f(sc.e - sc.s);
	const inn = spring({frame, fps: FPS, config: {damping: 15, stiffness: 140}});
	const out = interpolate(frame, [dur - 6, dur], [0, 1], clamp);
	const chip = spring({frame: frame - f(sc.chipAt - sc.s), fps: FPS, config: {damping: 9, stiffness: 220}});
	const floatY = Math.sin(frame / 18) * 6;
	return (
		<div style={{position: 'absolute', left: 48, top: 300, width: 400, transform: `translateX(${(1 - inn) * -480 + out * -480}px) translateY(${floatY}px) rotate(${(1 - inn) * -6}deg)`, opacity: 1 - out}}>
			<div style={{borderRadius: 30, padding: 14, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}}>
				<Img src={staticFile(sc.img)} style={{width: '100%', height: 360, objectFit: 'cover', objectPosition: '50% 20%', borderRadius: 20}} />
				<div style={{fontFamily: ANEK, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 14, lineHeight: 1.05}}>{sc.name}</div>
				<div style={{fontFamily: HIND, fontWeight: 600, fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 4}}>{sc.role}</div>
			</div>
			<div style={{position: 'absolute', right: -18, top: -22, transform: `scale(${chip}) rotate(6deg)`, background: GOLD, color: INK, fontFamily: ANEK, fontWeight: 800, fontSize: 34, padding: '6px 20px', borderRadius: 14, boxShadow: '0 10px 24px rgba(0,0,0,0.3)'}}>
				{sc.chip}
			</div>
		</div>
	);
};

// ---------------- laptop container with annotated website ----------------
const NoteMark: React.FC<{n: Note; frame: number}> = ({n, frame}) => {
	const local = frame;
	if (local < 0) return null;
	const draw = interpolate(local, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const lab = spring({frame: local - 6, fps: FPS, config: {damping: 11, stiffness: 200}});
	const w = n.w ?? 300, h = n.h ?? 120;
	const life = n.shape === 'stamp' ? 1 : interpolate(local, [48, 56], [1, 0], clamp);
	if (life <= 0) return null;
	if (n.shape === 'stamp') {
		const s = spring({frame: local, fps: FPS, config: {damping: 8, stiffness: 260}});
		return (
			<div style={{position: 'absolute', left: n.x, top: n.y, transform: `rotate(-12deg) scale(${2.2 - 1.2 * s})`, opacity: Math.min(1, s * 1.4), border: `7px solid ${MARK}`, color: MARK, fontFamily: ANEK, fontWeight: 800, fontSize: 64, padding: '2px 26px', borderRadius: 12, background: 'rgba(255,255,255,0.75)', letterSpacing: 4}}>
				{n.text}
			</div>
		);
	}
	const path =
		n.shape === 'circle'
			? `M ${w * 0.1} ${h * 0.2} C ${w * 0.4} ${-h * 0.15}, ${w * 1.05} ${h * 0.05}, ${w * 0.97} ${h * 0.55} C ${w * 0.9} ${h * 1.1}, ${w * 0.1} ${h * 1.05}, ${w * 0.03} ${h * 0.55} C ${-w * 0.02} ${h * 0.25}, ${w * 0.2} ${h * 0.08}, ${w * 0.35} ${h * 0.05}`
			: n.shape === 'underline'
			? `M 0 ${h * 0.6} C ${w * 0.3} ${h * 0.45}, ${w * 0.7} ${h * 0.75}, ${w} ${h * 0.55}`
			: `M ${w} 0 C ${w * 0.7} ${h * 0.1}, ${w * 0.3} ${h * 0.4}, ${w * 0.05} ${h * 0.9} M ${w * 0.05} ${h * 0.9} L ${w * 0.22} ${h * 0.82} M ${w * 0.05} ${h * 0.9} L ${w * 0.08} ${h * 0.7}`;
	return (
		<div style={{position: 'absolute', left: n.x, top: n.y, width: w, height: h, opacity: life}}>
			<svg width={w} height={h} style={{overflow: 'visible'}}>
				<path d={path} fill="none" stroke={MARK} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
			</svg>
			<div style={{position: 'absolute', left: n.shape === 'arrow' ? w * 0.1 : w * 0.5, top: h + 6, transform: `translateX(-50%) scale(${lab})`, background: MARK, color: '#fff', fontFamily: ANEK, fontWeight: 800, fontSize: 40, padding: '4px 18px', borderRadius: 12, whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'}}>
				{n.text}
			</div>
		</div>
	);
};

const Laptop: React.FC<{sc: LaptopScene}> = ({sc}) => {
	const frame = useCurrentFrame();
	const t = sc.s + frame / FPS;
	const dur = f(sc.e - sc.s);
	const inn = spring({frame, fps: FPS, config: {damping: 16, stiffness: 120}});
	const out = interpolate(frame, [dur - 5, dur], [1, 0], clamp);
	const seg = [...sc.segs].reverse().find((g) => t >= g.at) ?? sc.segs[0];
	const segLocal = frame - f(seg.at - sc.s);
	const swapBlur = interpolate(segLocal, [0, 5], [14, 0], clamp);
	const scroll = interpolate(frame, [0, dur], [1.0, 1.06]);
	const titleIn = spring({frame: frame - 3, fps: FPS, config: {damping: 14}});
	const tagIn = spring({frame: frame - 10, fps: FPS, config: {damping: 9, stiffness: 220}});
	return (
		<AbsoluteFill style={{opacity: out}}>
			<AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 0%, #2a2724 0%, #15161a 55%, #0b0c0f 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,216,77,0.08), transparent 55%)'}} />
			<div style={{position: 'absolute', top: 170, left: 70, right: 70, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 40}px)`}}>
				<div style={{fontFamily: HIND, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: 'rgba(245,239,230,0.6)'}}>{sc.kicker}</div>
				<div style={{fontFamily: ANEK, fontWeight: 800, fontSize: 92, color: CREAM, lineHeight: 1.0, marginTop: 6}}>{sc.title}</div>
			</div>
			<div style={{position: 'absolute', left: 30, top: 440, width: 1020, transform: `translateY(${(1 - inn) * 500}px) rotateX(${(1 - inn) * 25}deg)`, transformOrigin: '50% 100%'}}>
				<div style={{background: '#1c1d22', borderRadius: '30px 30px 10px 10px', padding: 22, boxShadow: '0 60px 100px rgba(0,0,0,0.6)', border: '2px solid #2c2d33'}}>
					<div style={{position: 'relative', height: 700, borderRadius: 10, overflow: 'hidden', background: '#fff'}}>
						<AbsoluteFill style={{transform: `scale(${scroll})`, filter: `blur(${swapBlur}px) ${sc.grey ? 'grayscale(0.9) contrast(0.95)' : ''}`}}>
							<OffthreadVideo key={seg.from} src={staticFile(sc.src)} startFrom={f(seg.from)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 0%'}} />
						</AbsoluteFill>
						{sc.notes.map((n, i) => (
							<NoteMark key={i} n={n} frame={frame - f(n.at - sc.s)} />
						))}
					</div>
				</div>
				<div style={{height: 26, margin: '0 -40px', background: 'linear-gradient(#3a3b42, #22232a)', borderRadius: '0 0 30px 30px'}} />
			</div>
			<div style={{position: 'absolute', top: 430, right: 70, transform: `scale(${tagIn}) rotate(6deg)`, background: '#2b2c31', color: CREAM, border: '2px solid rgba(245,239,230,0.4)', fontFamily: ANEK, fontWeight: 800, fontSize: 44, padding: '4px 24px', borderRadius: 12}}>
				{sc.tag}
			</div>
		</AbsoluteFill>
	);
};

// ---------------- two-tier captions on a glass panel ----------------
const Word: React.FC<{w: W; frame: number; big: boolean}> = ({w, frame, big}) => {
	const size = big ? 104 : 50;
	const local = frame - f(w.s);
	if (local < 0) return null;
	const s = spring({frame: local, fps: FPS, config: {damping: 12, stiffness: 240}});
	return (
		<span style={{display: 'inline-block', fontFamily: ANEK, fontWeight: big ? 800 : 600, fontSize: size, lineHeight: 1.08, color: big ? GOLD : '#fff', opacity: s, transform: `translateY(${(1 - s) * 22}px)`, textShadow: '0 4px 14px rgba(0,0,0,0.45)'}}>
			{w.t}
		</span>
	);
};

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const sc = scenes.find((x) => t >= x.s && t < x.e && x.type === 'talk' && (x as TalkScene).hideCaps);
	if (sc) return null;
	const cap = (plan.captions as Cap[]).find((c) => t >= c.s && t < c.e);
	if (!cap) return null;
	const onLaptop = !!at(t, 'laptop');
	const pIn = spring({frame: frame - f(cap.s), fps: FPS, config: {damping: 16, stiffness: 220}});
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: onLaptop ? 1330 : 1250, display: 'flex', justifyContent: 'center'}}>
			<div style={{maxWidth: 960, padding: '14px 34px 18px', borderRadius: 28, background: 'rgba(14,15,18,0.42)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.12)', transform: `scale(${0.94 + 0.06 * pIn})`, opacity: pIn, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				{cap.top.length ? <div style={{display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center'}}>{cap.top.map((w, i) => <Word key={i} w={w} frame={frame} big={false} />)}</div> : null}
				<div style={{display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center'}}>{cap.big.map((w, i) => <Word key={i} w={w} frame={frame} big />)}</div>
			</div>
		</div>
	);
};

const Chrome: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<>
			<div style={{position: 'absolute', top: 0, left: 0, height: 6, width: `${(frame / durationInFrames) * 100}%`, background: GOLD, opacity: 0.9}} />
			<div style={{position: 'absolute', bottom: 64, right: 48, fontFamily: HIND, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5}}>
				benzadid <span style={{color: GOLD}}>intelligence</span>
			</div>
		</>
	);
};

export const Reel3: React.FC = () => {
	const music = plan.music as {file: string; from: number; levels: {s: number; e: number; v: number}[]; base: number};
	return (
		<AbsoluteFill style={{background: INK}}>
			<Base />
			{scenes.map((sc, i) => {
				const p = {from: f(sc.s), durationInFrames: f(sc.e - sc.s)};
				if (sc.type === 'talk' && (sc.dof || sc.bw || sc.big)) return <Sequence key={i} {...p}><Depth sc={sc} /></Sequence>;
				if (sc.type === 'card') return <Sequence key={i} {...p}><Card sc={sc} /></Sequence>;
				if (sc.type === 'laptop') return <Sequence key={i} {...p}><Laptop sc={sc} /></Sequence>;
				return null;
			})}
			<Captions />
			<Chrome />
			<Audio
				src={staticFile(music.file)}
				startFrom={f(music.from)}
				volume={(fr) => {
					const t = fr / FPS;
					const lv = music.levels.find((l) => t >= l.s && t < l.e);
					return (lv ? lv.v : music.base) * interpolate(t, [0, 0.4], [0, 1], clamp) * interpolate(t, [plan.duration - 1.5, plan.duration], [1, 0], clamp);
				}}
			/>
			{(plan.sfx as {t: number; n: string; v: number; d?: number}[]).map((s, i) => (
				<Sequence key={'s' + i} from={Math.max(0, f(s.t))} durationInFrames={s.d ? f(s.d) : undefined}>
					<Audio src={staticFile('sfx/' + s.n + '.mp3')} volume={s.v} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
