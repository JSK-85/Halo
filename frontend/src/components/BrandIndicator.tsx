import { useConnection } from "@/lib/connection-context";

export function BrandIndicator() {
  const { status } = useConnection();
  const connected = status === "connected";
  const connecting = status === "connecting";

  const dotColor = connected ? "var(--warm)" : "oklch(0.18 0.01 60)";
  const dotShadow = connected ? "0 0 14px var(--warm)" : "none";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`h-2 w-2 rounded-full transition-all duration-500 ${connecting ? "animate-pulse" : ""}`}
        style={{ background: dotColor, boxShadow: dotShadow }}
      />
      <span
        className="text-sm font-medium tracking-tight transition-colors duration-500"
        style={{ color: connected ? "var(--warm)" : "var(--foreground)" }}
      >
        {connected ? "Connected" : connecting ? "Connecting" : "Disconnected"}
      </span>
    </div>
  );
}
