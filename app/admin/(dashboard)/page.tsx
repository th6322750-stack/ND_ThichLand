import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { RentalStateChip } from "@/components/admin/StatusChip";
import { Icon } from "@/components/icons";
import { formatCurrencyVnd, formatArea } from "@/lib/format";
import { isIncompleteRental } from "@/lib/adminRecords";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { getNewsRepository } from "@/lib/server/news/providers";
import { getMediaProviders } from "@/lib/server/media/providers";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  const projectRepo = await getProjectRepository();
  const newsRepo = await getNewsRepository();
  const { repo: mediaRepo } = await getMediaProviders();

  const [projects, articles, media] = await Promise.all([
    projectRepo.list(),
    newsRepo.list(),
    mediaRepo.list(),
  ]);

  // Every number below is counted from the same data the rest of the CMS
  // reads. They were hardcoded before ("128", "06", "24", "386",
  // "+12 tuần này") — plausible-looking operational metrics that were not
  // measurements of anything, on the first screen an operator sees.
  const published = merged.admin.filter((r) => r.published);
  const vacant = published.filter((r) => r.availability === "Còn trống").length;
  const publishedProjects = projects.filter((p) => p.published).length;
  const inProgressProjects = projects.filter((p) => p.published && p.status === "Đang triển khai").length;
  const publishedArticles = articles.filter((a) => a.published).length;
  const draftArticles = articles.length - publishedArticles;
  // Records the merge layer could not validate — these are invisible on the
  // public site, so surfacing the count is the point.
  const incomplete = merged.admin.filter(isIncompleteRental).length;

  // Each card links into the section it counts. No status colour: these are
  // counts, and "10 đang trống" is not by itself good or bad — tinting them
  // would be inventing a signal the data does not carry.
  const stats = [
    {
      href: "/admin/bds",
      icon: "building" as const,
      label: "BĐS đang trống",
      value: String(vacant),
      note: `${published.length} tin đang đăng`,
    },
    {
      href: "/admin/du-an",
      icon: "shop" as const,
      label: "Dự án đang đăng",
      value: String(publishedProjects),
      note: `${inProgressProjects} đang triển khai`,
    },
    {
      href: "/admin/tin-tuc",
      icon: "edit" as const,
      label: "Tin đã đăng",
      value: String(publishedArticles),
      note: draftArticles > 0 ? `${draftArticles} bản nháp` : "Không có bản nháp",
    },
    {
      href: "/admin/media",
      icon: "upload" as const,
      label: "Media",
      value: String(media.length),
      note: "Ảnh / video đã tải lên",
    },
  ];

  // AdminPropertyRecord carries no updatedAt for sheet-derived rows, so this
  // is honestly labelled as a sample of the catalogue rather than the old
  // "BĐS cập nhật gần đây" heading, which claimed an ordering the data
  // cannot support.
  const sample = merged.admin.slice(0, 5);

  const { ignored, quarantined, quarantinedRows, mediaDiagnostics } = merged.diagnostics;

  // The source-quality panel used to render in warning gold unconditionally —
  // so a sheet with nothing wrong still looked like it needed attention.
  // Tone now follows the numbers.
  const sourceClean = ignored === 0 && quarantined === 0 && mediaDiagnostics.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tổng quan"
        description="Theo dõi nguồn cho thuê và nội dung đang vận hành."
      />

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {incomplete > 0 && (
        <div className="rounded-md border border-error bg-error/5 p-6">
          <p className="text-body font-bold text-error">
            {incomplete} bản ghi thiếu dữ liệu bắt buộc nên không hiển thị trên website.
          </p>
          <p className="mt-2 text-body text-ink">
            Thiếu loại BĐS, tình trạng, giá hoặc diện tích. Bổ sung xong là tin tự lên trang.
          </p>
          <Link
            href="/admin/bds?tt=incomplete"
            className="mt-4 inline-block rounded-sm border border-error px-4 py-2 text-label uppercase text-error transition-colors duration-fast ease-base hover:bg-surface"
          >
            Xem danh sách
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-h3 text-ink">BĐS trong hệ thống</h3>
          <Link
            href="/admin/bds"
            className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
          >
            Xem tất cả
          </Link>
        </div>
        <DataTable
          rowKey={(p: (typeof sample)[number]) => p.slug}
          rows={sample}
          emptyLabel="Chưa có bản ghi nào. Bấm “Thêm BĐS” để tạo bản ghi đầu tiên."
          columns={[
            {
              key: "roomNo",
              label: "Phòng / BĐS",
              render: (p) => (
                <Link
                  href={`/admin/bds/${p.slug}`}
                  className="font-bold text-ink transition-colors duration-fast ease-base hover:text-primary"
                >
                  {p.roomNo}
                </Link>
              ),
            },
            { key: "propertyType", label: "Loại", render: (p) => p.propertyType ?? "—" },
            { key: "location", label: "Khu vực", render: (p) => p.location },
            {
              key: "price",
              label: "Giá",
              numeric: true,
              render: (p) => (p.price > 0 ? formatCurrencyVnd(p.price) : "—"),
            },
            {
              key: "area",
              label: "Diện tích",
              numeric: true,
              render: (p) => (p.area > 0 ? formatArea(p.area) : "—"),
            },
            {
              key: "availability",
              label: "Trạng thái",
              render: (p) => (
                <RentalStateChip
                  published={p.published}
                  availability={p.availability}
                  incomplete={isIncompleteRental(p)}
                />
              ),
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-h3 text-ink">Kiểm tra dữ liệu từ Google Sheet</h3>
        {/* buildMergedRentalData already computes these on every read and the
            dashboard used to throw them away in favour of a static paragraph.
            They are the only place an operator can see that rows from the
            source sheet are being skipped. */}
        <div
          className={`rounded-md border p-6 text-body text-ink ${
            sourceClean ? "border-line bg-surface" : "border-gold bg-gold/5"
          }`}
        >
          {sourceClean ? (
            <p className="flex items-center gap-2 font-bold text-success">
              <Icon name="check" size={16} aria-hidden />
              Không có dòng nào cần kiểm tra lại.
            </p>
          ) : (
            <p>
              <span className="font-bold text-gold tabular-nums">{ignored}</span> dòng được bỏ qua (dòng tiêu
              đề nhóm hoặc dòng để trống — không phải lỗi) và{" "}
              <span className="font-bold text-gold tabular-nums">{quarantined}</span> dòng bị tách riêng vì
              thiếu hoặc sai thông tin, cần vào Sheet sửa lại.
            </p>
          )}
          {quarantinedRows.length > 0 && (
            <ul className="mt-3 list-disc pl-5">
              {quarantinedRows.slice(0, 5).map((row) => (
                <li key={row.sourceRow}>
                  Dòng {row.sourceRow}: {row.reason}
                </li>
              ))}
              {quarantinedRows.length > 5 && <li>… và {quarantinedRows.length - 5} dòng khác.</li>}
            </ul>
          )}
          {mediaDiagnostics.length > 0 && (
            <p className="mt-3">
              <span className="font-bold text-gold tabular-nums">{mediaDiagnostics.length}</span> dòng có link
              ảnh không đọc được — tin vẫn đăng nhưng dùng ảnh mặc định.
            </p>
          )}
          <p className="mt-3 text-muted">
            Hoa hồng / người dẫn / ghi chú chỉ dùng nội bộ — không bao giờ hiện trên trang web khách xem.
          </p>
        </div>
      </section>
    </div>
  );
}
