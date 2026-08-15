import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { ProjectInquiryForm2 } from "@/components/public-v2/ProjectInquiryForm2";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { getZaloHref } from "@/lib/zalo";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import type { ProjectListing } from "@/lib/types";

export const dynamic = "force-dynamic";

const HOTLINE_TEL = "0984602303";

const AMENITY_ICONS: IconName[] = ["pool", "dumbbell", "tree", "grill", "shop", "clock", "building"];

// 05_ChiTietDuAn_WEB.png uses 5 frozen milestone photographs
// (progress-1..5.png, .webby/client-approved-v2) instead of an abstract
// step indicator; the MOBILE master keeps the compact 3-step abstract
// timeline instead — the two viewports intentionally differ here.
const PROGRESS_PHOTOS = [
  { label: "Khởi công dự án", icon: "key" as IconName, image: "/assets/v2/project-detail/progress-1.png" },
  { label: "Thi công phần móng", icon: "key" as IconName, image: "/assets/v2/project-detail/progress-2.png" },
  { label: "Thi công phần thân", icon: "key" as IconName, image: "/assets/v2/project-detail/progress-3.png" },
  { label: "Cất nóc dự án", icon: "key" as IconName, image: "/assets/v2/project-detail/progress-4.png" },
  { label: "Bàn giao dự kiến", icon: "key" as IconName, image: "/assets/v2/project-detail/progress-5.png" },
];

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

