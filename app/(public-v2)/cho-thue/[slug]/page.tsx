import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { PropertyCardGrid2 } from "@/components/public-v2/PropertyCardGrid2";
import { Icon, type IconName } from "@/components/icons";
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

function ActionButtons({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 ${compact ? "flex-col" : ""}`}>
      <a
        href="tel:0984602303"
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#880206] px-5 py-3 text-[13px] font-semibold text-white hover:bg-[#750F0D]"
      >
        <Icon name="phone" size={16} className="invert" /> Gọi ngay
      </a>
      <a
        href={getZaloHref()}
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0068FF] px-5 py-3 text-[13px] font-semibold text-white hover:bg-[#0056D6]"
      >
        <Icon name="chat" size={16} className="invert" /> Nhắn Zalo
      </a>
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-md border border-[#880206] px-5 py-3 text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6]"
      >
        <Icon name="calendar" size={16} /> Đặt lịch xem
      </button>
    </div>
  );
}

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

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10 min-[900px]:py-8">
      <Breadcrumb2
        withHomeIcon
        items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê", href: "/cho-thue" }, { label: title }]}
      />

      <div className="mt-5">
        <Gallery2 images={listing.media} />
      </div>

      <div className="mt-6 min-[900px]:grid min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start min-[900px]:gap-8">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px]">{title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[#5F5D5D]">
            <Icon name="pin" size={15} /> {listing.address}
          </p>
          <p className="mt-3 text-[24px] font-extrabold text-[#880206] min-[900px]:text-[26px]">
            {formatCurrencyVnd(listing.price)}
            <span className="text-[14px] font-medium text-[#5F5D5D]">/tháng</span>
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-lg border border-[#EDEBEA] p-3 text-center">
                <Icon name={fact.icon} size={22} className="mx-auto text-[#880206]" />
                <p className="mt-2 text-[15px] font-bold text-[#0C0D0D]">{fact.value}</p>
                <p className="text-[11px] text-[#5F5D5D]">{fact.label}</p>
              </div>
            ))}
          </div>

          {listing.highlights.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[16px] font-bold text-[#0C0D0D]">Thông tin nổi bật</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {listing.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-[13px] text-[#3A3838]">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-[#23825C]" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 min-[900px]:hidden">
            <ActionButtons />
          </div>

          <div className="mt-8 rounded-lg border border-[#EDEBEA]">
            <div className="divide-y divide-[#EDEBEA]">
              {[
                ["Loại BĐS", listing.propertyType],
                ["Diện tích", formatArea(listing.area)],
                ["Giá thuê", `${formatCurrencyVnd(listing.price)}/tháng`],
                ["Phí dịch vụ", listing.serviceFee],
                ["Thang", listing.verticalAccess],
                ["Tình trạng", listing.availability],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3 text-[13px]">
                  <span className="text-[#5F5D5D]">{label}</span>
                  <span className="font-bold text-[#0C0D0D]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Vị trí trên bản đồ</h2>
            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-lg">
              <Image src="/assets/v2/property-detail/map.png" alt={`Bản đồ ${listing.address}`} fill className="object-cover" unoptimized />
            </div>
          </div>
        </div>

        <aside className="mt-6 hidden min-[900px]:mt-0 min-[900px]:block">
          <div className="rounded-lg border border-[#EDEBEA] bg-white p-5">
            <h2 className="text-[16px] font-bold text-[#0C0D0D]">Liên hệ tư vấn</h2>
            <p className="mt-1 text-[13px] text-[#5F5D5D]">Tư vấn trực tiếp, không qua form đặt lịch.</p>
            <div className="mt-4">
              <ActionButtons compact />
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-[18px] font-extrabold text-[#0C0D0D] min-[900px]:text-[20px]">Bất động sản cùng khu vực</h2>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-5">
            {related.map((p) => (
              <PropertyCardGrid2 key={p.slug} listing={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
