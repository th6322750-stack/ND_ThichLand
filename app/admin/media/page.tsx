import { MediaGrid } from "@/components/admin/MediaGrid";

const PLACEHOLDERS = [
  "/assets/placeholders/property-placeholder.svg",
  "/assets/placeholders/project-placeholder.svg",
  "/assets/placeholders/news-placeholder.svg",
];

const items = Array.from({ length: 12 }, (_, i) => ({
  filename: `media-${String(i + 1).padStart(2, "0")}.jpg`,
  src: PLACEHOLDERS[i % PLACEHOLDERS.length],
  kind: "Ảnh" as const,
}));

export default function AdminMediaPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h1-mobile text-ink desktop:text-h1">Media Library</h2>
          <p className="mt-2 text-body text-muted">Quản lý ảnh/video cho BĐS, dự án và tin tức.</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Tải media
        </button>
      </div>

      <div className="mt-6">
        <MediaGrid items={items} />
      </div>
    </div>
  );
}
