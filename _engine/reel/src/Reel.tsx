import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadHind} from '@remotion/google-fonts/HindSiliguri';
import plan from './plan.json';

const {fontFamily: ANEK} = loadAnek('normal', {weights: ['600', '800'], subsets: ['bengali', 'latin']});
const {fontFamily: HIND} = loadHind('normal', {weights: ['700'], subsets: ['bengali', 'latin']});

const YELLOW = '#FFE135';
const ORANGE = '#FF6A00';
const RED = '#E10600';
const WHITE = '#FFFFFF';
const INK = '#1A0F08';
const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

type Cover = {s: number; e: number; src: string; from: number; kicker: string; title: string; tag?: string; grey?: boolean};
type Hit = {s: number; e: number; words: {t: string; size: number; color?: string}[]};
type W = {t: string; s: number};
type Cap = {s: number; e: number; top: W[]; big: W[]};
type Zoom = {s: number; e: number; scale: number};

const covers = plan.covers as Cover[];
const hits = plan.hits as Hit[];
const inCover = (t: number) => covers.some((c) => t >= c.s && t < c.e);
const inHit = (t: number) => hits.some((c) => t >= c.s && t < c.e);

// ---------- talking head ----------
const zoomAt = (frame: number) => {
	const t = frame / FPS;
	const z = (plan.zooms as Zoom[]).find((x) => t >= x.s && t < x.e);
	if (!z) return {scale: 1.0, flash: 0};
	const local = frame - f(z.s);
	const pop = spring({frame: local, fps: FPS, config: {damping: 14, stiffness: 200}});
	return {scale: interpolate(pop, [0, 1], [z.scale - 0.07, z.scale]), flash: interpolate(local, [0, 3], [0.35, 0], {extrapolateRight: 'clamp'})};
};

