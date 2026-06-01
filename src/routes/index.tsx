import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "@/components/jarvis/ParticleField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JARVIS OS — Gesture Controlled Particle Intelligence" },
      {
        name: "description",
        content: "An AI-inspired holographic OS. Three.js particles, GLSL shaders, cinematic HUD, six theme cores.",
      },
      { property: "og:title", content: "JARVIS OS" },
      { property: "og:description", content: "Gesture Controlled Particle Intelligence." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { t: "HAND TRACKING", d: "MediaPipe-powered two-hand recognition with gesture confidence." },
  { t: "VOICE COMMANDS", d: "Web Speech wake word ‘Jarvis’ with live transcription overlay." },
  { t: "PARTICLE ENGINE", d: "GLSL shaders, 30K points, smooth morph transitions between forms." },
  { t: "HOLOGRAPHIC HUD", d: "Reactive rings, sweeps, brackets and reticles driven by input." },
  { t: "AI THEMES", d: "Six complete cores: JARVIS, Iron Man, Matrix, Cyberpunk, Tactical, Quantum." },
  { t: "SVG IMPORT", d: "Drop any SVG and watch its paths reform into living particles." },
];

const TECH = ["Three.js", "React Three Fiber", "GLSL", "MediaPipe", "Web Audio", "Web Speech", "Framer Motion", "TanStack"];

function Landing() {
  return (
    <div className="relative min-h-screen">
      {/* background particles */}
      <div className="fixed inset-0 -z-10">
        <ClientOnly fallback={<div className="h-full w-full bg-background" />}>
          <Canvas dpr={1} camera={{ position: [0, 0, 6], fov: 55 }}>
            <ParticleField
              template="galaxy"
              count={9000}
              spread={1.5}
              turbulence={0.12}
              rotationSpeed={0.05}
              colorMode="template"
              glow={0.8}
            />
          </Canvas>
        </ClientOnly>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      </div>

      <Nav />

      <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-4 inline-flex items-center gap-2 border border-primary/40 bg-primary/5 px-3 py-1 text-[10px] tracking-[0.4em] text-primary/80 anim-flicker"
        >
          ◢ STARK INDUSTRIES // VISUAL CORTEX v0.9.7
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9 }}
          className="font-display text-[clamp(3rem,11vw,9rem)] font-black leading-[0.95] tracking-[0.05em] text-primary text-glow"
        >
          JARVIS OS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-3 max-w-xl text-xs tracking-[0.45em] text-accent/90 sm:text-sm"
        >
          GESTURE CONTROLLED PARTICLE INTELLIGENCE
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-6 max-w-xl text-sm text-muted-foreground"
        >
          A cinematic holographic interface where hands, voice, and code orchestrate
          thirty thousand luminous particles in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/workspace"
            className="group relative border border-primary bg-primary/10 px-6 py-3 text-xs tracking-[0.4em] text-primary transition hover:bg-primary/20 box-glow"
          >
            ▸ LAUNCH SYSTEM
          </Link>
          <a
            href="#features"
            className="border border-primary/30 px-6 py-3 text-xs tracking-[0.4em] text-foreground/80 transition hover:border-primary/70 hover:text-primary"
          >
            VIEW FEATURES
          </a>
        </motion.div>

        {/* corner brackets */}
        <Corner pos="top-6 left-6" dir="tl" />
        <Corner pos="top-6 right-6" dir="tr" />
        <Corner pos="bottom-6 left-6" dir="bl" />
        <Corner pos="bottom-6 right-6" dir="br" />
      </section>

      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="◢ MODULES" title="A complete operating system." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05 }}
              className="hud-panel group relative p-6"
            >
              <div className="mb-3 flex items-center justify-between text-[10px] tracking-[0.3em] text-accent/80">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="anim-pulse-soft">● LIVE</span>
              </div>
              <h3 className="font-display text-base tracking-[0.2em] text-primary">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="◢ STACK" title="Built on a serious foundation." />
        <div className="mt-10 flex flex-wrap gap-2">
          {TECH.map((t) => (
            <span key={t} className="border border-primary/30 bg-primary/5 px-3 py-2 text-xs tracking-widest text-primary/80">
              {t}
            </span>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-primary/15 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-[10px] tracking-[0.3em] text-muted-foreground">
          <span>© STARK INDUSTRIES · ALL CHANNELS SECURE</span>
          <span className="anim-pulse-soft text-primary">● UPLINK STABLE</span>
        </div>
      </footer>
    </div>
  );
}

function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-primary/15 bg-background/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2 font-display text-sm tracking-[0.3em] text-primary text-glow">
          <Diamond /> JARVIS·OS
        </div>
        <nav className="hidden gap-6 text-[10px] tracking-[0.3em] text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-primary">MODULES</a>
          <a href="#features" className="hover:text-primary">STACK</a>
          <Link to="/workspace" className="hover:text-primary">WORKSPACE</Link>
        </nav>
        <Link
          to="/workspace"
          className="border border-primary/60 bg-primary/10 px-3 py-1.5 text-[10px] tracking-[0.3em] text-primary hover:bg-primary/20"
        >
          LAUNCH ▸
        </Link>
      </div>
    </header>
  );
}

function Diamond() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3">
      <rect x="3" y="3" width="6" height="6" transform="rotate(45 6 6)" fill="currentColor" />
    </svg>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-primary/20 pb-4">
      <div>
        <div className="text-[10px] tracking-[0.5em] text-accent/80">{eyebrow}</div>
        <h2 className="mt-2 font-display text-2xl tracking-[0.15em] text-primary sm:text-3xl">{title}</h2>
      </div>
      <div className="hidden text-[10px] tracking-[0.3em] text-muted-foreground sm:block">// 2026 / EDITION</div>
    </div>
  );
}

function Corner({ pos, dir }: { pos: string; dir: "tl" | "tr" | "bl" | "br" }) {
  const borders = {
    tl: "border-l-2 border-t-2",
    tr: "border-r-2 border-t-2",
    bl: "border-l-2 border-b-2",
    br: "border-r-2 border-b-2",
  }[dir];
  return <div className={`pointer-events-none absolute ${pos} h-10 w-10 ${borders} border-primary/60`} />;
}
