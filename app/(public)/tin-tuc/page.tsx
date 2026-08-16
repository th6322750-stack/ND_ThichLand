import { Suspense } from "react";
import type { Metadata } from "next";
import { getNewsRepository } from "@/lib/server/news/providers";
import { toPublicNewsArticles } from "@/lib/server/news/dto";
import { TinTucPageInner } from "./TinTucPageInner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tin tức & kinh nghiệm | NDTHICH LAND",
  description: "Kinh nghiệm thuê nhà, mặt bằng và tin tức dự án từ NDTHICH.",
  alternates: { canonical: "/tin-tuc" },
};

export default async function TinTucPage() {
  const repo = await getNewsRepository();
  const articles = toPublicNewsArticles(await repo.list());
  return (
    <Suspense fallback={null}>
      <TinTucPageInner articles={articles} />
    </Suspense>
  );
}
