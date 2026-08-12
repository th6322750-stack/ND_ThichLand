import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-surface"
      >
        Bỏ qua đến nội dung
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
