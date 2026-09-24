import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminSecurityPanel } from "@/components/admin/AdminSecurityPanel";
import { getEffectiveAdminSecurity } from "@/lib/server/auth/security";
import { getAdminSecurityPersistenceMode } from "@/lib/server/auth/securityProviders";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const repo = await getSiteSettingsRepository();
  const [settings, securityResult] = await Promise.all([
    repo.get(),
    getEffectiveAdminSecurity()
      .then((security) => ({ ok: true as const, enabled: security?.totpEnabled ?? false }))
      .catch(() => ({ ok: false as const, enabled: false })),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <SettingsForm initial={settings} />
      <AdminSecurityPanel
        totpEnabled={securityResult.enabled}
        statusAvailable={securityResult.ok}
        persistenceAvailable={getAdminSecurityPersistenceMode() !== "unavailable"}
      />
    </div>
  );
}
