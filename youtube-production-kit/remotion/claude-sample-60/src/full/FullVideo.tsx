import React from "react";
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import "./fonts";
import { Background } from "../components/Background";
import { S01, S02, S03, S04 } from "./scenes/A";
import { S05, S06, S07, S08 } from "./scenes/B";
import { S09, S10, S11, S12, S13 } from "./scenes/C";
import { Subtitles } from "./Subtitles";
import { FPS, LINES, SCENES, TOTAL } from "./timing";

const SCENE_COMPONENTS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13];

export const FullVideo: React.FC<{ subtitles: boolean }> = ({ subtitles }) => (
  <AbsoluteFill>
    <Background />
    {SCENES.map((s, i) => {
      const Scene = SCENE_COMPONENTS[i];
      const L = LINES.filter((l) => l.scene === i + 1).map((l) => ({ s: l.from - s.from, d: l.dur }));
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Scene ${i + 1}`}>
          <Scene dur={s.dur} L={L} />
        </Sequence>
      );
    })}
    {subtitles ? <Subtitles /> : null}
    <Audio src={staticFile("audio/full_mix.wav")} />
  </AbsoluteFill>
);

export const FullComposition = () => (
  <Composition id="ClaudeYouTubeFull" component={FullVideo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ subtitles: true }} />
);
