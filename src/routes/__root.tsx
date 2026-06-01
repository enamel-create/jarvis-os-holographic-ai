import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="hud-panel max-w-md p-8 text-center">
        <h1 className="font-display text-6xl text-primary text-glow">404</h1>
        <h2 className="mt-3 text-sm tracking-[0.3em] text-foreground">SIGNAL · LOST</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          The route you requested is not in the registry.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-primary/60 bg-primary/10 px-4 py-2 text-xs tracking-widest text-primary hover:bg-primary/20"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="hud-panel max-w-md p-8 text-center">
        <h1 className="font-display text-lg tracking-[0.3em] text-destructive">SYSTEM FAULT</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          The subsystem failed to initialise. Try reloading the module.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="border border-primary/60 bg-primary/10 px-4 py-2 text-xs tracking-widest text-primary hover:bg-primary/20"
          >
            RETRY
          </button>
          <a
            href="/"
            className="border border-primary/30 px-4 py-2 text-xs tracking-widest text-foreground hover:border-primary/60"
          >
            HOME
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JARVIS OS — Gesture Controlled Particle Intelligence" },
      { name: "description", content: "A holographic AI-inspired particle operating system. Three.js, GLSL shaders, and a cinematic HUD." },
      { property: "og:title", content: "JARVIS OS" },
      { property: "og:description", content: "Gesture Controlled Particle Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="jarvis">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
