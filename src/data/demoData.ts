import type { Project, User, AuditLog, Notification, Category } from "./mockData";

export const demoUsers: Record<string, User & { cpf?: string }> = {
  admin: {
    id: 1, name: "Dr. Carlos Admin", email: "admin@cebio.com", role: "admin",
    institution: "IF Goiano", is_active: true, created_at: "2024-01-10", last_login: "2025-04-12", cpf: "000.000.000-00",
  },
  pesquisador: {
    id: 2, name: "Dra. Maria Pesquisadora", email: "maria@cebio.com", role: "pesquisador",
    institution: "IF Goiano - Campus Urutaí", is_active: true, created_at: "2024-03-15", last_login: "2025-04-11", cpf: "111.111.111-11",
  },
  bolsista: {
    id: 3, name: "João Bolsista", email: "joao@cebio.com", role: "bolsista",
    institution: "IF Goiano - Campus Rio Verde", is_active: true, created_at: "2024-06-20", last_login: "2025-04-10", cpf: "222.222.222-22",
  },
};

export const demoProjects: Project[] = [
  {
    id: 1, title: "Bioinsumos para Controle de Pragas em Soja", summary: "Pesquisa sobre uso de Trichoderma no controle biológico.",
    description: "Este projeto investiga o uso de fungos do gênero Trichoderma como agente de controle biológico contra pragas da soja, visando reduzir o uso de agrotóxicos e promover a agricultura sustentável.",
    keywords: ["bioinsumos", "soja", "Trichoderma"], category: "Controle Biológico", academic_level: "Mestrado",
    status: "aprovado", owner_id: 2, owner_name: "Dra. Maria Pesquisadora", owner_email: "maria@cebio.com",
    created_at: "2024-08-01", updated_at: "2024-10-15", start_date: "2024-09-01", end_date: "2025-09-01", version: 2,
    authors: [
      { id: 1, project_id: 1, name: "Dra. Maria Pesquisadora", email: "maria@cebio.com", institution: "IF Goiano", role: "Coordenadora", order: 1 },
      { id: 2, project_id: 1, name: "Dr. Pedro Silva", email: "pedro@ufg.com", institution: "UFG", role: "Co-orientador", order: 2 },
    ],
    links: [
      { id: 1, project_id: 1, title: "Currículo Lattes", url: "http://lattes.cnpq.br/123456", type: "other" },
      { id: 2, project_id: 1, title: "Repositório GitHub", url: "https://github.com/cebio/trichoderma", type: "repository" },
    ],
    files: [
      { id: 1, project_id: 1, filename: "projeto_trichoderma.pdf", original_name: "projeto_trichoderma.pdf", mime_type: "application/pdf", size: 2500000, uploaded_by: 2, created_at: "2024-08-01" },
    ],
    comments: [
      { id: 1, project_id: 1, user_id: 1, user_name: "Dr. Carlos Admin", content: "Excelente proposta! Aprovado.", created_at: "2024-10-15" },
    ],
  },
  {
    id: 2, title: "Isolamento de Bactérias Promotoras de Crescimento Vegetal", summary: "Estudo de bactérias do solo do cerrado goiano.",
    description: "Projeto focado no isolamento e caracterização de bactérias promotoras de crescimento vegetal (BPCV) encontradas em solos do cerrado goiano.",
    keywords: ["BPCV", "cerrado", "solo"], category: "Microbiologia", academic_level: "Doutorado",
    status: "pendente", owner_id: 2, owner_name: "Dra. Maria Pesquisadora", owner_email: "maria@cebio.com",
    created_at: "2025-02-10", updated_at: "2025-02-10", version: 1,
    authors: [
      { id: 3, project_id: 2, name: "Dra. Maria Pesquisadora", email: "maria@cebio.com", institution: "IF Goiano", role: "Coordenadora", order: 1 },
    ],
    links: [{ id: 3, project_id: 2, title: "Artigo Base", url: "https://doi.org/10.1234/example", type: "publication" }],
    files: [], comments: [],
  },
  {
    id: 3, title: "Produção de Biofertilizantes à Base de Algas Marinhas", summary: "Desenvolvimento de formulações com microalgas.",
    description: "Pesquisa para desenvolver biofertilizantes inovadores utilizando microalgas marinhas cultivadas em fotobiorreatores.",
    keywords: ["microalgas", "biofertilizante"], category: "Biotecnologia", academic_level: "Graduação",
    status: "em_revisao", owner_id: 3, owner_name: "João Bolsista", owner_email: "joao@cebio.com",
    created_at: "2025-01-20", updated_at: "2025-03-05", version: 1,
    authors: [
      { id: 4, project_id: 3, name: "João Bolsista", email: "joao@cebio.com", institution: "IF Goiano", role: "Autor Principal", order: 1 },
    ],
    links: [], files: [],
    comments: [
      { id: 2, project_id: 3, user_id: 1, user_name: "Dr. Carlos Admin", content: "Projeto em análise. Falta detalhar a metodologia.", created_at: "2025-03-05" },
    ],
  },
  {
    id: 4, title: "Avaliação de Nematoides Entomopatogênicos em Cana-de-Açúcar", summary: "Uso de nematoides para controle da broca.",
    description: "Estudo sobre eficácia de nematoides entomopatogênicos no controle biológico da broca-da-cana (Diatraea saccharalis).",
    keywords: ["nematoides", "cana-de-açúcar", "broca"], category: "Controle Biológico", academic_level: "Mestrado",
    status: "rejeitado", owner_id: 2, owner_name: "Dra. Maria Pesquisadora", owner_email: "maria@cebio.com",
    created_at: "2024-11-01", updated_at: "2025-01-20", version: 1,
    rejection_reason: "O projeto necessita de mais detalhes sobre a viabilidade econômica e parcerias institucionais.",
    authors: [
      { id: 5, project_id: 4, name: "Dra. Maria Pesquisadora", email: "maria@cebio.com", institution: "IF Goiano", role: "Coordenadora", order: 1 },
    ],
    links: [], files: [],
    comments: [
      { id: 3, project_id: 4, user_id: 1, user_name: "Dr. Carlos Admin", content: "Rejeitado: faltam dados de viabilidade econômica.", created_at: "2025-01-20" },
    ],
  },
  {
    id: 5, title: "Banco de Germoplasma de Fungos do Cerrado", summary: "Coleção e preservação de fungos nativos.",
    description: "Criação de um banco de germoplasma para preservar cepas de fungos encontrados no bioma cerrado goiano.",
    keywords: ["germoplasma", "fungos", "cerrado"], category: "Conservação", academic_level: "Pós-Doutorado",
    status: "devolvido", owner_id: 2, owner_name: "Dra. Maria Pesquisadora", owner_email: "maria@cebio.com",
    created_at: "2025-03-01", updated_at: "2025-04-01", version: 2,
    authors: [
      { id: 6, project_id: 5, name: "Dra. Maria Pesquisadora", email: "maria@cebio.com", institution: "IF Goiano", role: "Coordenadora", order: 1 },
      { id: 7, project_id: 5, name: "Ana Souza", email: "ana@ufg.com", institution: "UFG", role: "Colaboradora", order: 2 },
    ],
    links: [], files: [],
    comments: [
      { id: 4, project_id: 5, user_id: 1, user_name: "Dr. Carlos Admin", content: "Devolvido: favor incluir plano de manejo da coleção.", created_at: "2025-04-01" },
    ],
  },
  {
    id: 6, title: "Monitoramento Ambiental com Drones e IA", summary: "Uso de drones para monitorar áreas de plantio.",
    description: "Projeto piloto de monitoramento ambiental usando drones equipados com sensores e algoritmos de IA para análise de solo e culturas.",
    keywords: ["drone", "IA", "monitoramento"], category: "Tecnologia", academic_level: "Graduação",
    status: "aguardando_autores", owner_id: 3, owner_name: "João Bolsista", owner_email: "joao@cebio.com",
    created_at: "2025-04-05", updated_at: "2025-04-05", version: 1,
    authors: [
      { id: 8, project_id: 6, name: "João Bolsista", email: "joao@cebio.com", institution: "IF Goiano", role: "Autor Principal", order: 1 },
      { id: 9, project_id: 6, name: "Luciana Ferreira", email: "luciana@ifgoiano.edu.br", institution: "IF Goiano", role: "Orientadora", order: 2 },
    ],
    links: [{ id: 4, project_id: 6, title: "Documentação Técnica", url: "https://docs.example.com/drone", type: "documentation" }],
    files: [], comments: [],
  },
  {
    id: 7, title: "Compostagem Acelerada com Microrganismos Eficientes", summary: "Técnica de compostagem rápida para pequenos produtores.",
    description: "Desenvolvimento de método de compostagem acelerada usando consórcios de microrganismos eficientes, voltado para agricultura familiar.",
    keywords: ["compostagem", "microrganismos", "agricultura familiar"], category: "Sustentabilidade", academic_level: "Graduação",
    status: "rascunho", owner_id: 3, owner_name: "João Bolsista", owner_email: "joao@cebio.com",
    created_at: "2025-04-10", updated_at: "2025-04-10", version: 1,
    authors: [
      { id: 10, project_id: 7, name: "João Bolsista", email: "joao@cebio.com", institution: "IF Goiano", role: "Autor Principal", order: 1 },
    ],
    links: [], files: [], comments: [],
  },
];

