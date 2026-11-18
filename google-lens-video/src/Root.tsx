import React from 'react';
import {Composition} from 'remotion';
import {GoogleLensDemo} from './GoogleLensDemo';
import {LongVideo} from './long/LongVideo';
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
  <Composition id="GoogleLensExplainer6min" component={LongVideo} durationInFrames={10800} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
