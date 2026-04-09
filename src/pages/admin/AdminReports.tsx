import { BarChart3, FileText, Users, TrendingUp, Download, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";

const AdminReports = () => {
  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Relatórios e Analytics</h2>
          <p className="text-sm opacity-90">Visão detalhada do desempenho da plataforma</p>
        </div>
        <button className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: FileText, label: "Projetos Totais", value: "0", sub: "Sem dados", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: Users, label: "Usuários Ativos", value: "0", sub: "Sem dados", iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: TrendingUp, label: "Taxa de Aprovação", value: "—", sub: "Sem dados", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { icon: BarChart3, label: "Tempo Médio Revisão", value: "—", sub: "Sem dados", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${kpi.iconBg} flex items-center justify-center`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="text-center py-16 text-muted-foreground">
          <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-base font-medium">Sem dados para gerar relatórios</p>
          <p className="text-sm mt-1">Os gráficos e análises aparecerão quando houver projetos e usuários cadastrados.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReports;
