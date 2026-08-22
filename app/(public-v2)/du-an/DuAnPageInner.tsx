"use client";

import { useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { ProjectCardOverlay2 } from "@/components/public-v2/ProjectCardOverlay2";
import { EmptySearchResults } from "@/components/public/EmptySearchResults";
import { useProjectFilters } from "@/lib/useProjectFilters";
import {
  filterProjects,
  getProjectLocationOptions,
  hasActiveProjectFilters,
  type ProjectStatusFilter,
} from "@/lib/projectFilters";
import type { ProjectListing } from "@/lib/types";

const TABS: { value: ProjectStatusFilter; id: string; label: string }[] = [
  { value: "", id: "all", label: "Tất cả" },
  { value: "Đang triển khai", id: "in-progress", label: "Đang triển khai" },
  { value: "Đã hoàn thành", id: "done", label: "Đã hoàn thành" },
];

// The WEB master (04_DuAn_WEB.png, y~1080-1400) keeps the SAME
// reception-image-left / text-right composition as Home's About section,
// with the 4 features in one row. The MOBILE master (04_DuAn_MOBILE.png)
// is a genuinely different composition — centered, no photo at all, and
// the 4 features in a 2x2 icon-on-top grid, with its OWN icon set too
// (round 5 first tried reusing one shared icon list for both, which
// regressed WEB — the two masters really do use different icons, not just
// a different layout).
const ABOUT_FEATURES_WEB: { icon: "check" | "pin" | "clock" | "building"; title: string; desc: string }[] = [
  { icon: "check", title: "Pháp lý minh bạch", desc: "Sổ hồng riêng, đầy đủ pháp lý" },
  { icon: "pin", title: "Vị trí đắc địa", desc: "Kết nối thuận tiện, tiềm năng sinh lời cao" },
  { icon: "clock", title: "Dịch vụ tận tâm", desc: "Hỗ trợ 24/7, đồng hành cùng khách hàng" },
  { icon: "building", title: "Giá trị bền vững", desc: "Hướng đến cộng đồng & môi trường sống tốt đẹp" },
];
const ABOUT_FEATURES_MOBILE: { icon: "edit" | "pin" | "person" | "home"; title: string; desc: string }[] = [
  { icon: "edit", title: "Pháp lý minh bạch", desc: "Hồ sơ rõ ràng, an tâm giao dịch" },
  { icon: "pin", title: "Vị trí đắc địa", desc: "Kết nối thuận tiện, tiềm năng tăng giá" },
  { icon: "person", title: "Dịch vụ tận tâm", desc: "Đội ngũ chuyên nghiệp, hỗ trợ 24/7" },
  { icon: "home", title: "Giá trị bền vững", desc: "Kiến tạo không gian sống chuẩn mực" },
];

interface ProjectFixtureLike extends ProjectListing {
  cardMedia: string;
}

export function DuAnPageInner({ projects }: { projects: ProjectFixtureLike[] }) {
  // Keyword/khu vực/trạng thái now live in the URL (?q=&kv=&tt=) so a
  // filtered project list survives reload and can be shared — they used to
  // be local useState, so every shared /du-an link landed unfiltered.
  const { filters, setFilters, reset } = useProjectFilters();
  const router = useRouter();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // MOBILE_PROJECT_FIRST_POLISH follow-up: client noticed /du-an had no
  // way to search/narrow the list beyond the 3 status tabs (04_DuAn_
  // MOBILE.png's approved master doesn't have one either — this is a new
  // addition, not a master-parity fix). Location options are the real
  // `location` values already on each project (no separate lookup table).
  const locationOptions = useMemo(() => getProjectLocationOptions(projects), [projects]);
  const visible = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const noSourceData = projects.length === 0;

  function activate(index: number) {
    setFilters({ status: TABS[index].value });
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activate((index + 1) % TABS.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activate((index - 1 + TABS.length) % TABS.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      activate(0);
    } else if (e.key === "End") {
      e.preventDefault();
      activate(TABS.length - 1);
    }
  }

  return (
    <>
      {/* HERO_PACK_PREMIUM_V1: /du-an had no hero at all before — new
          section using the projects 4K master, same asset/pattern as Home
          and /cho-thue (mobile+desktop share one asset, crop only via
          objectPosition per HERO_ASSET_MANIFEST.json: mobile 79% 50%,
          desktop 50% 48%). Owns the page's h1 (moved from the block below,
          not duplicated) — title/description copy unchanged. */}
      <section className="relative overflow-hidden bg-[#F7F6F6]" data-qa-region="hero">
        <div className="relative h-[240px] min-[900px]:h-[430px] wide:h-[460px]">
          <div className="absolute inset-0 min-[900px]:hidden">
            <Image
              src="/assets/v2/hero/NDTHICH_PROJECTS_HERO_PREMIUM_4K.png"
              alt="NDTHICH — các dự án tiêu biểu"
              fill
              className="object-cover"
              style={{ objectPosition: "79% 50%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          <div className="absolute inset-0 hidden min-[900px]:block">
            <Image
              src="/assets/v2/hero/NDTHICH_PROJECTS_HERO_PREMIUM_4K.png"
              alt="NDTHICH — các dự án tiêu biểu"
              fill
              className="object-cover"
              style={{ objectPosition: "50% 48%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          <div
            className="absolute inset-0 min-[900px]:hidden"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.93) 45%, rgba(255,255,255,.55) 68%, rgba(255,255,255,0) 88%)",
            }}
          />
          <div
            className="absolute inset-0 hidden min-[900px]:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.9) 32%, rgba(255,255,255,.6) 48%, rgba(255,255,255,.2) 62%, rgba(255,255,255,0) 74%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 min-[900px]:hidden">
            <h1 className="text-[20px] font-extrabold leading-[1.15] text-[#0C0D0D]">
              Các dự án <span className="text-[#880206]">tiêu biểu</span>
            </h1>
            <p className="mt-1 max-w-[240px] text-[12px] leading-snug text-[#5F5D5D]">
              Những dự án chúng tôi đã và đang tham gia phát triển, mang đến không gian sống &amp; kinh
              doanh chất lượng, bền vững cho cộng đồng.
            </p>
          </div>
        </div>

        <div className="v2-container absolute inset-0 hidden min-[900px]:flex min-[900px]:items-center">
          <div className="w-[55%] wide:max-w-[620px]">
            <h1 className="text-[32px] font-extrabold leading-tight text-[#0C0D0D] wide:text-v2-h1">
              Các dự án <span className="text-[#880206]">tiêu biểu</span>
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-[#5F5D5D] wide:text-[17px] wide:leading-[28px]">
              Những dự án chúng tôi đã và đang tham gia phát triển, mang đến không gian sống &amp; kinh
              doanh chất lượng, bền vững cho cộng đồng.
            </p>
          </div>
        </div>
      </section>

      <div className="v2-container py-1 min-[900px]:py-8 wide:py-12">
        <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án" }]} />

        <div data-qa-region="heading">
          <div className="mt-2 flex flex-col gap-2 min-[900px]:mt-5 min-[900px]:flex-row min-[900px]:gap-3 wide:gap-4">
          <div className="relative min-w-0 flex-1">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A6A6A6] min-[900px]:!h-4 min-[900px]:!w-4"
            />
            <input
              type="search"
              aria-label="Tìm theo tên dự án, chủ đầu tư hoặc khu vực"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              placeholder="Tìm theo tên dự án..."
              className="h-[40px] w-full rounded-md border border-[#E4E1E0] bg-white pl-[36px] pr-3 text-[13px] text-[#0C0D0D] transition-colors duration-fast ease-base placeholder:text-[#A6A6A6] focus:border-[#880206] focus:outline-none min-[900px]:h-[46px] min-[900px]:text-[14px] wide:h-[48px]"
            />
          </div>
          <select
            aria-label="Khu vực"
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
            className="h-[40px] w-full rounded-md border border-[#E4E1E0] bg-white px-3 text-[13px] text-[#0C0D0D] transition-colors duration-fast ease-base focus:border-[#880206] focus:outline-none min-[900px]:h-[46px] min-[900px]:w-[220px] min-[900px]:text-[14px] wide:h-[48px]"
          >
            <option value="">Tất cả khu vực</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div
          className="mt-2 flex flex-nowrap gap-[6px] min-[900px]:mt-4 min-[900px]:flex-wrap min-[900px]:gap-2 wide:gap-3"
          role="tablist"
          aria-label="Lọc dự án theo trạng thái"
        >
          {TABS.map((t, index) => {
            const selected = filters.status === t.value;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`du-an-tab-${t.id}`}
                aria-selected={selected}
                aria-controls="du-an-tabpanel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setFilters({ status: t.value })}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`shrink-0 whitespace-nowrap rounded-md border px-2 py-[6px] text-[10px] font-semibold transition-colors duration-fast ease-base min-[900px]:px-4 min-[900px]:py-[10px] min-[900px]:text-[13px] wide:h-[44px] wide:rounded-[10px] wide:px-5 wide:text-[15px] ${
                  selected ? "border-[#880206] bg-[#880206] text-white" : "border-[#E4E1E0] text-[#0C0D0D] hover:border-[#880206]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 min-[900px]:mt-6">
          {noSourceData ? (
            // Honest empty-source state: nothing was filtered out, there is
            // simply no published project yet (production fails closed when
            // the CMS provider is not configured).
            <EmptySearchResults
              title="Hiện chưa có dự án nào được đăng"
              message="Danh mục dự án đang được cập nhật. Anh/chị có thể liên hệ để được tư vấn trực tiếp."
              resetLabel="Liên hệ tư vấn"
              onReset={() => router.push("/lien-he")}
            />
          ) : (
            <EmptySearchResults
              title="Không tìm thấy dự án phù hợp?"
              message={
                hasActiveProjectFilters(filters)
                  ? "Thử từ khóa khác, đổi khu vực hoặc bỏ bớt bộ lọc trạng thái."
                  : "Danh sách đang trống ở bộ lọc hiện tại."
              }
              resetLabel="Đặt lại bộ lọc"
              onReset={reset}
            />
          )}
        </div>
      ) : (
        <div
          id="du-an-tabpanel"
          role="tabpanel"
          aria-labelledby={`du-an-tab-${TABS.find((t) => t.value === filters.status)?.id}`}
          className="v2-stagger mt-1 grid grid-cols-1 gap-1 min-[900px]:mt-6 min-[900px]:grid-cols-3 min-[900px]:gap-5 wide:gap-6"
          data-qa-region="project-grid"
        >
          {/* Every project renders at every width. A previous revision hid
              the 5th card onwards below 900px to match a canonical capture,
              which meant a phone visitor could never reach projects 5+ —
              there is no pagination or "xem thêm" here to reach them with. */}
          {visible.map((project) => (
            <ProjectCardOverlay2
              key={project.slug}
              slug={project.slug}
              name={project.name}
              location={project.location}
              image={project.cardMedia}
              mobileAspect="2.8/1"
              desktopAspect="4/3"
              showButton
            />
          ))}
        </div>
      )}

      {/* MOBILE: centered, no photo, features in a 2x2 icon-on-top grid —
          a genuinely different composition from WEB's image-left/text-right
          band (04_DuAn_MOBILE.png, y~1500-1900). */}
      <section className="v2-reveal mt-4 text-center min-[900px]:hidden" data-qa-region="about">
        <h2 className="text-[13px] font-extrabold leading-snug text-[#0C0D0D]">
          Về <span className="text-[#880206]">NDTHICH LAND</span>
        </h2>
        <p className="mx-auto mt-1 max-w-xs text-[9px] leading-relaxed text-[#5F5D5D]">
          Đơn vị uy tín trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản phẩm chất
          lượng, pháp lý minh bạch và giá trị bền vững.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {ABOUT_FEATURES_MOBILE.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-1">
              <Icon name={f.icon} size={18} className="text-[#C08E47]" />
              <p className="text-[8px] font-bold leading-tight text-[#0C0D0D]">{f.title}</p>
              <p className="text-[6.5px] leading-tight text-[#5F5D5D]">{f.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/gioi-thieu"
          className="mt-3 inline-flex items-center gap-1 rounded-md bg-[#880206] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#750F0D]"
        >
          Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={12} className="text-white" />
        </Link>
      </section>

      {/* WEB: reception image LEFT / text+features RIGHT, matching master. */}
      <section
        className="v2-reveal mt-6 hidden min-[900px]:flex min-[900px]:items-center min-[900px]:gap-6 wide:mt-16 wide:gap-10"
        data-qa-region="about"
      >
        <div className="relative h-[190px] w-[340px] shrink-0 overflow-hidden rounded-lg wide:h-[280px] wide:w-[460px] wide:rounded-[16px]">
          <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="v2-parallax object-cover" unoptimized />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#880206] wide:text-[13px]">Về NDTHICH LAND</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-snug text-[#0C0D0D] wide:text-v2-h2">
            Kiến tạo không gian sống
            <br />
            <span className="text-[#880206]">&amp; kinh doanh bền vững</span>
          </h2>
          <p className="mt-2 text-[13px] text-[#5F5D5D] wide:mt-4 wide:text-v2-body">
            Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những giá trị thực, pháp lý minh bạch
            và dịch vụ tận tâm cho khách hàng.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-1 wide:mt-6 wide:gap-4">
            {ABOUT_FEATURES_WEB.map((f) => (
              <div key={f.title} className="flex items-start gap-1 wide:gap-2">
                <Icon name={f.icon} size={16} className="mt-[2px] shrink-0 text-[#C08E47] wide:!h-5 wide:!w-5" />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-[#0C0D0D] wide:text-[14px]">{f.title}</p>
                  <p className="truncate text-[7.5px] leading-tight text-[#5F5D5D] wide:text-[12px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/gioi-thieu"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#880206] px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D] wide:mt-8 wide:h-[48px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
          >
            Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="text-white" />
          </Link>
        </div>
      </section>
      </div>
    </>
  );
}
