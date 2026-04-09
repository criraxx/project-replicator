import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Clock, CheckCircle, XCircle, FileText, Inbox } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const COLORS = ["hsl(170,37%,30%)", "hsl(43,96%,56%)", "hsl(210,72%,46%)", "hsl(3,81%,55%)"];

const BolsistaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.listProjects({ limit: 100 });
        setProjects(data.projects || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const approved = projects.filter(p => p.status === "aprovado").length;
  const pending = projects.filter(p => p.status === "pendente").length;
  const rejected = projects.filter(p => p.status === "rejeitado").length;

  const chartData = [
    { name: "Aprovados", value: approved },
    { name: "Pendentes", value: pending },
    { name: "Rejeitados", value: rejected },
  ].filter(d => d.value > 0);

  return (
    <AppLayout pageName="Meu Dashboard" navItems={BOLSISTA_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Bem-vindo, {user?.name}</h2>
          <p className="text-sm opacity-90">Painel do Bolsista - CEBIO Brasil</p>
        </div>
        <button onClick={() => navigate("/bolsista/submissao")} className="bg-primary-foreground text-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary-foreground/90">
          <FileText className="w-4 h-4" /> Nova Submissão
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: FolderOpen, label: "Meus Projetos", value: projects.length, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: CheckCircle, label: "Aprovados", value: approved, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: Clock, label: "Pendentes", value: pending, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { icon: XCircle, label: "Rejeitados", value: rejected, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
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

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Projetos por Status</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><p className="text-sm">Sem dados</p></div>
          )}
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Atalhos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nova Submissão", path: "/bolsista/submissao", icon: FileText },
              { label: "Meus Projetos", path: "/bolsista/projetos", icon: FolderOpen },
              { label: "Histórico", path: "/bolsista/historico", icon: Clock },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                <a.icon className="w-4 h-4 text-primary" /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex justify-between items-center p-5 pb-0">
          <h3 className="text-base font-semibold">Meus Projetos Recentes</h3>
          <button onClick={() => navigate("/bolsista/projetos")} className="text-xs text-primary font-medium">Ver todos</button>
        </div>
        <div className="p-5 pt-4 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Você ainda não tem projetos. Comece criando uma nova submissão!</p>
            </div>
          ) : (
            projects.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.category} • {p.academic_level}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                  {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BolsistaDashboard;
