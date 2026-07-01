import { Composition } from 'remotion';
import { PRODUCT_HUNT_DURATION_IN_FRAMES, ProductHuntLaunch } from './ProductHuntLaunch';

export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_DURATION_IN_FRAMES = PRODUCT_HUNT_DURATION_IN_FRAMES;

export const Root = () => (
  <Composition
    id='TraceProductHuntLaunch'
    component={ProductHuntLaunch}
    durationInFrames={VIDEO_DURATION_IN_FRAMES}
    fps={VIDEO_FPS}
    width={VIDEO_WIDTH}
    height={VIDEO_HEIGHT}
  />
);
