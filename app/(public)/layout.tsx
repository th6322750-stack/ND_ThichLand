import { Suspense } from "react";
import { Header2 } from "@/components/public-v2/Header2";
import { Footer2 } from "@/components/public-v2/Footer2";
import { NavigationProgress2 } from "@/components/public-v2/NavigationProgress2";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";

// Minimal sync patch: /gioi-thieu, /lien-he, /tin-tuc(/[slug]) were never
// part of the PHA1-3 v2 migration scope (only /, /cho-thue(/[slug]),
// /du-an(/[slug]) have approved v2 masters), so this route group keeps its
// own legacy page bodies/tokens — only the header/footer chrome swaps to
// the v2 components so nav, branding and hotline read as one site instead
// of visibly switching design systems mid-browse.
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Contact details remain shared by the footer and the editable public-page
  // bodies. saveSiteSettings revalidates the whole layout so a hotline/address
  // change reaches every route without separate duplicated page settings.
  const settings = await (await getSiteSettingsRepository()).get();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-surface"
      >
        Bỏ qua đến nội dung
      </a>
      <Suspense fallback={null}>
        <NavigationProgress2 />
      </Suspense>
      <Header2 />
      {/* Same reason as the (public-v2) layout: holds the footer below the
          fold through the empty frame between two pages. */}
      <main id="main" className="min-h-[100svh]">
        {children}
      </main>
      <Footer2 settings={settings} />
    </>
  );
}
