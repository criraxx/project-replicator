import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const BolsistaHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.listProjects({ limit: 100 });
        setProjects(data.projects || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filterByPeriod = (dateStr: string) => {
    if (!periodFilter) return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (periodFilter === "hoje") return d.toDateString() === now.toDateString();
    if (periodFilter === "semana") {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (periodFilter === "mes") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (periodFilter === "ano") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchPeriod = filterByPeriod(p.created_at);
    return matchSearch && matchStatus && matchPeriod;
  });

  const pendentes = projects.filter(p => p.status === "pendente").length;
  const aprovados = projects.filter(p => p.status === "aprovado").length;
  const rejeitados = projects.filter(p => p.status === "rejeitado").length;

  const clearFilters = () => { setSearch(""); setStatusFilter(""); setPeriodFilter(""); };

  const statusIcon = (status: string) => {
    if (status === "aprovado") return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === "rejeitado") return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === "em_revisao") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <Clock className="w-4 h-4 text-blue-500" />;
  };

  return (
    <AppLayout pageName="Histórico de Projetos" navItems={BOLSISTA_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Histórico de Projetos</h2>
        <p className="text-sm opacity-90 mb-3">Acompanhe o status de todos os seus projetos submetidos</p>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Clock className="w-4 h-4" /> Seus Projetos</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Eye className="w-4 h-4" /> Status em Tempo Real</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: projects.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Pendentes", value: pendentes, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Aprovados", value: aprovados, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Rejeitados", value: rejeitados, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-2xl sm:text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-lg ${s.iconBg} flex items-center justify-center`}>
              <FileText className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar projetos..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em_revisao">Em Revisão</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Período</label>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mês</option>
              <option value="ano">Este ano</option>
            </select>
          </div>
          <button onClick={clearFilters} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar</button>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold">Seus Projetos</h3>
          <p className="text-[13px] text-muted-foreground">{filtered.length} projeto(s)</p>
        </div>
        <div className="p-5 pt-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h4 className="font-semibold mb-1">Nenhum projeto encontrado</h4>
              <p className="text-sm mb-4">Seus projetos aparecerão aqui após a submissão</p>
              <button onClick={() => navigate("/bolsista/submissao")} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
                + Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p: any) => (
                <div key={p.id} onClick={() => navigate(`/projeto?id=${p.id}`)} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcon(p.status)}
                      <h4 className="text-sm font-semibold text-foreground">{p.title}</h4>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                      {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{p.category || "—"}</span>
                    <span>{p.academic_level || "—"}</span>
                    <span>Criado: {new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                    {p.updated_at && <span>Atualizado: {new Date(p.updated_at).toLocaleDateString("pt-BR")}</span>}
                  </div>
                  {p.status === "rejeitado" && (p.review_comment || p.rejection_reason) && (
                    <div className="mt-2 text-xs text-destructive bg-destructive/10 rounded p-2">
                      <strong>Motivo:</strong> {p.review_comment || p.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BolsistaHistory;
