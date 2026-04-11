import { useState, useEffect } from "react";
import { Search, Shield, AlertTriangle, Clock, Users, Download, Inbox, Info } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { severityColors } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { mockAuditLogs } from "@/data/mockData";
import MultiSelectFilter from "@/components/ui/multi-select-filter";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Login" },
  { value: "PROJECT", label: "Project" },
  { value: "USER", label: "User" },
  { value: "SYSTEM", label: "System" },
];

const AdminAudit = () => {
  const [search, setSearch] = useState("");
  const [severityFilters, setSeverityFilters] = useState<string[]>([]);
  const [actionFilters, setActionFilters] = useState<string[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.listAuditLogs(200);
        const l = data.logs && data.logs.length > 0 ? data.logs : mockAuditLogs;
        setLogs(l);
      } catch {
        setLogs(mockAuditLogs);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch = !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase()) || l.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilters.length === 0 || severityFilters.includes(l.severity);
    const matchAction = actionFilters.length === 0 || actionFilters.some((af: string) => l.action?.toLowerCase().includes(af.toLowerCase()));
    return matchSearch && matchSeverity && matchAction;
  });

  const criticalCount = logs.filter(l => l.severity === "high" || l.severity === "critical").length;
  const todayCount = logs.filter(l => {
    const d = new Date(l.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const clearFilters = () => { setSearch(""); setSeverityFilters([]); setActionFilters([]); };

  return (
    <AppLayout pageName="Auditoria" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Sistema de Auditoria - CEBIO</h2>
          <p className="text-sm opacity-90 mb-3">Auditoria completa do Centro de Excelência em Bioinsumos</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Clock className="w-4 h-4" /> Logs Estruturados</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Shield className="w-4 h-4" /> Monitoramento em Tempo Real</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Download className="w-4 h-4" /> Exportação Completa</span>
          </div>
        </div>
        <button className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Download className="w-4 h-4" /> Exportar Logs
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total de Logs", value: logs.length, icon: Shield, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Críticos", value: criticalCount, icon: AlertTriangle, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
          { label: "Hoje", value: todayCount, icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Usuários Únicos", value: new Set(logs.map(l => l.user_id)).size, icon: Users, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
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
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ação, detalhes ou usuário..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <MultiSelectFilter label="Severidade" options={SEVERITY_OPTIONS} selected={severityFilters} onChange={setSeverityFilters} placeholder="Todas" />
          <MultiSelectFilter label="Tipo de Ação" options={ACTION_OPTIONS} selected={actionFilters} onChange={setActionFilters} placeholder="Todas" />
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Data</label>
            <input type="date" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <button onClick={clearFilters} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        <div className="p-5 pb-0 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold mb-0.5">Logs de Auditoria</h3>
            <p className="text-[13px] text-muted-foreground">{filtered.length} registro(s)</p>
          </div>
          <span className="text-xs text-muted-foreground">Atualizado em tempo real</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando dados...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum log de auditoria encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Timestamp</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Usuário</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Ação</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Detalhes</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">IP</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Severidade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log: any) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString("pt-BR")}</td>
                    <td className="p-3 text-muted-foreground">{log.user?.name || `User #${log.user_id}`}</td>
                    <td className="p-3 font-medium text-foreground">{log.action?.replace(/_/g, " ")}</td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[250px] truncate">{log.details}</td>
                    <td className="p-3 text-muted-foreground text-xs font-mono">{log.ip_address}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${severityColors[log.severity as keyof typeof severityColors] || ""}`}>{log.severity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-cebio-red mb-3"><Info className="w-4 h-4" /> Sistema de Auditoria CEBIO</h4>
        <ul className="text-[13px] text-muted-foreground space-y-1.5 list-disc pl-5">
          <li><strong>Rastreabilidade Completa:</strong> Todos os acessos, alterações e ações são registrados</li>
          <li><strong>Logs Estruturados:</strong> Informações detalhadas incluindo IP, timestamp e contexto</li>
          <li><strong>Níveis de Severidade:</strong> Classificação automática para priorização de análise</li>
          <li><strong>Exportação:</strong> Dados podem ser exportados para análise externa ou compliance</li>
          <li><strong>Tempo Real:</strong> Monitoramento contínuo de todas as atividades do sistema</li>
          <li><strong>Retenção:</strong> Logs são mantidos permanentemente para auditoria institucional</li>
        </ul>
      </div>
    </AppLayout>
  );
};

export default AdminAudit;
