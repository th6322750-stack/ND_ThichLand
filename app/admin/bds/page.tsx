import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { Icon } from "@/components/icons";
import { adminProperties } from "@/lib/data/properties.admin";
import { formatArea } from "@/lib/format";
import type { AdminPropertyRecord } from "@/lib/types";

export default function AdminBdsListPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h1-mobile text-ink desktop:text-h1">BĐS cho thuê</h2>
          <p className="mt-2 text-body text-muted">
            Quản lý nguồn phòng/căn/mặt bằng theo schema Sheet đã chuẩn hóa.
          </p>
        </div>
        <Link
          href="/admin/bds/new"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Thêm BĐS
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 tablet:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
          <Icon name="search" size={18} className="text-muted" />
          <input
            type="search"
            placeholder="Tìm theo mã phòng, địa chỉ..."
            className="w-full text-body text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
        >
          <Icon name="filter" size={16} /> Bộ lọc
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-line px-6 py-3 text-button uppercase text-ink hover:border-primary"
        >
          Xuất CSV
        </button>
      </div>

      <div className="mt-6">
        <DataTable
          rowKey={(row: AdminPropertyRecord) => row.slug}
          rows={adminProperties}
          columns={[
            { key: "roomNo", label: "Mã / phòng", render: (r) => <span className="font-bold text-ink">{r.roomNo}</span> },
            { key: "propertyType", label: "Loại", render: (r) => r.propertyType },
            { key: "location", label: "Khu vực", render: (r) => r.location },
            { key: "price", label: "Giá", render: (r) => `${(r.price / 1_000_000).toString()}tr` },
            { key: "area", label: "Diện tích", render: (r) => formatArea(r.area) },
            { key: "availability", label: "Trạng thái", render: (r) => r.availability },
            {
              key: "actions",
              label: "Thao tác",
              render: (r) => (
                <Link href={`/admin/bds/${r.slug}`} className="text-label text-primary hover:underline">
                  Sửa
                </Link>
              ),
            },
          ]}
        />
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-2 text-body text-ink">
        <span className="font-bold">Trường nội bộ không public</span>
        <span className="rounded-full bg-soft px-3 py-1 text-label text-muted">Hoa hồng</span>
        <span className="rounded-full bg-soft px-3 py-1 text-label text-muted">Người dẫn</span>
        <span className="rounded-full bg-soft px-3 py-1 text-label text-muted">Ghi chú</span>
      </p>
    </div>
  );
}
