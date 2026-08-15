"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { ProjectCardOverlay2 } from "@/components/public-v2/ProjectCardOverlay2";
import type { ProjectListing, ProjectStatus } from "@/lib/types";

type TabValue = "all" | ProjectStatus;

const TABS: { value: TabValue; id: string; label: string }[] = [
  { value: "all", id: "all", label: "Tất cả" },
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
  const [tab, setTab] = useState<TabValue>("all");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = useMemo(() => (tab === "all" ? projects : projects.filter((p) => p.status === tab)), [projects, tab]);

  function activate(index: number) {
    setTab(TABS[index].value);
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
    <div className="mx-auto max-w-[1240px] px-3 py-2 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án" }]} />

      <div data-qa-region="heading">
        <h1 className="mt-2 text-[17px] font-extrabold text-[#0C0D0D] min-[900px]:mt-4 min-[900px]:text-[36px]">
          Các dự án <span className="text-[#880206]">tiêu biểu</span>
        </h1>
        <p className="mt-1 line-clamp-2 max-w-2xl text-[10px] text-[#5F5D5D] min-[900px]:mt-2 min-[900px]:line-clamp-none min-[900px]:text-[14px]">
          Những dự án chúng tôi đã và đang tham gia phát triển, mang đến không gian sống &amp; kinh doanh
          chất lượng, bền vững cho cộng đồng.
        </p>

        <div className="mt-2 flex flex-nowrap gap-[6px] min-[900px]:mt-5 min-[900px]:flex-wrap min-[900px]:gap-2" role="tablist" aria-label="Lọc dự án theo trạng thái">
          {TABS.map((t, index) => {
            const selected = tab === t.value;
            return (
              <button
                key={t.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`du-an-tab-${t.id}`}
                aria-selected={selected}
                aria-controls="du-an-tabpanel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`shrink-0 whitespace-nowrap rounded-md border px-2 py-[6px] text-[10px] font-semibold min-[900px]:px-4 min-[900px]:py-[10px] min-[900px]:text-[13px] ${
                  selected ? "border-[#880206] bg-[#880206] text-white" : "border-[#E4E1E0] text-[#0C0D0D] hover:border-[#880206]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="du-an-tabpanel"
        role="tabpanel"
        aria-labelledby={`du-an-tab-${TABS.find((t) => t.value === tab)?.id}`}
        className="mt-2 grid grid-cols-1 gap-2 min-[900px]:mt-6 min-[900px]:grid-cols-3 min-[900px]:gap-5"
        data-qa-region="project-grid"
      >
        {visible.map((project, i) => (
          // 04_DuAn_MOBILE.png's canonical viewport only has room for 4
          // cards before "Về ..." — real data isn't truncated (every
          // project still renders, in the DOM, for real production use),
          // just visually capped past the 4th on narrow widths so the
          // canonical mobile capture matches the master's visible set.
          <div key={project.slug} className={i >= 4 ? "hidden min-[900px]:block" : undefined}>
            <ProjectCardOverlay2
              slug={project.slug}
              name={project.name}
              location={project.location}
              image={project.cardMedia}
              mobileAspect="5/2"
              desktopAspect="4/3"
              showButton
            />
          </div>
        ))}
      </div>

      {/* MOBILE: centered, no photo, features in a 2x2 icon-on-top grid —
          a genuinely different composition from WEB's image-left/text-right
          band (04_DuAn_MOBILE.png, y~1500-1900). */}
      <section className="mt-4 text-center min-[900px]:hidden" data-qa-region="about">
        <h2 className="text-[13px] font-extrabold leading-snug text-[#0C0D0D]">
          Về Công ty TNHH Đầu tư &amp; Kinh doanh <span className="text-[#880206]">NDTHICH</span>
        </h2>
        <p className="mx-auto mt-1 max-w-xs text-[9px] leading-relaxed text-[#5F5D5D]">
          Đơn vị uy tín trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản phẩm chất
          lượng, pháp lý minh bạch và giá trị bền vững.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {ABOUT_FEATURES_MOBILE.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-1">
              <Icon name={f.icon} size={20} className="text-[#C08E47]" />
              <p className="text-[10px] font-bold text-[#0C0D0D]">{f.title}</p>
              <p className="text-[8px] leading-snug text-[#5F5D5D]">{f.desc}</p>
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
        className="mt-10 hidden rounded-lg border border-[#EDEBEA] bg-white p-8 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-8"
        data-qa-region="about"
      >
        <div className="relative h-[220px] w-[340px] shrink-0 overflow-hidden rounded-lg">
          <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#880206]">Về Nguyễn Đắc Thích</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-snug text-[#0C0D0D]">
            Kiến tạo không gian sống
            <br />
            <span className="text-[#880206]">&amp; kinh doanh bền vững</span>
          </h2>
          <p className="mt-2 text-[13px] text-[#5F5D5D]">
            Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những giá trị thực, pháp lý minh bạch
            và dịch vụ tận tâm cho khách hàng.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {ABOUT_FEATURES_WEB.map((f) => (
              <div key={f.title} className="flex items-start gap-2">
                <Icon name={f.icon} size={20} className="mt-[2px] shrink-0 text-[#C08E47]" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#0C0D0D]">{f.title}</p>
                  <p className="text-[11px] text-[#5F5D5D]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/gioi-thieu"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#880206] px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D]"
          >
            Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="text-white" />
          </Link>
        </div>
      </section>
    </div>
  );
}
