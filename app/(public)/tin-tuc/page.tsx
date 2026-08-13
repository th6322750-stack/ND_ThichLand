import { Suspense } from "react";
import { getNewsRepository } from "@/lib/server/news/providers";
import { toPublicNewsArticles } from "@/lib/server/news/dto";
import { TinTucPageInner } from "./TinTucPageInner";

export const dynamic = "force-dynamic";

export default async function TinTucPage() {
  const repo = await getNewsRepository();
  const articles = toPublicNewsArticles(await repo.list());
  return (
    <Suspense fallback={null}>
      <TinTucPageInner articles={articles} />
    </Suspense>
  );
}
