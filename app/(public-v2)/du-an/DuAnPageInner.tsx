"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { ProjectCardOverlay2 } from "@/components/public-v2/ProjectCardOverlay2";
import type { ProjectListing, ProjectStatus } from "@/lib/types";

type TabValue = "all" | ProjectStatus;

const TABS: { value: TabValue; id: string; label: string }[] = [
  { value: "all", id: "all", label: "Tất cả" },
  { value: "Đang triển khai", id: "in-progress", label: "Đang triển khai" },
  { value: "Đã hoàn thành", id: "done", label: "Đã hoàn thành" },
];

// Copy matches 04_DuAn_WEB.png/MOBILE.png's centered "Về ..." panel exactly
// (no photo — see the section below, which replaces the old image-left
// treatment entirely).
const ABOUT_FEATURES: { icon: "check" | "pin" | "clock" | "building"; title: string; desc: string }[] = [
  { icon: "check", title: "Pháp lý minh bạch", desc: "Hồ sơ rõ ràng, an tâm giao dịch" },
  { icon: "pin", title: "Vị trí đắc địa", desc: "Kết nối thuận tiện, tiềm năng tăng giá" },
  { icon: "clock", title: "Dịch vụ tận tâm", desc: "Đội ngũ chuyên nghiệp, hỗ trợ 24/7" },
  { icon: "building", title: "Giá trị bền vững", desc: "Kiến tạo không gian sống chuẩn mực" },
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
    <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án" }]} />

      <h1 className="mt-4 text-[26px] font-extrabold text-[#0C0D0D] min-[900px]:text-[36px]">
        Các dự án <span className="text-[#880206]">tiêu biểu</span>
      </h1>
      <p className="mt-2 max-w-2xl text-[13px] text-[#5F5D5D] min-[900px]:text-[14px]">
        Những dự án chúng tôi đã và đang tham gia phát triển, mang đến không gian sống &amp; kinh doanh
        chất lượng, bền vững cho cộng đồng.
      </p>

      <div className="mt-5 flex flex-nowrap gap-[6px] min-[900px]:flex-wrap min-[900px]:gap-2" role="tablist" aria-label="Lọc dự án theo trạng thái">
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

      <div
        id="du-an-tabpanel"
        role="tabpanel"
        aria-labelledby={`du-an-tab-${TABS.find((t) => t.value === tab)?.id}`}
        className="mt-6 grid grid-cols-1 gap-4 min-[900px]:grid-cols-3 min-[900px]:gap-5"
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
              showButton
            />
          </div>
        ))}
      </div>

      {/* Master's "Về ..." panel is centered text only, no photo. */}
      <section className="mt-10 rounded-lg border border-[#EDEBEA] bg-white p-6 text-center min-[900px]:mt-[56px] min-[900px]:p-10">
        <h2 className="mx-auto max-w-2xl text-[18px] font-extrabold leading-snug text-[#0C0D0D] min-[900px]:text-[26px]">
          Về Công ty TNHH Đầu tư &amp; Kinh doanh <span className="text-[#880206]">NDTHICH</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-[#5F5D5D]">
          Đơn vị uy tín trong lĩnh vực bất động sản, chúng tôi cam kết mang đến những sản phẩm chất lượng,
          pháp lý minh bạch và giá trị bền vững.
        </p>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-4 min-[900px]:grid-cols-4 min-[900px]:gap-8">
          {ABOUT_FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2 text-center">
              <Icon name={f.icon} size={26} className="text-[#C08E47]" />
              <div>
                <p className="text-[13px] font-bold text-[#0C0D0D]">{f.title}</p>
                <p className="text-[11px] text-[#5F5D5D]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/gioi-thieu"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#880206] px-5 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D]"
        >
          Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="invert" />
        </Link>
      </section>
    </div>
  );
}
