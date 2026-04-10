import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const PesquisadorProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.listProjects({});
        setProjects(data.projects || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <AppLayout pageName="Meus Projetos" navItems={PESQUISADOR_NAV} notificationCount={1}>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="flex justify-between items-center p-5 pb-0">
          <h3 className="text-base font-semibold">Meus Projetos</h3>
          <span className="text-[13px] text-muted-foreground">{loading ? "Carregando..." : `${projects.length} projeto(s)`}</span>
        </div>
        <div className="p-5 pt-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-10">Carregando projetos...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Nenhum projeto encontrado.</p>
              <p className="text-xs mt-1">Crie uma nova submissão para começar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p: any) => (
                <div key={p.id} onClick={() => navigate(`/projeto?id=${p.id}`)} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <div className="font-semibold text-foreground">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.category || "—"} • {p.academic_level || "—"} • {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status as keyof typeof statusColors] || ""}`}>
                    {statusLabels[p.status as keyof typeof statusLabels] || p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default PesquisadorProjects;
