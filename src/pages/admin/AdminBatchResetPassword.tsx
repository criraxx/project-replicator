import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, UserPlus, Trash2, Users, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockUsers } from "@/data/mockData";

const AdminBatchResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirmDialog();

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [newPassword, setNewPassword] = useState("cebio2024");
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const users = await api.listUsers();
        setAllUsers(users.length ? users : mockUsers);
      } catch {
        setAllUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const availableUsers = allUsers.filter(
    (u) =>
      !selectedUsers.some((s) => s.id === u.id) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const addUser = (user: any) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearch("");
  };

  const removeUser = (id: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addAll = () => {
    const filtered = allUsers.filter(
      (u) => !selectedUsers.some((s) => s.id === u.id) && u.role !== "admin"
    );
    setSelectedUsers((prev) => [...prev, ...filtered]);
  };

  const handleReset = async () => {
    if (selectedUsers.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos um usuario", variant: "destructive" });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter no minimo 6 caracteres", variant: "destructive" });
      return;
    }

    const ok = await confirm({
      title: "Resetar Senhas",
      description: `Deseja resetar a senha de ${selectedUsers.length} usuario(s) para "${newPassword}"?`,
      confirmLabel: "Resetar Todos",
      variant: "warning",
    });
    if (!ok) return;

    setResetting(true);
    try {
      const result = await api.batchResetPasswords(
        selectedUsers.map((u) => u.id),
        newPassword
      );
      toast({
        title: "Senhas Resetadas",
        description: `${result.success} senha(s) resetada(s) com sucesso. ${result.errors} erro(s).`,
      });
      setSelectedUsers([]);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <AppLayout pageName="Reset de Senhas em Lote" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="mb-6">
        <button onClick={() => navigate("/admin/acoes")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Acoes
        </button>

        <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7">
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="w-7 h-7" />
            <h2 className="text-[22px] font-semibold">Reset de Senhas em Lote</h2>
          </div>
          <p className="text-sm opacity-90">Selecione os usuarios e defina a nova senha para todos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: search and add users */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold mb-4">Buscar Usuarios</h3>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background mb-3"
          />

          <button
            onClick={addAll}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-3"
          >
            <Users className="w-4 h-4" /> Adicionar todos os usuarios (exceto admins)
          </button>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{search ? "Nenhum usuario encontrado" : "Todos os usuarios ja foram adicionados"}</p>
              </div>
            ) : (
              availableUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <button
                    onClick={() => addUser(u)}
                    className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: selected users + password + action */}
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
          <h3 className="text-base font-semibold mb-4">
            Usuarios Selecionados ({selectedUsers.length})
          </h3>

          <div className="flex-1 max-h-[300px] overflow-y-auto space-y-2 mb-4">
            {selectedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum usuario selecionado</p>
              </div>
            ) : (
              selectedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <button
                    onClick={() => removeUser(u.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha para Todos</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 6 caracteres"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Os usuarios serao obrigados a trocar a senha no proximo login.
              </p>
            </div>

            <button
              onClick={handleReset}
              disabled={resetting || selectedUsers.length === 0}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              {resetting ? "Resetando..." : `Resetar Senha de ${selectedUsers.length} Usuario(s)`}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminBatchResetPassword;
