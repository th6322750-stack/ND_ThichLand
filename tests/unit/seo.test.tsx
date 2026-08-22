import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_SOCIAL_IMAGE, absoluteUrl, buildNotFoundMetadata, buildPageMetadata, compactDescription } from "@/lib/seo";
import { articleJsonLd, organizationJsonLd } from "@/lib/seoJsonLd";
import { DEFAULT_SITE_SETTINGS } from "@/lib/data/siteSettings";

describe("SEO metadata helpers", () => {
  it("builds an absolute canonical and complete social metadata", () => {
    const metadata = buildPageMetadata({
      title: "Căn hộ mẫu | NDTHICH LAND",
      description: " Căn hộ   cho thuê tại Hà Nội. ",
      path: "/cho-thue/can-ho-mau",
      image: "/api/media/photo-1",
      imageAlt: "Phòng khách căn hộ mẫu",
    });

    expect(metadata).toMatchObject({
      description: "Căn hộ cho thuê tại Hà Nội.",
      alternates: { canonical: absoluteUrl("/cho-thue/can-ho-mau") },
      robots: { index: true, follow: true },
      openGraph: {
        url: absoluteUrl("/cho-thue/can-ho-mau"),
        locale: "vi_VN",
        images: [{ url: absoluteUrl("/api/media/photo-1"), alt: "Phòng khách căn hộ mẫu" }],
      },
      twitter: { card: "summary_large_image", images: [absoluteUrl("/api/media/photo-1")] },
    });
  });

  it("uses the generated 1200x630 card only when a page has no own image", () => {
    const metadata = buildPageMetadata({ title: "Dự án", description: "Danh sách dự án", path: "/du-an" });
    expect(metadata.openGraph).toMatchObject({
      images: [
        {
          url: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
          width: 1200,
          height: 630,
        },
      ],
    });
  });

  it("normalizes and caps descriptions without emitting obsolete keywords", () => {
    expect(compactDescription("  một   mô tả  ")).toBe("một mô tả");
    expect(compactDescription("x".repeat(400))).toHaveLength(320);
    expect(buildPageMetadata({ title: "Trang", description: "Mô tả", path: "/trang" }).keywords).toBeUndefined();
  });

  it("removes inherited public metadata from missing detail records", () => {
    expect(buildNotFoundMetadata("Không tìm thấy")).toMatchObject({
      alternates: { canonical: null },
      robots: { index: false, follow: false },
      openGraph: null,
      twitter: null,
    });
  });
});

describe("structured data", () => {
  it("describes the company with real contact details and stable identities", () => {
    const data = organizationJsonLd(DEFAULT_SITE_SETTINGS);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": ["Organization", "RealEstateAgent"],
      "@id": absoluteUrl("/#organization"),
      telephone: "+84986602203",
      email: "info@ndthich.com.vn",
      address: { addressCountry: "VN" },
    });
  });

  it("omits invalid empty article dates instead of publishing malformed schema", () => {
    const data = articleJsonLd({ headline: "Bài viết", description: "Mô tả", path: "/tin-tuc/bai-viet" });
    expect(data).not.toHaveProperty("datePublished");
    expect(data).not.toHaveProperty("dateModified");
  });

  it("escapes CMS text so JSON-LD cannot break out of its script element", () => {
    const hostile = "</script><script>alert(1)</script>";
    const { container } = render(<JsonLd data={{ name: hostile }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.innerHTML).not.toContain("</script>");
    expect(JSON.parse(script?.textContent || "{}")).toEqual({ name: hostile });
  });
});
