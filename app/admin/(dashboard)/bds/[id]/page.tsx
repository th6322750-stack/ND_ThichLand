import { notFound } from "next/navigation";
import { BdsForm } from "@/components/admin/BdsForm";
import { getAdminPropertyBySlug } from "@/lib/data/properties.admin";

export default async function AdminBdsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = getAdminPropertyBySlug(id);
  if (!record) notFound();

  return <BdsForm initial={record} />;
}
