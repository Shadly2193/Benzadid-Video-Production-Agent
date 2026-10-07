import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, Easing} from 'remotion';
import {loadFont as loadAnek} from '@remotion/google-fonts/AnekBangla';
import {loadFont as loadTiro} from '@remotion/google-fonts/TiroBangla';
import {loadFont as loadPlay} from '@remotion/google-fonts/PlayfairDisplay';

const {fontFamily: ANEK} = loadAnek('normal', {weights: ['400', '700', '800'], subsets: ['bengali', 'latin']});
const {fontFamily: TIRO} = loadTiro('italic', {weights: ['400'], subsets: ['bengali', 'latin']});
const {fontFamily: PLAY} = loadPlay('italic', {weights: ['400', '700'], subsets: ['latin']});

// palette for this video only: white / black / teal
export const BG = '#F7F8F7';
export const INK = '#0E0F11';
export const TEAL = '#0F7C6E';
export const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pop = (f: number, d = 12, s = 170) => spring({frame: f, fps: FPS, config: {damping: d, stiffness: s}});
const P = (f: string) => staticFile('p2/' + f);

// ---------- shared backdrop: white + vignette + grey arc + drifting particles (E08/E10 grammar) ----------
export const Backdrop: React.FC<{f: number; arc?: boolean; dark?: boolean}> = ({f, arc = true, dark}) => {
	const dots = Array.from({length: 26}, (_, i) => {
		const x = (i * 397) % 1080, y0 = (i * 761) % 1920, r = 3 + (i % 4) * 2;
		const y = (y0 - f * (0.4 + (i % 5) * 0.15)) % 1920;
		return <div key={i} style={{position: 'absolute', left: x, top: y < 0 ? y + 1920 : y, width: r, height: r, borderRadius: r, background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(14,15,17,0.10)', filter: i % 3 === 0 ? 'blur(2px)' : 'none'}} />;
	});
	return (
		<AbsoluteFill style={{background: dark ? '#121416' : BG}}>
			{arc && !dark ? (
				<svg width={1080} height={1920} style={{position: 'absolute', transform: `rotate(${f * 0.04}deg)`, transformOrigin: '50% 50%'}}>
					<path d="M -200 300 C 300 900, 900 700, 1300 1500" stroke="rgba(14,15,17,0.06)" strokeWidth={140} fill="none" strokeLinecap="round" />
				</svg>
			) : null}
			{dots}
			<AbsoluteFill style={{background: dark ? 'radial-gradient(circle at 50% 42%, transparent 30%, rgba(0,0,0,0.75) 100%)' : 'radial-gradient(circle at 50% 45%, transparent 45%, rgba(14,15,17,0.13) 100%)'}} />
		</AbsoluteFill>
	);
};

// ---------- typography helpers ----------
export const Ital: React.FC<{children: React.ReactNode; size: number; f: number; delay?: number; color?: string; latin?: boolean}> = ({children, size, f, delay = 0, color = INK, latin}) => {
	const s = pop(f - delay, 14, 140);
	return <span style={{display: 'inline-block', fontFamily: latin ? PLAY : TIRO, fontStyle: 'italic', fontSize: size, color, opacity: s, transform: `translateY(${(1 - s) * 30}px)`, filter: `blur(${(1 - s) * 8}px)`, lineHeight: 1.1}}>{children}</span>;
};
export const Bold: React.FC<{children: React.ReactNode; size: number; f: number; delay?: number; color?: string}> = ({children, size, f, delay = 0, color = INK}) => {
	const s = pop(f - delay, 11, 180);
	return <span style={{display: 'inline-block', fontFamily: ANEK, fontWeight: 800, fontSize: size, color, letterSpacing: -2, opacity: Math.min(1, s * 1.4), transform: `scale(${0.75 + 0.25 * s}) translateY(${(1 - s) * 40}px)`, filter: `blur(${(1 - s) * 10}px)`, lineHeight: 0.95}}>{children}</span>;
};
const Ghost: React.FC<{t: string; f: number; y: number; size?: number}> = ({t, f, y, size = 330}) => (
	<div style={{position: 'absolute', top: y, left: -60 - f * 1.2, whiteSpace: 'nowrap', fontFamily: ANEK, fontWeight: 800, fontSize: size, color: 'rgba(14,15,17,0.05)', letterSpacing: -10}}>{t}</div>
);

// ---------- S1: surgeon, huge, cropped, breathing zoom ----------
export const S1Surgeon: React.FC<{f: number}> = ({f}) => {
	const inn = pop(f, 15, 90);
	const breathe = interpolate(f, [0, 90], [1.0, 1.06]);
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="SURGEON" f={f} y={360} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 560, height: 1900, transform: `translateY(${(1 - inn) * 260}px) scale(${breathe * (0.9 + 0.1 * inn)})`, transformOrigin: '50% 30%', opacity: Math.min(1, inn * 1.6), filter: 'drop-shadow(0 40px 60px rgba(14,15,17,0.18))'}} />
			<div style={{position: 'absolute', left: 70, top: 130}}>
				<Ital size={86} f={f} delay={6}>একজন</Ital>
				<br />
				<Bold size={230} f={f} delay={12}>সার্জন</Bold>
				<div style={{height: 10, width: interpolate(f, [22, 40], [0, 420], clamp), background: TEAL, borderRadius: 5, marginTop: 6}} />
			</div>
		</AbsoluteFill>
	);
};

