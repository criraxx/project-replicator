import { BarChart3, FileText, Users, TrendingUp, Download } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ADMIN_NAV } from "@/constants/navigation";

const monthlyData = [
  { month: "Jan", projetos: 3, usuarios: 1 },
  { month: "Fev", projetos: 5, usuarios: 2 },
  { month: "Mar", projetos: 4, usuarios: 1 },
  { month: "Abr", projetos: 6, usuarios: 3 },
];

const categoryData = [
  { name: "Bioinsumos", value: 3, color: "hsl(170, 37%, 39%)" },
  { name: "Biotecnologia", value: 2, color: "hsl(210, 72%, 46%)" },
  { name: "Meio Ambiente", value: 2, color: "hsl(130, 40%, 40%)" },
  { name: "Agronomia", value: 1, color: "hsl(43, 96%, 56%)" },
];

const levelData = [
  { name: "Técnico", count: 1 },
  { name: "Graduação", count: 2 },
  { name: "Mestrado", count: 3 },
  { name: "Doutorado", count: 2 },
];

const AdminReports = () => {
  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={3}>
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
          { icon: FileText, label: "Projetos Totais", value: "28", sub: "+12% vs mês anterior", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: Users, label: "Usuários Ativos", value: "6", sub: "de 7 cadastrados", iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: TrendingUp, label: "Taxa de Aprovação", value: "67%", sub: "acima da meta (60%)", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { icon: BarChart3, label: "Tempo Médio Revisão", value: "4.2d", sub: "dias por projeto", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
              <div className="text-xs text-primary mt-1">{kpi.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${kpi.iconBg} flex items-center justify-center`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Evolução Mensal</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="projetos" stroke="hsl(170, 37%, 39%)" strokeWidth={2} name="Projetos" />
                <Line type="monotone" dataKey="usuarios" stroke="hsl(210, 72%, 46%)" strokeWidth={2} name="Usuários" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Por Categoria</h3>
          <div className="flex justify-center" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h3 className="text-base font-semibold mb-4">Por Nível Acadêmico</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={levelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(170, 37%, 39%)" radius={[4, 4, 0, 0]} name="Projetos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReports;
