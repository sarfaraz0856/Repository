import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "./components/Background";
import { S1Hook } from "./scenes/S1Hook";
import { S2Understand } from "./scenes/S2Understand";
import { S3Projects } from "./scenes/S3Projects";
import { S4Ideas } from "./scenes/S4Ideas";
import { S5Skills } from "./scenes/S5Skills";
import { S6Workflow } from "./scenes/S6Workflow";
import { S7Outro } from "./scenes/S7Outro";
import { FPS, SCENES, TOTAL } from "./timing";

const COMPONENTS = [S1Hook, S2Understand, S3Projects, S4Ideas, S5Skills, S6Workflow, S7Outro];

export const ClaudeSample: React.FC = () => (
  <AbsoluteFill>
    <Background />
    {SCENES.map((s, i) => {
      const C = COMPONENTS[i];
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`Scene ${i + 1}`}>
          <C dur={s.dur} />
        </Sequence>
      );
    })}
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);

export const MyComposition = () => (
  <Composition id="ClaudeSample60" component={ClaudeSample} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