// ---------- S2: zoom-through to the scalpel hand, callout label ----------
export const S2Scalpel: React.FC<{f: number}> = ({f}) => {
	const z = interpolate(f, [0, 20], [1, 2.7], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const drift = interpolate(f, [20, 120], [0, 0.12], clamp);
	const line = interpolate(f, [18, 32], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t="SCALPEL" f={f} y={180} size={300} />
			<Img src={P('surgeon.png')} style={{position: 'absolute', left: -60, top: 560, height: 1900, transform: `translate(${interpolate(f, [0, 20], [0, -110], clamp)}px, ${interpolate(f, [0, 20], [0, -560], clamp)}px) scale(${z + drift})`, transformOrigin: '62% 58%', filter: `blur(${interpolate(f, [4, 12, 20], [0, 6, 0], clamp)}px)`}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 560 1000 L 720 760 L 1010 760" stroke={TEAL} strokeWidth={5} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line} />
				<circle cx={560} cy={1000} r={14 * line} fill={TEAL} />
			</svg>
			<div style={{position: 'absolute', right: 50, top: 650, textAlign: 'right', background: 'rgba(255,255,255,0.94)', borderRadius: 22, padding: '6px 26px', boxShadow: '0 16px 40px rgba(14,15,17,0.18)', opacity: interpolate(f, [24, 30], [0, 1], clamp)}}>
				<Bold size={110} f={f} delay={26} color={TEAL}>SCALPEL</Bold>
			</div>
			<div style={{position: 'absolute', left: 70, top: 150}}>
				<Ital size={78} f={f} delay={8}>প্রথমে তার</Ital>
				<br />
				<Bold size={150} f={f} delay={30}>Scalpel দিয়েই</Bold>
			</div>
		</AbsoluteFill>
	);
};

// ---------- S3: real incision footage + teal incision line drawn ----------
export const S3Incision: React.FC<{f: number}> = ({f}) => {
	const cut = interpolate(f, [24, 48], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: BG}} />
			<AbsoluteFill style={{transform: `scale(${interpolate(f, [0, 120], [1.25, 1.35])})`, transformOrigin: '40% 55%'}}>
				<OffthreadVideo src={P('incision.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.06) contrast(1.02) saturate(0.95)'}} />
			</AbsoluteFill>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 140 1250 C 360 1232, 620 1262, 900 1240" stroke={TEAL} strokeWidth={7} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cut} style={{filter: `drop-shadow(0 0 10px ${TEAL})`}} />
			</svg>
			<div style={{position: 'absolute', left: 70, top: 220}}>
				<Ital size={170} f={f} delay={20} latin color={INK}>Incision</Ital>
				<br />
				<Bold size={120} f={f} delay={30} color={TEAL}>দেন</Bold>
			</div>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(14,15,17,0.10) 100%)'}} />
		</AbsoluteFill>
	);
};

