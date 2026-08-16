import type { Config } from "tailwindcss";

// Every value below is copied verbatim from .webby/tokens.json, .webby/typography.json,
// .webby/layer-map.json, .webby/responsive.json and .webby/interactions.json.
// Do not add Tailwind default palette/spacing/screens on top of this theme.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: {
      tablet: "768px",
      desktop: "1024px",
      wide: "1440px",
    },
    colors: {
      primary: "#8A1822",
      primaryHover: "#70131B",
      gold: "#BE8A3F",
      ink: "#171717",
      body: "#4D4D4D",
      muted: "#7A7A7A",
      line: "#E8E2DF",
      surface: "#FFFFFF",
      soft: "#F8F6F4",
      footer: "#151515",
      success: "#23825C",
      error: "#C43D45",
      transparent: "transparent",
      current: "currentColor",
      black: "#000000",
      white: "#FFFFFF",
    },
    spacing: {
      0: "0px",
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "20px",
      6: "24px",
      8: "32px",
      10: "40px",
      12: "48px",
      16: "64px",
      20: "80px",
      24: "96px",
    },
    borderRadius: {
      none: "0px",
      sm: "6px",
      md: "10px",
      lg: "14px",
      xl: "20px",
      "2xl": "28px",
      full: "999px",
    },
    fontFamily: {
      sans: ["var(--font-be-vietnam-pro)", "Noto Sans", "Arial", "sans-serif"],
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    extend: {
      fontSize: {
        display: ["56px", { lineHeight: "1.12", fontWeight: "800" }],
        "display-mobile": ["36px", { lineHeight: "1.12", fontWeight: "800" }],
        h1: ["42px", { lineHeight: "1.18", fontWeight: "800" }],
        "h1-mobile": ["30px", { lineHeight: "1.18", fontWeight: "800" }],
        h2: ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        "h2-mobile": ["25px", { lineHeight: "1.25", fontWeight: "700" }],
        h3: ["22px", { lineHeight: "1.32", fontWeight: "700" }],
        "h3-mobile": ["20px", { lineHeight: "1.32", fontWeight: "700" }],
        "body-lg": ["17px", { lineHeight: "1.68", fontWeight: "400" }],
        "body-lg-mobile": ["16px", { lineHeight: "1.68", fontWeight: "400" }],
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-mobile": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.4", fontWeight: "600" }],
        button: ["13px", { lineHeight: "1", fontWeight: "700" }],
        price: ["18px", { lineHeight: "1.25", fontWeight: "800" }],
        "admin-title": ["28px", { lineHeight: "1.25", fontWeight: "700" }],
        "admin-title-mobile": ["24px", { lineHeight: "1.25", fontWeight: "700" }],

        // V2 PREMIUM WIDE SCALE (>=1440px, applied via the `wide:` variant)
        // — additive, `v2-` prefixed so nothing here can collide with or
        // change the tokens above (legacy/admin keep their exact values).
        "v2-hero": ["56px", { lineHeight: "62px", fontWeight: "800" }],
        "v2-h1": ["44px", { lineHeight: "52px", fontWeight: "800" }],
        "v2-h2": ["30px", { lineHeight: "38px", fontWeight: "800" }],
        "v2-h3": ["18px", { lineHeight: "25px", fontWeight: "700" }],
        "v2-body-lg": ["18px", { lineHeight: "30px", fontWeight: "400" }],
        "v2-body": ["16px", { lineHeight: "26px", fontWeight: "400" }],
        "v2-label": ["13px", { lineHeight: "19px", fontWeight: "600" }],
        "v2-caption": ["12px", { lineHeight: "18px", fontWeight: "500" }],
        "v2-button": ["15px", { lineHeight: "20px", fontWeight: "700" }],
        "v2-price": ["20px", { lineHeight: "26px", fontWeight: "800" }],
        "v2-nav": ["16px", { lineHeight: "22px", fontWeight: "600" }],
        "v2-viewall": ["14px", { lineHeight: "20px", fontWeight: "600" }],
      },
      zIndex: {
        base: "0",
        "sticky-header": "100",
        "sticky-mobile-actions": "200",
        "drawer-backdrop": "900",
        "drawer-panel": "910",
        "sheet-backdrop": "920",
        "sheet-panel": "930",
        "lightbox-backdrop": "1000",
        "lightbox-content": "1010",
        toast: "1100",
      },
      transitionTimingFunction: {
        base: "cubic-bezier(.2,.7,.2,1)",
      },
      transitionDuration: {
        fast: "140ms",
        base: "220ms",
        // Third step of the motion scale, for panel/sheet enters that need
        // more travel than a hover state. Same easing as the other two.
        slow: "300ms",
      },
      keyframes: {
        "v2-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // Overlay panels: travel + fade together so the panel reads as
        // arriving rather than blinking into place.
        "v2-sheet-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "v2-drawer-in": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        // Above-the-fold entrance. Runs on load (no observer needed — it is
        // already on screen), staggered via inline animationDelay so the
        // headline, subtitle and CTAs arrive in reading order.
        "v2-rise-in": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // The hero photograph settles out of a very slight over-scale, which
        // reads as the image coming to rest rather than popping in.
        "v2-hero-settle": {
          from: { opacity: "0", transform: "scale(1.05)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "v2-fade-in": "v2-fade-in 220ms cubic-bezier(.2,.7,.2,1)",
        "v2-sheet-up": "v2-sheet-up 240ms cubic-bezier(.2,.7,.2,1)",
        "v2-drawer-in": "v2-drawer-in 240ms cubic-bezier(.2,.7,.2,1)",
        // `both` so the element holds its from-state during any delay
        // instead of flashing at full opacity first.
        "v2-rise-in": "v2-rise-in 620ms cubic-bezier(.2,.7,.2,1) both",
        "v2-hero-settle": "v2-hero-settle 1100ms cubic-bezier(.2,.7,.2,1) both",
      },
      maxWidth: {
        page: "1240px",
      },
      boxShadow: {
        "v2-premium": "0 8px 28px rgba(12,13,13,.07)",
        "v2-premium-hover": "0 14px 40px rgba(12,13,13,.11)",
      },
    },
  },
  plugins: [],
};

export default config;
