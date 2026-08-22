import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectStateChip } from "@/components/admin/StatusChip";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dự án"
        description="Quản lý dự án trong CMS."
        action={
          <Link
            href="/admin/du-an/new"
            className="rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Thêm dự án
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <p className="text-body text-muted">
          <span className="tabular-nums text-ink">{rows.length}</span> dự án
        </p>
        <DataTable
          rowKey={(row: ProjectRecord) => row.slug}
          rows={rows}
          emptyLabel="Chưa có dự án nào. Bấm “Thêm dự án” để tạo bản ghi đầu tiên."
          columns={[
            {
              key: "name",
              label: "Tên / tiêu đề",
              render: (r) => (
                <Link
                  href={`/admin/du-an/${r.slug}`}
                  className="font-bold text-ink transition-colors duration-fast ease-base hover:text-primary"
                >
                  {r.name}
                </Link>
              ),
            },
            {
              key: "status",
              label: "Trạng thái",
              // Was published-only ("Đã đăng"/"Nháp"), which threw away the
              // record's own ProjectStatus. The chip carries both.
              render: (r) => <ProjectStateChip published={r.published} status={r.status} />,
            },
            { key: "updatedAt", label: "Cập nhật", numeric: true, render: (r) => formatUpdatedAt(r.updatedAt) },
            // A "Người sửa" column used to sit here rendering the constant
            // string "Admin" for every row — ProjectRecord carries no editor,
            // so the column stated something the CMS does not know.
            {
              key: "actions",
              label: "Thao tác",
              align: "right" as const,
              render: (r) => (
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/du-an/${r.slug}`}
                    className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
                  >
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
