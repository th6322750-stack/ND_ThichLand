import routes from "../../.webby/visual-handoff/routes.json";
import adminRenders from "../../.webby/visual-handoff/admin-renders.json";

export interface Capture {
  route: string;
  navigateTo: string;
  viewport: "WEB" | "MOBILE" | "ADMIN";
  width: number;
  approvedPng: string;
}

// Approved renders map to route *patterns*; substitute a real slug for dynamic
// routes so the capture script navigates to a page that actually exists.
const SAMPLE_SLUG: Record<string, string> = {
  "/cho-thue/[slug]": "/cho-thue/can-ho-2pn-noi-that-day-du-p301",
  "/du-an/[slug]": "/du-an/sun-galaxy-complex",
  "/tin-tuc/[slug]": "/tin-tuc/checklist-xem-can-ho-truoc-khi-ky-hop-dong",
};

function resolveRoute(route: string): string {
  return SAMPLE_SLUG[route] ?? route;
}

export const publicCaptures: Capture[] = Object.entries(routes.routes).flatMap(
  ([route, viewports]) => [
    {
      route,
      navigateTo: resolveRoute(route),
      viewport: "WEB" as const,
      width: 1920,
      approvedPng: `.webby/visual-handoff/${viewports.desktop}`,
    },
    {
      route,
      navigateTo: resolveRoute(route),
      viewport: "MOBILE" as const,
      width: 390,
      approvedPng: `.webby/visual-handoff/${viewports.mobile}`,
    },
  ],
);

const ADMIN_ROUTES = [
  "/admin/login",
  "/admin",
  "/admin/bds",
  "/admin/bds/new",
  "/admin/du-an",
  "/admin/du-an/new",
  "/admin/tin-tuc",
  "/admin/tin-tuc/new",
  "/admin/media",
];

export const adminCaptures: Capture[] = adminRenders.admin.map((entry, i) => ({
  route: ADMIN_ROUTES[i],
  navigateTo: ADMIN_ROUTES[i],
  viewport: "ADMIN" as const,
  width: 1920,
  approvedPng: `.webby/visual-handoff/${entry.render}`,
}));
