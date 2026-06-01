import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeId = "jarvis" | "ironman" | "matrix" | "cyberpunk" | "tactical" | "quantum";

export const THEMES: { id: ThemeId; name: string; primary: string; accent: string; swatch: [string, string] }[] = [
  { id: "jarvis", name: "JARVIS", primary: "Cyan", accent: "Electric Blue", swatch: ["#22d3ee", "#0ea5e9"] },
  { id: "ironman", name: "Iron Man", primary: "Crimson", accent: "Gold", swatch: ["#ef4444", "#fbbf24"] },
  { id: "matrix", name: "Matrix", primary: "Phosphor", accent: "Lime", swatch: ["#22c55e", "#84cc16"] },
  { id: "cyberpunk", name: "Cyberpunk", primary: "Magenta", accent: "Cyan", swatch: ["#e879f9", "#22d3ee"] },
  { id: "tactical", name: "Tactical", primary: "Amber", accent: "Orange", swatch: ["#f59e0b", "#fb923c"] },
  { id: "quantum", name: "Quantum", primary: "White", accent: "Ice", swatch: ["#ffffff", "#93c5fd"] },
];

const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void; cycleTheme: () => void }>({
  theme: "jarvis",
  setTheme: () => {},
  cycleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("jarvis");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <ThemeCtx.Provider
      value={{
        theme,
        setTheme,
        cycleTheme: () => {
          const ids = THEMES.map((t) => t.id);
          const i = ids.indexOf(theme);
          setTheme(ids[(i + 1) % ids.length]);
        },
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

// Read CSS var as hex-ish color for three.js
export function readCssColor(varName: string, fallback = "#22d3ee"): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}
