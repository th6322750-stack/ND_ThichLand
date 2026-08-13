import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext, SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import HomePage from "@/app/(public)/page";
import ChoThuePage from "@/app/(public)/cho-thue/page";
import DuAnPage from "@/app/(public)/du-an/page";
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
  return axe(container).then((results) => {
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    if (serious.length > 0) {
      console.error(JSON.stringify(serious, null, 2));
    }
    expect(serious).toHaveLength(0);
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
    const { container } = render(await DuAnPage());
    await expectNoSeriousViolations(container);
  });

  it("about page has no serious axe violations", async () => {
    const { container } = render(<GioiThieuPage />);
    await expectNoSeriousViolations(container);
  });

  it("news list page has no serious axe violations", async () => {
    const { container } = render(withRouter(<TinTucPage />, "/tin-tuc"));
    await expectNoSeriousViolations(container);
  });

  it("contact page has no serious axe violations", async () => {
    const { container } = render(<LienHePage />);
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
