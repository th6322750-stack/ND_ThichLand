import { notFound } from "next/navigation";
import { TinTucForm } from "@/components/admin/TinTucForm";
import { getNewsRepository } from "@/lib/server/news/providers";

export const dynamic = "force-dynamic";

export default async function AdminTinTucEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = await getNewsRepository();
  const records = await repo.list();
  const article = records.find((a) => a.slug === id);
  if (!article) notFound();

  const knownCategories = Array.from(new Set(records.map((a) => a.category).filter(Boolean))).sort();

  return <TinTucForm initial={article} knownCategories={knownCategories} />;
}
