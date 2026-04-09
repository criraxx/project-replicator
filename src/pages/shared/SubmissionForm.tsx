import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { mockCategories, mockAcademicLevels } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin
    ? [{ label: "Dashboard", path: "/admin/dashboard" }, { label: "Projetos", path: "/admin/projetos" }]
    : isPesquisador
    ? [{ label: "Dashboard", path: "/pesquisador/dashboard" }, { label: "Meus Projetos", path: "/pesquisador/projetos" }, { label: "Nova Submissão", path: "/pesquisador/submissao" }, { label: "Histórico", path: "/pesquisador/historico" }]
    : [{ label: "Dashboard", path: "/bolsista/dashboard" }, { label: "Meus Projetos", path: "/bolsista/projetos" }, { label: "Nova Submissão", path: "/bolsista/submissao" }, { label: "Histórico", path: "/bolsista/historico" }];

  const [form, setForm] = useState({
    title: "", summary: "", description: "", category: "", academic_level: "", start_date: "", end_date: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Projeto submetido!", description: "Seu projeto foi enviado para análise." });
    const basePath = isAdmin ? "/admin" : isPesquisador ? "/pesquisador" : "/bolsista";
    navigate(`${basePath}/projetos`);
  };

  return (
    <AppLayout pageName="Nova Submissão" navItems={navItems} notificationCount={1}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Criar Nova Submissão de Projeto</h2>
        <p className="text-sm opacity-90">Preencha os dados do projeto e envie para análise</p>
      </div>

      <div className="max-w-[800px] mx-auto">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Título do Projeto *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Digite o título do projeto" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Categoria *</label>
              <select name="category" value={form.category} onChange={handleChange} required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card">
                <option value="">Selecione uma categoria</option>
                {mockCategories.filter((c) => c.is_active).map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nível Acadêmico *</label>
              <select name="academic_level" value={form.academic_level} onChange={handleChange} required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card">
                <option value="">Selecione o nível</option>
                {mockAcademicLevels.filter((l) => l.is_active).map((l) => (<option key={l.id} value={l.slug}>{l.name}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Início</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Término</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Resumo *</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} required rows={3} placeholder="Resumo breve do projeto (máx. 500 caracteres)" maxLength={500} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-none" />
            <div className="text-xs text-muted-foreground text-right mt-1">{form.summary.length}/500</div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Descrição Completa</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} placeholder="Descrição detalhada do projeto, metodologia, objetivos..." className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary transition-colors">
              <Send className="w-4 h-4" /> Submeter Projeto
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmissionForm;
