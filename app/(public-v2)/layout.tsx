import { Header2 } from "@/components/public-v2/Header2";
import { Footer2 } from "@/components/public-v2/Footer2";
import { SmoothScroll } from "@/components/public-v2/SmoothScroll";

// PHA2 client-approved visual V2 — scoped to /, /cho-thue, /cho-thue/[slug],
// /du-an, /du-an/[slug] only (see .webby/client-approved-v2/IMPLEMENTATION_CONTRACT.json).
// A separate route group from app/(public)/layout.tsx on purpose: /gioi-thieu,
// /tin-tuc, /lien-he are out of this phase's scope and must keep the existing
// Header/Footer untouched.
export default function PublicV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-[#880206] focus:px-4 focus:py-2 focus:text-white"
      >
        Bỏ qua đến nội dung
      </a>
      <SmoothScroll />
      <Header2 />
      <main id="main">{children}</main>
      <Footer2 />
    </>
  );
}
