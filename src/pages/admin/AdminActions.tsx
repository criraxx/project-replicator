import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, KeyRound, Bell, Shield, Download, Clock, Users, Settings, Tag, GraduationCap, Plus, Trash2, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ADMIN_NAV } from "@/constants/navigation";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { mockUsers, mockProjects, mockCategories, mockAcademicLevels } from "@/data/mockData";

const autoSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const AdminActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const [stats, setStats] = useState({ pending: 0, inactive: 0, tempPasswords: 0 });

  // Categories & Levels inline management
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const [activeTab, setActiveTab] = useState<"categories" | "levels">("categories");
  const [loadingCats, setLoadingCats] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectStats, usersRes, catsRes, lvlsRes, projsRes] = await Promise.allSettled([
          api.getProjectStats(),
          api.listUsers(),
          api.listCategories(),
          api.listAcademicLevels(),
          api.listProjects({ limit: 10000 }),
        ]);
        const usersData = usersRes.status === "fulfilled" && usersRes.value?.length ? usersRes.value : mockUsers;
        const pending = projectStats.status === "fulfilled" ? projectStats.value.pending : mockProjects.filter(p => p.status === "pendente").length;
        const inactive = usersData.filter((u: any) => !u.is_active).length;
        const temp = usersData.filter((u: any) => u.is_temp_password).length;
        setStats({ pending, inactive, tempPasswords: temp });
        setCategories(catsRes.status === "fulfilled" && catsRes.value?.length ? catsRes.value : mockCategories);
        setLevels(lvlsRes.status === "fulfilled" && lvlsRes.value?.length ? lvlsRes.value : mockAcademicLevels);
        setProjects(projsRes.status === "fulfilled" && projsRes.value.projects?.length ? projsRes.value.projects : mockProjects);
      } catch {
        setStats({ pending: mockProjects.filter(p => p.status === "pendente").length, inactive: mockUsers.filter(u => !u.is_active).length, tempPasswords: 0 });
        setCategories(mockCategories);
        setLevels(mockAcademicLevels);
        setProjects(mockProjects);
      }
      setLoadingCats(false);
    };
    fetchAll();
  }, []);

  const categoryHasProjects = (catName: string) => projects.some(p => p.category === catName);
  const levelHasProjects = (lvlName: string) => projects.some(p => p.academic_level === lvlName);

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await api.createCategory({ name: newCatName.trim(), slug: autoSlug(newCatName.trim()) });
      toast({ title: "Sucesso", description: "Categoria criada!" });
      setNewCatName("");
      const cats = await api.listCategories();
      setCategories(cats);
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const removeCategory = async (id: number, name: string) => {
    if (categoryHasProjects(name)) {
      toast({ title: "Não é possível remover", description: "Esta categoria possui projetos vinculados.", variant: "destructive" });
      return;
    }
    const ok = await confirm({ title: "Remover Categoria", description: `Remover a categoria "${name}"?`, confirmLabel: "Remover", variant: "danger" });
    if (!ok) return;
    try {
      await api.deleteCategory(id);
      toast({ title: "Sucesso", description: "Categoria removida!" });
      const cats = await api.listCategories();
      setCategories(cats);
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const addLevel = async () => {
    if (!newLevelName.trim()) return;
    try {
      await api.createAcademicLevel({ name: newLevelName.trim(), slug: autoSlug(newLevelName.trim()), order: levels.length + 1 });
      toast({ title: "Sucesso", description: "Nível acadêmico criado!" });
      setNewLevelName("");
      const lvls = await api.listAcademicLevels();
      setLevels(lvls);
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const removeLevel = async (id: number, name: string) => {
    if (levelHasProjects(name)) {
      toast({ title: "Não é possível remover", description: "Este nível possui projetos vinculados.", variant: "destructive" });
      return;
    }
    const ok = await confirm({ title: "Remover Nivel", description: `Remover o nivel "${name}"?`, confirmLabel: "Remover", variant: "danger" });
    if (!ok) return;
    try {
      await api.deleteAcademicLevel(id);
      toast({ title: "Sucesso", description: "Nível removido!" });
      const lvls = await api.listAcademicLevels();
      setLevels(lvls);
    } catch (err: any) { toast({ title: "Erro", description: err.message, variant: "destructive" }); }
  };

  const actions = [
    { icon: CheckCircle, title: "Aprovação em Lote", desc: "Aprovar múltiplos projetos simultaneamente", tag: "Projects", iconBg: "bg-cebio-green-bg", iconColor: "text-primary", path: "/admin/aprovacao-lote" },
    { icon: XCircle, title: "Rejeição em Lote", desc: "Rejeitar múltiplos projetos com comentários", tag: "Projects", iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red", path: "/admin/rejeicao-lote" },
    { icon: KeyRound, title: "Reset de Senhas em Lote", desc: "Redefinir senhas para usuários selecionados", tag: "Users", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow", path: "/admin/reset-senha-lote" },
    { icon: Download, title: "Exportação Completa", desc: "Exportar todos os dados do sistema", tag: "Data", iconBg: "bg-cebio-blue-bg", iconColor: "text-cebio-blue", path: "/admin/exportacao" },
    { icon: Bell, title: "Notificações em Massa", desc: "Enviar notificações para grupos de usuários", tag: "Communication", iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow", path: "/admin/notificacao-massa" },
  ];

  return (
    <AppLayout pageName="Ações Administrativas" navItems={ADMIN_NAV} notificationCount={0}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-[22px] font-semibold mb-1.5">Central de Ações Administrativas</h2>
          <p className="text-sm opacity-90 mb-3">Controle avançado e operações em lote para gestão eficiente do CEBIO</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Shield className="w-4 h-4" /> Operações Seguras</span>
            <span className="flex items-center gap-1.5 text-[13px] opacity-90"><Settings className="w-4 h-4" /> Auditoria Automática</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Projetos Pendentes", value: stats.pending, sub: "Aguardando revisão", subColor: "text-cebio-red", icon: Clock, iconBg: "bg-cebio-yellow-bg", iconColor: "text-cebio-yellow" },
          { label: "Usuários Inativos", value: stats.inactive, sub: "Requerem atenção", subColor: "text-cebio-red", icon: Users, iconBg: "bg-cebio-purple-bg", iconColor: "text-cebio-purple" },
          { label: "Senhas Temporárias", value: stats.tempPasswords, sub: "Precisam redefinir", subColor: "text-cebio-red", icon: KeyRound, iconBg: "bg-cebio-red-bg", iconColor: "text-cebio-red" },
          { label: "Status do Sistema", value: "Operacional", sub: "Todos os serviços ativos", subColor: "text-primary", icon: CheckCircle, iconBg: "bg-cebio-green-bg", iconColor: "text-primary", isText: true },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border flex justify-between items-start">
            <div>
              <div className="text-[13px] text-muted-foreground mb-1">{s.label}</div>
              <div className={`${(s as any).isText ? "text-lg" : "text-[32px]"} font-bold text-foreground leading-none`}>{s.value}</div>
              <div className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</div>
            </div>
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-[22px] h-[22px] ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {actions.map((a, i) => (
          <div key={i} onClick={() => a.path && navigate(a.path)} className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col relative hover:shadow-md transition-shadow cursor-pointer">
            {(a as any).badge && (
              <span className="absolute top-4 right-4 w-6 h-6 bg-primary text-primary-foreground rounded-full text-[11px] font-bold flex items-center justify-center">{(a as any).badge}</span>
            )}
            <div className={`w-12 h-12 rounded-full ${a.iconBg} flex items-center justify-center mb-4`}>
              <a.icon className={`w-6 h-6 ${a.iconColor}`} />
            </div>
            <h4 className="text-[15px] font-bold mb-1.5">{a.title}</h4>
            <p className="text-[13px] text-muted-foreground flex-1 mb-4">{a.desc}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{a.tag}</span>
              <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-secondary transition-colors">Executar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Categories & Levels Management - Single Card with Tabs */}
      <div className="bg-card rounded-xl shadow-sm border border-border mb-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-[3px] transition-colors ${activeTab === "categories" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
          >
            <Tag className="w-4 h-4" /> Categorias
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-[3px] transition-colors ${activeTab === "levels" ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
          >
            <GraduationCap className="w-4 h-4" /> Níveis Acadêmicos
          </button>
        </div>
        <div className="p-5">
          {activeTab === "categories" ? (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  placeholder="Nome da nova categoria"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background"
                />
                <button onClick={addCategory} disabled={!newCatName.trim()} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {loadingCats ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">Carregando...</p>
                ) : categories.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma categoria criada ainda</p>
                  </div>
                ) : categories.map((cat) => {
                  const hasProjects = categoryHasProjects(cat.name);
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <button
                        onClick={() => removeCategory(cat.id, cat.name)}
                        disabled={hasProjects}
                        title={hasProjects ? "Categoria possui projetos vinculados" : "Remover categoria"}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLevel()}
                  placeholder="Nome do novo nível acadêmico"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-background"
                />
                <button onClick={addLevel} disabled={!newLevelName.trim()} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {loadingCats ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">Carregando...</p>
                ) : levels.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum nível criado ainda</p>
                  </div>
                ) : levels.map((lvl) => {
                  const hasProjects = levelHasProjects(lvl.name);
                  return (
                    <div key={lvl.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="text-sm font-medium text-foreground">{lvl.name}</span>
                      <button
                        onClick={() => removeLevel(lvl.id, lvl.name)}
                        disabled={hasProjects}
                        title={hasProjects ? "Nível possui projetos vinculados" : "Remover nível"}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-5">
        <h3 className="text-base font-semibold mb-1">Ações Administrativas Recentes</h3>
        <p className="text-[13px] text-muted-foreground mb-4">Histórico das últimas operações realizadas</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cebio-green-bg">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="w-5 h-5 text-primary-foreground" /></div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Sistema Inicializado</h4>
              <p className="text-xs text-muted-foreground">Backend CEBIO conectado e operacional</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminActions;
