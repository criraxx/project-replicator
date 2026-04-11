import React, { createContext, useContext, useState, useCallback } from "react";
import api from "@/services/api";

export type UserRole = "admin" | "pesquisador" | "bolsista";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cebio_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    // Always clear previous session data before logging in
    api.clearToken();
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    setUser(null);

    try {
      const data = await api.login(email, password);
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        institution: data.user.institution || "",
        must_change_password: data.user.must_change_password,
      };
      localStorage.setItem("cebio_user", JSON.stringify(userData));
      setUser(userData);
    } catch {
      // Mock fallback when backend is unavailable
      const mockUsers: Record<string, User> = {
        "admin@cebio.org.br": { id: 1, name: "Administrador", email: "admin@cebio.org.br", role: "admin", institution: "CEBIO Brasil" },
        "pesquisador@cebio.org.br": { id: 2, name: "Dr. Maria Santos", email: "pesquisador@cebio.org.br", role: "pesquisador", institution: "CEBIO Brasil - Centro de Excelência em Bioinsumos" },
        "bolsista@cebio.org.br": { id: 3, name: "João Silva", email: "bolsista@cebio.org.br", role: "bolsista", institution: "CEBIO Brasil - Centro de Excelência em Bioinsumos" },
      };
      const mockPasswords: Record<string, string> = {
        "admin@cebio.org.br": "admin123",
        "pesquisador@cebio.org.br": "pesq123",
        "bolsista@cebio.org.br": "bolsa123",
      };
      const mockUser = mockUsers[email];
      if (!mockUser || mockPasswords[email] !== password) {
        throw new Error("Credenciais inválidas");
      }
      localStorage.setItem("cebio_token", "mock-token");
      localStorage.setItem("cebio_user", JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem("cebio_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
