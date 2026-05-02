import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandIndicator } from "@/components/BrandIndicator";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Halo" },
      {
        name: "description",
        content:
          "How Halo handles your voice: what's processed in real time, what's stored, and what's yours to delete.",
      },
      { property: "og:title", content: "Privacy — Halo" },
      {
        property: "og:description",
        content: "How Halo handles your voice — clearly, and on your terms.",
      },
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
  component: PrivacyPage,
});

function PrivacyPage() {
  const sections = [
    {
      k: "01",
      t: "What's processed",
      d: "Your microphone audio is streamed in real time to transcribe speech and generate a reply. Audio is processed in transit and discarded once the turn is complete.",
    },
    {
      k: "02",
      t: "What's stored",
      d: "Conversation transcripts are stored only when memory between sessions is enabled. Raw audio is never retained.",
    },
    {
      k: "03",
      t: "What's yours",
      d: "You can clear memory at any time, in any session, by asking Halo to forget. Deletion is immediate and irreversible.",
    },
    {
      k: "04",
      t: "Who has access",
      d: "Transcripts are accessible only to your account. They are not used to train models and are not shared with third parties.",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in oklab, var(--warm) 8%, transparent), transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-7">
        <Link to="/">
          <BrandIndicator />
        </Link>
        <nav className="flex items-center gap-7 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Console
          </Link>
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
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-8 pt-16 pb-24">
        <p className="mb-5 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Privacy
        </p>
        <h1
          className="mb-8 text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Clearly, and <em className="italic" style={{ color: "var(--warm)" }}>on your terms.</em>
        </h1>
        <p className="mb-12 max-w-xl text-base leading-relaxed text-muted-foreground">
          Voice is intimate. Halo is built around that — minimal retention, no background
          listening, and a clear line between what's processed and what's stored.
        </p>

        <div className="space-y-px overflow-hidden rounded-3xl border border-border bg-border"
          style={{ boxShadow: "var(--shadow-soft)" }}>
          {sections.map((s) => (
            <div key={s.k} className="grid grid-cols-[auto_1fr] gap-8 bg-card p-8">
              <div
                className="font-mono text-[11px] tracking-widest text-muted-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.k}
              </div>
              <div>
                <h3
                  className="mb-2 text-lg tracking-tight text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.t}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Last updated May 1, 2026.
        </p>
      </section>

      <footer className="relative z-10 mx-auto mt-12 mb-10 flex w-full max-w-6xl items-center justify-between px-8 text-xs text-muted-foreground">
        <span>Halo · v1.0</span>
        <span>Built on Pipecat &amp; LiveKit</span>
      </footer>
    </main>
  );
}
