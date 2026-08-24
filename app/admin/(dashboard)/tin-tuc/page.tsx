import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { PublishChip } from "@/components/admin/StatusChip";
import { getNewsRepository } from "@/lib/server/news/providers";
import type { NewsRecord } from "@/lib/server/news/repository";

export const dynamic = "force-dynamic";

function formatUpdatedAt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default async function AdminTinTucListPage() {
  const repo = await getNewsRepository();
  const rows = await repo.list();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tin tức"
        description="Quản lý bài viết tin tức trên website."
        action={
          <Link
            href="/admin/tin-tuc/new"
            className="rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Thêm bài viết
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <p className="text-body text-muted">
          <span className="tabular-nums text-ink">{rows.length}</span> bài viết
        </p>
        <DataTable
          rowKey={(row: NewsRecord) => row.slug}
          rows={rows}
          emptyLabel="Chưa có bài viết nào. Bấm “Thêm bài viết” để tạo bản ghi đầu tiên."
          columns={[
            {
              key: "title",
              label: "Tên / tiêu đề",
              // Titles were cut to 28 chars in JS and given a literal "...".
              // CSS truncation keeps the whole title in the DOM (so it is
              // still searchable and readable via tooltip) and adapts to the
              // column's actual width instead of a fixed guess.
              render: (r) => (
                <Link
                  href={`/admin/tin-tuc/${r.slug}`}
                  title={r.title}
                  className="block max-w-[40ch] truncate font-bold text-ink transition-colors duration-fast ease-base hover:text-primary"
                >
                  {r.title}
                </Link>
              ),
            },
            { key: "status", label: "Trạng thái", render: (r) => <PublishChip published={r.published} /> },
            { key: "updatedAt", label: "Cập nhật", numeric: true, render: (r) => formatUpdatedAt(r.updatedAt) },
            // Dropped a "Người sửa" column that rendered the constant "Admin"
            // for every row — NewsRecord carries no editor.
            {
              key: "actions",
              label: "Thao tác",
              align: "right" as const,
              render: (r) => (
                <div className="flex items-center justify-end">
                  <Link
                    href={`/admin/tin-tuc/${r.slug}`}
                    className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
                  >
                    Sửa
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