export const demoNotifications: Notification[] = [
  { id: 1, title: "Projeto Aprovado", message: "Seu projeto 'Bioinsumos para Controle de Pragas em Soja' foi aprovado!", type: "success", read: false, created_at: "2025-04-12T10:00:00" },
  { id: 2, title: "Projeto Devolvido", message: "O projeto 'Banco de Germoplasma' foi devolvido para ajustes.", type: "warning", read: false, created_at: "2025-04-01T14:00:00" },
  { id: 3, title: "Novo Colaborador", message: "Luciana Ferreira foi adicionada como colaboradora no projeto de Drones.", type: "info", read: true, created_at: "2025-04-05T09:00:00" },
  { id: 4, title: "Projeto Rejeitado", message: "O projeto 'Nematoides em Cana' foi rejeitado. Veja os motivos.", type: "error", read: true, created_at: "2025-01-20T16:00:00" },
];

export const demoAuditLogs: AuditLog[] = [
  { id: 1, action: "Projeto aprovado", user_id: 1, user_name: "Dr. Carlos Admin", target_project_id: 1, details: "Projeto #1 aprovado pelo administrador", severity: "medium", ip_address: "192.168.1.100", created_at: "2024-10-15T10:30:00" },
  { id: 2, action: "Projeto rejeitado", user_id: 1, user_name: "Dr. Carlos Admin", target_project_id: 4, details: "Projeto #4 rejeitado - falta viabilidade econômica", severity: "medium", ip_address: "192.168.1.100", created_at: "2025-01-20T16:00:00" },
  { id: 3, action: "Projeto devolvido", user_id: 1, user_name: "Dr. Carlos Admin", target_project_id: 5, details: "Projeto #5 devolvido para ajustes", severity: "low", ip_address: "192.168.1.100", created_at: "2025-04-01T14:00:00" },
  { id: 4, action: "Login realizado", user_id: 2, user_name: "Dra. Maria Pesquisadora", details: "Login via navegador Chrome", severity: "low", ip_address: "10.0.0.50", created_at: "2025-04-11T08:00:00" },
  { id: 5, action: "Projeto submetido", user_id: 3, user_name: "João Bolsista", target_project_id: 6, details: "Novo projeto de Drones e IA submetido", severity: "low", ip_address: "10.0.0.75", created_at: "2025-04-05T09:00:00" },
];

