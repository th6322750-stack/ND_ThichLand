import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { DuAnPageInner } from "./DuAnPageInner";

export const dynamic = "force-dynamic";

export default async function DuAnPage() {
  const repo = await getProjectRepository();
  const projects = toPublicProjectListings(await repo.list());
  return <DuAnPageInner projects={projects} />;
}
