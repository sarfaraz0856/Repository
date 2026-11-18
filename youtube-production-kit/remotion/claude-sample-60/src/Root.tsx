import { MyComposition } from "./Composition";
import { FullComposition } from "./full/FullVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <FullComposition />
    </>
  );
};
