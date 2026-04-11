import { useState, useRef, useEffect } from "react";

interface InstitutionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  institutions: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const InstitutionAutocomplete = ({
  value,
  onChange,
  institutions,
  placeholder = "Digite para buscar ou cadastrar...",
  required = false,
  className = "",
}: InstitutionAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length > 0
    ? institutions.filter((inst) =>
        inst.toLowerCase().includes(value.toLowerCase())
      )
    : institutions;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        required={required}
        className={className || "w-full px-3 py-2 border border-border rounded-lg text-sm bg-card"}
      />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
          {filtered.map((inst, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(inst); setShowSuggestions(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0"
            >
              {inst}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionAutocomplete;
