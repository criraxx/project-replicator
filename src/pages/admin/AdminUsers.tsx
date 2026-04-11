import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Inbox, Upload, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { roleBadge } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { type User, mockUsers } from "@/data/mockData";

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
  const confirm = useConfirmDialog();

  // Form state for new user
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "bolsista", institution: "", password: "cebio2024" });

  // Batch creation state
  const [batchText, setBatchText] = useState("");
  const [batchPassword, setBatchPassword] = useState("cebio2024");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.listUsers(
        roleFilter || undefined,
        statusFilter !== "" ? statusFilter === "true" : undefined
      );
      setUsers(data && data.length > 0 ? data : mockUsers);
    } catch {
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
        institution: newUser.institution,
      });
      toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      setShowNewUser(false);
      setNewUser({ name: "", email: "", role: "bolsista", institution: "", password: "cebio2024" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleBatchCreate = async () => {
    try {
      const lines = batchText.trim().split("\n").filter((l) => l.trim());
      const usersData = lines.map((line) => {
        const parts = line.split(";").map((p) => p.trim());
        return {
          name: parts[0] || "",
          email: parts[1] || "",
          role: parts[2] || "bolsista",
          institution: parts[3] || "",
        };
      });

      if (usersData.length === 0) {
        toast({ title: "Erro", description: "Nenhum usuário para cadastrar", variant: "destructive" });
        return;
      }

      const result = await api.batchCreateUsers(usersData, batchPassword);
      toast({
        title: "Criação em lote concluída",
        description: `${result.success.length} criados, ${result.errors.length} erros`,
      });
      setShowBatchModal(false);
      setBatchText("");
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async (userId: number, userName: string) => {
    const ok = await confirm({ title: "Resetar Senha", description: `Deseja resetar a senha de ${userName}?`, confirmLabel: "Resetar", variant: "warning" });
    if (!ok) return;
    try {
      const result = await api.resetUserPassword(userId);
      toast({
        title: "Senha resetada",
        description: `Nova senha temporária: ${result.temporary_password}`,
      });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    const action = currentActive ? "desativar" : "ativar";
    const ok = await confirm({ title: `${currentActive ? "Desativar" : "Ativar"} Usuario`, description: `Deseja ${action} este usuario?`, confirmLabel: currentActive ? "Desativar" : "Ativar", variant: currentActive ? "warning" : "default" });
    if (!ok) return;
    try {
      await api.updateUser(userId, { is_active: !currentActive });
      toast({ title: "Sucesso", description: `Usuário ${currentActive ? "desativado" : "ativado"}` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout pageName="Gestão de Usuários" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gestão de Usuários</h2>
        <p className="text-sm opacity-90">Gerencie todos os usuários da plataforma CEBIO</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: users.length, color: "text-cebio-blue" },
          { label: "Ativos", value: users.filter((u) => u.is_active).length, color: "text-primary" },
          { label: "Inativos", value: users.filter((u) => !u.is_active).length, color: "text-cebio-red" },
          { label: "Pesquisadores", value: users.filter((u) => u.role === "pesquisador").length, color: "text-cebio-purple" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os perfis</option>
          <option value="admin">Admin</option>
          <option value="pesquisador">Pesquisador</option>
          <option value="bolsista">Bolsista</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button onClick={() => setShowNewUser(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
        <button onClick={() => setShowBatchModal(true)} className="bg-secondary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <Upload className="w-4 h-4" /> Cadastro em Lote
        </button>
      </div>

      {/* Modal: Novo Usuário */}
      {showNewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Usuário</h3>
              <button onClick={() => setShowNewUser(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Perfil</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card">
                  <option value="bolsista">Bolsista</option>
                  <option value="pesquisador">Pesquisador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instituição</label>
                <input type="text" value={newUser.institution} onChange={(e) => setNewUser({ ...newUser, institution: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha inicial</label>
                <input type="text" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">Criar Usuário</button>
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
            <p className="text-xs text-muted-foreground mb-3">
              Exemplo: <code className="bg-muted px-1 py-0.5 rounded">Maria Santos;maria@email.com;bolsista;IF Goiano</code>
            </p>
            <textarea
              rows={8}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="Nome;Email;Perfil;Instituição"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card font-mono mb-3"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Senha padrão para todos</label>
              <input type="text" value={batchPassword} onChange={(e) => setBatchPassword(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
            </div>
            <button onClick={handleBatchCreate} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">
              Cadastrar Todos
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Carregando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
            <p className="text-xs mt-1">Cadastre novos usuários usando o botão acima.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground">Usuário</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Perfil</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Instituição</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Último Login</th>
                  <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
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
                          <span className="font-semibold text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{u.institution}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{u.last_login ? new Date(u.last_login).toLocaleDateString("pt-BR") : "Nunca"}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => navigate(`/admin/usuario?id=${u.id}`)} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            Detalhes
                          </button>
                          <button onClick={() => handleToggleActive(u.id, u.is_active)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${u.is_active ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-cebio-green-bg text-primary hover:bg-cebio-green-bg/80"}`}>
                            {u.is_active ? "Desativar" : "Ativar"}
                          </button>
                          <button onClick={async () => {
                            const ok = await confirm({ title: "Excluir Usuario", description: `Tem certeza que deseja EXCLUIR permanentemente ${u.name}? Esta acao nao pode ser desfeita.`, confirmLabel: "Excluir", variant: "danger" });
                            if (!ok) return;
                            api.deleteUser(u.id).then(() => { toast({ title: "Sucesso", description: "Usuario excluido" }); fetchUsers(); }).catch((err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }));
                            }
                          }} className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cebio-red-bg text-cebio-red hover:bg-cebio-red-bg/80 transition-colors">
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-4 text-sm text-muted-foreground border-t border-border">
              Mostrando {filtered.length} de {users.length} usuários
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
