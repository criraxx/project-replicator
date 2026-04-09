import { useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Download } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { mockProjects } from "@/data/mockData";
import { ADMIN_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const AdminProjects = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filtered = mockProjects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  return (
    <AppLayout pageName="Gestão de Projetos" navItems={ADMIN_NAV} notificationCount={3}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gestão de Projetos</h2>
        <p className="text-sm opacity-90">Gerencie todos os projetos submetidos ao CEBIO</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: mockProjects.length, color: "text-cebio-blue" },
          { label: "Aprovados", value: mockProjects.filter((p) => p.status === "aprovado").length, color: "text-primary" },
          { label: "Pendentes", value: mockProjects.filter((p) => p.status === "pendente").length, color: "text-cebio-yellow" },
          { label: "Rejeitados", value: mockProjects.filter((p) => p.status === "rejeitado").length, color: "text-cebio-red" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_revisao">Em Revisão</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Aprovar ({selectedIds.length})
            </button>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Rejeitar ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left w-10">
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" />
              </th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Projeto</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Autor</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Categoria</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Nível</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
              <th className="p-3 text-left font-semibold text-muted-foreground">Data</th>
              <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-primary" />
                </td>
                <td className="p-3">
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.summary}</div>
                </td>
                <td className="p-3 text-muted-foreground">{p.owner_name}</td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3 text-muted-foreground">{p.academic_level}</td>
                <td className="p-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="p-3">
                  <div className="flex justify-center gap-1">
                    <button className="p-1.5 rounded hover:bg-muted" title="Ver detalhes"><Eye className="w-4 h-4 text-cebio-blue" /></button>
                    {p.status === "pendente" && (
                      <>
                        <button className="p-1.5 rounded hover:bg-muted" title="Aprovar"><CheckCircle className="w-4 h-4 text-primary" /></button>
                        <button className="p-1.5 rounded hover:bg-muted" title="Rejeitar"><XCircle className="w-4 h-4 text-cebio-red" /></button>
                      </>
                    )}
                    <button className="p-1.5 rounded hover:bg-muted" title="Download"><Download className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-sm text-muted-foreground border-t border-border">
          Mostrando {filtered.length} de {mockProjects.length} projetos
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminProjects;
