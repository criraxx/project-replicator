import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart3, FileText, Users, TrendingUp, Download, Filter, RefreshCw, User, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Minus, Clock, GitCompare, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import MultiSelectFilter from "@/components/ui/multi-select-filter";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  CartesianGrid,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import api from "@/services/api";
import { formatDateBrasilia } from "@/lib/formatters";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const COLORS = ["hsl(170,37%,30%)", "hsl(43,96%,56%)", "hsl(210,72%,46%)", "hsl(3,81%,55%)", "hsl(270,50%,50%)", "hsl(30,80%,55%)", "hsl(150,60%,40%)", "hsl(330,60%,50%)"];
const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "em_revisao", label: "Em Revisão" },
  { value: "devolvido", label: "Devolvido" },
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
    <div className="bg-card p-4 rounded-lg">
      <div className="flex flex-wrap gap-1 justify-center mb-4">
        {icons.map((ic, i) => (
          <User key={i} className="w-4 h-4" style={{ color: ic.color }} />
        ))}
      </div>
      <div className="flex gap-4 justify-center flex-wrap">
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

// --- Variation badge ---
const VariationBadge = ({ current, previous }: { current: number; previous: number }) => {
  if (previous === 0 && current === 0) return <span className="text-xs text-muted-foreground">—</span>;
  if (previous === 0) return <span className="text-xs text-green-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />Novo</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
  if (pct > 0) return <span className="text-xs text-green-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{pct}%</span>;
  return <span className="text-xs text-destructive flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{pct}%</span>;
};

