import { describe, it, expect } from "vitest";
import tailwindConfig from "../../tailwind.config";
import { colors, zIndex, breakpoints } from "@/lib/tokens";
import lockedTokens from "../../.webby/tokens.json";
import lockedLayers from "../../.webby/layer-map.json";
import lockedResponsive from "../../.webby/responsive.json";

describe("design tokens stay locked to .webby", () => {
  it("colors match .webby/tokens.json exactly", () => {
    expect(colors.primary).toBe(lockedTokens.colors.primary);
    expect(colors.gold).toBe(lockedTokens.colors.gold);
    expect(colors.footer).toBe(lockedTokens.colors.footer);
  });

  it("z-index scale matches .webby/layer-map.json exactly", () => {
    expect(zIndex.stickyHeader).toBe(lockedLayers.layers.stickyHeader);
    expect(zIndex.lightboxContent).toBe(lockedLayers.layers.lightboxContent);
    expect(zIndex.toast).toBe(lockedLayers.layers.toast);
  });

  it("breakpoints match .webby/responsive.json exactly", () => {
    expect(breakpoints.desktopMin).toBe(lockedResponsive.breakpoints.desktopMin);
    expect(breakpoints.wideMin).toBe(lockedResponsive.breakpoints.wideMin);
  });

  it("tailwind theme colors object matches lib/tokens colors", () => {
    expect(tailwindConfig.theme?.colors).toMatchObject(colors);
  });
});
