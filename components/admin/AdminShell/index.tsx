"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar, type Crumb } from "@/components/admin/Topbar";

const SECTIONS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/bds": "BĐS cho thuê",
  "/admin/du-an": "Dự án",
  "/admin/tin-tuc": "Tin tức",
  "/admin/media": "Media",
  "/admin/gioi-thieu": "Trang Về chúng tôi",
  "/admin/lien-he": "Trang Liên hệ",
  "/admin/cai-dat": "Cài đặt chung",
};

/**
 * Section pages get a single crumb; record pages get "section › leaf" so the
 * parent list is one click away. The leaf reads "Thêm mới" or "Chỉnh sửa"
 * from the route shape rather than the record's own title, which this
 * client component never receives.
 */
function resolveCrumbs(pathname: string): Crumb[] {
  const section = SECTIONS[pathname];
  if (section) return [{ label: section }];

  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  const parent = SECTIONS[base];
  if (!parent) return [{ label: "Quản trị" }];

  return [
    { label: parent, href: base },
    { label: pathname.endsWith("/new") ? "Thêm mới" : "Chỉnh sửa" },
  ];
}

/**
 * Pure visual/interactive chrome — the auth gate itself lives one level up,
 * in the (dashboard) Server Component layout (requireAdminPage()), which
 * runs before this ever mounts.
 */
export function AdminShell({
  children,
  accountEmail,
}: {
  children: React.ReactNode;
  accountEmail: string;
}) {
  const pathname = usePathname() ?? "/admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-soft">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="tablet:pl-[76px] min-[1200px]:pl-[248px]">
        <Topbar
          crumbs={resolveCrumbs(pathname)}
          accountEmail={accountEmail}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
