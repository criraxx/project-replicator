import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Eye, KeyRound, UserX, UserCheck, Inbox, Upload, X, Clock, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { roleBadge } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/data/mockData";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "bolsista", institution: "", password: "cebio2024" });
  const [batchText, setBatchText] = useState("");
  const [batchPassword, setBatchPassword] = useState("cebio2024");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.listUsers(roleFilter || undefined, statusFilter !== "" ? statusFilter === "true" : undefined);
      setUsers(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, statusFilter]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({ email: newUser.email, name: newUser.name, password: newUser.password, role: newUser.role, institution: newUser.institution });
      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      setShowNewUser(false);
      setNewUser({ name: "", email: "", role: "bolsista", institution: "", password: "cebio2024" });
      fetchUsers();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleBatchCreate = async () => {
    try {
      const lines = batchText.trim().split("\n").filter((l) => l.trim());
      const usersData = lines.map((line) => {
        const parts = line.split(";").map((p) => p.trim());
        return { name: parts[0] || "", email: parts[1] || "", role: parts[2] || "bolsista", institution: parts[3] || "" };
      });
      if (usersData.length === 0) { toast({ title: "Erro", description: "Nenhum usuário para cadastrar", variant: "destructive" }); return; }
      const result = await api.batchCreateUsers(usersData, batchPassword);
      toast({ title: "Criação em lote concluída", description: `${result.success.length} criados, ${result.errors.length} erros` });
      setShowBatchModal(false);
      setBatchText("");
      fetchUsers();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleResetPassword = async (userId: number, userName: string) => {
    if (!confirm(`Deseja resetar a senha de ${userName}?`)) return;
    try {
      const result = await api.resetUserPassword(userId);
      toast({ title: "Senha resetada", description: `Nova senha temporária: ${result.temporary_password}` });
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await api.updateUser(userId, { is_active: !currentActive });
      toast({ title: "Sucesso", description: `Usuário ${currentActive ? "desativado" : "ativado"}` });
      fetchUsers();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Deseja realmente excluir o usuário ${userName}?`)) return;
    try {
      await api.deleteUser(userId);
      toast({ title: "Sucesso", description: "Usuário excluído" });
      fetchUsers();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const activeCount = users.filter(u => u.is_active).length;
  const tempPassCount = users.filter((u: any) => u.is_temp_password).length;
  const pesqCount = users.filter(u => u.role === "pesquisador").length;

  return (
    <AppLayout pageName="Gestão de Usuários" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Gestão Centralizada de Usuários</h2>
          <p className="text-sm opacity-90 mb-3">Controle total sobre cadastros, permissões e segurança do sistema CEBIO</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Clock className="w-4 h-4" /> Controle Centralizado</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><KeyRound className="w-4 h-4" /> Senhas Temporárias</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Shield className="w-4 h-4" /> Auditoria Completa</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <button onClick={() => setShowNewUser(true)} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
            <UserPlus className="w-4 h-4" /> Criar Usuário
          </button>
          <button onClick={() => setShowBatchModal(true)} className="text-xs text-primary-foreground/80 underline">
            Cadastro em lote
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Usuários", value: users.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Usuários Ativos", value: activeCount, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Senhas Temporárias", value: tempPassCount, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Pesquisadores", value: pesqCount, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <div className={`w-[22px] h-[22px] rounded-full ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, email ou CPF..." className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Tipo de Usuário</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos os tipos</option>
              <option value="admin">Administrador</option>
              <option value="pesquisador">Pesquisador</option>
              <option value="bolsista">Bolsista</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
          <button onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); }} className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">Limpar Filtros</button>
          <span className="text-xs text-muted-foreground pb-2">{filtered.length} usuário(s) encontrado(s)</span>
        </div>
      </div>

      {/* Modal: Novo Usuário */}
      {showNewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-8 w-full max-w-[500px] shadow-xl border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-primary">Novo Usuário</h3>
              <button onClick={() => setShowNewUser(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nome Completo</label>
                <input type="text" required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="João Silva" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="usuario@cebio.gov.br" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Senha</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Mín. 8 caracteres" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
                <p className="text-xs text-muted-foreground mt-1">Mínimo 8 caracteres, deve conter maiúscula, minúscula e número</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo de Usuário</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card">
                  <option value="">Selecione...</option>
                  <option value="admin">Administrador</option>
                  <option value="pesquisador">Pesquisador</option>
                  <option value="bolsista">Bolsista</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Instituição</label>
                <input type="text" value={newUser.institution} onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })} placeholder="CEBIO" className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold">Criar Usuário</button>
                <button type="button" onClick={() => setShowNewUser(false)} className="flex-1 bg-muted text-foreground py-3 rounded-lg text-sm font-semibold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastro em Lote */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cadastro em Lote</h3>
              <button onClick={() => setShowBatchModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Cole os dados dos usuários, um por linha, no formato:<br />
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Nome;Email;Perfil;Instituição</code>
            </p>
            <textarea rows={8} value={batchText} onChange={(e) => setBatchText(e.target.value)} placeholder="Nome;Email;Perfil;Instituição" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card font-mono mb-3" />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Senha padrão para todos</label>
              <input type="text" value={batchPassword} onChange={(e) => setBatchPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
            </div>
            <button onClick={handleBatchCreate} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">Cadastrar Todos</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando dados...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Usuário</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Tipo</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Último Login</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Cadastro</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground uppercase text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const badge = roleBadge[u.role];
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cebio-green-light flex items-center justify-center text-primary-foreground font-semibold text-xs">
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-primary">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString("pt-BR") : "Nunca"}</td>
                      <td className="p-3 text-muted-foreground text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button onClick={() => handleResetPassword(u.id, u.name)} className="px-3 py-1.5 text-xs font-bold rounded-full border transition-all hover:-translate-y-px" style={{ background: "#fff7e8", color: "#b66a00", borderColor: "#f4d08a" }} title="Resetar Senha">
                            <KeyRound className="w-3.5 h-3.5 inline mr-1" />Reset
                          </button>
                          <button onClick={() => handleToggleActive(u.id, u.is_active)} className="px-3 py-1.5 text-xs font-bold rounded-full border transition-all hover:-translate-y-px" style={u.is_active ? { background: "#fff0f0", color: "#c23b3b", borderColor: "#efb4b4" } : { background: "#eefaf7", color: "#1a7a6f", borderColor: "#b8e2d8" }}>
                            {u.is_active ? <><UserX className="w-3.5 h-3.5 inline mr-1" />Desativar</> : <><UserCheck className="w-3.5 h-3.5 inline mr-1" />Ativar</>}
                          </button>
                          <button onClick={() => handleDelete(u.id, u.name)} className="px-3 py-1.5 text-xs font-bold rounded-full border transition-all hover:-translate-y-px" style={{ background: "#f6f7fb", color: "#475569", borderColor: "#d8dee8" }}>
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
