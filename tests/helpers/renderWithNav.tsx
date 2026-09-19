import { useState, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext, SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

/**
 * Renders a subtree inside the REAL Next.js client contexts, backed by an
 * in-memory URL. Public discovery state (rental filters/sort/saved view,
 * project filters) now lives in the URL, so those components call
 * useRouter()/useSearchParams() and cannot render in jsdom without a mounted
 * router.
 *
 * Deliberately provides the genuine contexts rather than vi.mock-ing
 * next/navigation: the module-level mock would also override the
 * AppRouterContext/PathnameContext providers other tests in this suite
 * already set up by hand.
 *
 * router.replace/push write to the same state useSearchParams reads, so a
 * test can drive the real click -> URL -> re-render cycle.
 */
function NavHarness({ children, initialUrl }: { children: ReactNode; initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [pathname, search = ""] = url.split("?");

  const router = {
    push: (next: string) => setUrl(next),
    replace: (next: string) => setUrl(next),
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => {},
  } as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

  return (
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value={pathname || "/"}>
        <SearchParamsContext.Provider value={new URLSearchParams(search)}>{children}</SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}

export function renderWithNav(ui: ReactNode, initialUrl = "/") {
  return render(<NavHarness initialUrl={initialUrl}>{ui}</NavHarness>);
}
