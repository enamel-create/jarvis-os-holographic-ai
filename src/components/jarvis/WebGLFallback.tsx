import { useMemo } from "react";

export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function WebGLFallback({ children }: { children: React.ReactNode }) {
  const ok = useMemo(() => hasWebGL(), []);
  if (ok) return children;
  return <FallbackBackground />;
}

function FallbackBackground() {
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 120; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 3,
        d: 3 + Math.random() * 8,
        o: 0.2 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
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
            animation: `hud-pulse ${d.d}s ease-in-out infinite`,
          }}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="hud-panel max-w-md p-6 text-center">
          <div className="mb-2 text-[10px] tracking-[0.4em] text-accent">◢ WEBGL UNAVAILABLE</div>
          <h3 className="font-display text-lg tracking-widest text-primary">PARTICLE ENGINE OFFLINE</h3>
          <p className="mt-2 text-xs text-muted-foreground">
            The 3D particle system requires WebGL. The preview iframe has it disabled.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open this page in a standalone browser tab to see the full holographic experience.
          </p>
          <div className="mt-4 text-[10px] tracking-widest text-primary/60">HUD CONTROLS ARE STILL ACTIVE</div>
        </div>
      </div>
    </div>
  );
}
