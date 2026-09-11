import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const content = await (await getPageContentRepository()).get("about");
  return <AboutPageForm initial={content} />;
}
