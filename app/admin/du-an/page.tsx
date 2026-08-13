import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { projects } from "@/lib/data/projects";
import type { ProjectListing } from "@/lib/types";

const CMS_META: Record<string, { status: string; updatedAt: string }> = {
  "sun-galaxy-complex": { status: "Đang triển khai", updatedAt: "12/08/2026" },
  "riverside-garden": { status: "Đã đăng", updatedAt: "10/08/2026" },
  "ndthich-office-center": { status: "Nháp", updatedAt: "08/08/2026" },
};

export default function AdminDuAnListPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h1-mobile text-ink desktop:text-h1">Dự án</h2>
          <p className="mt-2 text-body text-muted">Quản lý dự án trong CMS.</p>
        </div>
        <Link
          href="/admin/du-an/new"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Thêm dự án
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey={(row: ProjectListing) => row.slug}
          rows={projects}
          columns={[
            { key: "name", label: "Tên / tiêu đề", render: (r) => <span className="font-bold text-ink">{r.name}</span> },
            { key: "status", label: "Trạng thái", render: (r) => CMS_META[r.slug]?.status ?? r.status },
            { key: "updatedAt", label: "Cập nhật", render: (r) => CMS_META[r.slug]?.updatedAt ?? "—" },
            { key: "editor", label: "Người sửa", render: () => "Admin" },
            {
              key: "actions",
              label: "Thao tác",
              render: (r) => (
                <Link href={`/admin/du-an/${r.slug}`} className="text-label text-primary hover:underline">
                  Sửa
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