function projectFacts(project: ProjectListing): { icon: IconName; label: string; value: string }[] {
  return [
    { icon: "building", label: "Chủ đầu tư", value: project.investor || "—" },
    { icon: "shop", label: "Loại hình", value: "Căn hộ cao cấp" },
    { icon: "area", label: "Quy mô", value: "2,5 ha" },
    { icon: "building", label: "Số lượng", value: "1.200 căn" },
  ];
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

  const stepIndex = progressStepIndex(project.progressPercent);
  const facts = projectFacts(project);

  // Reuses the SAME already-hardcoded fact values above (this codebase has
  // never had per-project structured fields for these — see projectFacts)
  // rather than inventing new project-specific specifics that don't exist.
  const checklist = [
    `Vị trí: ${project.location}`,
    `Chủ đầu tư: ${project.investor || "—"}`,
    "Loại hình phát triển: Căn hộ cao cấp",
    "Quy mô: 2,5 ha",
    "Số lượng sản phẩm: 1.200 căn",
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-3 py-3 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 withHomeIcon items={[{ label: "Dự án", href: "/du-an" }, { label: project.name }]} />

      {/* MOBILE top: single hero photo (no thumbnail row here — that's a
          separate "Thư viện dự án" section further down on mobile), title,
          burgundy consultation form, then facts. Every block here is
          deliberately compact — the master fits hero through bottom CTA
          entirely within the canonical 724x2172 viewport. */}
      <div className="min-[900px]:hidden">
        <div className="relative -mx-3 aspect-[16/7] overflow-hidden">
          <Image src={project.media[0]} alt={project.name} fill className="object-cover" unoptimized priority />
          <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#880206]">
            {project.status}
          </span>
        </div>
        <h1 className="mt-2 text-[15px] font-extrabold text-[#0C0D0D]">{project.name}</h1>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#5F5D5D]">
          <Icon name="pin" size={11} /> {project.location}
        </p>

        <div className="mt-2 rounded-lg border-2 border-[#880206] bg-[#880206] p-2">
          <h2 className="text-[11px] font-bold text-white">Liên hệ tư vấn dự án</h2>
          <p className="mt-[2px] line-clamp-1 text-[9px] text-white/80">
            Để lại thông tin, chuyên viên NDTHICH sẽ liên hệ với bạn sớm nhất.
          </p>
          <div className="mt-[6px]">
            <ProjectInquiryForm2 projectName={project.name} variant="inline" />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-lg border border-[#EDEBEA] p-1 text-center">
              <Icon name={fact.icon} size={14} className="mx-auto text-[#880206]" />
              <p className="mt-[2px] truncate text-[9px] font-bold text-[#0C0D0D]">{fact.value}</p>
              <p className="truncate text-[7px] text-[#5F5D5D]">{fact.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-2">
          <h2 className="text-[11px] font-bold text-[#0C0D0D]">Thông tin dự án</h2>
          <p className="mt-1 text-[10px] leading-snug text-[#3A3838]">{project.summary}</p>
        </section>
      </div>

      {/* WEB top: gallery LEFT / title+facts+summary CENTER / consultation
          form RIGHT, as one three-column band — a full-width hero first is
          a FAIL. */}
      <div className="mt-5 hidden min-[900px]:grid min-[900px]:grid-cols-[1.3fr_1fr_260px] min-[900px]:items-start min-[900px]:gap-6">
        <Gallery2 images={project.media} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-extrabold leading-tight text-[#0C0D0D]">{project.name}</h1>
            <span className="shrink-0 rounded-full bg-[#FBEFE3] px-3 py-1 text-[12px] font-bold text-[#C08E47]">{project.status}</span>
          </div>
          <p className="mt-2 flex items-center gap-[6px] text-[13px] text-[#5F5D5D]">
            <Icon name="pin" size={15} /> {project.location}
          </p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                <Icon name={fact.icon} size={20} className="mx-auto text-[#880206]" />
                <p className="mt-1 leading-tight text-[11px] font-bold text-[#0C0D0D]">{fact.value}</p>
                <p className="leading-tight text-[9px] text-[#5F5D5D]">{fact.label}</p>
              </div>
            ))}
          </div>

          <section className="mt-6">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Thông tin dự án</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#3A3838]">{project.summary}</p>
          </section>
        </div>

        <aside>
          <div className="rounded-lg border-2 border-[#880206] bg-[#880206] p-6">
            <h2 className="text-[17px] font-bold text-white">Liên hệ tư vấn dự án</h2>
            <p className="mt-1 text-[12px] text-white/80">Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết cho bạn!</p>
            <div className="mt-4">
              <ProjectInquiryForm2 projectName={project.name} variant="inline" />
            </div>
          </div>
        </aside>
      </div>

      {project.amenities.length > 0 && (
        <section className="mt-3 min-[900px]:mt-8" data-qa-region="amenities">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px]">Tiện ích nổi bật</h2>
          {/* Master keeps every amenity in ONE row (7 WEB / 5 visible on
              MOBILE before wrapping) — real data isn't truncated, entries
              past the master-visible count are just hidden on narrow
              widths, same pattern as the /du-an card cap above. */}
          <div className="mt-[6px] grid grid-cols-5 gap-1 min-[900px]:mt-4 min-[900px]:grid-cols-7 min-[900px]:gap-4">
            {project.amenities.map((amenity, i) => (
              <div key={amenity} className={`flex flex-col items-center gap-1 text-center min-[900px]:gap-2 ${i >= 5 ? "hidden min-[900px]:flex" : ""}`}>
                <Icon name={AMENITY_ICONS[i % AMENITY_ICONS.length]} size={16} className="text-[#C08E47] min-[900px]:!h-[26px] min-[900px]:!w-[26px]" />
                <p className="truncate text-[7px] font-medium text-[#0C0D0D] min-[900px]:text-[12px]">{amenity}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Master (WEB) puts the description+checklist LEFT and a large pool
          photo RIGHT, side by side — WEB only. Mobile's flow is hero -> title
          -> form -> facts -> info -> amenities -> progress -> gallery -> map
          -> CTA (no second "info" block; "Thông tin dự án" above already
          covers it), so this whole section is desktop-only. */}
      <section className="mt-8 hidden min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-8">
        <div>
          <h2 className="text-[16px] font-bold text-[#0C0D0D]">Thông tin chi tiết dự án</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[#3A3838]">{project.summary}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-[#3A3838]">
                <Icon name="check" size={16} className="mt-[2px] shrink-0 text-[#23825C]" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
          {/* Round 8 asset map, section 3 "/du-an/[slug] Amenity/detail
              imagery": R8_13 is the one semantically-matching "hồ bơi" (pool)
              photo of that 5-image set; R8_14/15/16/19 are finished-landscape
              scenes, not construction-stage photography, so they aren't
              forced into the "Tiến độ dự án" milestone slots below, which
              keep their already-approved (round 7) construction-stage
              progress-1..5.png set instead. */}
          <Image src="/assets/round8/R8_13-ho-boi-sang-trong-luc-hoang-hon.png" alt={`${project.name} — tiện ích hồ bơi`} fill className="object-cover" unoptimized />
        </div>
      </section>

      {/* WEB: 5 frozen milestone photos. MOBILE: compact 3-step abstract timeline. */}
      <section className="mt-3 min-[900px]:mt-8" data-qa-region="progress">
        <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px]">Tiến độ dự án</h2>

        <div className="mt-5 hidden min-[900px]:grid min-[900px]:grid-cols-5 min-[900px]:gap-4">
          {PROGRESS_PHOTOS.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center text-center">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image src={step.image} alt={step.label} fill className="object-cover" unoptimized />
              </div>
              <div className={`mt-3 h-3 w-3 rounded-full border-2 border-white ${i <= stepIndex ? "bg-[#880206]" : "bg-[#E4E1E0]"}`} />
              <p className={`mt-1 text-[13px] font-semibold ${i === stepIndex ? "text-[#880206]" : "text-[#0C0D0D]"}`}>{step.label}</p>
              <p className="text-[11px] text-[#5F5D5D]">{i === stepIndex ? project.progressText : " "}</p>
            </div>
          ))}
        </div>

        <div className="mt-[6px] flex items-center justify-between min-[900px]:hidden">
          {PROGRESS_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-1 text-center">
              <div
                className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${
                  i <= stepIndex ? "bg-[#880206] text-white" : "border border-[#E4E1E0] text-[#A6A6A6]"
                }`}
              >
                <Icon name={i === stepIndex ? "calendar" : "check"} size={11} className={i <= stepIndex ? "text-white" : ""} />
              </div>
              <p className={`text-[8px] font-semibold ${i === stepIndex ? "text-[#880206]" : "text-[#5F5D5D]"}`}>
                {i === stepIndex ? project.progressText || step.label : step.label}
              </p>
              {i < PROGRESS_STEPS.length - 1 && <div className="h-px w-full bg-[#E4E1E0]" />}
            </div>
          ))}
        </div>
      </section>

      {/* Mobile-only compact thumbnail strip — WEB already showed the full
          gallery (main + thumbnails) at the top, so it isn't repeated here. */}
      {project.media.length > 1 && (
        <section className="mt-3 min-[900px]:hidden" data-qa-region="gallery-strip">
          <h2 className="text-[12px] font-bold text-[#0C0D0D]">Thư viện dự án</h2>
          <div className="mt-[6px] grid grid-cols-4 gap-1">
            {project.media.slice(0, 4).map((src, i) => {
              const isLast = i === 3 && project.media.length > 4;
              return (
                <div key={src + i} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={src} alt="" fill className="object-cover" unoptimized />
                  {isLast && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[10px] font-bold text-white">
                      +{project.media.length - 4} ảnh
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Master's canonical WEB composition ends with the burgundy CTA right
          after progress — no large map section there (mobile's master DOES
          show one), so this is mobile-only. */}
      <section className="mt-3 min-[900px]:hidden" data-qa-region="map">
        <h2 className="text-[12px] font-bold text-[#0C0D0D]">Vị trí dự án</h2>
        <p className="mt-1 text-[10px] text-[#5F5D5D]">{project.location}</p>
        <div className="relative mt-[6px] aspect-[16/6] overflow-hidden rounded-lg">
          <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${project.location}`} fill className="object-cover" unoptimized />
        </div>
      </section>

      {/* Master's mobile bottom CTA is a fixed two-button bar (Gọi tư vấn
          ngay + Đặt lịch xem dự án) always visible at the screen bottom,
          not a scrolled-in-document block — round 4 rendered it in normal
          flow, which pushed it below the canonical viewport entirely. WEB
          keeps the original scrolled single-message + Zalo-button block. */}
      <div className="h-[64px] min-[900px]:hidden" aria-hidden="true" />
      <div
        className="fixed inset-x-0 bottom-0 z-sticky-mobile-actions flex gap-2 border-t border-[#EDEBEA] bg-white p-2 min-[900px]:hidden"
        data-qa-region="bottom-cta"
      >
        <a
          href={`tel:${HOTLINE_TEL}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#880206] px-2 py-2 text-[11px] font-semibold text-[#880206]"
        >
          <Icon name="phone" size={13} /> Gọi tư vấn ngay
        </a>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#880206] px-2 py-2 text-[11px] font-semibold text-white hover:bg-[#750F0D]"
        >
          <Icon name="calendar" size={13} className="text-white" /> Đặt lịch xem dự án
        </button>
      </div>

      <section
        className="mt-10 hidden flex-col items-start justify-between gap-2 rounded-lg bg-[#880206] p-3 text-white min-[900px]:flex min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:p-6"
        data-qa-region="bottom-cta"
      >
        <div className="flex items-center gap-3">
          <Icon name="phone" size={20} className="text-white" />
          <div>
            <p className="text-[14px] font-bold">Bạn cần tư vấn thêm thông tin dự án?</p>
            <p className="text-[12px] text-white/80">Đội ngũ chuyên viên của NDTHICH luôn sẵn sàng hỗ trợ bạn.</p>
          </div>
        </div>
        <a
          href={getZaloHref()}
          className="flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-[13px] font-semibold text-[#880206]"
        >
          Liên hệ ngay <Icon name="arrow-right" size={13} />
        </a>
      </section>
    </div>
  );
}
