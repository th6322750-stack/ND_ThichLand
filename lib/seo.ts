import type { Metadata } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export const SITE_NAME = "NDTHICH LAND";
export const DEFAULT_TITLE = "NDTHICH LAND — Bất động sản cho thuê & dự án";
export const DEFAULT_DESCRIPTION =
  "NDTHICH LAND cung cấp thông tin bất động sản cho thuê, mặt bằng kinh doanh và các dự án đang triển khai với dữ liệu rõ ràng, cập nhật.";
export const DEFAULT_SOCIAL_IMAGE = "/opengraph-image";

export function absoluteUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, `${SITE_URL}/`).toString();
  }
}

export function compactDescription(value: string, fallback = DEFAULT_DESCRIPTION): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.length <= 320 ? normalized : `${normalized.slice(0, 317).trimEnd()}...`;
}

export function indexableRobots(): NonNullable<Metadata["robots"]> {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

/** Prevent a missing dynamic record from inheriting homepage SEO metadata.
 * Next also injects noindex for 404s; the duplicate directive is deliberate
 * so no inherited index/follow directive can conflict with it. */
export function buildNotFoundMetadata(title: string): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title,
    alternates: { canonical: null },
    robots: { index: false, follow: false },
    openGraph: null,
    twitter: null,
  };
}

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

/** Complete per-route metadata. Nested OG/Twitter objects are intentionally
 * repeated because Next metadata merges nested fields shallowly. */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const cleanDescription = compactDescription(description);
  const usesDefaultImage = !image;
  const socialImage = absoluteUrl(image || DEFAULT_SOCIAL_IMAGE);
  const images = [
    usesDefaultImage
      ? { url: socialImage, width: 1200, height: 630, alt: imageAlt || title }
      : { url: socialImage, alt: imageAlt || title },
  ];
  return {
    title,
    description: cleanDescription,
    alternates: { canonical },
    robots: indexableRobots(),
    openGraph: {
      title,
      description: cleanDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: "vi_VN",
      type,
      images,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [socialImage],
    },
  };
}
