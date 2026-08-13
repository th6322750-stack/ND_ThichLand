import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { news } from "@/lib/data/news";
import type { NewsArticle } from "@/lib/types";

const CMS_META: Record<string, { status: string; updatedAt: string }> = {
  "checklist-xem-can-ho-truoc-khi-ky-hop-dong": { status: "Đã đăng", updatedAt: "12/08/2026" },
  "kinh-nghiem-thue-nha-phu-hop-ngan-sach": { status: "Đã đăng", updatedAt: "10/08/2026" },
  "tin-du-an-va-hoat-dong-ndthich": { status: "Nháp", updatedAt: "08/08/2026" },
};

function formatTitle(title: string): string {
  return title.length > 28 ? `${title.slice(0, 28)}...` : title;
}

export default function AdminTinTucListPage() {
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
          rowKey={(row: NewsArticle) => row.slug}
          rows={news}
          columns={[
            {
              key: "title",
              label: "Tên / tiêu đề",
              render: (r) => <span className="font-bold text-ink">{formatTitle(r.title)}</span>,
            },
            { key: "status", label: "Trạng thái", render: (r) => CMS_META[r.slug]?.status ?? "Nháp" },
            { key: "updatedAt", label: "Cập nhật", render: (r) => CMS_META[r.slug]?.updatedAt ?? "—" },
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
