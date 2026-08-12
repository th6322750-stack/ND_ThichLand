import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { Gallery } from "@/components/public/Gallery";
import { Icon } from "@/components/icons";
import { getProjectBySlug, projects } from "@/lib/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function DuAnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="container-page py-8">
      <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án", href: "/du-an" }, { label: project.name }]} />

      <div className="mt-6 grid grid-cols-1 gap-6 desktop:grid-cols-[1fr_320px]">
        <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-gradient-to-br from-[#C9D6CC] via-[#9CB09E] to-[#6E8570]">
          <span className="absolute bottom-4 left-4 text-label text-surface">{project.name} • hero</span>
        </div>
        <div className="rounded-md border border-line bg-surface p-6">
          <span className="rounded-full bg-gold px-3 py-1 text-label uppercase text-surface">
            {project.status}
          </span>
          <h1 className="mt-3 text-h1-mobile text-ink desktop:text-h1">{project.name}</h1>
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
        <h2 className="text-h2-mobile text-ink desktop:text-h2">Giới thiệu dự án</h2>
        <div className="mt-4 rounded-md border border-line p-6 text-body text-body">{project.summary}</div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 desktop:grid-cols-2">
        <section>
          <h2 className="text-h2-mobile text-ink desktop:text-h2">Thông tin dự án</h2>
          <div className="mt-4 divide-y divide-line rounded-md border border-line">
            {[
              ["Tên dự án", project.name],
              ["Vị trí", "Theo CMS"],
              ["Chủ đầu tư", "Theo CMS"],
              ["Loại hình", "Theo CMS"],
              ["Tiến độ", project.status],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-6 py-3 text-body">
                <span className="text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-h2-mobile text-ink desktop:text-h2">Vị trí dự án</h2>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-md bg-gradient-to-br from-[#E6D6CE] via-[#C5AEA1] to-[#9A786A]">
            <span className="absolute bottom-4 left-4 text-label text-surface">Google Maps</span>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-h2-mobile text-ink desktop:text-h2">Tiện ích nổi bật</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
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
        <h2 className="text-h2-mobile text-ink desktop:text-h2">Hình ảnh dự án</h2>
        <div className="mt-4">
          <Gallery images={project.media} layout="grid" />
        </div>
      </section>
    </div>
  );
}
