import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ChevronLeft, ChevronRight, Check, Plus, Trash2, Link as LinkIcon, Upload } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";

const STEPS = [
  "Informações Básicas",
  "Descrição e Detalhes",
  "Autores e Colaboradores",
  "Financiamento",
  "Arquivos e Links",
  "Revisão e Submissão",
];

interface FormData {
  title: string;
  summary: string;
  description: string;
  category: string;
  academic_level: string;
  start_date: string;
  end_date: string;
  institution: string;
  keywords: string[];
  authors: { name: string; email: string; institution: string; role: string }[];
  funding_agency: string;
  funding_value: string;
  links: { title: string; url: string }[];
}

const emptyForm: FormData = {
  title: "", summary: "", description: "", category: "", academic_level: "",
  start_date: "", end_date: "", institution: "", keywords: [],
  authors: [], funding_agency: "", funding_value: "", links: [],
};

const SubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [categories, setCategories] = useState<any[]>([]);
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV.slice(0, 2) : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, levels] = await Promise.all([api.listCategories(), api.listAcademicLevels()]);
        setCategories(cats);
        setAcademicLevels(levels);
      } catch { /* fallback silently */ }
    };
    fetchData();
  }, []);

  const updateField = (field: keyof FormData, value: any) => setForm({ ...form, [field]: value });

  const addKeyword = () => {
    if (keywordInput.trim() && form.keywords.length < 10) {
      updateField("keywords", [...form.keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (i: number) => updateField("keywords", form.keywords.filter((_, idx) => idx !== i));

  const addAuthor = () => updateField("authors", [...form.authors, { name: "", email: "", institution: "", role: "Coautor" }]);
  const removeAuthor = (i: number) => updateField("authors", form.authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, field: string, value: string) => {
    const updated = [...form.authors];
    (updated[i] as any)[field] = value;
    updateField("authors", updated);
  };

  const addLink = () => updateField("links", [...form.links, { title: "", url: "" }]);
  const removeLink = (i: number) => updateField("links", form.links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: string, value: string) => {
    const updated = [...form.links];
    (updated[i] as any)[field] = value;
    updateField("links", updated);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!form.title || !form.category || !form.academic_level) {
          toast({ title: "Campos obrigatórios", description: "Preencha título, categoria e nível acadêmico.", variant: "destructive" });
          return false;
        }
        return true;
      case 1:
        if (!form.summary) {
          toast({ title: "Campo obrigatório", description: "Preencha o resumo do projeto.", variant: "destructive" });
          return false;
        }
        if (form.end_date && form.start_date && form.end_date < form.start_date) {
          toast({ title: "Data inválida", description: "A data de término deve ser posterior à data de início.", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => { if (validateStep()) setStep(Math.min(step + 1, 5)); };
  const prevStep = () => setStep(Math.max(step - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.createProject({
        title: form.title,
        summary: form.summary,
        description: form.description,
        category: form.category,
        academic_level: form.academic_level,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });
      toast({ title: "Projeto submetido!", description: "Seu projeto foi enviado para análise." });
      const basePath = isAdmin ? "/admin" : isPesquisador ? "/pesquisador" : "/bolsista";
      navigate(`${basePath}/projetos`);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Título do Projeto *</label>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required maxLength={200} placeholder="Digite o título do projeto (máx. 200 caracteres)" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
              <div className="text-xs text-muted-foreground text-right mt-1">{form.title.length}/200</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Categoria *</label>
                <select value={form.category} onChange={(e) => updateField("category", e.target.value)} required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card">
                  <option value="">Selecione uma categoria</option>
                  {categories.filter(c => c.is_active).map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nível Acadêmico *</label>
                <select value={form.academic_level} onChange={(e) => updateField("academic_level", e.target.value)} required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card">
                  <option value="">Selecione o nível</option>
                  {academicLevels.filter(l => l.is_active).map(l => <option key={l.id} value={l.slug}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Palavras-chave (máx. 10)</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.keywords.map((k, i) => (
                  <span key={i} className="bg-muted text-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    {k} <button type="button" onClick={() => removeKeyword(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} placeholder="Adicionar palavra-chave" className="flex-1 px-4 py-2 border border-border rounded-lg text-sm bg-card" />
                <button type="button" onClick={addKeyword} className="px-3 py-2 bg-muted rounded-lg text-sm"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Resumo / Abstract *</label>
              <textarea value={form.summary} onChange={(e) => updateField("summary", e.target.value)} required rows={4} maxLength={500} placeholder="Resumo breve do projeto (máx. 500 caracteres)" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-none" />
              <div className="text-xs text-muted-foreground text-right mt-1">{form.summary.length}/500</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Descrição Completa</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={8} placeholder="Descrição detalhada do projeto, metodologia, objetivos..." className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Data de Início *</label>
                <input type="date" value={form.start_date} onChange={(e) => updateField("start_date", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Data de Término *</label>
                <input type="date" value={form.end_date} onChange={(e) => updateField("end_date", e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Instituição Responsável</label>
              <input value={form.institution} onChange={(e) => updateField("institution", e.target.value)} placeholder="Nome da instituição" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-foreground">Pesquisador Responsável</p>
              <p className="text-sm text-muted-foreground">{user?.name} ({user?.email})</p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold">Autores Adicionais</label>
              <button type="button" onClick={addAuthor} className="text-sm text-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar Autor</button>
            </div>
            {form.authors.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum autor adicional. Clique em "Adicionar Autor" para incluir colaboradores.</p>}
            {form.authors.map((a, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
                <button type="button" onClick={() => removeAuthor(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <input value={a.name} onChange={(e) => updateAuthor(i, "name", e.target.value)} placeholder="Nome" className="px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  <input value={a.email} onChange={(e) => updateAuthor(i, "email", e.target.value)} placeholder="Email" className="px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  <input value={a.institution} onChange={(e) => updateAuthor(i, "institution", e.target.value)} placeholder="Instituição" className="px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  <select value={a.role} onChange={(e) => updateAuthor(i, "role", e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm bg-card">
                    <option value="Coautor">Coautor</option>
                    <option value="Orientador">Orientador</option>
                    <option value="Coorientador">Coorientador</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Agência Financiadora</label>
              <input value={form.funding_agency} onChange={(e) => updateField("funding_agency", e.target.value)} placeholder="Ex: CNPq, CAPES, FAPEG..." className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Valor do Financiamento (R$)</label>
              <input type="number" value={form.funding_value} onChange={(e) => updateField("funding_value", e.target.value)} placeholder="0,00" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Esses campos são opcionais. Preencha se o projeto possui financiamento externo.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Upload de Documentos</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Arraste arquivos PDF aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo 10MB por arquivo. Apenas PDF.</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold">Links Relacionados</label>
                <button type="button" onClick={addLink} className="text-sm text-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar Link</button>
              </div>
              {form.links.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum link adicionado.</p>}
              {form.links.map((l, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input value={l.title} onChange={(e) => updateLink(i, "title", e.target.value)} placeholder="Título" className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  <input value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  <button type="button" onClick={() => removeLink(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Revisão dos Dados</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Título", value: form.title },
                { label: "Categoria", value: form.category },
                { label: "Nível Acadêmico", value: form.academic_level },
                { label: "Data de Início", value: form.start_date || "Não informada" },
                { label: "Data de Término", value: form.end_date || "Não informada" },
                { label: "Instituição", value: form.institution || "Não informada" },
                { label: "Agência", value: form.funding_agency || "Não informada" },
                { label: "Financiamento", value: form.funding_value ? `R$ ${form.funding_value}` : "Não informado" },
              ].map((item, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value || "—"}</p>
                </div>
              ))}
            </div>
            {form.summary && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Resumo</p>
                <p className="text-sm text-foreground">{form.summary}</p>
              </div>
            )}
            {form.keywords.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Palavras-chave</p>
                <div className="flex flex-wrap gap-1">
                  {form.keywords.map((k, i) => <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{k}</span>)}
                </div>
              </div>
            )}
            {form.authors.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Autores Adicionais ({form.authors.length})</p>
                {form.authors.map((a, i) => <p key={i} className="text-sm text-foreground">{a.name} — {a.role}</p>)}
              </div>
            )}
            {form.links.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Links ({form.links.length})</p>
                {form.links.map((l, i) => <p key={i} className="text-sm text-primary">{l.title}: {l.url}</p>)}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <AppLayout pageName="Nova Submissão" navItems={navItems} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Criar Nova Submissão de Projeto</h2>
        <p className="text-sm opacity-90">Preencha os dados do projeto e envie para análise</p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-[800px] mx-auto mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 text-center max-w-[70px] ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < 5 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto">
        <form onSubmit={(e) => e.preventDefault()} className="bg-card rounded-xl shadow-sm border border-border p-6">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <button type="button" onClick={prevStep} disabled={step === 0} className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            {step < 5 ? (
              <button type="button" onClick={nextStep} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-secondary">
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-secondary disabled:opacity-50">
                <Send className="w-4 h-4" /> {submitting ? "Enviando..." : "Submeter Projeto"}
              </button>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default SubmissionForm;
