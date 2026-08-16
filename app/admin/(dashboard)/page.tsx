import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { formatCurrencyVnd, formatArea } from "@/lib/format";
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
  const incomplete = merged.admin.filter(
    (r) => r.propertyType === null || r.availability === null || r.price <= 0 || r.area <= 0,
  ).length;

  const stats = [
    {
      color: "#8A1822",
      label: "BĐS đang trống",
      value: String(vacant),
      delta: `${published.length} tin đang đăng`,
      deltaColor: "#8A1822",
    },
    {
      color: "#BE8A3F",
      label: "Dự án đang đăng",
      value: String(publishedProjects),
      delta: `${inProgressProjects} đang triển khai`,
      deltaColor: "#BE8A3F",
    },
    {
      color: "#2E6FE0",
      label: "Tin đã đăng",
      value: String(publishedArticles),
      delta: draftArticles > 0 ? `${draftArticles} bản nháp` : "không có nháp",
      deltaColor: "#2E6FE0",
    },
    {
      color: "#23825C",
      label: "Media",
      value: String(media.length),
      delta: "ảnh / video đã tải lên",
      deltaColor: "#23825C",
    },
  ];

  // AdminPropertyRecord carries no updatedAt for sheet-derived rows, so this
  // is honestly labelled as a sample of the catalogue rather than the old
  // "BĐS cập nhật gần đây" heading, which claimed an ordering the data
  // cannot support.
  const sample = merged.admin.slice(0, 5);

  const { ignored, quarantined, quarantinedRows, mediaDiagnostics } = merged.diagnostics;

  return (
    <div>
      <h2 className="text-h1-mobile text-ink desktop:text-h1">Tổng quan</h2>
      <p className="mt-2 text-body text-muted">Theo dõi nguồn cho thuê và nội dung đang vận hành.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {incomplete > 0 && (
        <div className="mt-6 rounded-md border border-error bg-[#FDF1F1] p-6">
          <p className="font-bold text-error">
            {incomplete} bản ghi thiếu dữ liệu bắt buộc nên không hiển thị trên website.
          </p>
          <p className="mt-2 text-body text-ink">
            Thiếu loại BĐS, tình trạng, giá hoặc diện tích. Bổ sung xong là tin tự lên trang.
          </p>
          <Link
            href="/admin/bds?tt=incomplete"
            className="mt-4 inline-block rounded-md border border-error px-4 py-2 text-label uppercase text-error transition-colors duration-fast ease-base hover:bg-surface"
          >
            Xem danh sách
          </Link>
        </div>
      )}

      <h3 className="mt-10 text-h2-mobile text-ink desktop:text-h2">BĐS trong hệ thống</h3>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-body">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="px-6 py-3 font-normal">Phòng / BĐS</th>
              <th className="px-6 py-3 font-normal">Loại</th>
              <th className="px-6 py-3 font-normal">Khu vực</th>
              <th className="px-6 py-3 font-normal">Giá</th>
              <th className="px-6 py-3 font-normal">Diện tích</th>
              <th className="px-6 py-3 font-normal">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {sample.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted">
                  Chưa có bản ghi nào.{" "}
                  <Link href="/admin/bds/new" className="text-primary hover:underline">
                    Thêm BĐS đầu tiên
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              sample.map((p) => (
                <tr key={p.slug} className="border-b border-line last:border-0 hover:bg-soft">
                  <td className="px-6 py-4 font-bold text-ink">
                    <Link href={`/admin/bds/${p.slug}`} className="hover:text-primary hover:underline">
                      {p.roomNo}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{p.propertyType ?? "—"}</td>
                  <td className="px-6 py-4">{p.location}</td>
                  <td className="px-6 py-4">{p.price > 0 ? formatCurrencyVnd(p.price) : "—"}</td>
                  <td className="px-6 py-4">{p.area > 0 ? formatArea(p.area) : "—"}</td>
                  <td className="px-6 py-4">{p.published ? (p.availability ?? "—") : "Nháp"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mt-10 text-h2-mobile text-ink desktop:text-h2">Chất lượng dữ liệu nguồn</h3>
      {/* buildMergedRentalData already computes these on every read and the
          dashboard used to throw them away in favour of a static paragraph.
          They are the only place an operator can see that rows from the
          source sheet are being skipped. */}
      <div className="mt-4 rounded-md border border-gold bg-[#FBF3E4] p-6 text-body text-ink">
        <p>
          <span className="font-bold text-gold">{ignored}</span> dòng bị bỏ qua (dòng phân nhóm / dòng trống) và{" "}
          <span className="font-bold text-gold">{quarantined}</span> dòng bị cách ly do lệch cột hoặc sai định
          dạng.
        </p>
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
            <span className="font-bold text-gold">{mediaDiagnostics.length}</span> dòng có link ảnh không đọc
            được — tin vẫn đăng nhưng dùng ảnh mặc định.
          </p>
        )}
        <p className="mt-3 text-muted">
          Hoa hồng / người dẫn / ghi chú là INTERNAL-ONLY, không bao giờ xuất hiện trên trang public.
        </p>
      </div>
    </div>
  );
}
