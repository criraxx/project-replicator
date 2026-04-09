import { Search, AlertTriangle, Shield, Clock } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mockAuditLogs } from "@/data/mockData";
import { ADMIN_NAV } from "@/constants/navigation";
import { severityColors } from "@/constants/ui";

const AdminAudit = () => {
  const [search, setSearch] = useState("");

  const filtered = mockAuditLogs.filter(
    (l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()) || l.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout pageName="Auditoria" navItems={ADMIN_NAV} notificationCount={3}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Logs de Auditoria</h2>
        <p className="text-sm opacity-90">Rastreabilidade completa de todas as ações no sistema</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-cebio-blue-bg flex items-center justify-center"><Shield className="w-5 h-5 text-cebio-blue" /></div>
          <div><div className="text-2xl font-bold">{mockAuditLogs.length}</div><div className="text-sm text-muted-foreground">Total de Logs</div></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-cebio-yellow-bg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-cebio-yellow" /></div>
          <div><div className="text-2xl font-bold">{mockAuditLogs.filter((l) => l.severity === "high" || l.severity === "critical").length}</div><div className="text-sm text-muted-foreground">Alta Severidade</div></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-cebio-green-bg flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
          <div><div className="text-2xl font-bold">Hoje</div><div className="text-sm text-muted-foreground">Último Registro</div></div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar nos logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-semibold text-muted-foreground">Ação</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Usuário</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Detalhes</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Severidade</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">IP</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{log.action.replace(/_/g, " ")}</td>
                <td className="p-3 text-muted-foreground">{log.user_name}</td>
                <td className="p-3 text-muted-foreground text-xs max-w-[300px] truncate">{log.details}</td>
                <td className="p-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${severityColors[log.severity]}`}>{log.severity}</span>
                </td>
                <td className="p-3 text-muted-foreground text-xs font-mono">{log.ip_address}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

export default AdminAudit;
