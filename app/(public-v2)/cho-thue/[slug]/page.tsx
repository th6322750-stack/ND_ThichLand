import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { PropertyCardGrid2 } from "@/components/public-v2/PropertyCardGrid2";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { getZaloHref } from "@/lib/zalo";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties } from "@/lib/visualFixtureV2";
import type { PropertyListing } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildFacts(listing: PropertyListing): { icon: IconName; label: string; value: string }[] {
  return [
    { icon: "area", label: "Diện tích", value: formatArea(listing.area) },
    { icon: "bed", label: "Phòng ngủ", value: listing.bedroomCount !== null ? String(listing.bedroomCount) : "—" },
    { icon: "bath", label: "Phòng tắm", value: "—" },
    { icon: "check", label: "Nội thất", value: listing.furnishingStatus ?? "—" },
  ];
}

// Master shows only Gọi ngay + Nhắn Zalo on WEB; MOBILE additionally shows
// a third "Đặt lịch xem" action in the SAME row (visual-only, no new
// Leads/Viewing persistence backend — same as the pre-existing PHA2 note
// this codebase already documents elsewhere). This renders once, with the
// third button responsive (mobile-only) rather than being duplicated by a
// separate mobile-only action block elsewhere on the page.
function ActionButtons() {
  return (
    <div className="flex gap-2 min-[900px]:gap-3">
      <a
        href="tel:0984602303"
        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#880206] px-2 py-2 text-[10px] font-semibold leading-tight text-white hover:bg-[#750F0D] min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px]"
      >
        <Icon name="phone" size={12} className="shrink-0 text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Gọi ngay
      </a>
      <a
        href={getZaloHref()}
        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#0068FF] px-2 py-2 text-[10px] font-semibold leading-tight text-white hover:bg-[#0056D6] min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px]"
      >
        <Icon name="chat" size={12} className="shrink-0 text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Nhắn Zalo
      </a>
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#880206] px-2 py-2 text-[10px] font-semibold leading-tight text-[#880206] hover:bg-[#F7F6F6] min-[900px]:hidden"
      >
        <Icon name="calendar" size={12} className="shrink-0" /> Đặt lịch xem
      </button>
    </div>
  );
}

interface DetailTab {
  id: string;
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

export default async function ChoThueDetailPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let properties: PropertyListing[];
  if (isVisualFixtureV2Enabled()) {
    properties = getVisualFixtureProperties();
  } else {
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    properties = toPublicPropertyListings(merged.admin);
  }

  const listing = properties.find((p) => p.slug === slug);
  if (!listing) notFound();

  const related = properties.filter((p) => p.slug !== listing.slug).slice(0, 4);
  const title = listing.roomNo;
  const facts = buildFacts(listing);

