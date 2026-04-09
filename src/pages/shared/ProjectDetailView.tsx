import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";

const ProjectDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const data = await api.getProject(Number(projectId));
        setProject(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <AppLayout pageName="Detalhes do Projeto" navItems={navItems} notificationCount={0}>
        <p className="text-center text-muted-foreground py-12">Carregando projeto...</p>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout pageName="Detalhes do Projeto" navItems={navItems} notificationCount={0}>
        <p className="text-center text-muted-foreground py-12">Projeto não encontrado.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageName="Detalhes do Projeto" navItems={navItems} notificationCount={0}>
      {/* Back link */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Project Header */}
      <div className="bg-gradient-to-r from-secondary to-primary text-primary-foreground rounded-xl p-10 mb-8 shadow-lg">
        <h1 className="text-[32px] font-bold mb-4">{project.title}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5">
          <div>
            <span className="text-xs uppercase font-semibold opacity-80">ID</span>
            <div className="text-sm font-semibold mt-1">#{project.id}</div>
          </div>
          <div>
            <span className="text-xs uppercase font-semibold opacity-80">Status</span>
            <div className="mt-1">
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground`}>
                {statusLabels[project.status as keyof typeof statusLabels] || project.status}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs uppercase font-semibold opacity-80">Criado em</span>
            <div className="text-sm font-semibold mt-1">{new Date(project.created_at).toLocaleDateString("pt-BR")}</div>
          </div>
          {project.category && (
            <div>
              <span className="text-xs uppercase font-semibold opacity-80">Categoria</span>
              <div className="text-sm font-semibold mt-1">{project.category}</div>
            </div>
          )}
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <h3 className="text-lg font-bold text-primary mb-4 pb-3 border-b-2 border-primary/10">Resumo</h3>
        <p className="text-sm text-foreground leading-relaxed">{project.summary || project.description || "Sem descrição"}</p>
      </div>

      {/* Informações Adicionais */}
      {(project.academic_level || project.start_date || project.end_date) && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <h3 className="text-lg font-bold text-primary mb-4 pb-3 border-b-2 border-primary/10">Informações do Projeto</h3>
          <div className="grid grid-cols-2 gap-4">
            {project.academic_level && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Nível Acadêmico</span>
                <p className="text-sm font-medium mt-1">{project.academic_level}</p>
              </div>
            )}
            {project.start_date && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Data de Início</span>
                <p className="text-sm font-medium mt-1">{new Date(project.start_date).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
            {project.end_date && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Data de Término</span>
                <p className="text-sm font-medium mt-1">{new Date(project.end_date).toLocaleDateString("pt-BR")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ProjectDetailView;
