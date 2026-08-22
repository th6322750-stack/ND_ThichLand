import type { Metadata } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/siteUrl";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  absoluteUrl,
  indexableRobots,
} from "@/lib/seo";
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
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: absoluteUrl("/") }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "real estate",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: absoluteUrl("/") },
  robots: indexableRobots(),
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    locale: "vi_VN",
    type: "website",
    images: [{ url: absoluteUrl(DEFAULT_SOCIAL_IMAGE), width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_SOCIAL_IMAGE)],
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="bg-surface font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
