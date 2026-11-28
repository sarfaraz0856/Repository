import { MyComposition } from "./Composition";
import { FullComposition } from "./full/FullVideo";
import { Sample30Composition } from "./real/Sample30";
import { RealComposition } from "./real/RealVideo";
import { DubComposition } from "./dub/DubVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <FullComposition />
      <Sample30Composition />
      <RealComposition />
      <DubComposition />
    </>
  );
};
