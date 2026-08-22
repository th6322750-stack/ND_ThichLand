import { Suspense } from "react";
import type { Metadata } from "next";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties } from "@/lib/visualFixtureV2";
import { ChoThuePageInner } from "./ChoThuePageInner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cho thuê bất động sản | NDTHICH LAND",
  description:
    "Danh sách nhà, căn hộ, mặt bằng kinh doanh, văn phòng và kho xưởng cho thuê tại NDTHICH — lọc theo khu vực, khoảng giá, diện tích và số phòng ngủ.",
  alternates: { canonical: "/cho-thue" },
};

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
    <Suspense fallback={null}>
      <ChoThuePageInner properties={properties} now={now} />
    </Suspense>
  );
}
