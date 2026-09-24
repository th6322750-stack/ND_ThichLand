import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountUp } from "@/components/public-v2/CountUp";

// jsdom implements neither IntersectionObserver nor matchMedia. That is
// exactly the degraded environment these components must survive — an
// optional fade must never be able to hide content or throw.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CountUp", () => {
  function stubReducedMotion() {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  }

  it("renders the final value immediately under prefers-reduced-motion", () => {
    stubReducedMotion();
    render(<CountUp value="500+" />);
    expect(screen.getByText("500+")).toBeInTheDocument();
  });

  it("keeps the suffix of mixed values like 24/7 and 100% when not animating", () => {
    stubReducedMotion();
    render(
      <>
        <CountUp value="24/7" />
        <CountUp value="100%" />
      </>,
    );
    expect(screen.getByText("24/7")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders a non-numeric value untouched instead of blanking it", () => {
    // No leading number to count, so it must pass straight through rather
    // than rendering an empty or zeroed metric.
    render(<CountUp value="Đang cập nhật" />);
    expect(screen.getByText("Đang cập nhật")).toBeInTheDocument();
  });

  it("counts from zero and settles on the real value when animating", async () => {
    render(<CountUp value="500+" />);
    // Starts at zero (the animation is running)...
    expect(screen.getByText("0+")).toBeInTheDocument();
    // ...and must always arrive at the true figure, never stall part-way.
    await screen.findByText("500+", undefined, { timeout: 3000 });
  });
});
