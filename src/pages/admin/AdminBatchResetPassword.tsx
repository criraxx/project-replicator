import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users, KeyRound, CheckCircle, XCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

const AdminBatchResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirmDialog();

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [newPassword, setNewPassword] = useState("cebio2024");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const users = await api.listUsers();
        setAllUsers(users);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = allUsers.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(u => u.id)));
    }
  };

  const handleReset = async () => {
    if (selectedIds.size === 0) {
      toast({ title: "Erro", description: "Selecione ao menos um usuário", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }

    const ok = await confirm({
      title: "Resetar Senhas em Lote",
      description: `Deseja resetar a senha de ${selectedIds.size} usuário(s) para "${newPassword}"?`,
      confirmLabel: "Resetar",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const res = await api.batchResetPasswords(Array.from(selectedIds), newPassword);
      setResult({ success: res.success, errors: res.errors });
      toast({ title: "Concluído", description: `${res.success} senha(s) resetada(s)` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout pageName="Reset de Senha em Lote" navItems={ADMIN_NAV} notificationCount={0}>
      <button onClick={() => navigate("/admin/acoes")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Reset de Senha em Lote</h2>
        <p className="text-sm opacity-90">Selecione os usuários e defina a nova senha para todos.</p>
      </div>

      {result && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 flex items-center gap-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-foreground">{result.success} senha(s) resetada(s) com sucesso</p>
            {result.errors > 0 && <p className="text-xs text-destructive">{result.errors} erro(s)</p>}
          </div>
        </div>
      )}

      {/* Password + Actions */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold mb-1">Nova Senha</label>
            <input
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-muted hover:bg-muted/70 transition-colors">
              <Users className="w-4 h-4 inline mr-1" />
              {selectedIds.size === filtered.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </button>
            <button
              onClick={handleReset}
              disabled={selectedIds.size === 0}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 inline mr-1" />
              Resetar Senha ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>

      {/* Search + User List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="bg-transparent border-none text-sm w-full outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Nenhum usuário encontrado</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Perfil</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr
                  key={u.id}
                  onClick={() => toggleUser(u.id)}
                  className={`border-b border-border cursor-pointer transition-colors ${
                    selectedIds.has(u.id) ? "bg-primary/5" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} className="rounded" />
                  </td>
                  <td className="p-3 font-medium text-foreground">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-muted-foreground capitalize">{u.role}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {u.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminBatchResetPassword;
