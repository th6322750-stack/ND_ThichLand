export const colors = {
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
} as const;

export const breakpoints = {
  mobileMax: 767,
  tabletMin: 768,
  desktopMin: 1024,
  wideMin: 1440,
} as const;

export const zIndex = {
  baseContent: 0,
  stickyHeader: 100,
  stickyMobileActions: 200,
  drawerBackdrop: 900,
  drawerPanel: 910,
  bottomSheetBackdrop: 920,
  bottomSheetPanel: 930,
  lightboxBackdrop: 1000,
  lightboxContent: 1010,
  toast: 1100,
} as const;

export const motion = {
  fast: "140ms ease",
  base: "220ms cubic-bezier(.2,.7,.2,1)",
} as const;
