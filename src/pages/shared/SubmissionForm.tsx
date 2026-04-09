import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, FileText, Image, Plus } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";

interface Author {
  name: string;
  cpf: string;
  institution: string;
  level: string;
  role: string;
}

interface ExternalLink {
  url: string;
  type: string;
  title: string;
  description: string;
}

const SubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV.slice(0, 2) : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;
  const basePath = isAdmin ? "/admin" : isPesquisador ? "/pesquisador" : "/bolsista";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [audience, setAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [academicLevels, setAcademicLevels] = useState<any[]>([]);

  const [authors, setAuthors] = useState<Author[]>([
    { name: user?.name || "", cpf: "", institution: user?.institution || "CEBIO Brasil", level: "Graduação", role: "Autor Principal" },
  ]);

  const [links, setLinks] = useState<ExternalLink[]>([
    { url: "", type: "Outro", title: "", description: "" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, levels] = await Promise.all([api.listCategories(), api.listAcademicLevels()]);
        setCategories(cats);
        setAcademicLevels(levels);
      } catch { /* silent */ }
    };
    fetchData();
  }, []);

  // Word count for summary
  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const wordsRemaining = Math.max(0, 500 - wordCount);

  const addAuthor = () => {
    setAuthors([...authors, { name: "", cpf: "", institution: "", level: "Graduação", role: "Coautor" }]);
    toast({ title: "Autor adicionado" });
  };

  const removeAuthor = (i: number) => {
    if (i === 0) return; // Can't remove principal
    setAuthors(authors.filter((_, idx) => idx !== i));
  };

  const updateAuthor = (i: number, field: keyof Author, value: string) => {
    const updated = [...authors];
    updated[i] = { ...updated[i], [field]: value };
    setAuthors(updated);
  };

  const addLink = () => {
    setLinks([...links, { url: "", type: "Outro", title: "", description: "" }]);
    toast({ title: "Link adicionado" });
  };

  const removeLink = (i: number) => {
    setLinks(links.filter((_, idx) => idx !== i));
  };

  const updateLink = (i: number, field: keyof ExternalLink, value: string) => {
    const updated = [...links];
    updated[i] = { ...updated[i], [field]: value };
    setLinks(updated);
  };

  const handleSubmit = async () => {
    if (!title || !summary || !startDate || !endDate) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    if (authors.length === 0 || !authors[0].name) {
      toast({ title: "Erro", description: "Adicione pelo menos um autor", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await api.createProject({
        title,
        summary,
        category: category || undefined,
        academic_level: academicLevel || undefined,
        start_date: startDate,
        end_date: endDate,
      });
      toast({ title: "Projeto submetido!", description: "Seu projeto foi enviado para análise." });
      navigate(`${basePath}/projetos`);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    toast({ title: "Rascunho salvo", description: "Funcionalidade em desenvolvimento." });
  };

  const inputClass = "w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card text-foreground";
  const labelClass = "block text-sm font-semibold text-foreground mb-2";
  const reqClass = "text-destructive";

  return (
    <AppLayout pageName="Submissão de Projeto" navItems={navItems} notificationCount={0}>
      <div className="max-w-[800px] mx-auto">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          {/* Title */}
          <div className="mb-6 pb-4 border-b border-border">
            <h3 className="text-lg font-bold text-primary">Nova Submissão - CEBIO Brasil</h3>
            <p className="text-sm text-muted-foreground mt-1">Preencha todas as informações necessárias para submeter seu projeto acadêmico</p>
          </div>

          {/* Section: Informações Gerais */}
          <div className="mb-4 pb-2 border-b border-border">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Informações Gerais
            </h3>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-0">
            {/* Título */}
            <div className="mb-5">
              <label className={labelClass}>Título do Projeto <span className={reqClass}>*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Digite o título do projeto" className={inputClass} />
            </div>

            {/* Categoria + Nível */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClass}>Categoria <span className={reqClass}>*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  <option value="">Selecione...</option>
                  {categories.length > 0
                    ? categories.filter(c => c.is_active !== false).map(c => <option key={c.id} value={c.slug || c.name}>{c.name}</option>)
                    : <>
                        <option value="projetos_pesquisa">Projetos de Pesquisa</option>
                        <option value="artigos">Artigos</option>
                        <option value="projetos_ensino">Projetos de Ensino</option>
                        <option value="disciplinas">Disciplinas</option>
                        <option value="cursos">Cursos</option>
                        <option value="orientacoes">Orientações</option>
                      </>
                  }
                </select>
              </div>
              <div>
                <label className={labelClass}>Nível Acadêmico</label>
                <select value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value)} className={inputClass}>
                  <option value="">Selecione...</option>
                  {academicLevels.length > 0
                    ? academicLevels.filter(l => l.is_active !== false).map(l => <option key={l.id} value={l.slug || l.name}>{l.name}</option>)
                    : <>
                        <option value="graduacao">Graduação</option>
                        <option value="mestrado">Mestrado</option>
                        <option value="doutorado">Doutorado</option>
                        <option value="pos_doutorado">Pós-Doutorado</option>
                      </>
                  }
                </select>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClass}>Data de Início <span className={reqClass}>*</span></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Data de Fim <span className={reqClass}>*</span></label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Resumo */}
            <div className="mb-5">
              <label className={labelClass}>
                Resumo <span className={reqClass}>*</span>{" "}
                <span className="font-normal text-muted-foreground">({wordCount}/500 palavras)</span>
              </label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} placeholder="Descreva o resumo do projeto (máximo 500 palavras)" className={inputClass + " resize-y"} />
              <div className="text-xs text-muted-foreground mt-1">{wordsRemaining} palavras restantes</div>
            </div>

            {/* Público-Alvo */}
            <div className="mb-5">
              <label className={labelClass}>Público-Alvo</label>
              <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex: Estudantes de graduação, professores, pesquisadores" className={inputClass} />
            </div>

            {/* ============ AUTORES ============ */}
            <div className="flex justify-between items-center mt-8 mb-5">
              <h3 className="text-base font-bold">Autores/Colaboradores</h3>
              <button type="button" onClick={addAuthor} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-[13px] font-medium">
                + Adicionar Autor
              </button>
            </div>

            {authors.map((a, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-5 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold">{i === 0 ? "Autor Principal" : `Autor ${i + 1}`}</h4>
                  {i > 0 && (
                    <button type="button" onClick={() => removeAuthor(i)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className={labelClass}>Nome Completo <span className={reqClass}>*</span></label>
                    <input type="text" value={a.name} onChange={(e) => updateAuthor(i, "name", e.target.value)} placeholder="Nome do autor" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>CPF <span className={reqClass}>*</span></label>
                    <input type="text" value={a.cpf} onChange={(e) => updateAuthor(i, "cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className={labelClass}>Instituição <span className={reqClass}>*</span></label>
                    <input type="text" value={a.institution} onChange={(e) => updateAuthor(i, "institution", e.target.value)} placeholder="Nome da instituição" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Nível</label>
                    <select value={a.level} onChange={(e) => updateAuthor(i, "level", e.target.value)} className={inputClass}>
                      <option>Graduação</option><option>Mestrado</option><option>Doutorado</option><option>Pós-Doutorado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Função</label>
                  <input type="text" value={a.role} onChange={(e) => updateAuthor(i, "role", e.target.value)} className={inputClass} />
                </div>
              </div>
            ))}

            {/* ============ ANEXOS ============ */}
            <div className="mt-8 mb-5">
              <h3 className="text-base font-bold">Anexos</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className={labelClass}>Fotos (máximo 5)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Image className="w-9 h-9 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload de fotos</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG até 5MB cada<br />0/5 fotos</p>
                </div>
              </div>
              <div>
                <label className={labelClass}>Documentos PDF (máximo 5)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <FileText className="w-9 h-9 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload de PDFs</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF até 50MB cada<br />0/5 documentos</p>
                </div>
              </div>
            </div>

            {/* ============ LINKS EXTERNOS ============ */}
            <div className="flex justify-between items-center mt-8 mb-5">
              <h3 className="text-base font-bold">Links Externos</h3>
              <button type="button" onClick={addLink} className="bg-muted text-foreground px-4 py-1.5 rounded-lg text-[13px] font-medium border border-border">
                ✎ Adicionar Link
              </button>
            </div>

            {links.map((l, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-5 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className={labelClass}>URL</label>
                    <input type="url" value={l.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://exemplo.com/recurso" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Tipo</label>
                    <select value={l.type} onChange={(e) => updateLink(i, "type", e.target.value)} className={inputClass}>
                      <option>Outro</option><option>GitHub</option><option>Artigo</option><option>Documentação</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 items-end mb-3">
                  <div className="flex-1">
                    <label className={labelClass}>Título</label>
                    <input type="text" value={l.title} onChange={(e) => updateLink(i, "title", e.target.value)} placeholder="Título do link" className={inputClass} />
                  </div>
                  <button type="button" onClick={() => removeLink(i)} className="text-destructive hover:text-destructive/80 mb-2.5 flex-shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>Descrição</label>
                  <textarea value={l.description} onChange={(e) => updateLink(i, "description", e.target.value)} rows={3} placeholder="Descrição opcional do link" className={inputClass + " resize-y"} />
                </div>
              </div>
            ))}

            {/* ============ BOTÕES ============ */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-border">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-border rounded-lg text-sm font-medium bg-muted hover:bg-muted/80">
                Cancelar
              </button>
              <button type="button" onClick={handleSaveDraft} className="px-6 py-3 rounded-lg text-sm font-semibold text-primary-foreground" style={{ background: "#424242" }}>
                📋 Salvar Rascunho
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-secondary disabled:opacity-50">
                {submitting ? "Enviando..." : "✈ Submeter para Revisão"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubmissionForm;
