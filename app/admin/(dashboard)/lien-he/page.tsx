import { ContactPageForm } from "@/components/admin/ContactPageForm";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const content = await (await getPageContentRepository()).get("contact");
  return <ContactPageForm initial={content} />;
}
