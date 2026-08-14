import { notFound } from "next/navigation";
import { DuAnForm } from "@/components/admin/DuAnForm";
import { getProjectRepository } from "@/lib/server/projects/providers";

export const dynamic = "force-dynamic";

export default async function AdminDuAnEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = await getProjectRepository();
  const project = (await repo.list()).find((p) => p.slug === id);
  if (!project) notFound();

  return <DuAnForm initial={project} />;
}
