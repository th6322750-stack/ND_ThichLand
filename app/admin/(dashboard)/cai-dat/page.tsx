import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const repo = await getSiteSettingsRepository();
  const settings = await repo.get();
  return <SettingsForm initial={settings} />;
}
