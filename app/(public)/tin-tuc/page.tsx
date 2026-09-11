import { Suspense } from "react";
import type { Metadata } from "next";
import { getNewsRepository } from "@/lib/server/news/providers";
import { toPublicNewsArticles } from "@/lib/server/news/dto";
import { TinTucPageInner } from "./TinTucPageInner";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { itemListJsonLd, webPageJsonLd } from "@/lib/seoJsonLd";

export const dynamic = "force-dynamic";

const SEO_TITLE = "Tin tức bất động sản & kinh nghiệm thuê | NDTHICH LAND";
const SEO_DESCRIPTION =
  "Kinh nghiệm thuê nhà, căn hộ, mặt bằng kinh doanh và tin tức dự án được NDTHICH LAND cập nhật rõ ràng, dễ áp dụng.";

export const metadata: Metadata = buildPageMetadata({ title: SEO_TITLE, description: SEO_DESCRIPTION, path: "/tin-tuc" });

export default async function TinTucPage() {
  const repo = await getNewsRepository();
  const articles = toPublicNewsArticles(await repo.list());
  return (
    <>
      <JsonLd
        id="news-list-jsonld"
        data={webPageJsonLd({
          type: "CollectionPage",
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          path: "/tin-tuc",
          mainEntity: itemListJsonLd(articles.map((article) => ({
            name: article.title,
            path: `/tin-tuc/${article.slug}`,
            image: article.cover,
          }))),
        })}
      />
      <Suspense fallback={null}>
        <TinTucPageInner articles={articles} />
      </Suspense>
    </>
  );
}
