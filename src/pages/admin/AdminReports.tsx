import { useState, useEffect, useMemo } from "react";
import { BarChart3, FileText, Users, TrendingUp, Download, Filter, RefreshCw, User } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import api from "@/services/api";

const COLORS = ["hsl(170,37%,30%)", "hsl(43,96%,56%)", "hsl(210,72%,46%)", "hsl(3,81%,55%)", "hsl(270,50%,50%)", "hsl(30,80%,55%)"];
const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "em_revisao", label: "Em Revisão" },
];
const USER_TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pesquisador", label: "Pesquisador" },
  { value: "bolsista", label: "Bolsista" },
];

type ChartType = "columns" | "bars" | "lines" | "pie" | "pictogram";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "columns", label: "Colunas" },
  { value: "bars", label: "Barras" },
  { value: "lines", label: "Linhas" },
  { value: "pie", label: "Pizza" },
  { value: "pictogram", label: "Pictograma" },
];

const Pictogram = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-center text-muted-foreground py-8">Sem dados</p>;
  const icons: { color: string; label: string }[] = [];
  data.forEach(d => {
    const count = Math.round((d.value / total) * 100);
    for (let i = 0; i < count; i++) icons.push({ color: d.color, label: d.name });
  });
  return (
    <div>
      <div className="flex flex-wrap gap-1 justify-center mb-4">
        {icons.map((ic, i) => (
          <User key={i} className="w-4 h-4" style={{ color: ic.color }} title={ic.label} />
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }} />
            {d.name}: {d.value}
          </span>
        ))}
      </div>
    </div>
  );
};

const RenderChart = ({ type, data, dataKey = "value", nameKey = "name" }: { type: ChartType; data: any[]; dataKey?: string; nameKey?: string }) => {
  if (!data.length) return <p className="text-center text-muted-foreground py-8">Sem dados para exibir</p>;

  if (type === "pictogram") {
    return <Pictogram data={data.map((d, i) => ({ name: d[nameKey], value: d[dataKey], color: COLORS[i % COLORS.length] }))} />;
  }
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey={dataKey} nameKey={nameKey} label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  if (type === "lines") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  const layout = type === "bars" ? "vertical" : "horizontal";
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout={layout}>
        <CartesianGrid strokeDasharray="3 3" />
        {layout === "vertical" ? (
          <>
            <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 11 }} width={120} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          </>
        )}
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const AdminReports = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartType, setChartType] = useState<ChartType>("columns");

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, u, c] = await Promise.allSettled([
          api.listProjects({ limit: 10000 }),
          api.listUsers(),
          api.listCategories(),
        ]);
        if (p.status === "fulfilled") setProjects(p.value.projects || []);
        if (u.status === "fulfilled") setUsers(u.value);
        if (c.status === "fulfilled") setCategories(c.value);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (userTypeFilter !== "all") {
        const owner = users.find(u => u.id === p.owner_id);
        if (owner && owner.role !== userTypeFilter) return false;
      }
      if (ownerFilter !== "all" && String(p.owner_id) !== ownerFilter) return false;
      if (startDate && new Date(p.created_at) < startDate) return false;
      if (endDate && new Date(p.created_at) > endDate) return false;
      return true;
    });
  }, [projects, statusFilter, categoryFilter, userTypeFilter, ownerFilter, startDate, endDate, users]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => { map[p.status] = (map[p.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => { map[p.category || "Sem categoria"] = (map[p.category || "Sem categoria"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byUser = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const owner = users.find(u => u.id === p.owner_id);
      const name = owner?.name || p.owner?.name || `Usuário ${p.owner_id}`;
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [filtered, users]);

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort().map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byUserType = useMemo(() => {
    const map: Record<string, number> = { pesquisador: 0, bolsista: 0 };
    filtered.forEach(p => {
      const owner = users.find(u => u.id === p.owner_id);
      if (owner?.role && map[owner.role] !== undefined) map[owner.role]++;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name === "pesquisador" ? "Pesquisadores" : "Bolsistas", value }));
  }, [filtered, users]);

  const approvalRate = filtered.length > 0 ? Math.round((filtered.filter(p => p.status === "aprovado").length / filtered.length) * 100) : 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setUserTypeFilter("all");
    setOwnerFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const uniqueOwners = useMemo(() => {
    const seen = new Set<number>();
    return projects.reduce<{ id: number; name: string }[]>((acc, p) => {
      if (!seen.has(p.owner_id)) {
        seen.add(p.owner_id);
        const owner = users.find(u => u.id === p.owner_id);
        acc.push({ id: p.owner_id, name: owner?.name || p.owner?.name || `Usuário ${p.owner_id}` });
      }
      return acc;
    }, []);
  }, [projects, users]);

  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Relatórios e Analytics</h2>
          <p className="text-sm opacity-90">Visão detalhada e personalizável do desempenho da plataforma</p>
        </div>
        <button className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: FileText, label: "Projetos (filtrados)", value: filtered.length, sub: `de ${projects.length} totais`, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
          { icon: Users, label: "Usuários no Sistema", value: users.length, sub: `${users.filter(u => u.is_active).length} ativos`, iconBg: "bg-cebio-green-bg", iconColor: "text-primary" },
          { icon: TrendingUp, label: "Taxa de Aprovação", value: `${approvalRate}%`, sub: `${filtered.filter(p => p.status === "aprovado").length} aprovados`, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { icon: BarChart3, label: "Categorias", value: categories.length, sub: `${byCategory.length} com projetos`, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
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

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filtros</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tipo de Usuário</label>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {USER_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Proprietário</label>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uniqueOwners.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Limpar Filtros</Button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold">Tipo de Gráfico</h3>
          <div className="flex gap-1">
            {CHART_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setChartType(ct.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  chartType === ct.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Projetos por Status</h3>
          <RenderChart type={chartType} data={byStatus} />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Projetos por Categoria</h3>
          <RenderChart type={chartType} data={byCategory} />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Top 10 Usuários</h3>
          <RenderChart type={chartType === "columns" ? "bars" : chartType} data={byUser} />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Evolução Temporal</h3>
          <RenderChart type={chartType === "pie" || chartType === "pictogram" ? "lines" : chartType} data={byMonth} />
        </div>
      </div>

      {/* Pictogram - User Types */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Proporção Pesquisadores vs Bolsistas</h3>
        <Pictogram data={byUserType.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))} />
      </div>

      {/* Summary Table */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-5 pb-0">
          <h3 className="text-sm font-semibold mb-1">Tabela Resumo</h3>
          <p className="text-xs text-muted-foreground mb-4">{filtered.length} projetos com os filtros aplicados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Proprietário</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado</td></tr>
              ) : filtered.slice(0, 20).map((p: any) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-medium text-foreground">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.owner?.name || "—"}</td>
                  <td className="p-3 text-muted-foreground">{p.category || "—"}</td>
                  <td className="p-3"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted">{p.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 20 && (
            <div className="p-3 text-center text-xs text-muted-foreground">Mostrando 20 de {filtered.length} projetos</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminReports;
