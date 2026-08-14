import { Suspense } from "react";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties } from "@/lib/visualFixtureV2";
import { ChoThuePageInner } from "./ChoThuePageInner";

export const dynamic = "force-dynamic";

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
