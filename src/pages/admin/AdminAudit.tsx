import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Shield, AlertTriangle, Clock, Users, Download, Inbox, Info, User, Eye, FileSpreadsheet } from "lucide-react";
import { formatDateTimeBrasilia } from "@/lib/formatters";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { severityColors } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/hooks/useDemoData";
import { useAuth } from "@/contexts/AuthContext";
import MultiSelectFilter from "@/components/ui/multi-select-filter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "CREATE_PROJECT", label: "Criar Projeto" },
  { value: "UPDATE_PROJECT", label: "Editar Projeto" },
  { value: "APPROVE", label: "Aprovação" },
  { value: "REJECT", label: "Rejeição" },
  { value: "RETURN", label: "Devolução" },
  { value: "VIEW_PROJECT", label: "Visualizar Projeto" },
  { value: "DELETE", label: "Exclusão" },
  { value: "USER", label: "Usuário" },
  { value: "PASSWORD", label: "Senha" },
  { value: "CATEGORY", label: "Categoria" },
  { value: "UPLOAD", label: "Upload" },
  { value: "COAUTHOR", label: "Coautoria" },
  { value: "NOTIFICATION", label: "Notificação" },
  { value: "PROFILE", label: "Perfil" },
];

type ViewMode = "geral" | "usuario" | "meus";

