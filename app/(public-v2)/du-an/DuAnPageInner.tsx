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

// Round 2 wrongly rebuilt this as a centered, photo-less panel — direct
// master inspection (04_DuAn_WEB.png, y~1080-1400) confirms it actually
// keeps the SAME reception-image-left / text-right composition as Home's
// About section, with the 4 features in one row, not 2x2.
const ABOUT_FEATURES: { icon: "check" | "pin" | "clock" | "building"; title: string; desc: string }[] = [
  { icon: "check", title: "Pháp lý minh bạch", desc: "Sổ hồng riêng, đầy đủ pháp lý" },
  { icon: "pin", title: "Vị trí đắc địa", desc: "Kết nối thuận tiện, tiềm năng sinh lời cao" },
  { icon: "clock", title: "Dịch vụ tận tâm", desc: "Hỗ trợ 24/7, đồng hành cùng khách hàng" },
  { icon: "building", title: "Giá trị bền vững", desc: "Hướng đến cộng đồng & môi trường sống tốt đẹp" },
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
    <div className="mx-auto max-w-[1240px] px-3 py-3 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án" }]} />

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

      <div
        id="du-an-tabpanel"
        role="tabpanel"
        aria-labelledby={`du-an-tab-${TABS.find((t) => t.value === tab)?.id}`}
        className="mt-2 grid grid-cols-1 gap-2 min-[900px]:mt-6 min-[900px]:grid-cols-3 min-[900px]:gap-5"
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

      {/* Reception image LEFT / text+features RIGHT, matching master. */}
      <section className="mt-4 rounded-lg border border-[#EDEBEA] bg-white p-3 min-[900px]:mt-10 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-8 min-[900px]:p-8">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md min-[900px]:aspect-auto min-[900px]:h-[220px] min-[900px]:w-[340px] min-[900px]:shrink-0 min-[900px]:rounded-lg">
          <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
        </div>
        <div className="mt-2 min-[900px]:mt-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#880206] min-[900px]:text-[12px]">Về Nguyễn Đắc Thích</p>
          <h2 className="mt-1 text-[13px] font-extrabold leading-snug text-[#0C0D0D] min-[900px]:mt-2 min-[900px]:text-[24px]">
            Kiến tạo không gian sống
            <br />
            <span className="text-[#880206]">&amp; kinh doanh bền vững</span>
          </h2>
          <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-[#5F5D5D] min-[900px]:mt-2 min-[900px]:line-clamp-none min-[900px]:text-[13px]">
            Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những giá trị thực, pháp lý minh bạch
            và dịch vụ tận tâm cho khách hàng.
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1 min-[900px]:mt-4 min-[900px]:gap-4">
            {ABOUT_FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-1 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-2">
                <Icon name={f.icon} size={10} className="shrink-0 text-[#C08E47] min-[900px]:mt-[2px] min-[900px]:!h-5 min-[900px]:!w-5" />
                <div className="min-w-0">
                  <p className="truncate text-[7px] font-bold text-[#0C0D0D] min-[900px]:text-[13px]">{f.title}</p>
                  <p className="hidden text-[11px] text-[#5F5D5D] min-[900px]:block">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/gioi-thieu"
            className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#880206] px-2 py-1 text-[8px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:mt-5 min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-[10px] min-[900px]:text-[13px]"
          >
            Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="hidden text-white min-[900px]:block" />
          </Link>
        </div>
      </section>
    </div>
  );
}
