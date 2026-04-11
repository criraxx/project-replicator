import { useState, useEffect } from "react";
import { Bell, Users, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AdminMassNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await api.listUsers();
        setTotalUsers(users.length);
      } catch { /* silent */ }
    };
    fetchStats();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Erro", description: "Preencha assunto e mensagem.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await api.broadcastNotification({ title, message, type: targetRole === "all" ? undefined : targetRole });
      toast({ title: "Sucesso", description: "Notificação enviada com sucesso!" });
      setTitle("");
      setMessage("");
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
    setSending(false);
  };

  return (
    <AppLayout pageName="Notificação em Massa" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Total de Usuários</div><div className="text-[32px] font-bold text-foreground">{totalUsers}</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-yellow-bg flex items-center justify-center"><Users className="w-5 h-5 text-cebio-yellow" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
          <div><div className="text-[13px] text-muted-foreground mb-1">Última Notificação</div><div className="text-2xl font-bold text-foreground">--/--/----</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-green-bg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
        </div>
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start" style={{ background: "hsl(var(--cebio-green-bg))" }}>
          <div><div className="text-[13px] text-muted-foreground mb-1">Status do Sistema</div><div className="text-lg font-bold text-foreground">Pronto para envio</div></div>
          <div className="w-11 h-11 rounded-full bg-cebio-green-bg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary" /></div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <h3 className="text-base font-semibold mb-4">Enviar Nova Notificação em Massa</h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Selecione os Grupos:</label>
          <div className="flex gap-4 flex-wrap">
            {[
              { value: "pesquisador", label: "Pesquisadores" },
              { value: "bolsista", label: "Bolsistas" },
              { value: "admin", label: "Admin" },
              { value: "all", label: "Todos" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="role" value={opt.value} checked={targetRole === opt.value} onChange={(e) => setTargetRole(e.target.value)} className="accent-primary" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Assunto:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Digite o assunto da notificação" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Mensagem:</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Digite a mensagem que será enviada aos usuários selecionados" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card resize-y" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSend} disabled={sending} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-50">
          {sending ? "Enviando..." : "Enviar Notificação"}
        </button>
        <button onClick={() => { setTitle(""); setMessage(""); }} className="px-6 py-3 border border-border rounded-lg text-sm font-medium bg-muted">Cancelar</button>
      </div>
    </AppLayout>
  );
};

export default AdminMassNotification;
