// Full documentary in the "real Claude screen" style: 13 scenes on the measured narration timing.
import React from "react";
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { FPS, LINES, SCENES, TOTAL } from "../full/timing";
import { K } from "./ui";
import { R01, R02, R03, R04 } from "./scenes1";
import { R05, R06, R07, R08 } from "./scenes2";
import { R09, R10, R11, R12, R13 } from "./scenes3";

const SCENE_COMPONENTS = [R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R11, R12, R13];

export const RealVideo: React.FC = () => (
  <AbsoluteFill style={{ background: K.page }}>
    {SCENES.map((s, i) => {
      const Scene = SCENE_COMPONENTS[i];
      const L = LINES.filter((l) => l.scene === i + 1).map((l) => ({ s: l.from - s.from, d: l.dur }));
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Scene ${i + 1}`}>
          <Scene dur={s.dur} L={L} />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/full_mix.wav")} />
  </AbsoluteFill>
);

export const RealComposition: React.FC = () => (
  <Composition id="ClaudeRealFull" component={RealVideo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
