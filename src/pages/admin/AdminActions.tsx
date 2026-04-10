import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, KeyRound, Bell, Shield, Download, Clock, Users, Settings, Tag, GraduationCap } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ pending: 0, inactive: 0, tempPasswords: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectStats, users] = await Promise.allSettled([api.getProjectStats(), api.listUsers()]);
        const pending = projectStats.status === "fulfilled" ? projectStats.value.pending : 0;
        const usersData = users.status === "fulfilled" ? users.value : [];
        const inactive = usersData.filter((u: any) => !u.is_active).length;
        const temp = usersData.filter((u: any) => u.is_temp_password).length;
        setStats({ pending, inactive, tempPasswords: temp });
      } catch { /* silent */ }
    };
    fetchStats();
  }, []);

  const actions = [
    { icon: CheckCircle, title: "Aprovação em Lote", desc: "Aprovar múltiplos projetos simultaneamente", tag: "Projects", iconBg: "bg-cebio-green-bg", iconColor: "text-primary", path: "/admin/aprovacao-lote" },
    { icon: XCircle, title: "Rejeição em Lote", desc: "Rejeitar múltiplos projetos com comentários", tag: "Projects", iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red", path: "/admin/rejeicao-lote" },
    { icon: Tag, title: "Gerenciar Categorias", desc: "Criar e editar categorias de projetos", tag: "Settings", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue", path: "/admin/categorias" },
    { icon: GraduationCap, title: "Gerenciar Níveis Acadêmicos", desc: "Configurar níveis acadêmicos disponíveis", tag: "Settings", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple", path: "/admin/categorias" },
    { icon: KeyRound, title: "Reset de Senhas em Lote", desc: "Redefinir senhas para usuários selecionados", tag: "Users", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow", path: "/admin/usuarios" },
    { icon: Download, title: "Exportação Completa", desc: "Exportar todos os dados do sistema", tag: "Data", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue", path: "" },
    { icon: Bell, title: "Notificações em Massa", desc: "Enviar notificações para grupos de usuários", tag: "Communication", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow", path: "/admin/notificacao-massa", badge: 3 },
  ];

  return (
    <AppLayout pageName="Ações Administrativas" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Central de Ações Administrativas</h2>
          <p className="text-sm opacity-90 mb-3">Controle avançado e operações em lote para gestão eficiente do CEBIO</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Shield className="w-4 h-4" /> Operações Seguras</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Settings className="w-4 h-4" /> Auditoria Automática</span>
          </div>
        </div>
        <div className="text-right text-xs opacity-70">
          <div>Sistema Ativo</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Projetos Pendentes", value: stats.pending, sub: "Aguardando revisão", subColor: "text-cebio-red", icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Usuários Inativos", value: stats.inactive, sub: "Requerem atenção", subColor: "text-cebio-red", icon: Users, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
          { label: "Senhas Temporárias", value: stats.tempPasswords, sub: "Precisam redefinir", subColor: "text-cebio-red", icon: KeyRound, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
          { label: "Status do Sistema", value: "Operacional", sub: "Todos os serviços ativos", subColor: "text-primary", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary", isText: true },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className={`${(s as any).isText ? "text-lg" : "text-[32px]"} font-bold text-foreground leading-none`}>{s.value}</div>
              <div className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {actions.map((a, i) => (
          <div key={i} onClick={() => a.path && navigate(a.path)} className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col relative hover:shadow-md transition-shadow cursor-pointer">
            {(a as any).badge && (
              <span className="absolute top-4 right-4 w-6 h-6 bg-primary text-primary-foreground rounded-full text-[11px] font-bold flex items-center justify-center">{(a as any).badge}</span>
            )}
            <div className={`w-12 h-12 rounded-full ${a.iconBg} flex items-center justify-center mb-4`}>
              <a.icon className={`w-6 h-6 ${a.iconColor}`} />
            </div>
            <h4 className="text-[15px] font-bold mb-1.5">{a.title}</h4>
            <p className="text-[13px] text-muted-foreground flex-1 mb-4">{a.desc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{a.tag}</span>
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary transition-colors">Executar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h3 className="text-base font-semibold mb-1">Ações Administrativas Recentes</h3>
        <p className="text-[13px] text-muted-foreground mb-4">Histórico das últimas operações realizadas</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cebio-green-bg">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary-foreground" /></div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Sistema Inicializado</h4>
              <p className="text-xs text-muted-foreground">Backend CEBIO conectado e operacional</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminActions;
