import { notFound } from "next/navigation";
import { BdsForm } from "@/components/admin/BdsForm";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";

export const dynamic = "force-dynamic";

export default async function AdminBdsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  const record = merged.admin.find((r) => r.slug === id);
  if (!record) notFound();

  return <BdsForm initial={record} />;
}
