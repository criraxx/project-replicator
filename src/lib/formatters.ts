export const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export const formatDate = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

export const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const parseDateToISO = (v: string) => {
  const p = v.split("/");
  if (p.length === 3 && p[2].length === 4) return `${p[2]}-${p[1]}-${p[0]}`;
  return "";
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "A senha deve conter pelo menos uma letra maiúscula.";
  if (!/[a-z]/.test(password)) return "A senha deve conter pelo menos uma letra minúscula.";
  if (!/[0-9]/.test(password)) return "A senha deve conter pelo menos um número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A senha deve conter pelo menos um caractere especial (ex: @, #, $, !).";
  return null;
};
