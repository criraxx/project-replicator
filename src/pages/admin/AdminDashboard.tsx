import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderOpen, Clock, CheckCircle, Shield, LayoutGrid, Activity, Inbox, Tag, Eye, BarChart3 } from "lucide-react";
import { mockProjects, mockUsers, mockCategories, mockAcademicLevels } from "@/data/mockData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { statusColors, statusLabels } from "@/constants/ui";

const COLORS = ["hsl(170,37%,30%)", "hsl(43,96%,56%)", "hsl(210,72%,46%)", "hsl(3,81%,55%)"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsData, usersData, projectsData, catsData, levelsData] = await Promise.allSettled([
          api.getProjectStats(),
          api.listUsers(),
          api.listProjects({ limit: 5 }),
          api.listCategories(),
          api.listAcademicLevels(),
        ]);
        const u = usersData.status === "fulfilled" ? usersData.value : mockUsers;
        const p = projectsData.status === "fulfilled" ? (projectsData.value.projects || []) : mockProjects;
        const c = catsData.status === "fulfilled" ? catsData.value : mockCategories;
        const l = levelsData.status === "fulfilled" ? levelsData.value : mockAcademicLevels;
        setUsers(u);
        setProjects(p);
        setCategories(c);
        setLevels(l);
        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        } else {
          setStats({
            total: p.length,
            pending: p.filter((x: any) => x.status === "pendente").length,
            approved: p.filter((x: any) => x.status === "aprovado").length,
            rejected: p.filter((x: any) => x.status === "rejeitado").length,
          });
        }
      } catch {
        setUsers(mockUsers);
        setProjects(mockProjects.slice(0, 5));
        setCategories(mockCategories);
        setLevels(mockAcademicLevels);
        setStats({
          total: mockProjects.length,
          pending: mockProjects.filter(x => x.status === "pendente").length,
          approved: mockProjects.filter(x => x.status === "aprovado").length,
          rejected: mockProjects.filter(x => x.status === "rejeitado").length,
        });
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const usersByRole = [
    { name: "Admin", value: users.filter(u => u.role === "admin").length },
    { name: "Pesquisador", value: users.filter(u => u.role === "pesquisador").length },
    { name: "Bolsista", value: users.filter(u => u.role === "bolsista").length },
  ].filter(d => d.value > 0);

  const projectsByStatus = [
    { name: "Pendentes", value: stats.pending },
    { name: "Aprovados", value: stats.approved },
    { name: "Rejeitados", value: stats.rejected },
  ].filter(d => d.value > 0);

  return (
    <AppLayout pageName="Painel do Administrador" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 relative overflow-hidden">
        <h2 className="text-[22px] font-semibold mb-1.5">Painel Administrativo - CEBIO</h2>
        <p className="text-sm opacity-90 mb-4">Centro de Excelência em Bioinsumos - Gestão Completa</p>
        <div className="flex gap-5 flex-wrap">
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Shield className="w-4 h-4" /> Acesso Total</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><LayoutGrid className="w-4 h-4" /> Auditoria Completa</span>
          <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Activity className="w-4 h-4" /> Monitoramento em Tempo Real</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total de Projetos", value: stats.total, sub: `${stats.pending} pendentes`, icon: FolderOpen, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { label: "Aprovados", value: stats.approved, sub: stats.total ? `${Math.round((stats.approved / stats.total) * 100)}% do total` : "0%", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { label: "Total de Usuários", value: users.length, sub: `${users.filter(u => u.is_active).length} ativos`, icon: Users, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
          { label: "Categorias", value: categories.length, sub: `${levels.length} níveis acadêmicos`, icon: Tag, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-[32px] font-bold text-foreground leading-none">{stat.value}</div>
              <div className="text-xs mt-1 text-muted-foreground">{stat.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${stat.iconBg} flex items-center justify-center`}>
              <stat.icon className={`w-[22px] h-[22px] ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Novo Usuário", icon: Users, path: "/admin/usuarios" },
          { label: "Pendentes", icon: Clock, path: "/admin/projetos" },
          { label: "Auditoria", icon: Eye, path: "/admin/auditoria" },
        ].map((a, i) => (
          <button key={i} onClick={() => navigate(a.path)} className="bg-card rounded-xl p-4 shadow-sm border border-border flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <a.icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Projetos por Status</h3>
          {projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={projectsByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {projectsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Sem dados ainda</p></div>
          )}
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-base font-semibold mb-4">Usuários por Perfil</h3>
          {usersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={usersByRole}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(170,37%,30%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground"><BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">Sem dados ainda</p></div>
          )}
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Projetos Recentes</h3>
            <button onClick={() => navigate("/admin/projetos")} className="text-xs text-primary font-medium">Ver todos</button>
          </div>
          <div className="p-5 pt-4 space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum projeto cadastrado ainda.</p>
              </div>
            ) : projects.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.owner?.name || "—"} • {p.category || "—"}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                  {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="flex justify-between items-center p-5 pb-0">
            <h3 className="text-base font-semibold">Usuários Recentes</h3>
            <button onClick={() => navigate("/admin/usuarios")} className="text-xs text-primary font-medium">Ver todos</button>
          </div>
          <div className="p-5 pt-4 space-y-2">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum usuário cadastrado.</p>
              </div>
            ) : users.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cebio-green-light flex items-center justify-center text-primary-foreground font-semibold text-xs">
                    {u.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
