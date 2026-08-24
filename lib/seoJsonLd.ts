import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo";
import type { SiteSettings } from "@/lib/types";

export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

function internationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return digits ? `+${digits}` : "";
}

function validSocialUrls(): string[] {
  return [
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL,
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    process.env.NEXT_PUBLIC_ZALO_URL,
  ].flatMap((value) => {
    if (!value) return [];
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? [url.toString()] : [];
    } catch {
      return [];
    }
  });
}

export function organizationJsonLd(settings: SiteSettings): Record<string, unknown> {
  const phones = [settings.phonePrimary].filter(Boolean);
  const socialUrls = validSocialUrls();
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent"],
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    alternateName: "NDTHICH",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/assets/v2/branding/ndthich-logo-reference.png"),
      width: 168,
      height: 128,
    },
    image: absoluteUrl("/opengraph-image"),
    description: DEFAULT_DESCRIPTION,
    email: settings.email,
    telephone: internationalPhone(settings.phonePrimary),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "VN",
    },
    contactPoint: phones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: internationalPhone(phone),
      contactType: "customer service",
      availableLanguage: ["vi"],
      areaServed: "VN",
    })),
    ...(socialUrls.length ? { sameAs: socialUrls } : {}),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: SITE_NAME,
    alternateName: "NDTHICH",
    description: DEFAULT_DESCRIPTION,
    inLanguage: "vi-VN",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageJsonLd(input: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  name: string;
  description: string;
  path: string;
  image?: string | null;
  mainEntity?: Record<string, unknown>;
}): Record<string, unknown> {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "vi-VN",
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    ...(input.image ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(input.image) } } : {}),
    ...(input.mainEntity ? { mainEntity: input.mainEntity } : {}),
  };
}

export function itemListJsonLd(items: { name: string; path: string; image?: string }[]): Record<string, unknown> {
  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
      ...(item.image ? { image: absoluteUrl(item.image) } : {}),
    })),
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  image?: string | null;
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: input.headline,
    description: input.description,
    image: input.image ? [absoluteUrl(input.image)] : [absoluteUrl("/opengraph-image")],
    ...(input.publishedAt ? { datePublished: input.publishedAt } : {}),
    ...(input.modifiedAt || input.publishedAt ? { dateModified: input.modifiedAt || input.publishedAt } : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    inLanguage: "vi-VN",
    author: { "@id": absoluteUrl("/#organization") },
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}
