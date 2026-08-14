"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
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
    <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Dự án" }]} />

      <h1 className="mt-4 text-[26px] font-extrabold text-[#0C0D0D] min-[900px]:text-[36px]">
        Các dự án <span className="text-[#880206]">tiêu biểu</span>
      </h1>
      <p className="mt-2 max-w-2xl text-[13px] text-[#5F5D5D] min-[900px]:text-[14px]">
        Những dự án chúng tôi đã và đang tham gia phát triển, mang đến không gian sống &amp; kinh doanh
        chất lượng, bền vững cho cộng đồng.
      </p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Lọc dự án theo trạng thái">
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
              className={`rounded-md border px-4 py-2.5 text-[13px] font-semibold ${
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
        {visible.map((project) => (
          <ProjectCardOverlay2
            key={project.slug}
            slug={project.slug}
            name={project.name}
            location={project.location}
            image={project.cardMedia}
            showButton
          />
        ))}
      </div>

      <section className="mt-14 rounded-lg border border-[#EDEBEA] bg-white p-6 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-10 min-[900px]:p-10">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg min-[900px]:w-[380px] min-[900px]:shrink-0">
          <Image src="/assets/v2/home/about-reception.png" alt="Sảnh đón NDTHICH" fill className="object-cover" unoptimized />
        </div>
        <div className="mt-6 min-[900px]:mt-0">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#880206]">Về Nguyễn Đắc Thích</p>
          <h2 className="mt-2 text-[20px] font-extrabold leading-snug text-[#0C0D0D] min-[900px]:text-[26px]">
            Kiến tạo không gian sống
            <br />
            <span className="text-[#880206]">&amp; kinh doanh bền vững</span>
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[#5F5D5D]">
            Với hơn 10 năm kinh nghiệm, chúng tôi cam kết mang đến những giá trị thực, pháp lý minh bạch
            và dịch vụ tận tâm cho khách hàng.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {ABOUT_FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-2.5">
                <Icon name={f.icon} size={20} className="mt-0.5 shrink-0 text-[#C08E47]" />
                <div>
                  <p className="text-[13px] font-bold text-[#0C0D0D]">{f.title}</p>
                  <p className="text-[11px] text-[#5F5D5D]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/gioi-thieu"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#880206] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#750F0D]"
          >
            Tìm hiểu thêm về chúng tôi <Icon name="arrow-right" size={14} className="invert" />
          </Link>
        </div>
      </section>
    </div>
  );
}
