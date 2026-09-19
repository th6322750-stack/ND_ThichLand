import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext, SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import HomePage from "@/app/(public-v2)/page";
import ChoThuePage from "@/app/(public-v2)/cho-thue/page";
import DuAnPage from "@/app/(public-v2)/du-an/page";
import GioiThieuPage from "@/app/(public)/gioi-thieu/page";
import TinTucPage from "@/app/(public)/tin-tuc/page";
import LienHePage from "@/app/(public)/lien-he/page";
import AdminLoginPage from "@/app/admin/login/page";
import { BdsForm } from "@/components/admin/BdsForm";

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
} as unknown as Parameters<typeof AppRouterContext.Provider>[0]["value"];

function withRouter(children: React.ReactNode, pathname = "/", search = "") {
  return (
    <AppRouterContext.Provider value={mockRouter}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={new URLSearchParams(search)}>
          {children}
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}

function expectNoSeriousViolations(container: Element) {
  // `iframes: false` — the homepage's contact panel embeds a Google Map, and
  // jsdom never gives that <iframe> a real content document, so axe's
  // cross-frame probe throws "Respondable target must be a frame in the
  // current window" before any rule runs. The frame's own a11y surface here
  // is its title attribute, which this container-level scan still checks.
  return axe(container, { iframes: false }).then((results) => {
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    if (serious.length > 0) {
      console.error(JSON.stringify(serious, null, 2));
    }
    expect(serious).toHaveLength(0);

    // axe's own detection ceiling is well short of 100% — rules it can't
    // resolve automatically (color-contrast doesn't even run under JSDOM;
    // see the real-browser Playwright layer for that) land here instead of
    // in `violations`, and silently dropping this array is how a real gap
    // stays invisible forever. Not a failing assertion — these need a human
    // judgment call, not a bot's pass/fail — but printed so it can't be
    // missed the way a truly ignored array is.
    if (results.incomplete.length > 0) {
      console.warn(
        `axe: ${results.incomplete.length} rule(s) need manual review — ${results.incomplete
          .map((i) => i.id)
          .join(", ")}`,
      );
    }
  });
}

describe("accessibility sweep", () => {
  it("homepage has no serious axe violations", async () => {
    const { container } = render(withRouter(await HomePage(), "/"));
    await expectNoSeriousViolations(container);
  });

  it("rental list page has no serious axe violations", async () => {
    const { container } = render(withRouter(await ChoThuePage(), "/cho-thue"));
    await expectNoSeriousViolations(container);
  });

  it("projects list page has no serious axe violations", async () => {
    // /du-an owns URL state now, so it needs the router contexts too.
    const { container } = render(withRouter(await DuAnPage(), "/du-an"));
    await expectNoSeriousViolations(container);
  });

  it("about page has no serious axe violations", async () => {
    const { container } = render(await GioiThieuPage());
    await expectNoSeriousViolations(container);
  });

  it("news list page has no serious axe violations", async () => {
    const { container } = render(withRouter(await TinTucPage(), "/tin-tuc"));
    await expectNoSeriousViolations(container);
  });

  it("contact page has no serious axe violations", async () => {
    const { container } = render(await LienHePage());
    await expectNoSeriousViolations(container);
  });

  it("admin login page has no serious axe violations", async () => {
    // AdminLoginPage is now an async Server Component (real getSession()
    // check) — resolve it first, same as Next.js's RSC renderer would.
    const { container } = render(withRouter(await AdminLoginPage()));
    await expectNoSeriousViolations(container);
  });

  it("BdsForm has no serious axe violations", async () => {
    const { container } = render(withRouter(<BdsForm />));
    await expectNoSeriousViolations(container);
  });
});
