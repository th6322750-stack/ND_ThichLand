"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Icon } from "@/components/icons";
import { projects } from "@/lib/data/projects";
import type { ProjectStatus } from "@/lib/types";

type TabValue = "all" | ProjectStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "Đang triển khai", label: "Đang triển khai" },
  { value: "Đã hoàn thành", label: "Đã hoàn thành" },
];

export default function DuAnPage() {
  const [tab, setTab] = useState<TabValue>("all");

  const visible = useMemo(
    () => (tab === "all" ? projects : projects.filter((p) => p.status === tab)),
    [tab],
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-h1-mobile text-ink desktop:text-h1">Dự án của NDTHICH</h1>
      <p className="mt-2 text-body text-muted">Module thương hiệu riêng cho dự án công ty.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            aria-pressed={tab === t.value}
            className={`rounded-md border px-5 py-3 text-button uppercase ${
              tab === t.value
                ? "border-primary bg-primary text-surface"
                : "border-line text-ink hover:border-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
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
