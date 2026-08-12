import { notFound } from "next/navigation";
import { DuAnForm } from "@/components/admin/DuAnForm";
import { getProjectBySlug } from "@/lib/data/projects";

export default async function AdminDuAnEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectBySlug(id);
  if (!project) notFound();

  return <DuAnForm initial={project} />;
}
