import { motion } from "framer-motion";

interface CameraStatusPanelProps {
  active: boolean;
  ready: boolean;
  error: string | null;
  gestureLabel: string;
  distanceLabel: string;
  handCount: number;
  stream: MediaStream | null;
  onRetry: () => void;
}

export function CameraStatusPanel({
  active,
  ready,
  error,
  gestureLabel,
  distanceLabel,
  handCount,
  stream,
  onRetry,
}: CameraStatusPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="absolute left-3 top-14 z-30 w-80"
    >
      <div className="hud-panel p-4">
        <div className="mb-3 flex items-center justify-between text-[10px] tracking-[0.35em] text-accent">
          <span>◢ CAMERA LINK</span>
          <span className={ready ? "text-primary" : "text-muted-foreground"}>{ready ? "● LIVE" : active ? "○ ARMING" : "○ OFF"}</span>
        </div>

        <div className="flex gap-3 border border-primary/15 bg-background/25 p-3">
          <MiniCamera stream={stream} ready={ready} />
          <div className="grid flex-1 gap-2 text-[11px]">
            <StatusRow label="Gesture" value={gestureLabel} tone={ready ? "primary" : "muted"} />
            <StatusRow label="Distance" value={distanceLabel} tone="accent" />
            <StatusRow label="Hands" value={String(handCount)} tone={handCount > 0 ? "primary" : "muted"} />
          </div>
        </div>

        {error && (
          <div className="mt-3 border border-destructive/30 bg-destructive/10 p-3 text-[10px] tracking-[0.2em] text-destructive">
            <div>CAMERA ACCESS REQUIRED</div>
            <div className="mt-1 normal-case tracking-normal text-muted-foreground">{error}</div>
            <button
              onClick={onRetry}
              className="mt-3 border border-primary/40 px-3 py-1 tracking-[0.3em] text-primary transition hover:border-primary hover:bg-primary/10"
            >
              RETRY LINK
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MiniCamera({ stream, ready }: { stream: MediaStream | null; ready: boolean }) {
  return (
    <div className="relative aspect-[4/3] w-24 overflow-hidden border border-primary/25 bg-black">
      <video
        autoPlay
        muted
        playsInline
        ref={(node) => {
          if (node && node.srcObject !== stream) {
            node.srcObject = stream;
          }
        }}
        className="h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen scanline" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.3em] text-muted-foreground">
          STBY
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, value, tone = "primary" }: { label: string; value: string; tone?: "primary" | "accent" | "muted" }) {
  const toneClass = tone === "accent" ? "text-accent" : tone === "muted" ? "text-muted-foreground" : "text-primary";
  return (
    <div>
      <div className="text-[9px] tracking-[0.25em] text-muted-foreground">{label.toUpperCase()}</div>
      <div className={`font-display text-[12px] tracking-[0.12em] ${toneClass}`}>{value}</div>
    </div>
  );
}