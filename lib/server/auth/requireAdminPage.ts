import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./dal";
import type { SessionPayload } from "@/lib/server/crypto/session";

/** For Server Component pages/layouts: redirects to /admin/login instead of throwing. */
export async function requireAdminPage(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
