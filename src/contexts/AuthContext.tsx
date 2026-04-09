import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "pesquisador" | "bolsista";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mock users aligned with backend seed.ts
const MOCK_USERS: Record<string, User & { password: string }> = {
  "admin@cebio.org.br": {
    id: 1, name: "Administrador do Sistema", email: "admin@cebio.org.br",
    role: "admin", institution: "IF Goiano - Campus Iporá", password: "admin123",
  },
  "pesquisador@cebio.org.br": {
    id: 2, name: "Dr. Carlos Silva", email: "pesquisador@cebio.org.br",
    role: "pesquisador", institution: "IF Goiano - Campus Iporá", password: "pesq123",
  },
  "bolsista@cebio.org.br": {
    id: 3, name: "Maria Santos", email: "bolsista@cebio.org.br",
    role: "bolsista", institution: "IF Goiano - Campus Iporá", password: "bolsa123",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("cebio_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser = MOCK_USERS[email];
    if (!mockUser || mockUser.password !== password) {
      throw new Error("Credenciais inválidas");
    }
    const { password: _, ...userData } = mockUser;
    localStorage.setItem("cebio_user", JSON.stringify(userData));
    localStorage.setItem("cebio_token", "mock-jwt-token");
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
