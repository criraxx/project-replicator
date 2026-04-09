import { Users, FolderOpen, Clock, CheckCircle, Shield, LayoutGrid, Activity, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";

const AdminDashboard = () => {
  return (
    <AppLayout pageName="Painel do Administrador" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 relative overflow-hidden">
        <h2 className="text-[22px] font-semibold mb-1.5">Painel Administrativo - CEBIO</h2>
        <p className="text-sm opacity-90 mb-4">Centro de Excelência em Bioinsumos - Gestão Completa</p>
        <div className="flex gap-5 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90">
            <Shield className="w-4 h-4" /> Acesso Total
          </span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90">
            <LayoutGrid className="w-4 h-4" /> Auditoria Completa
          </span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90">
            <Activity className="w-4 h-4" /> Monitoramento em Tempo Real
          </span>
        </div>
      </div>

      <h3 className="text-base font-semibold mb-4">Análise de Projetos</h3>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: 0, sub: "Nenhum projeto", subColor: "text-muted-foreground", icon: Users, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Finalizados", value: 0, sub: "0% do total", subColor: "text-muted-foreground", icon: FolderOpen, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Em Andamento", value: 0, sub: "0% do total", subColor: "text-muted-foreground", icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Mais de 50%", value: 0, sub: "0% do total", subColor: "text-muted-foreground", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{stat.value}</div>
              <div className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${stat.iconBg} flex items-center justify-center`}>
              <stat.icon className={`w-[22px] h-[22px] ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Empty States */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Projetos Recentes</h3>
          </div>
          <div className="p-5 pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum projeto cadastrado ainda.</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Atividade Recente</h3>
          </div>
          <div className="p-5 pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma atividade registrada.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
