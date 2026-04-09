import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { mockProjects } from "@/data/mockData";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const BolsistaHistory = () => {
  const myProjects = mockProjects.filter((p) => p.owner_id === 3);
  const finalized = myProjects.filter((p) => p.status === "aprovado" || p.status === "rejeitado");

  return (
    <AppLayout pageName="Histórico" navItems={BOLSISTA_NAV} notificationCount={1}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Histórico de Submissões</h2>
        <p className="text-sm opacity-90">Acompanhe o histórico dos seus projetos</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: FileText, label: "Total Submetidos", value: myProjects.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: CheckCircle, label: "Aprovados", value: myProjects.filter((p) => p.status === "aprovado").length, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: XCircle, label: "Rejeitados", value: myProjects.filter((p) => p.status === "rejeitado").length, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center gap-4">
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0"><h3 className="text-base font-semibold">Projetos Finalizados</h3></div>
        <div className="p-5 pt-4 space-y-3">
          {finalized.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum projeto finalizado ainda.</p>
            </div>
          ) : (
            finalized.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {p.category} • {p.academic_level} • v{p.version} • {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                  </div>
                  {p.rejection_reason && (
                    <div className="text-xs text-cebio-red mt-1">Motivo: {p.rejection_reason}</div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BolsistaHistory;
