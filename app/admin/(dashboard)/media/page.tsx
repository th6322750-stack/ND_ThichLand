import { getMediaProviders } from "@/lib/server/media/providers";
import { MediaLibraryClient } from "@/components/admin/MediaLibraryClient";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { repo } = await getMediaProviders();
  const records = await repo.list();
  return <MediaLibraryClient initialItems={records} />;
}
