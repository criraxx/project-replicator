import { FolderOpen, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { mockProjects } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const BolsistaDashboard = () => {
  const { user } = useAuth();
  const myProjects = mockProjects.filter((p) => p.owner_id === 3);

  return (
    <AppLayout pageName="Meu Dashboard" navItems={BOLSISTA_NAV} notificationCount={1}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Bem-vindo, {user?.name}</h2>
          <p className="text-sm opacity-90">Painel do Bolsista - CEBIO Brasil</p>
        </div>
        <button className="bg-primary-foreground text-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary-foreground/90">
          <FileText className="w-4 h-4" /> Nova Submissão
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: FolderOpen, label: "Meus Projetos", value: myProjects.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: CheckCircle, label: "Aprovados", value: myProjects.filter((p) => p.status === "aprovado").length, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: Clock, label: "Pendentes", value: myProjects.filter((p) => p.status === "pendente").length, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { icon: XCircle, label: "Rejeitados", value: myProjects.filter((p) => p.status === "rejeitado").length, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0"><h3 className="text-base font-semibold">Meus Projetos</h3></div>
        <div className="p-5 pt-4 space-y-3">
          {myProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não tem projetos. Comece criando uma nova submissão!</p>
            </div>
          ) : (
            myProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.category} • {p.academic_level} • v{p.version}</div>
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

export default BolsistaDashboard;
