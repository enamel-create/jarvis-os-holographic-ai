import type { ThemeId } from "@/lib/theme";
import type { TemplateId } from "@/lib/particle-templates";
import { THEMES } from "@/lib/theme";
import { TEMPLATES } from "@/lib/particle-templates";

export interface JarvisAction {
  type:
    | "setTheme"
    | "setTemplate"
    | "nextTemplate"
    | "prevTemplate"
    | "setDensity"
    | "adjustDensity"
    | "toggleHud"
    | "toggleDiagnostics"
    | "toggleWebcam"
    | "greet"
    | "status"
    | "unknown"
    | "ignore";
  themeId?: ThemeId;
  templateId?: TemplateId;
  density?: number;
  delta?: number;
  reply: string;
}

const THEME_ALIASES: Record<string, ThemeId> = {
  jarvis: "jarvis",
  "iron man": "ironman",
  ironman: "ironman",
  stark: "ironman",
  matrix: "matrix",
  cyberpunk: "cyberpunk",
  cyber: "cyberpunk",
  punk: "cyberpunk",
  tactical: "tactical",
  military: "tactical",
  quantum: "quantum",
  ghost: "quantum",
};

function findTemplate(text: string): TemplateId | undefined {
  for (const t of TEMPLATES) {
    if (text.includes(t.id) || text.includes(t.name.toLowerCase())) return t.id as TemplateId;
  }
  return undefined;
}

function findTheme(text: string): ThemeId | undefined {
  for (const [alias, id] of Object.entries(THEME_ALIASES)) {
    if (text.includes(alias)) return id;
  }
  return undefined;
}

export function parseCommand(rawInput: string): JarvisAction {
  const text = rawInput.toLowerCase().trim();
  if (!text) return { type: "ignore", reply: "" };

  // Must contain wake word
  if (!/\bjarvis\b/.test(text)) return { type: "ignore", reply: "" };

  // Strip wake word
  const cmd = text.replace(/\bjarvis\b[,.!?]?/g, "").trim();

  // Bare wake / greeting
  if (!cmd || /^(hi|hello|hey|you there|are you there|wake up)$/i.test(cmd)) {
    return { type: "greet", reply: "At your service, sir." };
  }

  // Theme switch
  if (/(switch|change|activate|engage|set|go).*(mode|theme|core)|to .* mode/.test(cmd)) {
    const themeId = findTheme(cmd);
    if (themeId) {
      const name = THEMES.find((t) => t.id === themeId)?.name ?? themeId;
      return { type: "setTheme", themeId, reply: `Switching to ${name} mode.` };
    }
  }

  // Direct theme mention with "mode"
  if (/\bmode\b/.test(cmd)) {
    const themeId = findTheme(cmd);
    if (themeId) {
      const name = THEMES.find((t) => t.id === themeId)?.name ?? themeId;
      return { type: "setTheme", themeId, reply: `Switching to ${name} mode.` };
    }
  }

  // Template navigation
  if (/next (template|form|pattern|shape)/.test(cmd)) {
    return { type: "nextTemplate", reply: "Next pattern." };
  }
  if (/(previous|prev|last) (template|form|pattern|shape)/.test(cmd)) {
    return { type: "prevTemplate", reply: "Previous pattern." };
  }
  if (/(show|display|render|load|switch to)/.test(cmd)) {
    const templateId = findTemplate(cmd);
    if (templateId) {
      const name = TEMPLATES.find((t) => t.id === templateId)?.name ?? templateId;
      return { type: "setTemplate", templateId, reply: `Rendering ${name}.` };
    }
  }
  const tplDirect = findTemplate(cmd);
  if (tplDirect && /(template|form|pattern|shape)/.test(cmd)) {
    const name = TEMPLATES.find((t) => t.id === tplDirect)?.name ?? tplDirect;
    return { type: "setTemplate", templateId: tplDirect, reply: `Rendering ${name}.` };
  }

  // Density
  if (/(more|increase|raise|boost|up).*(density|particles)/.test(cmd)) {
    return { type: "adjustDensity", delta: 4000, reply: "Increasing particle density." };
  }
  if (/(less|decrease|lower|reduce|down).*(density|particles)/.test(cmd)) {
    return { type: "adjustDensity", delta: -4000, reply: "Reducing particle density." };
  }
  const densMatch = cmd.match(/(?:density|particles).*?(\d{1,3})\s*(k|thousand)?/);
  if (densMatch) {
    const n = parseInt(densMatch[1], 10) * (densMatch[2] ? 1000 : 1);
    return { type: "setDensity", density: n, reply: `Setting density to ${n.toLocaleString()}.` };
  }

  // HUD
  if (/(toggle|show|hide).*(hud|overlay|interface)/.test(cmd) || /^(hud|overlay)$/.test(cmd)) {
    return { type: "toggleHud", reply: "Toggling HUD." };
  }

  // Diagnostics
  if (/(diagnostic|telemetry|stats|performance)/.test(cmd)) {
    return { type: "toggleDiagnostics", reply: "Opening diagnostics." };
  }

  // Webcam
  if (/(camera|webcam|operator feed|my face|see me)/.test(cmd)) {
    return { type: "toggleWebcam", reply: "Toggling operator feed." };
  }

  // Status
  if (/(status|report|how are you|what.s up|sit rep|sitrep)/.test(cmd)) {
    return { type: "status", reply: "All systems nominal, sir." };
  }

  // Pleasantries
  if (/(thank you|thanks|good job|well done)/.test(cmd)) {
    return { type: "greet", reply: "Always a pleasure, sir." };
  }
  if (/(who are you|your name)/.test(cmd)) {
    return { type: "greet", reply: "I am JARVIS. Just A Rather Very Intelligent System." };
  }

  return { type: "unknown", reply: "I'm afraid I didn't catch that, sir." };
}

export function pickJarvisVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer British male voices
  const prefs = [
    (v: SpeechSynthesisVoice) => /en-GB/i.test(v.lang) && /male|daniel|oliver|george|arthur/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-GB/i.test(v.lang),
    (v: SpeechSynthesisVoice) => /daniel|google uk english male/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-/i.test(v.lang) && /male/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-/i.test(v.lang),
  ];
  for (const p of prefs) {
    const found = voices.find(p);
    if (found) return found;
  }
  return voices[0] ?? null;
}
