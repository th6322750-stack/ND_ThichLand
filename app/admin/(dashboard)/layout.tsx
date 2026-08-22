import { requireAdminPage } from "@/lib/server/auth/requireAdminPage";
import { AdminShell } from "@/components/admin/AdminShell";

// Every admin page depends on the caller's own session (and, once wired to
// live data, live/mutable Sheets content) — never safe to statically cache
// or serve one visitor's build-time snapshot to another. Without this,
// pages with no dynamic API usage of their own can get prerendered with a
// stale (or build-time-redirected) shell despite the layout's cookies() use.
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  // The topbar showed a hardcoded "AD" chip. It now shows the account that is
  // actually signed in, which matters the moment there is more than one.
  return <AdminShell accountEmail={session.sub}>{children}</AdminShell>;
}
