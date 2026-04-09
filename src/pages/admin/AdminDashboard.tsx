import { Users, FolderOpen, Clock, CheckCircle, Shield, LayoutGrid, Activity } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ADMIN_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const pieData = [
  { name: "Aprovados", value: 12, color: "hsl(170, 37%, 39%)" },
  { name: "Pendentes", value: 8, color: "hsl(43, 96%, 56%)" },
  { name: "Rejeitados", value: 3, color: "hsl(4, 80%, 56%)" },
  { name: "Em Revisão", value: 5, color: "hsl(210, 72%, 46%)" },
];

const barData = [
  { name: "Bioinsumos", valor: 8 },
  { name: "Biotecnologia", valor: 5 },
  { name: "Meio Ambiente", valor: 6 },
  { name: "Agronomia", valor: 4 },
  { name: "Outros", valor: 3 },
];

const recentProjects = [
  { id: 1, title: "Biopesticidas para controle de pragas", author: "Dr. Carlos Silva", status: "pendente" },
  { id: 2, title: "Biofertilizantes a base de microalgas", author: "Dra. Ana Paula", status: "aprovado" },
  { id: 3, title: "Estudo de fungos entomopatogênicos", author: "Maria Santos", status: "em_revisao" },
  { id: 4, title: "Compostagem com microrganismos", author: "João Pereira", status: "rejeitado" },
];

const recentActivity = [
  { id: 1, action: "Projeto aprovado", detail: "Biopesticidas - Dr. Carlos Silva", time: "há 2 horas" },
  { id: 2, action: "Novo usuário cadastrado", detail: "maria.santos@ifgoiano.edu.br", time: "há 3 horas" },
  { id: 3, action: "Projeto submetido", detail: "Biofertilizantes - Dra. Ana Paula", time: "há 5 horas" },
  { id: 4, action: "Senha resetada", detail: "joao.pereira@ifgoiano.edu.br", time: "há 1 dia" },
];

const AdminDashboard = () => {
  return (
    <AppLayout pageName="Painel do Administrador" navItems={ADMIN_NAV} notificationCount={3}>
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

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: 28, sub: "+3 este mês", subColor: "text-primary", icon: Users, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Finalizados", value: 12, sub: "42.8% do total", subColor: "text-primary", icon: FolderOpen, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Em Andamento", value: 8, sub: "28.5% do total", subColor: "text-cebio-yellow", icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Mais de 50%", value: 15, sub: "53.5% do total", subColor: "text-primary", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
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

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Status do Projeto</h3>
          <div className="flex justify-center" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Progresso por Categoria</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="valor" fill="hsl(170, 37%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Projetos Recentes</h3>
            <span className="text-[13px] font-semibold text-primary cursor-pointer hover:underline">Ver todos</span>
          </div>
          <div className="p-5 pt-4 space-y-3">
            {recentProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.author}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${statusColors[p.status]}`}>
                  {statusLabels[p.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Atividade Recente</h3>
            <span className="text-[13px] font-semibold text-primary cursor-pointer hover:underline">Ver logs completos</span>
          </div>
          <div className="p-5 pt-4 space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="p-3 border border-border rounded-lg">
                <div className="text-sm font-semibold text-foreground">{a.action}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.detail}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
