import { THEMES, useTheme } from "@/lib/theme";

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`group flex items-center gap-2 border px-2 py-1.5 text-left text-[10px] tracking-widest transition ${
            theme === t.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-primary/15 text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          <span className="flex gap-0.5">
            <span className="h-3 w-1.5" style={{ background: t.swatch[0] }} />
            <span className="h-3 w-1.5" style={{ background: t.swatch[1] }} />
          </span>
          {t.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
