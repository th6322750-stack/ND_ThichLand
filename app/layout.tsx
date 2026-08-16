import type { Metadata } from "next";
import localFont from "next/font/local";
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

/**
 * Set NEXT_PUBLIC_SITE_URL on the deployment to the real origin. Without it,
 * relative `alternates.canonical`/OG URLs resolve against localhost — which
 * is correct for local QA and harmless in preview, and the sitemap/robots
 * routes fall back to the same value.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NDTHICH LAND — Cho thuê bất động sản & dự án",
    template: "%s",
  },
  description:
    "Công ty TNHH Đầu tư & Kinh doanh Nguyễn Đắc Thích — cho thuê nhà, căn hộ, mặt bằng kinh doanh và giới thiệu các dự án đã, đang triển khai.",
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
