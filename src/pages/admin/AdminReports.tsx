import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart3, FileText, Users, TrendingUp, Download, Filter, RefreshCw, User } from "lucide-react";
import MultiSelectFilter from "@/components/ui/multi-select-filter";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import api from "@/services/api";
import { mockProjects, mockUsers, mockCategories } from "@/data/mockData";

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
          <User key={i} className="w-4 h-4" style={{ color: ic.color }} />
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

const CHART_CONFIGS = [
  { id: "status", title: "Projetos por Status" },
  { id: "category", title: "Projetos por Categoria" },
  { id: "users", title: "Top 10 Usuarios" },
  { id: "timeline", title: "Evolucao Temporal" },
  { id: "usertype", title: "Pesquisadores vs Bolsistas" },
];

const AdminReports = () => {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [userTypeFilters, setUserTypeFilters] = useState<string[]>([]);
  const [ownerFilters, setOwnerFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartType, setChartType] = useState<ChartType>("columns");
  const chartsRef = useRef<HTMLDivElement>(null);
  const [showCustomExport, setShowCustomExport] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(CHART_CONFIGS.map(c => c.id));

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
        setProjects(p.status === "fulfilled" && p.value.projects?.length ? p.value.projects : mockProjects);
        setUsers(u.status === "fulfilled" && u.value?.length ? u.value : mockUsers);
        setCategories(c.status === "fulfilled" && c.value?.length ? c.value : mockCategories);
      } catch {
        setProjects(mockProjects);
        setUsers(mockUsers);
        setCategories(mockCategories);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (statusFilters.length > 0 && !statusFilters.includes(p.status)) return false;
      if (categoryFilters.length > 0 && !categoryFilters.includes(p.category)) return false;
      if (userTypeFilters.length > 0) {
        const owner = users.find(u => u.id === p.owner_id);
        if (owner && !userTypeFilters.includes(owner.role)) return false;
      }
      if (ownerFilters.length > 0 && !ownerFilters.includes(String(p.owner_id))) return false;
      if (startDate && new Date(p.created_at) < startDate) return false;
      if (endDate && new Date(p.created_at) > endDate) return false;
      return true;
    });
  }, [projects, statusFilters, categoryFilters, userTypeFilters, ownerFilters, startDate, endDate, users]);

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
    setStatusFilters([]);
    setCategoryFilters([]);
    setUserTypeFilters([]);
    setOwnerFilters([]);
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

  const captureSvgFromContainer = (container: HTMLElement): string => {
    const svg = container.querySelector("svg.recharts-surface");
    if (!svg) return "";
    const clone = svg.cloneNode(true) as SVGElement;
    const parent = svg.parentElement;
    const w = parent?.clientWidth || 500;
    const h = parent?.clientHeight || 280;
    clone.setAttribute("width", String(w));
    clone.setAttribute("height", String(h));
    clone.setAttribute("viewBox", `0 0 ${w} ${h}`);
    return new XMLSerializer().serializeToString(clone);
  };

  const exportSingleChart = (chartId: string) => {
    if (!chartsRef.current) return;
    const el = chartsRef.current.querySelector(`[data-chart-id="${chartId}"]`) as HTMLElement;
    if (!el) return;
    const svg = captureSvgFromContainer(el);
    const title = CHART_CONFIGS.find(c => c.id === chartId)?.title || "Grafico";
    if (!svg) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><title>${title} - CEBIO</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;text-align:center}
      h1{color:#2d5f4a;font-size:18px;margin-bottom:16px}
      svg{max-width:100%;height:auto}
      p{color:#888;font-size:12px}
      @media print{body{margin:20px}}</style></head><body>
      <h1>${title}</h1>
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:inline-block">${svg}</div>
      <p>CEBIO Brasil - Gerado em ${new Date().toLocaleString("pt-BR")}</p>
      </body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 400);
  };

  const exportPDF = (chartIds?: string[]) => {
    const statusLabel = statusFilters.length > 0 ? statusFilters.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label || s).join(", ") : "Todos";
    const userTypeLabel = userTypeFilters.length > 0 ? userTypeFilters.map(s => USER_TYPE_OPTIONS.find(o => o.value === s)?.label || s).join(", ") : "Todos";
    const catLabel = categoryFilters.length > 0 ? categoryFilters.join(", ") : "Todas";
    const ownerLabel = ownerFilters.length > 0 ? ownerFilters.map(id => uniqueOwners.find(o => String(o.id) === id)?.name || id).join(", ") : "Todos";
    const startLabel = startDate ? format(startDate, "dd/MM/yyyy") : "---";
    const endLabel = endDate ? format(endDate, "dd/MM/yyyy") : "---";

    const idsToExport = chartIds || CHART_CONFIGS.map(c => c.id);

    // Capture selected chart SVGs
    const chartsHtmlParts: string[] = [];
    if (chartsRef.current) {
      idsToExport.forEach(id => {
        const el = chartsRef.current!.querySelector(`[data-chart-id="${id}"]`) as HTMLElement;
        if (!el) return;
        const svg = captureSvgFromContainer(el);
        const title = CHART_CONFIGS.find(c => c.id === id)?.title || "Grafico";
        if (svg) {
          chartsHtmlParts.push(`<div style="margin-bottom:24px">
            <h3 style="font-size:14px;color:#2d5f4a;margin-bottom:8px">${title}</h3>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center">${svg}</div>
          </div>`);
        }
      });
    }

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const rows = filtered.map(p => {
      const owner = users.find(u => u.id === p.owner_id);
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${p.title}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${owner?.name || p.owner?.name || "---"}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${p.category || "---"}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${p.status}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
      </tr>`;
    }).join("");

    const statusRows = byStatus.map(d => `<tr><td style="padding:4px 8px">${d.name}</td><td style="padding:4px 8px;text-align:right">${d.value}</td></tr>`).join("");
    const catRows = byCategory.map(d => `<tr><td style="padding:4px 8px">${d.name}</td><td style="padding:4px 8px;text-align:right">${d.value}</td></tr>`).join("");
    const userRows = byUser.map(d => `<tr><td style="padding:4px 8px">${d.name}</td><td style="padding:4px 8px;text-align:right">${d.value}</td></tr>`).join("");

    printWin.document.write(`<!DOCTYPE html><html><head><title>Relatorio CEBIO</title>
      <style>body{font-family:Arial,sans-serif;margin:40px;color:#1a1a1a}
      h1{color:#2d5f4a;margin-bottom:4px}h2{color:#2d5f4a;margin-top:28px;font-size:16px;border-bottom:2px solid #2d5f4a;padding-bottom:4px}
      table{border-collapse:collapse;width:100%;margin-top:8px;font-size:13px}
      th{text-align:left;padding:8px;background:#f0f7f4;border-bottom:2px solid #2d5f4a;font-size:12px}
      .filters{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;background:#f9fafb;padding:12px;border-radius:8px;font-size:13px;margin-top:8px}
      .filter-item span:first-child{font-weight:600;color:#555}
      .kpi-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-top:12px}
      .kpi{border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center}
      .kpi .val{font-size:28px;font-weight:700;color:#2d5f4a}.kpi .lab{font-size:11px;color:#888}
      .charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}
      .summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:8px}
      .summary-grid table{font-size:12px}
      svg{max-width:100%;height:auto}
      @media print{body{margin:20px}.charts-grid{break-inside:avoid}}</style></head><body>
      <h1>Relatorio CEBIO Brasil</h1>
      <p style="color:#888;font-size:13px">Gerado em ${new Date().toLocaleString("pt-BR")}</p>

      <h2>Filtros Aplicados</h2>
      <div class="filters">
        <div class="filter-item"><span>Status:</span> ${statusLabel}</div>
        <div class="filter-item"><span>Categoria:</span> ${catLabel}</div>
        <div class="filter-item"><span>Tipo Usuario:</span> ${userTypeLabel}</div>
        <div class="filter-item"><span>Proprietario:</span> ${ownerLabel}</div>
        <div class="filter-item"><span>Data Inicio:</span> ${startLabel}</div>
        <div class="filter-item"><span>Data Fim:</span> ${endLabel}</div>
      </div>

      <h2>Indicadores</h2>
      <div class="kpi-grid">
        <div class="kpi"><div class="val">${filtered.length}</div><div class="lab">Projetos Filtrados</div></div>
        <div class="kpi"><div class="val">${users.length}</div><div class="lab">Usuarios no Sistema</div></div>
        <div class="kpi"><div class="val">${approvalRate}%</div><div class="lab">Taxa de Aprovacao</div></div>
        <div class="kpi"><div class="val">${categories.length}</div><div class="lab">Categorias</div></div>
      </div>

      ${chartsHtmlParts.length > 0 ? `<h2>Graficos (${chartsHtmlParts.length})</h2><div class="charts-grid">${chartsHtmlParts.join("")}</div>` : ''}

      <h2>Resumos</h2>
      <div class="summary-grid">
        <div><strong style="font-size:13px">Por Status</strong><table>${statusRows}</table></div>
        <div><strong style="font-size:13px">Por Categoria</strong><table>${catRows}</table></div>
        <div><strong style="font-size:13px">Top Usuarios</strong><table>${userRows}</table></div>
      </div>

      <h2>Projetos (${filtered.length})</h2>
      <table><thead><tr><th>Titulo</th><th>Proprietario</th><th>Categoria</th><th>Status</th><th>Data</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">Nenhum projeto encontrado</td></tr>'}</tbody></table>
      </body></html>`);

    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 500);
  };

  const toggleChartSelection = (id: string) => {
    setSelectedCharts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Relatórios e Analytics</h2>
          <p className="text-sm opacity-90">Visão detalhada e personalizável do desempenho da plataforma</p>
        </div>
        <button onClick={exportPDF} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors">
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
          <div className="col-span-3">
            <label className="text-xs text-muted-foreground mb-2 block">Status (selecione um ou mais)</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.filter(o => o.value !== "all").map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilters(prev => prev.includes(opt.value) ? prev.filter(s => s !== opt.value) : [...prev, opt.value])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    statusFilters.includes(opt.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {statusFilters.length > 0 && (
                <button onClick={() => setStatusFilters([])} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">✕ Limpar</button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <MultiSelectFilter
            label="Categoria"
            options={categories.map(c => ({ value: c.name, label: c.name }))}
            selected={categoryFilters}
            onChange={setCategoryFilters}
            placeholder="Todas"
          />
          <MultiSelectFilter
            label="Tipo de Usuario"
            options={USER_TYPE_OPTIONS.filter(o => o.value !== "all")}
            selected={userTypeFilters}
            onChange={setUserTypeFilters}
            placeholder="Todos"
          />
          <MultiSelectFilter
            label="Proprietario"
            options={uniqueOwners.map(o => ({ value: String(o.id), label: o.name }))}
            selected={ownerFilters}
            onChange={setOwnerFilters}
            placeholder="Todos"
          />
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
      <div ref={chartsRef} className="grid grid-cols-2 gap-6 mb-6">
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
