import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản trị | NDTHICH LAND",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
