import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth-context";
import { useState, type ReactNode } from "react";

export function SignInGate({ children }: { children: ReactNode }) {
  const { user, loading, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 fade-up">
          <div
            className="h-10 w-10 rounded-full"
            style={{
              background: "conic-gradient(var(--warm), transparent 30%)",
              animation: "spin 1s linear infinite",
            }}
          />
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in oklab, var(--warm) 8%, transparent), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 px-8 text-center fade-up">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--warm)", boxShadow: "0 0 8px var(--warm)" }}
          />
          <span
            className="text-sm font-medium tracking-[0.18em] uppercase text-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Halo
          </span>
        </div>

        {/* Heading */}
        <div className="flex flex-col items-center gap-4">
          <h1
            className="text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome <em className="italic" style={{ color: "var(--warm)" }}>back.</em>
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Sign in with your Google account to start talking.
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div
          className="rounded-2xl border border-border bg-card p-8"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {signingIn ? (
            <p className="text-sm text-muted-foreground">Signing in…</p>
          ) : (
            <GoogleLogin
              onSuccess={async (response) => {
                console.log("[SignIn] Google onSuccess fired, credential:", response.credential ? "present" : "missing");
                setError(null);
                if (response.credential) {
                  setSigningIn(true);
                  try {
                    await signIn(response.credential);
                    console.log("[SignIn] Backend auth succeeded!");
                  } catch (err: any) {
                    console.error("[SignIn] Backend auth failed:", err);
                    setError(err?.message || "Sign-in failed. Check if the backend server is running.");
                  } finally {
                    setSigningIn(false);
                  }
                } else {
                  setError("Google did not return a credential. Try again.");
                }
              }}
              onError={() => {
                console.error("[SignIn] Google Sign-In onError fired");
                setError("Google Sign-In failed. Make sure localhost:9090 is in your authorized origins.");
              }}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signin_with"
              width={280}
            />
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Your voice data is never stored. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 transition-colors hover:text-foreground">
            privacy policy
          </a>.
        </p>
      </div>
    </main>
  );
}
