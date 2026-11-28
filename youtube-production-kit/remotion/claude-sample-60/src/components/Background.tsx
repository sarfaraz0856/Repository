import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + Math.sin(f / 90) * 4}% ${35 + Math.cos(f / 110) * 4}%, rgba(124,92,255,0.30), transparent 42%),
            radial-gradient(circle at ${75 + Math.cos(f / 100) * 4}% ${70 + Math.sin(f / 120) * 4}%, rgba(196,181,253,0.14), transparent 45%),
            linear-gradient(135deg, #0e0d13, #15121f 60%, #0f0d16)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(196,181,253,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(196,181,253,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 50%, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};