// ---------- S4: layer by layer — isometric tissue slabs separating ----------
const LAYERS = [
	{n: 'Skin', bn: 'চামড়া', c: '#E9C7AE'},
	{n: 'Fat', bn: 'চর্বি', c: '#F2DE9E'},
	{n: 'Muscle', bn: 'মাংসপেশি', c: '#B9504B'},
];
export const S4Layers: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill>
		<Backdrop f={f} />
		<Ghost t="LAYERS" f={f} y={150} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 900, perspective: 1600}}>
			{LAYERS.map((l, i) => {
				const s = pop(f - 6 - i * 8, 13, 150);
				const gap = interpolate(f, [30, 60], [0, 1], clamp) * 120;
				return (
					<div key={i} style={{position: 'absolute', left: 140, width: 800, height: 260, top: 120 + i * (150 + gap), transform: `rotateX(58deg) rotateZ(-38deg) translateY(${(1 - s) * -300}px)`, opacity: s, transformStyle: 'preserve-3d'}}>
						<div style={{position: 'absolute', inset: 0, borderRadius: 26, background: `linear-gradient(135deg, ${l.c}, ${l.c}cc)`, boxShadow: '0 50px 70px rgba(14,15,17,0.18), inset 0 2px 0 rgba(255,255,255,0.6)'}} />
					</div>
				);
			})}
			{LAYERS.map((l, i) => {
				const s = pop(f - 30 - i * 6, 14, 160);
				const gap = interpolate(f, [30, 60], [0, 1], clamp) * 120;
				return (
					<div key={'l' + i} style={{position: 'absolute', right: 60, top: 150 + i * (150 + gap), opacity: s, transform: `translateX(${(1 - s) * 60}px)`, display: 'flex', alignItems: 'center', gap: 14}}>
						<div style={{width: 90, height: 3, background: TEAL}} />
						<div style={{fontFamily: ANEK, fontWeight: 700, fontSize: 44, color: TEAL}}>{l.bn}</div>
					</div>
				);
			})}
		</div>
		<div style={{position: 'absolute', left: 70, top: 1540}}>
			<Ital size={150} f={f} delay={4} latin>Layer</Ital> <Ital size={90} f={f} delay={8} latin color={TEAL}>by</Ital> <Ital size={150} f={f} delay={12} latin>Layer</Ital>
		</div>
	</AbsoluteFill>
);

// ---------- S5: suturing — stitches land one by one along the incision ----------
export const S5Stitch: React.FC<{f: number}> = ({f}) => {
	const N = 9;
	return (
		<AbsoluteFill>
			<Backdrop f={f} arc={false} />
			<Ghost t="STITCH" f={f} y={260} />
			<div style={{position: 'absolute', left: -40, right: -40, top: 720, height: 520, borderRadius: 60, background: 'linear-gradient(180deg,#F0D2BE,#E3B89C)', boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.08), 0 30px 60px rgba(14,15,17,0.12)'}} />
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<path d="M 60 980 C 300 965, 700 995, 1020 975" stroke="#9B3B36" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
				{Array.from({length: N}, (_, i) => {
					const x = 120 + i * 105;
					const d = interpolate(f, [10 + i * 5, 16 + i * 5], [0, 1], clamp);
					return <path key={i} d={`M ${x - 34} 900 Q ${x} 980 ${x + 34} 1060`} stroke={TEAL} fill="none" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - d} />;
				})}
			</svg>
			<div style={{position: 'absolute', left: 70, top: 1300}}>
				<Ital size={130} f={f} delay={4} latin>Suturing</Ital>
				<br />
				<Ital size={80} f={f} delay={10}>এর সময়েও ঠিক ততটাই</Ital>
				<br />
				<Bold size={170} f={f} delay={18} color={TEAL}>সুন্দর Stitch</Bold>
			</div>
		</AbsoluteFill>
	);
};

