import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Eye, CheckCircle, XCircle, AlertTriangle, LogIn, LogOut, Edit, Send } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";
import { formatDateBrasilia, formatDateTimeBrasilia } from "@/lib/formatters";

const PesquisadorHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projetos" | "atividades">("projetos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, auditData] = await Promise.all([
          api.listProjects({ limit: 100 }),
          api.listAuditLogs(200).catch(() => ({ logs: [] })),
        ]);
        setProjects(projectData.projects || []);
        // Filtrar logs do usuário atual
        const myLogs = (auditData.logs || []).filter(
          (l: any) => l.user_id === user?.id
        );
        setAuditLogs(myLogs);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

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

  const getActivityIcon = (action: string) => {
    const a = action?.toUpperCase() || "";
    if (a.includes("LOGIN")) return <LogIn className="w-4 h-4 text-green-600" />;
    if (a.includes("LOGOUT")) return <LogOut className="w-4 h-4 text-muted-foreground" />;
    if (a.includes("APPROV") || a.includes("APROVADO")) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (a.includes("REJECT") || a.includes("REJEITADO")) return <XCircle className="w-4 h-4 text-red-500" />;
    if (a.includes("SUBMIT") || a.includes("CREATE") || a.includes("PENDENTE")) return <Send className="w-4 h-4 text-blue-500" />;
    if (a.includes("UPDATE") || a.includes("EDIT")) return <Edit className="w-4 h-4 text-yellow-500" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const getActivityLabel = (action: string) => {
    const a = action?.toUpperCase() || "";
    if (a.includes("LOGIN")) return "Login no sistema";
    if (a.includes("LOGOUT")) return "Logout do sistema";
    if (a.includes("APPROV")) return "Projeto aprovado";
    if (a.includes("REJECT")) return "Projeto rejeitado";
    if (a.includes("SUBMIT") || a.includes("CREATE_PROJECT")) return "Projeto submetido (pendente)";
    if (a.includes("UPDATE")) return "Projeto atualizado";
    if (a.includes("UPLOAD")) return "Arquivo(s) enviado(s)";
    return action?.replace(/_/g, " ") || "Atividade";
  };

  const getActivityColor = (action: string) => {
    const a = action?.toUpperCase() || "";
    if (a.includes("LOGIN")) return "border-l-green-500";
    if (a.includes("LOGOUT")) return "border-l-muted-foreground";
    if (a.includes("APPROV")) return "border-l-green-600";
    if (a.includes("REJECT")) return "border-l-red-500";
    if (a.includes("SUBMIT") || a.includes("CREATE")) return "border-l-blue-500";
    if (a.includes("UPDATE") || a.includes("EDIT")) return "border-l-yellow-500";
    return "border-l-muted-foreground";
  };

  return (
    <AppLayout pageName="Histórico de Projetos" navItems={PESQUISADOR_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Histórico de Projetos</h2>
        <p className="text-sm opacity-90 mb-3">Acompanhe o status e atividades dos seus projetos</p>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("projetos")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "projetos" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
        >
          Projetos
        </button>
        <button
          onClick={() => setActiveTab("atividades")}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "atividades" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}
        >
          Linha do Tempo
        </button>
      </div>

      {activeTab === "projetos" && (
        <>
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
                  <button onClick={() => navigate("/pesquisador/submissao")} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
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
                        <span>Criado: {formatDateBrasilia(p.created_at)}</span>
                        {p.updated_at && <span>Atualizado: {formatDateBrasilia(p.updated_at)}</span>}
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
        </>
      )}

      {activeTab === "atividades" && (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-5 pb-0">
            <h3 className="text-base font-semibold">Linha do Tempo de Atividades</h3>
            <p className="text-[13px] text-muted-foreground">Horário de Brasília (UTC-3)</p>
          </div>
          <div className="p-5 pt-4">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Carregando...</p>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h4 className="font-semibold mb-1">Nenhuma atividade registrada</h4>
                <p className="text-sm">Suas atividades aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className={`border-l-[3px] ${getActivityColor(log.action)} bg-muted/50 rounded-r-lg p-4`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(log.action)}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{getActivityLabel(log.action)}</p>
                          {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTimeBrasilia(log.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default PesquisadorHistory;
