import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus, Trash2, Link as LinkIcon, FileText, Image, X, ExternalLink } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { ADMIN_NAV, PESQUISADOR_NAV, BOLSISTA_NAV } from "@/constants/navigation";
import { formatCpf } from "@/lib/formatters";

interface Author {
  name: string; cpf: string; institution: string; level: string; role: string;
}

interface ExternalLink {
  url: string; type: string; title: string; description: string;
}

const MAX_PHOTOS = 5;
const MAX_PDFS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

const SubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);

  const isAdmin = user?.role === "admin";
  const isPesquisador = user?.role === "pesquisador";
  const navItems = isAdmin ? ADMIN_NAV.slice(0, 2) : isPesquisador ? PESQUISADOR_NAV : BOLSISTA_NAV;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("pesquisa");
  const [academicLevel, setAcademicLevel] = useState("graduacao");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const [authors, setAuthors] = useState<Author[]>([
    { name: user?.name || "", cpf: "", institution: "", level: "graduacao", role: "Autor Principal" },
  ]);

  const [links, setLinks] = useState<ExternalLink[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try { const cats = await api.listCategories(); setCategories(cats); } catch { /* silent */ }
      try {
        const profile = await api.getProfile();
        if (profile) {
          setAuthors(prev => {
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              name: profile.name || updated[0].name,
              cpf: profile.cpf ? formatCpf(profile.cpf) : updated[0].cpf,
              institution: profile.institution || updated[0].institution,
            };
            return updated;
          });
          setProfileLoaded(true);
        }
      } catch { /* silent */ }
    };
    fetchData();
  }, []);

  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;
  const wordsRemaining = Math.max(0, 500 - wordCount);

  const addAuthor = () => setAuthors([...authors, { name: "", cpf: "", institution: "", level: "graduacao", role: "Coautor" }]);
  const removeAuthor = (i: number) => setAuthors(authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, field: keyof Author, value: string) => {
    const updated = [...authors];
    if (field === "cpf") {
      updated[i] = { ...updated[i], cpf: formatCpf(value) };
    } else {
      updated[i] = { ...updated[i], [field]: value };
    }
    setAuthors(updated);
  };

  const addLink = () => setLinks([...links, { url: "", type: "outro", title: "", description: "" }]);
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: keyof ExternalLink, value: string) => {
    const updated = [...links]; updated[i] = { ...updated[i], [field]: value }; setLinks(updated);
  };

  // File handling
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - photos.length;
    const valid = files.filter(f => {
      if (!f.type.startsWith("image/")) { toast({ title: "Arquivo inválido", description: `${f.name} não é uma imagem.`, variant: "destructive" }); return false; }
      if (f.size > MAX_PHOTO_SIZE) { toast({ title: "Arquivo muito grande", description: `${f.name} excede 5MB.`, variant: "destructive" }); return false; }
      return true;
    }).slice(0, remaining);
    if (files.length > remaining) toast({ title: "Limite atingido", description: `Máximo de ${MAX_PHOTOS} fotos.`, variant: "destructive" });
    setPhotos(prev => [...prev, ...valid]);
    e.target.value = "";
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PDFS - pdfs.length;
    const valid = files.filter(f => {
      if (f.type !== "application/pdf") { toast({ title: "Arquivo inválido", description: `${f.name} não é um PDF.`, variant: "destructive" }); return false; }
      if (f.size > MAX_PDF_SIZE) { toast({ title: "Arquivo muito grande", description: `${f.name} excede 50MB.`, variant: "destructive" }); return false; }
      return true;
    }).slice(0, remaining);
    if (files.length > remaining) toast({ title: "Limite atingido", description: `Máximo de ${MAX_PDFS} PDFs.`, variant: "destructive" });
    setPdfs(prev => [...prev, ...valid]);
    e.target.value = "";
  };

  const removePhoto = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i));
  const removePdf = (i: number) => setPdfs(pdfs.filter((_, idx) => idx !== i));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !summary) {
      toast({ title: "Campos obrigatórios", description: "Preencha título, categoria e resumo.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const validLinks = links.filter(l => l.url.trim());
      const projectData: any = {
        title, summary, category, academic_level: academicLevel, description: summary,
        start_date: startDate || undefined, end_date: endDate || undefined,
        authors: authors.map((a) => ({
          name: a.name, cpf: a.cpf.replace(/\D/g, ""), institution: a.institution,
          academic_level: a.level, role_in_project: a.role,
        })),
      };
      if (validLinks.length > 0) {
        projectData.links = validLinks.map(l => ({ url: l.url, title: l.title || l.url, link_type: l.type, description: l.description }));
      }

      const result = await api.createProject(projectData);
      const projectId = result?.id || result?.project?.id;

      // Upload files if project was created successfully
      if (projectId && (photos.length > 0 || pdfs.length > 0)) {
        const allFiles = [
          ...photos.map(f => ({ file: f, type: "foto" })),
          ...pdfs.map(f => ({ file: f, type: "documento" })),
        ];
        for (const { file, type } of allFiles) {
          try {
            await api.uploadProjectFile(projectId, file, type);
          } catch { /* continue uploading others */ }
        }
      }

      const hasCoAuthors = authors.length > 1;
      toast({
        title: "Projeto enviado com sucesso!",
        description: hasCoAuthors
          ? "Aguardando aprovação dos coautores antes de ir para análise."
          : "Seu projeto foi enviado para análise.",
      });
      const basePath = isAdmin ? "/admin" : isPesquisador ? "/pesquisador" : "/bolsista";
      setTimeout(() => navigate(`${basePath}/projetos`), 1500);
    } catch (err: any) {
      toast({ title: "Erro ao enviar projeto", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const isPrincipalAuthorField = (i: number) => i === 0 && profileLoaded;

  return (
    <AppLayout pageName="Submissão de Projeto" navItems={navItems} notificationCount={isPesquisador ? 1 : 0}>
      <div className="max-w-[800px] mx-auto">
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {/* Title */}
          <div className="p-6 border-b border-border">
            <h3 className="text-base font-semibold">Nova Submissão - CEBIO Brasil</h3>
            <p className="text-[13px] text-muted-foreground mt-1">Preencha todas as informações necessárias para submeter seu projeto acadêmico</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Informações Gerais */}
            <div className="mb-6">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" /> Informações Gerais
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Título do Projeto <span className="text-destructive">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Digite o título do projeto" required className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Categoria <span className="text-destructive">*</span></label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background">
                    {categories.length > 0 ? categories.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    )) : <>
                      <option value="pesquisa">Projetos de Pesquisa</option>
                      <option value="artigos">Artigos</option>
                      <option value="ensino">Projetos de Ensino</option>
                      <option value="disciplinas">Disciplinas</option>
                      <option value="cursos">Cursos</option>
                      <option value="orientacoes">Orientações</option>
                    </>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Nível Acadêmico</label>
                  <select value={academicLevel} onChange={(e) => setAcademicLevel(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background">
                    <option value="graduacao">Graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                    <option value="pos-doutorado">Pós-Doutorado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Data de Início <span className="text-destructive">*</span></label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Data de Fim <span className="text-destructive">*</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Resumo <span className="text-destructive">*</span>
                  <span className="font-normal text-muted-foreground ml-2">({wordCount}/500 palavras)</span>
                </label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Descreva o resumo do projeto (máximo 500 palavras)" rows={6} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background resize-y" />
                <p className="text-xs text-muted-foreground mt-1">{wordsRemaining} palavras restantes</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Público-Alvo</label>
                <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Ex: Estudantes de graduação, professores, pesquisadores" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background" />
              </div>
            </div>

            {/* Autores/Colaboradores */}
            <div className="flex justify-between items-center mt-8 mb-4">
              <h3 className="text-base font-bold">Autores/Colaboradores</h3>
              <button type="button" onClick={addAuthor} className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-[13px] font-semibold">+ Adicionar Autor</button>
            </div>

            {authors.map((author, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">{i === 0 ? "Autor Principal (seus dados)" : `Autor ${i + 1}`}</h4>
                  {i > 0 && <button type="button" onClick={() => removeAuthor(i)}><Trash2 className="w-5 h-5 text-destructive cursor-pointer" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nome Completo <span className="text-destructive">*</span></label>
                    <input type="text" value={author.name} onChange={(e) => updateAuthor(i, "name", e.target.value)} placeholder="Nome do autor" readOnly={isPrincipalAuthorField(i)} className={`w-full px-3 py-2 border border-border rounded-lg text-sm bg-background ${isPrincipalAuthorField(i) ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">CPF <span className="text-destructive">*</span></label>
                    <input type="text" value={author.cpf} onChange={(e) => updateAuthor(i, "cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} readOnly={isPrincipalAuthorField(i)} className={`w-full px-3 py-2 border border-border rounded-lg text-sm bg-background ${isPrincipalAuthorField(i) ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Instituição <span className="text-destructive">*</span></label>
                    <input type="text" value={author.institution} onChange={(e) => updateAuthor(i, "institution", e.target.value)} placeholder="Nome da instituição" readOnly={isPrincipalAuthorField(i)} className={`w-full px-3 py-2 border border-border rounded-lg text-sm bg-background ${isPrincipalAuthorField(i) ? "opacity-70 cursor-not-allowed" : ""}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Nível</label>
                    <select value={author.level} onChange={(e) => updateAuthor(i, "level", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background">
                      <option value="graduacao">Graduação</option>
                      <option value="mestrado">Mestrado</option>
                      <option value="doutorado">Doutorado</option>
                      <option value="pos-doutorado">Pós-Doutorado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Função</label>
                  <input type="text" value={author.role} onChange={(e) => updateAuthor(i, "role", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
                </div>
              </div>
            ))}

            {/* Anexos */}
            <h3 className="text-base font-bold mt-8 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" /> Anexos
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Photos */}
              <div>
                <label className="block text-sm font-semibold mb-2">Fotos (máximo {MAX_PHOTOS})</label>
                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoSelect} className="hidden" />
                <div
                  onClick={() => photos.length < MAX_PHOTOS && photoInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${photos.length < MAX_PHOTOS ? "cursor-pointer hover:border-primary" : "opacity-50 cursor-not-allowed"}`}
                >
                  <Image className="w-9 h-9 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload de fotos</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG até 5MB cada<br />{photos.length}/{MAX_PHOTOS} fotos</p>
                </div>
                {photos.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {photos.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                        <Image className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(f.size)}</span>
                        <button type="button" onClick={() => removePhoto(i)}><X className="w-3.5 h-3.5 text-destructive" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDFs */}
              <div>
                <label className="block text-sm font-semibold mb-2">Documentos PDF (máximo {MAX_PDFS})</label>
                <input ref={pdfInputRef} type="file" accept="application/pdf" multiple onChange={handlePdfSelect} className="hidden" />
                <div
                  onClick={() => pdfs.length < MAX_PDFS && pdfInputRef.current?.click()}
                  className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${pdfs.length < MAX_PDFS ? "cursor-pointer hover:border-primary" : "opacity-50 cursor-not-allowed"}`}
                >
                  <FileText className="w-9 h-9 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload de PDFs</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF até 50MB cada<br />{pdfs.length}/{MAX_PDFS} documentos</p>
                </div>
                {pdfs.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {pdfs.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                        <FileText className="w-4 h-4 text-destructive shrink-0" />
                        <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(f.size)}</span>
                        <button type="button" onClick={() => removePdf(i)}><X className="w-3.5 h-3.5 text-destructive" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Links Externos */}
            <div className="flex justify-between items-center mt-8 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-primary" /> Links Externos
              </h3>
              <button type="button" onClick={addLink} className="bg-muted text-foreground px-4 py-1.5 rounded-lg text-[13px] font-semibold border border-border">
                <LinkIcon className="w-3 h-3 inline mr-1" /> Adicionar Link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border rounded-lg mb-4">
                <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum link adicionado</p>
                <p className="text-xs mt-1">Clique em "Adicionar Link" para incluir repositórios, artigos ou documentações</p>
              </div>
            ) : links.map((link, i) => (
              <div key={i} className="bg-muted/50 border border-border rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold">Link {i + 1}</h4>
                  <button type="button" onClick={() => removeLink(i)}><Trash2 className="w-5 h-5 text-destructive cursor-pointer" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">URL <span className="text-destructive">*</span></label>
                    <input type="url" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://exemplo.com/recurso" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tipo</label>
                    <select value={link.type} onChange={(e) => updateLink(i, "type", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background">
                      <option value="outro">Outro</option>
                      <option value="github">GitHub</option>
                      <option value="artigo">Artigo</option>
                      <option value="documentacao">Documentação</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Título</label>
                    <input type="text" value={link.title} onChange={(e) => updateLink(i, "title", e.target.value)} placeholder="Título do link" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Descrição</label>
                    <input type="text" value={link.description} onChange={(e) => updateLink(i, "description", e.target.value)} placeholder="Descrição opcional do link" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background" />
                  </div>
                </div>
              </div>
            ))}

            {/* Botões */}
            <div className="flex gap-3 pt-6 justify-end">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-border rounded-lg text-sm font-semibold bg-muted hover:bg-muted/80">
                Cancelar
              </button>
              <button type="button" className="px-6 py-3 border border-border rounded-lg text-sm font-semibold bg-muted hover:bg-muted/80 flex items-center gap-2">
                📋 Salvar Rascunho
              </button>
              <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-2">
                <Send className="w-4 h-4" />
                {submitting ? "Enviando..." : "Submeter para Revisão"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default SubmissionForm;
