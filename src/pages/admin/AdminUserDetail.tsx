import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Building2, Calendar, Clock, Shield, FileText, Phone, Hash, User, CreditCard } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { roleBadge } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockUsers, mockProjects } from "@/data/mockData";

const AdminUserDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const userId = Number(searchParams.get("id"));

  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p] = await Promise.allSettled([
          api.getUser(userId),
          api.listProjects({ limit: 10000 }),
        ]);
        setUser(u.status === "fulfilled" ? u.value : mockUsers.find(mu => mu.id === userId) || null);
        const allProjects = p.status === "fulfilled" && p.value.projects?.length ? p.value.projects : mockProjects;
        setProjects(allProjects.filter((proj: any) => proj.owner_id === userId));
      } catch {
        setUser(mockUsers.find(mu => mu.id === userId) || null);
        setProjects(mockProjects.filter(p => p.owner_id === userId));
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleToggleActive = async () => {
    if (!user) return;
    const action = user.is_active ? "desativar" : "ativar";
    const ok = await confirm({ title: `${user.is_active ? "Desativar" : "Ativar"} Usuario`, description: `Deseja ${action} o usuario ${user.name}?`, confirmLabel: user.is_active ? "Desativar" : "Ativar", variant: user.is_active ? "warning" : "default" });
    if (!ok) return;
    try {
      await api.updateUser(user.id, { is_active: !user.is_active });
      setUser({ ...user, is_active: !user.is_active });
      toast({ title: "Sucesso", description: `Usuario ${user.is_active ? "desativado" : "ativado"}` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const ok = await confirm({ title: "Excluir Usuario", description: `Tem certeza que deseja EXCLUIR permanentemente o usuario ${user.name}? Esta acao nao pode ser desfeita.`, confirmLabel: "Excluir", variant: "danger" });
    if (!ok) return;
    try {
      await api.deleteUser(user.id);
      toast({ title: "Sucesso", description: "Usuario excluido permanentemente" });
      navigate("/admin/usuarios");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    const ok = await confirm({ title: "Resetar Senha", description: `Deseja resetar a senha de ${user.name}?`, confirmLabel: "Resetar", variant: "warning" });
    if (!ok) return;
    try {
      const result = await api.resetUserPassword(user.id);
      toast({ title: "Senha resetada", description: `Nova senha temporaria: ${result.temporary_password}` });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <AppLayout pageName="Detalhes do Usuario" navItems={ADMIN_NAV} notificationCount={0}>
        <div className="text-center py-20 text-muted-foreground">Carregando...</div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout pageName="Detalhes do Usuario" navItems={ADMIN_NAV} notificationCount={0}>
        <div className="text-center py-20 text-muted-foreground">Usuario nao encontrado.</div>
      </AppLayout>
    );
  }

  const badge = roleBadge[user.role as keyof typeof roleBadge];
  const statusByType: Record<string, number> = {};
  projects.forEach(p => { statusByType[p.status] = (statusByType[p.status] || 0) + 1; });

  return (
    <AppLayout pageName="Detalhes do Usuario" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/admin/usuarios")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Usuarios
        </button>
        <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 flex justify-between items-start">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold">
              {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="text-lg sm:text-[22px] font-semibold">{user.name}</h2>
              <p className="text-sm opacity-90">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge?.className || "bg-muted text-muted-foreground"}`}>
                  {badge?.label || user.role}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleResetPassword} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Resetar Senha
            </button>
            <button onClick={handleToggleActive} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {user.is_active ? "Desativar" : "Ativar"}
            </button>
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Mail, label: "Email", value: user.email },
          { icon: Building2, label: "Instituicao", value: user.institution || "Nao informada" },
          { icon: Calendar, label: "Cadastrado em", value: user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "---" },
          { icon: Clock, label: "Ultimo login", value: user.last_login ? new Date(user.last_login).toLocaleDateString("pt-BR") : "Nunca" },
        ].map((info, i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-2">
              <info.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">{info.label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Todos os Dados do Usuário */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" /> Todos os Dados do Usuario
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: User, label: "Nome Completo", value: user.name },
            { icon: Mail, label: "Email", value: user.email },
            { icon: CreditCard, label: "CPF", value: user.cpf ? user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "Não informado" },
            { icon: Calendar, label: "Data de Nascimento", value: user.birth_date ? new Date(user.birth_date).toLocaleDateString("pt-BR") : "Não informado" },
            { icon: Phone, label: "Telefone", value: user.phone ? user.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : "Não informado" },
            { icon: Building2, label: "Instituição", value: user.institution || "Não informada" },
            { icon: Building2, label: "Departamento/Campus", value: user.department || "Não informado" },
            { icon: Hash, label: "Matrícula/Registro", value: user.registration_number || "Não informado" },
            { icon: Shield, label: "Função/Perfil", value: badge?.label || user.role },
            { icon: Calendar, label: "Cadastrado em", value: user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "---" },
            { icon: Clock, label: "Último login", value: user.last_login ? new Date(user.last_login).toLocaleString("pt-BR") : "Nunca" },
            { icon: Shield, label: "Senha temporária", value: user.is_temp_password ? "Sim" : "Não" },
          ].map((info, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <info.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">{info.label}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
          <div className="text-2xl font-bold text-foreground">{projects.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Projetos</div>
        </div>
        {["pendente", "em_revisao", "aprovado", "rejeitado"].map(status => (
          <div key={status} className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
            <div className="text-2xl font-bold text-foreground">{statusByType[status] || 0}</div>
            <div className="text-xs text-muted-foreground mt-1 capitalize">{status.replace("_", " ")}</div>
          </div>
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Projetos do Usuario ({projects.length})</h3>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Este usuario nao possui projetos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">Titulo</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Categoria</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.title}</td>
                    <td className="p-3 text-muted-foreground">{p.category || "---"}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        p.status === "aprovado" ? "bg-cebio-green-bg text-primary" :
                        p.status === "rejeitado" ? "bg-cebio-red-bg text-cebio-red" :
                        p.status === "em_revisao" ? "bg-cebio-blue-bg text-cebio-blue" :
                        "bg-cebio-yellow-bg text-cebio-yellow"
                      }`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => navigate(`/admin/projeto?id=${p.id}`)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Ver Projeto
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUserDetail;
