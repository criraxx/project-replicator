import { Search, Eye, FolderOpen, Inbox } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { mockProjects } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const PesquisadorProjects = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const myProjects = mockProjects.filter((p) => p.owner_id === user?.id);

  const filtered = myProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout pageName="Meus Projetos" navItems={PESQUISADOR_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Meus Projetos</h2>
        <p className="text-sm opacity-90">Visualize e gerencie todos os seus projetos submetidos</p>
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
            <p className="text-xs mt-1">Crie uma nova submissão para começar.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground">Projeto</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Categoria</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Nível</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Versão</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Última Atualização</th>
                  <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.summary}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.category}</td>
                    <td className="p-3 text-muted-foreground">{p.academic_level}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status]}`}>{statusLabels[p.status]}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">v{p.version}</td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(p.updated_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <button className="p-1.5 rounded hover:bg-muted" title="Ver detalhes"><Eye className="w-4 h-4 text-cebio-blue" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-sm text-muted-foreground border-t border-border">
              Mostrando {filtered.length} de {myProjects.length} projetos
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PesquisadorProjects;
