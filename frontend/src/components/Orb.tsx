import { useEffect, useRef, useState } from "react";

type OrbState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

interface OrbProps {
  state: OrbState;
  audioLevel?: number; // 0..1
}

export function Orb({ state, audioLevel = 0 }: OrbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (state === "speaking" || state === "listening") {
      setScale(1 + Math.min(audioLevel, 1) * 0.18);
    } else {
      setScale(1);
    }
  }, [audioLevel, state]);

  const isActive = state === "listening" || state === "speaking";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--warm) 45%, transparent) 0%, transparent 65%)",
          animation: isActive ? "orb-glow 2.4s ease-in-out infinite" : "orb-glow 6s ease-in-out infinite",
        }}
      />

      {/* Mid halo */}
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--warm) 25%, transparent), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* The orb */}
      <div
        ref={ref}
        className={state === "idle" || state === "connecting" ? "orb-idle" : ""}
        style={{
          width: 200,
          height: 200,
          borderRadius: "9999px",
          background: `
            radial-gradient(circle at 32% 28%, oklch(0.99 0.02 80) 0%, transparent 45%),
            radial-gradient(circle at 70% 70%, color-mix(in oklab, var(--warm) 70%, white) 0%, var(--warm) 60%, color-mix(in oklab, var(--warm) 60%, black) 100%)
          `,
          boxShadow: "var(--shadow-orb)",
          transform: `scale(${scale})`,
          transition: "transform 120ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      {/* Specular highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 60,
          height: 40,
          top: "calc(50% - 70px)",
          left: "calc(50% - 25px)",
          borderRadius: "9999px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.55), transparent 70%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}

export type { OrbState };
