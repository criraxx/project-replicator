import { UserRole } from "@/contexts/AuthContext";

export const statusColors: Record<string, string> = {
  aprovado: "bg-cebio-green-bg text-primary",
  pendente: "bg-cebio-yellow-bg text-cebio-yellow",
  rejeitado: "bg-cebio-red-bg text-cebio-red",
  em_revisao: "bg-cebio-blue-bg text-cebio-blue",
  aguardando_autores: "bg-cebio-purple/10 text-cebio-purple",
};

export const statusLabels: Record<string, string> = {
  aprovado: "Aprovado",
  pendente: "Pendente",
  rejeitado: "Rejeitado",
  em_revisao: "Em Revisão",
  aguardando_autores: "Aguardando Autores",
};

export const roleBadge: Record<UserRole, { label: string; className: string }> = {
  admin: { label: "Administrador", className: "bg-primary text-primary-foreground" },
  pesquisador: { label: "Pesquisador", className: "bg-cebio-blue text-primary-foreground" },
  bolsista: { label: "Bolsista", className: "bg-cebio-purple text-primary-foreground" },
};

export const severityColors: Record<string, string> = {
  low: "bg-cebio-green-bg text-primary",
  medium: "bg-cebio-yellow-bg text-cebio-yellow",
  high: "bg-cebio-red-bg text-cebio-red",
  critical: "bg-destructive/10 text-destructive",
};
