# NDTHICH GĐ4 Static Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the locked GĐ3 visual truth (NDTHICH, `uiRevision: 3`, `uiCommit: ff96ed9ea596071c14515a551cdf31d46f0b0f69`) as a working Next.js frontend covering all 9 public routes and all 9 Admin screens, with zero visual invention — every color, font, spacing, state, z-index and breakpoint value must trace back to a file under `.webby/`.

**Architecture:** Next.js 14 (App Router, TypeScript) on top of the existing `ND_ThichLand` repo. `.webby/` remains untouched (ChatGPT-owned visual truth); all implementation lives in `app/`, `components/`, `lib/`, `public/`, `tests/` (Claude-owned, per `webbyLucifer/references/AGENT_OWNERSHIP_PROTOCOL.md`). Tailwind CSS is configured with a tokens-only theme (no default palette/spacing) so nothing can silently fall back to library defaults. GĐ6 backend is out of scope: rental/project/news content is served from normalized mock fixtures that mirror the exact field names in `.webby/data-source-map.json`, so swapping in the real Google Sheets sync later is a data-layer change only.

**Tech Stack:** Next.js 14 App Router + TypeScript + React 18, Tailwind CSS v3 (custom theme only), `next/font/local` with self-hosted Be Vietnam Pro (OFL, fetched from `google/fonts/ofl/bevietnampro`), Vitest + React Testing Library (interactive-state/logic unit tests), Playwright (per-route screenshot capture for the visual QA loop), ESLint (`next/core-web-vitals` + `@typescript-eslint`) + Prettier.

## Global Constraints

These apply to every task below; do not re-derive them per task, and do not deviate without a new approved `.webby` revision.

- **Visual authority order (absolute):** 1) approved route PNG (`.webby/visual-handoff/renders/**`) → 2) matching SVG Master (`.webby/master/**`) → 3) `.webby/state-map.json` → 4) `.webby/layer-map.json` → 5) `.webby/visual-contract.json` → 6) component/placement/typography/token contracts → 7) browser implementation. Browser output is never truth; if it looks "better" but differs from the PNG, the PNG wins.
- **Font:** `Be Vietnam Pro` only, weights `400/500/600/700/800`, style `normal`, fallback `Noto Sans, Arial, sans-serif` (`.webby/font-manifest.json`, `.webby/typography.json`). Never substitute, never infer a missing weight.
- **Logo:** keep `NO_LOGO` placeholder (`.webby/assets/production/logos/NO_LOGO.svg`) exactly as rendered in the approved PNGs. Never invent, redraw, vectorize, or source a logo.
- **Future feature ban:** no "Đặt lịch xem nhà" / Viewing Request / Lead UI anywhere, public or admin — no CTA, modal, form, table, status field, or API stub (`.webby/future-features.json`).
- **Data privacy:** never publicly render `hoa hồng` (commission), `người dẫn` (guide person), `ghi chú nội bộ` (internal notes). These three fields may only appear inside the Admin BĐS form, inside the visually-distinct "INTERNAL-ONLY" panel shown in `04_Admin_BDS_Form` (cream/gold background, distinct from the public fields above it).
- **Public rental fields (allowed):** khu vực, địa chỉ, media, mã/số phòng, giá, phí dịch vụ, diện tích, thang, loại BĐS, mô tả, đặc điểm nổi bật, trạng thái (`.webby/content-map.json`).
- **Never render a raw Sheet row.** All rental/project/news data flows through the normalized shape defined in `.webby/data-source-map.json`.
- **z-index** comes only from `.webby/layer-map.json`: `baseContent:0, stickyHeader:100, stickyMobileActions:200, drawerBackdrop:900, drawerPanel:910, bottomSheetBackdrop:920, bottomSheetPanel:930, lightboxBackdrop:1000, lightboxContent:1010, toast:1100`. No ad hoc `z-index: 9999`.
- **Breakpoints** come only from `.webby/responsive.json`: `mobileMax:767, tabletMin:768, desktopMin:1024, wideMin:1440`.
- **Motion** comes only from `.webby/interactions.json`: `fast:140ms ease`, `base:220ms cubic-bezier(.2,.7,.2,1)`, and `prefers-reduced-motion` disables transforms/parallax and caps opacity transitions at 120ms.
- **Keyboard/behavior contracts** (`.webby/interactions.json`): mobile-nav and filter-drawer trap focus and close on `Escape`; gallery lightbox supports `ArrowLeft`/`ArrowRight`/`Escape`; form validation moves focus to the first invalid field and wires `aria-describedby`; phone CTAs use `tel:0986602203`; Zalo CTA falls back to the hotline until a production URL exists.
- **Commit convention:** `webby(impl): Task NN — <title>` per `webbyLucifer/references/BRANCH_COMMIT_PROTOCOL.md`. One commit per task, never a single giant commit for all of GĐ4.
- **Do not touch** anything under `.webby/` except reading it, and do not touch `.github/workflows/gd3-*` or `.github/workflows/materialize-gd3-source.yml` (ChatGPT-owned render pipeline).

## Route / Asset Ground Truth Index

| Route | Desktop PNG | Mobile PNG | SVG Master (WEB / MOBILE) | Sections (`.webby/section-map.json`) |
|---|---|---|---|---|
| `/` | `renders/WEB/01_TrangChu_WEB.png` | `renders/MOBILE/01_TrangChu_MOBILE.png` | `master/public/01_TrangChu_WEB.svg` / `_MOBILE.svg` | Header, Hero, SearchPanel, FeaturedProperties, FeaturedProjects, AboutPreview, NewsPreview, ContactCTA, Footer |
| `/cho-thue` | `02_ChoThue_WEB.png` | `02_ChoThue_MOBILE.png` | `02_ChoThue_WEB.svg` / `_MOBILE.svg` | Header, PageIntro, Search, FilterPanel, PropertyGrid, Pagination, Footer |
| `/cho-thue/[slug]` | `03_ChiTietChoThue_WEB.png` | `03_ChiTietChoThue_MOBILE.png` | `03_ChiTietChoThue_WEB.svg` / `_MOBILE.svg` | Header, Breadcrumb, Gallery, PropertySummary, Facts, ContactCTA, Description, Details, Media, Map, RelatedProperties, Footer |
| `/du-an` | `04_DuAn_WEB.png` | `04_DuAn_MOBILE.png` | `04_DuAn_WEB.svg` / `_MOBILE.svg` | Header, PageIntro, StatusTabs, ProjectGrid, BrandNote, Footer |
| `/du-an/[slug]` | `05_ChiTietDuAn_WEB.png` | `05_ChiTietDuAn_MOBILE.png` | `05_ChiTietDuAn_WEB.svg` / `_MOBILE.svg` | Header, Breadcrumb, ProjectHero, ContactCTA, Intro, ProjectFacts, Map, Amenities, Progress, Gallery, Footer |
| `/gioi-thieu` | `06_GioiThieu_WEB.png` | `06_GioiThieu_MOBILE.png` | `06_GioiThieu_WEB.svg` / `_MOBILE.svg` | Header, BrandHero, Stats, Values, BusinessAreas, ContactCTA, Footer |
| `/tin-tuc` | `07_TinTuc_WEB.png` | `07_TinTuc_MOBILE.png` | `07_TinTuc_WEB.svg` / `_MOBILE.svg` | Header, PageIntro, SearchCategories, NewsGrid, Pagination, ContactCTA, Footer |
| `/tin-tuc/[slug]` | `08_ChiTietTinTuc_WEB.png` | `08_ChiTietTinTuc_MOBILE.png` | `08_ChiTietTinTuc_WEB.svg` / `_MOBILE.svg` | Header, Breadcrumb, ArticleHero, ArticleBody, ContactCTA, RelatedNews, Footer |
| `/lien-he` | `09_LienHe_WEB.png` | `09_LienHe_MOBILE.png` | `09_LienHe_WEB.svg` / `_MOBILE.svg` | Header, ContactHero, ContactCards, ContactForm, Map, Footer |

All PNG/SVG paths above are relative to `.webby/visual-handoff/` and `.webby/` respectively. Admin screens use the same pattern against `.webby/visual-handoff/renders/ADMIN/0N_*.png` and `.webby/master/admin/0N_*.svg` (01 Login … 09 Media, see `.webby/visual-handoff/admin-renders.json`). System state sheets (`Admin_Component_States`, `Design_System_Master`, `Form_Overlay_States`, `Public_Component_States`) live under `renders/SYSTEM/` and `master/system/` — consult these whenever a component's non-default state isn't visible on a route PNG.

## File Structure

