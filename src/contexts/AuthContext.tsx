import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/services/api";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, validate cached session against the backend
  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem("cebio_token");
      const savedUser = localStorage.getItem("cebio_user");

      if (!savedToken || !savedUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Restore token so API client can use it
        api.setToken(savedToken);
        // Validate with backend — returns real user data
        const me = await api.getMe();
        const userData: User = {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          institution: me.institution || "",
          must_change_password: me.must_change_password,
        };
        localStorage.setItem("cebio_user", JSON.stringify(userData));
        setUser(userData);
      } catch {
        // Token invalid/expired — clear everything
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
      // api.login already sets the token in localStorage via api.setToken
      localStorage.setItem("cebio_user", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      throw new Error(err.message || "Não foi possível conectar ao servidor. Verifique se o backend está ativo.");
    }
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    localStorage.removeItem("cebio_user");
    localStorage.removeItem("cebio_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
