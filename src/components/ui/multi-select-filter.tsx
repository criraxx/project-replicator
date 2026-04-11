import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");

const MultiSelectFilter = ({ options, selected, onChange, placeholder = "Buscar...", label, className }: MultiSelectFilterProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o => {
    if (!search) return true;
    return normalize(o.label).includes(normalize(search));
  });

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };

  const selectedLabels = selected.map(v => options.find(o => o.value === v)?.label || v);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {label && <label className="block text-[13px] font-semibold text-muted-foreground mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-border rounded-lg text-sm bg-card text-left min-h-[42px]"
      >
        <span className="flex-1 truncate">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : selected.length <= 2 ? (
            selectedLabels.join(", ")
          ) : (
            `${selected.length} selecionados`
          )}
        </span>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {selected.length > 0 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Digitar para filtrar..."
              className="w-full px-2.5 py-1.5 text-sm bg-muted/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">Nenhum resultado</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors",
                    selected.includes(opt.value) && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    selected.includes(opt.value) ? "bg-primary border-primary" : "border-border"
                  )}>
                    {selected.includes(opt.value) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilter;
