"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";

interface DetailTab {
  id: "info" | "amenities" | "location" | "media";
  label: string;
  desc: string;
  icon: IconName;
}

const DETAIL_TABS: DetailTab[] = [
  { id: "info", label: "Thông tin chi tiết", desc: "Thông tin mô tả, pháp lý, chi phí liên quan", icon: "edit" },
  { id: "amenities", label: "Tiện ích", desc: "Tiện ích nội khu và ngoại khu nổi bật", icon: "building" },
  { id: "location", label: "Vị trí", desc: "Vị trí trên bản đồ, kết nối và xung quanh", icon: "pin" },
  { id: "media", label: "Video & Hình ảnh", desc: "Video thực tế và bộ sưu tập hình ảnh", icon: "youtube" },
];

// Renders an iframe only for a recognized YouTube link (watch?v=, youtu.be/,
// already-an-embed url) — any other host falls back to a plain "Xem video"
// link in the caller rather than guessing an embed URL that might not work.
function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.endsWith("youtube.com")) {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.pathname.startsWith("/embed/")) return url;
    }
    return null;
  } catch {
    return null;
  }
}

function AmenitiesList({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) {
    return <p className="text-[11px] text-[#5F5D5D] min-[900px]:text-[13px]">Thông tin đang được cập nhật.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-2 min-[900px]:grid-cols-2 min-[900px]:gap-3">
      {amenities.map((a) => (
        <li
          key={a}
          className="flex items-center gap-2 rounded-lg border border-[#EDEBEA] px-3 py-2 text-[11px] text-[#3A3838] min-[900px]:text-[13px]"
        >
          <Icon name="check" size={14} className="shrink-0 text-[#23825C]" /> {a}
        </li>
      ))}
    </ul>
  );
}

