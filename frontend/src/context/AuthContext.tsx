import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getDataFromCookieByKey, removeCookie, setKeyFromCookie } from "../lib/cookie";
import { postLogin, postSignup } from "../api/auth";
import { getUserProfile } from "../api/users";
import type { AuthUser, LoginPayload, Role, SignupPayload } from "../types/api";

interface DecodedToken {
  id: string;
  role: Role;
  exp: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getDataFromCookieByKey("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getUserProfile()
      .then(({ data }) => {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({ name: data.user.name, role: decoded.role });
      })
      .catch(() => {
        removeCookie("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const { data } = await postLogin(payload);
    const decoded = jwtDecode<DecodedToken>(data.token);
    setKeyFromCookie("token", data.token, decoded.exp);
    setUser({ name: data.user.name, role: decoded.role });
  }

  async function signup(payload: SignupPayload) {
    await postSignup(payload);
  }

  function logout() {
    removeCookie("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
