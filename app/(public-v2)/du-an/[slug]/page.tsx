import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { ProjectInquiryForm2 } from "@/components/public-v2/ProjectInquiryForm2";
import { LoanEstimator2 } from "@/components/public-v2/LoanEstimator2";
import { InteractiveMap2 } from "@/components/public-v2/InteractiveMap2";
import { ExpandableBlock2 } from "@/components/public-v2/ExpandableBlock2";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { getZaloHref } from "@/lib/zalo";
import { getProjectRepository } from "@/lib/server/projects/providers";
import { toPublicProjectListings } from "@/lib/server/projects/dto";
import { isVisualFixtureV2Enabled, getVisualFixtureProjects } from "@/lib/visualFixtureV2";
import { iconForAmenity } from "@/lib/projectAmenities";
import { projectStatusLabel } from "@/lib/projectStatus";
import type { ProjectListing } from "@/lib/types";

export const dynamic = "force-dynamic";

const HOTLINE_TEL = "0986602203";

// React cache(): generateMetadata and the page body both need the project,
// and without this the CMS/Sheets read runs twice per request.
const loadProjects = cache(async (): Promise<ProjectListing[]> => {
  if (isVisualFixtureV2Enabled()) return getVisualFixtureProjects();
  const repo = await getProjectRepository();
  return toPublicProjectListings(await repo.list());
});

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

function projectFacts(project: ProjectListing): { icon: IconName; label: string; value: string }[] {
  const tbd = "Đang cập nhật";
  return [
    { icon: "building", label: "Chủ đầu tư", value: project.investor || "—" },
    { icon: "shop", label: "Loại hình", value: project.propertyType || tbd },
    { icon: "area", label: "Quy mô", value: project.scale || tbd },
    { icon: "building", label: "Số lượng", value: project.unitCount || tbd },
  ];
}