```
app/
  layout.tsx                    # root: font faces, <html lang="vi">, metadata
  globals.css                   # Tailwind layers + CSS resets, no default browser styling left visible
  (public)/
    layout.tsx                  # Header + Footer wrap, skip-link
    page.tsx                    # /
    cho-thue/page.tsx           # /cho-thue
    cho-thue/[slug]/page.tsx    # /cho-thue/[slug]
    du-an/page.tsx              # /du-an
    du-an/[slug]/page.tsx       # /du-an/[slug]
    gioi-thieu/page.tsx         # /gioi-thieu
    tin-tuc/page.tsx            # /tin-tuc
    tin-tuc/[slug]/page.tsx     # /tin-tuc/[slug]
    lien-he/page.tsx            # /lien-he
  admin/
    layout.tsx                  # sidebar + topbar shell, auth-gated
    login/page.tsx              # /admin/login
    page.tsx                    # /admin (dashboard)
    bds/page.tsx                # /admin/bds (list)
    bds/new/page.tsx            # /admin/bds/new
    bds/[id]/page.tsx           # /admin/bds/[id] (edit)
    du-an/page.tsx              # /admin/du-an (list)
    du-an/new/page.tsx
    du-an/[id]/page.tsx
    tin-tuc/page.tsx            # /admin/tin-tuc (list)
    tin-tuc/new/page.tsx
    tin-tuc/[id]/page.tsx
    media/page.tsx              # /admin/media
components/
  public/{Header,Footer,Button,PropertyCard,ProjectCard,NewsCard,FormField,Filter,FilterDrawer,Gallery,SearchPanel,Pagination,Breadcrumb,ContactCTA,MapEmbed}/index.tsx
  admin/{Sidebar,Topbar,DataTable,FormSection,Uploader,StatCard}/index.tsx
  icons/index.tsx               # thin SVG wrapper components, one per asset-manifest icon id
lib/
  tokens.ts                     # typed re-export of the Tailwind token values (colors/spacing/radii/zIndex/breakpoints)
  types.ts                      # PropertyListing, ProjectListing, NewsArticle, AdminPropertyRecord, etc.
  format.ts                     # formatCurrencyVnd, formatArea, formatAvailability
  normalize.ts                  # sheet-row -> PropertyListing normalization (mirrors data-source-map.json rules)
  data/
    properties.ts                # public-safe mock fixtures (12+ rows spanning every property_type)
    properties.admin.ts          # same records + commission/guide_person/internal_notes, admin-only import
    projects.ts
    news.ts
public/
  fonts/BeVietnamPro-{Regular,Medium,SemiBold,Bold,ExtraBold}.woff2
  assets/                        # copies of .webby/assets/production/** (icons, NO_LOGO, ornaments, placeholders)
tests/
  unit/                          # Vitest + RTL: focus trap, Escape-close, form validation, normalize.ts, format.ts
  visual/
    capture.ts                   # Playwright script: boots the dev server, screenshots every route at WEB (1920) and MOBILE (1080) widths
    manifest.ts                  # route -> approved PNG path table (mirrors visual-handoff/routes.json + admin-renders.json)
.webby/implementation/IMPLEMENTATION_RECEIPT.json   # written once, at the end of Task 12
tailwind.config.ts
next.config.mjs
tsconfig.json
package.json
playwright.config.ts
vitest.config.ts
.eslintrc.json
```

## Shared Types (produced in Task 01, consumed by every later task)

```typescript
// lib/types.ts
export type PropertyType = "Căn hộ" | "Nhà" | "Mặt bằng" | "Văn phòng" | "Xưởng" | "Studio";
export type Availability = "Còn trống" | "Đã cho thuê" | "Sắp trống";

export interface PropertyListing {
  slug: string;
  roomNo: string;              // mã/số phòng, e.g. "P.301 - Tòa A"
  location: string;             // khu vực, e.g. "Hà Nội"
  address: string;               // địa chỉ chuẩn hóa
  price: number;                  // VND / month, normalized integer
  serviceFee: string;             // phí dịch vụ, free text per Sheet ("Theo tháng", "Đã gồm")
  area: number;                   // m2, normalized number
  verticalAccess: string;         // "thang" e.g. "Thang bộ" | "Thang máy"
  propertyType: PropertyType;
  description: string;
  highlights: string[];
  availability: Availability;
  media: string[];                // resolved image URLs/paths, never raw Drive hyperlinks
}

export interface AdminPropertyRecord extends PropertyListing {
  commission: string;             // INTERNAL-ONLY
  guidePerson: string;            // INTERNAL-ONLY
  internalNotes: string;          // INTERNAL-ONLY
}

export interface ProjectListing {
  slug: string;
  name: string;
  location: string;
  status: "Đang triển khai" | "Tiêu biểu" | "Đã hoàn thành";
  media: string[];
  summary: string;
  amenities: string[];
  progressPercent: number;
}

export interface NewsArticle {
  slug: string;
  title: string;
  category: string;               // e.g. "Kinh nghiệm"
  publishedAt: string;             // ISO date
  readMinutes: number;
  excerpt: string;
  body: string;                    // rich text/markdown-ish string
  cover: string;
}
```

---

