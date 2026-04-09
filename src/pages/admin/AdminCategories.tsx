import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CategoryItem { id: number; name: string; slug: string; description?: string; color?: string; icon?: string; is_active: boolean; }
interface LevelItem { id: number; name: string; slug: string; description?: string; order: number; is_active: boolean; }

const autoSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminCategories = () => {
  const [activeTab, setActiveTab] = useState<"categories" | "levels">("categories");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Category form
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "", color: "#1a9a4a", icon: "" });
  // Level form
  const [lvlForm, setLvlForm] = useState({ name: "", slug: "", description: "", order: 0 });

  // Edit modal
  const [editModal, setEditModal] = useState<{ type: "category" | "level"; item: any } | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, lvls] = await Promise.allSettled([api.listCategories(), api.listAcademicLevels()]);
      if (cats.status === "fulfilled") setCategories(cats.value);
      if (lvls.status === "fulfilled") setLevels(lvls.value);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Category CRUD
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCategory(catForm);
      toast({ title: "Sucesso", description: "Categoria criada!" });
      setCatForm({ name: "", slug: "", description: "", color: "#1a9a4a", icon: "" });
      fetchData();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Deseja realmente remover esta categoria?")) return;
    try {
      await api.deleteCategory(id);
      toast({ title: "Sucesso", description: "Categoria removida!" });
      fetchData();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Level CRUD
  const handleCreateLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAcademicLevel(lvlForm);
      toast({ title: "Sucesso", description: "Nível acadêmico criado!" });
      setLvlForm({ name: "", slug: "", description: "", order: levels.length + 1 });
      fetchData();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm("Deseja realmente remover este nível?")) return;
    try {
      await api.deleteAcademicLevel(id);
      toast({ title: "Sucesso", description: "Nível removido!" });
      fetchData();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  // Edit
  const openEdit = (type: "category" | "level", item: any) => {
    setEditModal({ type, item });
    setEditForm({ ...item });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      if (editModal.type === "category") {
        await api.updateCategory(editForm.id, editForm);
      } else {
        await api.updateAcademicLevel(editForm.id, editForm);
      }
      toast({ title: "Sucesso", description: "Atualizado com sucesso!" });
      setEditModal(null);
      fetchData();
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  return (
    <AppLayout pageName="Categorias e Níveis" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b-2 border-border">
        <button onClick={() => setActiveTab("categories")} className={`px-6 py-3 text-[15px] font-semibold border-b-[3px] transition-colors ${activeTab === "categories" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}>
          📁 Categorias
        </button>
        <button onClick={() => setActiveTab("levels")} className={`px-6 py-3 text-[15px] font-semibold border-b-[3px] transition-colors ${activeTab === "levels" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}>
          🎓 Níveis Acadêmicos
        </button>
      </div>

      {/* TAB: CATEGORIAS */}
      {activeTab === "categories" && (
        <>
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h3 className="text-base font-semibold text-primary mt-0 mb-4">Adicionar Nova Categoria</h3>
            <form onSubmit={handleCreateCategory}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nome da Categoria</label>
                  <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: autoSlug(e.target.value) })} placeholder="Ex: Projetos de Pesquisa" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Slug (URL-friendly)</label>
                  <input type="text" required value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })} placeholder="Ex: projetos-pesquisa" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3} placeholder="Descrição da categoria..." className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Cor</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-[60px] h-10 rounded border border-border cursor-pointer" />
                    <div className="w-10 h-10 rounded border border-border" style={{ backgroundColor: catForm.color }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Ícone (opcional)</label>
                  <input type="text" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} placeholder="Ex: folder, book, etc" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold">Criar Categoria</button>
                <button type="reset" onClick={() => setCatForm({ name: "", slug: "", description: "", color: "#1a9a4a", icon: "" })} className="flex-1 bg-muted text-foreground py-3 rounded-lg text-sm font-semibold">Limpar</button>
              </div>
            </form>
          </div>

          <h3 className="text-base font-semibold text-primary mb-4">Categorias Existentes</h3>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando categorias...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma categoria criada ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-foreground">{cat.name}</div>
                      <div className="text-[13px] text-muted-foreground leading-snug mt-1">{cat.description || "Sem descrição"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit("category", cat)} className="px-3 py-1.5 text-xs font-semibold rounded bg-cebio-blue text-primary-foreground">Editar</button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-destructive text-destructive-foreground">Deletar</button>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded text-primary-foreground font-semibold text-[11px]" style={{ backgroundColor: cat.color || "#1a9a4a" }}>Cor: {cat.color || "#1a9a4a"}</span>
                    <span className={`px-2 py-1 rounded text-[11px] font-semibold ${cat.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                      {cat.is_active ? "✓ Ativo" : "✗ Inativo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB: NÍVEIS ACADÊMICOS */}
      {activeTab === "levels" && (
        <>
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h3 className="text-base font-semibold text-primary mt-0 mb-4">Adicionar Novo Nível Acadêmico</h3>
            <form onSubmit={handleCreateLevel}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nome do Nível</label>
                  <input type="text" required value={lvlForm.name} onChange={(e) => setLvlForm({ ...lvlForm, name: e.target.value, slug: autoSlug(e.target.value) })} placeholder="Ex: Graduação" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Slug (URL-friendly)</label>
                  <input type="text" required value={lvlForm.slug} onChange={(e) => setLvlForm({ ...lvlForm, slug: e.target.value })} placeholder="Ex: graduacao" className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea value={lvlForm.description} onChange={(e) => setLvlForm({ ...lvlForm, description: e.target.value })} rows={3} placeholder="Descrição do nível acadêmico..." className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card resize-y" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Ordem (para exibição)</label>
                <input type="number" min={0} value={lvlForm.order} onChange={(e) => setLvlForm({ ...lvlForm, order: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-lg text-sm outline-none focus:border-primary bg-card" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold">Criar Nível</button>
                <button type="reset" onClick={() => setLvlForm({ name: "", slug: "", description: "", order: levels.length + 1 })} className="flex-1 bg-muted text-foreground py-3 rounded-lg text-sm font-semibold">Limpar</button>
              </div>
            </form>
          </div>

          <h3 className="text-base font-semibold text-primary mb-4">Níveis Acadêmicos Existentes</h3>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando níveis...</p>
          ) : levels.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum nível criado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {levels.map((level) => (
                <div key={level.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-foreground">{level.name}</div>
                      <div className="text-[13px] text-muted-foreground leading-snug mt-1">{level.description || "Sem descrição"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit("level", level)} className="px-3 py-1.5 text-xs font-semibold rounded bg-cebio-blue text-primary-foreground">Editar</button>
                      <button onClick={() => handleDeleteLevel(level.id)} className="px-3 py-1.5 text-xs font-semibold rounded bg-destructive text-destructive-foreground">Deletar</button>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                    <span>Ordem: {level.order}</span>
                    <span className={`px-2 py-1 rounded text-[11px] font-semibold ${level.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                      {level.is_active ? "✓ Ativo" : "✗ Inativo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-8 w-full max-w-[500px] shadow-xl border border-border max-h-[80vh] overflow-y-auto">
            <div className="text-lg font-semibold text-primary mb-6">
              {editModal.type === "category" ? "Editar Categoria" : "Editar Nível Acadêmico"}
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome</label>
                <input type="text" required value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Slug</label>
                <input type="text" required value={editForm.slug || ""} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Descrição</label>
                <textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card resize-y" />
              </div>
              {editModal.type === "category" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cor</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={editForm.color || "#1a9a4a"} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="w-[60px] h-10 rounded border border-border cursor-pointer" />
                      <div className="w-10 h-10 rounded border border-border" style={{ backgroundColor: editForm.color || "#1a9a4a" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Ícone</label>
                    <input type="text" value={editForm.icon || ""} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card" />
                  </div>
                </>
              )}
              {editModal.type === "level" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Ordem</label>
                  <input type="number" min={0} value={editForm.order || 0} onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-card" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-muted text-foreground py-3 rounded-lg text-sm font-semibold">Cancelar</button>
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminCategories;
