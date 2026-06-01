import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "INITIALIZING JARVIS OS",
  "LOADING PARTICLE ENGINE",
  "LOADING SHADER CORE",
  "LOADING AUDIO MATRIX",
  "LOADING GESTURE SYSTEM",
  "LOADING HUD MODULES",
  "SYSTEM READY",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step >= STEPS.length) {
      const t = setTimeout(() => {
        setDone(true);
        setTimeout(onDone, 600);
      }, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 350 : 280);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
        >
          <div className="relative w-[min(680px,90vw)] hud-panel p-8">
            <div className="mb-6 flex items-center justify-between text-[10px] tracking-[0.3em] text-primary/70">
              <span>SYS · v0.9.7</span>
              <span className="anim-pulse-soft">● BOOT</span>
            </div>
            <h1 className="font-display text-4xl tracking-[0.2em] text-primary text-glow">
              JARVIS OS
            </h1>
            <p className="mt-1 text-xs tracking-widest text-muted-foreground">
              GESTURE CONTROLLED PARTICLE INTELLIGENCE
            </p>

            <div className="mt-8 space-y-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center justify-between text-xs ${
                    i < step ? "text-primary" : i === step ? "text-accent" : "text-muted-foreground/40"
                  }`}
                >
                  <span className="tracking-widest">{s}</span>
                  <span>
                    {i < step ? "[ OK ]" : i === step ? "[ ... ]" : "[ -- ]"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 h-1 w-full overflow-hidden bg-secondary">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${Math.min(100, (step / STEPS.length) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
