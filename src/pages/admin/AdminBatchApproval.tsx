import { useState, useEffect } from "react";
import { CheckCircle, Clock, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminBatchApproval = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingProjects();
      setProjects(data.projects || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = (checked: boolean) => setSelectedIds(checked ? projects.map(p => p.id) : []);

  const approveSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.batchApprove(selectedIds);
      toast({ title: "Sucesso", description: `${selectedIds.length} projeto(s) aprovado(s)!` });
      setSelectedIds([]);
      fetchPending();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  return (
    <AppLayout pageName="Aprovação em Lote" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Aprovação de Projetos em Lote</h2>
        <p className="text-sm opacity-90">Avalie e aprove projetos que estão aguardando revisão</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Pendentes</div><div className="text-[32px] font-bold text-foreground">{projects.length}</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-yellow-bg flex items-center justify-center"><Clock className="w-5 h-5 text-cebio-yellow" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Selecionados</div><div className="text-[32px] font-bold text-foreground">{selectedIds.length}</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-blue-bg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-cebio-blue" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Aprovados Hoje</div><div className="text-[32px] font-bold text-foreground">0</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-green-bg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden mb-6">
        <div className="p-5 pb-0 flex justify-between items-center">
          <h3 className="text-base font-semibold">Projetos Pendentes de Aprovação</h3>
          <span className="text-xs text-muted-foreground">{projects.length} projeto(s)</span>
        </div>
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <input type="checkbox" checked={selectedIds.length === projects.length && projects.length > 0} onChange={(e) => toggleAll(e.target.checked)} className="w-[18px] h-[18px] accent-primary" />
          <label className="text-sm font-semibold">Selecionar Tudo</label>
        </div>
        <div className="p-5 space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h4 className="font-semibold">Nenhum projeto para avaliar</h4>
              <p className="text-sm mt-1">Todos os projetos já foram avaliados.</p>
            </div>
          ) : projects.map((p: any) => (
            <div key={p.id} className={`flex items-start gap-3 p-4 border-2 border-dashed rounded-xl transition-all ${selectedIds.includes(p.id) ? "border-primary bg-primary/5" : "border-border"}`}>
              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="w-[18px] h-[18px] accent-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-base font-semibold text-primary mb-1">{p.title}</h4>
                <div className="flex gap-2.5 text-xs text-muted-foreground mb-2">
                  <span>{p.owner?.name || "—"}</span>
                  <span>{p.category || "—"}</span>
                  <span>{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="text-[13px] text-muted-foreground">{p.summary || "Sem resumo"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={approveSelected} disabled={selectedIds.length === 0} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50">
          Aprovar Selecionados ({selectedIds.length})
        </button>
        <button onClick={fetchPending} className="px-6 py-3 border border-border rounded-lg text-sm font-medium bg-muted">Atualizar</button>
      </div>
    </AppLayout>
  );
};

export default AdminBatchApproval;
