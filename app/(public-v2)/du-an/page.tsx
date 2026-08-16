import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import { firstMedia, PROJECT_PLACEHOLDER } from "@/lib/media";
import { DuAnPageInner } from "./DuAnPageInner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dự án tiêu biểu | NDTHICH LAND",
  description:
    "Danh mục dự án NDTHICH đã và đang tham gia phát triển: vị trí, chủ đầu tư, tiện ích và tiến độ thi công.",
  alternates: { canonical: "/du-an" },
};

export default async function DuAnPage() {
  let projects;
  if (isVisualFixtureV2Enabled()) {
    projects = getVisualFixtureProjects();
  } else {
    const repo = await getProjectRepository();
    projects = toPublicProjectListings(await repo.list()).map((p) => ({
      ...p,
      // A project saved without any photo used to hand `undefined` to
      // next/image and 500 the whole route.
      cardMedia: firstMedia(p.media, PROJECT_PLACEHOLDER),
    }));
  }
  // DuAnPageInner reads its filters from useSearchParams.
  return (
    <Suspense fallback={null}>
      <DuAnPageInner projects={projects} />
    </Suspense>
  );
}
