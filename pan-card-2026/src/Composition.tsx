import { AbsoluteFill, Composition, Sequence } from "remotion";
import timeline from "./timeline.json";
import { Background, Shell, Subtitle } from "./Shell";
import { SCENES } from "./scenes";
import { SiteS3 } from "./site";

type Scene = { id: number; title: string; from: number; dur: number; beats: number[]; ends: number[]; en: string[] };
const T = timeline as { fps: number; total: number; scenes: Scene[] };

// Burned-in subtitles turned off at the user's request (SRT file is still generated separately).
const SHOW_SUBTITLES = false;

const S3 = T.scenes.find((s) => s.id === 3)!;

export const SampleSite: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0A1A33" }}>
    <Background />
    <SiteS3 b={S3.beats} e={S3.ends} dur={S3.dur} />
    {SHOW_SUBTITLES && S3.en.map((t, i) => (
      <Subtitle key={i} text={t} from={S3.beats[i]} to={S3.ends[i]} />
    ))}
  </AbsoluteFill>
);

export const MyComposition = () => {
  return (
    <>
    <Composition id="SampleSite" component={SampleSite} durationInFrames={S3.dur} fps={30} width={1920} height={1080} />
    <Composition
      id="PanCard2026"
      component={PanVideo}
      durationInFrames={T.total}
      fps={30}
      width={1920}
      height={1080}
    />
    </>
  );
};

export const PanVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A1A33" }}>
      <Background />
      {T.scenes.map((sc) => {
        const def = SCENES[sc.id];
        const Comp = def.C;
        return (
          <Sequence key={sc.id} name={`Scene ${sc.id} – ${sc.title}`} from={sc.from} durationInFrames={sc.dur} premountFor={30}>
            <Shell dur={sc.dur} step={def.step} title={def.title} demo={def.demo}>
              <Comp b={sc.beats} e={sc.ends} dur={sc.dur} />
            </Shell>
            {SHOW_SUBTITLES && sc.en.map((t, i) => (
              <Subtitle key={i} text={t} from={sc.beats[i]} to={sc.ends[i]} />
            ))}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
