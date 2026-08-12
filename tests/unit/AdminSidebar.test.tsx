import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/admin/Sidebar";

describe("Admin Sidebar", () => {
  it("renders all five primary nav items with accessible names", () => {
    render(<Sidebar mobileOpen={false} onMobileClose={() => {}} />);
    ["Dashboard", "BĐS cho thuê", "Dự án", "Tin tức", "Media"].forEach((label) => {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    });
  });
});
