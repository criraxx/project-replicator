// Mock data and types for the CEBIO system — aligned with backend entities

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

// ---- MOCK DATA ----

export const mockProjects: Project[] = [
  { id: 1, title: "Biopesticidas para controle de pragas em culturas de soja", summary: "Desenvolvimento de biopesticidas à base de Bacillus thuringiensis", description: "Pesquisa focada no desenvolvimento de formulações biológicas...", keywords: ["biopesticida", "soja", "Bacillus"], category: "Bioinsumos", academic_level: "Mestrado", status: "aprovado", owner_id: 2, owner_name: "Dr. Carlos Silva", owner_email: "pesquisador@cebio.org.br", created_at: "2025-01-15T10:00:00Z", updated_at: "2025-03-10T14:00:00Z", version: 3 },
  { id: 2, title: "Biofertilizantes a base de microalgas", summary: "Estudo da eficácia de microalgas como biofertilizantes", description: "Avaliação do potencial de Chlorella e Spirulina...", keywords: ["microalgas", "biofertilizante"], category: "Biotecnologia", academic_level: "Doutorado", status: "pendente", owner_id: 2, owner_name: "Dr. Carlos Silva", owner_email: "pesquisador@cebio.org.br", created_at: "2025-02-20T08:30:00Z", updated_at: "2025-02-20T08:30:00Z", version: 1 },
  { id: 3, title: "Fungos entomopatogênicos no controle biológico", summary: "Isolamento e caracterização de fungos entomopatogênicos nativos", description: "Coleta e identificação de isolados de Beauveria bassiana...", keywords: ["fungos", "controle biológico"], category: "Meio Ambiente", academic_level: "Graduação", status: "em_revisao", owner_id: 3, owner_name: "Maria Santos", owner_email: "bolsista@cebio.org.br", created_at: "2025-03-01T09:00:00Z", updated_at: "2025-03-15T11:00:00Z", version: 2 },
  { id: 4, title: "Compostagem com microrganismos eficientes", summary: "Aceleração do processo de compostagem com EM", description: "Aplicação de microrganismos eficientes para otimizar...", keywords: ["compostagem", "microrganismos"], category: "Agronomia", academic_level: "Técnico", status: "rejeitado", owner_id: 4, owner_name: "João Pereira", owner_email: "joao@ifgoiano.edu.br", created_at: "2025-01-10T07:00:00Z", updated_at: "2025-02-05T16:00:00Z", rejection_reason: "Falta de detalhamento metodológico", version: 1 },
  { id: 5, title: "Bioestimulantes para produção de hortaliças orgânicas", summary: "Avaliação de bioestimulantes naturais em cultivo orgânico", description: "Testes com ácidos húmicos e fúlvicos...", keywords: ["bioestimulantes", "orgânico"], category: "Bioinsumos", academic_level: "Mestrado", status: "aprovado", owner_id: 2, owner_name: "Dr. Carlos Silva", owner_email: "pesquisador@cebio.org.br", created_at: "2024-11-20T10:00:00Z", updated_at: "2025-01-10T09:00:00Z", version: 4 },
  { id: 6, title: "Rizobactérias promotoras de crescimento vegetal", summary: "Seleção de RPCP para inoculação em gramíneas forrageiras", description: "Isolamento de bactérias do gênero Azospirillum...", keywords: ["rizobactérias", "RPCP"], category: "Biotecnologia", academic_level: "Doutorado", status: "pendente", owner_id: 5, owner_name: "Pedro Almeida", owner_email: "pedro@ifgoiano.edu.br", created_at: "2025-03-20T14:00:00Z", updated_at: "2025-03-20T14:00:00Z", version: 1 },
  { id: 7, title: "Trichoderma no manejo de doenças do solo", summary: "Uso de Trichoderma harzianum como agente de biocontrole", description: "Avaliação in vitro e in vivo da eficácia...", keywords: ["Trichoderma", "biocontrole"], category: "Meio Ambiente", academic_level: "Graduação", status: "aprovado", owner_id: 3, owner_name: "Maria Santos", owner_email: "bolsista@cebio.org.br", created_at: "2024-10-05T08:00:00Z", updated_at: "2024-12-15T10:00:00Z", version: 5 },
  { id: 8, title: "Nematoides entomopatogênicos em controle biológico", summary: "Prospecção de nematoides para controle de insetos-praga", description: "Coleta de amostras de solo em diferentes biomas...", keywords: ["nematoides", "insetos-praga"], category: "Bioinsumos", academic_level: "Mestrado", status: "em_revisao", owner_id: 6, owner_name: "Luiza Fernandes", owner_email: "luiza@ifgoiano.edu.br", created_at: "2025-02-10T11:00:00Z", updated_at: "2025-03-18T15:00:00Z", version: 2 },
];