const AdminAudit = () => {
  const [search, setSearch] = useState("");
  const [severityFilters, setSeverityFilters] = useState<string[]>([]);
  const [actionFilters, setActionFilters] = useState<string[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("geral");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: number; name: string; email?: string; cpf?: string }[]>([]);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const demo = useDemoData();
  const { user: currentUser } = useAuth();
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (demo.isDemoMode) {
      setLogs(demo.getAuditLogs()!.map(l => ({ ...l, user: { name: l.user_name } })));
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [logData, userData] = await Promise.allSettled([
          api.listAuditLogs(500),
          api.listUsers(),
        ]);
        setLogs(logData.status === "fulfilled" && logData.value.logs?.length ? logData.value.logs : []);
        if (userData.status === "fulfilled" && userData.value?.length) {
          setAllUsers(userData.value.map((u: any) => ({ id: u.id, name: u.name, email: u.email, cpf: u.cpf })));
        }
      } catch {
        setLogs([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Unique users from logs for the dropdown (with email/cpf for search)
  const logUsers = useMemo(() => {
    const map = new Map<number, { id: number; name: string; email?: string; cpf?: string }>();
    logs.forEach(l => {
      if (l.user_id && !map.has(l.user_id)) {
        const full = allUsers.find(u => u.id === l.user_id);
        map.set(l.user_id, {
          id: l.user_id,
          name: full?.name || l.user?.name || `Usuário #${l.user_id}`,
          email: full?.email,
          cpf: full?.cpf,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [logs, allUsers]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      // View mode filter
      if (viewMode === "meus" && l.user_id !== currentUser?.id) return false;
      if (viewMode === "usuario" && selectedUserId && l.user_id !== Number(selectedUserId)) return false;

      const matchSearch = !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase()) || l.user?.name?.toLowerCase().includes(search.toLowerCase());
      const matchSeverity = severityFilters.length === 0 || severityFilters.includes(l.severity);
      const matchAction = actionFilters.length === 0 || actionFilters.some((af: string) => l.action?.toLowerCase().includes(af.toLowerCase()));
      return matchSearch && matchSeverity && matchAction;
    });
  }, [logs, search, severityFilters, actionFilters, viewMode, selectedUserId, currentUser]);

  const criticalCount = logs.filter(l => l.severity === "high" || l.severity === "critical").length;
  const todayCount = logs.filter(l => {
    const d = new Date(l.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const clearFilters = () => { setSearch(""); setSeverityFilters([]); setActionFilters([]); setSelectedUserId(""); };

  const buildExportPayload = () => {
    const userName = viewMode === "meus"
      ? currentUser?.name
      : viewMode === "usuario"
        ? logUsers.find(u => u.id === Number(selectedUserId))?.name
        : undefined;
    return {
      logs: filtered.map(l => ({
        action: l.action,
        details: l.details,
        user_name: l.user?.name || allUsers.find(u => u.id === l.user_id)?.name || `Usuário #${l.user_id}`,
        ip_address: l.ip_address,
        severity: l.severity,
        created_at: l.created_at,
      })),
      viewMode,
      userName,
    };
  };

  const exportLogs = async (format: "pdf" | "excel") => {
    setExporting(true);
    try {
      const token = localStorage.getItem("cebio_token");
      const apiBase = import.meta.env.VITE_API_URL || "/api";
      const url = format === "pdf" ? "/audit/export/pdf" : "/audit/export/excel";
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const res = await fetch(`${apiBase}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify(buildExportPayload()),
      });
      if (!res.ok) throw new Error("Falha na exportação");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `auditoria_cebio_${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "Exportação concluída", description: `Arquivo ${ext.toUpperCase()} baixado com sucesso.` });
    } catch {
      toast({ title: "Erro", description: "Falha ao exportar logs.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout pageName="Auditoria" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Sistema de Auditoria - CEBIO</h2>
            <p className="text-sm opacity-90 mb-3">Auditoria completa do Centro de Excelência em Bioinsumos</p>
            <div className="flex gap-3 sm:gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] opacity-90"><Clock className="w-4 h-4" /> Logs Estruturados</span>
              <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] opacity-90"><Shield className="w-4 h-4" /> Monitoramento</span>
              <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] opacity-90"><Download className="w-4 h-4" /> Exportação</span>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button disabled={exporting} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 disabled:opacity-50 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 self-start">
                <Download className="w-4 h-4" /> {exporting ? "Exportando..." : "Exportar Logs"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="end">
              <button onClick={() => exportLogs("pdf")} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar PDF
              </button>
              <button onClick={() => exportLogs("excel")} className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
              </button>
            </PopoverContent>
          </Popover>
        </div>
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
              <div className="text-2xl sm:text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* View Mode Tabs */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Visualização</span>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => { setViewMode(v as ViewMode); setUserSearch(""); setSelectedUserId(""); setUserDropdownOpen(false); }}>
            <TabsList>
              <TabsTrigger value="geral"><Shield className="w-3.5 h-3.5 mr-1.5" />Logs Gerais</TabsTrigger>
              <TabsTrigger value="usuario"><User className="w-3.5 h-3.5 mr-1.5" />Por Usuário</TabsTrigger>
              <TabsTrigger value="meus"><Search className="w-3.5 h-3.5 mr-1.5" />Meus Logs</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* User selector when "Por Usuário" is active */}
          {viewMode === "usuario" && (
            <div ref={userDropdownRef} className="relative min-w-[300px]">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserDropdownOpen(true); setSelectedUserId(""); }}
                onFocus={() => setUserDropdownOpen(true)}
                placeholder="Buscar por nome, CPF ou email..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {selectedUserId && (
                <button
                  onClick={() => { setSelectedUserId(""); setUserSearch(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >✕</button>
              )}
              {userDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {logUsers
                    .filter(u => {
                      if (!userSearch) return true;
                      const q = userSearch.toLowerCase().replace(/[.\-/]/g, "");
                      return u.name.toLowerCase().includes(q)
                        || (u.email && u.email.toLowerCase().includes(q))
                        || (u.cpf && u.cpf.replace(/\D/g, "").includes(q));
                    })
                    .map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUserId(String(u.id));
                          setUserSearch(u.name);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${String(u.id) === selectedUserId ? "bg-muted font-medium" : ""}`}
                      >
                        <span className="text-sm font-medium text-foreground">{u.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {u.email || ""}
                          {u.cpf ? ` · CPF: ${u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}` : ""}
                        </span>
                      </button>
                    ))}
                  {logUsers.filter(u => {
                    if (!userSearch) return true;
                    const q = userSearch.toLowerCase().replace(/[.\-/]/g, "");
                    return u.name.toLowerCase().includes(q)
                      || (u.email && u.email.toLowerCase().includes(q))
                      || (u.cpf && u.cpf.replace(/\D/g, "").includes(q));
                  }).length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                  )}
                </div>
              )}
            </div>
                    ))}
                  {logUsers.filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                    <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {viewMode === "meus" && currentUser && (
          <p className="text-xs text-muted-foreground mt-2">Exibindo logs de: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
        )}
        {viewMode === "usuario" && selectedUserId && (
          <p className="text-xs text-muted-foreground mt-2">
            Exibindo logs de: <strong>{logUsers.find(u => u.id === Number(selectedUserId))?.name}</strong> — {filtered.length} registro(s)
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
          <div className="col-span-2 sm:col-span-1">
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
            <h3 className="text-base font-semibold mb-0.5">
              {viewMode === "geral" ? "Logs de Auditoria" : viewMode === "meus" ? "Meus Logs" : "Logs do Usuário"}
            </h3>
            <p className="text-[13px] text-muted-foreground">{filtered.length} registro(s)</p>
          </div>
          <span className="text-xs text-muted-foreground">Atualizado em tempo real</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando dados...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">
              {viewMode === "usuario" && !selectedUserId
                ? "Selecione um usuário para ver seus logs."
                : "Nenhum log de auditoria encontrado."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((log: any) => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{log.action?.replace(/_/g, " ")}</p>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${severityColors[log.severity as keyof typeof severityColors] || ""}`}>{log.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{log.details}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{log.user?.name || `User #${log.user_id}`}</span>
                    <span>{formatDateTimeBrasilia(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm">
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
                    <td className="p-3 text-muted-foreground text-xs">{formatDateTimeBrasilia(log.created_at)}</td>
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
            </table></div>
          </>
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