export default async function DuAnDetailPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const projects = await loadProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const stepIndex = progressStepIndex(project.progressPercent);
  const photoStepIndex = progressPhotoStepIndex(project.progressPercent, project.progressPhotos.length);
  const facts = projectFacts(project);

  const tbd = "Đang cập nhật";
  const checklist = [
    `Vị trí: ${project.location}`,
    `Chủ đầu tư: ${project.investor || "—"}`,
    `Loại hình phát triển: ${project.propertyType || tbd}`,
    `Quy mô: ${project.scale || tbd}`,
    `Số lượng sản phẩm: ${project.unitCount || tbd}`,
    `Diện tích căn hộ: ${project.apartmentArea || tbd}`,
    `Pháp lý: ${project.legalStatus || tbd}`,
  ];

  // Real project data is a flat "location" string (e.g. "Hà Nội", or
  // "Quận 7, TP. HCM" for the fixture set) rather than structured
  // city/district fields — split on comma so the breadcrumb gets real
  // in-between crumbs where the data supports it, one crumb otherwise.
  // Never invents an administrative level that isn't actually in the data.
  const locationCrumbs = project.location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const faqItems = [
    { q: `Chủ đầu tư dự án ${project.name} là ai?`, a: project.investor || tbd },
    { q: `Vị trí dự án ${project.name} ở đâu?`, a: project.location || tbd },
    { q: `Quy mô dự án ${project.name} như thế nào?`, a: facts.find((f) => f.label === "Quy mô")?.value ?? tbd },
    { q: `Tình trạng pháp lý của dự án như thế nào?`, a: project.legalStatus || tbd },
  ];

  return (
    <div className="v2-container py-3 min-[900px]:py-8 wide:py-12">
      <Breadcrumb2
        withHomeIcon
        items={[
          { label: "Dự án", href: "/du-an" },
          ...locationCrumbs.map((label) => ({ label, href: `/du-an?kv=${encodeURIComponent(label)}` })),
          { label: project.name },
        ]}
      />

      {/* MOBILE top: hero photo + thumbnail strip together (same "gallery
          first" order as WEB, where Gallery2 sits before title), then
          title, burgundy consultation form, then facts. Reuses Gallery2
          (same component WEB uses) instead of a plain <Image> strip so
          tapping a photo opens the same zoom/lightbox WEB already has —
          the mobile strip was previously inert <Image> tags with no click
          handler. Every block here is deliberately compact — the master
          fits hero through bottom CTA entirely within the canonical
          724x2172 viewport. */}
      <div className="min-[900px]:hidden">
        <div className="relative mt-2">
          <Gallery2 images={project.media} desktopAspect="16/7" />
          <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#880206]">
            {projectStatusLabel(project.status)}
          </span>
        </div>
        {/* Above the fold, so this plays on load rather than on scroll —
            same animate-v2-rise-in + staggered animationDelay pattern as
            the homepage hero, staggered in reading order. */}
        <h1 className="animate-v2-rise-in mt-2 text-[15px] font-extrabold text-[#0C0D0D]" style={{ animationDelay: "80ms" }}>
          {project.name}
        </h1>
        <p
          className="animate-v2-rise-in mt-1 flex items-center gap-1 text-[10px] text-[#5F5D5D]"
          style={{ animationDelay: "160ms" }}
        >
          <Icon name="pin" size={11} /> {project.location}
        </p>

        <div className="mt-2 grid grid-cols-4 gap-1">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className="animate-v2-rise-in flex items-center gap-1 rounded-lg border border-[#EDEBEA] p-1"
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <Icon name={fact.icon} size={14} className="shrink-0 text-[#880206]" />
              <div className="min-w-0">
                <p className="truncate text-[9px] font-bold text-[#0C0D0D]">{fact.value}</p>
                <p className="truncate text-[7px] text-[#5F5D5D]">{fact.label}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="animate-v2-rise-in mt-2" style={{ animationDelay: "520ms" }}>
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
          {/* Above the fold — same load-triggered animate-v2-rise-in stagger
              as the mobile hero and the homepage hero, not scroll-driven. */}
          <div className="animate-v2-rise-in flex flex-wrap items-center gap-2" style={{ animationDelay: "80ms" }}>
            <h1 className="text-[20px] font-extrabold leading-tight text-[#0C0D0D] wide:text-[40px] wide:leading-[48px]">
              {project.name}
            </h1>
            <span className="shrink-0 rounded-full bg-[#FBEFE3] px-3 py-1 text-[12px] font-bold text-[#C08E47] wide:px-4 wide:py-[6px] wide:text-[13px]">
              {projectStatusLabel(project.status)}
            </span>
          </div>
          <p
            className="animate-v2-rise-in mt-2 flex items-center gap-[6px] text-[13px] text-[#5F5D5D] wide:text-[15px]"
            style={{ animationDelay: "180ms" }}
          >
            <Icon name="pin" size={15} /> {project.location}
          </p>

          <div className="mt-5 grid grid-cols-4 gap-2 wide:mt-8 wide:gap-3">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="animate-v2-rise-in rounded-lg border border-[#EDEBEA] p-2 text-center wide:rounded-[12px] wide:p-3"
                style={{ animationDelay: `${280 + i * 70}ms` }}
              >
                <Icon name={fact.icon} size={20} className="mx-auto text-[#880206]" />
                <p className="mt-1 leading-tight text-[11px] font-bold text-[#0C0D0D] wide:text-[17px]">{fact.value}</p>
                <p className="leading-tight text-[9px] text-[#5F5D5D] wide:text-[13px]">{fact.label}</p>
              </div>
            ))}
          </div>

          <section className="animate-v2-rise-in mt-6 wide:mt-10" style={{ animationDelay: "600ms" }}>
            <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-[18px]">Thông tin dự án</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#3A3838] wide:text-v2-body">{project.summary}</p>
          </section>
        </div>

        <aside className="animate-v2-rise-in" style={{ animationDelay: "260ms" }}>
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
        <section className="v2-reveal mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="amenities">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Tiện ích nổi bật</h2>
          {/* Master keeps every amenity in ONE row (7 WEB / 5 visible on
              MOBILE before wrapping) — real data isn't truncated, entries
              past the master-visible count are just hidden on narrow
              widths, same pattern as the /du-an card cap above. */}
          <div className="v2-stagger mt-[6px] grid grid-cols-5 gap-1 min-[900px]:mt-4 min-[900px]:grid-cols-7 min-[900px]:gap-4 wide:mt-6 wide:gap-6">
            {project.amenities.map((amenity, i) => (
              <div
                key={amenity}
                className={`group flex flex-col items-center gap-1 text-center transition-transform duration-fast ease-base hover:-translate-y-1 min-[900px]:gap-2 ${i >= 5 ? "hidden min-[900px]:flex" : ""}`}
              >
                <Icon
                  name={iconForAmenity(amenity)}
                  size={16}
                  className="text-[#C08E47] transition-colors duration-fast ease-base group-hover:text-[#880206] min-[900px]:!h-[26px] min-[900px]:!w-[26px] wide:!h-8 wide:!w-8"
                />
                <p className="truncate text-[7px] font-medium text-[#0C0D0D] min-[900px]:text-[12px] wide:text-[14px]">{amenity}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tổng quan dự án — "Xem thêm" reveals Vị trí + Quy hoạch-Mặt bằng,
          same accordion mechanism as the FAQ section below. Only renders
          real fields this record carries: project.location (always present)
          and project.unitTypes (admin-entered per-unit-type breakdown,
          empty by default — an empty array hides that sub-block instead of
          showing a fabricated table, same rule as progressPhotos/masterplan
          above). */}
      <section className="v2-reveal mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="overview-expand">
        <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Tổng quan dự án</h2>

        {/* Was a <details> that hid the whole block until clicked, so a
            visitor could not tell whether opening it was worth it. It now
            shows a teaser that fades out, with the control only appearing
            when there is genuinely more below the fold. */}
        <ExpandableBlock2 className="mt-4 min-[900px]:mt-6">
          <div className="flex flex-col gap-5 wide:gap-8">
            {project.location && (
              <div>
                <h3 className="text-[11px] font-bold text-[#0C0D0D] min-[900px]:text-[13px] wide:text-[16px]">Vị trí</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#3A3838] min-[900px]:text-[13px] wide:text-[14px]">
                  Dự án {project.name} tọa lạc tại {project.location}.
                </p>
              </div>
            )}

            {project.highlights.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-[#0C0D0D] min-[900px]:text-[13px] wide:text-[16px]">Điểm nổi bật</h3>
                <ul className="v2-stagger mt-2 flex flex-col gap-1 min-[900px]:gap-2">
                  {project.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-[11px] leading-relaxed text-[#3A3838] min-[900px]:text-[13px] wide:text-[14px]"
                    >
                      <Icon name="check" size={13} className="mt-[2px] shrink-0 text-[#23825C]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.unitTypes.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-[#0C0D0D] min-[900px]:text-[13px] wide:text-[16px]">Quy hoạch - Mặt bằng</h3>
                <div className="v2-stagger mt-3 flex flex-col gap-6 min-[900px]:gap-8">
                  {project.unitTypes.map((unit, i) => (
                    <div key={unit.name + i} className="flex flex-col gap-2">
                      {unit.image && (
                        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg wide:rounded-[16px]">
                          <Image
                            src={unit.image}
                            alt={unit.caption || unit.name}
                            fill
                            className="object-cover transition-transform duration-slow ease-base group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      )}
                      {unit.image && unit.caption && (
                        <p className="text-center text-[10px] italic text-[#8A8785] min-[900px]:text-[12px] wide:text-[13px]">
                          {unit.caption}
                        </p>
                      )}
                      <div className="text-[11px] leading-relaxed text-[#3A3838] min-[900px]:text-[13px] wide:text-[14px]">
                        <p className="font-semibold text-[#0C0D0D]">{unit.name}</p>
                        <p>
                          {unit.count} căn
                          {unit.areaRange ? `, ${unit.areaRange}` : ""}
                          {unit.frontage ? `, mặt tiền ${unit.frontage}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableBlock2>
      </section>

      {/* Mặt bằng dự án — a real per-project masterplan/site-layout image, not
          a field this codebase has yet. Showing a stand-in image here would
          claim it as this specific project's actual site plan, which is
          exactly the kind of thing the amenity-photo mix-up bug already
          taught this project not to do — so this renders an honest pending
          state (same convention as progressPhotos when empty) instead. Ready
          to show a real image the moment a per-project field exists. */}
      {project.showMasterplan && (
        <section className="v2-reveal mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="masterplan">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Mặt bằng dự án</h2>
          {project.masterplanImage ? (
            <div className="mt-[6px] overflow-hidden rounded-lg border border-[#EDEBEA] bg-[#F7F6F6] min-[900px]:mt-4 wide:mt-6 wide:rounded-[16px]">
              <Image
                src={project.masterplanImage}
                alt={`Mặt bằng dự án ${project.name}`}
                width={1600}
                height={700}
                className="h-auto w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="mt-[6px] flex aspect-[16/7] items-center justify-center rounded-lg border border-dashed border-[#E4E1E0] bg-[#F7F6F6] text-center min-[900px]:mt-4 wide:mt-6 wide:rounded-[16px]">
              <p className="max-w-xs px-4 text-[11px] leading-relaxed text-[#5F5D5D] wide:text-[14px]">
                Bản vẽ mặt bằng dự án đang được cập nhật.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Master (WEB) puts the description+checklist LEFT and a large pool
          photo RIGHT, side by side — WEB only. Mobile's flow is hero -> title
          -> form -> facts -> info -> amenities -> progress -> gallery -> map
          -> CTA (no second "info" block; "Thông tin dự án" above already
          covers it), so this whole section is desktop-only. */}
      <section className="v2-reveal mt-8 hidden min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-8 wide:mt-16 wide:gap-10">
        <div>
          <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-v2-h2">Thông tin chi tiết dự án</h2>
          <p className="mt-3 text-[12px] leading-snug text-[#3A3838] wide:mt-4 wide:text-v2-body">{project.summary}</p>
          <ul className="v2-stagger mt-2 flex flex-col gap-1 wide:mt-4 wide:gap-3">
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
          <Image src="/assets/round8-web/R8_13-ho-boi-sang-trong-luc-hoang-hon.webp" alt={`${project.name} — tiện ích hồ bơi`} fill className="v2-parallax object-cover" unoptimized />
        </div>
      </section>

      {/* WEB: 5 frozen milestone photos. MOBILE: compact 3-step abstract timeline. */}
      <section className="v2-reveal mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="progress">
        <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Tiến độ dự án</h2>

        <div className="v2-stagger mt-5 hidden min-[900px]:grid min-[900px]:grid-cols-5 min-[900px]:gap-4 wide:mt-8 wide:gap-6">
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

      {/* Ước tính khoản vay + Câu hỏi thường gặp — side by side on PC (chia
          đôi, LoanEstimator2 giờ chỉ rộng max-w-md nên đứng một mình để lại
          nửa trang trống) nhưng vẫn xếp chồng đúng thứ tự cũ trên mobile
          (grid-cols-1 → grid-cols-2 chỉ áp dụng từ min-[900px]). */}
      <div className="v2-reveal mt-3 grid grid-cols-1 gap-4 min-[900px]:mt-8 min-[900px]:grid-cols-2 min-[900px]:gap-8 wide:mt-16 wide:gap-10">
        {/* Ước tính khoản vay — pure client-side arithmetic, no project-data
            dependency (ProjectListing has no price field), so this cannot
            misrepresent any project-specific fact. Renders at every width. */}
        <section data-qa-region="loan-estimator">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Ước tính khoản vay</h2>
          <div className="mt-[6px] min-[900px]:mt-4 wide:mt-6">
            <LoanEstimator2 />
          </div>
        </section>

        {/* Câu hỏi thường gặp — generated only from real fields this record
            already carries (investor/location/facts), never invented specs. */}
        <section data-qa-region="faq">
          <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-v2-h2">Các câu hỏi thường gặp</h2>
          <div className="v2-stagger mt-[6px] flex flex-col divide-y divide-[#EDEBEA] rounded-lg border border-[#EDEBEA] min-[900px]:mt-4 wide:mt-6 wide:rounded-[16px]">
            {faqItems.map((item) => (
              <details key={item.q} className="group px-4 py-3 transition-colors duration-fast ease-base hover:bg-[#FBFAFA] wide:px-6 wide:py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-[#0C0D0D] wide:text-[15px]">
                  {item.q}
                  <Icon
                    name="chevron-right"
                    size={12}
                    className="shrink-0 rotate-90 text-[#5F5D5D] transition-transform duration-fast ease-base group-open:-rotate-90 wide:!h-4 wide:!w-4"
                  />
                </summary>
                <p className="mt-2 text-[11px] leading-relaxed text-[#3A3838] wide:text-[14px]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {/* A "Trải nghiệm Virtual 360°" section sat here. It was not a 360°
          tour: a flat marketing photo in a 160%-wide box that slid sideways on
          drag, labelled "360° INTERACTIVE". Its room tabs were mislabelled
          too — "Phòng ngủ Master" showed a swimming pool, "Bếp" a public
          plaza — because the images were stock renders picked per slot, not
          photographs of the project. Removed rather than restyled; there is
          no 360° asset to show. */}

      {/* Vị trí dự án — only when an admin has entered and verified a pin.
          Without one there is nothing truthful to point at, so the section is
          omitted rather than centred on the city the project happens to be in. */}
      {project.mapQuery.trim() && (
        <section className="v2-reveal mt-3 min-[900px]:mt-8 wide:mt-16" data-qa-region="map">
          <InteractiveMap2
            query={project.mapQuery.trim()}
            address={project.location}
            locationNote={project.summary}
            title={`Vị trí dự án ${project.name}`}
          />
        </section>
      )}

      {/* Liên hệ tư vấn dự án — di chuyển xuống cuối cùng trên mobile */}
      <div
        id="tu-van-du-an"
        className="v2-reveal mt-3 scroll-mt-20 rounded-lg border-2 border-[#880206] bg-[#880206] p-3 min-[900px]:hidden"
      >
        <h2 className="text-[13px] font-bold text-white">Liên hệ tư vấn dự án</h2>
        <p className="mt-[2px] text-[10px] text-white/80">
          Để lại thông tin, chuyên viên NDTHICH sẽ liên hệ với bạn sớm nhất.
        </p>
        <div className="mt-2">
          <ProjectInquiryForm2 projectName={project.name} variant="inline" />
        </div>
      </div>

      {/* Master's mobile bottom CTA */}
      <div className="h-[64px] min-[900px]:hidden" aria-hidden="true" />
      <div
        className="fixed inset-x-0 bottom-0 z-sticky-mobile-actions flex gap-2 border-t border-[#EDEBEA] bg-white/90 backdrop-blur-md p-2 min-[900px]:hidden"
        data-qa-region="bottom-cta"
      >
        <a
          href={`tel:${HOTLINE_TEL}`}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#880206] px-2 py-2 text-[11px] font-semibold text-[#880206] transition-transform duration-fast ease-base active:scale-[0.96] motion-reduce:active:scale-100"
        >
          <Icon name="phone" size={13} /> Gọi tư vấn ngay
        </a>
        <a
          href="#tu-van-du-an"
          className="btn-primary-gradient flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-white transition-transform duration-fast ease-base active:scale-[0.96] motion-reduce:active:scale-100"
        >
          <Icon name="calendar" size={13} className="text-white" /> Đặt lịch xem dự án
        </a>
      </div>

      <section
        className="v2-reveal mt-6 hidden flex-col items-start justify-between gap-2 rounded-lg bg-gradient-to-r from-[#880206] to-[#5C0104] p-3 text-white shadow-lg min-[900px]:flex min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:p-4 wide:mt-16 wide:rounded-[16px] wide:p-8"
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
          className="group flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-[12px] font-semibold text-[#880206] shadow-sm transition-all duration-fast ease-base hover:bg-[#FBEFE3] hover:shadow-md wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
        >
          Liên hệ ngay{" "}
          <Icon name="arrow-right" size={13} className="transition-transform duration-fast ease-base group-hover:translate-x-1" />
        </a>
      </section>
    </div>
  );
}
