import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

export function hasWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const options = {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance" as const,
      preserveDrawingBuffer: false,
    };
    const context =
      canvas.getContext("webgl2", options) ??
      canvas.getContext("webgl", options) ??
      canvas.getContext("experimental-webgl", options);

    return Boolean(context);
  } catch {
    return false;
  }
}

export function WebGLFallback({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    setOk(hasWebGL());
  }, []);

  if (ok !== false) return children;
  return <FallbackBackground />;
}

function FallbackBackground() {
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 220; i++) {
      const ring = i % 3;
      arr.push({
        x: 50 + (Math.random() - 0.5) * (ring === 0 ? 22 : ring === 1 ? 52 : 88),
        y: 50 + (Math.random() - 0.5) * (ring === 0 ? 22 : ring === 1 ? 52 : 88),
        s: ring === 0 ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        d: 2.5 + Math.random() * 6,
        o: 0.35 + Math.random() * 0.55,
        delay: Math.random() * 4,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)/0.18,transparent_32%),radial-gradient(circle_at_center,var(--color-accent)/0.12,transparent_55%)]" />
      <div className="absolute left-1/2 top-1/2 h-[48vmin] w-[48vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" />
      <div className="absolute left-1/2 top-1/2 h-[64vmin] w-[64vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/15" />
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            opacity: d.o,
            boxShadow: "0 0 12px color-mix(in oklab, var(--color-primary) 70%, transparent)",
            animation: `hud-pulse ${d.d}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="hud-panel max-w-md bg-background/35 p-6 text-center backdrop-blur-sm">
          <div className="mb-2 text-[10px] tracking-[0.4em] text-accent">◢ WEBGL UNAVAILABLE</div>
          <h3 className="font-display text-lg tracking-widest text-primary">PARTICLE ENGINE OFFLINE</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            Your browser session does not currently expose a usable WebGL context for the particle renderer.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The rest of the JARVIS controls remain active while the system waits for GPU access.
          </p>
          <div className="mt-4 text-[10px] tracking-widest text-primary/60">HUD CONTROLS ARE STILL ACTIVE</div>
        </div>
      </div>
    </div>
  );
}
