import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CheckCircle, XCircle, Trash2, Inbox, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { mockProjects, mockCategories, mockAcademicLevels } from "@/data/mockData";

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_revisao", label: "Em Revisão" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
];

const AdminProjects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projData, statsData, catsData, lvlsData] = await Promise.allSettled([
          api.listProjects({ limit: 100 }),
          api.getProjectStats(),
          api.listCategories(),
          api.listAcademicLevels(),
        ]);
        const p = projData.status === "fulfilled" && projData.value.projects?.length ? projData.value.projects : mockProjects;
        setProjects(p);
        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        } else {
          setStats({ total: p.length, pending: p.filter((x: any) => x.status === "pendente").length, approved: p.filter((x: any) => x.status === "aprovado").length, rejected: p.filter((x: any) => x.status === "rejeitado").length });
        }
        setCategories(catsData.status === "fulfilled" && catsData.value?.length ? catsData.value : mockCategories);
        setLevels(lvlsData.status === "fulfilled" && lvlsData.value?.length ? lvlsData.value : mockAcademicLevels);
      } catch {
        setProjects(mockProjects);
        setStats({ total: mockProjects.length, pending: mockProjects.filter(x => x.status === "pendente").length, approved: mockProjects.filter(x => x.status === "aprovado").length, rejected: mockProjects.filter(x => x.status === "rejeitado").length });
        setCategories(mockCategories);
        setLevels(mockAcademicLevels);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const toggleStatus = (status: string) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.owner?.name || p.owner_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchLevel = !levelFilter || p.academic_level === levelFilter;
    return matchSearch && matchStatus && matchCategory && matchLevel;
  });

  const clearFilters = () => { setSearch(""); setStatusFilters([]); setCategoryFilter(""); setLevelFilter(""); };

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    try {
      await api.deleteProject(id);
      toast({ title: "Sucesso", description: "Projeto excluído!" });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  return (
    <AppLayout pageName="Gestão de Projetos" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gestão Administrativa de Projetos</h2>
        <p className="text-sm opacity-90 mb-3">Revisão, aprovação e controle completo de todos os projetos CEBIO</p>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><CheckCircle className="w-4 h-4" /> Aprovação/Rejeição</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><FileText className="w-4 h-4" /> Comentários de Revisão</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: stats.total, icon: FileText, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Aguardando Revisão", value: stats.pending, icon: FileText, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Aprovados", value: stats.approved, icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Rejeitados", value: stats.rejected, icon: XCircle, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-4 gap-4 items-end mb-4">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Título ou autor..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Categoria</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Nível</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option>
              {levels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <button onClick={clearFilters} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar Filtros</button>
        </div>
        {/* Multi-select status */}
        <div>
          <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Status (selecione um ou mais)</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  statusFilters.includes(opt.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {statusFilters.length > 0 && (
              <button onClick={() => setStatusFilters([])} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">
                ✕ Limpar status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left w-10"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" /></th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Projeto</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Categoria</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Autor Principal</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Data</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Ações</th>
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
                            ⏳ Aguardando autores
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.owner?.name || p.owner_name || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => navigate(`/projeto?id=${p.id}`)} className="px-2.5 py-1 text-xs font-semibold rounded bg-cebio-blue text-primary-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="px-2.5 py-1 text-xs font-semibold rounded bg-destructive text-destructive-foreground">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminProjects;