### Task 01: App shell, tooling, fonts, data layer

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`
- Create: `app/layout.tsx`, `app/globals.css`
- Create: `app/(public)/page.tsx` through all 8 other public route files, and `app/admin/**/page.tsx` for all 12 admin paths — each a minimal typed stub (`export default function Page() { return <main>TODO Task NN</main> }`) so the route tree and `next build` succeed before content lands
- Create: `lib/types.ts` (exact content above)
- Create: `lib/format.ts`, `lib/normalize.ts`, `lib/data/properties.ts`, `lib/data/properties.admin.ts`, `lib/data/projects.ts`, `lib/data/news.ts`
- Create: `public/fonts/*.woff2`, `public/assets/**` (copied from `.webby/assets/production/**`)
- Test: `tests/unit/format.test.ts`, `tests/unit/normalize.test.ts`

**Interfaces:**
- Produces: `lib/types.ts` (above), `formatCurrencyVnd(vnd: number): string` → `"12.000.000đ"`, `formatArea(m2: number): string` → `"70m²"`, `normalizePropertyRow(raw: Record<string, string>): PropertyListing | null` (returns `null` for group-separator rows per `data-source-map.json`).
- Consumes: nothing (first task).

- [ ] **Step 1: Scaffold Next.js 14 App Router project**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
Answer prompts to keep it non-interactive-safe (accept defaults). Verify `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` exist.

- [ ] **Step 2: Fetch Be Vietnam Pro OFL static weights and self-host them**

Fetch weights `400,500,600,700,800`, style `normal`, from `google/fonts` (`ofl/bevietnampro`) per `.webby/font-manifest.json`. Convert/save as:
```
public/fonts/BeVietnamPro-Regular.woff2    (400)
public/fonts/BeVietnamPro-Medium.woff2     (500)
public/fonts/BeVietnamPro-SemiBold.woff2   (600)
public/fonts/BeVietnamPro-Bold.woff2       (700)
public/fonts/BeVietnamPro-ExtraBold.woff2  (800)
```
Do not substitute a system font here even temporarily — `.webby/qa/FONT_RENDER_VERIFICATION.json` requires the resolved family to be `Be Vietnam Pro` with all five weights installed.

- [ ] **Step 3: Wire the font via `next/font/local` in `app/layout.tsx`**

```tsx
// app/layout.tsx
import localFont from "next/font/local";
import "./globals.css";

const beVietnamPro = localFont({
  src: [
    { path: "../public/fonts/BeVietnamPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-be-vietnam-pro",
  fallback: ["Noto Sans", "Arial", "sans-serif"],
  display: "swap",
});

export const metadata = {
  title: "NDTHICH LAND",
  description: "Công ty TNHH Đầu tư & Kinh doanh Nguyễn Đắc Thích",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="font-sans bg-surface text-ink">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Copy production assets into `public/assets`**

Copy every path listed in `.webby/asset-manifest.json` (`assets[].production`) into `public/assets/` preserving the `icons/`, `logos/`, `ornaments/`, `placeholders/` subfolders — e.g. `.webby/assets/production/icons/area.svg` → `public/assets/icons/area.svg`. Do not modify `.webby/assets/**` (read-only, ChatGPT-owned source).

- [ ] **Step 5: Write `lib/types.ts`**

Use the exact interfaces from the "Shared Types" section above verbatim.

- [ ] **Step 6: Write the failing tests for `lib/format.ts`**

```typescript
// tests/unit/format.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrencyVnd, formatArea } from "@/lib/format";

describe("formatCurrencyVnd", () => {
  it("formats whole VND with thousands separators and đ suffix", () => {
    expect(formatCurrencyVnd(12000000)).toBe("12.000.000đ");
    expect(formatCurrencyVnd(6500000)).toBe("6.500.000đ");
  });
});

describe("formatArea", () => {
  it("formats m2 with superscript unit", () => {
    expect(formatArea(70)).toBe("70m²");
    expect(formatArea(35.5)).toBe("35.5m²");
  });
});
```

- [ ] **Step 2b: Run test to verify it fails**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: FAIL — `Cannot find module '@/lib/format'`.

- [ ] **Step 7: Implement `lib/format.ts`**

```typescript
// lib/format.ts
export function formatCurrencyVnd(vnd: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(vnd))}đ`;
}

export function formatArea(m2: number): string {
  const value = Number.isInteger(m2) ? String(m2) : String(m2);
  return `${value}m²`;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run tests/unit/format.test.ts`
Expected: PASS (2/2).

- [ ] **Step 9: Write the failing test for `lib/normalize.ts`**

```typescript
// tests/unit/normalize.test.ts
import { describe, it, expect } from "vitest";
import { normalizePropertyRow } from "@/lib/normalize";

describe("normalizePropertyRow", () => {
  it("returns null for a group-separator row", () => {
    expect(normalizePropertyRow({ room_no: "", area: "", is_group_header: "true" })).toBeNull();
  });

  it("normalizes price/area strings to numbers and maps sheet columns", () => {
    const row = {
      room_no: "P.301 - Tòa A",
      location: "Hà Nội",
      address: "123 Đường Láng",
      price: "6.500.000",
      service_fee: "Theo tháng",
      area: "35",
      vertical_access: "Thang bộ",
      property_type: "Studio",
      description: "Studio ban công thoáng",
      highlights: "Ban công|Nội thất|Vào ngay",
      availability: "Còn trống",
      media: "https://drive.google.com/file/d/abc/view",
      commission: "Theo dữ liệu",
      guide_person: "Tên / SĐT",
      internal_notes: "Ghi chú vận hành",
    };
    const result = normalizePropertyRow(row);
    expect(result?.price).toBe(6500000);
    expect(result?.area).toBe(35);
    expect(result?.highlights).toEqual(["Ban công", "Nội thất", "Vào ngay"]);
    // internal-only fields must never leak onto the normalized public shape
    expect(result).not.toHaveProperty("commission");
    expect(result).not.toHaveProperty("guide_person");
    expect(result).not.toHaveProperty("internal_notes");
  });
});
```

- [ ] **Step 9b: Run test to verify it fails**

Run: `npx vitest run tests/unit/normalize.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 10: Implement `lib/normalize.ts`**

```typescript
// lib/normalize.ts
import type { PropertyListing, PropertyType, Availability } from "./types";

type RawRow = Record<string, string | undefined>;

export function normalizePropertyRow(row: RawRow): PropertyListing | null {
  if (row.is_group_header === "true" || !row.room_no) return null;

  const price = Number((row.price ?? "0").replace(/\./g, "").replace(/[^\d]/g, ""));
  const area = Number((row.area ?? "0").replace(/[^\d.]/g, ""));

  return {
    slug: slugify(row.room_no ?? ""),
    roomNo: row.room_no ?? "",
    location: row.location ?? "",
    address: row.address ?? "",
    price,
    serviceFee: row.service_fee ?? "",
    area,
    verticalAccess: row.vertical_access ?? "",
    propertyType: (row.property_type ?? "Nhà") as PropertyType,
    description: row.description ?? "",
    highlights: (row.highlights ?? "").split("|").map((h) => h.trim()).filter(Boolean),
    availability: (row.availability ?? "Còn trống") as Availability,
    media: resolveMediaLinks(row.media ?? ""),
  };
}

function resolveMediaLinks(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
```

- [ ] **Step 11: Run tests to verify they pass**

Run: `npx vitest run tests/unit/normalize.test.ts`
Expected: PASS (2/2).

- [ ] **Step 12: Write mock data fixtures**

Populate `lib/data/properties.ts` (12+ `PropertyListing` records spanning `Căn hộ`, `Nhà`, `Mặt bằng`, `Văn phòng`, `Xưởng`, `Studio`, mirroring the sample text visible in `01_TrangChu_WEB.png`/`02_ChoThue_WEB.png`: "Căn hộ 2PN nội thất đầy đủ" 12.000.000đ/70m², "Studio ban công thoáng" 6.500.000đ/35m², "Mặt bằng kinh doanh mặt phố" 28.000.000đ/95m², "Nhà nguyên căn 4 tầng" 22.000.000đ/160m², "Văn phòng sáng, vào ngay" 18.000.000đ/120m², "Xưởng rộng, xe tải vào" 35.000.000đ/280m²). `lib/data/properties.admin.ts` re-exports the same slugs extended with `commission`/`guidePerson`/`internalNotes` (mock placeholder strings only — never real data). `lib/data/projects.ts` (3 records: "Sun Galaxy Complex" Đang triển khai, "Riverside Garden" Tiêu biểu, "NDTHICH Office Center" Đã hoàn thành). `lib/data/news.ts` (3+ records matching the homepage "Tin tức & kinh nghiệm" cards). Use placeholder image paths pointing at `public/assets/placeholders/property-placeholder.svg` etc. for `media`.

- [ ] **Step 13: Create route stub files and verify the app builds**

Create every file listed in "Files" above (`app/(public)/**/page.tsx`, `app/admin/**/page.tsx`) as a typed one-line stub component. Add `app/(public)/layout.tsx` as a pass-through (`<>{children}</>`) for now — Task 03 fills it in.

Run: `npm run build`
Expected: build succeeds, route manifest lists all 9 public + 12 admin paths.

- [ ] **Step 14: Commit**

```bash
git add package.json tsconfig.json next.config.mjs .eslintrc.json .prettierrc .gitignore app lib public/fonts public/assets tests/unit
git commit -m "webby(impl): Task 01 — app shell, fonts, data layer"
```

---

### Task 02: Design tokens + typography

**Files:**
- Create: `tailwind.config.ts`, `lib/tokens.ts`
- Modify: `app/globals.css`
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Produces: Tailwind theme keys `colors.{primary,primaryHover,gold,ink,body,muted,line,surface,soft,footer,success,error}`; `spacing` scale `[1,2,3,4,5,6,8,10,12,16,20,24]` mapped to px `[4,8,12,16,20,24,32,40,48,64,80,96]`; `borderRadius.{sm,md,lg,xl,2xl,full}` → `[6,10,14,20,28,999]`px; `screens.{mobile:'0px', tablet:'768px', desktop:'1024px', wide:'1440px'}`; `fontSize` roles `display,h1,h2,h3,body-lg,body,label,button,price,admin-title` (each `[desktopPx, {lineHeight}]` with a `md:` mobile override applied in components, since Tailwind `fontSize` can't itself branch by breakpoint — component classes will pair `text-{role}-mobile md:text-{role}`); `zIndex.{base,sticky-header,sticky-mobile-actions,drawer-backdrop,drawer-panel,sheet-backdrop,sheet-panel,lightbox-backdrop,lightbox-content,toast}` → layer-map values; `container.desktop = 1240px`, gutters `desktopGutter:40px`, `mobileGutter:18px` exposed as a `.container-page` utility class.
- Consumes: `lib/types.ts` (none directly; token layer is standalone).

- [ ] **Step 1: Write `tailwind.config.ts` with the exact token values**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    screens: { mobile: "0px", tablet: "768px", desktop: "1024px", wide: "1440px" },
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
    },
    spacing: {
      0: "0px", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
      6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px", 20: "80px", 24: "96px",
    },
    borderRadius: { none: "0px", sm: "6px", md: "10px", lg: "14px", xl: "20px", "2xl": "28px", full: "999px" },
    fontFamily: { sans: ["var(--font-be-vietnam-pro)", "Noto Sans", "Arial", "sans-serif"] },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800" },
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
      transitionTimingFunction: { base: "cubic-bezier(.2,.7,.2,1)" },
      transitionDuration: { fast: "140ms", base: "220ms" },
      maxWidth: { page: "1240px" },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Add `.container-page` utility and CSS reset to `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; }
  img, svg { display: block; max-width: 100%; }
  button { font: inherit; }
}

@layer components {
  .container-page {
    @apply mx-auto w-full px-[18px] desktop:px-[40px];
    max-width: calc(1240px + 2 * 40px);
  }
}

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 120ms !important; }
}
```

- [ ] **Step 3: Write `lib/tokens.ts` as the typed JS mirror of the Tailwind theme**

```typescript
// lib/tokens.ts
export const colors = {
  primary: "#8A1822", primaryHover: "#70131B", gold: "#BE8A3F", ink: "#171717",
  body: "#4D4D4D", muted: "#7A7A7A", line: "#E8E2DF", surface: "#FFFFFF",
  soft: "#F8F6F4", footer: "#151515", success: "#23825C", error: "#C43D45",
} as const;

export const breakpoints = { mobileMax: 767, tabletMin: 768, desktopMin: 1024, wideMin: 1440 } as const;

export const zIndex = {
  baseContent: 0, stickyHeader: 100, stickyMobileActions: 200,
  drawerBackdrop: 900, drawerPanel: 910, bottomSheetBackdrop: 920, bottomSheetPanel: 930,
  lightboxBackdrop: 1000, lightboxContent: 1010, toast: 1100,
} as const;

export const motion = { fast: "140ms ease", base: "220ms cubic-bezier(.2,.7,.2,1)" } as const;
```

- [ ] **Step 4: Write a token-drift regression test**

```typescript
// tests/unit/tokens.test.ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/unit/tokens.test.ts`
Expected: PASS (4/4). If it fails, fix `tailwind.config.ts`/`lib/tokens.ts` — never edit `.webby/*.json` to make the test pass.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts lib/tokens.ts app/globals.css tests/unit/tokens.test.ts
git commit -m "webby(impl): Task 02 — design tokens + typography"
```

---

### Task 03: Shared public components

**Files:**
- Create: `components/public/Header/index.tsx`, `components/public/Footer/index.tsx`, `components/public/Button/index.tsx`, `components/public/PropertyCard/index.tsx`, `components/public/ProjectCard/index.tsx`, `components/public/NewsCard/index.tsx`, `components/public/FormField/index.tsx`, `components/public/Filter/index.tsx`, `components/public/FilterDrawer/index.tsx`, `components/public/Gallery/index.tsx`, `components/public/SearchPanel/index.tsx`, `components/public/Pagination/index.tsx`, `components/public/Breadcrumb/index.tsx`, `components/public/ContactCTA/index.tsx`, `components/public/MapEmbed/index.tsx`
- Create: `components/icons/index.tsx`
- Modify: `app/(public)/layout.tsx`
- Test: `tests/unit/Header.test.tsx`, `tests/unit/Gallery.test.tsx`, `tests/unit/FilterDrawer.test.tsx`, `tests/unit/FormField.test.tsx`

**Interfaces:**
- Consumes: `lib/types.ts` (`PropertyListing`, `ProjectListing`, `NewsArticle`), `lib/tokens.ts`, `lib/format.ts`.
- Produces: `<Header />` (states: `default`, `scrolled` via scroll listener, `mobileDrawerOpen`), `<Footer />`, `<Button variant="primary" | "secondary" state>`, `<PropertyCard listing: PropertyListing state?: "default"|"hover"|"unavailable"|"loading">`, `<ProjectCard project: ProjectListing>`, `<NewsCard article: NewsArticle>`, `<FormField label name type error? />`, `<Filter />` / `<FilterDrawer open onClose>`, `<Gallery images: string[] />` (owns lightbox open/close/index state), `<SearchPanel />`, `<Pagination page total onChange>`, `<Breadcrumb items: {label, href?}[] />`, `<ContactCTA />`, `<MapEmbed address />`.

- [ ] **Step 1: Open the authoritative sources before writing any component**

Re-open (already reviewed once during planning, re-open now for pixel accuracy): `.webby/visual-handoff/renders/WEB/01_TrangChu_WEB.png` (Header/Footer/ContactCTA visible), `.webby/visual-handoff/renders/WEB/02_ChoThue_WEB.png` (PropertyCard, Filter panel, Pagination, SearchPanel), `.webby/master/system/Public_Component_States.svg` + `.webby/visual-handoff/renders/SYSTEM/Public_Component_States.png` (hover/focus/disabled/empty states not visible on any single route render), `.webby/master/system/Design_System_Master.svg` for Button anatomy. Cross-reference `.webby/state-map.json` for the exact state list per component and `.webby/component-map.json` for the canonical component IDs.

- [ ] **Step 2: Icon wrapper components**

```tsx
// components/icons/index.tsx
import Image from "next/image";

