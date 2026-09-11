import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth/dal";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }
  return <LoginForm />;
}
