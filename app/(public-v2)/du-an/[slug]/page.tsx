import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { ProjectInquiryForm2 } from "@/components/public-v2/ProjectInquiryForm2";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { getZaloHref } from "@/lib/zalo";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import { iconForAmenity } from "@/lib/projectAmenities";
import { projectStatusLabel } from "@/lib/projectStatus";
import { firstMedia, PROJECT_PLACEHOLDER } from "@/lib/media";
import type { ProjectListing } from "@/lib/types";

export const dynamic = "force-dynamic";

const HOTLINE_TEL = "0986602203";

async function loadProjects(): Promise<ProjectListing[]> {
  if (isVisualFixtureV2Enabled()) return getVisualFixtureProjects();
  const repo = await getProjectRepository();
  return toPublicProjectListings(await repo.list());
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = (await loadProjects()).find((p) => p.slug === slug);
  if (!project) return { title: "Không tìm thấy dự án | NDTHICH LAND" };
  return {
    title: `${project.name} | Dự án NDTHICH LAND`,
    // Only real, CMS-backed copy — no invented scale/legal/unit-count facts.
    description: project.summary || `Thông tin dự án ${project.name} tại ${project.location}.`,
    alternates: { canonical: `/du-an/${project.slug}` },
    openGraph: {
      title: project.name,
      description: project.summary || undefined,
      images: project.media.length > 0 ? [project.media[0]] : undefined,
    },
  };
}

// 05_ChiTietDuAn_WEB.png uses 5 frozen milestone photographs instead of an
// abstract step indicator; the MOBILE master keeps the compact 3-step
// abstract timeline instead — the two viewports intentionally differ here.
// The WEB photo grid is now real per-project data (project.progressPhotos)
// instead of a single hardcoded set every project used to share.
function progressPhotoStepIndex(progressPercent: number, count: number): number {
  if (count === 0) return -1;
  return Math.min(Math.floor((progressPercent / 100) * count), count - 1);
}

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

// ProjectListing has no real fields backing "Loại hình"/"Quy mô"/"Số lượng"/
// apartment-area-range/legal-status — the master shows specific values for
// these, which is fine as VISUAL_FIXTURE_V2 QA content (matches the master
// exactly for deterministic capture), but production has no CMS-backed
// source for them yet, so it must show "Đang cập nhật" rather than invent a
// project scale/unit count/legal status that isn't real (Round 8 blocker 2).
function projectFacts(project: ProjectListing, isFixture: boolean): { icon: IconName; label: string; value: string }[] {
  const tbd = "Đang cập nhật";
  return [
    { icon: "building", label: "Chủ đầu tư", value: project.investor || "—" },
    { icon: "shop", label: "Loại hình", value: isFixture ? "Căn hộ cao cấp" : tbd },
    { icon: "area", label: "Quy mô", value: isFixture ? "2,5 ha" : tbd },
    { icon: "building", label: "Số lượng", value: isFixture ? "1.200 căn" : tbd },
  ];
}

