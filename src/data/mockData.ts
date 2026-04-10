// Types and interfaces for the CEBIO system — aligned with backend entities

export interface ProjectAuthor {
  id: number;
  project_id: number;
  name: string;
  email: string;
  institution: string;
  role: string;
  order: number;
}

export interface ProjectComment {
  id: number;
  project_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploaded_by: number;
  created_at: string;
}

export interface ProjectLink {
  id: number;
  project_id: number;
  title: string;
  url: string;
  type: "repository" | "documentation" | "publication" | "other";
}

export interface ProjectVersion {
  id: number;
  project_id: number;
  version_number: number;
  changes_summary: string;
  created_by: number;
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  summary: string;
  description: string;
  keywords?: string[];
  category: string;
  academic_level: string;
  status: "pendente" | "em_revisao" | "aprovado" | "rejeitado";
  owner_id: number;
  owner_name: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  rejection_reason?: string;
  version: number;
  authors?: ProjectAuthor[];
  files?: ProjectFile[];
  links?: ProjectLink[];
  comments?: ProjectComment[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "pesquisador" | "bolsista";
  institution: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

export interface AuditLog {
  id: number;
  action: string;
  user_id: number;
  user_name: string;
  target_project_id?: number;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
  ip_address: string;
  created_at: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  is_active: boolean;
  project_count: number;
}

export interface AcademicLevel {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  updated_by?: number;
  updated_at: string;
}

// Fictional data for preview
export const mockUsers: User[] = [
  { id: 1, name: "Carlos Administrador", email: "admin@cebio.org.br", role: "admin", institution: "CEBIO", is_active: true, created_at: "2024-01-10T10:00:00Z", last_login: "2025-04-09T14:30:00Z" },
  { id: 2, name: "Dra. Maria Oliveira", email: "maria@ufmg.br", role: "pesquisador", institution: "UFMG", is_active: true, created_at: "2024-02-15T08:00:00Z", last_login: "2025-04-08T11:00:00Z" },
  { id: 3, name: "Dr. João Santos", email: "joao@usp.br", role: "pesquisador", institution: "USP", is_active: true, created_at: "2024-03-01T09:00:00Z", last_login: "2025-04-07T16:00:00Z" },
  { id: 4, name: "Ana Carolina Lima", email: "ana@ufmg.br", role: "bolsista", institution: "UFMG", is_active: true, created_at: "2024-04-10T07:00:00Z", last_login: "2025-04-09T09:00:00Z" },
  { id: 5, name: "Pedro Henrique Costa", email: "pedro@usp.br", role: "bolsista", institution: "USP", is_active: true, created_at: "2024-05-20T10:00:00Z", last_login: "2025-04-06T13:00:00Z" },
  { id: 6, name: "Dra. Fernanda Reis", email: "fernanda@unicamp.br", role: "pesquisador", institution: "UNICAMP", is_active: true, created_at: "2024-06-01T08:00:00Z", last_login: "2025-04-05T10:00:00Z" },
  { id: 7, name: "Lucas Martins", email: "lucas@ufmg.br", role: "bolsista", institution: "UFMG", is_active: false, created_at: "2024-07-15T09:00:00Z", last_login: "2025-02-10T11:00:00Z" },
  { id: 8, name: "Juliana Ferreira", email: "juliana@ufrj.br", role: "pesquisador", institution: "UFRJ", is_active: true, created_at: "2024-08-01T10:00:00Z", last_login: "2025-04-09T08:00:00Z" },
  { id: 9, name: "Rafael Almeida", email: "rafael@ufmg.br", role: "bolsista", institution: "UFMG", is_active: true, created_at: "2024-09-10T07:00:00Z", last_login: "2025-04-08T15:00:00Z" },
  { id: 10, name: "Camila Souza", email: "camila@usp.br", role: "bolsista", institution: "USP", is_active: true, created_at: "2024-10-05T08:00:00Z", last_login: "2025-04-04T12:00:00Z" },
];

export const mockProjects: Project[] = [
  { id: 1, title: "Bioinsumos para Controle de Pragas na Soja", summary: "Desenvolvimento de formulações biológicas para manejo integrado de pragas.", description: "Pesquisa focada na produção de bioinsumos à base de Bacillus thuringiensis para controle sustentável.", keywords: ["bioinsumos", "soja", "MIP"], category: "Controle Biológico", academic_level: "Doutorado", status: "aprovado", owner_id: 2, owner_name: "Dra. Maria Oliveira", owner_email: "maria@ufmg.br", created_at: "2024-06-15T10:00:00Z", updated_at: "2024-08-20T14:00:00Z", start_date: "2024-07-01", end_date: "2025-12-31", version: 2 },
  { id: 2, title: "Fertilizantes Orgânicos à Base de Algas Marinhas", summary: "Uso de macroalgas como fonte de nutrientes para agricultura sustentável.", description: "Avaliação da eficiência de extratos de Sargassum como biofertilizante em culturas de hortaliças.", keywords: ["algas", "fertilizante", "orgânico"], category: "Biofertilizantes", academic_level: "Mestrado", status: "aprovado", owner_id: 3, owner_name: "Dr. João Santos", owner_email: "joao@usp.br", created_at: "2024-07-20T08:00:00Z", updated_at: "2024-09-10T11:00:00Z", start_date: "2024-08-01", end_date: "2025-08-01", version: 1 },
  { id: 3, title: "Biorremediação de Solos Contaminados por Metais Pesados", summary: "Aplicação de consórcios microbianos para descontaminação de solos.", description: "Estudo utilizando bactérias e fungos micorrízicos para remoção de cádmio e chumbo em áreas degradadas.", keywords: ["biorremediação", "metais pesados", "solo"], category: "Biorremediação", academic_level: "Doutorado", status: "pendente", owner_id: 6, owner_name: "Dra. Fernanda Reis", owner_email: "fernanda@unicamp.br", created_at: "2025-01-10T09:00:00Z", updated_at: "2025-01-10T09:00:00Z", start_date: "2025-03-01", end_date: "2027-02-28", version: 1 },
  { id: 4, title: "Microbioma do Solo em Sistemas Agroflorestais", summary: "Caracterização da diversidade microbiana em SAFs no Cerrado.", description: "Análise metagenômica do microbioma do solo em diferentes sistemas agroflorestais comparados a monoculturas.", keywords: ["microbioma", "SAF", "cerrado"], category: "Microbiologia", academic_level: "Mestrado", status: "pendente", owner_id: 4, owner_name: "Ana Carolina Lima", owner_email: "ana@ufmg.br", created_at: "2025-02-05T07:00:00Z", updated_at: "2025-02-05T07:00:00Z", start_date: "2025-04-01", end_date: "2026-03-31", version: 1 },
  { id: 5, title: "Nematoides Entomopatogênicos no Controle de Broca-do-Café", summary: "Eficácia de Steinernema e Heterorhabditis contra Hypothenemus hampei.", description: "Ensaios de campo e laboratório para avaliar a virulência de NEPs nativos contra a broca-do-café.", keywords: ["nematoides", "café", "controle biológico"], category: "Controle Biológico", academic_level: "Graduação", status: "em_revisao", owner_id: 5, owner_name: "Pedro Henrique Costa", owner_email: "pedro@usp.br", created_at: "2025-01-25T10:00:00Z", updated_at: "2025-03-15T16:00:00Z", start_date: "2025-02-01", end_date: "2025-11-30", version: 3 },
  { id: 6, title: "Produção de Biogás a Partir de Resíduos Agrícolas", summary: "Otimização da digestão anaeróbia de palha de milho e bagaço de cana.", description: "Desenvolvimento de um reator piloto para produção de biogás utilizando co-digestão de resíduos agroindustriais.", keywords: ["biogás", "resíduos", "energia"], category: "Bioenergia", academic_level: "Doutorado", status: "aprovado", owner_id: 8, owner_name: "Juliana Ferreira", owner_email: "juliana@ufrj.br", created_at: "2024-09-10T08:00:00Z", updated_at: "2024-11-20T10:00:00Z", start_date: "2024-10-01", end_date: "2026-09-30", version: 1 },
  { id: 7, title: "Fungos Micorrízicos na Recuperação de Áreas Degradadas", summary: "Inoculação de FMAs em mudas para restauração ecológica.", description: "Avaliação do efeito de fungos micorrízicos arbusculares na sobrevivência e crescimento de espécies nativas do Cerrado.", keywords: ["micorriza", "restauração", "cerrado"], category: "Biorremediação", academic_level: "Mestrado", status: "rejeitado", owner_id: 9, owner_name: "Rafael Almeida", owner_email: "rafael@ufmg.br", created_at: "2024-11-05T07:00:00Z", updated_at: "2025-01-15T09:00:00Z", start_date: "2025-01-01", end_date: "2026-06-30", rejection_reason: "Metodologia insuficiente. Necessário detalhar protocolo de inoculação e delineamento experimental.", version: 1 },
  { id: 8, title: "Trichoderma como Promotor de Crescimento em Tomateiro", summary: "Avaliação de isolados de Trichoderma na promoção de crescimento.", description: "Seleção de cepas de Trichoderma spp. com potencial para bioestimulação e biocontrole em cultivo de tomate.", keywords: ["trichoderma", "tomate", "bioestimulante"], category: "Controle Biológico", academic_level: "Graduação", status: "pendente", owner_id: 10, owner_name: "Camila Souza", owner_email: "camila@usp.br", created_at: "2025-03-01T08:00:00Z", updated_at: "2025-03-01T08:00:00Z", start_date: "2025-04-01", end_date: "2025-12-15", version: 1 },
  { id: 9, title: "Biofilmes Bacterianos para Proteção de Sementes", summary: "Desenvolvimento de coating biológico para tratamento de sementes de milho.", description: "Formulação de biofilmes à base de Pseudomonas fluorescens para proteção contra fungos de solo.", keywords: ["biofilme", "sementes", "milho"], category: "Biofertilizantes", academic_level: "Mestrado", status: "aprovado", owner_id: 2, owner_name: "Dra. Maria Oliveira", owner_email: "maria@ufmg.br", created_at: "2024-08-20T09:00:00Z", updated_at: "2024-10-05T14:00:00Z", start_date: "2024-09-01", end_date: "2025-08-31", version: 2 },
  { id: 10, title: "Enzimas Lignocelulolíticas de Fungos do Cerrado", summary: "Prospecção de enzimas para hidrólise de biomassa lignocelulósica.", description: "Isolamento e caracterização de fungos produtores de celulases e xilanases a partir de solos do Cerrado.", keywords: ["enzimas", "fungos", "biomassa"], category: "Bioenergia", academic_level: "Doutorado", status: "em_revisao", owner_id: 3, owner_name: "Dr. João Santos", owner_email: "joao@usp.br", created_at: "2025-02-15T10:00:00Z", updated_at: "2025-03-20T11:00:00Z", start_date: "2025-04-01", end_date: "2027-03-31", version: 2 },
  { id: 11, title: "Biopesticidas à Base de Metarhizium para Cigarrinha", summary: "Formulação de biopesticida para controle de Mahanarva fimbriolata em cana.", description: "Desenvolvimento e teste de formulações granuladas do fungo Metarhizium anisopliae.", keywords: ["biopesticida", "cana", "cigarrinha"], category: "Controle Biológico", academic_level: "Mestrado", status: "rejeitado", owner_id: 4, owner_name: "Ana Carolina Lima", owner_email: "ana@ufmg.br", created_at: "2024-10-15T07:00:00Z", updated_at: "2024-12-20T10:00:00Z", rejection_reason: "Projeto similar já em andamento. Recomenda-se colaboração com o grupo existente.", version: 1 },
  { id: 12, title: "Fixação Biológica de Nitrogênio em Gramíneas Forrageiras", summary: "Seleção de estirpes de Azospirillum para pastagens tropicais.", description: "Avaliação de bactérias diazotróficas associativas em Brachiaria para redução de fertilização nitrogenada.", keywords: ["FBN", "azospirillum", "pastagem"], category: "Biofertilizantes", academic_level: "Doutorado", status: "aprovado", owner_id: 6, owner_name: "Dra. Fernanda Reis", owner_email: "fernanda@unicamp.br", created_at: "2024-05-10T08:00:00Z", updated_at: "2024-07-15T14:00:00Z", start_date: "2024-06-01", end_date: "2026-05-31", version: 1 },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 1, action: "LOGIN", user_id: 1, user_name: "Carlos Administrador", details: "Login realizado com sucesso", severity: "low", ip_address: "192.168.1.100", created_at: "2025-04-09T14:30:00Z" },
  { id: 2, action: "APPROVE_PROJECT", user_id: 1, user_name: "Carlos Administrador", target_project_id: 1, details: "Projeto 'Bioinsumos para Controle de Pragas na Soja' aprovado", severity: "medium", ip_address: "192.168.1.100", created_at: "2025-04-09T14:35:00Z" },
  { id: 3, action: "CREATE_PROJECT", user_id: 2, user_name: "Dra. Maria Oliveira", target_project_id: 9, details: "Novo projeto submetido: Biofilmes Bacterianos para Proteção de Sementes", severity: "low", ip_address: "10.0.0.45", created_at: "2025-04-08T11:20:00Z" },
  { id: 4, action: "REJECT_PROJECT", user_id: 1, user_name: "Carlos Administrador", target_project_id: 7, details: "Projeto 'Fungos Micorrízicos na Recuperação de Áreas Degradadas' rejeitado", severity: "high", ip_address: "192.168.1.100", created_at: "2025-04-07T16:45:00Z" },
  { id: 5, action: "CREATE_USER", user_id: 1, user_name: "Carlos Administrador", details: "Usuário 'Camila Souza' criado com perfil bolsista", severity: "medium", ip_address: "192.168.1.100", created_at: "2025-04-06T10:00:00Z" },
  { id: 6, action: "UPDATE_PROJECT", user_id: 3, user_name: "Dr. João Santos", target_project_id: 10, details: "Projeto atualizado: versão 2 submetida", severity: "low", ip_address: "10.0.0.78", created_at: "2025-04-05T09:15:00Z" },
  { id: 7, action: "BATCH_APPROVE", user_id: 1, user_name: "Carlos Administrador", details: "Aprovação em lote: 3 projetos aprovados", severity: "high", ip_address: "192.168.1.100", created_at: "2025-04-04T15:00:00Z" },
  { id: 8, action: "RESET_PASSWORD", user_id: 1, user_name: "Carlos Administrador", details: "Senha do usuário 'Lucas Martins' redefinida", severity: "high", ip_address: "192.168.1.100", created_at: "2025-04-03T11:30:00Z" },
  { id: 9, action: "LOGIN", user_id: 4, user_name: "Ana Carolina Lima", details: "Login realizado com sucesso", severity: "low", ip_address: "10.0.0.92", created_at: "2025-04-09T09:00:00Z" },
  { id: 10, action: "CREATE_CATEGORY", user_id: 1, user_name: "Carlos Administrador", details: "Categoria 'Bioenergia' criada", severity: "medium", ip_address: "192.168.1.100", created_at: "2025-04-02T08:00:00Z" },
];

export const mockCategories: Category[] = [
  { id: 1, name: "Controle Biológico", slug: "controle-biologico", description: "Projetos de controle biológico de pragas", color: "#1a9a4a", is_active: true, project_count: 4 },
  { id: 2, name: "Biofertilizantes", slug: "biofertilizantes", description: "Pesquisas em fertilizantes biológicos", color: "#2563eb", is_active: true, project_count: 3 },
  { id: 3, name: "Biorremediação", slug: "biorremediacao", description: "Técnicas de biorremediação ambiental", color: "#9333ea", is_active: true, project_count: 2 },
  { id: 4, name: "Bioenergia", slug: "bioenergia", description: "Produção de energia a partir de biomassa", color: "#ea580c", is_active: true, project_count: 2 },
  { id: 5, name: "Microbiologia", slug: "microbiologia", description: "Estudos microbiológicos aplicados", color: "#0891b2", is_active: true, project_count: 1 },
];

export const mockAcademicLevels: AcademicLevel[] = [
  { id: 1, name: "Graduação", slug: "graduacao", is_active: true },
  { id: 2, name: "Mestrado", slug: "mestrado", is_active: true },
  { id: 3, name: "Doutorado", slug: "doutorado", is_active: true },
  { id: 4, name: "Pós-Doutorado", slug: "pos-doutorado", is_active: true },
];

export const mockNotifications: Notification[] = [
  { id: 1, title: "Projeto Aprovado", message: "Seu projeto 'Bioinsumos para Controle de Pragas na Soja' foi aprovado!", type: "success", read: false, created_at: "2025-04-09T14:35:00Z" },
  { id: 2, title: "Novo Projeto Pendente", message: "O projeto 'Microbioma do Solo em SAFs' aguarda revisão.", type: "info", read: false, created_at: "2025-04-08T07:00:00Z" },
  { id: 3, title: "Projeto Rejeitado", message: "O projeto 'Fungos Micorrízicos' foi rejeitado. Verifique os comentários.", type: "warning", read: true, created_at: "2025-04-07T16:45:00Z" },
  { id: 4, title: "Bem-vindo ao CEBIO", message: "Sua conta foi criada com sucesso. Comece submetendo seu primeiro projeto.", type: "info", read: true, created_at: "2025-04-01T10:00:00Z" },
];
