"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Icon } from "@/components/icons";
import { projects } from "@/lib/data/projects";
import type { ProjectStatus } from "@/lib/types";

type TabValue = "all" | ProjectStatus;

const TABS: { value: TabValue; id: string; label: string }[] = [
  { value: "all", id: "all", label: "Tất cả" },
  { value: "Đang triển khai", id: "in-progress", label: "Đang triển khai" },
  { value: "Đã hoàn thành", id: "done", label: "Đã hoàn thành" },
];

export default function DuAnPage() {
  const [tab, setTab] = useState<TabValue>("all");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = useMemo(
    () => (tab === "all" ? projects : projects.filter((p) => p.status === tab)),
    [tab],
  );

  function activate(index: number) {
    const target = TABS[index];
    setTab(target.value);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        activate((index + 1) % TABS.length);
        break;
      case "ArrowLeft":
        e.preventDefault();
        activate((index - 1 + TABS.length) % TABS.length);
        break;
      case "Home":
        e.preventDefault();
        activate(0);
        break;
      case "End":
        e.preventDefault();
        activate(TABS.length - 1);
        break;
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-h1-mobile text-ink desktop:text-h1">Dự án của NDTHICH</h1>
      <p className="mt-2 text-body text-muted">Module thương hiệu riêng cho dự án công ty.</p>

      <div className="mt-8 flex flex-wrap gap-3" role="tablist" aria-label="Lọc dự án theo trạng thái">
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
              className={`rounded-md border px-5 py-3 text-button uppercase ${
                selected
                  ? "border-primary bg-primary text-surface"
                  : "border-line text-ink hover:border-primary"
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
        className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {visible.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-md bg-soft p-8 desktop:flex-row desktop:items-center">
        <div>
          <h2 className="text-h2-mobile text-ink desktop:text-h2">
            Dự án là bằng chứng năng lực thương hiệu
          </h2>
          <p className="mt-2 text-body text-body">
            Mỗi dự án có vị trí, chủ đầu tư, tiện ích, tiến độ, album và CTA liên hệ.
            <br />
            Nội dung có thể cập nhật từ CMS mà không làm thay đổi thiết kế.
          </p>
        </div>
        <a
          href="tel:0986602203"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          <Icon name="phone" size={16} className="invert" /> Liên hệ tư vấn
        </a>
      </div>
    </div>
  );
}
