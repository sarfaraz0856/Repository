// "YouTube video ko English mein dub kaise kare" tutorial: 12 scenes on the measured narration.
import React from "react";
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { FPS, LINES, SCENES, TOTAL } from "./timing";
import { K } from "../real/ui";
import { D01, D02, D03, D04, D05, D06 } from "./scenes1";
import { D07, D08, D09, D10, D11, D12 } from "./scenes2";

const SCENE_COMPONENTS = [D01, D02, D03, D04, D05, D06, D07, D08, D09, D10, D11, D12];

export const DubVideo: React.FC<{ audio?: string }> = ({ audio = "audio/dubvid_mix.wav" }) => (
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
    {audio ? <Audio src={staticFile(audio)} /> : null}
  </AbsoluteFill>
);

export const DubComposition: React.FC = () => (
  <Composition id="DubTutorial" component={DubVideo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ audio: "audio/dubvid_mix.wav" }} />
);
