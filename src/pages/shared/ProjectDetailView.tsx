import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Image, ExternalLink, CheckCircle, XCircle, Clock, AlertTriangle, Download, Eye, X, Edit3, Users, RotateCcw, Bell, Send } from "lucide-react";
import { formatDateBrasilia, formatDateTimeBrasilia } from "@/lib/formatters";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";

import { useToast } from "@/hooks/use-toast";
import { useDemoData } from "@/hooks/useDemoData";
import { usePolling } from "@/hooks/usePolling";

interface ProjectDetailViewProps {
  isAdmin?: boolean;
}

const ProjectDetailView = ({ isAdmin: isAdminProp }: ProjectDetailViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const { toast } = useToast();
  const demo = useDemoData();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const isAdmin = isAdminProp ?? user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    if (demo.isDemoMode) {
      setProject(demo.getProjectById(Number(projectId)));
      setLoading(false);
      return;
    }
    try {
      const data = await api.getProject(Number(projectId));
      setProject(data);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, demo.isDemoMode]);

  // Initial load
  useEffect(() => { loadProject(); }, [projectId]);

  // Poll for updates every 20s
  usePolling(loadProject, 20000, !demo.isDemoMode && !!projectId);

  const formatDate = (d: string) => formatDateBrasilia(d);
  const formatDateTime = (d: string) => formatDateTimeBrasilia(d);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleApprove = async () => {
    if (!project) return;
    setActionLoading(true);
    try {
      await api.approveProject(project.id, reviewComment || undefined);
      setProject({ ...project, status: "aprovado" });
      toast({ title: "Sucesso", description: "Projeto aprovado com sucesso!" });
      setReviewComment("");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!project) return;
    if (!reviewComment.trim()) {
      toast({ title: "Atencao", description: "Informe o motivo da rejeicao.", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await api.rejectProject(project.id, reviewComment);
      setProject({ ...project, status: "rejeitado", review_comment: reviewComment });
      toast({ title: "Sucesso", description: "Projeto rejeitado." });
      setReviewComment("");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!project) return;
    if (!reviewComment.trim()) {
      toast({ title: "Atencao", description: "Informe o motivo da devolução.", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await api.returnProject(project.id, reviewComment);
      setProject({ ...project, status: "devolvido", review_comment: reviewComment });
      toast({ title: "Sucesso", description: "Projeto devolvido para correções." });
      setReviewComment("");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorApprove = async () => {
    if (!project) return;
    const author = project.authors?.find((a: any) => a.cpf?.replace(/\D/g, '') === user?.cpf?.replace(/\D/g, ''));
    if (!author) return;

    setActionLoading(true);
    try {
      await api.approveAuthorParticipation(author.id);
      toast({ title: "Sucesso", description: "Sua participação foi aprovada!" });
      // Reload project to update status
      const data = await api.getProject(project.id);
      setProject(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAuthorReject = async () => {
    if (!project || !rejectReason.trim()) {
      toast({ title: "Atenção", description: "Informe o motivo da rejeição.", variant: "destructive" });
      return;
    }
    const author = project.authors?.find((a: any) => a.cpf?.replace(/\D/g, '') === user?.cpf?.replace(/\D/g, ''));
    if (!author) return;

    setActionLoading(true);
    try {
      await api.rejectAuthorParticipation(author.id, rejectReason.trim());
      toast({ title: "Sucesso", description: "Sua participação foi rejeitada." });
      setRejectReason("");
      setShowRejectInput(false);
      // Reload project to update status
      const data = await api.getProject(project.id);
      setProject(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
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
        <div className="text-center py-12 text-muted-foreground">Projeto nao encontrado</div>
      </AppLayout>
    );
  }

  const photos = (project.files || []).filter((f: any) => f.file_category === "photo");
  const documents = (project.files || []).filter((f: any) => f.file_category === "pdf");
  const statusColor = statusColors[project.status as keyof typeof statusColors] || "bg-muted text-muted-foreground";
  const statusLabel = project.status === 'aguardando_autores' ? 'Aguardando Colaboradores' : (statusLabels[project.status as keyof typeof statusLabels] || project.status);
  const versions = project.versions || [];
  const comments = project.comments || [];
  
  const currentUserAuthor = project.authors?.find((a: any) => {
    const authorCpf = a.cpf?.replace(/\D/g, '');
    const userCpf = user?.cpf?.replace(/\D/g, '');
    return authorCpf === userCpf && a.approval_status === 'pendente' && !a.is_owner;
  });

  const statusIcon = {
    aprovado: <CheckCircle className="w-5 h-5" />,
    rejeitado: <XCircle className="w-5 h-5" />,
    pendente: <Clock className="w-5 h-5" />,
    em_revisao: <AlertTriangle className="w-5 h-5" />,
    aguardando_autores: <Clock className="w-5 h-5" />,
    devolvido: <AlertTriangle className="w-5 h-5" />,
    aguardando_colaboradores: <Clock className="w-5 h-5" />,
  }[project.status] || <Clock className="w-5 h-5" />;

  return (
    <AppLayout pageName="Detalhes do Projeto" navItems={navItems}>
      {/* Back button */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        {(project.status === "rascunho" || project.status === "devolvido") && project.owner_id === user?.id && (
          <button 
            onClick={() => {
              const basePath = user?.role === "bolsista" ? "/bolsista" : "/pesquisador";
              const route = project.status === "rascunho" ? `${basePath}/submissao?edit=${project.id}` : `${basePath}/editar?edit=${project.id}`;
              navigate(route);
            }} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Edit3 className="w-4 h-4" /> {project.status === "rascunho" ? "Editar Rascunho" : "Editar e Reenviar"}
          </button>
        )}
      </div>

      {/* Project Header */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-3">{project.title}</h1>
            <div className="flex gap-4 flex-wrap text-sm opacity-80">
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {project.category || "—"}</span>
              <span>{project.academic_level || "—"}</span>
              <span>{project.owner_name || project.owner?.name || "—"}</span>
              <span>{formatDate(project.created_at)}</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusColor}`}>
            {statusIcon} {statusLabel}
          </div>
        </div>
      </div>

      {/* Admin Actions - only for pendente/em_revisao (NOT aguardando_autores) */}
      {isAdmin && (project.status === "pendente" || project.status === "em_revisao") && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-primary mb-4">Ações do Administrador</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Comentário de revisão (obrigatório para rejeição)</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Escreva um comentário sobre sua decisão..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Aprovar Projeto
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Rejeitar Projeto
            </button>
            <button
              onClick={handleReturn}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> Devolver para Correções
            </button>
          </div>
        </div>
      )}

      {/* Admin - Aguardando Colaboradores Panel */}
      {isAdmin && project.status === "aguardando_autores" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" /> Aguardando Aprovação dos Colaboradores
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este projeto não pode ser avaliado ainda. É necessário que todos os colaboradores aprovem sua participação antes da análise administrativa.
          </p>

          {/* Authors status list */}
          <div className="space-y-2 mb-4">
            {(project.authors || []).filter((a: any) => !a.is_owner).map((author: any, i: number) => {
              const isPending = author.approval_status === "pendente";
              const isApproved = author.approval_status === "aprovado";
              const isRejected = author.approval_status === "rejeitado";
              return (
                <div key={i} className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isApproved ? "bg-cebio-green-bg text-primary" : isRejected ? "bg-cebio-red-bg text-cebio-red" : "bg-cebio-yellow-bg text-cebio-yellow"
                    }`}>
                      {isApproved ? <CheckCircle className="w-4 h-4" /> : isRejected ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{author.name}</div>
                      <div className="text-xs text-muted-foreground">{author.email || author.cpf || "—"} • {author.role_in_project || author.role || "Colaborador"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      isApproved ? "bg-cebio-green-bg text-primary" : isRejected ? "bg-cebio-red-bg text-cebio-red" : "bg-cebio-yellow-bg text-cebio-yellow"
                    }`}>
                      {isApproved ? "Aprovado" : isRejected ? "Rejeitado" : "Pendente"}
                    </span>
                    {isPending && (
                      <button
                        onClick={async () => {
                          if (demo.isDemoMode) {
                            toast({ title: "Notificação enviada!", description: `Lembrete enviado para ${author.name}.` });
                            return;
                          }
                          try {
                            await api.sendNotification({
                              user_id: author.user_id || author.id,
                              title: "Sua confirmação é necessária",
                              message: `Você foi adicionado como colaborador no projeto "${project.title}". Acesse o sistema para revisar e confirmar sua participação.`,
                              type: "warning",
                            });
                            toast({ title: "Notificação enviada!", description: `Lembrete enviado para ${author.name}.` });
                          } catch (err: any) {
                            toast({ title: "Erro", description: err.message || "Não foi possível enviar a notificação.", variant: "destructive" });
                          }
                        }}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-200 transition-colors disabled:opacity-50"
                      >
                        <Bell className="w-3.5 h-3.5" /> Notificar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {(() => {
            const nonOwners = (project.authors || []).filter((a: any) => !a.is_owner);
            const pendingCount = nonOwners.filter((a: any) => a.approval_status === "pendente").length;
            const approvedCount = nonOwners.filter((a: any) => a.approval_status === "aprovado").length;
            const rejectedCount = nonOwners.filter((a: any) => a.approval_status === "rejeitado").length;
            return (
              <div className="flex items-center gap-4 text-xs text-muted-foreground bg-card border border-border rounded-lg p-3">
                <span className="font-medium">Resumo:</span>
                <span className="text-primary font-semibold">{approvedCount} aprovado(s)</span>
                <span className="text-cebio-yellow font-semibold">{pendingCount} pendente(s)</span>
                {rejectedCount > 0 && <span className="text-cebio-red font-semibold">{rejectedCount} rejeitado(s)</span>}
              </div>
            );
          })()}
        </div>
      )}

      {/* Colaborador Actions */}
      {currentUserAuthor && (
        <div className="bg-cebio-yellow-bg border border-cebio-yellow/30 rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-cebio-yellow mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" /> Sua Confirmação é Necessária
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Você foi adicionado como <strong>{currentUserAuthor.role_in_project || currentUserAuthor.role || "colaborador"}</strong> neste projeto. 
            Por favor, revise as informações acima e confirme sua participação.
          </p>
          
          {showRejectInput ? (
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-semibold">Motivo da rejeição <span className="text-destructive">*</span></label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique por que você não deseja participar deste projeto..."
                rows={3}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background resize-y"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold bg-muted hover:bg-muted/80">
                  Cancelar
                </button>
                <button onClick={handleAuthorReject} disabled={actionLoading || !rejectReason.trim()} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Confirmar Rejeição
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleAuthorApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Aprovar Participação
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 border border-destructive text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Rejeitar Participação
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info Grid */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-4">Informacoes do Projeto</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "ID", value: `#${project.id}` },
            { label: "Status", value: statusLabel },
            { label: "Categoria", value: project.category || "—" },
            { label: "Nivel Academico", value: project.academic_level || "—" },
            { label: "Data de Inicio", value: formatDate(project.start_date) },
            { label: "Data de Termino", value: formatDate(project.end_date) },
            { label: "Criado em", value: formatDateTime(project.created_at) },
            { label: "Ultima Atualizacao", value: formatDateTime(project.updated_at) },
          ].map((item, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="text-sm font-medium text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      {project.keywords && project.keywords.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-primary mb-3">Palavras-chave</h3>
          <div className="flex gap-2 flex-wrap">
            {project.keywords.map((kw: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-3">Resumo</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{project.summary || "Sem resumo"}</p>
      </div>

      {/* Description */}
      {project.description && project.description !== project.summary && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-primary mb-3">Descricao Completa</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* Rejection Reason */}
      {project.status === "rejeitado" && (project.rejection_reason || project.review_comment) && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-destructive mb-3">Motivo da Rejeicao</h3>
          <p className="text-sm text-destructive/80 leading-relaxed">{project.rejection_reason || project.review_comment}</p>
        </div>
      )}

      {/* Authors */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-4">Autores/Colaboradores</h3>
        {(project.authors || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum autor cadastrado</p>
        ) : (
          <div className="space-y-3">
            {project.authors.map((author: any, i: number) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-foreground">
                    {author.is_main && <span className="text-primary mr-1">[Principal]</span>}{author.name}
                  </div>
                  {author.approval_status && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      author.approval_status === "aprovado" ? "bg-cebio-green-bg text-primary" :
                      author.approval_status === "rejeitado" ? "bg-cebio-red-bg text-cebio-red" :
                      "bg-cebio-yellow-bg text-cebio-yellow"
                    }`}>
                      {author.approval_status === "aprovado" ? "Aprovado" : author.approval_status === "rejeitado" ? "Rejeitado" : "Pendente"}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-muted-foreground space-y-0.5">
                  {author.cpf && <div>CPF: {author.cpf}</div>}
                  {author.institution && <div>Instituicao: {author.institution}</div>}
                  <div>{author.academic_level || "—"} - {author.role_in_project || author.role || "—"}</div>
                  {author.approval_status === "rejeitado" && author.rejection_reason && (
                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-xs italic">
                      Motivo da rejeicao: {author.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-4">Arquivos Anexados</h3>
        {photos.length === 0 && documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum arquivo anexado</p>
        ) : (
          <>
            {photos.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Fotos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {photos.map((file: any, i: number) => (
                    <div key={i} className="bg-muted/50 border border-border rounded-lg overflow-hidden group">
                      <div className="relative aspect-square bg-muted">
                        <img
                          src={`/api/projects/${project.id}/files/${file.id}/download`}
                          alt={file.original_name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setPreviewImage(`/api/projects/${project.id}/files/${file.id}/download`)}
                            className="p-2 bg-white/90 rounded-full mr-2"
                          >
                            <Eye className="w-4 h-4 text-foreground" />
                          </button>
                          <a href={`/api/projects/${project.id}/files/${file.id}/download`} download className="p-2 bg-white/90 rounded-full">
                            <Download className="w-4 h-4 text-foreground" />
                          </a>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="text-xs text-foreground truncate">{file.original_name}</div>
                        <div className="text-[10px] text-muted-foreground">{formatFileSize(file.file_size || 0)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {documents.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Documentos</h4>
                <div className="space-y-2">
                  {documents.map((file: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-3">
                      <div className="w-10 h-10 bg-cebio-red-bg rounded flex items-center justify-center"><FileText className="w-5 h-5 text-cebio-red" /></div>
                      <div className="flex-1">
                        <div className="text-sm text-foreground">{file.original_name}</div>
                        <div className="text-xs text-muted-foreground">{formatFileSize(file.file_size || 0)}</div>
                      </div>
                      <a href={`/api/projects/${project.id}/files/${file.id}/download`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-muted border border-border text-foreground rounded text-xs font-medium hover:bg-accent transition-colors flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </a>
                      <a href={`/api/projects/${project.id}/files/${file.id}/download`} download className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-secondary transition-colors flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Links */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-4">Links Externos</h3>
        {(project.links || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum link adicionado</p>
        ) : (
          <div className="space-y-2">
            {project.links.map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-3">
                <div className="w-10 h-10 bg-cebio-blue-bg rounded flex items-center justify-center"><ExternalLink className="w-5 h-5 text-cebio-blue" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-semibold text-primary hover:underline truncate"
                    >
                      {link.title || "Link sem título"}
                    </a>
                    <span className="text-[11px] text-muted-foreground truncate">
                      ({link.url})
                    </span>
                  </div>
                  {link.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 italic">
                      {link.description}
                    </div>
                  )}
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mt-1">
                    Tipo: {link.link_type || link.type || "outro"}
                  </div>
                </div>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-secondary transition-colors shrink-0"
                >
                  Abrir
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Version History */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <h3 className="text-base font-semibold text-primary mb-4">Historico de Versoes</h3>
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma versao registrada</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v: any, i: number) => (
              <div key={i} className="bg-muted/50 border-l-[3px] border-l-primary rounded-r-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-primary text-sm">Versao #{v.version_number} - {v.change_type || v.field_changed || "Atualizacao"}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(v.created_at)}</span>
                </div>
                <div className="text-sm text-muted-foreground">{v.description || v.new_value || "—"}</div>
                <div className="text-xs text-muted-foreground mt-1">Por: {v.author_name || "Sistema"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-primary mb-4">Comentarios</h3>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum comentario</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c: any, i: number) => (
              <div key={i} className={`bg-muted/50 border-l-[3px] rounded-r-lg p-3 ${c.is_admin_comment ? "border-l-destructive" : "border-l-primary"}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{c.author_name || c.user_name || "Usuario"}</span>
                    {c.is_admin_comment && <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-[10px] font-semibold">Admin</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>
                </div>
                <div className="text-sm text-muted-foreground">{c.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <a href={previewImage} download className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-secondary transition-colors" onClick={(e) => e.stopPropagation()}>
            <Download className="w-4 h-4" /> Baixar
          </a>
        </div>
      )}
    </AppLayout>
  );
};

export default ProjectDetailView;
