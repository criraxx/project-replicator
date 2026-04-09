import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Inbox, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const PesquisadorProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.listProjects({ limit: 100 });
        setProjects(data.projects || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout pageName="Meus Projetos" navItems={PESQUISADOR_NAV} notificationCount={0}>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex justify-between items-center p-5 pb-3">
          <h3 className="text-base font-semibold">Meus Projetos</h3>
          <span className="text-[13px] text-muted-foreground">{filtered.length} projeto(s)</span>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-10 text-sm">Carregando projetos...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-5">
            <FileText className="w-16 h-16 mx-auto mb-4 text-primary/30" />
            <h3 className="font-semibold text-foreground mb-2">Nenhum projeto encontrado</h3>
            <p className="text-sm text-muted-foreground mb-6">Você ainda não criou nenhum projeto</p>
            <button onClick={() => navigate("/pesquisador/submissao")} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium">
              + Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="p-5 pt-2 space-y-3">
            {filtered.map((p: any) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projeto?id=${p.id}`)}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">{p.title}</h4>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                    {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {p.summary ? p.summary.substring(0, 200) + (p.summary.length > 200 ? "..." : "") : "Sem resumo"}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{p.category || "—"}</span>
                  <span>•</span>
                  <span>{p.owner_name || user?.name || "—"}</span>
                  <span>•</span>
                  <span>{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PesquisadorProjects;
