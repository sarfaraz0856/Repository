import React from 'react';
import {Composition} from 'remotion';
import {GoogleLensDemo} from './GoogleLensDemo';
import {LongVideo} from './long/LongVideo';
import {TL} from './long/timeline';
import {Thumbnail} from './thumbnail/Thumbnail';
import {ThumbB, ThumbC} from './thumbnail/Variants';
import {UPISample} from './upi/UPISample';
import {UPIFull} from './upi/full/UPIFull';
import {FT} from './upi/full/tl';
import {FastagSample} from './fastag/FastagSample';
import {OtpSample} from './otp/OtpSample';
import {FastagFull} from './fastag/full/FastagFull';
import {FastagThumbA, FastagThumbB, FastagThumbC, FastagThumbEN} from './fastag/thumb/FastagThumb';
import {FT as FFT} from './fastag/full/tl';
import {UPIThumbA, UPIThumbB, UPIThumbC, UPIThumbEN} from './upi/thumb/UPIThumb';
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
  <Composition id="ThumbnailB" component={ThumbB} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="ThumbnailC" component={ThumbC} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="UPISample" component={UPISample} durationInFrames={900} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="UPIFull" component={UPIFull} durationInFrames={FT.durationInFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="FastagFull" component={FastagFull} durationInFrames={FFT.durationInFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="FastagThumbA" component={FastagThumbA} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="FastagThumbB" component={FastagThumbB} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="FastagThumbC" component={FastagThumbC} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="FastagThumbEN" component={FastagThumbEN} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="OtpSample" component={OtpSample} durationInFrames={900} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="FastagSample" component={FastagSample} durationInFrames={900} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="UPIThumbA" component={UPIThumbA} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="UPIThumbB" component={UPIThumbB} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="UPIThumbC" component={UPIThumbC} durationInFrames={1} fps={FPS} width={1280} height={720} />
  <Composition id="UPIThumbEN" component={UPIThumbEN} durationInFrames={1} fps={FPS} width={1280} height={720} />
  </>
);
