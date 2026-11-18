import React from 'react';
import {Composition} from 'remotion';
import {GoogleLensDemo} from './GoogleLensDemo';
import {LongVideo} from './long/LongVideo';
import {TL} from './long/timeline';
import {Thumbnail} from './thumbnail/Thumbnail';
import {FPS, DURATION, WIDTH, HEIGHT} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="GoogleLensDemo"
    component={GoogleLensDemo}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
  <Composition id="GoogleLensExplainer6min" component={LongVideo} durationInFrames={TL.durationInFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
