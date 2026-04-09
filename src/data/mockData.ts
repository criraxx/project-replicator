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

// Empty data arrays — ready to be replaced by real API calls
export const mockProjects: Project[] = [];
export const mockUsers: User[] = [];
export const mockAuditLogs: AuditLog[] = [];
export const mockCategories: Category[] = [];
export const mockAcademicLevels: AcademicLevel[] = [];
export const mockNotifications: Notification[] = [];