export const demoCategories: Category[] = [
  { id: 1, name: "Controle Biológico", slug: "controle-biologico", description: "Pesquisas sobre controle biológico de pragas", color: "#22c55e", is_active: true, project_count: 2 },
  { id: 2, name: "Microbiologia", slug: "microbiologia", description: "Estudos microbiológicos", color: "#3b82f6", is_active: true, project_count: 1 },
  { id: 3, name: "Biotecnologia", slug: "biotecnologia", description: "Pesquisas em biotecnologia aplicada", color: "#8b5cf6", is_active: true, project_count: 1 },
  { id: 4, name: "Conservação", slug: "conservacao", description: "Conservação de recursos genéticos", color: "#f59e0b", is_active: true, project_count: 1 },
  { id: 5, name: "Tecnologia", slug: "tecnologia", description: "Tecnologias aplicadas ao campo", color: "#06b6d4", is_active: true, project_count: 1 },
  { id: 6, name: "Sustentabilidade", slug: "sustentabilidade", description: "Práticas sustentáveis", color: "#10b981", is_active: true, project_count: 1 },
];

export const demoAllUsers: User[] = [
  demoUsers.admin as User,
  demoUsers.pesquisador as User,
  demoUsers.bolsista as User,
  { id: 4, name: "Dr. Pedro Silva", email: "pedro@ufg.com", role: "pesquisador", institution: "UFG", is_active: true, created_at: "2024-05-10", last_login: "2025-03-20" },
  { id: 5, name: "Ana Souza", email: "ana@ufg.com", role: "pesquisador", institution: "UFG", is_active: true, created_at: "2024-07-01", last_login: "2025-04-02" },
  { id: 6, name: "Luciana Ferreira", email: "luciana@ifgoiano.edu.br", role: "pesquisador", institution: "IF Goiano", is_active: true, created_at: "2024-09-15", last_login: "2025-04-06" },
  { id: 7, name: "Carlos Inativo", email: "carlos@test.com", role: "bolsista", institution: "IF Goiano", is_active: false, created_at: "2023-01-01", last_login: "2024-01-15" },
];
