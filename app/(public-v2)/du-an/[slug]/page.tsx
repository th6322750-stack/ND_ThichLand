import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { ProjectInquiryForm2 } from "@/components/public-v2/ProjectInquiryForm2";
import { Icon, type IconName } from "@/components/icons";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import type { ProjectListing } from "@/lib/types";

export const dynamic = "force-dynamic";

const AMENITY_ICONS: IconName[] = ["pool", "dumbbell", "tree", "grill", "shop", "clock", "building"];

const PROGRESS_STEPS = [
  { label: "Khởi công", icon: "key" as IconName },
  { label: "Hoàn thiện", icon: "check" as IconName },
  { label: "Bàn giao", icon: "key" as IconName },
];

function progressStepIndex(progressPercent: number): number {
  if (progressPercent >= 100) return 2;
  if (progressPercent >= 50) return 1;
  return 0;
}

export default async function DuAnDetailPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let projects: ProjectListing[];
  if (isVisualFixtureV2Enabled()) {
    projects = getVisualFixtureProjects();
  } else {
    const repo = await getProjectRepository();
    projects = toPublicProjectListings(await repo.list());
  }

  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const heroImage = project.media[0];
  const stepIndex = progressStepIndex(project.progressPercent);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 withHomeIcon items={[{ label: "Dự án", href: "/du-an" }, { label: project.name }]} />

      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg min-[900px]:aspect-[21/9]">
        <Image src={heroImage} alt={project.name} fill className="object-cover" unoptimized priority />
        <span className="absolute right-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#880206]">
          {project.status}
        </span>
      </div>

      <div className="mt-5 min-[900px]:grid min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start min-[900px]:gap-8">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px]">{project.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#5F5D5D]">
            <Icon name="pin" size={15} /> {project.location}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
            {[
              { icon: "building" as IconName, label: "Chủ đầu tư", value: project.investor || "—" },
              { icon: "shop" as IconName, label: "Loại hình", value: "Căn hộ cao cấp" },
              { icon: "area" as IconName, label: "Quy mô", value: "2,5 ha" },
              { icon: "building" as IconName, label: "Số lượng", value: "1.200 căn" },
            ].map((fact) => (
              <div key={fact.label} className="rounded-lg border border-[#EDEBEA] p-3 text-center">
                <Icon name={fact.icon} size={22} className="mx-auto text-[#880206]" />
                <p className="mt-2 text-[13px] font-bold text-[#0C0D0D]">{fact.value}</p>
                <p className="text-[11px] text-[#5F5D5D]">{fact.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 min-[900px]:hidden">
            <div className="rounded-lg border-2 border-[#880206] bg-[#880206] p-5">
              <h2 className="text-[16px] font-bold text-white">Liên hệ tư vấn dự án</h2>
              <p className="mt-1 text-[12px] text-white/80">
                Để lại thông tin, chuyên viên NDTHICH sẽ liên hệ với bạn trong thời gian sớm nhất.
              </p>
              <div className="mt-4">
                <ProjectInquiryForm2 projectName={project.name} variant="inline" />
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Thông tin dự án</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#3A3838]">{project.summary}</p>
          </section>

          {project.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[16px] font-bold text-[#0C0D0D]">Tiện ích nổi bật</h2>
              <div className="mt-4 grid grid-cols-3 gap-4 min-[900px]:grid-cols-4">
                {project.amenities.map((amenity, i) => (
                  <div key={amenity} className="flex flex-col items-center gap-2 text-center">
                    <Icon name={AMENITY_ICONS[i % AMENITY_ICONS.length]} size={26} className="text-[#C08E47]" />
                    <p className="text-[12px] font-medium text-[#0C0D0D]">{amenity}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Tiến độ dự án</h2>
            <div className="mt-5 flex items-center justify-between">
              {PROGRESS_STEPS.map((step, i) => (
                <div key={step.label} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      i <= stepIndex ? "bg-[#880206] text-white" : "border border-[#E4E1E0] text-[#A6A6A6]"
                    }`}
                  >
                    <Icon name={i === stepIndex ? "calendar" : "check"} size={16} className={i <= stepIndex ? "invert" : ""} />
                  </div>
                  <p className={`text-[12px] font-semibold ${i === stepIndex ? "text-[#880206]" : "text-[#5F5D5D]"}`}>
                    {i === stepIndex ? project.progressText || step.label : step.label}
                  </p>
                  {i < PROGRESS_STEPS.length - 1 && <div className="h-px w-full bg-[#E4E1E0]" />}
                </div>
              ))}
            </div>
          </section>

          {project.media.length > 1 && (
            <section className="mt-8">
              <h2 className="text-[16px] font-bold text-[#0C0D0D]">Thư viện dự án</h2>
              <div className="mt-4">
                <Gallery2 images={project.media} />
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Vị trí dự án</h2>
            <p className="mt-2 text-[13px] text-[#5F5D5D]">{project.location}</p>
            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg">
              <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${project.location}`} fill className="object-cover" unoptimized />
            </div>
          </section>
        </div>

        <aside className="hidden min-[900px]:block">
          <div className="rounded-lg border-2 border-[#880206] bg-[#880206] p-6">
            <h2 className="text-[17px] font-bold text-white">Liên hệ tư vấn dự án</h2>
            <p className="mt-1 text-[12px] text-white/80">
              Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết cho bạn!
            </p>
            <div className="mt-4">
              <ProjectInquiryForm2 projectName={project.name} variant="inline" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