  const detailRows: [string, string][] = [
    ["Loại BĐS", listing.propertyType],
    ["Diện tích", formatArea(listing.area)],
    ["Giá thuê", `${formatCurrencyVnd(listing.price)}/tháng`],
    ["Phí dịch vụ", listing.serviceFee],
    ["Thang", listing.verticalAccess],
    ["Tình trạng", listing.availability],
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-3 py-2 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2
        withHomeIcon
        items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê", href: "/cho-thue" }, { label: title }]}
      />

      {/* TOP: master keeps the gallery LEFT and title/price/facts/actions
          summary RIGHT as one compact band — a full-width gallery followed
          by info below (the old structure) is a FAIL. */}
      <div className="mt-2 min-[900px]:mt-5 min-[900px]:grid min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start min-[900px]:gap-8">
        <div data-qa-region="gallery">
          <Gallery2 images={listing.media} sideBySideOnMobile />
        </div>

        <div className="mt-2 min-[900px]:mt-0">
          <div data-qa-region="summary">
            <h1 className="text-[17px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px]">{title}</h1>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#5F5D5D] min-[900px]:mt-2 min-[900px]:gap-[6px] min-[900px]:text-[13px]">
              <Icon name="pin" size={12} className="min-[900px]:!h-[15px] min-[900px]:!w-[15px]" /> {listing.address}
            </p>
            <p className="mt-1 text-[18px] font-extrabold text-[#880206] min-[900px]:mt-3 min-[900px]:text-[26px]">
              {formatCurrencyVnd(listing.price)}
              <span className="text-[11px] font-medium text-[#5F5D5D] min-[900px]:text-[14px]">/tháng</span>
            </p>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-[6px] min-[900px]:mt-5 min-[900px]:gap-3" data-qa-region="facts">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0 rounded-lg border border-[#EDEBEA] p-[6px] text-center min-[900px]:p-3">
                <Icon name={fact.icon} size={16} className="mx-auto text-[#880206] min-[900px]:!h-[22px] min-[900px]:!w-[22px]" />
                <p className="mt-1 truncate text-[11px] font-bold text-[#0C0D0D] min-[900px]:mt-2 min-[900px]:text-[15px]">{fact.value}</p>
                <p className="truncate text-[8px] text-[#5F5D5D] min-[900px]:text-[11px]">{fact.label}</p>
              </div>
            ))}
          </div>

          {listing.highlights.length > 0 && (
            <div className="mt-2 rounded-lg border border-[#EDEBEA] p-2 min-[900px]:mt-6 min-[900px]:border-0 min-[900px]:p-0" data-qa-region="highlights">
              <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px]">Thông tin nổi bật</h2>
              <ul className="mt-1 flex flex-col gap-[6px] leading-tight min-[900px]:mt-3 min-[900px]:gap-2">
                {listing.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-1 text-[10px] text-[#3A3838] min-[900px]:gap-2 min-[900px]:text-[13px]">
                    <Icon name="check" size={11} className="mt-[2px] shrink-0 text-[#23825C] min-[900px]:!h-4 min-[900px]:!w-4" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 min-[900px]:mt-6" data-qa-region="actions">
            <ActionButtons />
          </div>
        </div>
      </div>

      {/* Tab strip — only "Thông tin chi tiết" has real backing content
          (the details table + map below); "Tiện ích"/"Vị trí"/"Video & Hình
          ảnh" are real, focusable, honest UI (no fabricated amenities/video
          data exists on a rental listing — only projects carry that). */}
      <TabbedDetails detailRows={detailRows} address={listing.address} />

      {related.length > 0 && (
        <section className="mt-4 min-[900px]:mt-12" data-qa-region="related">
          <div className="flex items-end justify-between">
            <h2 className="text-[13px] font-extrabold text-[#0C0D0D] min-[900px]:text-[20px]">Bất động sản cùng khu vực</h2>
          </div>
          {/* Mobile: horizontal scroll strip with the next card peeking at
              the edge (master), not a wrapped 2-col grid. */}
          <div className="mt-2 flex snap-x gap-2 overflow-x-auto min-[900px]:mt-5 min-[900px]:grid min-[900px]:grid-cols-4 min-[900px]:gap-5 min-[900px]:overflow-visible">
            {related.map((p) => (
              <div key={p.slug} className="w-[46%] shrink-0 snap-start min-[900px]:w-auto">
                <PropertyCardGrid2 listing={p} mobileAspect="4/3" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom consultation CTA before the footer, matching the master. */}
      <section
        className="mt-4 flex flex-col items-start justify-between gap-2 rounded-lg bg-[#880206] p-3 text-white min-[900px]:mt-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:p-8"
        data-qa-region="bottom-cta"
      >
        <div>
          <h2 className="text-[12px] font-bold min-[900px]:text-[19px]">Bạn cần tư vấn hoặc muốn xem nhà trực tiếp?</h2>
          <p className="mt-1 text-[10px] text-white/85 min-[900px]:text-[13px]">
            Liên hệ ngay để được hỗ trợ nhanh chóng và tận tâm!
          </p>
        </div>
        <div className="flex w-full gap-2 min-[900px]:w-auto min-[900px]:gap-3">
          <a
            href="tel:0984602303"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-[#880206] min-[900px]:flex-none min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px]"
          >
            <Icon name="phone" size={13} className="min-[900px]:!h-4 min-[900px]:!w-4" /> 0984 602 303
          </a>
          <a
            href={getZaloHref()}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0068FF] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#0056D6] min-[900px]:flex-none min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px]"
          >
            <Icon name="chat" size={13} className="text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Nhắn Zalo ngay
          </a>
        </div>
      </section>
    </div>
  );

  function TabbedDetails({ detailRows, address }: { detailRows: [string, string][]; address: string }) {
    return (
      <section className="mt-4 min-[900px]:mt-8" data-qa-region="detail-tabs">
        <div className="hidden border-b border-[#EDEBEA] min-[900px]:flex min-[900px]:gap-6">
          {DETAIL_TABS.map((tab, i) => (
            <span
              key={tab.id}
              className={`border-b-2 pb-3 text-[14px] font-semibold ${
                i === 0 ? "border-[#880206] text-[#880206]" : "border-transparent text-[#5F5D5D]"
              }`}
            >
              {tab.label}
            </span>
          ))}
        </div>

        <div className="mt-6 hidden min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-8">
          <div className="rounded-lg border border-[#EDEBEA]">
            <div className="divide-y divide-[#EDEBEA]">
              {detailRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3 text-[13px]">
                  <span className="text-[#5F5D5D]">{label}</span>
                  <span className="font-bold text-[#0C0D0D]">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Vị trí trên bản đồ</h2>
            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg">
              <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${address}`} fill className="object-cover" unoptimized />
            </div>
          </div>
        </div>

        {/* Mobile: compact accordion rows, matching the master — all rows
            start COLLAPSED (no `open` default; master shows the collapsed
            row treatment, not an expanded details table). */}
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
            <p className="border-t border-[#EDEBEA] px-2 pt-1 text-[10px] text-[#5F5D5D]">Thông tin đang được cập nhật.</p>
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
            <div className="relative mt-1 aspect-[16/9] overflow-hidden rounded-lg border-t border-[#EDEBEA]">
              <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${address}`} fill className="object-cover" unoptimized />
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
            <p className="border-t border-[#EDEBEA] px-2 pt-1 text-[10px] text-[#5F5D5D]">Thông tin đang được cập nhật.</p>
          </details>
        </div>
      </section>
    );
  }
}
