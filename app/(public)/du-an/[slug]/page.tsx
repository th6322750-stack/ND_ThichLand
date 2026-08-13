import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { Gallery } from "@/components/public/Gallery";
import { Icon } from "@/components/icons";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";

export const dynamic = "force-dynamic";
// No generateStaticParams — same reasoning as the rental detail route
// (Task 05): a new CMS project must be addressable without a rebuild.

function CmsPlaceholderSection({ title }: { title: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-h2-mobile text-ink">{title}</h2>
      <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-md border border-line bg-soft p-6 text-center text-body text-muted">
        Dữ liệu dự án theo CMS
      </div>
    </section>
  );
}

// Same visual container as CmsPlaceholderSection, bound to the real
// progressText field when the CMS has one (GĐ6) — mirrors the
// ServiceFeeSection pattern from the rental detail page (GĐ5).
function ProgressSection({ progressText }: { progressText: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-h2-mobile text-ink">Tiến độ</h2>
      <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-md border border-line bg-soft p-6 text-center">
        {progressText ? (
          <p className="text-body text-ink">{progressText}</p>
        ) : (
          <p className="text-body text-muted">Dữ liệu dự án theo CMS</p>
        )}
      </div>
    </section>
  );
}

export default async function DuAnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = await getProjectRepository();
  const projects = toPublicProjectListings(await repo.list());
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="container-page py-8">
      {/* Breadcrumb — mobile master uses "Dự án / <name>", desktop uses the full path */}
      <div className="desktop:hidden">
        <Breadcrumb items={[{ label: "Dự án", href: "/du-an" }, { label: project.name }]} />
      </div>
      <div className="hidden desktop:block">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án", href: "/du-an" }, { label: project.name }]} />
      </div>

      {/* Mobile composition — matches 05_ChiTietDuAn_MOBILE.png as its own section sequence */}
      <div className="desktop:hidden">
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-md bg-gradient-to-br from-[#C9D6CC] via-[#9CB09E] to-[#6E8570]">
          <span className="absolute bottom-4 left-4 text-label text-surface">Hero dự án • CMS</span>
        </div>

        <span className="mt-6 inline-block rounded-full bg-gold px-3 py-1 text-label uppercase text-surface">
          {project.status}
        </span>
        <h1 className="mt-3 text-h1-mobile text-ink">{project.name}</h1>
        <p className="mt-2 text-body text-muted">{project.location} • vị trí theo CMS</p>

        <div className="mt-6 rounded-md border border-line bg-surface p-6">
          <h2 className="text-h3 text-ink">Tư vấn dự án</h2>
          <div className="mt-3 flex gap-3">
            <a
              href="tel:0986602203"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="phone" size={16} className="invert" /> Gọi ngay
            </a>
            <a
              href="tel:0986602203"
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
            >
              <Icon name="chat" size={16} /> Zalo
            </a>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Giới thiệu dự án</h2>
          <div className="mt-4 rounded-md border border-line p-6 text-body text-body">{project.summary}</div>
        </section>

        <CmsPlaceholderSection title="Thông tin dự án" />

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Tiện ích nổi bật</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {project.amenities.map((amenity) => (
              <div key={amenity} className="flex items-start gap-3 rounded-md border border-line p-4">
                <Icon name="check" size={18} className="mt-1 text-primary" />
                <div>
                  <p className="text-h3 text-ink">{amenity}</p>
                  <p className="text-body text-muted">Theo CMS</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ProgressSection progressText={project.progressText} />

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Hình ảnh dự án</h2>
          <div className="mt-4">
            <Gallery images={project.media} layout="grid" />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Vị trí</h2>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A]">
            <span className="absolute bottom-4 left-4 text-label text-surface">Google Maps container</span>
          </div>
        </section>
      </div>

      {/* Desktop composition */}
      <div className="hidden desktop:block">
        <div className="mt-6 grid grid-cols-[1fr_320px] gap-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-gradient-to-br from-[#C9D6CC] via-[#9CB09E] to-[#6E8570]">
            <span className="absolute bottom-4 left-4 text-label text-surface">Hero dự án • CMS</span>
          </div>
          <div className="rounded-md border border-line bg-surface p-6">
            <span className="rounded-full bg-gold px-3 py-1 text-label uppercase text-surface">
              {project.status}
            </span>
            <h1 className="mt-3 text-h1 text-ink">{project.name}</h1>
            <p className="mt-2 text-body text-muted">{project.location} • vị trí theo CMS</p>

            <h2 className="mt-6 text-h3 text-ink">Liên hệ tư vấn dự án</h2>
            <a
              href="tel:0986602203"
              className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="phone" size={16} className="invert" /> Gọi 0986 602 203
            </a>
            <a
              href="tel:0986602203"
              className="mt-3 flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
            >
              <Icon name="chat" size={16} /> Nhắn Zalo
            </a>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-h2 text-ink">Giới thiệu dự án</h2>
          <div className="mt-4 rounded-md border border-line p-6 text-body text-body">{project.summary}</div>
        </section>

        <div className="mt-10 grid grid-cols-2 gap-6">
          <section>
            <h2 className="text-h2 text-ink">Thông tin dự án</h2>
            <div className="mt-4 divide-y divide-line rounded-md border border-line">
              {/* "Loại hình" has no backing field in WEB_PROJECTS (GĐ6
                  contract) — stays "—" rather than being fabricated. */}
              {[
                ["Tên dự án", project.name],
                ["Vị trí", project.location || "—"],
                ["Chủ đầu tư", project.investor || "—"],
                ["Loại hình", "—"],
                ["Tiến độ", project.progressText || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-6 py-3 text-body">
                  <span className="text-muted">{label}</span>
                  <span className="font-bold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-h2 text-ink">Vị trí dự án</h2>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A]">
              <span className="absolute bottom-4 left-4 text-label text-surface">Google Maps</span>
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="text-h2 text-ink">Tiện ích nổi bật</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {project.amenities.map((amenity) => (
              <div key={amenity} className="flex items-start gap-3 rounded-md border border-line p-4">
                <Icon name="check" size={18} className="mt-1 text-primary" />
                <div>
                  <p className="text-h3 text-ink">{amenity}</p>
                  <p className="text-body text-muted">Nội dung theo CMS</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-h2 text-ink">Hình ảnh dự án</h2>
          <div className="mt-4">
            <Gallery images={project.media} layout="grid" />
          </div>
        </section>
      </div>
    </div>
  );
}
