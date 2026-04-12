import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CheckCircle, XCircle, Inbox, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/hooks/useDemoData";
import { usePolling } from "@/hooks/usePolling";

import MultiSelectFilter from "@/components/ui/multi-select-filter";
import { formatDateBrasilia } from "@/lib/formatters";

const STATUS_OPTIONS = [
  { value: "aguardando_autores", label: "Aguardando Colaboradores" },
  { value: "pendente", label: "Pendente" },
  { value: "em_revisao", label: "Em Revisao" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
];

const AdminProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [authorFilters, setAuthorFilters] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  const demo = useDemoData();

  const fetchAll = useCallback(async () => {
    if (demo.isDemoMode) {
      const p = demo.getProjects()!;
      setProjects(p);
      setStats(demo.getStats()!);
      setCategories(demo.getCategories()!);
      setLevels([{ id: 1, name: "Graduação" }, { id: 2, name: "Mestrado" }, { id: 3, name: "Doutorado" }, { id: 4, name: "Pós-Doutorado" }]);
      setLoading(false);
      return;
    }
    try {
      const [projData, statsData, catsData, lvlsData] = await Promise.allSettled([
        api.listProjects({ limit: 100 }),
        api.getProjectStats(),
        api.listCategories(),
        api.listAcademicLevels(),
      ]);
      const p = projData.status === "fulfilled" && projData.value.projects?.length ? projData.value.projects : [];
      setProjects(p);
      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      } else {
        setStats({ total: p.length, pending: p.filter((x: any) => x.status === "pendente").length, approved: p.filter((x: any) => x.status === "aprovado").length, rejected: p.filter((x: any) => x.status === "rejeitado").length });
      }
      setCategories(catsData.status === "fulfilled" && catsData.value?.length ? catsData.value : []);
      setLevels(lvlsData.status === "fulfilled" && lvlsData.value?.length ? lvlsData.value : []);
    } catch {
      setProjects([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
      setCategories([]);
      setLevels([]);
    }
    setLoading(false);
  }, [demo.isDemoMode]);

  usePolling(fetchAll, 30000);

  const uniqueAuthors = useMemo(() => {
    const seen = new Set<string>();
    return projects.reduce<{ value: string; label: string }[]>((acc, p) => {
      const name = p.owner?.name || p.owner_name || "";
      if (name && !seen.has(name)) {
        seen.add(name);
        acc.push({ value: name, label: name });
      }
      return acc;
    }, []);
  }, [projects]);

  const categoryOptions = useMemo(() => categories.map(c => ({ value: c.name, label: c.name })), [categories]);
  const levelOptions = useMemo(() => levels.map(l => ({ value: l.name, label: l.name })), [levels]);

  const normalize = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "");

  const filtered = projects.filter((p) => {
    const matchSearch = !search || normalize(p.title).includes(normalize(search)) || normalize(p.owner?.name || p.owner_name || "").includes(normalize(search));
    const matchStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
    const matchCategory = categoryFilters.length === 0 || categoryFilters.includes(p.category);
    const matchLevel = levelFilters.length === 0 || levelFilters.includes(p.academic_level);
    const matchAuthor = authorFilters.length === 0 || authorFilters.includes(p.owner?.name || p.owner_name || "");
    return matchSearch && matchStatus && matchCategory && matchLevel && matchAuthor;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilters([]);
    setCategoryFilters([]);
    setLevelFilters([]);
    setAuthorFilters([]);
  };

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));


  return (
    <AppLayout pageName="Gestao de Projetos" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Gestao Administrativa de Projetos</h2>
        <p className="text-sm opacity-90 mb-3">Revisao, aprovacao e controle completo de todos os projetos CEBIO</p>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><CheckCircle className="w-4 h-4" /> Aprovacao/Rejeicao</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><FileText className="w-4 h-4" /> Comentarios de Revisao</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: stats.total, icon: FileText, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Aguardando Revisao", value: stats.pending, icon: FileText, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Aprovados", value: stats.approved, icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Rejeitados", value: stats.rejected, icon: XCircle, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-2xl sm:text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-end mb-4">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Titulo ou autor..." className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
            </div>
          </div>
          <MultiSelectFilter label="Status" options={STATUS_OPTIONS} selected={statusFilters} onChange={setStatusFilters} placeholder="Todos" />
          <MultiSelectFilter label="Categoria" options={categoryOptions} selected={categoryFilters} onChange={setCategoryFilters} placeholder="Todas" />
          <MultiSelectFilter label="Nivel" options={levelOptions} selected={levelFilters} onChange={setLevelFilters} placeholder="Todos" />
          <MultiSelectFilter label="Autor" options={uniqueAuthors} selected={authorFilters} onChange={setAuthorFilters} placeholder="Todos" />
        </div>
        <button onClick={clearFilters} className="px-4 py-2 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar Filtros</button>
      </div>

      {/* Table / Cards */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold mb-1">Projetos Ativos</h3>
          <p className="text-[13px] text-muted-foreground mb-4">{filtered.length} projeto(s) encontrado(s)</p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando dados...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum projeto encontrado</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((p: any) => (
                <div key={p.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-primary truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.owner?.name || p.owner_name || "—"} • {p.category || "—"}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                      {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDateBrasilia(p.created_at)}</span>
                    <button onClick={() => navigate(`/admin/projeto?id=${p.id}`)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground">Ver Projeto</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left w-10"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" /></th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Projeto</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Categoria</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Autor Principal</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Data</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-primary" /></td>
                    <td className="p-3">
                      <div className="font-semibold text-primary">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">ID: #{p.id}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block w-fit ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                          {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                        </span>
                        {p.authors && p.authors.length > 0 && p.authors.some((a: any) => a.approval_status === 'pendente') && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cebio-yellow-bg text-cebio-yellow inline-block w-fit">
                            Aguardando autores
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.owner?.name || p.owner_name || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{formatDateBrasilia(p.created_at)}</td>
                    <td className="p-3">
                      <button onClick={() => navigate(`/admin/projeto?id=${p.id}`)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Ver Projeto</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminProjects;
