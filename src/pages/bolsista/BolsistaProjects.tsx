import { useState, useEffect } from "react";
import { Search, Eye, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const BolsistaProjects = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.listProjects({ status: statusFilter || undefined });
        setProjects(data.projects || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProjects();
  }, [statusFilter]);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout pageName="Meus Projetos" navItems={BOLSISTA_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Meus Projetos</h2>
        <p className="text-sm opacity-90">Visualize e acompanhe seus projetos de pesquisa</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-4 items-center">
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar nos meus projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum projeto encontrado.</p>
            <p className="text-xs mt-1">Comece criando uma nova submissão!</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {filtered.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.category || "—"} • {p.academic_level || "—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                    {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                  </span>
                  <button className="p-1.5 rounded hover:bg-muted" title="Ver detalhes"><Eye className="w-4 h-4 text-cebio-blue" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BolsistaProjects;
