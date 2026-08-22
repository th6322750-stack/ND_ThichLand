import { Suspense } from "react";
import { Header2 } from "@/components/public-v2/Header2";
import { Footer2 } from "@/components/public-v2/Footer2";
import { SmoothScroll } from "@/components/public-v2/SmoothScroll";
import { NavigationProgress2 } from "@/components/public-v2/NavigationProgress2";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";

// PHA2 client-approved visual V2 — scoped to /, /cho-thue, /cho-thue/[slug],
// /du-an, /du-an/[slug] only (see .webby/client-approved-v2/IMPLEMENTATION_CONTRACT.json).
// A separate route group from app/(public)/layout.tsx on purpose: /gioi-thieu,
// /tin-tuc, /lien-he are out of this phase's scope and must keep the existing
// Header/Footer untouched.
export default async function PublicV2Layout({ children }: { children: React.ReactNode }) {
  // Every route under this layout is already dynamic (they all read live
  // rental/project data), so sourcing the footer's contact details here adds
  // no rendering-mode cost.
  const settings = await (await getSiteSettingsRepository()).get();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-[#880206] focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua đến nội dung
      </a>
      <SmoothScroll />
      <Suspense fallback={null}>
        <NavigationProgress2 />
      </Suspense>
      <Header2 />
      {/* Reserves a viewport of height no matter what is inside. During a
          navigation there is a frame where the outgoing page has unmounted and
          neither the route's loading fallback nor the new page is on screen
          yet; measured on / -> /cho-thue the document collapsed to 900px and
          the footer snapped to 81px from the top, i.e. straight into view
          under the header, then dropped back down. Sizing the main element
          rather than each fallback keeps the footer parked below the fold for
          that frame too, and for any route that never adds a loading.tsx. */}
      <main id="main" className="min-h-[100svh]">
        {children}
      </main>
      <Footer2 settings={settings} />
    </>
  );
}
