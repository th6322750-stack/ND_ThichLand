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
  const article = (await repo.list()).find((a) => a.slug === id);
  if (!article) notFound();

  return <TinTucForm initial={article} />;
}
