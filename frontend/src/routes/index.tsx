import { createFileRoute, Link } from "@tanstack/react-router";
import { VoiceConsole } from "@/components/VoiceConsole";
import { BrandIndicator } from "@/components/BrandIndicator";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Halo — a voice console" },
      { name: "description", content: "A quiet, real-time voice assistant. Speak naturally; Halo listens, thinks, and replies." },
      { property: "og:title", content: "Halo — a voice console" },
      { property: "og:description", content: "A quiet, real-time voice assistant." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
}));

function Index() {
  const { user, signOut } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Subtle warm gradient field */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in oklab, var(--warm) 8%, transparent), transparent 70%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-7">
        <BrandIndicator />
        <nav className="flex items-center gap-7 text-xs text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href="#how">How it works</a>
          <Link
            to="/voice"
            className="transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Voice
          </Link>
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Privacy
          </Link>

          {/* User profile + sign out */}
          {user && (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-6 w-6 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className="text-xs font-medium text-foreground">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero / console */}
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-8 pt-12 pb-24 text-center">
        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-muted-foreground fade-up">
          A voice console
        </p>
        <h1
          className="mb-6 text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl fade-up"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {user ? (
            <>Hi, <em className="italic" style={{ color: "var(--warm)" }}>{user.name.split(" ")[0]}.</em></>
          ) : (
            <>Speak. <em className="italic" style={{ color: "var(--warm)" }}>Be heard.</em></>
          )}
        </h1>
        <p className="mb-16 max-w-md text-base leading-relaxed text-muted-foreground fade-up">
          A real-time conversation, rendered in warm, natural speech. No menus, no prompts to remember — just talk.
        </p>

        <VoiceConsole />
      </section>

      {/* Quiet feature row */}
      <section
        id="how"
        className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {[
          { k: "01", t: "Sub-second latency", d: "Streaming speech, streaming thought, streaming voice. End-to-end under 800ms." },
          { k: "02", t: "Natural turn-taking", d: "Interrupt at any moment. Halo listens, pauses, and gives the floor back." },
          { k: "03", t: "Memory between sessions", d: "Picks up where you left off. Forgets when you ask it to." },
        ].map((f) => (
          <div key={f.k} className="bg-card p-8">
            <div className="mb-6 font-mono text-[11px] tracking-widest text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {f.k}
            </div>
            <h3 className="mb-2 text-lg tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              {f.t}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="relative z-10 mx-auto mt-24 mb-10 flex w-full max-w-6xl items-center justify-between px-8 text-xs text-muted-foreground">
        <span>Halo · v1.0</span>
        <span>Built on Pipecat &amp; LiveKit</span>
      </footer>
    </main>
  );
}
