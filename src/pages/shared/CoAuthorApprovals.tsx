import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, User, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface PendingApproval {
  id: number;
  project_id: number;
  name: string;
  cpf: string;
  role_in_project: string;
  approval_status: string;
  project: {
    id: number;
    title: string;
    category: string;
    created_at: string;
    owner: { name: string; email: string };
  };
}

const CoAuthorApprovals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const isPesquisador = user?.role === "pesquisador";
  const navItems = isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  const fetchApprovals = async () => {
    try {
      const data = await api.getPendingAuthorApprovals();
      setApprovals(data || []);
    } catch {
      // Mock data when backend is offline
      setApprovals([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchApprovals(); }, []);

  const handleApprove = async (id: number) => {
    setProcessing(true);
    try {
      await api.approveAuthorParticipation(id);
      toast({ title: "Participação aprovada!", description: "Você foi confirmado como coautor." });
      setApprovals(prev => prev.filter(a => a.id !== id));
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
      setApprovals(prev => prev.filter(a => a.id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  return (
    <AppLayout pageName="Aprovações de Coautoria" navItems={navItems} notificationCount={approvals.length}>
      <div className="max-w-[800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-primary-foreground">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" /> Aprovações de Coautoria
          </h2>
          <p className="text-sm opacity-90 mt-1">
            Projetos onde você foi adicionado como coautor e precisa aprovar sua participação
          </p>
          <div className="mt-3 bg-primary-foreground/20 rounded-lg px-4 py-2 inline-block">
            <span className="text-sm font-semibold">{approvals.length} pendente(s)</span>
          </div>
        </div>

        {/* Lista de Aprovações */}
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma aprovação pendente</p>
            <p className="text-xs text-muted-foreground mt-1">Quando alguém te adicionar como coautor, aparecerá aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Card Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        {approval.project?.title || `Projeto #${approval.project_id}`}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submetido por <strong>{approval.project?.owner?.name || "—"}</strong>
                        {" • "}{approval.project?.category || "—"}
                        {" • "}{approval.project?.created_at ? new Date(approval.project.created_at).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cebio-yellow-bg text-cebio-yellow flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Aguardando
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">
                    Você foi adicionado como <strong>{approval.role_in_project || "Coautor"}</strong> neste projeto.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O projeto só será enviado para revisão do administrador quando todos os coautores aprovarem.
                  </p>
                </div>

                {/* Actions */}
                <div className="p-5 border-t border-border">
                  {rejectingId === approval.id ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold">Motivo da rejeição <span className="text-destructive">*</span></label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Explique por que você não deseja participar como coautor deste projeto..."
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background resize-y"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(""); }}
                          className="px-4 py-2 border border-border rounded-lg text-sm font-semibold bg-muted hover:bg-muted/80"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          disabled={processing || !rejectReason.trim()}
                          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Confirmar Rejeição
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setRejectingId(approval.id)}
                        disabled={processing}
                        className="px-5 py-2.5 border border-destructive text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/10 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Rejeitar
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={processing}
                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprovar Participação
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CoAuthorApprovals;
