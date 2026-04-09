import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";

interface FormData {
  title: string;
  category: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: string;
}

const emptyForm: FormData = {
  title: "", category: "", description: "",
  start_date: "", end_date: "", budget: "",
};

const SubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV.slice(0, 2) : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await api.listCategories();
        setCategories(cats);
      } catch { /* fallback silently */ }
    };
    fetchData();
  }, []);

  const updateField = (field: keyof FormData, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.description) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await api.createProject({
        title: form.title,
        summary: form.description,
        category: form.category,
        academic_level: "graduacao",
        description: form.description,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });
      toast({ title: "Projeto enviado com sucesso!", description: "Seu projeto foi enviado para análise." });
      const basePath = isAdmin ? "/admin" : isPesquisador ? "/pesquisador" : "/bolsista";
      setTimeout(() => navigate(`${basePath}/projetos`), 1500);
    } catch (err: any) {
      toast({ title: "Erro ao enviar projeto", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "info", label: "Informações" },
    { id: "arquivos", label: "Arquivos" },
    { id: "revisao", label: "Revisão" },
  ];

  return (
    <AppLayout pageName="Nova Submissão" navItems={navItems} notificationCount={0}>
      {/* Tab navigation */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Criar Nova Submissão de Projeto</h2>
        <p className="text-sm opacity-90">Preencha os dados do projeto e envie para análise</p>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Informações do Projeto</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block mb-2 font-semibold text-sm text-foreground">Título do Projeto *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              placeholder="Digite o título do projeto"
              className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block mb-2 font-semibold text-sm text-foreground">Categoria *</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              required
              className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors"
            >
              <option value="">Selecione uma categoria</option>
              {categories.length > 0
                ? categories.filter(c => c.is_active).map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))
                : <>
                    <option value="pesquisa">Pesquisa</option>
                    <option value="desenvolvimento">Desenvolvimento</option>
                    <option value="inovacao">Inovação</option>
                    <option value="extensao">Extensão</option>
                  </>
              }
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block mb-2 font-semibold text-sm text-foreground">Descrição *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
              placeholder="Descreva o projeto em detalhes"
              rows={6}
              className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors resize-y"
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-sm text-foreground">Data de Início *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => updateField("start_date", e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-sm text-foreground">Data de Término *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => updateField("end_date", e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors"
              />
            </div>
          </div>

          {/* Orçamento */}
          <div>
            <label className="block mb-2 font-semibold text-sm text-foreground">Orçamento (R$)</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => updateField("budget", e.target.value)}
              placeholder="0,00"
              step="0.01"
              className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background transition-colors"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-[15px] font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Enviando..." : "Enviar Submissão"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-muted text-foreground px-8 py-3 rounded-lg text-[15px] font-semibold border border-border hover:bg-muted/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmissionForm;