const AdminReports = () => {
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [userTypeFilters, setUserTypeFilters] = useState<string[]>([]);
  const [ownerFilters, setOwnerFilters] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [chartType, setChartType] = useState<ChartType>("columns");
  const chartsRef = useRef<HTMLDivElement>(null);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [periodA_start, setPeriodA_start] = useState<Date | undefined>(startOfMonth(subMonths(new Date(), 3)));
  const [periodA_end, setPeriodA_end] = useState<Date | undefined>(endOfMonth(subMonths(new Date(), 1)));
  const [periodB_start, setPeriodB_start] = useState<Date | undefined>(startOfMonth(subMonths(new Date(), 6)));
  const [periodB_end, setPeriodB_end] = useState<Date | undefined>(endOfMonth(subMonths(new Date(), 4)));

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Close owner dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(e.target as Node)) {
        setOwnerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, u, c] = await Promise.allSettled([
          api.listProjects({ limit: 10000 }),
          api.listUsers(),
          api.listCategories(),
        ]);
        setProjects(p.status === "fulfilled" && p.value.projects?.length ? p.value.projects : []);
        setUsers(u.status === "fulfilled" && u.value?.length ? u.value : []);
        setCategories(c.status === "fulfilled" && c.value?.length ? c.value : []);
      } catch {
        setProjects([]);
        setUsers([]);
        setCategories([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // ===== FILTERED PROJECTS =====
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

  // ===== BASIC CHARTS (existing) =====
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

  // ===== NEW ANALYTICS CHARTS =====

  // 1. Approval rate per category (stacked bar)
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

  // 2. Average review time (days from created_at to updated_at for approved/rejected)
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
      name,
      value: v.count > 0 ? Math.round(v.totalDays / v.count) : 0,
    })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // 3. By academic level
  const byAcademicLevel = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const level = p.academic_level || "Não informado";
      map[level] = (map[level] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // 4. Monthly comparison (multi-line: approved vs rejected vs pending per month)
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

  // 5. Co-author distribution
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

  // 6. Active vs inactive users
  const userActivity = useMemo(() => {
    const active = users.filter(u => u.is_active).length;
    const inactive = users.filter(u => !u.is_active).length;
    return [
      { name: "Ativos", value: active },
      { name: "Inativos", value: inactive },
    ];
  }, [users]);

  // 7. Rework rate per author (devolvido/rejeitado count)
  const reworkByAuthor = useMemo(() => {
    const map: Record<string, { total: number; rework: number }> = {};
    filtered.forEach(p => {
      const owner = users.find(u => u.id === p.owner_id);
      const name = owner?.name || `Usuário ${p.owner_id}`;
      if (!map[name]) map[name] = { total: 0, rework: 0 };
      map[name].total++;
      if (["devolvido", "rejeitado"].includes(p.status)) map[name].rework++;
    });
    return Object.entries(map)
      .filter(([, v]) => v.total >= 1)
      .map(([name, v]) => ({
        name,
        value: Math.round((v.rework / v.total) * 100),
        total: v.total,
        rework: v.rework,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered, users]);

  // 8. Category productivity ranking (approved count)
  const categoryRanking = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      if (p.status !== "aprovado") return;
      const cat = p.category || "Sem categoria";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // ===== COMPARISON =====
  const filterByPeriod = (start?: Date, end?: Date) => {
    return projects.filter(p => {
      const d = new Date(p.created_at);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  };

  const periodAProjects = useMemo(() => filterByPeriod(periodA_start, periodA_end), [projects, periodA_start, periodA_end]);
  const periodBProjects = useMemo(() => filterByPeriod(periodB_start, periodB_end), [projects, periodB_start, periodB_end]);

  const getMetrics = (list: any[]) => {
    const total = list.length;
    const approved = list.filter(p => p.status === "aprovado").length;
    const rejected = list.filter(p => p.status === "rejeitado").length;
    const returned = list.filter(p => p.status === "devolvido").length;
    const pending = list.filter(p => p.status === "pendente").length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const uniqueAuthors = new Set(list.map(p => p.owner_id)).size;
    return { total, approved, rejected, returned, pending, approvalRate, uniqueAuthors };
  };

  const metricsA = useMemo(() => getMetrics(periodAProjects), [periodAProjects]);
  const metricsB = useMemo(() => getMetrics(periodBProjects), [periodBProjects]);

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
    return projects.reduce<{ id: number; name: string; email?: string; cpf?: string }[]>((acc, p) => {
      if (!seen.has(p.owner_id)) {
        seen.add(p.owner_id);
        const owner = users.find(u => u.id === p.owner_id);
        acc.push({
          id: p.owner_id,
          name: owner?.name || p.owner?.name || `Usuário ${p.owner_id}`,
          email: owner?.email,
          cpf: owner?.cpf,
        });
      }
      return acc;
    }, []);
  }, [projects, users]);

  const buildPayload = async () => {
    const statusLabel = statusFilters.length > 0 ? statusFilters.map(s => STATUS_OPTIONS.find(o => o.value === s)?.label || s).join(", ") : "Todos";
    const userTypeLabel = userTypeFilters.length > 0 ? userTypeFilters.map(s => USER_TYPE_OPTIONS.find(o => o.value === s)?.label || s).join(", ") : "Todos";
    const catLabel = categoryFilters.length > 0 ? categoryFilters.join(", ") : "Todas";
    const ownerLabel = ownerFilters.length > 0 ? ownerFilters.map(id => uniqueOwners.find(o => String(o.id) === id)?.name || id).join(", ") : "Todos";

    return {
      title: "Relatorio CEBIO Brasil",
      generatedAt: new Date().toLocaleString("pt-BR"),
      chartType: chartType,
      filters: [
        { label: "Status", value: statusLabel },
        { label: "Categoria", value: catLabel },
        { label: "Tipo Usuario", value: userTypeLabel },
        { label: "Proprietario", value: ownerLabel },
        { label: "Data Inicio", value: startDate ? format(startDate, "dd/MM/yyyy") : "---" },
        { label: "Data Fim", value: endDate ? format(endDate, "dd/MM/yyyy") : "---" },
      ],
      kpis: [
        { label: "Projetos Filtrados", value: filtered.length },
        { label: "Usuarios no Sistema", value: users.length },
        { label: "Taxa de Aprovacao", value: `${approvalRate}%` },
        { label: "Categorias", value: categories.length },
      ],
      sections: [
        { title: "Projetos por Status", data: byStatus },
        { title: "Projetos por Categoria", data: byCategory },
        { title: "Top 10 Usuarios", data: byUser },
        { title: "Evolucao Temporal", data: byMonth },
        { title: "Tipo de Usuario", data: byUserType },
        { title: "Nivel Academico", data: byAcademicLevel },
        { title: "Tempo Medio de Revisao (dias)", data: avgReviewTime },
        { title: "Distribuicao de Coautores", data: coAuthorDist },
        { title: "Ranking de Categorias (Aprovados)", data: categoryRanking },
      ],
      projects: filtered.map(p => {
        const owner = users.find((u: any) => u.id === p.owner_id);
        return {
          title: p.title,
          owner: owner?.name || p.owner?.name || "---",
          category: p.category || "---",
          status: p.status,
          date: formatDateBrasilia(p.created_at),
        };
      }),
    };
  };

  const downloadBlob = async (url: string, body: any, filename: string) => {
    setExporting(true);
    try {
      const token = localStorage.getItem("cebio_token");
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiBase}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Falha na exportacao");
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
    downloadBlob("/exports/pdf", payload, `relatorio_cebio_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportExcel = async () => {
    const payload = await buildPayload();
    downloadBlob("/exports/excel", payload, `relatorio_cebio_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const exportSectionPDF = async (title: string, data: { name: string; value: number }[]) => {
    const payload = await buildPayload();
    downloadBlob("/exports/pdf-section", {
      sectionTitle: title,
      data,
      chartType,
      projects: payload.projects
    }, `${title.replace(/\s+/g, "_")}.pdf`);
  };

  const DatePickerInline = ({ label, value, onChange }: { label: string; value?: Date; onChange: (d: Date | undefined) => void }) => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
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

  return (
    <AppLayout pageName="Relatórios e Analytics" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-5 sm:p-7 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
         <div>
            <h2 className="text-lg sm:text-[22px] font-semibold mb-1.5">Relatórios e Analytics</h2>
            <p className="text-sm opacity-90">Visão detalhada e personalizável do desempenho da plataforma</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <MultiSelectFilter label="Status" options={STATUS_OPTIONS.filter(o => o.value !== "all")} selected={statusFilters} onChange={setStatusFilters} placeholder="Todos" />
            <MultiSelectFilter label="Categoria" options={categories.map(c => ({ value: c.name, label: c.name }))} selected={categoryFilters} onChange={setCategoryFilters} placeholder="Todas" />
            <MultiSelectFilter label="Tipo de Usuario" options={USER_TYPE_OPTIONS.filter(o => o.value !== "all")} selected={userTypeFilters} onChange={setUserTypeFilters} placeholder="Todos" />
            <div>
              <label className="block text-[13px] font-semibold text-muted-foreground mb-2">Proprietário</label>
              <div ref={ownerDropdownRef} className="relative">
                <input
                  type="text"
                  value={ownerSearch}
                  onChange={(e) => { setOwnerSearch(e.target.value); setOwnerDropdownOpen(true); }}
                  onFocus={() => setOwnerDropdownOpen(true)}
                  placeholder="Buscar por nome, CPF ou email..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {ownerFilters.length > 0 && (
                  <button onClick={() => { setOwnerFilters([]); setOwnerSearch(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">✕</button>
                )}
                {ownerDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {uniqueOwners
                      .filter(o => {
                        if (!ownerSearch) return true;
                        const q = ownerSearch.toLowerCase().replace(/[.\-/]/g, "");
                        return o.name.toLowerCase().includes(q)
                          || (o.email && o.email.toLowerCase().includes(q))
                          || (o.cpf && o.cpf.replace(/\D/g, "").includes(q));
                      })
                      .map(o => (
                        <button
                          key={o.id}
                          onClick={() => {
                            const id = String(o.id);
                            setOwnerFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                          }}
                          className={cn("w-full text-left px-3 py-2 hover:bg-muted transition-colors", ownerFilters.includes(String(o.id)) && "bg-muted font-medium")}
                        >
                          <span className="flex items-center gap-2">
                            <input type="checkbox" checked={ownerFilters.includes(String(o.id))} readOnly className="w-3.5 h-3.5 accent-primary" />
                            <span>
                              <span className="text-sm font-medium text-foreground">{o.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {o.email || ""}
                                {o.cpf ? ` · CPF: ${o.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}` : ""}
                              </span>
                            </span>
                          </span>
                        </button>
                      ))}
                    {uniqueOwners.filter(o => {
                      if (!ownerSearch) return true;
                      const q = ownerSearch.toLowerCase().replace(/[.\-/]/g, "");
                      return o.name.toLowerCase().includes(q) || (o.email && o.email.toLowerCase().includes(q)) || (o.cpf && o.cpf.replace(/\D/g, "").includes(q));
                    }).length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                    )}
                  </div>
                )}
                {ownerFilters.length > 0 && !ownerDropdownOpen && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ownerFilters.map(id => {
                      const o = uniqueOwners.find(u => String(u.id) === id);
                      return (
                        <span key={id} className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {o?.name || id}
                          <button onClick={() => setOwnerFilters(prev => prev.filter(x => x !== id))} className="hover:text-destructive">✕</button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <DatePickerInline label="Data Início" value={startDate} onChange={setStartDate} />
            <DatePickerInline label="Data Fim" value={endDate} onChange={setEndDate} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Limpar Filtros</Button>
          </div>
        </div>

        {/* Tabs: Geral | Analíticos | Comparação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="geral"><BarChart3 className="w-4 h-4 mr-1.5" />Geral</TabsTrigger>
            <TabsTrigger value="analiticos"><TrendingUp className="w-4 h-4 mr-1.5" />Analíticos</TabsTrigger>
            <TabsTrigger value="comparacao"><GitCompare className="w-4 h-4 mr-1.5" />Comparação</TabsTrigger>
          </TabsList>

          {/* ===== TAB GERAL ===== */}
          <TabsContent value="geral">
            {/* Chart Type Selector */}
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

            <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {[
                { title: "Projetos por Status", data: byStatus, type: chartType },
                { title: "Projetos por Categoria", data: byCategory, type: chartType },
                { title: "Top 10 Usuários", data: byUser, type: chartType === "columns" ? "bars" as ChartType : chartType },
                { title: "Evolução Temporal", data: byMonth, type: (chartType === "pie" || chartType === "pictogram" ? "lines" : chartType) as ChartType },
                { title: "Tipo de Usuário", data: byUserType, type: chartType },
              ].map((chart, i) => (
                <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">{chart.title}</h3>
                    <button onClick={() => exportSectionPDF(chart.title, chart.data)} disabled={exporting}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-1 disabled:opacity-50">
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                  <RenderChart type={chart.type} data={chart.data} />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ===== TAB ANALÍTICOS ===== */}
          <TabsContent value="analiticos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* 1. Approval by category (stacked) */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Taxa de Aprovação por Categoria</h3>
                <StackedBarChart data={approvalByCategory} bars={[
                  { key: "aprovado", color: COLORS[0], label: "Aprovado" },
                  { key: "rejeitado", color: COLORS[3], label: "Rejeitado" },
                  { key: "devolvido", color: COLORS[1], label: "Devolvido" },
                  { key: "pendente", color: COLORS[2], label: "Pendente" },
                ]} />
              </div>

              {/* 2. Avg review time */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Tempo Médio de Revisão (dias)</h3>
                </div>
                <RenderChart type="bars" data={avgReviewTime} />
              </div>

              {/* 3. Academic level */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Projetos por Nível Acadêmico</h3>
                <RenderChart type="pie" data={byAcademicLevel} />
              </div>

              {/* 4. Monthly comparison multi-line */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Comparativo Mensal (Aprovados × Rejeitados × Pendentes)</h3>
                <MultiLineChart data={monthlyComparison} lines={[
                  { key: "aprovado", color: COLORS[0], label: "Aprovados" },
                  { key: "rejeitado", color: COLORS[3], label: "Rejeitados" },
                  { key: "pendente", color: COLORS[2], label: "Pendentes" },
                ]} />
              </div>

              {/* 5. Co-author distribution */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Distribuição de Coautores</h3>
                <RenderChart type="columns" data={coAuthorDist} />
              </div>

              {/* 6. Active/inactive users */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Saúde da Base de Usuários</h3>
                <RenderChart type="pie" data={userActivity} />
              </div>

              {/* 7. Rework rate */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Taxa de Retrabalho por Autor (%)</h3>
                {reworkByAuthor.length > 0 ? (
                  <RenderChart type="bars" data={reworkByAuthor} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">Sem dados de retrabalho</p>
                )}
              </div>

              {/* 8. Category productivity ranking */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Ranking de Categorias (Aprovados)</h3>
                <RenderChart type="bars" data={categoryRanking} />
              </div>
            </div>
          </TabsContent>

          {/* ===== TAB COMPARAÇÃO ===== */}
          <TabsContent value="comparacao">
            <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <GitCompare className="w-4 h-4" /> Comparar Dois Períodos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-primary">Período A</p>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePickerInline label="Início" value={periodA_start} onChange={setPeriodA_start} />
                    <DatePickerInline label="Fim" value={periodA_end} onChange={setPeriodA_end} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">Período B</p>
                  <div className="grid grid-cols-2 gap-2">
                    <DatePickerInline label="Início" value={periodB_start} onChange={setPeriodB_start} />
                    <DatePickerInline label="Fim" value={periodB_end} onChange={setPeriodB_end} />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { label: "Total de Projetos", a: metricsA.total, b: metricsB.total },
                { label: "Aprovados", a: metricsA.approved, b: metricsB.approved },
                { label: "Taxa de Aprovação", a: metricsA.approvalRate, b: metricsB.approvalRate, suffix: "%" },
                { label: "Autores Únicos", a: metricsA.uniqueAuthors, b: metricsB.uniqueAuthors },
              ].map((m, i) => (
                <div key={i} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                  <div className="text-[13px] text-muted-foreground mb-2">{m.label}</div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="text-xs text-primary font-medium">Período A</div>
                      <div className="text-2xl font-bold text-foreground">{m.a}{m.suffix || ""}</div>
                    </div>
                    <div className="text-center pb-1">
                      <VariationBadge current={m.a} previous={m.b} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-medium">Período B</div>
                      <div className="text-2xl font-bold text-muted-foreground">{m.b}{m.suffix || ""}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed comparison table */}
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="p-5 pb-3">
                <h3 className="text-sm font-semibold">Detalhamento por Métrica</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Métrica</th>
                      <th className="text-center p-3 font-medium text-primary">Período A</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Período B</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Total de Projetos", a: metricsA.total, b: metricsB.total },
                      { label: "Aprovados", a: metricsA.approved, b: metricsB.approved },
                      { label: "Rejeitados", a: metricsA.rejected, b: metricsB.rejected },
                      { label: "Devolvidos", a: metricsA.returned, b: metricsB.returned },
                      { label: "Pendentes", a: metricsA.pending, b: metricsB.pending },
                      { label: "Taxa de Aprovação (%)", a: metricsA.approvalRate, b: metricsB.approvalRate },
                      { label: "Autores Únicos", a: metricsA.uniqueAuthors, b: metricsB.uniqueAuthors },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground">{row.label}</td>
                        <td className="p-3 text-center font-semibold text-foreground">{row.a}</td>
                        <td className="p-3 text-center text-muted-foreground">{row.b}</td>
                        <td className="p-3 text-center"><VariationBadge current={row.a} previous={row.b} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Table */}
        <SummaryTable projects={filtered} users={users} />
      </div>
    </AppLayout>
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

type SortField = "title" | "owner" | "category" | "status" | "date";
type SortDir = "asc" | "desc";

const SummaryTable = ({ projects, users }: { projects: any[]; users: any[] }) => {
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
        case "owner":
          va = users.find((u: any) => u.id === a.owner_id)?.name || a.owner?.name || "";
          vb = users.find((u: any) => u.id === b.owner_id)?.name || b.owner?.name || "";
          break;
        case "category": va = a.category || ""; vb = b.category || ""; break;
        case "status": va = a.status || ""; vb = b.status || ""; break;
        case "date": va = a.created_at || ""; vb = b.created_at || ""; break;
        default: va = ""; vb = "";
      }
      const cmp = va.localeCompare(vb);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [projects, users, sortField, sortDir]);

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
                { field: "owner" as SortField, label: "Proprietário" },
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
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum projeto encontrado</td></tr>
            ) : paged.map((p: any, i: number) => (
              <tr key={p.id} className={cn("border-b border-border hover:bg-muted/30 transition-colors", i % 2 === 0 && "bg-muted/20")}>
                <td className="p-3 font-medium text-foreground max-w-[250px] truncate">{p.title}</td>
                <td className="p-3 text-muted-foreground">{users.find((u: any) => u.id === p.owner_id)?.name || p.owner?.name || "—"}</td>
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

export default AdminReports;
