import { Suspense } from "react";
import type { Metadata } from "next";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties } from "@/lib/visualFixtureV2";
import { ChoThuePageInner } from "./ChoThuePageInner";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { itemListJsonLd, webPageJsonLd } from "@/lib/seoJsonLd";

export const dynamic = "force-dynamic";

const SEO_TITLE = "Bất động sản cho thuê | Nhà, căn hộ, mặt bằng | NDTHICH LAND";
const SEO_DESCRIPTION =
  "Danh sách nhà, căn hộ, mặt bằng kinh doanh, văn phòng và kho xưởng cho thuê; lọc theo khu vực, giá, diện tích và số phòng ngủ.";

export const metadata: Metadata = buildPageMetadata({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: "/cho-thue" });

export default async function ChoThuePage() {
  let properties;
  if (isVisualFixtureV2Enabled()) {
    properties = getVisualFixtureProperties();
  } else {
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    properties = toPublicPropertyListings(merged.admin);
  }

  // Computed once per request (this route is force-dynamic already) and
  // passed down as a plain prop — "Hàng Mới Lên"'s <24h check needs a "now"
  // reference, and calling Date.now() inside ChoThuePageInner's render
  // (a client component) is what React's purity check rejects.
  const now = new Date().toISOString();

  return (
    <>
      <JsonLd
        id="rental-list-jsonld"
        data={webPageJsonLd({
          type: "CollectionPage",
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          path: "/cho-thue",
          mainEntity: itemListJsonLd(properties.map((property) => ({
            name: property.roomNo,
            path: `/cho-thue/${property.slug}`,
            image: property.media[0],
          }))),
        })}
      />
      <Suspense fallback={null}>
        <ChoThuePageInner properties={properties} now={now} />
      </Suspense>
    </>
  );
}
