import { Search, Eye, Inbox } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mockProjects } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const BolsistaProjects = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const myProjects = mockProjects.filter((p) => p.owner_id === user?.id);

  const filtered = myProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout pageName="Meus Projetos" navItems={BOLSISTA_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Meus Projetos</h2>
        <p className="text-sm opacity-90">Visualize e acompanhe seus projetos de pesquisa</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar nos meus projetos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum projeto encontrado.</p>
            <p className="text-xs mt-1">Comece criando uma nova submissão!</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.category} • {p.academic_level} • v{p.version}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
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
