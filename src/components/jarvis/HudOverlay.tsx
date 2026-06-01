import { motion } from "framer-motion";

export function HudOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* corner brackets */}
      {[
        "top-4 left-4 border-l-2 border-t-2",
        "top-4 right-4 border-r-2 border-t-2",
        "bottom-4 left-4 border-l-2 border-b-2",
        "bottom-4 right-4 border-r-2 border-b-2",
      ].map((c, i) => (
        <div key={i} className={`absolute h-10 w-10 ${c} border-primary/70`} />
      ))}

      {/* center reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[68vmin] w-[68vmin]">
          <div className="absolute inset-0 rounded-full border border-primary/30 anim-spin-slow" />
          <div className="absolute inset-[6%] rounded-full border border-dashed border-primary/40 anim-spin-rev" />
          <div className="absolute inset-[14%] rounded-full border border-accent/20" />
          {/* tick marks */}
          <svg className="absolute inset-0 anim-spin-slow" viewBox="-50 -50 100 100">
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const r1 = 48;
              const r2 = i % 5 === 0 ? 43 : 46;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r1}
                  y1={Math.sin(a) * r1}
                  x2={Math.cos(a) * r2}
                  y2={Math.sin(a) * r2}
                  stroke="currentColor"
                  strokeWidth={0.3}
                  className="text-primary/60"
                />
              );
            })}
          </svg>
          {/* radar sweep */}
          <div className="absolute inset-[14%] rounded-full overflow-hidden">
            <div
              className="absolute inset-0 anim-sweep"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--hud) 18%, transparent) 30deg, transparent 60deg)",
              }}
            />
          </div>
          {/* crosshair */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/30" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-primary/30" />
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/80" />
        </div>
      </div>

      {/* top center title chip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-1/2 top-3 -translate-x-1/2"
      >
        <div className="hud-panel px-4 py-1.5 text-[10px] tracking-[0.4em] text-primary/80">
          J.A.R.V.I.S // VISUAL CORTEX ONLINE
        </div>
      </motion.div>

      {/* bottom telemetry strip */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 text-[10px] text-primary/70">
        {["AXS·OK", "GFX·STABLE", "BIO·SYNC", "NET·LOCAL", "PWR·100%"].map((s) => (
          <div key={s} className="hud-panel px-2 py-1 tracking-widest">
            {s}
          </div>
        ))}
      </div>

      {/* side ticks */}
      <div className="absolute left-1 top-1/2 flex -translate-y-1/2 flex-col gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={`h-px ${i % 3 === 0 ? "w-6" : "w-3"} bg-primary/40`} />
        ))}
      </div>
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col items-end gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={`h-px ${i % 3 === 0 ? "w-6" : "w-3"} bg-primary/40`} />
        ))}
      </div>

      {/* scanlines */}
      <div className="absolute inset-0 scanline opacity-40" />
    </div>
  );
}
