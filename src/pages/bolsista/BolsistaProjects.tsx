import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, CheckCircle, XCircle, Clock, FileText, Users } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { BOLSISTA_NAV } from "@/constants/navigation";
import { statusColors, statusLabels } from "@/constants/ui";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatDateBrasilia } from "@/lib/formatters";
import { useDemoData } from "@/hooks/useDemoData";
import { usePolling } from "@/hooks/usePolling";

const BolsistaProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const demo = useDemoData();

  const fetchData = useCallback(async () => {
    if (demo.isDemoMode) {
      setProjects(demo.getProjects(true) || []);
      setPendingApprovals([]);
      setLoading(false);
      return;
    }
    try {
      const [projData, approvals] = await Promise.allSettled([
        api.listProjects({}),
        api.getPendingAuthorApprovals(),
      ]);
      setProjects(projData.status === "fulfilled" ? projData.value.projects || [] : []);
      setPendingApprovals(approvals.status === "fulfilled" ? approvals.value || [] : []);
    } catch { /* silent */ }
    setLoading(false);
  }, [demo.isDemoMode]);

  usePolling(fetchData, 30000, !demo.isDemoMode);

  const handleApprove = async (id: number) => {
    setProcessing(true);
    try {
      await api.approveAuthorParticipation(id);
      toast({ title: "Participação aprovada!", description: "Você foi confirmado como coautor. O projeto aparecerá na sua lista." });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      toast({ title: "Motivo obrigatório", description: "Informe o motivo da rejeição.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      await api.rejectAuthorParticipation(id, rejectReason.trim());
      toast({ title: "Participação rejeitada", description: "O dono do projeto foi notificado." });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  return (
    <AppLayout pageName="Meus Projetos" navItems={BOLSISTA_NAV} notificationCount={pendingApprovals.length}>
      <div className="space-y-6">
        {/* Pending co-author approvals banner */}
        {pendingApprovals.length > 0 && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-5 pb-0">
              <div className="w-9 h-9 rounded-lg bg-cebio-yellow-bg flex items-center justify-center">
                <Users className="w-5 h-5 text-cebio-yellow" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Aprovar Projetos</h3>
                <p className="text-xs text-muted-foreground">Você foi adicionado como coautor nos projetos abaixo. Aprove ou rejeite sua participação.</p>
              </div>
              <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full bg-cebio-yellow-bg text-cebio-yellow">
                {pendingApprovals.length} pendente(s)
              </span>
            </div>
            <div className="p-5 pt-4 space-y-3">
              {pendingApprovals.map((approval: any) => (
                <div key={approval.id} className="border border-border rounded-lg overflow-hidden">
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <h4 
                        className="font-semibold text-foreground flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"
                        onClick={() => navigate(`/projeto?id=${approval.project_id}`)}
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        {approval.project?.title || `Projeto #${approval.project_id}`}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por <strong>{approval.project?.owner?.name || "—"}</strong>
                        {" • "}{approval.role_in_project || "Coautor"}
                        {" • "}{approval.project?.created_at ? formatDateBrasilia(approval.project.created_at) : ""}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cebio-yellow-bg text-cebio-yellow flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Aguardando
                    </span>
                  </div>

                  {rejectingId === approval.id ? (
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      <label className="block text-sm font-semibold">Motivo da rejeição <span className="text-destructive">*</span></label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Explique por que você não deseja participar como coautor..."
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background resize-y"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="px-4 py-2 border border-border rounded-lg text-sm font-semibold bg-muted hover:bg-muted/80">
                          Cancelar
                        </button>
                        <button onClick={() => handleReject(approval.id)} disabled={processing || !rejectReason.trim()} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2">
                          <XCircle className="w-4 h-4" /> Confirmar Rejeição
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-4 flex gap-2 justify-end">
                      <button onClick={() => setRejectingId(approval.id)} disabled={processing} className="px-4 py-2 border border-destructive text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/10 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Rejeitar
                      </button>
                      <button onClick={() => handleApprove(approval.id)} disabled={processing} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Aprovar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Projects */}
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
                <p className="text-xs mt-1">Comece criando uma nova submissão!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p: any) => (
                  <div key={p.id} onClick={() => navigate(`/projeto?id=${p.id}`)} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.category || "—"} • {p.academic_level || "—"} • {formatDateBrasilia(p.created_at)}</div>
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
      </div>
    </AppLayout>
  );
};

export default BolsistaProjects;