type IconName = "area" | "bed" | "building" | "chat" | "check" | "edit" | "filter"
  | "home" | "menu" | "phone" | "pin" | "search" | "trash" | "upload";

export function Icon({ name, className, size = 20 }: { name: IconName; className?: string; size?: number }) {
  return (
    <Image
      src={`/assets/icons/${name}.svg`}
      alt=""
      role="presentation"
      width={size}
      height={size}
      className={className}
    />
  );
}
```

- [ ] **Step 3: `Button` (states: default/hover/pressed/focus/disabled per `state-map.json`)**

```tsx
// components/public/Button/index.tsx
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary";

const base = "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-button uppercase tracking-wide transition-colors duration-fast disabled:bg-[#ECE8E6] disabled:text-[#A8A19D] disabled:cursor-not-allowed";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-surface hover:bg-primaryHover active:bg-[#5E1017] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  secondary: "bg-surface text-primary border border-primary hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
};

type ButtonProps = { variant?: Variant } & (
  | ({ href: string } & ComponentPropsWithoutRef<"a">)
  | ({ href?: undefined } & ComponentPropsWithoutRef<"button">)
);

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;
  if ("href" in props && props.href) {
    return <Link {...props} className={classes} />;
  }
  return <button {...(props as ComponentPropsWithoutRef<"button">)} className={classes} />;
}
```

- [ ] **Step 4: `Header` with `default`/`scrolled`/`mobileDrawerOpen` states**

Implement a client component (`"use client"`). Desktop (`>=1024px`, per `responsive.json` `header` rule): logo (NO_LOGO placeholder) + brand wordmark left, nav links center (`Trang chủ, Cho thuê, Dự án, Giới thiệu, Tin tức, Liên hệ` from `content-map.json`), hotline button right (`tel:0986602203`). `scrolled` state (triggered via `useEffect` + `window.scrollY > 0` with a passive scroll listener): switches header to solid white 64px height with a subtle shadow per `state-map.json` (`"white 64px + subtle shadow"`). Below `1024px`: hamburger button opens a right-side drawer, `88vw` capped at `360px`, `rgba(0,0,0,.42)` backdrop, `z-index: drawer-backdrop`/`drawer-panel` from `lib/tokens.ts`, focus-trapped, closes on `Escape` and on backdrop click, restores focus to the trigger button on close.

- [ ] **Step 5: Write the failing test for Header mobile-drawer accessibility**

```tsx
// tests/unit/Header.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/public/Header";

