import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";

export interface AuthUser {
  google_id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a valid session cookie
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch("/api/auth/me", { credentials: "include", signal: controller.signal })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout))
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (credential: string) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credential }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Authentication failed");
    const data = await res.json();
    setUser(data.user);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
