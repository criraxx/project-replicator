import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Clock, CheckCircle, AlertCircle, Plus, Calendar, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const PesquisadorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const approved = projects.filter(p => p.status === "aprovado").length;
  const pending = projects.filter(p => p.status === "pendente" || p.status === "em_revisao").length;
  const rejected = projects.filter(p => p.status === "rejeitado").length;
  const approvalRate = projects.length > 0 ? Math.round((approved / projects.length) * 100) : 0;

  return (
    <AppLayout pageName="Meu Dashboard" navItems={PESQUISADOR_NAV} notificationCount={1}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold mb-1">Bem-vindo, {user?.name}</h2>
          <p className="text-sm opacity-90 mb-1">Pesquisador • CEBIO Brasil - Centro de Excelência em Bioinsumos</p>
          <p className="text-[13px] opacity-85 mb-3">Gerencie seus projetos acadêmicos e acompanhe o progresso das submissões</p>
          <button onClick={() => navigate("/pesquisador/submissao")} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Nova Submissão
          </button>
        </div>
        <div className="text-right flex flex-col items-center opacity-80">
          <FolderOpen className="w-12 h-12 mb-1" />
          <span className="text-xs">Sistema CEBIO</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: projects.length, sub: `${projects.length} projetos no total`, subColor: "text-primary", icon: FolderOpen, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Em Revisão", value: pending, sub: "Aguardando aprovação", subColor: "text-cebio-yellow", icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Aprovados", value: approved, sub: `Taxa: ${approvalRate}%`, subColor: "text-primary", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Rejeitados", value: rejected, sub: rejected === 0 ? "Nenhum rejeitado" : `${rejected} rejeitado(s)`, subColor: "text-cebio-red", icon: AlertCircle, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{s.value}</div>
              <div className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-lg ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Projects (2/3) + Sidebar (1/3) */}
      <div className="grid grid-cols-3 gap-6">
        {/* Projects - 2 cols */}
        <div className="col-span-2">
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="flex justify-between items-center p-5 pb-0">
              <h3 className="text-base font-semibold">Meus Projetos</h3>
              <button onClick={() => navigate("/pesquisador/projetos")} className="text-xs text-primary font-medium">Ver todos</button>
            </div>
            <div className="p-5 pt-4">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
              ) : projects.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <h4 className="font-semibold mb-1">Nenhum projeto encontrado</h4>
                  <p className="text-sm mb-4">Comece criando seu primeiro projeto acadêmico</p>
                  <button onClick={() => navigate("/pesquisador/submissao")} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold">
                    + Criar Primeiro Projeto
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((p: any) => (
                    <div key={p.id} onClick={() => navigate(`/projeto?id=${p.id}`)} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                          {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground line-clamp-3 mb-2">{p.summary || p.description || "Sem resumo disponível"}</p>
                      <div className="text-xs text-muted-foreground">
                        {p.category || "—"} • {p.owner?.name || user?.name} • {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - 1 col */}
        <div className="space-y-4">
          {/* Notificações */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h4 className="text-sm font-semibold mb-3">Notificações</h4>
            <p className="text-[13px] text-muted-foreground">Nenhuma notificação nova</p>
          </div>

          {/* Estatísticas Pessoais */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h4 className="text-sm font-semibold mb-3">Estatísticas Pessoais</h4>
            <div className="space-y-3">
              {[
                { label: "Total de Versões", value: "3" },
                { label: "Projetos Este Ano", value: String(projects.length) },
                { label: "Taxa de Aprovação", value: `${approvalRate}%` },
                { label: "Tempo Médio de Revisão", value: "14 dias" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <h4 className="text-sm font-semibold mb-3">Ações Rápidas</h4>
            <div className="space-y-2">
              <button onClick={() => navigate("/pesquisador/submissao")} className="w-full flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4 text-primary" /> Nova Submissão
              </button>
              <button onClick={() => navigate("/pesquisador/historico")} className="w-full flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" /> Ver Histórico
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PesquisadorDashboard;
