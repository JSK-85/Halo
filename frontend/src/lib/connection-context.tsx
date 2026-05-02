import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface ConnectionContextValue {
  status: ConnectionStatus;
  setStatus: (s: ConnectionStatus) => void;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const value = useMemo(() => ({ status, setStatus }), [status]);
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) return { status: "disconnected" as ConnectionStatus, setStatus: () => {} };
  return ctx;
}
