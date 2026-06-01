import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ParticleField, type ColorMode } from "@/components/jarvis/ParticleField";
import { HudOverlay } from "@/components/jarvis/HudOverlay";
import { BootSequence } from "@/components/jarvis/BootSequence";
import { Diagnostics } from "@/components/jarvis/Diagnostics";
import { ParticleLab } from "@/components/jarvis/ParticleLab";
import { ThemePicker } from "@/components/jarvis/ThemePicker";
import { TemplateList } from "@/components/jarvis/Sidebar";
import { useTheme, THEMES } from "@/lib/theme";
import { TEMPLATES, type TemplateId } from "@/lib/particle-templates";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "JARVIS OS · Workspace" },
      { name: "description", content: "The JARVIS OS holographic workspace. Particles, HUD, themes, and live controls." },
      { property: "og:title", content: "JARVIS OS · Workspace" },
      { property: "og:description", content: "Holographic particle laboratory." },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { theme } = useTheme();
  const [booted, setBooted] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("galaxy");
  const [lab, setLab] = useState({
    count: 14000,
    spread: 1.4,
    turbulence: 0.1,
    rotationSpeed: 0.12,
    glow: 0.6,
    colorMode: "template" as ColorMode,
  });
  const [hudVisible, setHudVisible] = useState(true);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Adaptive particle count based on cores/memory
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    let preset = 14000;
    if (cores <= 4 || mem <= 4) preset = 8000;
    if (cores >= 8 && mem >= 8) preset = 20000;
    if (cores >= 12 && mem >= 16) preset = 28000;
    setLab((l) => ({ ...l, count: preset }));
  }, []);

  // Keyboard: H toggles HUD, [ ] cycles templates
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "h" || e.key === "H") setHudVisible((v) => !v);
      if (e.key === "]") {
        const i = TEMPLATES.findIndex((t) => t.id === template);
        setTemplate(TEMPLATES[(i + 1) % TEMPLATES.length].id);
      }
      if (e.key === "[") {
        const i = TEMPLATES.findIndex((t) => t.id === template);
        setTemplate(TEMPLATES[(i - 1 + TEMPLATES.length) % TEMPLATES.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [template]);

  const themeName = THEMES.find((t) => t.id === theme)?.name ?? "JARVIS";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      {/* Canvas */}
      <div className="absolute inset-0">
        <ClientOnly fallback={<div className="h-full w-full bg-background" />}>
          <Canvas dpr={1} camera={{ position: [0, 0, 6.5], fov: 50 }}>
            <ParticleField
              template={template}
              count={lab.count}
              spread={lab.spread}
              turbulence={lab.turbulence}
              rotationSpeed={lab.rotationSpeed}
              colorMode={lab.colorMode}
              glow={lab.glow}
            />
          </Canvas>
        </ClientOnly>
      </div>

      {/* HUD */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HudOverlay />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-primary/15 bg-background/40 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] text-primary/80">
          <Link to="/" className="text-primary text-glow font-display tracking-[0.3em]">JARVIS·OS</Link>
          <span className="text-muted-foreground">/ WORKSPACE</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] tracking-[0.3em]">
          <span className="text-muted-foreground">THEME</span>
          <span className="text-primary">{themeName.toUpperCase()}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">TEMPLATE</span>
          <span className="text-accent">{TEMPLATES.find((t) => t.id === template)?.name.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-muted-foreground">
          <button onClick={() => setLeftOpen((v) => !v)} className="hover:text-primary">◧ LEFT</button>
          <button onClick={() => setHudVisible((v) => !v)} className="hover:text-primary">◉ HUD</button>
          <button onClick={() => setRightOpen((v) => !v)} className="hover:text-primary">RIGHT ◨</button>
        </div>
      </div>

      {/* Left sidebar */}
      <AnimatePresence>
        {leftOpen && (
          <motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="absolute left-3 top-14 bottom-3 z-30 w-64 overflow-y-auto"
          >
            <div className="hud-panel p-4">
              <div className="mb-2 text-[10px] tracking-[0.4em] text-accent">◢ PARTICLE TEMPLATES</div>
              <TemplateList current={template} onPick={setTemplate} />
              <div className="mt-5 mb-2 text-[10px] tracking-[0.4em] text-accent">◢ THEME CORES</div>
              <ThemePicker />
              <div className="mt-5 mb-2 text-[10px] tracking-[0.4em] text-accent">◢ SHORTCUTS</div>
              <ul className="space-y-1 text-[10px] tracking-widest text-muted-foreground">
                <li><span className="text-primary">H</span> · Toggle HUD</li>
                <li><span className="text-primary">[ / ]</span> · Prev / Next template</li>
                <li><span className="text-primary">F1</span> · Diagnostics</li>
              </ul>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Right sidebar */}
      <AnimatePresence>
        {rightOpen && (
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="absolute right-3 top-14 bottom-3 z-30 w-72 overflow-y-auto"
          >
            <div className="hud-panel p-4">
              <div className="mb-3 text-[10px] tracking-[0.4em] text-accent">◢ PARTICLE LAB</div>
              <ParticleLab state={lab} set={(p) => setLab((s) => ({ ...s, ...p }))} />
              <div className="mt-5 mb-2 text-[10px] tracking-[0.4em] text-accent">◢ STATUS</div>
              <StatusBlock template={template} themeName={themeName} count={lab.count} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Diagnostics template={template} theme={theme} particleCount={lab.count} />
    </div>
  );
}

function StatusBlock({ template, themeName, count }: { template: string; themeName: string; count: number }) {
  return (
    <div className="space-y-1 text-[10px] tracking-widest">
      <Row k="CORE" v={themeName.toUpperCase()} />
      <Row k="FORM" v={template.toUpperCase()} />
      <Row k="POINTS" v={count.toLocaleString()} />
      <Row k="GESTURE" v="STANDBY" />
      <Row k="VOICE" v="WAKE: ‘JARVIS’" />
      <Row k="UPLINK" v="● STABLE" tone="accent" />
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "accent" }) {
  return (
    <div className="flex justify-between border-b border-primary/10 py-1">
      <span className="text-muted-foreground">{k}</span>
      <span className={tone === "accent" ? "text-accent" : "text-primary"}>{v}</span>
    </div>
  );
}
