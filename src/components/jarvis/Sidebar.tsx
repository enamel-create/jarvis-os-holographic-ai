import { TEMPLATES, type TemplateId } from "@/lib/particle-templates";

export function TemplateList({
  current,
  onPick,
}: {
  current: TemplateId;
  onPick: (t: TemplateId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick(t.id)}
          className={`border px-2 py-1.5 text-left text-[10px] tracking-widest transition ${
            current === t.id
              ? "border-accent bg-accent/15 text-accent"
              : "border-primary/15 text-muted-foreground hover:border-primary/60 hover:text-primary"
          }`}
        >
          ▸ {t.name.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
