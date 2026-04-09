import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, FileText, Calendar, Inbox, Download } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import api from "@/services/api";

const BolsistaHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.listAuditLogs(100);
        setActivities(data.logs || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <AppLayout pageName="Histórico de Atividades" navItems={BOLSISTA_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Histórico de Atividades</h2>
        <p className="text-sm opacity-90 mb-3">Acompanhe todas as suas atividades e interações no sistema CEBIO</p>
        <div className="flex gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Clock className="w-4 h-4" /> Registro Completo</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><CheckCircle className="w-4 h-4" /> Atualizações em Tempo Real</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Download className="w-4 h-4" /> Exportação de Dados</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Atividades", value: activities.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Submissões", value: activities.filter(a => a.action?.includes("PROJECT")).length, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Revisões", value: activities.filter(a => a.action?.includes("REVIEW") || a.action?.includes("APPROVE")).length, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Este Mês", value: activities.filter(a => { const d = new Date(a.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <FileText className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar atividades..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Tipo</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option><option value="Submissão">Submissão</option><option value="Revisão">Revisão</option><option value="Aprovação">Aprovação</option><option value="Rejeição">Rejeição</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Período</label>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option><option>Hoje</option><option>Esta semana</option><option>Este mês</option><option>Este ano</option>
            </select>
          </div>
          <button onClick={() => { setSearch(""); setTypeFilter(""); setPeriodFilter(""); }} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar</button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0"><h3 className="text-base font-semibold">Timeline de Atividades</h3></div>
        <div className="p-5 pt-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h4 className="font-semibold mb-1">Nenhuma atividade registrada</h4>
              <p className="text-sm mb-4">Suas atividades aparecerão aqui conforme você interagir com o sistema</p>
              <button onClick={() => navigate("/bolsista/submissao")} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                + Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-cebio-green-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{a.action?.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.details}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString("pt-BR")}</div>
                  </div>
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