function LocationPanel({ address, locationNote }: { address: string; locationNote: string | null }) {
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg wide:rounded-[14px]">
        <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${address}`} fill className="object-cover" unoptimized />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#3A3838] min-[900px]:text-[13px]">
        {locationNote ?? "Thông tin kết nối khu vực đang được cập nhật."}
      </p>
    </div>
  );
}

function MediaPanel({ videoUrl, media }: { videoUrl: string | null; media: string[] }) {
  const embedUrl = videoUrl ? toYoutubeEmbedUrl(videoUrl) : null;
  return (
    <div className="flex flex-col gap-4">
      {videoUrl ? (
        embedUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-lg wide:rounded-[14px]">
            <iframe
              src={embedUrl}
              title="Video thực tế"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        ) : (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-md bg-[#880206] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#750F0D]"
          >
            <Icon name="youtube" size={14} className="text-white" /> Xem video
          </a>
        )
      ) : (
        <p className="text-[11px] text-[#5F5D5D] min-[900px]:text-[13px]">Chưa có video — dưới đây là bộ sưu tập hình ảnh.</p>
      )}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2 min-[900px]:grid-cols-4 min-[900px]:gap-3">
          {media.map((src, i) => (
            <div key={src + i} className="relative aspect-[4/3] overflow-hidden rounded-md">
              <Image src={src} alt={`Ảnh ${i + 1}`} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PropertyDetailTabs2({
  detailRows,
  address,
  amenities,
  locationNote,
  videoUrl,
  media,
}: {
  detailRows: [string, string][];
  address: string;
  amenities: string[];
  locationNote: string | null;
  videoUrl: string | null;
  media: string[];
}) {
  const [activeTab, setActiveTab] = useState<DetailTab["id"]>("info");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function activate(index: number) {
    setActiveTab(DETAIL_TABS[index].id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      activate((index + 1) % DETAIL_TABS.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      activate((index - 1 + DETAIL_TABS.length) % DETAIL_TABS.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      activate(0);
    } else if (e.key === "End") {
      e.preventDefault();
      activate(DETAIL_TABS.length - 1);
    }
  }

  return (
    <section className="mt-4 min-[900px]:mt-8" data-qa-region="detail-tabs">
      <div
        className="hidden border-b border-[#EDEBEA] min-[900px]:flex min-[900px]:gap-6 wide:gap-8"
        role="tablist"
        aria-label="Chi tiết bất động sản"
      >
        {DETAIL_TABS.map((tab, index) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`property-detail-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="property-detail-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`border-b-2 pb-3 text-[14px] font-semibold wide:text-[16px] ${
                selected ? "border-[#880206] text-[#880206]" : "border-transparent text-[#5F5D5D] hover:text-[#0C0D0D]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="mt-6 hidden min-[900px]:block"
        role="tabpanel"
        id="property-detail-tabpanel"
        aria-labelledby={`property-detail-tab-${activeTab}`}
      >
        {activeTab === "info" && (
          <div className="grid min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-8 wide:gap-10">
            <div className="rounded-lg border border-[#EDEBEA] wide:rounded-[14px]">
              <div className="divide-y divide-[#EDEBEA]">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-5 py-5 text-[13px] wide:px-6 wide:text-[16px]">
                    <span className="text-[#5F5D5D]">{label}</span>
                    <span className="font-bold text-[#0C0D0D]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-[18px]">Vị trí trên bản đồ</h2>
              <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg wide:rounded-[14px]">
                <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${address}`} fill className="object-cover" unoptimized />
              </div>
            </div>
          </div>
        )}
        {activeTab === "amenities" && <AmenitiesList amenities={amenities} />}
        {activeTab === "location" && <LocationPanel address={address} locationNote={locationNote} />}
        {activeTab === "media" && <MediaPanel videoUrl={videoUrl} media={media} />}
      </div>

      {/* Mobile: compact accordion rows, matching the master — all rows
          start COLLAPSED (no `open` default; master shows the collapsed
          row treatment, not an expanded details table). Each row is
          independently expandable (no shared active-tab state needed). */}
      <div className="flex flex-col gap-1 min-[900px]:hidden">
        <details className="group rounded-lg border border-[#EDEBEA] open:pb-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-[6px] leading-tight">
            <Icon name="edit" size={16} className="shrink-0 text-[#0068FF]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-[#0C0D0D]">Thông tin chi tiết</span>
              <span className="block text-[9px] text-[#5F5D5D]">Thông tin mô tả, pháp lý, chi phí liên quan</span>
            </span>
            <Icon name="chevron-right" size={13} className="shrink-0 rotate-90 text-[#5F5D5D] group-open:-rotate-90" />
          </summary>
          <div className="border-t border-[#EDEBEA] px-2 pt-1">
            <div className="divide-y divide-[#EDEBEA]">
              {detailRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-1 text-[10px]">
                  <span className="text-[#5F5D5D]">{label}</span>
                  <span className="font-bold text-[#0C0D0D]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </details>

        <details className="group rounded-lg border border-[#EDEBEA] open:pb-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-[6px] leading-tight">
            <Icon name="building" size={16} className="shrink-0 text-[#C08E47]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-[#0C0D0D]">Tiện ích</span>
              <span className="block text-[9px] text-[#5F5D5D]">Tiện ích nội khu và ngoại khu nổi bật</span>
            </span>
            <Icon name="chevron-right" size={13} className="shrink-0 rotate-90 text-[#5F5D5D] group-open:-rotate-90" />
          </summary>
          <div className="border-t border-[#EDEBEA] px-2 pt-1">
            <AmenitiesList amenities={amenities} />
          </div>
        </details>

        <details className="group rounded-lg border border-[#EDEBEA] open:pb-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-[6px] leading-tight">
            <Icon name="pin" size={16} className="shrink-0 text-[#23825C]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-[#0C0D0D]">Vị trí</span>
              <span className="block text-[9px] text-[#5F5D5D]">Vị trí trên bản đồ, kết nối và xung quanh</span>
            </span>
            <Icon name="chevron-right" size={13} className="shrink-0 rotate-90 text-[#5F5D5D] group-open:-rotate-90" />
          </summary>
          <div className="border-t border-[#EDEBEA] px-2 pt-1">
            <LocationPanel address={address} locationNote={locationNote} />
          </div>
        </details>

        <details className="group rounded-lg border border-[#EDEBEA] open:pb-1">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-[6px] leading-tight">
            <Icon name="youtube" size={16} className="shrink-0 text-[#880206]" />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-[#0C0D0D]">Video &amp; Hình ảnh</span>
              <span className="block text-[9px] text-[#5F5D5D]">Video thực tế và bộ sưu tập hình ảnh</span>
            </span>
            <Icon name="chevron-right" size={13} className="shrink-0 rotate-90 text-[#5F5D5D] group-open:-rotate-90" />
          </summary>
          <div className="border-t border-[#EDEBEA] px-2 pt-1">
            <MediaPanel videoUrl={videoUrl} media={media} />
          </div>
        </details>
      </div>
    </section>
  );
}
