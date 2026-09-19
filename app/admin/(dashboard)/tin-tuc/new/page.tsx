import { TinTucForm } from "@/components/admin/TinTucForm";
import { getNewsRepository } from "@/lib/server/news/providers";

export const dynamic = "force-dynamic";

export default async function AdminTinTucNewPage() {
  // Suggest the categories already in use so the public /tin-tuc chips
  // (derived from real article data) don't fragment into near-duplicates.
  const repo = await getNewsRepository();
  const knownCategories = Array.from(
    new Set((await repo.list()).map((a) => a.category).filter(Boolean)),
  ).sort();
  return <TinTucForm knownCategories={knownCategories} />;
}