describe("Header mobile drawer", () => {
  it("opens on menu click, traps focus, and closes on Escape returning focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Header />);
    const trigger = screen.getByRole("button", { name: /menu/i });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
```

- [ ] **Step 5b: Run test to verify it fails, then implement Header until it passes**

Run: `npx vitest run tests/unit/Header.test.tsx` → expect FAIL (component doesn't exist yet or lacks `role="dialog"`/focus restore). Implement `components/public/Header/index.tsx` per Step 4, then re-run until PASS.

- [ ] **Step 6: `Footer`**

Four-column layout per `01_TrangChu_WEB.png` bottom section: brand block (NO_LOGO + name + tagline) left, `CHO THUÊ` / `DỰ ÁN` / `LIÊN HỆ` link columns, `footer` background color (`#151515`), copyright line `© 2026 Công ty TNHH Đầu tư & Kinh doanh Nguyễn Đắc Thích`. Static server component (no client state needed).

- [ ] **Step 7: `PropertyCard`, `ProjectCard`, `NewsCard`**

`PropertyCard`: image (4:3, `objectFit: cover`, `objectPosition: center` per `placement-map.json` `property.media`) with an availability pill top-left ("Còn trống" green), title, location + area/type icon row (`Icon name="area"`, `Icon name="home"`/`"building"`), price (`text-price`) + "Xem chi tiết" link row. `hover` state per `state-map.json`. `unavailable` state dims the card and swaps the pill. `loading` state renders a skeleton (pulse animation respecting `prefers-reduced-motion`). `ProjectCard`: status ribbon (`Đang triển khai`/`Tiêu biểu`/`Đã hoàn thành`), image, name, location pin icon, "Xem dự án" link; `selected` state gets a primary-color border. `NewsCard`: image, category label pill, title (2-line clamp), date + read-time row.

- [ ] **Step 8: `Gallery` with lightbox (states: default/lightbox/loading/error)**

Desktop: mosaic grid per `03_ChiTietChoThue_WEB.png`/`Public_Component_States` reference. Mobile: horizontal swipe strip. Clicking any thumbnail opens a lightbox (`z-index: lightbox-backdrop`/`lightbox-content`), `ArrowLeft`/`ArrowRight` navigate, `Escape` closes, focus-trapped, image `loading`/`error` placeholder per state-map.

- [ ] **Step 9: Write the failing test for Gallery keyboard nav**

```tsx
// tests/unit/Gallery.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gallery } from "@/components/public/Gallery";

const images = ["/assets/placeholders/property-placeholder.svg", "/assets/placeholders/project-placeholder.svg"];

describe("Gallery lightbox", () => {
  it("opens on thumbnail click and navigates with arrow keys, closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} />);
    await user.click(screen.getAllByRole("button", { name: /xem ảnh/i })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("img", { name: /2 \/ 2/i })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 9b: Run test, implement until it passes**

Run: `npx vitest run tests/unit/Gallery.test.tsx` → FAIL, then implement `Gallery` (Step 8) until PASS.

- [ ] **Step 10: `FilterDrawer` (mobile bottom-sheet variant of `Filter`, states: default/selected/drawerOpen/empty)**

Desktop `>=1024px`: `Filter` renders inline as the left sidebar seen in `02_ChoThue_WEB.png` (Khu vực, Loại BĐS, Khoảng giá, Diện tích, Số phòng ngủ selects + "Áp dụng"/"Xóa bộ lọc"). Below `1024px`: same fields render inside a bottom sheet (`z-index: sheet-backdrop`/`sheet-panel`), opened by a filter button, focus-trapped, closes on `Escape`. `empty` state renders the "Không tìm thấy căn phù hợp?" panel from `02_ChoThue_WEB.png` with a "Đặt lại bộ lọc" button — this is a **filter-reset action, not a viewing-request/lead form**; do not add any lead-capture fields here.

- [ ] **Step 11: Write the failing test for FilterDrawer focus trap + Escape**

```tsx
// tests/unit/FilterDrawer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDrawer } from "@/components/public/FilterDrawer";

describe("FilterDrawer", () => {
  it("traps focus while open and closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = () => {};
    render(<FilterDrawer open onClose={onClose} />);
    const panel = screen.getByRole("dialog");
    expect(panel).toBeInTheDocument();
    await user.keyboard("{Escape}");
    // onClose is asserted via a stateful wrapper in the real test using vi.fn()
  });
});
```

(Use `vi.fn()` for `onClose` and assert it was called once; the snippet above is trimmed for plan brevity — implementer writes the real assertion.)

- [ ] **Step 11b: Run test, implement until it passes**

Run: `npx vitest run tests/unit/FilterDrawer.test.tsx` → FAIL, implement per Step 10 until PASS.

- [ ] **Step 12: `FormField` (states: default/focus/filled/error/disabled) with validation association**

```tsx
// components/public/FormField/index.tsx
"use client";
import { useId } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "tel" | "email" | "textarea";
  error?: string;
  required?: boolean;
}

export function FormField({ label, name, type = "text", error, required }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const Comp = type === "textarea" ? "textarea" : "input";
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label text-ink">{label}{required && " *"}</label>
      <Comp
        id={id}
        name={name}
        type={type === "textarea" ? undefined : type}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-md border px-4 py-3 text-body ${error ? "border-error" : "border-line"} focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-soft disabled:text-muted`}
      />
      {error && <span id={errorId} role="alert" className="text-body text-error">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 13: Write the failing test asserting `aria-describedby` wiring**

```tsx
// tests/unit/FormField.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/public/FormField";

describe("FormField error state", () => {
  it("associates the error message via aria-describedby", () => {
    render(<FormField label="Số điện thoại" name="phone" error="Vui lòng nhập số điện thoại" />);
    const input = screen.getByLabelText("Số điện thoại");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(screen.getByText("Vui lòng nhập số điện thoại").id).toBe(describedBy);
  });
});
```

- [ ] **Step 13b: Run test to verify it passes (implementation already written in Step 12)**

Run: `npx vitest run tests/unit/FormField.test.tsx`
Expected: PASS.

- [ ] **Step 14: `SearchPanel`, `Pagination`, `Breadcrumb`, `ContactCTA`, `MapEmbed`**

`SearchPanel`: the 4-field inline search bar from `01_TrangChu_WEB.png` ("Tìm bất động sản cho thuê" — Loại BĐS / Khu vực / Khoảng giá / Diện tích + "Tìm kiếm" button). `Pagination`: numbered page control matching `02_ChoThue_WEB.png`. `Breadcrumb`: `nav aria-label="breadcrumb"` with `/`-separated `Link`s. `ContactCTA`: the black band ("Cần tìm căn phù hợp?" + hotline/Zalo buttons) — Zalo button behavior per `interactions.json` (`production URL injected later; fallback hotline`, so wire it to the hotline `tel:` link until a real Zalo URL exists — this is a contract-mandated fallback, not an invented feature). `MapEmbed`: static placeholder box (no live map API in GĐ4/GĐ6-deferred) sized/positioned per the relevant detail-page SVG master.

- [ ] **Step 15: Wire `app/(public)/layout.tsx`**

```tsx
// app/(public)/layout.tsx
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">Bỏ qua đến nội dung</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 16: Run the full unit suite and the build**

Run: `npx vitest run && npm run build`
Expected: all unit tests PASS, build succeeds.

- [ ] **Step 17: Commit**

```bash
git add components/public components/icons app/\(public\)/layout.tsx tests/unit/Header.test.tsx tests/unit/Gallery.test.tsx tests/unit/FilterDrawer.test.tsx tests/unit/FormField.test.tsx
git commit -m "webby(impl): Task 03 — shared public components"
```

---

### Task 04: Homepage (`/`)

**Files:**
- Modify: `app/(public)/page.tsx`
- Test: `tests/visual/capture.ts` gains the `/` entry (see Task 12 for the full harness; this task only needs `npm run build` + manual dev-server check)

**Interfaces:**
- Consumes: `Header`, `Footer`, `Button`, `PropertyCard`, `ProjectCard`, `NewsCard`, `SearchPanel`, `ContactCTA` (Task 03); `lib/data/properties.ts`, `lib/data/projects.ts`, `lib/data/news.ts` (Task 01).

- [ ] **Step 1: Open ground truth**

Open `.webby/visual-handoff/renders/WEB/01_TrangChu_WEB.png`, `.webby/visual-handoff/renders/MOBILE/01_TrangChu_MOBILE.png`, and `.webby/master/public/01_TrangChu_WEB.svg` / `01_TrangChu_MOBILE.svg`. Confirm section order against `section-map.json["/"]`: Header, Hero, SearchPanel, FeaturedProperties, FeaturedProjects, AboutPreview, NewsPreview, ContactCTA, Footer.

- [ ] **Step 2: Implement each section in `app/(public)/page.tsx`, in this exact order**

Hero: eyebrow label "BẤT ĐỘNG SẢN CHO THUÊ • DỰ ÁN", H1 "Không gian phù hợp\ncho sống & kinh doanh", body copy, two CTAs ("Tìm cho thuê" primary → `/cho-thue`, "Xem dự án" secondary → `/du-an`), right-side hero art panel with the "500+ / Nhiều loại hình / 2 hotline" stat strip overlay — extract exact panel proportions from the SVG master's `viewBox`. SearchPanel: render `<SearchPanel />` in the white card that overlaps the hero bottom edge. FeaturedProperties: "CHO THUÊ" eyebrow + "Bất động sản mới nhất" H2 + "Xem tất cả" link → `/cho-thue`, 4-column `PropertyCard` grid (first 4 records from `lib/data/properties.ts`). FeaturedProjects: "DỰ ÁN" eyebrow + "Dự án tiêu biểu" H2, 3-column `ProjectCard` grid. AboutPreview: split panel (image left / copy + "Giới thiệu công ty" button right) linking to `/gioi-thieu`. NewsPreview: "NỘI DUNG" eyebrow + "Tin tức & kinh nghiệm" H2, 3-column `NewsCard` grid. `<ContactCTA />` band. Apply `.container-page` to every section; apply the `propertyGrid`/`projectGrid`/`newsGrid` responsive rules (`4/3/2/1`, `3/2/1`, `3/2/1`) from `responsive.json` via Tailwind `grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 wide:grid-cols-4` (adjust per grid).

- [ ] **Step 3: Run the dev server and manually diff against the PNG**

Run: `npm run dev` in background, then load `http://localhost:3000/` at both a `1920px` and a `390px` viewport (browser devtools device toolbar) and compare section-by-section against the two PNGs from Step 1. Fix any deviation in layout geometry, spacing, type scale, or color before proceeding — do not defer known deviations to Task 12; that task is for QA-loop fixes surfaced by the automated screenshot diff, not for skipping first-pass fidelity.

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: succeeds, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "webby(impl): Task 04 — homepage"
```

---

### Task 05: Rental list + detail (`/cho-thue`, `/cho-thue/[slug]`)

**Files:**
- Modify: `app/(public)/cho-thue/page.tsx`, `app/(public)/cho-thue/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Filter`/`FilterDrawer`, `PropertyCard`, `Pagination`, `SearchPanel` (list); `Gallery`, `Breadcrumb`, `ContactCTA` (detail); `lib/data/properties.ts`; `PropertyListing` type.

- [ ] **Step 1: Open ground truth for the list page**

`.webby/visual-handoff/renders/WEB/02_ChoThue_WEB.png`, `MOBILE/02_ChoThue_MOBILE.png`, `.webby/master/public/02_ChoThue_WEB.svg`/`_MOBILE.svg`. Section order: Header, PageIntro, Search, FilterPanel, PropertyGrid, Pagination, Footer.

- [ ] **Step 2: Implement `/cho-thue`**

PageIntro: H1 "Cho thuê bất động sản" + subcopy "Nguồn phòng/căn/mặt bằng được chuẩn hóa từ dữ liệu vận hành thực tế." Search: full-width search bar. Below `1024px` this row also exposes the filter-drawer trigger button per `responsive.json`. Two-column layout `>=1024px` (`Filter` sidebar left `~280px` + content right); single column with `FilterDrawer` below. Grid header row: "128 bất động sản phù hợp" count + "Giá công khai"/"Diện tích công khai" pills + sort select, sourced from `lib/data/properties.ts`. `PropertyGrid`: `4/3/2/1` responsive `PropertyCard` grid over all `lib/data/properties.ts` records, paginated via `Pagination`. Empty-filter state renders the "Không tìm thấy căn phù hợp?" panel (already built in `FilterDrawer`/`Filter`, reused here) — reset button clears filters, it is **not** a lead form.

- [ ] **Step 3: Open ground truth for the detail page**

`.webby/visual-handoff/renders/WEB/03_ChiTietChoThue_WEB.png`, `MOBILE/03_ChiTietChoThue_MOBILE.png`, `.webby/master/public/03_ChiTietChoThue_WEB.svg`/`_MOBILE.svg`. Section order: Header, Breadcrumb, Gallery, PropertySummary, Facts, ContactCTA, Description, Details, Media, Map, RelatedProperties, Footer.

- [ ] **Step 4: Implement `/cho-thue/[slug]`**

`generateStaticParams` from `lib/data/properties.ts` slugs; `notFound()` for unknown slugs. Breadcrumb: `Trang chủ / Cho thuê / {roomNo}`. Gallery: `listing.media`. PropertySummary: title (`roomNo` + `propertyType`), address, availability pill, price. Facts row: area/type/vertical-access icons + values (`Icon` components from Task 03) — **only** the public fields listed in Global Constraints; never render `commission`/`guidePerson`/`internalNotes` here (this route consumes `PropertyListing`, which structurally cannot carry those fields — confirmed by the Task 01 normalize test). Sticky `ContactCTA`/contact card on the right for `>=1024px` per `responsive.json` (`"detail": "Sticky desktop aside >=1024; inline contact below"`); inline (non-sticky) below `1024px`. Description: `listing.description`. Details: `highlights` list with check icons. Media: secondary gallery/video block if present. `MapEmbed address={listing.address}`. RelatedProperties: 3-card row of other listings sharing `propertyType` or `location`.

- [ ] **Step 5: Manual visual diff against both PNGs at both viewports (list + detail)**

Run: `npm run dev`, compare `/cho-thue` and `/cho-thue/[an-existing-slug]` against their PNGs at `1920px` and `390px`. Fix deviations now.

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: succeeds; static params generate one page per mock listing.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/cho-thue"
git commit -m "webby(impl): Task 05 — rental list/detail"
```

---

### Task 06: Projects (`/du-an`, `/du-an/[slug]`)

**Files:**
- Modify: `app/(public)/du-an/page.tsx`, `app/(public)/du-an/[slug]/page.tsx`

**Interfaces:**
- Consumes: `ProjectCard`, `Breadcrumb`, `Gallery`, `ContactCTA`, `MapEmbed`; `lib/data/projects.ts`; `ProjectListing`.

- [ ] **Step 1: Open ground truth**

List: `.webby/visual-handoff/renders/WEB/04_DuAn_WEB.png`, `MOBILE/04_DuAn_MOBILE.png`, `.webby/master/public/04_DuAn_WEB.svg`/`_MOBILE.svg`. Sections: Header, PageIntro, StatusTabs, ProjectGrid, BrandNote, Footer. Detail: `05_ChiTietDuAn_WEB.png`, `MOBILE/05_ChiTietDuAn_MOBILE.png`, `05_ChiTietDuAn_WEB.svg`/`_MOBILE.svg`. Sections: Header, Breadcrumb, ProjectHero, ContactCTA, Intro, ProjectFacts, Map, Amenities, Progress, Gallery, Footer.

- [ ] **Step 2: Implement `/du-an`**

PageIntro copy. StatusTabs: filter pills for `Đang triển khai` / `Tiêu biểu` / `Đã hoàn thành` (client component, filters the in-memory `lib/data/projects.ts` array — no page reload). ProjectGrid: `3/2/1` responsive grid of `ProjectCard`. BrandNote: closing brand statement band before the footer.

- [ ] **Step 3: Implement `/du-an/[slug]`**

`generateStaticParams` from project slugs. ProjectHero: full-width image + name + location + status ribbon. `ContactCTA`. Intro: summary copy. ProjectFacts: key facts row (status, location, scale — derive exact fact labels from the SVG master, do not invent facts beyond what's rendered). `MapEmbed`. Amenities: `amenities` list with check icons. Progress: `progressPercent` shown as the progress-bar treatment visible in the render (exact visual per the SVG, not a generic browser `<progress>` element). Gallery: `project.media`.

- [ ] **Step 4: Manual visual diff, build check, commit**

```bash
npm run dev   # compare /du-an and /du-an/[slug] against PNGs at both viewports; fix deviations
npm run build
git add "app/(public)/du-an"
git commit -m "webby(impl): Task 06 — projects list/detail"
```

---

### Task 07: About, News, Contact (`/gioi-thieu`, `/tin-tuc`, `/tin-tuc/[slug]`, `/lien-he`)

**Files:**
- Modify: `app/(public)/gioi-thieu/page.tsx`, `app/(public)/tin-tuc/page.tsx`, `app/(public)/tin-tuc/[slug]/page.tsx`, `app/(public)/lien-he/page.tsx`
- Test: `tests/unit/ContactForm.test.tsx`

**Interfaces:**
- Consumes: `NewsCard`, `Breadcrumb`, `FormField`, `ContactCTA`, `MapEmbed`; `lib/data/news.ts`; `NewsArticle`.

- [ ] **Step 1: Open ground truth for `/gioi-thieu`**

`06_GioiThieu_WEB.png`/`MOBILE`, `06_GioiThieu_WEB.svg`/`_MOBILE.svg`. Sections: Header, BrandHero, Stats, Values, BusinessAreas, ContactCTA, Footer. Implement each in order; `Stats` renders the numeric stat row (e.g. "500+", derive exact figures/labels from the render — same figures used on the homepage hero stat strip must stay consistent, do not invent different numbers).

- [ ] **Step 2: Open ground truth for `/tin-tuc`**

`07_TinTuc_WEB.png`/`MOBILE`, `07_TinTuc_WEB.svg`/`_MOBILE.svg`. Sections: Header, PageIntro, SearchCategories, NewsGrid, Pagination, ContactCTA, Footer. `SearchCategories`: search input + category pill row (client-side filter over `lib/data/news.ts`, same pattern as StatusTabs in Task 06). `NewsGrid`: `3/2/1` grid, paginated.

- [ ] **Step 3: Open ground truth for `/tin-tuc/[slug]`**

`08_ChiTietTinTuc_WEB.png`/`MOBILE`, `08_ChiTietTinTuc_WEB.svg`/`_MOBILE.svg`. Sections: Header, Breadcrumb, ArticleHero, ArticleBody, ContactCTA, RelatedNews, Footer. `generateStaticParams` from news slugs; `ArticleBody` renders `article.body`; `RelatedNews` shows 3 other articles.

- [ ] **Step 4: Open ground truth for `/lien-he`**

`09_LienHe_WEB.png`/`MOBILE`, `09_LienHe_WEB.svg`/`_MOBILE.svg`. Sections: Header, ContactHero, ContactCards, ContactForm, Map, Footer. `ContactCards`: hotline/Zalo/address cards using `content-map.json` values (`0986 602 203`, `0985 551 396`). `ContactForm`: a **general consultation form** ("Gửi yêu cầu tư vấn chung" per `PROJECT_INTAKE.json` conversion goals) built from `FormField` — name, phone, message. This is explicitly allowed (it's the generic contact/consultation goal from intake, not a per-property viewing-request/Lead flow); it must not reference a specific property, must not create per-listing lead records, and submits client-side only in GĐ4 (no backend — show a static success state on submit, matching whatever success/empty state the render shows).

- [ ] **Step 5: Write the failing test for ContactForm validation focus**

```tsx
// tests/unit/ContactForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/public/ContactForm";

describe("ContactForm validation", () => {
  it("moves focus to the first invalid field on submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(screen.getByRole("button", { name: /gửi/i }));
    expect(screen.getByLabelText(/họ và tên/i)).toHaveFocus();
  });
});
```

- [ ] **Step 5b: Run test to verify it fails, implement `components/public/ContactForm/index.tsx` until it passes**

Run: `npx vitest run tests/unit/ContactForm.test.tsx` → FAIL, implement (client component managing field refs + validation state, focuses `nameRef.current` when name is empty on submit per `interactions.json` `form-validation` rule), re-run → PASS.

- [ ] **Step 6: Manual visual diff across all four routes, build check, commit**

```bash
npm run dev   # compare /gioi-thieu, /tin-tuc, /tin-tuc/[slug], /lien-he against PNGs at both viewports
npm run build
git add "app/(public)/gioi-thieu" "app/(public)/tin-tuc" "app/(public)/lien-he" components/public/ContactForm tests/unit/ContactForm.test.tsx
git commit -m "webby(impl): Task 07 — about/news/contact"
```

---

### Task 08: Admin shell (Login, Dashboard)

**Files:**
- Create: `components/admin/Sidebar/index.tsx`, `components/admin/Topbar/index.tsx`, `components/admin/StatCard/index.tsx`
- Modify: `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/admin/page.tsx`
- Create: `lib/admin-auth.ts` (mock session check only — real auth is GĐ6)
- Test: `tests/unit/AdminSidebar.test.tsx`

**Interfaces:**
- Consumes: `FormField`, `Button` (Task 03), `lib/tokens.ts`.
- Produces: `<Sidebar state="expanded"|"compact"|"drawer" />`, `<Topbar />`, `<StatCard color icon label value delta />`.

- [ ] **Step 1: Open ground truth**

`.webby/visual-handoff/renders/ADMIN/01_Admin_Login.png`, `ADMIN/02_Admin_Dashboard.png`, `.webby/master/admin/01_Admin_Login.svg`, `02_Admin_Dashboard.svg`, plus `.webby/master/system/Admin_Component_States.svg` + `renders/SYSTEM/Admin_Component_States.png` for sidebar `compact`/`drawer` states not visible on the dashboard render itself.

- [ ] **Step 2: Implement `/admin/login`**

Centered card: "Đăng nhập quản trị" heading, email/password `FormField`s, primary `Button` submit. Client-side mock auth only (`lib/admin-auth.ts` exports `login(email, password): boolean` — accepts any non-empty pair and sets a cookie/localStorage flag; do not build real authentication — that is GĐ6 backend scope. No design invention: match the login card's exact proportions/copy from the render.

- [ ] **Step 3: Implement `Sidebar` with responsive states**

`248px` expanded `>=1200px`; `76px` icon-only compact `768–1199px`; off-canvas `drawer` `<768px` per `responsive.json` `adminSidebar` rule, cross-checked against `Admin_Component_States.svg`. Nav items: Dashboard, BĐS cho thuê, Dự án, Tin tức, Media (icons via `Icon` component), plus a bottom "Hệ thống / Đăng xuất" block, dark background per the render.

- [ ] **Step 4: Write the failing test for Sidebar responsive state**

```tsx
// tests/unit/AdminSidebar.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/admin/Sidebar";

describe("Admin Sidebar", () => {
  it("renders all five primary nav items with accessible names", () => {
    render(<Sidebar />);
    ["Dashboard", "BĐS cho thuê", "Dự án", "Tin tức", "Media"].forEach((label) => {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 4b: Run test, implement until it passes**

Run: `npx vitest run tests/unit/AdminSidebar.test.tsx` → FAIL, implement per Step 3 → PASS.

- [ ] **Step 5: Implement `Topbar` and `app/admin/layout.tsx`**

Topbar: page title (passed via a simple context or per-page prop), search input, avatar badge ("AD"). Layout composes `Sidebar` + `Topbar` + `{children}`, gates on `lib/admin-auth.ts` (redirect to `/admin/login` if not authenticated, skip the gate on the login route itself).

- [ ] **Step 6: Implement `/admin` dashboard**

"Tổng quan" H1 + subcopy. Four `StatCard`s (BĐS đang trống 128 / Dự án 06 / Tin đã đăng 24 / Media 386 — colors red/gold/blue/green per the render). "BĐS cập nhật gần đây" table (reuse pattern that Task 09's `DataTable` will formalize — for this task, inline a minimal table matching the 4 sample rows in the render: P.301-Tòa A, Căn 1208, MB-05, VP-03). "Lưu ý dữ liệu" warning panel with the exact copy from the render about grouped rows/shifted columns and INTERNAL-ONLY fields.

- [ ] **Step 7: Manual visual diff, build check, commit**

```bash
npm run dev   # compare /admin/login and /admin against their PNGs
npm run build
git add app/admin components/admin lib/admin-auth.ts tests/unit/AdminSidebar.test.tsx
git commit -m "webby(impl): Task 08 — admin shell (login, dashboard)"
```

---

### Task 09: Rental admin (BĐS list/create/edit)

**Files:**
- Create: `components/admin/DataTable/index.tsx`, `components/admin/FormSection/index.tsx`, `components/admin/Uploader/index.tsx`
- Modify: `app/admin/bds/page.tsx`, `app/admin/bds/new/page.tsx`, `app/admin/bds/[id]/page.tsx`
- Test: `tests/unit/AdminUploader.test.tsx`, `tests/unit/AdminForm.test.tsx`

**Interfaces:**
- Consumes: `lib/data/properties.admin.ts`, `AdminPropertyRecord`, `FormField`, `Button`.
- Produces: `<DataTable columns rows state="default"|"rowHover"|"empty"|"loading" />`, `<FormSection title badge? internalOnly? >`, `<Uploader state="empty"|"uploading"|"success"|"error" />`.

- [ ] **Step 1: Open ground truth**

`.webby/visual-handoff/renders/ADMIN/03_Admin_BDS_List.png`, `ADMIN/04_Admin_BDS_Form.png`, `.webby/master/admin/03_Admin_BDS_List.svg`, `04_Admin_BDS_Form.svg`, `.webby/master/system/Form_Overlay_States.svg` + `renders/SYSTEM/Form_Overlay_States.png` for uploader/table loading-error states.

- [ ] **Step 2: Implement `DataTable` and `/admin/bds` list**

`DataTable`: header row + striped/hover rows, `empty` state ("Chưa có BĐS nào" + CTA), `loading` state (skeleton rows). List page: table of `lib/data/properties.admin.ts` with columns Phòng/BĐS, Loại, Khu vực, Giá, Diện tích, Trạng thái, and a row action → `/admin/bds/[id]`; "Thêm BĐS" button → `/admin/bds/new`. **Never render `commission`/`guidePerson`/`internalNotes` as table columns** — this list view is admin-internal but still mirrors the public-safe column set shown in the render; the internal-only fields only ever appear inside the form (Step 4).

- [ ] **Step 3: Implement `Uploader` (states: empty/uploading/success/error)**

Matches "Tải ảnh / dán link media" upload tile + populated thumbnail tiles from `04_Admin_BDS_Form.png`. `uploading` shows a progress indicator, `error` shows a retry affordance, both respecting `prefers-reduced-motion`.

- [ ] **Step 4: Write the failing test for Uploader states**

```tsx
// tests/unit/AdminUploader.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Uploader } from "@/components/admin/Uploader";

describe("Uploader", () => {
  it("shows a retry action in the error state", () => {
    render(<Uploader state="error" />);
    expect(screen.getByRole("button", { name: /thử lại/i })).toBeInTheDocument();
  });

  it("shows an accessible progress indicator while uploading", () => {
    render(<Uploader state="uploading" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4b: Run test, implement `Uploader` until it passes**

Run: `npx vitest run tests/unit/AdminUploader.test.tsx` → FAIL, implement per Step 3 → PASS.

- [ ] **Step 5: Implement `FormSection` and `/admin/bds/new` + `/admin/bds/[id]`**

`FormSection`: a titled card, optional `badge` ("HIỂN THỊ WEBSITE" green pill for the public section per the render), optional `internalOnly` variant that applies the cream/gold background + "Thông tin INTERNAL-ONLY" heading + orange warning copy exactly as shown in `04_Admin_BDS_Form.png`. Form page composes three `FormSection`s in this order: (1) "Thông tin public" badge=`HIỂN THỊ WEBSITE`, fields Khu/tòa nhà, Vị trí/khu vực*, Số phòng/mã, Phí dịch vụ, Thang, Thời gian vào/trạng thái, Địa chỉ*, Giá thuê*, Diện tích*, Loại phòng/BĐS* — each field's helper caption ("Dùng để nhóm dữ liệu", "Filter public", "Public", "Public + filter" etc.) reproduced from the render; (2) "Ảnh/video" — `Uploader` + existing thumbnails; (3) "Nội dung mô tả" — `FormField` textarea for Mô tả chi tiết + Đặc điểm nổi bật; (4) `internalOnly` `FormSection` "Thông tin INTERNAL-ONLY" with exactly three fields: Hoa hồng, Người dẫn, Ghi chú nội bộ, each captioned "INTERNAL". Top-right actions: "Lưu nháp" secondary, "Lưu & đăng" primary. `/admin/bds/[id]` pre-fills from `lib/data/properties.admin.ts` by `id`; `/admin/bds/new` starts blank.

- [ ] **Step 6: Write the failing test asserting internal fields never reach the public data shape**

```tsx
// tests/unit/AdminForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BdsForm } from "@/components/admin/BdsForm"; // extracted from the page for testability

describe("BdsForm", () => {
  it("renders exactly one INTERNAL-ONLY section containing Hoa hồng, Người dẫn, Ghi chú nội bộ", () => {
    render(<BdsForm />);
    const internalSection = screen.getByText("Thông tin INTERNAL-ONLY").closest("section")!;
    expect(internalSection).toHaveTextContent("Hoa hồng");
    expect(internalSection).toHaveTextContent("Người dẫn");
    expect(internalSection).toHaveTextContent("Ghi chú nội bộ");
  });

  it("does not render any Đặt lịch/viewing-request/lead UI", () => {
    render(<BdsForm />);
    expect(screen.queryByText(/đặt lịch xem nhà/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 6b: Run test, refactor the form into `components/admin/BdsForm` until it passes**

Run: `npx vitest run tests/unit/AdminForm.test.tsx` → FAIL, extract/implement `components/admin/BdsForm/index.tsx` (used by both `new` and `[id]` pages) per Step 5 → PASS.

- [ ] **Step 7: Manual visual diff, build check, commit**

```bash
npm run dev   # compare /admin/bds, /admin/bds/new, /admin/bds/[id] against 03/04 renders
npm run build
git add app/admin/bds components/admin/DataTable components/admin/FormSection components/admin/Uploader components/admin/BdsForm tests/unit/AdminUploader.test.tsx tests/unit/AdminForm.test.tsx
git commit -m "webby(impl): Task 09 — rental admin"
```

---

### Task 10: Project/News admin + Media Library

**Files:**
- Modify: `app/admin/du-an/page.tsx`, `app/admin/du-an/new/page.tsx`, `app/admin/du-an/[id]/page.tsx`, `app/admin/tin-tuc/page.tsx`, `app/admin/tin-tuc/new/page.tsx`, `app/admin/tin-tuc/[id]/page.tsx`, `app/admin/media/page.tsx`
- Create: `components/admin/DuAnForm/index.tsx`, `components/admin/TinTucForm/index.tsx`, `components/admin/MediaGrid/index.tsx`

**Interfaces:**
- Consumes: `DataTable`, `FormSection`, `Uploader`, `FormField`, `Button` (Task 09); `lib/data/projects.ts`, `lib/data/news.ts`.

- [ ] **Step 1: Open ground truth**

`ADMIN/05_Admin_DuAn_List.png`, `06_Admin_DuAn_Form.png`, `07_Admin_TinTuc_List.png`, `08_Admin_TinTuc_Form.png`, `09_Admin_Media.png` and their matching `.svg` masters under `.webby/master/admin/`.

- [ ] **Step 2: Implement `/admin/du-an` list + `DuAnForm`**

`DataTable` columns: Tên dự án, Khu vực, Trạng thái, Tiến độ. `DuAnForm` sections per `06_Admin_DuAn_Form.svg`: basic info (name, location, status select), `Uploader` for media, description/amenities textareas, progress percent input. No internal-only section exists for projects (confirm against the render — projects carry no commission/guide-person/internal-notes fields per `data-source-map.json`, which only defines those for rental rows).

- [ ] **Step 3: Implement `/admin/tin-tuc` list + `TinTucForm`**

`DataTable` columns: Tiêu đề, Danh mục, Ngày đăng. `TinTucForm`: title, category select, cover `Uploader`, rich-text-ish body textarea, publish date field, "Lưu nháp"/"Đăng bài" actions.

- [ ] **Step 4: Implement `/admin/media`**

`MediaGrid`: grid of uploaded media thumbnails (reuse mock property/project/news media as the seed set) with filename, size, and a delete action (`Icon name="trash"`) per `09_Admin_Media.png`; upload tile reuses `Uploader` in `empty` state.

- [ ] **Step 5: Manual visual diff across all 5 remaining admin screens, build check, commit**

```bash
npm run dev   # compare /admin/du-an(+new/[id]), /admin/tin-tuc(+new/[id]), /admin/media against renders
npm run build
git add app/admin/du-an app/admin/tin-tuc app/admin/media components/admin/DuAnForm components/admin/TinTucForm components/admin/MediaGrid
git commit -m "webby(impl): Task 10 — project/news/media admin"
```

---

### Task 11: Responsive, state, and accessibility completeness pass

**Files:** any component/page touched by the audit below (no new files expected; this task fixes gaps, it doesn't add screens)
**Test:** `tests/unit/a11y.test.ts` (axe-core sweep)

- [ ] **Step 1: Cross-check every component against `.webby/state-map.json` exhaustively**

For each of the 12 components listed in `state-map.json`, render every declared state at least once (Storybook is not required; a temporary `/admin/_states-debug` or `/_states-debug` route rendering all states side by side is an acceptable throwaway harness — delete it before Task 12's final commit if added) and compare against `Public_Component_States.png`/`Admin_Component_States.png`/`Form_Overlay_States.png`. Fix any state whose visual doesn't match.

- [ ] **Step 2: Cross-check `.webby/layer-map.json` usage**

Grep the codebase for every `z-` Tailwind class and confirm each maps to a `zIndex` token from `lib/tokens.ts`/`tailwind.config.ts` — zero literal `z-[9999]`-style overrides. Verify stacking order live: open a route, trigger mobile nav + filter drawer + gallery lightbox in sequence, confirm each layer stacks above the previous per the numeric order in `layer-map.json`.

- [ ] **Step 3: Cross-check `.webby/responsive.json` at all four breakpoints**

For every route, resize through `<767px`, `768–1023px`, `1024–1439px`, `>=1440px` and confirm: header collapses to drawer `<1024px`; property/project/news grids hit `4/3/2/1` and `3/2/1` correctly; detail pages switch the contact aside from sticky to inline at `1024px`; gallery switches mosaic↔swipe; admin sidebar switches expanded/compact/drawer at `1200px`/`768px`; admin forms switch 2-col↔1-col at `1200px`.

- [ ] **Step 4: Accessibility pass**

Install `@axe-core/react` or `jest-axe` for an automated sweep, plus manual checks: semantic landmarks (`header`, `nav`, `main`, `footer`) on every page; every image has an appropriate `alt` (`alt=""` only for decorative icons, descriptive `alt` for property/project/news photos); every interactive control is keyboard-reachable in visual order; all three focus-trapped surfaces (mobile drawer, filter drawer, gallery lightbox) return focus to their trigger on close and cannot be tabbed out of while open; form errors are announced (`role="alert"` + `aria-describedby`, already built in Task 03/07); touch targets are >=44px on mobile; reduced-motion media query (Task 02) actually disables the drawer/lightbox transform transitions — verify with devtools' "emulate prefers-reduced-motion".

- [ ] **Step 5: Write the axe sweep test**

```typescript
// tests/unit/a11y.test.ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import HomePage from "@/app/(public)/page";
import ChoThuePage from "@/app/(public)/cho-thue/page";

describe("accessibility", () => {
  it("homepage has no serious axe violations", async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
  });

  it("rental list page has no serious axe violations", async () => {
    const { container } = render(<ChoThuePage />);
    const results = await axe(container);
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toHaveLength(0);
  });
});
```

- [ ] **Step 5b: Run and fix until it passes**

Run: `npx vitest run tests/unit/a11y.test.ts`
Expected: PASS with zero serious/critical violations. Fix markup (not the test) for any failure.

- [ ] **Step 6: Full regression run**

Run: `npx vitest run && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "webby(impl): Task 11 — responsive/state/accessibility pass"
```

---

### Task 12: Visual QA loop, IMPLEMENTATION_RECEIPT, final report

**Files:**
- Create: `tests/visual/manifest.ts`, `tests/visual/capture.ts`, `playwright.config.ts`
- Create: `.webby/implementation/IMPLEMENTATION_RECEIPT.json`

**Interfaces:**
- Consumes: `.webby/visual-handoff/routes.json`, `.webby/visual-handoff/admin-renders.json` (source of truth for the route→PNG map), every implemented route.
- Produces: `.webby/implementation/IMPLEMENTATION_RECEIPT.json` conforming to `webbyLucifer/schemas/implementation-receipt.schema.json`.

- [ ] **Step 1: Write `tests/visual/manifest.ts`**

```typescript
// tests/visual/manifest.ts
import routes from "../../.webby/visual-handoff/routes.json";
import adminRenders from "../../.webby/visual-handoff/admin-renders.json";

export const publicCaptures = Object.entries(routes.routes).flatMap(([route, viewports]) => [
  { route, viewport: "WEB" as const, width: 1920, approvedPng: `.webby/visual-handoff/${viewports.desktop}` },
  { route, viewport: "MOBILE" as const, width: 390, approvedPng: `.webby/visual-handoff/${viewports.mobile}` },
]);

export const adminCaptures = adminRenders.admin.map((entry, i) => ({
  route: adminRouteFor(i),
  viewport: "ADMIN" as const,
  width: 1920,
  approvedPng: `.webby/visual-handoff/${entry.render}`,
}));

function adminRouteFor(index: number): string {
  const paths = [
    "/admin/login", "/admin", "/admin/bds", "/admin/bds/new",
    "/admin/du-an", "/admin/du-an/new", "/admin/tin-tuc", "/admin/tin-tuc/new", "/admin/media",
  ];
  return paths[index];
}
```

- [ ] **Step 2: Write `tests/visual/capture.ts` (Playwright screenshot script)**

```typescript
// tests/visual/capture.ts
import { chromium } from "playwright";
import { publicCaptures, adminCaptures } from "./manifest";
import fs from "node:fs";

async function main() {
  const browser = await chromium.launch();
  const outDir = "tests/visual/__screenshots__";
  fs.mkdirSync(outDir, { recursive: true });
  for (const capture of [...publicCaptures, ...adminCaptures]) {
    const page = await browser.newPage({ viewport: { width: capture.width, height: 1000 } });
    await page.goto(`http://localhost:3000${capture.route}`, { waitUntil: "networkidle" });
    const safeName = `${capture.viewport}-${capture.route.replace(/\//g, "_") || "root"}.png`;
    await page.screenshot({ path: `${outDir}/${safeName}`, fullPage: true });
    await page.close();
    console.log(`captured ${capture.route} [${capture.viewport}] -> ${safeName}`);
  }
  await browser.close();
}

main();
```

- [ ] **Step 3: Run the capture against the running dev server**

Run: `npm run dev &` then `npx tsx tests/visual/capture.ts`
Expected: one PNG per row in `publicCaptures`/`adminCaptures` written to `tests/visual/__screenshots__/`.

- [ ] **Step 4: Compare every captured screenshot against its approved PNG and log deviations**

For each pair, open both images side by side (Read tool) and check: section order/presence, layout/container geometry, spacing/alignment, typography hierarchy/wrapping, image size/crop/position, control/card/border/radius/shadow treatment, color, overflow/clipping, responsive composition, missing/unexpected components — the exact checklist from `webbyLucifer/references/QA_PROTOCOL.md`. Record every deviation found.

- [ ] **Step 5: Fix every deviation found, re-capture, re-compare**

Loop Steps 3–5 until no visible deviation remains for any of the 9 public routes × 2 viewports, and all 9 admin screens. Do not stop at "close enough" — per the user's hard rule, do not report DONE while a visible deviation remains; if something is genuinely ambiguous (not resolvable from PNG/SVG/contracts), stop and record it as a named blocker instead of guessing.

- [ ] **Step 6: Final full regression**

Run: `npx vitest run && npm run lint && npx tsc --noEmit && npm run build`
Expected: all green, zero TypeScript errors, zero console errors when clicking through each route in the built app (`npm run start`).

- [ ] **Step 7: Write `.webby/implementation/IMPLEMENTATION_RECEIPT.json`**

```json
{
  "schemaVersion": 1,
  "executor": "CLAUDE",
  "consumedUiCommit": "ff96ed9ea596071c14515a551cdf31d46f0b0f69",
  "consumedUiRevision": 3,
  "implementationCommit": "<fill in: git rev-parse HEAD after the final commit>",
  "implementedRoutes": [
    "/", "/cho-thue", "/cho-thue/[slug]", "/du-an", "/du-an/[slug]",
    "/gioi-thieu", "/tin-tuc", "/tin-tuc/[slug]", "/lien-he",
    "/admin/login", "/admin", "/admin/bds", "/admin/bds/new", "/admin/bds/[id]",
    "/admin/du-an", "/admin/du-an/new", "/admin/du-an/[id]",
    "/admin/tin-tuc", "/admin/tin-tuc/new", "/admin/tin-tuc/[id]", "/admin/media"
  ],
  "implementedComponents": ["Header", "Footer", "Button", "PropertyCard", "ProjectCard", "NewsCard", "FormField", "Filter", "FilterDrawer", "Gallery", "SearchPanel", "Pagination", "Breadcrumb", "ContactCTA", "MapEmbed", "Sidebar", "Topbar", "StatCard", "DataTable", "FormSection", "Uploader"],
  "buildStatus": "<fill in from Step 6>",
  "testStatus": "<fill in from Step 6>",
  "openRequests": [],
  "blockers": [],
  "previewUrl": null
}
```

Fill in the real `implementationCommit` and `buildStatus`/`testStatus` values after Step 6 actually runs — never pre-fill this file with assumed-passing results before the commands have been run.

- [ ] **Step 8: Commit**

```bash
git add tests/visual playwright.config.ts .webby/implementation/IMPLEMENTATION_RECEIPT.json
git commit -m "webby(impl): Task 12 — visual QA loop, implementation receipt"
```

- [ ] **Step 9: Push the branch and open the GĐ4 PR**

```bash
git push -u origin claude/gd4-static-frontend
gh pr create --base webby/ui-ndthich-r3-ready --head claude/gd4-static-frontend \
  --title "[GĐ4] NDTHICH static frontend — visual reconstruction of Revision 3" \
  --body "Implements .webby uiRevision 3 (uiCommit ff96ed9e) across all 9 public routes + 9 admin screens. See .webby/implementation/IMPLEMENTATION_RECEIPT.json."
```

- [ ] **Step 10: Deliver the final GĐ4 report to the user**

Per the task brief, report: branch name, PR URL, the 12 commit checkpoints, routes completed, admin screens completed, build result, lint/typecheck result, visual QA result per route (pass/deviation), responsive QA result, accessibility QA result, any known remaining deviations, and known backend-deferred items (live Google Sheets sync, real auth, Lead/Viewing-Request — explicitly out of scope per `future-features.json`). If any visible deviation remains anywhere, report `GĐ4_INCOMPLETE` with the exact list — do not report DONE with known deviations outstanding.

---

## Self-Review Notes

- **Spec coverage:** all 9 public routes (Task 04–07), all 9 admin screens (Task 08–10), font/token/z-index/breakpoint/motion lock-in (Task 02), state coverage audit (Task 11), visual QA loop + receipt (Task 12), data-privacy enforcement for commission/guide-person/internal-notes (Task 01 type design + Task 09 tests), future-feature exclusion asserted by test (Task 09 Step 6) and called out as a constraint in every task touching a CTA/form.
- **No placeholders:** every task names exact files, exact source-of-truth assets to open, and exact acceptance commands; pixel-level styling values that aren't yet known (because they must be measured from the SVG master at execution time, per the project's own hard rule against inventing visual truth) are called out explicitly as "extract from `<named file>`" rather than left as "TBD".
- **Type consistency:** `PropertyListing`/`AdminPropertyRecord`/`ProjectListing`/`NewsArticle` defined once in Task 01 and referenced by identical name in every later task; `normalizePropertyRow` signature defined in Task 01 matches its only call site (a future GĐ6 data-sync module, out of scope here, but the shape is locked now so that integration is additive).
