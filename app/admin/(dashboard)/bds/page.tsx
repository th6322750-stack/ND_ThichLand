import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { RentalStateChip } from "@/components/admin/StatusChip";
import { Icon } from "@/components/icons";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { isIncompleteRental } from "@/lib/adminRecords";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { BdsExportCsvButton } from "@/components/admin/BdsExportCsvButton";
import { BdsRowActions } from "@/components/admin/BdsRowActions";
import type { AdminPropertyRecord, PropertyType } from "@/lib/types";

export const dynamic = "force-dynamic";

const PROPERTY_TYPE_OPTIONS: PropertyType[] = ["Căn hộ", "Nhà", "Mặt bằng", "Văn phòng", "Xưởng", "Studio"];

const PUBLISH_FILTERS = [
  { value: "", label: "Mọi trạng thái" },
  { value: "published", label: "Đã đăng" },
  { value: "draft", label: "Nháp" },
  // Records the merge layer could not fully validate — the operator needs a
  // way to find exactly these, because they are the ones silently missing
  // from the public site.
  { value: "incomplete", label: "Thiếu dữ liệu (không đăng được)" },
] as const;

function matchesQuery(r: AdminPropertyRecord, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [r.roomNo, r.address, r.location].some((f) => f.toLowerCase().includes(needle));
}

function matchesPublishFilter(r: AdminPropertyRecord, filter: string): boolean {
  switch (filter) {
    case "published":
      return r.published;
    case "draft":
      return !r.published;
    case "incomplete":
      return isIncompleteRental(r);
    default:
      return true;
  }
}

export default async function AdminBdsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; loai?: string; tt?: string }>;
}) {
  const { q = "", loai = "", tt = "" } = await searchParams;
  // Unknown values from a hand-edited URL degrade to "no narrowing" rather
  // than showing an empty table with no explanation.
  const typeFilter = (PROPERTY_TYPE_OPTIONS as string[]).includes(loai) ? loai : "";
  const publishFilter = PUBLISH_FILTERS.some((f) => f.value === tt) ? tt : "";

  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  const visible = merged.admin.filter(
    (r) =>
      matchesQuery(r, q) &&
      (!typeFilter || r.propertyType === typeFilter) &&
      matchesPublishFilter(r, publishFilter),
  );
  const filtersActive = Boolean(q || typeFilter || publishFilter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="BĐS cho thuê"
        description="Quản lý nguồn phòng/căn/mặt bằng theo schema Sheet đã chuẩn hóa."
        action={
          <Link
            href="/admin/bds/new"
            className="rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Thêm BĐS
          </Link>
        }
      />

      {/* A plain GET form: filtering is server-side, the URL is shareable,
          and browser back restores the previous view. The "Bộ lọc" button
          used to be a type="button" with no handler next to two controls
          that did nothing. */}
      <form action="/admin/bds" className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-stretch">
        <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
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
        <select
          name="loai"
          defaultValue={typeFilter}
          aria-label="Lọc theo loại BĐS"
          className="rounded-md border border-line bg-surface px-4 py-3 text-body text-ink outline-none transition-colors duration-fast ease-base focus:border-primary"
        >
          <option value="">Mọi loại BĐS</option>
          {PROPERTY_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          name="tt"
          defaultValue={publishFilter}
          aria-label="Lọc theo trạng thái đăng"
          className="rounded-md border border-line bg-surface px-4 py-3 text-body text-ink outline-none transition-colors duration-fast ease-base focus:border-primary"
        >
          {PUBLISH_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft"
        >
          <Icon name="filter" size={16} /> Lọc
        </button>
        {filtersActive && (
          <Link
            href="/admin/bds"
            className="inline-flex items-center justify-center rounded-md border border-line px-6 py-3 text-button uppercase text-muted transition-colors duration-fast ease-base hover:border-primary hover:text-primary"
          >
            Xóa lọc
          </Link>
        )}
        <BdsExportCsvButton records={visible} />
      </form>

      <div className="flex flex-col gap-3">
        <p className="text-body text-muted">
          <span className="tabular-nums text-ink">{visible.length}</span> bản ghi
          {filtersActive ? " khớp bộ lọc" : ""}
        </p>
        <DataTable
          rowKey={(row: AdminPropertyRecord) => row.slug}
          rows={visible}
          emptyLabel={
            filtersActive
              ? "Không có BĐS nào khớp bộ lọc hiện tại."
              : "Chưa có dữ liệu nào. Bấm “Thêm BĐS” để tạo bản ghi đầu tiên."
          }
          columns={[
            {
              key: "roomNo",
              label: "Mã / phòng",
              render: (r) => (
                <Link
                  href={`/admin/bds/${r.slug}`}
                  className="font-bold text-ink transition-colors duration-fast ease-base hover:text-primary"
                >
                  {r.roomNo}
                </Link>
              ),
            },
            { key: "propertyType", label: "Loại", render: (r) => r.propertyType ?? "—" },
            { key: "location", label: "Khu vực", render: (r) => r.location },
            {
              key: "price",
              label: "Giá",
              numeric: true,
              // Was `${r.price / 1_000_000}tr`, which printed "6.5tr" here and
              // "6.500.000đ" on the dashboard for the same record.
              render: (r) => (r.price > 0 ? formatCurrencyVnd(r.price) : "—"),
            },
            { key: "area", label: "Diện tích", numeric: true, render: (r) => formatArea(r.area) },
            {
              key: "availability",
              label: "Trạng thái",
              // An unpublished record that is unpublished BECAUSE required
              // fields are missing is a different problem from a deliberate
              // draft, and the operator could not tell them apart before.
              render: (r) => (
                <RentalStateChip
                  published={r.published}
                  availability={r.availability}
                  incomplete={isIncompleteRental(r)}
                />
              ),
            },
            {
              key: "actions",
              label: "Thao tác",
              align: "right" as const,
              render: (r) => (
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/bds/${r.slug}`}
                    className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
                  >
                    Sửa
                  </Link>
                  <BdsRowActions record={r} />
                </div>
              ),
            },
          ]}
        />
      </div>

      <p className="flex flex-wrap items-center gap-2 text-body text-muted">
        <span className="text-label uppercase tracking-[0.08em]">Trường nội bộ không public</span>
        <span className="rounded-full border border-line bg-soft px-3 py-1 text-label">Hoa hồng</span>
        <span className="rounded-full border border-line bg-soft px-3 py-1 text-label">Người dẫn</span>
        <span className="rounded-full border border-line bg-soft px-3 py-1 text-label">Ghi chú</span>
      </p>
    </div>
  );
}
