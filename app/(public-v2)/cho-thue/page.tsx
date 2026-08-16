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

  return (
    <Suspense fallback={null}>
      <ChoThuePageInner properties={properties} />
    </Suspense>
  );
}
