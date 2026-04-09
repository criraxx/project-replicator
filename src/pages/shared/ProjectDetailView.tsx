import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Image, ExternalLink } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

const ProjectDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const [project, setProject] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV.slice(0, 2) : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getProject(Number(projectId));
        setProject(data);
        setVersions(data.versions || []);
        setComments(data.comments || []);
      } catch {
        // mock fallback
        setProject({
          id: projectId,
          title: "Análise de Bioinsumos para Agricultura Sustentável",
          category: "Pesquisa",
          academic_level: "Mestrado",
          status: "pendente",
          owner_name: "Dr. Maria Santos",
          summary: "Este projeto visa analisar a eficácia de bioinsumos na agricultura sustentável, com foco em produtividade e impacto ambiental.",
          target_audience: "Agricultores familiares e pesquisadores da área de agronomia sustentável.",
          start_date: "2024-03-01",
          end_date: "2025-02-28",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-20T14:00:00Z",
          authors: [
            { name: "Dr. Maria Santos", cpf: "123.456.789-00", institution: "IF Goiano", academic_level: "Doutorado", role: "Coordenador", is_main: true },
            { name: "João Silva", cpf: "987.654.321-00", institution: "IF Goiano", academic_level: "Mestrado", role: "Pesquisador", is_main: false },
          ],
          files: [
            { id: 1, original_name: "foto_laboratorio.jpg", file_type: "foto", size_bytes: 2048000 },
            { id: 2, original_name: "relatorio_parcial.pdf", file_type: "documento", size_bytes: 5120000 },
          ],
          links: [
            { title: "Repositório GitHub", url: "https://github.com/example", link_type: "repositório", description: "Código fonte" },
          ],
        });
        setVersions([
          { version_number: 1, change_type: "Criação", description: "Versão inicial do projeto", created_at: "2024-01-15T10:30:00Z", author_name: "Dr. Maria Santos" },
          { version_number: 2, change_type: "Atualização", description: "Atualização do resumo e metodologia", created_at: "2024-01-18T09:00:00Z", author_name: "Dr. Maria Santos" },
        ]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("pt-BR");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <AppLayout pageName="Detalhes do Projeto" navItems={navItems}>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout pageName="Detalhes do Projeto" navItems={navItems}>
        <div className="text-center py-12 text-muted-foreground">Projeto não encontrado</div>
      </AppLayout>
    );
  }

  const photos = (project.files || []).filter((f: any) => f.file_type === "foto");
  const documents = (project.files || []).filter((f: any) => f.file_type === "documento");
  const statusColor = statusColors[project.status as keyof typeof statusColors] || "bg-muted text-muted-foreground";
  const statusLabel = statusLabels[project.status as keyof typeof statusLabels] || project.status;

  return (
    <AppLayout pageName="Detalhes do Projeto" navItems={navItems}>
      {/* Back button + PDF */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          📄 Gerar PDF
        </button>
      </div>

      {/* Project Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-6 mb-6">
        <h1 className="text-[28px] font-bold mb-3">{project.title}</h1>
        <div className="flex gap-6 flex-wrap text-sm opacity-80">
          <span>{project.category || "—"}</span>
          <span>•</span>
          <span>{project.academic_level || "—"}</span>
          <span>•</span>
          <span>{project.owner_name || "—"}</span>
          <span>•</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        <div className="mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">📋 Informações Básicas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "ID do Projeto", value: `#${project.id}` },
            { label: "Status", value: statusLabel },
            { label: "Data de Início", value: formatDate(project.start_date) },
            { label: "Data de Término", value: formatDate(project.end_date) },
            { label: "Criado em", value: formatDateTime(project.created_at) },
            { label: "Última Atualização", value: formatDateTime(project.updated_at) },
          ].map((item, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="text-sm text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">📝 Resumo</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.summary || "Sem resumo"}</p>
      </div>

      {/* Público-Alvo */}
      {project.target_audience && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">🎯 Público-Alvo</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{project.target_audience}</p>
        </div>
      )}

      {/* Autores */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">👥 Autores/Colaboradores</h3>
        {(project.authors || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum autor cadastrado</p>
        ) : (
          <div className="space-y-3">
            {project.authors.map((author: any, i: number) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="text-base font-semibold text-foreground mb-2">
                  {author.is_main && "⭐ "}{author.name}
                </div>
                <div className="text-[13px] text-muted-foreground space-y-1">
                  <div>📧 CPF: {author.cpf || "—"}</div>
                  <div>🏛️ {author.institution || "—"}</div>
                  <div>🎓 {author.academic_level || "—"} • {author.role || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arquivos Anexados */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">📎 Arquivos Anexados</h3>

        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" /> Fotos
        </h4>
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">Nenhuma foto anexada</p>
        ) : (
          <div className="space-y-2 mb-4">
            {photos.map((file: any) => (
              <div key={file.id} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-3">
                <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                  <Image className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{file.original_name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)}</div>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Download</button>
              </div>
            ))}
          </div>
        )}

        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Documentos PDF
        </h4>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento anexado</p>
        ) : (
          <div className="space-y-2">
            {documents.map((file: any) => (
              <div key={file.id} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-3">
                <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{file.original_name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)} • PDF</div>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Download</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links Externos */}
      {(project.links || []).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">🔗 Links Externos</h3>
          <div className="space-y-2">
            {project.links.map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-3">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{link.title || link.url}</div>
                  <div className="text-xs text-muted-foreground">{link.link_type}{link.description ? ` • ${link.description}` : ""}</div>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">Abrir</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Versões */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">📜 Histórico de Versões</h3>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma versão registrada</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v: any, i: number) => (
              <div key={i} className="bg-muted/50 border-l-[3px] border-l-blue-400 rounded-r-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold text-primary text-sm">Versão #{v.version_number}</span>
                    <span className="text-muted-foreground ml-3 text-sm">{v.change_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(v.created_at)}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-1">{v.description}</div>
                <div className="text-xs text-muted-foreground">Por: {v.author_name || "Sistema"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comentários */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">💬 Comentários</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum comentário</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c: any, i: number) => (
              <div key={i} className={`bg-muted/50 border-l-[3px] rounded-r-lg p-3 ${c.is_admin_comment ? "border-l-red-500" : "border-l-blue-400"}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{c.author_name}</span>
                    {c.is_admin_comment && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-semibold">Admin</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">{c.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectDetailView;
