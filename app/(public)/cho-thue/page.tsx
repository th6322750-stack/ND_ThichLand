import { Suspense } from "react";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { ChoThuePageInner } from "./ChoThuePageInner";

export const dynamic = "force-dynamic";

export default async function ChoThuePage() {
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  const properties = toPublicPropertyListings(merged.admin);

  return (
    <Suspense fallback={null}>
      <ChoThuePageInner properties={properties} />
    </Suspense>
  );
}
