import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/services/api";
import { demoUsers } from "@/data/demoData";

export type UserRole = "admin" | "pesquisador" | "bolsista";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  cpf?: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      // Check for demo session first
      const demoRole = localStorage.getItem("cebio_demo_role");
      if (demoRole && (demoRole === "admin" || demoRole === "pesquisador" || demoRole === "bolsista")) {
        const du = demoUsers[demoRole];
        setUser({ id: du.id, name: du.name, email: du.email, role: du.role as UserRole, institution: du.institution, cpf: du.cpf });
        setIsDemoMode(true);
        setIsLoading(false);
        return;
      }

      const savedToken = localStorage.getItem("cebio_token");
      const savedUser = localStorage.getItem("cebio_user");

      if (!savedToken || !savedUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        api.setToken(savedToken);
        const me = await api.getMe();
        const userData: User = {
          id: me.id, name: me.name, email: me.email, role: me.role,
          institution: me.institution || "", must_change_password: me.must_change_password,
        };
        localStorage.setItem("cebio_user", JSON.stringify(userData));
        setUser(userData);
      } catch {
        api.clearToken();
        localStorage.removeItem("cebio_user");
        localStorage.removeItem("cebio_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    api.clearToken();
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    localStorage.removeItem("cebio_demo_role");
    setUser(null);
    setIsDemoMode(false);

    try {
      const data = await api.login(email, password);
      const userData: User = {
        id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role,
        institution: data.user.institution || "", must_change_password: data.user.must_change_password,
      };
      localStorage.setItem("cebio_user", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.message || "Não foi possível conectar ao servidor.");
    }
  }, []);

  const loginDemo = useCallback((role: UserRole) => {
    api.clearToken();
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    localStorage.setItem("cebio_demo_role", role);
    const du = demoUsers[role];
    const userData: User = { id: du.id, name: du.name, email: du.email, role: du.role as UserRole, institution: du.institution, cpf: du.cpf };
    setUser(userData);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(async () => {
    if (!isDemoMode) {
      await api.logout();
    } else {
      api.clearToken();
    }
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    localStorage.removeItem("cebio_demo_role");
    setUser(null);
    setIsDemoMode(false);
  }, [isDemoMode]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isDemoMode, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