export default async function DuAnDetailPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const projects = await loadProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const isFixture = isVisualFixtureV2Enabled();
  const stepIndex = progressStepIndex(project.progressPercent);
  const photoStepIndex = progressPhotoStepIndex(project.progressPercent, project.progressPhotos.length);
  const facts = projectFacts(project, isFixture);

  // Reuses the SAME fixture-vs-production rule as projectFacts above: only
  // VISUAL_FIXTURE_V2 QA mode shows the master-matching specific values;
  // production shows "Đang cập nhật" for fields with no real CMS source
  // (Round 8 blocker 2 — these must never render as real production facts).
  const tbd = "Đang cập nhật";
  const checklist = [
    `Vị trí: ${project.location}`,
    `Chủ đầu tư: ${project.investor || "—"}`,
    `Loại hình phát triển: ${isFixture ? "Căn hộ cao cấp" : tbd}`,
    `Quy mô: ${isFixture ? "2,5 ha" : tbd}`,
    `Số lượng sản phẩm: ${isFixture ? "1.200 căn" : tbd}`,
    `Diện tích căn hộ: ${isFixture ? "50m² - 120m²" : tbd}`,
    `Pháp lý: ${isFixture ? "Sở hữu lâu dài" : tbd}`,
  ];

  return (
    <div className="v2-container py-3 min-[900px]:py-8 wide:py-12">
      <Breadcrumb2 withHomeIcon items={[{ label: "Dự án", href: "/du-an" }, { label: project.name }]} />

      {/* MOBILE top: single hero photo (no thumbnail row here — that's a
          separate "Thư viện dự án" section further down on mobile), title,
          burgundy consultation form, then facts. Every block here is
          deliberately compact — the master fits hero through bottom CTA
          entirely within the canonical 724x2172 viewport. */}
      <div className="min-[900px]:hidden">
        <div className="relative -mx-3 aspect-[16/7] overflow-hidden">
          <Image
            src={firstMedia(project.media, PROJECT_PLACEHOLDER)}
            alt={project.name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#880206]">
            {projectStatusLabel(project.status)}
          </span>
        </div>
        <h1 className="mt-2 text-[15px] font-extrabold text-[#0C0D0D]">{project.name}</h1>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#5F5D5D]">
          <Icon name="pin" size={11} /> {project.location}
        </p>

        <div id="tu-van-du-an" className="mt-2 scroll-mt-20 rounded-lg border-2 border-[#880206] bg-[#880206] p-2">
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
            <div key={fact.label} className="flex items-center gap-1 rounded-lg border border-[#EDEBEA] p-1">
              <Icon name={fact.icon} size={14} className="shrink-0 text-[#880206]" />
              <div className="min-w-0">
                <p className="truncate text-[9px] font-bold text-[#0C0D0D]">{fact.value}</p>
                <p className="truncate text-[7px] text-[#5F5D5D]">{fact.label}</p>
              </div>
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
      <div className="mt-5 hidden min-[900px]:grid min-[900px]:grid-cols-[1.3fr_1fr_260px] min-[900px]:items-start min-[900px]:gap-6 wide:grid-cols-[1.3fr_1fr_320px] wide:gap-10">
        <Gallery2 images={project.media} desktopAspect="15/16" />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[20px] font-extrabold leading-tight text-[#0C0D0D] wide:text-[40px] wide:leading-[48px]">
              {project.name}
            </h1>
            <span className="shrink-0 rounded-full bg-[#FBEFE3] px-3 py-1 text-[12px] font-bold text-[#C08E47] wide:px-4 wide:py-[6px] wide:text-[13px]">
              {projectStatusLabel(project.status)}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-[6px] text-[13px] text-[#5F5D5D] wide:text-[15px]">
            <Icon name="pin" size={15} /> {project.location}
          </p>

          <div className="mt-5 grid grid-cols-4 gap-2 wide:mt-8 wide:gap-3">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-lg border border-[#EDEBEA] p-2 text-center wide:rounded-[12px] wide:p-3">
                <Icon name={fact.icon} size={20} className="mx-auto text-[#880206]" />
                <p className="mt-1 leading-tight text-[11px] font-bold text-[#0C0D0D] wide:text-[17px]">{fact.value}</p>
                <p className="leading-tight text-[9px] text-[#5F5D5D] wide:text-[13px]">{fact.label}</p>
              </div>
            ))}
          </div>

          <section className="mt-6 wide:mt-10">
            <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-[18px]">Thông tin dự án</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#3A3838] wide:text-v2-body">{project.summary}</p>
          </section>
        </div>

        <aside>
          <div className="rounded-lg border-2 border-[#880206] bg-[#880206] p-6 wide:rounded-[16px] wide:p-8">
            <h2 className="text-[17px] font-bold text-white wide:text-[19px]">Liên hệ tư vấn dự án</h2>
            <p className="mt-1 text-[12px] text-white/80 wide:text-[14px]">
              Để lại thông tin, chúng tôi sẽ liên hệ tư vấn chi tiết cho bạn!
            </p>
            <div className="mt-4">
              <ProjectInquiryForm2 projectName={project.name} variant="inline" />
            </div>
          </div>
        </aside>
      </div>

      {project.amenities.length > 0 && (
        <section className="mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="amenities">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Tiện ích nổi bật</h2>
          {/* Master keeps every amenity in ONE row (7 WEB / 5 visible on
              MOBILE before wrapping) — real data isn't truncated, entries
              past the master-visible count are just hidden on narrow
              widths, same pattern as the /du-an card cap above. */}
          <div className="mt-[6px] grid grid-cols-5 gap-1 min-[900px]:mt-4 min-[900px]:grid-cols-7 min-[900px]:gap-4 wide:mt-6 wide:gap-6">
            {project.amenities.map((amenity, i) => (
              <div key={amenity} className={`flex flex-col items-center gap-1 text-center min-[900px]:gap-2 ${i >= 5 ? "hidden min-[900px]:flex" : ""}`}>
                <Icon
                  name={iconForAmenity(amenity)}
                  size={16}
                  className="text-[#C08E47] min-[900px]:!h-[26px] min-[900px]:!w-[26px] wide:!h-8 wide:!w-8"
                />
                <p className="truncate text-[7px] font-medium text-[#0C0D0D] min-[900px]:text-[12px] wide:text-[14px]">{amenity}</p>
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
      <section className="mt-8 hidden min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-8 wide:mt-16 wide:gap-10">
        <div>
          <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-v2-h2">Thông tin chi tiết dự án</h2>
          <p className="mt-3 text-[12px] leading-snug text-[#3A3838] wide:mt-4 wide:text-v2-body">{project.summary}</p>
          <ul className="mt-2 flex flex-col gap-1 wide:mt-4 wide:gap-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12px] leading-snug text-[#3A3838] wide:text-[16px] wide:leading-[26px]">
                <Icon name="check" size={14} className="mt-[2px] shrink-0 text-[#23825C]" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg wide:rounded-[16px]">
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
      <section className="mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="progress">
        <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Tiến độ dự án</h2>

        <div className="mt-5 hidden min-[900px]:grid min-[900px]:grid-cols-5 min-[900px]:gap-4 wide:mt-8 wide:gap-6">
          {project.progressPhotos.length > 0 ? (
            project.progressPhotos.map((step, i) => (
              <div key={step.image + i} className="flex flex-col items-center text-center">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg wide:rounded-[14px]">
                  <Image src={step.image} alt={step.label || project.name} fill className="object-cover" unoptimized />
                </div>
                <div
                  className={`mt-3 h-3 w-3 rounded-full border-2 border-white ${i <= photoStepIndex ? "bg-[#880206]" : "bg-[#E4E1E0]"}`}
                />
                {step.label && (
                  <p
                    className={`mt-1 text-[13px] font-semibold wide:text-[15px] ${i === photoStepIndex ? "text-[#880206]" : "text-[#0C0D0D]"}`}
                  >
                    {step.label}
                  </p>
                )}
                <p className="text-[11px] text-[#5F5D5D] wide:text-[13px]">{i === photoStepIndex ? project.progressText : " "}</p>
              </div>
            ))
          ) : (
            <p className="col-span-5 text-[13px] text-[#5F5D5D] wide:text-[15px]">Hình ảnh tiến độ đang được cập nhật.</p>
          )}
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
        {/* Was an inert <button>. The page already carries a real inquiry
            form wired to the approved WEB_CONTACTS backend, so this now
            takes the visitor straight to it instead of doing nothing. */}
        <a
          href="#tu-van-du-an"
          className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#880206] px-2 py-2 text-[11px] font-semibold text-white transition-colors duration-fast ease-base hover:bg-[#750F0D]"
        >
          <Icon name="calendar" size={13} className="text-white" /> Đặt lịch xem dự án
        </a>
      </div>

      <section
        className="mt-6 hidden flex-col items-start justify-between gap-2 rounded-lg bg-[#880206] p-3 text-white min-[900px]:flex min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:p-4 wide:mt-16 wide:rounded-[16px] wide:p-8"
        data-qa-region="bottom-cta"
      >
        <div className="flex items-center gap-3">
          <Icon name="phone" size={18} className="text-white wide:!h-6 wide:!w-6" />
          <div>
            <p className="text-[13px] font-bold wide:text-[19px]">Bạn cần tư vấn thêm thông tin dự án?</p>
            <p className="text-[11px] text-white/80 wide:text-[14px]">Đội ngũ chuyên viên của NDTHICH luôn sẵn sàng hỗ trợ bạn.</p>
          </div>
        </div>
        <a
          href={getZaloHref()}
          className="flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-semibold text-[#880206] wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
        >
          Liên hệ ngay <Icon name="arrow-right" size={13} />
        </a>
      </section>
    </div>
  );
}