export const mockUsers: User[] = [
  { id: 1, name: "Administrador do Sistema", email: "admin@cebio.org.br", role: "admin", institution: "IF Goiano - Campus Iporá", is_active: true, created_at: "2024-01-01T00:00:00Z", last_login: "2025-04-09T08:00:00Z" },
  { id: 2, name: "Dr. Carlos Silva", email: "pesquisador@cebio.org.br", role: "pesquisador", institution: "IF Goiano - Campus Iporá", is_active: true, created_at: "2024-03-15T10:00:00Z", last_login: "2025-04-08T14:30:00Z" },
  { id: 3, name: "Maria Santos", email: "bolsista@cebio.org.br", role: "bolsista", institution: "IF Goiano - Campus Iporá", is_active: true, created_at: "2024-06-01T08:00:00Z", last_login: "2025-04-07T16:00:00Z" },
  { id: 4, name: "João Pereira", email: "joao@ifgoiano.edu.br", role: "bolsista", institution: "IF Goiano - Campus Iporá", is_active: false, created_at: "2024-04-20T09:00:00Z", last_login: "2025-01-15T11:00:00Z" },
  { id: 5, name: "Pedro Almeida", email: "pedro@ifgoiano.edu.br", role: "pesquisador", institution: "IF Goiano - Campus Urutaí", is_active: true, created_at: "2024-08-10T07:00:00Z", last_login: "2025-04-09T07:00:00Z" },
  { id: 6, name: "Luiza Fernandes", email: "luiza@ifgoiano.edu.br", role: "bolsista", institution: "IF Goiano - Campus Iporá", is_active: true, created_at: "2024-09-01T10:00:00Z", last_login: "2025-04-06T18:00:00Z" },
  { id: 7, name: "Dra. Ana Paula Oliveira", email: "ana@ifgoiano.edu.br", role: "pesquisador", institution: "IF Goiano - Campus Morrinhos", is_active: true, created_at: "2024-02-10T08:00:00Z", last_login: "2025-04-05T09:30:00Z" },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 1, action: "PROJECT_APPROVED", user_id: 1, user_name: "Administrador do Sistema", target_project_id: 1, details: "Projeto 'Biopesticidas' aprovado", severity: "medium", ip_address: "192.168.1.1", created_at: "2025-04-09T08:00:00Z" },
  { id: 2, action: "USER_CREATED", user_id: 1, user_name: "Administrador do Sistema", details: "Usuário 'Luiza Fernandes' criado", severity: "medium", ip_address: "192.168.1.1", created_at: "2025-04-08T14:00:00Z" },
  { id: 3, action: "PROJECT_SUBMITTED", user_id: 2, user_name: "Dr. Carlos Silva", target_project_id: 2, details: "Novo projeto submetido: 'Biofertilizantes'", severity: "low", ip_address: "10.0.0.5", created_at: "2025-04-08T08:30:00Z" },
  { id: 4, action: "PASSWORD_RESET", user_id: 1, user_name: "Administrador do Sistema", details: "Senha resetada para joao@ifgoiano.edu.br", severity: "high", ip_address: "192.168.1.1", created_at: "2025-04-07T16:00:00Z" },
  { id: 5, action: "PROJECT_REJECTED", user_id: 1, user_name: "Administrador do Sistema", target_project_id: 4, details: "Projeto 'Compostagem' rejeitado", severity: "medium", ip_address: "192.168.1.1", created_at: "2025-04-07T10:00:00Z" },
  { id: 6, action: "LOGIN_SUCCESS", user_id: 3, user_name: "Maria Santos", details: "Login realizado com sucesso", severity: "low", ip_address: "10.0.0.8", created_at: "2025-04-07T09:00:00Z" },
  { id: 7, action: "USER_DEACTIVATED", user_id: 1, user_name: "Administrador do Sistema", details: "Usuário 'João Pereira' desativado", severity: "high", ip_address: "192.168.1.1", created_at: "2025-04-06T15:00:00Z" },
  { id: 8, action: "PROJECT_UPDATED", user_id: 2, user_name: "Dr. Carlos Silva", target_project_id: 5, details: "Projeto 'Bioestimulantes' atualizado (v4)", severity: "low", ip_address: "10.0.0.5", created_at: "2025-04-06T11:00:00Z" },
];

export const mockCategories: Category[] = [
  { id: 1, name: "Bioinsumos", slug: "bioinsumos", description: "Projetos relacionados a bioinsumos agrícolas", color: "#2d9b8f", is_active: true, project_count: 3 },
  { id: 2, name: "Biotecnologia", slug: "biotecnologia", description: "Projetos de biotecnologia aplicada", color: "#1976d2", is_active: true, project_count: 2 },
  { id: 3, name: "Meio Ambiente", slug: "meio-ambiente", description: "Projetos de sustentabilidade e meio ambiente", color: "#388e3c", is_active: true, project_count: 2 },
  { id: 4, name: "Agronomia", slug: "agronomia", description: "Projetos de ciências agronômicas", color: "#f9a825", is_active: true, project_count: 1 },
  { id: 5, name: "Zootecnia", slug: "zootecnia", description: "Projetos de produção animal", color: "#7b1fa2", is_active: false, project_count: 0 },
];

export const mockAcademicLevels: AcademicLevel[] = [
  { id: 1, name: "Técnico", slug: "tecnico", is_active: true },
  { id: 2, name: "Graduação", slug: "graduacao", is_active: true },
  { id: 3, name: "Mestrado", slug: "mestrado", is_active: true },
  { id: 4, name: "Doutorado", slug: "doutorado", is_active: true },
  { id: 5, name: "Pós-Doutorado", slug: "pos-doutorado", is_active: true },
];

export const mockNotifications: Notification[] = [
  { id: 1, title: "Projeto aprovado", message: "Seu projeto 'Biopesticidas' foi aprovado!", type: "success", read: false, created_at: "2025-04-09T08:00:00Z" },
  { id: 2, title: "Nova submissão", message: "Um novo projeto foi submetido para revisão.", type: "info", read: false, created_at: "2025-04-08T14:00:00Z" },
  { id: 3, title: "Prazo próximo", message: "O projeto 'Biofertilizantes' tem prazo em 7 dias.", type: "warning", read: true, created_at: "2025-04-07T10:00:00Z" },
];
