import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const beVietnamPro = localFont({
  src: [
    { path: "../public/fonts/BeVietnamPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/BeVietnamPro-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-be-vietnam-pro",
  fallback: ["Noto Sans", "Arial", "sans-serif"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NDTHICH LAND — Cho thuê bất động sản & dự án",
    template: "%s",
  },
  description:
    "NDTHICH LAND — cho thuê nhà, căn hộ, mặt bằng kinh doanh và giới thiệu các dự án đã, đang triển khai.",
  openGraph: {
    siteName: "NDTHICH LAND",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="bg-surface font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
