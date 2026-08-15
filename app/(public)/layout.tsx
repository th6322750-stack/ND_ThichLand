import { Header2 } from "@/components/public-v2/Header2";
import { Footer2 } from "@/components/public-v2/Footer2";

// Minimal sync patch: /gioi-thieu, /lien-he, /tin-tuc(/[slug]) were never
// part of the PHA1-3 v2 migration scope (only /, /cho-thue(/[slug]),
// /du-an(/[slug]) have approved v2 masters), so this route group keeps its
// own legacy page bodies/tokens — only the header/footer chrome swaps to
// the v2 components so nav, branding and hotline read as one site instead
// of visibly switching design systems mid-browse.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-surface"
      >
        Bỏ qua đến nội dung
      </a>
      <Header2 />
      <main id="main">{children}</main>
      <Footer2 />
    </>
  );
}
