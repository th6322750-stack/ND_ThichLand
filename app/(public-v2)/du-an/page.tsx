import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import { DuAnPageInner } from "./DuAnPageInner";

export const dynamic = "force-dynamic";

export default async function DuAnPage() {
  let projects;
  if (isVisualFixtureV2Enabled()) {
    projects = getVisualFixtureProjects();
  } else {
    const repo = await getProjectRepository();
    projects = toPublicProjectListings(await repo.list()).map((p) => ({ ...p, cardMedia: p.media[0] }));
  }
  return <DuAnPageInner projects={projects} />;
}
