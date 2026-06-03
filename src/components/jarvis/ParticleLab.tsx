import type { ColorMode } from "./ParticleField";

interface LabState {
  count: number;
  spread: number;
  turbulence: number;
  rotationSpeed: number;
  glow: number;
  colorMode: ColorMode;
}

const COLOR_MODES: ColorMode[] = [
  "single", "template", "rainbow", "cosmic", "neon", "plasma", "aurora", "electric", "quantum",
];

export function ParticleLab({ state, set }: { state: LabState; set: (patch: Partial<LabState>) => void }) {
  return (
    <div className="space-y-4 text-[11px]">
      <Section title="COLOR MODE">
        <div className="grid grid-cols-3 gap-1">
          {COLOR_MODES.map((m) => (
            <button
              key={m}
              onClick={() => set({ colorMode: m })}
              className={`border px-1.5 py-1 uppercase tracking-widest transition ${
                state.colorMode === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Section>

      <Slider label="DENSITY" value={state.count} min={1000} max={30000} step={500}
        onChange={(v) => set({ count: v })} fmt={(v) => `${(v / 1000).toFixed(1)}K`} />
      <Slider label="SPREAD" value={state.spread} min={0.4} max={2.4} step={0.05}
        onChange={(v) => set({ spread: v })} />
      <Slider label="TURBULENCE" value={state.turbulence} min={0} max={0.6} step={0.01}
        onChange={(v) => set({ turbulence: v })} />
      <Slider label="ROTATION" value={state.rotationSpeed} min={-0.6} max={0.6} step={0.01}
        onChange={(v) => set({ rotationSpeed: v })} />
      <Slider label="GLOW" value={state.glow} min={0} max={2} step={0.05}
        onChange={(v) => set({ glow: v })} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] tracking-[0.3em] text-accent/80">◢ {title}</div>
      {children}
    </div>
  );
}

function Slider({
  label, value, min, max, step, onChange, fmt,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] tracking-[0.3em]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-primary">{fmt ? fmt(value) : value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--color-primary)]"
      />
    </div>
  );
}
