import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Inbox, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { name: "", slug: "", description: "", color: "#4CAF50", icon: "", is_active: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.listCategories();
      setCategories(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === "true" ? c.is_active : !c.is_active);
    return matchSearch && matchStatus;
  });

  const autoSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, slug: c.slug, description: c.description || "", color: c.color || "#4CAF50", icon: c.icon || "", is_active: c.is_active });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
        toast({ title: "Sucesso", description: "Categoria atualizada!" });
      } else {
        await api.createCategory(form);
        toast({ title: "Sucesso", description: "Categoria criada!" });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja realmente remover a categoria "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      toast({ title: "Sucesso", description: "Categoria removida!" });
      fetchCategories();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout pageName="Categorias" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gerenciamento de Categorias</h2>
        <p className="text-sm opacity-90">Crie, edite e gerencie as categorias de pesquisa do sistema</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button onClick={openCreate} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Editar Categoria" : "Nova Categoria"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : autoSlug(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição *</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cor *</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded border border-border cursor-pointer" />
                    <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ícone</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="ex: beaker" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} id="cat-active" />
                <label htmlFor="cat-active" className="text-sm">Categoria ativa</label>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">
                {editingId ? "Salvar Alterações" : "Criar Categoria"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><p className="text-sm">Carregando...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhuma categoria encontrada.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground">Cor</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Nome</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Slug</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Descrição</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: c.color || "#ccc" }} />
                    </td>
                    <td className="p-3 font-semibold text-foreground">{c.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{c.description}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                        {c.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-muted" title="Editar"><Edit2 className="w-4 h-4 text-cebio-blue" /></button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded hover:bg-muted" title="Remover"><Trash2 className="w-4 h-4 text-cebio-red" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-sm text-muted-foreground border-t border-border">
              Mostrando {filtered.length} de {categories.length} categorias
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminCategories;
