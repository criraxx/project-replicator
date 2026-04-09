import { useState } from "react";
import { Search, UserPlus, Eye, KeyRound, UserX, UserCheck, Inbox } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { mockUsers } from "@/data/mockData";
import { ADMIN_NAV } from "@/constants/navigation";
import { roleBadge } from "@/constants/ui";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === "true" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <AppLayout pageName="Gestão de Usuários" navItems={ADMIN_NAV} notificationCount={0}>
      <div className="bg-gradient-to-r from-primary via-secondary to-green-700 text-primary-foreground rounded-xl p-7 mb-6">
        <h2 className="text-[22px] font-semibold mb-1.5">Gestão de Usuários</h2>
        <p className="text-sm opacity-90">Gerencie todos os usuários da plataforma CEBIO</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: mockUsers.length, color: "text-cebio-blue" },
          { label: "Ativos", value: mockUsers.filter((u) => u.is_active).length, color: "text-primary" },
          { label: "Inativos", value: mockUsers.filter((u) => !u.is_active).length, color: "text-cebio-red" },
          { label: "Pesquisadores", value: mockUsers.filter((u) => u.role === "pesquisador").length, color: "text-cebio-purple" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-5 shadow-sm border border-border text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os perfis</option>
          <option value="admin">Admin</option>
          <option value="pesquisador">Pesquisador</option>
          <option value="bolsista">Bolsista</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
            <p className="text-xs mt-1">Cadastre novos usuários usando o botão acima.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-3 text-left font-semibold text-muted-foreground">Usuário</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Email</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Perfil</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Instituição</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-semibold text-muted-foreground">Último Login</th>
                  <th className="p-3 text-center font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const badge = roleBadge[u.role];
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cebio-green-light flex items-center justify-center text-primary-foreground font-semibold text-xs">
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-semibold text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{u.institution}</td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${u.is_active ? "bg-cebio-green-bg text-primary" : "bg-cebio-red-bg text-cebio-red"}`}>
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(u.last_login).toLocaleDateString("pt-BR")}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <button className="p-1.5 rounded hover:bg-muted" title="Ver detalhes"><Eye className="w-4 h-4 text-cebio-blue" /></button>
                          <button className="p-1.5 rounded hover:bg-muted" title="Resetar senha"><KeyRound className="w-4 h-4 text-cebio-yellow" /></button>
                          <button className="p-1.5 rounded hover:bg-muted" title={u.is_active ? "Desativar" : "Ativar"}>
                            {u.is_active ? <UserX className="w-4 h-4 text-cebio-red" /> : <UserCheck className="w-4 h-4 text-primary" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-4 text-sm text-muted-foreground border-t border-border">
              Mostrando {filtered.length} de {mockUsers.length} usuários
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
