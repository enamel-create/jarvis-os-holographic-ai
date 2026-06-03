import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function WebcamPanel({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera API unavailable");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera denied");
      }
    }
    start();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute right-80 top-14 z-30 w-56"
    >
      <div className="hud-panel relative overflow-hidden p-2">
        <div className="mb-1.5 flex items-center justify-between text-[9px] tracking-[0.3em] text-accent">
          <span>◢ OPERATOR FEED</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-primary">✕</button>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-primary/40 bg-black">
          {/* Corner brackets */}
          <span className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-primary" />
          <span className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-primary" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary" />

          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)", filter: "contrast(1.05) saturate(1.1)" }}
          />

          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, color-mix(in oklab, var(--color-primary) 20%, transparent) 100%)",
            }}
          />

          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.3em] text-muted-foreground">
              CONNECTING…
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-[9px] tracking-[0.3em] text-destructive">
              <span>CAMERA OFFLINE</span>
              <span className="text-muted-foreground normal-case tracking-normal">{error}</span>
            </div>
          )}
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] tracking-[0.3em] text-muted-foreground">
          <span>BIO·LINK</span>
          <span className={ready ? "text-accent" : "text-destructive"}>{ready ? "● LIVE" : "○ STBY"}</span>
        </div>
      </div>
    </motion.div>
  );
}
