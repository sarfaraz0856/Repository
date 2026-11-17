import React from 'react';
import {Composition} from 'remotion';
import {GoogleLensDemo} from './GoogleLensDemo';
import {FPS, DURATION, WIDTH, HEIGHT} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GoogleLensDemo"
    component={GoogleLensDemo}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
