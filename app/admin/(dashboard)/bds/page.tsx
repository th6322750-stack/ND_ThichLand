import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { Icon } from "@/components/icons";
import { formatArea } from "@/lib/format";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { BdsExportCsvButton } from "@/components/admin/BdsExportCsvButton";
import type { AdminPropertyRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

function matchesQuery(r: AdminPropertyRecord, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [r.roomNo, r.address, r.location].some((f) => f.toLowerCase().includes(needle));
}

export default async function AdminBdsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  const visible = merged.admin.filter((r) => matchesQuery(r, q));

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

      <form action="/admin/bds" className="mt-6 flex flex-col gap-3 tablet:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
          <Icon name="search" size={18} className="text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo mã phòng, địa chỉ..."
            aria-label="Tìm theo mã phòng, địa chỉ"
            className="w-full text-body text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
        >
          <Icon name="filter" size={16} /> Bộ lọc
        </button>
        <BdsExportCsvButton records={visible} />
      </form>

      <div className="mt-6">
        <DataTable
          rowKey={(row: AdminPropertyRecord) => row.slug}
          rows={visible}
          emptyLabel={q ? `Không tìm thấy BĐS phù hợp với "${q}".` : "Chưa có dữ liệu nào."}
          columns={[
            { key: "roomNo", label: "Mã / phòng", render: (r) => <span className="font-bold text-ink">{r.roomNo}</span> },
            { key: "propertyType", label: "Loại", render: (r) => r.propertyType ?? "—" },
            { key: "location", label: "Khu vực", render: (r) => r.location },
            { key: "price", label: "Giá", render: (r) => `${(r.price / 1_000_000).toString()}tr` },
            { key: "area", label: "Diện tích", render: (r) => formatArea(r.area) },
            {
              key: "availability",
              label: "Trạng thái",
              render: (r) => (r.published ? (r.availability ?? "—") : "Nháp"),
            },
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
