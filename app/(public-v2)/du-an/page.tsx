import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import { firstMedia, PROJECT_PLACEHOLDER } from "@/lib/media";
import { DuAnPageInner } from "./DuAnPageInner";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { itemListJsonLd, webPageJsonLd } from "@/lib/seoJsonLd";

export const dynamic = "force-dynamic";

const SEO_TITLE = "Dự án bất động sản tiêu biểu | NDTHICH LAND";
const SEO_DESCRIPTION =
  "Danh mục dự án NDTHICH đã và đang tham gia phát triển với thông tin vị trí, chủ đầu tư, tiện ích, pháp lý và tiến độ thi công.";

export const metadata: Metadata = buildPageMetadata({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: "/du-an" });

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
    <>
      <JsonLd
        id="project-list-jsonld"
        data={webPageJsonLd({
          type: "CollectionPage",
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          path: "/du-an",
          mainEntity: itemListJsonLd(projects.map((project) => ({
            name: project.name,
            path: `/du-an/${project.slug}`,
            image: project.media[0],
          }))),
        })}
      />
      <Suspense fallback={null}>
        <DuAnPageInner projects={projects} />
      </Suspense>
    </>
  );
}
