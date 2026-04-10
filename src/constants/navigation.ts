export interface NavItem {
  label: string;
  path: string;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Projetos", path: "/admin/projetos" },
  { label: "Usuários", path: "/admin/usuarios" },
  { label: "Ações Admin", path: "/admin/acoes" },
  { label: "Relatórios", path: "/admin/relatorios" },
  { label: "Auditoria", path: "/admin/auditoria" },
];

export const PESQUISADOR_NAV: NavItem[] = [
  { label: "Dashboard", path: "/pesquisador/dashboard" },
  { label: "Meus Projetos", path: "/pesquisador/projetos" },
  { label: "Nova Submissão", path: "/pesquisador/submissao" },
  { label: "Histórico", path: "/pesquisador/historico" },
];

export const BOLSISTA_NAV: NavItem[] = [
  { label: "Dashboard", path: "/bolsista/dashboard" },
  { label: "Meus Projetos", path: "/bolsista/projetos" },
  { label: "Nova Submissão", path: "/bolsista/submissao" },
  { label: "Histórico", path: "/bolsista/historico" },
];
