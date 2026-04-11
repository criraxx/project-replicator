import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { roleBadge } from "@/constants/ui";
import logoIf from "@/assets/logo-if.png";
import logoCebio from "@/assets/logo-cebio.png";
import api from "@/services/api";

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  aprovado: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
};

const TopHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const badge = user ? roleBadge[user.role] : null;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: number; title: string; status: string; category: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchProjects(query.trim());
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    setShowDropdown(false);
    setQuery("");
    setMobileSearchOpen(false);
    const basePath = user?.role === "admin" ? "/admin" : user?.role === "pesquisador" ? "/pesquisador" : "/bolsista";
    navigate(`${basePath}/projeto?id=${id}`);
  };

  const searchInput = (
    <div className="flex items-center bg-primary-foreground/15 rounded-full px-3 py-1.5 gap-2">
      <Search className="w-4 h-4 text-primary-foreground/70 shrink-0" />
      <input
        type="text"
        placeholder="Buscar projetos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        className="bg-transparent border-none text-primary-foreground text-[13px] w-full outline-none placeholder:text-primary-foreground/60 min-w-0"
        autoFocus={mobileSearchOpen}
      />
      {mobileSearchOpen && (
        <button onClick={() => { setMobileSearchOpen(false); setQuery(""); setShowDropdown(false); }}>
          <X className="w-4 h-4 text-primary-foreground/70" />
        </button>
      )}
    </div>
  );

  const searchDropdown = showDropdown && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[320px] overflow-y-auto">
      {loading && (
        <div className="p-3 text-sm text-muted-foreground text-center">Buscando...</div>
      )}
      {!loading && results.length === 0 && (
        <div className="p-3 text-sm text-muted-foreground text-center">Nenhum projeto encontrado</div>
      )}
      {!loading && results.map((r) => (
        <button
          key={r.id}
          onClick={() => handleSelect(r.id)}
          className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.category || "Sem categoria"}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColors[r.status] || "bg-muted text-muted-foreground"}`}>
            {r.status}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <header className="bg-primary text-primary-foreground h-12 px-3 sm:px-6 flex items-center justify-between gap-2 relative">
      {/* Mobile: full-width search overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 bg-primary z-20 px-3 flex items-center md:hidden" ref={wrapperRef}>
          <div className="flex-1 relative">
            {searchInput}
            {searchDropdown}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <img src={logoCebio} alt="CEBIO" className="h-6 sm:h-8 w-auto brightness-0 invert" />
        <span className="text-primary-foreground/60 font-light text-lg sm:text-xl hidden sm:inline">×</span>
        <img src={logoIf} alt="IF Goiano" className="h-6 sm:h-8 w-auto brightness-0 invert hidden sm:block" />
      </div>

      {/* Mobile: search icon button */}
      <button onClick={() => setMobileSearchOpen(true)} className="md:hidden text-primary-foreground/80 hover:text-primary-foreground p-1">
        <Search className="w-5 h-5" />
      </button>

      {/* Desktop: inline search */}
      <div className="hidden md:block flex-1 max-w-[320px] mx-6 relative" ref={!mobileSearchOpen ? wrapperRef : undefined}>
        {searchInput}
        {searchDropdown}
      </div>

      {/* Desktop user info */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className="text-[13px] font-medium">{user?.name}</span>
        {badge && (
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
