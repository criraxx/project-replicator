import { useState, useMemo, useRef } from "react";
import { BarChart3, FileText, TrendingUp, Download, Filter, RefreshCw, FileSpreadsheet, Clock, GitCompare, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import MultiSelectFilter from "@/components/ui/multi-select-filter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  CartesianGrid,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import api from "@/services/api";
import { formatDateBrasilia } from "@/lib/formatters";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect } from "react";

const COLORS = ["hsl(170,37%,30%)", "hsl(43,96%,56%)", "hsl(210,72%,46%)", "hsl(3,81%,55%)", "hsl(270,50%,50%)", "hsl(30,80%,55%)", "hsl(150,60%,40%)", "hsl(330,60%,50%)"];
const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "em_revisao", label: "Em Revisão" },
  { value: "devolvido", label: "Devolvido" },
];

type ChartType = "columns" | "bars" | "lines" | "pie";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "columns", label: "Colunas" },
  { value: "bars", label: "Barras" },
  { value: "lines", label: "Linhas" },
  { value: "pie", label: "Pizza" },
];

const RenderChart = ({ type, data, dataKey = "value", nameKey = "name" }: { type: ChartType; data: any[]; dataKey?: string; nameKey?: string }) => {
  if (!data.length) return <p className="text-center text-muted-foreground py-8">Sem dados para exibir</p>;

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
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
          <Line type="monotone" dataKey={dataKey} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  const layout = type === "bars" ? "vertical" : "horizontal";
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout={layout as any}>
        <CartesianGrid strokeDasharray="3 3" />
        {layout === "vertical" ? (
          <>
            <YAxis dataKey={nameKey} type="category" tick={{ fontSize: 11 }} width={120} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          </>
        ) : (
          <>
            <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          </>
        )}
        <Tooltip />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const MultiLineChart = ({ data, lines }: { data: any[]; lines: { key: string; color: string; label: string }[] }) => {
  if (!data.length) return <p className="text-center text-muted-foreground py-8">Sem dados</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {lines.map(l => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={{ r: 3 }} name={l.label} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

const StackedBarChart = ({ data, bars }: { data: any[]; bars: { key: string; color: string; label: string }[] }) => {
  if (!data.length) return <p className="text-center text-muted-foreground py-8">Sem dados</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} stackId="stack" name={b.label} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  aprovado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejeitado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  em_revisao: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  devolvido: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const STATUS_LABELS: Record<string, string> = {
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  pendente: "Pendente",
  em_revisao: "Em Revisão",
  devolvido: "Devolvido",
};

const DatePickerInline = ({ label, value, onChange }: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) => (
  <div>
    <label className="block text-[13px] font-semibold text-muted-foreground mb-2">{label}</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal min-h-[42px]", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : "Selecionar"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  </div>
);

type SortField = "title" | "category" | "status" | "date";
type SortDir = "asc" | "desc";

const SummaryTable = ({ projects }: { projects: any[] }) => {
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const perPage = 15;

  const sorted = useMemo(() => {
    const arr = [...projects];
    arr.sort((a, b) => {
      let va: string, vb: string;
      switch (sortField) {
        case "title": va = a.title || ""; vb = b.title || ""; break;
        case "category": va = a.category || ""; vb = b.category || ""; break;
        case "status": va = a.status || ""; vb = b.status || ""; break;
        case "date": va = a.created_at || ""; vb = b.created_at || ""; break;
        default: va = ""; vb = "";
      }
      return sortDir === "asc" ? va.localeCompare(vb) : -va.localeCompare(vb);
    });
    return arr;
  }, [projects, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = sorted.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Tabela Resumo</h3>
          <p className="text-xs text-muted-foreground">{sorted.length} projetos com os filtros aplicados</p>
        </div>
        <span className="text-xs text-muted-foreground">Página {page + 1} de {totalPages}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {([
                { field: "title" as SortField, label: "Título" },
                { field: "category" as SortField, label: "Categoria" },
                { field: "status" as SortField, label: "Status" },
                { field: "date" as SortField, label: "Data" },
              ]).map(col => (
                <th key={col.field} onClick={() => toggleSort(col.field)}
                  className="text-left p-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none">
                  <span className="flex items-center gap-1">{col.label} <SortIcon field={col.field} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado</td></tr>
            ) : paged.map((p: any, i: number) => (
              <tr key={p.id} className={cn("border-b border-border hover:bg-muted/30 transition-colors", i % 2 === 0 && "bg-muted/20")}>
                <td className="p-3 font-medium text-foreground max-w-[250px] truncate">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.category || "—"}</td>
                <td className="p-3">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", STATUS_BADGE_COLORS[p.status] || "bg-muted text-muted-foreground")}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{formatDateBrasilia(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronsLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const pg = start + i;
              if (pg >= totalPages) return null;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={cn("w-8 h-8 rounded text-xs font-medium", pg === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}>{pg + 1}</button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><ChevronsRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const UserReports = () => {
  const { user } = useAuth();
  const navItems = user?.role === "bolsista" ? BOLSISTA_NAV : PESQUISADOR_NAV;

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartType, setChartType] = useState<ChartType>("columns");
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");

  // Comparison state - periods only
  const [periods, setPeriods] = useState<{ label: string; start?: Date; end?: Date }[]>([
    { label: "Período A", start: startOfMonth(subMonths(new Date(), 3)), end: endOfMonth(subMonths(new Date(), 1)) },
    { label: "Período B", start: startOfMonth(subMonths(new Date(), 6)), end: endOfMonth(subMonths(new Date(), 4)) },
  ]);

  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, c] = await Promise.allSettled([
          api.listProjects({ owner_id: user?.id, limit: 10000 }),
          api.listCategories(),
        ]);
        setProjects(p.status === "fulfilled" && p.value.projects?.length ? p.value.projects : []);
        setCategories(c.status === "fulfilled" && c.value?.length ? c.value : []);
      } catch {
        setProjects([]);
        setCategories([]);
      }
      setLoading(false);
    };
    if (user?.id) fetchAll();
  }, [user?.id]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (statusFilters.length > 0 && !statusFilters.includes(p.status)) return false;
      if (categoryFilters.length > 0 && !categoryFilters.includes(p.category)) return false;
      if (startDate && new Date(p.created_at) < startDate) return false;
      if (endDate && new Date(p.created_at) > endDate) return false;
      return true;
    });
  }, [projects, statusFilters, categoryFilters, startDate, endDate]);

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

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort().map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Analytical
  const approvalByCategory = useMemo(() => {
    const map: Record<string, { aprovado: number; rejeitado: number; pendente: number; devolvido: number }> = {};
    filtered.forEach(p => {
      const cat = p.category || "Sem categoria";
      if (!map[cat]) map[cat] = { aprovado: 0, rejeitado: 0, pendente: 0, devolvido: 0 };
      if (p.status === "aprovado") map[cat].aprovado++;
      else if (p.status === "rejeitado") map[cat].rejeitado++;
      else if (p.status === "devolvido") map[cat].devolvido++;
      else map[cat].pendente++;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, [filtered]);

  const avgReviewTime = useMemo(() => {
    const map: Record<string, { totalDays: number; count: number }> = {};
    filtered.forEach(p => {
      if (!["aprovado", "rejeitado"].includes(p.status)) return;
      const created = new Date(p.created_at);
      const updated = new Date(p.updated_at || p.created_at);
      const days = Math.max(0, differenceInDays(updated, created));
      const cat = p.category || "Sem categoria";
      if (!map[cat]) map[cat] = { totalDays: 0, count: 0 };
      map[cat].totalDays += days;
      map[cat].count++;
    });
    return Object.entries(map).map(([name, v]) => ({
      name, value: v.count > 0 ? Math.round(v.totalDays / v.count) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byAcademicLevel = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const level = p.academic_level || "Não informado";
      map[level] = (map[level] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const monthlyComparison = useMemo(() => {
    const map: Record<string, { aprovado: number; rejeitado: number; pendente: number }> = {};
    filtered.forEach(p => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { aprovado: 0, rejeitado: 0, pendente: 0 };
      if (p.status === "aprovado") map[key].aprovado++;
      else if (p.status === "rejeitado") map[key].rejeitado++;
      else map[key].pendente++;
    });
    return Object.entries(map).sort().map(([name, v]) => ({ name, ...v }));
  }, [filtered]);

  const coAuthorDist = useMemo(() => {
    const map: Record<string, number> = { "Sem coautores": 0, "1 coautor": 0, "2 coautores": 0, "3+ coautores": 0 };
    filtered.forEach(p => {
      const count = p.authors?.length || 0;
      if (count === 0) map["Sem coautores"]++;
      else if (count === 1) map["1 coautor"]++;
      else if (count === 2) map["2 coautores"]++;
      else map["3+ coautores"]++;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const categoryRanking = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      if (p.status !== "aprovado") return;
      const cat = p.category || "Sem categoria";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Comparison
  const getMetrics = (list: any[]) => {
    const total = list.length;
    const approved = list.filter(p => p.status === "aprovado").length;
    const rejected = list.filter(p => p.status === "rejeitado").length;
    const returned = list.filter(p => p.status === "devolvido").length;
    const pending = list.filter(p => p.status === "pendente").length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, rejected, returned, pending, approvalRate };
  };

  const filterByPeriod = (start?: Date, end?: Date) => {
    return projects.filter(p => {
      const d = new Date(p.created_at);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  };

  const periodMetrics = useMemo(() => {
    return periods.map(p => ({
      label: p.label,
      metrics: getMetrics(filterByPeriod(p.start, p.end)),
    }));
  }, [projects, periods]);

  const addPeriod = () => {
    const letter = String.fromCharCode(65 + periods.length);
    setPeriods(prev => [...prev, { label: `Período ${letter}` }]);
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 2) return;
    setPeriods(prev => prev.filter((_, i) => i !== index));
  };

  const updatePeriod = (index: number, field: "start" | "end", value: Date | undefined) => {
    setPeriods(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const approvalRate = filtered.length > 0 ? Math.round((filtered.filter(p => p.status === "aprovado").length / filtered.length) * 100) : 0;

  const clearFilters = () => {
    setStatusFilters([]);
    setCategoryFilters([]);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const buildPayload = async () => {
    return {
      title: "Relatório dos Meus Projetos",
      generatedAt: new Date().toLocaleString("pt-BR"),
      chartType,
      filters: [
        { label: "Status", value: statusFilters.length > 0 ? statusFilters.join(", ") : "Todos" },
        { label: "Categoria", value: categoryFilters.length > 0 ? categoryFilters.join(", ") : "Todas" },
        { label: "Data Início", value: startDate ? format(startDate, "dd/MM/yyyy") : "---" },
        { label: "Data Fim", value: endDate ? format(endDate, "dd/MM/yyyy") : "---" },
      ],
      kpis: [
        { label: "Meus Projetos", value: filtered.length },
        { label: "Taxa de Aprovação", value: `${approvalRate}%` },
        { label: "Categorias", value: byCategory.length },
      ],
      sections: [
        { title: "Projetos por Status", data: byStatus },
        { title: "Projetos por Categoria", data: byCategory },
        { title: "Evolução Temporal", data: byMonth },
        { title: "Nível Acadêmico", data: byAcademicLevel },
      ],
      projects: filtered.map(p => ({
        title: p.title,
        owner: user?.name || "—",
        category: p.category || "---",
        status: p.status,
        date: formatDateBrasilia(p.created_at),
      })),
    };
  };

  const downloadBlob = async (url: string, body: any, filename: string) => {
    setExporting(true);
    try {
      const token = localStorage.getItem("cebio_token");
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiBase}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": token ? `Bearer ${token}` : "" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Falha na exportação");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Erro ao exportar:", err);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    const payload = await buildPayload();
    downloadBlob("/exports/pdf", payload, `meus_projetos_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportExcel = async () => {
    const payload = await buildPayload();
    downloadBlob("/exports/excel", payload, `meus_projetos_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <AppLayout pageName="Meus Relatórios" navItems={navItems} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Meus Relatórios</h2>
            <p className="text-sm opacity-90">Visão detalhada dos seus projetos</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPDF} disabled={exporting} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 disabled:opacity-50 text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors">
              <FileText className="w-4 h-4" /> {exporting ? "Gerando..." : "PDF"}
            </button>
            <button onClick={exportExcel} disabled={exporting} className="bg-primary-foreground/20 hover:bg-primary-foreground/30 disabled:opacity-50 text-primary-foreground px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors">
              <FileSpreadsheet className="w-4 h-4" /> {exporting ? "Gerando..." : "Excel"}
            </button>
          </div>
        </div>
      </div>

      <div>
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { icon: FileText, label: "Meus Projetos", value: filtered.length, sub: `de ${projects.length} totais`, iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue" },
            { icon: TrendingUp, label: "Taxa de Aprovação", value: `${approvalRate}%`, sub: `${filtered.filter(p => p.status === "aprovado").length} aprovados`, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
            { icon: BarChart3, label: "Categorias", value: byCategory.length, sub: "com projetos", iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <MultiSelectFilter label="Status" options={STATUS_OPTIONS} selected={statusFilters} onChange={setStatusFilters} placeholder="Todos" />
            <MultiSelectFilter label="Categoria" options={categories.map(c => ({ value: c.name, label: c.name }))} selected={categoryFilters} onChange={setCategoryFilters} placeholder="Todas" />
            <DatePickerInline label="Data Início" value={startDate} onChange={setStartDate} />
            <DatePickerInline label="Data Fim" value={endDate} onChange={setEndDate} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Limpar Filtros</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="geral"><BarChart3 className="w-4 h-4 mr-1.5" />Geral</TabsTrigger>
            <TabsTrigger value="analiticos"><TrendingUp className="w-4 h-4 mr-1.5" />Analíticos</TabsTrigger>
            <TabsTrigger value="comparacao"><GitCompare className="w-4 h-4 mr-1.5" />Comparação</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h3 className="text-sm font-semibold">Tipo de Gráfico</h3>
                <div className="flex gap-1 flex-wrap">
                  {CHART_TYPES.map(ct => (
                    <button key={ct.value} onClick={() => setChartType(ct.value)}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        chartType === ct.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}>
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {[
                { title: "Projetos por Status", data: byStatus, type: chartType },
                { title: "Projetos por Categoria", data: byCategory, type: chartType },
                { title: "Evolução Temporal", data: byMonth, type: (chartType === "pie" ? "lines" : chartType) as ChartType },
              ].map((chart, i) => (
                <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-5">
                  <h3 className="text-sm font-semibold mb-4">{chart.title}</h3>
                  <RenderChart type={chart.type} data={chart.data} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analiticos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Taxa de Aprovação por Categoria</h3>
                <StackedBarChart data={approvalByCategory} bars={[
                  { key: "aprovado", color: COLORS[0], label: "Aprovado" },
                  { key: "rejeitado", color: COLORS[3], label: "Rejeitado" },
                  { key: "devolvido", color: COLORS[1], label: "Devolvido" },
                  { key: "pendente", color: COLORS[2], label: "Pendente" },
                ]} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Tempo Médio de Revisão (dias)</h3>
                </div>
                <RenderChart type="bars" data={avgReviewTime} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Projetos por Nível Acadêmico</h3>
                <RenderChart type="pie" data={byAcademicLevel} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Comparativo Mensal</h3>
                <MultiLineChart data={monthlyComparison} lines={[
                  { key: "aprovado", color: COLORS[0], label: "Aprovados" },
                  { key: "rejeitado", color: COLORS[3], label: "Rejeitados" },
                  { key: "pendente", color: COLORS[2], label: "Pendentes" },
                ]} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Distribuição de Coautores</h3>
                <RenderChart type="columns" data={coAuthorDist} />
              </div>

              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Ranking de Categorias (Aprovados)</h3>
                <RenderChart type="bars" data={categoryRanking} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparacao">
            <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <GitCompare className="w-4 h-4" /> Períodos para Comparação ({periods.length})
                </h3>
                <button onClick={addPeriod} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Adicionar Período
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {periods.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                        <span className="inline-block w-3 h-3 rounded-full mr-1.5" style={{ background: COLORS[i % COLORS.length] }} />
                        {p.label}
                      </p>
                      {periods.length > 2 && (
                        <button onClick={() => removePeriod(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerInline label="Início" value={p.start} onChange={(d) => updatePeriod(i, "start", d)} />
                      <DatePickerInline label="Fim" value={p.end} onChange={(d) => updatePeriod(i, "end", d)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="p-5 pb-3">
                <h3 className="text-sm font-semibold">Comparativo entre Períodos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Métrica</th>
                      {periodMetrics.map((pm, i) => (
                        <th key={i} className="text-center p-3 font-medium" style={{ color: COLORS[i % COLORS.length] }}>{pm.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["total", "approved", "rejected", "returned", "pending", "approvalRate"] as const).map((key) => {
                      const labels: Record<string, string> = {
                        total: "Total de Projetos", approved: "Aprovados", rejected: "Rejeitados",
                        returned: "Devolvidos", pending: "Pendentes", approvalRate: "Taxa de Aprovação (%)",
                      };
                      return (
                        <tr key={key} className="border-b border-border hover:bg-muted/30">
                          <td className="p-3 font-medium text-foreground">{labels[key]}</td>
                          {periodMetrics.map((pm, i) => (
                            <td key={i} className="p-3 text-center font-semibold text-foreground">
                              {pm.metrics[key]}{key === "approvalRate" ? "%" : ""}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
              <h3 className="text-sm font-semibold mb-4">Gráfico Comparativo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: "Total", ...Object.fromEntries(periodMetrics.map((pm) => [pm.label, pm.metrics.total])) },
                  { name: "Aprovados", ...Object.fromEntries(periodMetrics.map((pm) => [pm.label, pm.metrics.approved])) },
                  { name: "Rejeitados", ...Object.fromEntries(periodMetrics.map((pm) => [pm.label, pm.metrics.rejected])) },
                  { name: "Pendentes", ...Object.fromEntries(periodMetrics.map((pm) => [pm.label, pm.metrics.pending])) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {periodMetrics.map((pm, i) => (
                    <Bar key={pm.label} dataKey={pm.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        <SummaryTable projects={filtered} />
      </div>
    </AppLayout>
  );
};

export default UserReports;
