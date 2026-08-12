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

export const metadata: Metadata = {
  title: "NDTHICH LAND",
  description: "Công ty TNHH Đầu tư & Kinh doanh Nguyễn Đắc Thích",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
