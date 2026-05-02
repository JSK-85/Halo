import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";

import appCss from "../styles.css?url";

const GOOGLE_CLIENT_ID = "683137885756-h3qnm5req3as69o0v7d20qo890jesver.apps.googleusercontent.com";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Halo — a voice console" },
      { name: "description", content: "A quiet, real-time voice assistant. Speak naturally; Halo listens, thinks, and replies." },
      { name: "author", content: "Halo" },
      { property: "og:title", content: "Halo — a voice console" },
      { property: "og:description", content: "A quiet, real-time voice assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Halo" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { ConnectionProvider } from "@/lib/connection-context";
import { AuthProvider } from "@/lib/auth-context";
import { SignInGate } from "@/components/SignInGate";

function RootComponent() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ConnectionProvider>
          <SignInGate>
            <Outlet />
          </SignInGate>
        </ConnectionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
