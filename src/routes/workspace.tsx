import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { type ColorMode } from "@/components/jarvis/ParticleField";
import { GestureDrivenRig } from "@/components/jarvis/GestureDrivenRig";
import { HudOverlay } from "@/components/jarvis/HudOverlay";
import { BootSequence } from "@/components/jarvis/BootSequence";
import { Diagnostics } from "@/components/jarvis/Diagnostics";
import { ParticleLab } from "@/components/jarvis/ParticleLab";
import { ThemePicker } from "@/components/jarvis/ThemePicker";
import { TemplateList } from "@/components/jarvis/Sidebar";
import { WebGLFallback } from "@/components/jarvis/WebGLFallback";
import { WebcamPanel } from "@/components/jarvis/WebcamPanel";
import { CameraStatusPanel } from "@/components/jarvis/CameraStatusPanel";
import { VoiceAssistant } from "@/components/jarvis/VoiceAssistant";
import { useTheme, THEMES } from "@/lib/theme";
import { TEMPLATES, type TemplateId } from "@/lib/particle-templates";
import type { JarvisAction } from "@/lib/jarvis-commands";
import { useGestureControl } from "@/hooks/use-gesture-control";

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
  const { theme, setTheme } = useTheme();
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
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [gestureControlEnabled, setGestureControlEnabled] = useState(true);
  const [diagOpen, setDiagOpen] = useState(false);
  const gestureState = useGestureControl(gestureControlEnabled);

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

  // Keyboard: H toggles HUD, [ ] cycles templates, C webcam / gesture control
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "h" || e.key === "H") setHudVisible((v) => !v);
      if (e.key === "c" || e.key === "C") {
        setGestureControlEnabled((v) => !v);
        setWebcamOpen((v) => !v);
      }
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

  const handleVoiceAction = useCallback(
    (a: JarvisAction) => {
      switch (a.type) {
        case "setTheme":
          if (a.themeId) setTheme(a.themeId);
          break;
        case "setTemplate":
          if (a.templateId) setTemplate(a.templateId);
          break;
        case "nextTemplate": {
          const i = TEMPLATES.findIndex((t) => t.id === template);
          setTemplate(TEMPLATES[(i + 1) % TEMPLATES.length].id);
          break;
        }
        case "prevTemplate": {
          const i = TEMPLATES.findIndex((t) => t.id === template);
          setTemplate(TEMPLATES[(i - 1 + TEMPLATES.length) % TEMPLATES.length].id);
          break;
        }
        case "setDensity":
          if (a.density)
            setLab((l) => ({ ...l, count: Math.max(1000, Math.min(30000, a.density!)) }));
          break;
        case "adjustDensity":
          if (a.delta)
            setLab((l) => ({ ...l, count: Math.max(1000, Math.min(30000, l.count + a.delta!)) }));
          break;
        case "toggleHud":
          setHudVisible((v) => !v);
          break;
        case "toggleDiagnostics":
          setDiagOpen((v) => !v);
          break;
        case "toggleWebcam":
          setGestureControlEnabled((v) => !v);
          setWebcamOpen((v) => !v);
          break;
        default:
          break;
      }
    },
    [setTheme, template],
  );

  const themeName = THEMES.find((t) => t.id === theme)?.name ?? "JARVIS";
  const statusGesture = gestureControlEnabled ? gestureState.gestureLabel : "SYSTEM STANDBY";
  const rigPose = useMemo(
    () => ({
      targetPosition: gestureControlEnabled ? gestureState.targetPosition : ([0, 0, 0] as [number, number, number]),
      targetQuaternion: gestureControlEnabled ? gestureState.targetQuaternion : ([0, 0, 0, 1] as [number, number, number, number]),
      scale: gestureControlEnabled ? gestureState.scale : 1,
      spreadMultiplier: gestureControlEnabled ? gestureState.spreadMultiplier : 1,
      turbulenceBoost: gestureControlEnabled ? gestureState.turbulenceBoost : 0,
    }),
    [gestureControlEnabled, gestureState],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {!booted && <BootSequence onDone={() => setBooted(true)} />}

      {/* Canvas */}
      <div className="absolute inset-0">
        <ClientOnly fallback={<div className="h-full w-full bg-background" />}>
          <WebGLFallback>
            <Canvas dpr={1} camera={{ position: [0, 0, 6.5], fov: 50 }}>
              <GestureDrivenRig
                template={template}
                count={lab.count}
                spread={lab.spread}
                turbulence={lab.turbulence}
                rotationSpeed={lab.rotationSpeed}
                colorMode={lab.colorMode}
                glow={lab.glow}
                {...rigPose}
              />
            </Canvas>
          </WebGLFallback>
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
          <button
            onClick={() => {
              setGestureControlEnabled((v) => !v);
              setWebcamOpen((v) => !v);
            }}
            className={gestureControlEnabled ? "text-primary" : "hover:text-primary"}
          >
            ◎ CAM
          </button>
          <button onClick={() => setRightOpen((v) => !v)} className="hover:text-primary">RIGHT ◨</button>
        </div>
      </div>

      <AnimatePresence>
        {leftOpen && (
          <CameraStatusPanel
            active={gestureControlEnabled}
            ready={gestureState.ready}
            error={gestureState.error}
            gestureLabel={statusGesture}
            distanceLabel={gestureState.distanceLabel}
            handCount={gestureState.handCount}
            stream={gestureState.stream}
            onRetry={() => setGestureControlEnabled((v) => !v)}
          />
        )}
      </AnimatePresence>

      {/* Webcam panel */}
      <AnimatePresence>
        {webcamOpen && <WebcamPanel onClose={() => setWebcamOpen(false)} externalStream={gestureState.stream} />}
      </AnimatePresence>

      {/* Left sidebar */}
      <AnimatePresence>
        {leftOpen && (
          <motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="absolute left-3 top-56 bottom-3 z-30 w-64 overflow-y-auto"
          >
            <div className="hud-panel p-4">
              <div className="mb-2 text-[10px] tracking-[0.4em] text-accent">◢ PARTICLE TEMPLATES</div>
              <TemplateList current={template} onPick={setTemplate} />
              <div className="mt-5 mb-2 text-[10px] tracking-[0.4em] text-accent">◢ THEME CORES</div>
              <ThemePicker />
              <div className="mt-5 mb-2 text-[10px] tracking-[0.4em] text-accent">◢ SHORTCUTS</div>
              <ul className="space-y-1 text-[10px] tracking-widest text-muted-foreground">
                <li><span className="text-primary">H</span> · Toggle HUD</li>
                <li><span className="text-primary">C</span> · Toggle camera</li>
                <li><span className="text-primary">V</span> · Toggle voice</li>
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
              <StatusBlock template={template} themeName={themeName} count={lab.count} gesture={statusGesture} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Diagnostics template={template} theme={theme} particleCount={lab.count} forceOpen={diagOpen} />

      <ClientOnly fallback={null}>
        <VoiceAssistant onAction={handleVoiceAction} />
      </ClientOnly>
    </div>
  );
}

function StatusBlock({ template, themeName, count, gesture }: { template: string; themeName: string; count: number; gesture: string }) {
  return (
    <div className="space-y-1 text-[10px] tracking-widest">
      <Row k="CORE" v={themeName.toUpperCase()} />
      <Row k="FORM" v={template.toUpperCase()} />
      <Row k="POINTS" v={count.toLocaleString()} />
      <Row k="GESTURE" v={gesture} />
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
