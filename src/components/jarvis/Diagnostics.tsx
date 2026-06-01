import { useEffect, useState } from "react";

export function Diagnostics({ template, theme, particleCount }: { template: string; theme: string; particleCount: number }) {
  const [fps, setFps] = useState(60);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let last = performance.now();
    let frames = 0;
    let raf = 0;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  const memMb = mem ? Math.round(mem.usedJSHeapSize / 1048576) : null;

  if (!open) {
    return (
      <div className="pointer-events-none fixed bottom-3 right-3 z-50 hud-panel px-2 py-1 text-[10px] tracking-widest text-primary/70">
        F1 · DIAG · {fps} FPS
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 z-50 hud-panel w-64 p-3 text-[11px] text-primary/90">
      <div className="mb-2 flex items-center justify-between text-[10px] tracking-widest text-accent">
        <span>◢ DIAGNOSTICS</span>
        <span className="anim-pulse-soft">LIVE</span>
      </div>
      <Row k="FPS" v={String(fps)} />
      <Row k="PARTICLES" v={particleCount.toLocaleString()} />
      <Row k="TEMPLATE" v={template.toUpperCase()} />
      <Row k="THEME" v={theme.toUpperCase()} />
      <Row k="CORES" v={String(navigator.hardwareConcurrency ?? "—")} />
      <Row k="DEVICE MEM" v={`${(navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? "—"} GB`} />
      <Row k="JS HEAP" v={memMb !== null ? `${memMb} MB` : "—"} />
      <Row k="VIEWPORT" v={`${window.innerWidth}×${window.innerHeight}`} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-primary/10 py-0.5">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
