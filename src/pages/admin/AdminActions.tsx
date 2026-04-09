import { CheckCircle, XCircle, UserPlus, KeyRound, Bell, Settings, Tag, GraduationCap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";

const ADMIN_NAV = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Projetos", path: "/admin/projetos" },
  { label: "Usuários", path: "/admin/usuarios" },
  { label: "Ações Admin", path: "/admin/acoes" },
  { label: "Relatórios", path: "/admin/relatorios" },
  { label: "Auditoria", path: "/admin/auditoria" },
];

const actions = [
  { icon: CheckCircle, title: "Aprovar Projetos em Lote", desc: "Aprovação em massa de projetos pendentes", tag: "Projetos", iconBg: "bg-cebio-green-bg", iconColor: "text-primary", badge: 2 },
  { icon: XCircle, title: "Rejeitar Projetos em Lote", desc: "Rejeição em massa com justificativa", tag: "Projetos", iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red", badge: 0 },
  { icon: UserPlus, title: "Cadastrar Usuários", desc: "Criar novas contas de pesquisadores e bolsistas", tag: "Usuários", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue", badge: 0 },
  { icon: KeyRound, title: "Reset de Senhas em Lote", desc: "Resetar senhas de múltiplos usuários", tag: "Segurança", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow", badge: 0 },
  { icon: Bell, title: "Notificação em Massa", desc: "Enviar comunicados para todos os usuários", tag: "Comunicação", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple", badge: 0 },
  { icon: Tag, title: "Gerenciar Categorias", desc: "Criar, editar e remover categorias de projetos", tag: "Configuração", iconBg: "bg-cebio-green-bg", iconColor: "text-primary", badge: 0 },
  { icon: GraduationCap, title: "Níveis Acadêmicos", desc: "Configurar níveis acadêmicos disponíveis", tag: "Configuração", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue", badge: 0 },
  { icon: Settings, title: "Modo Manutenção", desc: "Ativar ou desativar o modo de manutenção", tag: "Sistema", iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red", badge: 0 },
];

const AdminActions = () => {
  return (
    <AppLayout pageName="Ações Administrativas" navItems={ADMIN_NAV} notificationCount={3}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Ações Administrativas</h2>
        <p className="text-sm opacity-90">Operações em lote e configurações do sistema</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {actions.map((a, i) => (
          <div key={i} className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col relative hover:shadow-md transition-shadow cursor-pointer">
            {a.badge > 0 && (
              <span className="absolute top-4 right-4 w-6 h-6 bg-primary text-primary-foreground rounded-full text-[11px] font-bold flex items-center justify-center">{a.badge}</span>
            )}
            <div className={`w-12 h-12 rounded-full ${a.iconBg} flex items-center justify-center mb-4`}>
              <a.icon className={`w-6 h-6 ${a.iconColor}`} />
            </div>
            <h4 className="text-[15px] font-bold mb-1.5">{a.title}</h4>
            <p className="text-[13px] text-muted-foreground flex-1 mb-4">{a.desc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{a.tag}</span>
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary transition-colors">
                Executar
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default AdminActions;
