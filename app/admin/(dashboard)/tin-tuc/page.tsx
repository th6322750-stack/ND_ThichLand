import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { getNewsRepository } from "@/lib/server/news/providers";
import type { NewsRecord } from "@/lib/server/news/repository";

export const dynamic = "force-dynamic";

function formatTitle(title: string): string {
  return title.length > 28 ? `${title.slice(0, 28)}...` : title;
}

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h1-mobile text-ink desktop:text-h1">Tin tức</h2>
          <p className="mt-2 text-body text-muted">Quản lý tin tức trong CMS.</p>
        </div>
        <Link
          href="/admin/tin-tuc/new"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Thêm bài viết
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey={(row: NewsRecord) => row.slug}
          rows={rows}
          columns={[
            {
              key: "title",
              label: "Tên / tiêu đề",
              render: (r) => <span className="font-bold text-ink">{formatTitle(r.title)}</span>,
            },
            { key: "status", label: "Trạng thái", render: (r) => (r.published ? "Đã đăng" : "Nháp") },
            { key: "updatedAt", label: "Cập nhật", render: (r) => formatUpdatedAt(r.updatedAt) },
            { key: "editor", label: "Người sửa", render: () => "Admin" },
            {
              key: "actions",
              label: "Thao tác",
              render: (r) => (
                <Link href={`/admin/tin-tuc/${r.slug}`} className="text-label text-primary hover:underline">
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