// ---------- S6: website hero in a floating browser ----------
export const S6Website: React.FC<{f: number}> = ({f}) => {
	const s = pop(f, 15, 110);
	const bob = Math.sin(f / 22) * 8;
	return (
		<AbsoluteFill>
			<Backdrop f={f} />
			<Ghost t="HERO" f={f} y={1380} size={420} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 470, transform: `translateY(${(1 - s) * 500 + bob}px) rotateX(${(1 - s) * 18}deg) scale(${1.06})`, transformOrigin: '50% 100%'}}>
				<div style={{borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 120px rgba(14,15,17,0.22)', border: '1px solid rgba(14,15,17,0.08)'}}>
					<div style={{height: 46, background: '#EEF1F0', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20}}>
						{['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 13, height: 13, borderRadius: 7, background: c}} />)}
					</div>
					<div style={{height: 640, position: 'relative', overflow: 'hidden'}}>
						<OffthreadVideo src={P('site_surgeon.mp4')} muted startFrom={0} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</div>
				</div>
			</div>
			<div style={{position: 'absolute', left: 70, top: 190}}>
				<Ital size={78} f={f} delay={6}>জেনারেল সার্জনের ওয়েবসাইটের</Ital>
				<br />
				<Bold size={150} f={f} delay={14}>হিরো সেকশন</Bold>
				<div style={{height: 8, width: interpolate(f, [24, 40], [0, 560], clamp), background: TEAL, borderRadius: 4, marginTop: 4}} />
			</div>
		</AbsoluteFill>
	);
};

// ---------- S7: spotlight reveal of Dr. Shadly (E10 iris grammar) ----------
export const S7Shadly: React.FC<{f: number}> = ({f}) => {
	const iris = interpolate(f, [0, 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const up = pop(f - 6, 15, 110);
	return (
		<AbsoluteFill>
			<Backdrop f={f} dark />
			<div style={{position: 'absolute', left: 540 - 520 * iris, top: 720 - 520 * iris, width: 1040 * iris, height: 1040 * iris, borderRadius: '50%', background: 'radial-gradient(circle, #FFFFFF 0%, #F2F4F3 45%, rgba(242,244,243,0) 70%)'}} />
			<Img src={P('shadly.png')} style={{position: 'absolute', left: 30, top: 470, width: 1020, transform: `translateY(${(1 - up) * 200}px) scale(${interpolate(f, [0, 90], [1.0, 1.05])})`, opacity: up, filter: 'saturate(0.55) contrast(1.05) drop-shadow(0 30px 50px rgba(0,0,0,0.5))'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center'}}>
				<Ital size={80} f={f} delay={10} color="#E8ECEB">আমি</Ital>
				<br />
				<Bold size={150} f={f} delay={16} color="#FFFFFF">Dr. Shadly</Bold>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center'}}>
				<span style={{fontFamily: PLAY, fontStyle: 'italic', fontSize: 40, color: '#CFE7E2', opacity: pop(f - 24)}}>Ex-Dental Surgeon · AI Generalist</span>
			</div>
		</AbsoluteFill>
	);
};

// ---------- S8: E08-style italic bullets ----------
const BUL = ['Innovative', 'Premium Looking', 'International Standard', 'World Class'];
export const S8Bullets: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill>
		<Backdrop f={f} />
		<div style={{position: 'absolute', right: -260, top: 380, width: 900, height: 900, borderRadius: '50%', border: `60px solid ${TEAL}`, opacity: 0.12, transform: `rotate(${f}deg) scale(${interpolate(f, [0, 30], [0.6, 1], clamp)})`}} />
		<div style={{position: 'absolute', left: 80, top: 520}}>
			{BUL.map((b, i) => {
				const s = pop(f - i * 9, 13, 170);
				return (
					<div key={b} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 46, opacity: s, transform: `translateX(${(1 - s) * -80}px)`, filter: `blur(${(1 - s) * 8}px)`}}>
						<div style={{width: 22, height: 22, borderRadius: 11, background: TEAL}} />
						<span style={{fontFamily: PLAY, fontStyle: 'italic', fontSize: i > 1 ? 104 : 120, color: INK, lineHeight: 1}}>{b}</span>
					</div>
				);
			})}
		</div>
		<div style={{position: 'absolute', left: 80, top: 1500}}>
			<Ital size={78} f={f} delay={40}>শুধুমাত্র ডক্টরদের জন্য</Ital>
		</div>
	</AbsoluteFill>
);

// ---------- storyboard composition: 8 scenes x 4s ----------
const SCENES = [S1Surgeon, S2Scalpel, S3Incision, S4Layers, S5Stitch, S6Website, S7Shadly, S8Bullets];
const Wrap: React.FC<{C: React.FC<{f: number}>}> = ({C}) => <C f={useCurrentFrame()} />;
export const Storyboard: React.FC = () => (
	<AbsoluteFill style={{background: BG}}>
		{SCENES.map((C, i) => (
			<Sequence key={i} from={i * 120} durationInFrames={120}>
				<Wrap C={C} />
			</Sequence>
		))}
	</AbsoluteFill>
);
