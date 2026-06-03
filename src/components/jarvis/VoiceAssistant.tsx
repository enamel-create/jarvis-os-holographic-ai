import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseCommand, pickJarvisVoice, type JarvisAction } from "@/lib/jarvis-commands";

// Minimal SpeechRecognition typing (not in lib.dom by default)
type SRResult = { transcript: string };
type SRAlt = { 0: SRResult; isFinal: boolean };
type SREvent = { results: ArrayLike<SRAlt> & { [k: number]: SRAlt } };
interface SRInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SRCtor = new () => SRInstance;

export function VoiceAssistant({ onAction }: { onAction: (a: JarvisAction) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SRInstance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      voiceRef.current = pickJarvisVoice();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 0.95;
    u.pitch = 0.85;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }, []);

  const handleTranscript = useCallback(
    (transcript: string) => {
      const action = parseCommand(transcript);
      if (action.type === "ignore") return;
      setHeard(transcript);
      setReply(action.reply);
      speak(action.reply);
      onAction(action);
    },
    [onAction, speak],
  );

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        if (last?.isFinal) handleTranscript(last[0].transcript);
      };
      rec.onerror = () => {};
      rec.onend = () => {
        setListening(false);
        if (enabledRef.current) {
          // auto-restart
          try {
            rec.start();
            setListening(true);
          } catch {
            /* ignore */
          }
        }
      };
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [handleTranscript]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      if (next) {
        // greeting on enable
        setReply("Voice interface online. How can I help, sir?");
        speak("Voice interface online. How can I help, sir?");
        setTimeout(() => start(), 200);
      } else {
        stop();
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      }
      return next;
    });
  }, [speak, start, stop]);

  // Expose toggle via global keyboard shortcut (V)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "v" || e.key === "V") && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <AnimatePresence>
          {(heard || reply) && enabled && (
            <motion.div
              key={heard + reply}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="hud-panel max-w-md px-4 py-2 text-center text-[11px] tracking-widest"
            >
              {heard && (
                <div className="text-muted-foreground">
                  <span className="text-accent">YOU:</span> {heard}
                </div>
              )}
              {reply && (
                <div className="mt-0.5 text-primary">
                  <span className="text-accent">JARVIS:</span> {reply}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggle}
          className={`group relative flex items-center gap-2 border px-3 py-1.5 text-[10px] tracking-[0.3em] backdrop-blur transition ${
            enabled
              ? "border-primary bg-primary/15 text-primary"
              : "border-primary/30 bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-primary"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {listening && (
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
            )}
            <span
              className={`relative inline-block h-2 w-2 rounded-full ${
                enabled ? "bg-primary" : "bg-muted-foreground/50"
              }`}
            />
          </span>
          {!supported
            ? "VOICE UNSUPPORTED"
            : enabled
            ? listening
              ? "JARVIS LISTENING · SAY ‘JARVIS …’"
              : "JARVIS STANDBY"
            : "ENGAGE VOICE  ·  V"}
        </button>
      </div>
    </div>
  );
}
