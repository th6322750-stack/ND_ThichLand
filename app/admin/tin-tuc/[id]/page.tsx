import { notFound } from "next/navigation";
import { TinTucForm } from "@/components/admin/TinTucForm";
import { getNewsBySlug } from "@/lib/data/news";

export default async function AdminTinTucEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getNewsBySlug(id);
  if (!article) notFound();

  return <TinTucForm initial={article} />;
}
