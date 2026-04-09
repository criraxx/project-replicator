import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Inbox, X } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AcademicLevel {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { name: "", slug: "", description: "", order: 0, is_active: true };

const AdminAcademicLevels = () => {
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await api.listAcademicLevels();
      setLevels(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLevels(); }, []);

  const filtered = levels.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === "true" ? l.is_active : !l.is_active);
    return matchSearch && matchStatus;
  }).sort((a, b) => a.order - b.order);

  const autoSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm, order: levels.length + 1 }); setShowModal(true); };
  const openEdit = (l: AcademicLevel) => {
    setEditingId(l.id);
    setForm({ name: l.name, slug: l.slug, description: l.description || "", order: l.order, is_active: l.is_active });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateAcademicLevel(editingId, form);
        toast({ title: "Sucesso", description: "Nível acadêmico atualizado!" });
      } else {
        await api.createAcademicLevel(form);
        toast({ title: "Sucesso", description: "Nível acadêmico criado!" });
      }
      setShowModal(false);
      fetchLevels();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja realmente remover o nível "${name}"?`)) return;
    try {
      await api.deleteAcademicLevel(id);
      toast({ title: "Sucesso", description: "Nível acadêmico removido!" });
      fetchLevels();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AppLayout pageName="Níveis Acadêmicos" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gerenciamento de Níveis Acadêmicos</h2>
        <p className="text-sm opacity-90">Configure os níveis acadêmicos disponíveis no sistema</p>
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
          <Plus className="w-4 h-4" /> Novo Nível
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-xl border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Editar Nível Acadêmico" : "Novo Nível Acadêmico"}</h3>
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
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ordem de exibição *</label>
                <input type="number" required min={1} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-card" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} id="level-active" />
                <label htmlFor="level-active" className="text-sm">Nível ativo</label>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">
                {editingId ? "Salvar Alterações" : "Criar Nível Acadêmico"}
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
            <p className="text-sm font-medium">Nenhum nível acadêmico encontrado.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground">Ordem</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Nome</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Slug</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Descrição</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">{l.order}</span>
                    </td>
                    <td className="p-3 font-semibold text-foreground">{l.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{l.slug}</td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{l.description || "—"}</td>
                    <td className="p-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${l.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                        {l.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded hover:bg-muted" title="Editar"><Edit2 className="w-4 h-4 text-cebio-blue" /></button>
                        <button onClick={() => handleDelete(l.id, l.name)} className="p-1.5 rounded hover:bg-muted" title="Remover"><Trash2 className="w-4 h-4 text-cebio-red" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-sm text-muted-foreground border-t border-border">
              Mostrando {filtered.length} de {levels.length} níveis acadêmicos
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminAcademicLevels;
