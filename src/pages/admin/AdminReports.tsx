import { useState, useEffect } from "react";
import { FileText, Users, TrendingUp, BarChart3, Download, Clock, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const AdminReports = () => {
  const [reportType, setReportType] = useState("Projetos");
  const [period, setPeriod] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, p, c] = await Promise.allSettled([api.getProjectStats(), api.listProjects({ limit: 100 }), api.listCategories()]);
        if (s.status === "fulfilled") setStats(s.value);
        if (p.status === "fulfilled") setProjects(p.value.projects || []);
        if (c.status === "fulfilled") setCategories(c.value);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Category distribution
  const catCounts: Record<string, number> = {};
  projects.forEach(p => { catCounts[p.category || "Outros"] = (catCounts[p.category || "Outros"] || 0) + 1; });
  const maxCat = Math.max(...Object.values(catCounts), 1);

  // Status distribution
  const statusCounts: Record<string, number> = {
    pendente: stats.pending,
    em_revisao: 0,
    aprovado: stats.approved,
    rejeitado: stats.rejected,
  };
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  const catColors = ["#43a047", "#1976d2", "#7b1fa2", "#f9a825", "#e53935", "#1565c0"];
  const statusBarColors: Record<string, string> = { pendente: "#9e9e9e", em_revisao: "#1976d2", aprovado: "#f9a825", rejeitado: "#43a047" };

  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Painel Administrativo - CEBIO</h2>
        <p className="text-sm opacity-90 mb-3">Centro de Excelência em Bioinsumos - Gestão Completa</p>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Clock className="w-4 h-4" /> Acesso Total</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><BarChart3 className="w-4 h-4" /> Auditoria Completa</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><TrendingUp className="w-4 h-4" /> Monitoramento em Tempo Real</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Tipo de Relatório</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option>Projetos</option><option>Usuários</option><option>Atividades</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Período</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos os períodos</option><option>Último mês</option><option>Últimos 3 meses</option><option>Último ano</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Categoria</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option>
              <option value="pendente">Pendente</option><option value="em_revisao">Em Revisão</option><option value="aprovado">Aprovado</option><option value="rejeitado">Rejeitado</option>
            </select>
          </div>
          <div />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: stats.total, sub: `+${stats.total} este ano`, subColor: "text-primary", iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Aprovados", value: stats.approved, sub: stats.total > 0 ? `${Math.round(stats.approved / stats.total * 100)}% taxa` : "0% taxa", subColor: "text-primary", iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Em Revisão", value: stats.pending, sub: "Aguardando análise", subColor: "text-cebio-yellow", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Duração Média", value: "0", sub: "dias", subColor: "text-muted-foreground", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{s.value}</div>
              <div className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <FileText className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts - Horizontal Bars */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Projetos por Categoria</h3>
          {Object.keys(catCounts).length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Sem dados</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(catCounts).map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catColors[i % catColors.length] }} />
                  <span className="text-sm text-muted-foreground w-[140px] truncate">{name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxCat) * 100}%`, backgroundColor: catColors[i % catColors.length] }} />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Distribuição por Status</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusBarColors[status] || "#9e9e9e" }} />
                <span className="text-sm text-muted-foreground w-[140px]">{statusLabels[status] || status}</span>
                <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxStatus) * 100}%`, backgroundColor: statusBarColors[status] || "#9e9e9e" }} />
                </div>
                <span className="text-sm font-semibold w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold mb-0.5">Detalhamento de Projetos</h3>
          <p className="text-[13px] text-muted-foreground mb-4">Dados detalhados para análise e exportação</p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando dados...</p></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Sem dados para exibir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Projeto</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Categoria</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Nível</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Duração</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Criado Em</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-semibold text-primary">{p.title}</td>
                    <td className="p-3 text-muted-foreground">{p.category || "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.academic_level || "—"}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                        {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">—</td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
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

export default AdminReports;
