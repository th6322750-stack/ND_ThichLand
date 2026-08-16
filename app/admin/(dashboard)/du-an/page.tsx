import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import type { ProjectRecord } from "@/lib/server/projects/repository";

export const dynamic = "force-dynamic";

function formatUpdatedAt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default async function AdminDuAnListPage() {
  const repo = await getProjectRepository();
  const rows = await repo.list();

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
          rowKey={(row: ProjectRecord) => row.slug}
          rows={rows}
          columns={[
            { key: "name", label: "Tên / tiêu đề", render: (r) => <span className="font-bold text-ink">{r.name}</span> },
            { key: "status", label: "Trạng thái", render: (r) => (r.published ? "Đã đăng" : "Nháp") },
            { key: "updatedAt", label: "Cập nhật", render: (r) => formatUpdatedAt(r.updatedAt) },
            { key: "editor", label: "Người sửa", render: () => "Admin" },
            {
              key: "actions",
              label: "Thao tác",
              render: (r) => (
                <div className="flex items-center gap-3">
                  <Link href={`/admin/du-an/${r.slug}`} className="text-label text-primary hover:underline">
                    Sửa
                  </Link>
                  <ProjectRowActions record={r} />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
