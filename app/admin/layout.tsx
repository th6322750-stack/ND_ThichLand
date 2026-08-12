"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { useHydrated, useIsAuthenticated } from "@/lib/admin-auth";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bds": "BĐS cho thuê",
  "/admin/du-an": "Dự án",
  "/admin/tin-tuc": "Tin tức",
  "/admin/media": "Media",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  return PAGE_TITLES[base] ?? "Quản trị";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydrated = useHydrated();
  const authenticated = useIsAuthenticated();
  const isLoginRoute = pathname === "/admin/login";
  const shouldRedirect = hydrated && !isLoginRoute && !authenticated;

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/admin/login");
    }
  }, [shouldRedirect, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!hydrated || shouldRedirect) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="tablet:pl-[76px] min-[1200px]:pl-[248px]">
        <Topbar title={resolveTitle(pathname)} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