const Talk: React.FC = () => {
	const frame = useCurrentFrame();
	const {scale, flash} = zoomAt(frame);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 35%'}}>
				<OffthreadVideo src={staticFile('talk_g.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 38%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
			<AbsoluteFill style={{background: WHITE, opacity: flash}} />
		</AbsoluteFill>
	);
};

// ---------- emphasis: red background, person in front, giant text BEHIND the person ----------
const HitScene: React.FC<{h: Hit}> = ({h}) => {
	const frame = useCurrentFrame();
	const dur = f(h.e - h.s);
	const {scale} = zoomAt(frame + f(h.s));
	const bgIn = interpolate(frame, [0, 3], [0, 1], {extrapolateRight: 'clamp'});
	const out = interpolate(frame, [dur - 3, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const shake = frame < 6 ? Math.sin(frame * 3) * (6 - frame) * 3 : 0;
	return (
		<AbsoluteFill style={{opacity: out}}>
			<AbsoluteFill style={{opacity: bgIn, background: `radial-gradient(circle at 50% 35%, #ff2a1a 0%, ${RED} 40%, #5a0000 100%)`}} />
			<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column', paddingTop: 150, transform: `translateX(${shake}px)`}}>
				{h.words.map((w, i) => {
					const s = spring({frame: frame - i * 4, fps: FPS, config: {damping: 10, stiffness: 180}});
					return (
						<div key={i} style={{fontFamily: ANEK, fontWeight: 800, fontSize: w.size, lineHeight: 0.95, color: w.color === 'y' ? YELLOW : WHITE, opacity: s, transform: `scale(${0.6 + 0.4 * s})`, textShadow: '0 10px 40px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>
							{w.t}
						</div>
					);
				})}
			</AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 35%'}}>
				<OffthreadVideo src={staticFile('person.webm')} transparent muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ---------- website cover on bright warm backdrop ----------
const CoverScene: React.FC<{c: Cover; chainedIn: boolean; chainedOut: boolean}> = ({c, chainedIn, chainedOut}) => {
	const frame = useCurrentFrame();
	const dur = f(c.e - c.s);
	const enter = spring({frame, fps: FPS, config: chainedIn ? {damping: 16, stiffness: 170} : {damping: 14, stiffness: 120}});
	const exit = chainedOut ? 1 : interpolate(frame, [dur - 5, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const zoom = interpolate(frame, [0, dur], [1.0, 1.1]);
	const titleIn = spring({frame: frame - 4, fps: FPS, config: {damping: 12}});
	const tagIn = spring({frame: frame - 9, fps: FPS, config: {damping: 9, stiffness: 220}});
	const cardTf = chainedIn
		? `translateX(${(1 - enter) * 1100}px)`
		: `translateY(${(1 - enter) * 260}px) scale(${0.86 + enter * 0.14}) rotate(${(1 - enter) * -5}deg)`;
	return (
		<AbsoluteFill style={{opacity: exit}}>
			<AbsoluteFill style={{background: 'linear-gradient(160deg, #FFF6E5 0%, #FFE2B8 45%, #FFC38A 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(circle at 80% 15%, rgba(255,255,255,0.9), transparent 40%)'}} />
			<AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,106,0,0.18) 2px, transparent 2px)', backgroundSize: '44px 44px', opacity: 0.7}} />
			<div style={{position: 'absolute', top: 190, left: 70, right: 70, transform: `translateY(${(1 - titleIn) * 50}px)`, opacity: titleIn}}>
				<div style={{display: 'inline-block', fontFamily: HIND, fontWeight: 700, color: WHITE, background: ORANGE, fontSize: 36, padding: '6px 18px', borderRadius: 10, letterSpacing: 2}}>{c.kicker}</div>
				<div style={{fontFamily: ANEK, fontWeight: 800, color: INK, fontSize: 96, lineHeight: 1.02, marginTop: 14}}>{c.title}</div>
			</div>
			<div style={{position: 'absolute', top: 540, left: 60, width: 960, height: 900, borderRadius: 34, overflow: 'hidden', background: '#000', transform: cardTf, boxShadow: '0 50px 90px rgba(120,50,0,0.35), 0 12px 24px rgba(0,0,0,0.18)'}}>
				<AbsoluteFill style={{transform: `scale(${zoom})`}}>
					<OffthreadVideo src={staticFile(c.src)} startFrom={f(c.from)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: c.grey ? 'grayscale(1) contrast(0.9)' : 'saturate(1.15) contrast(1.05)'}} />
				</AbsoluteFill>
				<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 50, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', gap: 11, paddingLeft: 22}}>
					{['#ff5f57', '#febc2e', '#28c840'].map((col) => <div key={col} style={{width: 15, height: 15, borderRadius: 8, background: col}} />)}
				</div>
			</div>
			{c.tag ? (
				<div style={{position: 'absolute', top: 500, right: 80, transform: `scale(${tagIn}) rotate(7deg)`, background: c.grey ? '#3b3b3b' : RED, color: WHITE, fontFamily: ANEK, fontWeight: 800, fontSize: 48, padding: '6px 26px', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>
					{c.tag}
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- two-tier word-by-word captions (E06 style) ----------
const Word: React.FC<{w: W; frame: number; big: boolean; onLight: boolean}> = ({w, frame, big, onLight}) => {
	const size = big ? 118 : 58;
	const local = frame - f(w.s);
	if (local < 0) return <span style={{opacity: 0, fontSize: size, fontFamily: ANEK, fontWeight: 800}}>{w.t}</span>;
	const s = spring({frame: local, fps: FPS, config: {damping: 11, stiffness: 260}});
	const glow = interpolate(local, [0, 8], [1, 0.45], {extrapolateRight: 'clamp'});
	return (
		<span
			style={{
				display: 'inline-block', fontFamily: ANEK, fontWeight: 800, fontSize: size, lineHeight: 1.05,
				color: big ? YELLOW : WHITE, fontStyle: big ? 'normal' : 'italic',
				transform: `translateY(${(1 - s) * 30}px) scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 1.5),
				textShadow: big ? `0 0 ${30 * glow}px rgba(255,225,53,${0.8 * glow}), 0 5px 0 ${INK}, 0 8px 22px rgba(0,0,0,0.7)` : `0 4px 0 ${INK}, 0 6px 16px rgba(0,0,0,0.8)`,
				WebkitTextStroke: onLight ? `3px ${INK}` : '0px',
				paintOrder: 'stroke fill',
			}}
		>
			{w.t}
		</span>
	);
};

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	if (inHit(t)) return null;
	const cap = (plan.captions as Cap[]).find((c) => t >= c.s && t < c.e);
	if (!cap) return null;
	const covered = inCover(t);
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: covered ? 1490 : 1180, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			{cap.top.length ? (
				<div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
					{cap.top.map((w, i) => <Word key={i} w={w} frame={frame} big={false} onLight={covered} />)}
				</div>
			) : null}
			<div style={{display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center', marginTop: -6}}>
				{cap.big.map((w, i) => <Word key={i} w={w} frame={frame} big onLight={covered} />)}
			</div>
		</div>
	);
};

// ---------- chrome ----------
const Chrome: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const lt = plan.lowerThird;
	const ltIn = spring({frame: frame - f(lt.s), fps: FPS, config: {damping: 13}});
	const show = frame >= f(lt.s) && frame < f(lt.e);
	return (
		<>
			<div style={{position: 'absolute', top: 0, left: 0, height: 9, width: `${(frame / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`}} />
			<div style={{position: 'absolute', bottom: 70, right: 50, fontFamily: HIND, fontWeight: 700, fontSize: 26, color: WHITE, opacity: 0.75, letterSpacing: 1.5, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>
				benzadid <span style={{color: ORANGE}}>intelligence</span>
			</div>
			{show ? (
				<div style={{position: 'absolute', left: 60, top: 1300, transform: `translateX(${(1 - ltIn) * -800}px)`}}>
					<div style={{display: 'inline-block', background: YELLOW, color: INK, fontFamily: ANEK, fontWeight: 800, fontSize: 64, padding: '8px 28px', borderRadius: 12}}>Dr. Shadly Benzadid</div>
					<br />
					<div style={{display: 'inline-block', background: WHITE, color: INK, fontFamily: HIND, fontWeight: 700, fontSize: 34, padding: '8px 24px', marginTop: 10, borderRadius: 10}}>Ex-Dental Surgeon · Now AI Generalist</div>
				</div>
			) : null}
		</>
	);
};

export const Reel: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Talk />
		{hits.map((h, i) => (
			<Sequence key={'h' + i} from={f(h.s)} durationInFrames={f(h.e - h.s)}>
				<HitScene h={h} />
			</Sequence>
		))}
		{covers.map((c, i) => (
			<Sequence key={'c' + i} from={f(c.s)} durationInFrames={f(c.e - c.s)}>
				<CoverScene c={c} chainedIn={covers.some((p) => Math.abs(p.e - c.s) < 0.05)} chainedOut={covers.some((n) => Math.abs(n.s - c.e) < 0.05)} />
			</Sequence>
		))}
		<Captions />
		<Chrome />
		<Audio
			src={staticFile(plan.music.file)}
			startFrom={f(plan.music.from)}
			volume={(fr) => {
				const t = fr / FPS;
				const fadeIn = interpolate(t, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'});
				const fadeOut = interpolate(t, [plan.duration - 2, plan.duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				const level = t > 45.3 ? 0.35 : inHit(t) ? 0.22 : 0.13;
				return level * fadeIn * fadeOut;
			}}
		/>
		{(plan.sfx as {t: number; n: string; v: number; d?: number}[]).map((s, i) => (
			<Sequence key={'s' + i} from={Math.max(0, f(s.t))} durationInFrames={s.d ? f(s.d) : undefined}>
				<Audio src={staticFile('sfx/' + s.n + '.mp3')} volume={s.v} />
			</Sequence>
		))}
	</AbsoluteFill>
);
