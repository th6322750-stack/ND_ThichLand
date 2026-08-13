"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

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

/**
 * Pure visual/interactive chrome — the auth gate itself lives one level up,
 * in the (dashboard) Server Component layout (requireAdminPage()), which
 * runs before this ever mounts.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const [mobileOpen, setMobileOpen] = useState(false);

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
