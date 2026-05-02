import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandIndicator } from "@/components/BrandIndicator";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "Voice — Halo" },
      {
        name: "description",
        content:
          "The voice behind Halo: a warm, low-latency conversational model tuned for natural turn-taking.",
      },
      { property: "og:title", content: "Voice — Halo" },
      {
        property: "og:description",
        content: "The voice behind Halo: warm, low-latency, and natural.",
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
  component: VoicePage,
});

function VoicePage() {
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
          The voice
        </p>
        <h1
          className="mb-8 text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Warm, <em className="italic" style={{ color: "var(--warm)" }}>unhurried</em>, present.
        </h1>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground">
          Halo speaks in a single, considered voice. It is tuned not for performance, but for
          presence — the small breaths and pauses that make a conversation feel like one.
        </p>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2"
          style={{ boxShadow: "var(--shadow-soft)" }}>
          {[
            { t: "Low latency", d: "Streaming synthesis under 300ms after the first thought arrives." },
            { t: "Natural cadence", d: "Inflection follows meaning, not punctuation." },
            { t: "Interruptible", d: "Stops mid-sentence the moment you begin to speak." },
            { t: "One voice", d: "No menus, no personas. Just a single, consistent tone." },
          ].map((f) => (
            <div key={f.t} className="bg-card p-8">
              <h3
                className="mb-2 text-lg tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {f.t}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mx-auto mt-12 mb-10 flex w-full max-w-6xl items-center justify-between px-8 text-xs text-muted-foreground">
        <span>Halo · v1.0</span>
        <span>Built on Pipecat &amp; LiveKit</span>
      </footer>
    </main>
  );
}
