import {Composition} from 'remotion';
import {Reel} from './Reel';
import {Reel3} from './Reel3';
import plan from './plan.json';
import {Storyboard} from './P2';
import {P2Final} from './P2Final';
import {P2V2} from './P2V2';
import {P3} from './P3';
import {P3V2} from './P3V2';
import {T001, T001_TOTAL} from './T001';
import {T001V2, T001V2_TOTAL} from './T001V2';
import {TRIAL004, TRIAL004_TOTAL} from './TRIAL004';
import {J005, J005_TOTAL} from './J005';
import {J005V2, J005V2_TOTAL} from './J005V2';
import p3v2 from './p3plan_v2.json';
import p3plan from './p3plan.json';
import p2v2 from './p2plan_v2.json';
import p2plan from './p2plan.json';
export const Root = () => (
	<>
		<Composition id="Reel" component={Reel} durationInFrames={Math.round(plan.duration * 30)} fps={30} width={1080} height={1920} />
		<Composition id="Reel3" component={Reel3} durationInFrames={Math.round(plan.duration * 30)} fps={30} width={1080} height={1920} />
		<Composition id="Storyboard" component={Storyboard} durationInFrames={960} fps={30} width={1080} height={1920} />
		<Composition id="P2Final" component={P2Final} durationInFrames={Math.round(p2plan.total * 30)} fps={30} width={1080} height={1920} />
		<Composition id="P2V2" component={P2V2} durationInFrames={Math.round(p2v2.total * 30)} fps={30} width={1080} height={1920} />
		<Composition id="P3" component={P3} durationInFrames={Math.round(p3plan.total * 30)} fps={30} width={1080} height={1920} />
		<Composition id="P3V2" component={P3V2} durationInFrames={Math.round(p3v2.total * 30)} fps={30} width={1080} height={1920} />
		<Composition id="T001" component={T001} durationInFrames={Math.round(T001_TOTAL * 30)} fps={30} width={1080} height={1920} />
		<Composition id="T001V2" component={T001V2} durationInFrames={Math.round(T001V2_TOTAL * 30)} fps={30} width={1080} height={1920} />
		<Composition id="TRIAL004" component={TRIAL004} durationInFrames={Math.round(TRIAL004_TOTAL * 30)} fps={30} width={1080} height={1920} />
		<Composition id="J005V2" component={J005V2} durationInFrames={1936} fps={30} width={1080} height={1920} defaultProps={{qa: false}} />
		<Composition id="J005" component={J005} durationInFrames={Math.round(J005_TOTAL * 30)} fps={30} width={1080} height={1920} />
	</>
);
