import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/api";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = async (email: string, password: string) => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
  };

  const register = async (email: string, password: string) => {
    await api.post("/auth/register", { email, password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
