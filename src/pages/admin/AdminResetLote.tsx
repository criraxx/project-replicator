import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, KeyRound, CheckCircle, Inbox, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { roleBadge } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminResetLote = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.listUsers(roleFilter || undefined, statusFilter !== "" ? statusFilter === "true" : undefined);
      setUsers(data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, statusFilter]);

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const toggleUser = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map(u => u.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const resetSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Resetar senha de ${selectedIds.size} usuário(s)?`)) return;
    const tempResults: any[] = [];
    for (const id of selectedIds) {
      try {
        const result = await api.resetUserPassword(id);
        const user = users.find(u => u.id === id);
        tempResults.push({ name: user?.name, email: user?.email, password: result.temporary_password });
      } catch { tempResults.push({ name: `User #${id}`, error: true }); }
    }
    setResults(tempResults);
    setShowResults(true);
    setSelectedIds(new Set());
    toast({ title: "Concluído", description: `${tempResults.filter(r => !r.error).length} senha(s) resetada(s)` });
  };

  return (
    <AppLayout pageName="Reset de Senha em Lote" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Total de Usuários</div><div className="text-[32px] font-bold text-foreground">{users.length}</div><div className="text-xs text-muted-foreground">Cadastrados no sistema</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-blue-bg flex items-center justify-center"><Users className="w-5 h-5 text-cebio-blue" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Selecionados para Reset</div><div className="text-[32px] font-bold text-foreground">{selectedIds.size}</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-yellow-bg flex items-center justify-center"><KeyRound className="w-5 h-5 text-cebio-yellow" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Senhas Resetadas Hoje</div><div className="text-[32px] font-bold text-foreground">0</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-green-bg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <h3 className="text-base font-semibold mb-3">Filtros</h3>
        <div className="flex gap-3 flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, email ou CPF..." className="flex-1 min-w-[250px] px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
            <option value="">Todos os Perfis</option><option value="admin">Admin</option><option value="pesquisador">Pesquisador</option><option value="bolsista">Bolsista</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
            <option value="">Todos os Status</option><option value="true">Ativos</option><option value="false">Inativos</option>
          </select>
          <button onClick={fetchUsers} className="px-4 py-2.5 bg-cebio-blue text-primary-foreground rounded-lg text-sm font-medium">Buscar</button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        <div className="p-5 pb-0 flex justify-between items-center">
          <h3 className="text-base font-semibold">Usuários para Reset de Senha</h3>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80">Selecionar Todos</button>
            <button onClick={deselectAll} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted hover:bg-muted/80">Desmarcar Todos</button>
          </div>
        </div>
        <div className="p-5 space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando usuários...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum usuário encontrado.</p>
            </div>
          ) : filtered.map((u: any) => (
            <div key={u.id} className={`flex items-start gap-3 p-4 border-2 border-dashed rounded-xl transition-all ${selectedIds.has(u.id) ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} className="w-[18px] h-[18px] accent-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold">
                  {u.name} <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1 ${roleBadge[u.role as keyof typeof roleBadge]?.className || ""}`}>{u.role}</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Email: {u.email} | Status: {u.is_active ? "✅ Ativo" : "❌ Inativo"}
                </p>
                {u.is_temp_password && <p className="text-xs text-cebio-yellow mt-0.5">⚠️ Já possui senha temporária</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={resetSelected} disabled={selectedIds.size === 0} className="px-6 py-3 rounded-lg text-sm font-semibold text-foreground bg-cebio-yellow-bg border border-cebio-yellow disabled:opacity-50">
          Resetar Senhas Selecionadas ({selectedIds.size})
        </button>
        <button onClick={() => navigate("/admin/usuarios")} className="px-6 py-3 border border-border rounded-lg text-sm font-medium bg-muted">Cancelar</button>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-card rounded-xl p-6 w-full max-w-[800px] max-h-[80vh] overflow-y-auto shadow-xl border border-border">
            <h2 className="text-lg font-semibold text-primary mb-2">Senhas Temporárias Geradas</h2>
            <div className="bg-cebio-yellow-bg border border-cebio-yellow rounded-lg p-3 mb-4 text-sm">
              IMPORTANTE: Copie estas senhas e repasse aos usuários. Elas não serão exibidas novamente.
            </div>
            <div className="space-y-2 mb-4">
              {results.map((r, i) => (
                <div key={i} className="p-3 border border-border rounded-lg text-sm">
                  {r.error ? (
                    <span className="text-cebio-red">❌ {r.name} — Erro ao resetar</span>
                  ) : (
                    <span>✅ <strong>{r.name}</strong> ({r.email}) — Senha: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{r.password}</code></span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setShowResults(false)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Fechar</button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminResetLote;
