import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Gallery2 } from "@/components/public-v2/Gallery2";
import { PropertyCardGrid2 } from "@/components/public-v2/PropertyCardGrid2";
import { PropertyDetailTabs2 } from "@/components/public-v2/PropertyDetailTabs2";
import { ViewingRequestButton } from "@/components/public-v2/ViewingRequestButton";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { getRentalProviders } from "@/lib/server/rental/providers";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListings } from "@/lib/server/rental/dto";
import { getZaloHref } from "@/lib/zalo";
import { splitHighlights } from "@/lib/highlights";
import { isVisualFixtureV2Enabled, getVisualFixtureProperties } from "@/lib/visualFixtureV2";
import type { PropertyListing } from "@/lib/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildNotFoundMetadata, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seoJsonLd";

export const dynamic = "force-dynamic";

// Round 8 asset map, section 3 "/cho-thue/[slug] Related properties":
// R8_05/07/08. Decorative filler ONLY for a listing that has no photo of its
// own — a listing WITH photos always shows its own (see the call site).
// Painting a stock skyline over a real rental's card misrepresents that
// specific property to a customer.
const RELATED_FALLBACK_IMAGES = [
  "/assets/round8-web/R8_05-quang-truong-hien-dai-duoi-thap-kinh.webp",
  "/assets/round8-web/R8_07-bo-song-do-thi-luc-hoang-hon.webp",
  "/assets/round8-web/R8_08-hoang-hon-ben-pho-ven-song.webp",
];

// React cache(): generateMetadata and the page body both need the listing.
// Without this the whole sheet read + overlay merge runs twice per request.
const loadProperties = cache(async (): Promise<PropertyListing[]> => {
  if (isVisualFixtureV2Enabled()) return getVisualFixtureProperties();
  const { source, overlay } = await getRentalProviders();
  const merged = await buildMergedRentalData(source, overlay);
  return toPublicPropertyListings(merged.admin);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = (await loadProperties()).find((p) => p.slug === slug);
  if (!listing) return buildNotFoundMetadata("Không tìm thấy bất động sản | NDTHICH LAND");
  const title = `Cho thuê ${listing.roomNo} tại ${listing.location} | NDTHICH LAND`;
  const description = listing.description ||
    `${listing.propertyType} ${formatArea(listing.area)} tại ${listing.location}, giá thuê ${formatCurrencyVnd(listing.price)}/tháng.`;
  return buildPageMetadata({
    title,
    description,
    path: `/cho-thue/${listing.slug}`,
    image: listing.media[0],
    imageAlt: `${listing.roomNo} tại ${listing.location}`,
  });
}

function buildFacts(listing: PropertyListing): { icon: IconName; label: string; value: string }[] {
  return [
    { icon: "area", label: "Diện tích", value: formatArea(listing.area) },
    { icon: "bed", label: "Phòng ngủ", value: listing.bedroomCount !== null ? String(listing.bedroomCount) : "—" },
    { icon: "bath", label: "Phòng tắm", value: listing.bathroomCount !== null ? String(listing.bathroomCount) : "—" },
    { icon: "check", label: "Nội thất", value: listing.furnishingStatus ?? "—" },
  ];
}

// Master shows only Gọi ngay + Nhắn Zalo on WEB; MOBILE additionally shows
// a third "Đặt lịch xem" action in the SAME row (visual-only, no new
// Leads/Viewing persistence backend — same as the pre-existing PHA2 note
// this codebase already documents elsewhere). This renders once, with the
// third button responsive (mobile-only) rather than being duplicated by a
// separate mobile-only action block elsewhere on the page.
function ActionButtons({ listingName }: { listingName: string }) {
  return (
    <div className="flex gap-2 min-[900px]:gap-3">
      <a
        href="tel:0986602203"
        className="btn-primary-gradient flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-[10px] font-semibold leading-tight text-white transition-transform duration-fast ease-base active:scale-[0.96] motion-reduce:active:scale-100 min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[48px] wide:rounded-[10px] wide:text-[15px]"
      >
        <Icon name="phone" size={12} className="shrink-0 text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Gọi ngay
      </a>
      <a
        href={getZaloHref()}
        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-gradient-to-r from-[#0068FF] to-[#0052CC] px-2 py-2 text-[10px] font-semibold leading-tight text-white shadow-[0_4px_14px_-2px_rgba(0,104,255,0.3)] transition-transform duration-fast ease-base hover:brightness-105 active:scale-[0.96] motion-reduce:active:scale-100 min-[900px]:gap-2 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[48px] wide:rounded-[10px] wide:text-[15px]"
      >
        <Icon name="chat" size={12} className="shrink-0 text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Nhắn Zalo
      </a>
      {/* Was an inert <button>; now opens a real request routed through the
          approved WEB_CONTACTS channel (see ViewingRequestButton). */}
      <ViewingRequestButton
        listingName={listingName}
        className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#880206] px-2 py-2 text-[10px] font-semibold leading-tight text-[#880206] transition-[background-color,transform] duration-fast ease-base hover:bg-[#F7F6F6] active:scale-[0.96] motion-reduce:active:scale-100 min-[900px]:hidden"
      />
    </div>
  );
}

export default async function ChoThueDetailPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const properties = await loadProperties();
  const listing = properties.find((p) => p.slug === slug);
  if (!listing) notFound();

  const related = properties.filter((p) => p.slug !== listing.slug).slice(0, 4);
  const title = listing.roomNo;
  const facts = buildFacts(listing);
  const highlightLines = splitHighlights(listing.highlights);

  const detailRows: [string, string][] = [
    ["Loại BĐS", listing.propertyType],
    ["Diện tích", formatArea(listing.area)],
    ["Giá thuê", `${formatCurrencyVnd(listing.price)}/tháng`],
    ["Phí dịch vụ", listing.serviceFee],
    ["Thang", listing.verticalAccess],
    ["Tình trạng", listing.availability],
  ];

  const seoDescription = listing.description ||
    `${listing.propertyType} ${formatArea(listing.area)} tại ${listing.location}, giá thuê ${formatCurrencyVnd(listing.price)}/tháng.`;

  return (
    <>
      <JsonLd
        id="rental-detail-jsonld"
        data={[
          webPageJsonLd({
            name: `Cho thuê ${listing.roomNo} tại ${listing.location}`,
            description: seoDescription,
            path: `/cho-thue/${listing.slug}`,
            image: listing.media[0],
          }),
          breadcrumbJsonLd([
            { name: "Trang chủ", path: "/" },
            { name: "Cho thuê", path: "/cho-thue" },
            { name: listing.roomNo, path: `/cho-thue/${listing.slug}` },
          ]),
        ]}
      />
      <div className="v2-container py-2 min-[900px]:py-8 wide:py-12">
      <Breadcrumb2
        withHomeIcon
        items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê", href: "/cho-thue" }, { label: title }]}
      />

      {/* TOP: master keeps the gallery LEFT and title/price/facts/actions
          summary RIGHT as one compact band — a full-width gallery followed
          by info below (the old structure) is a FAIL. */}
      <div className="mt-2 min-[900px]:mt-5 min-[900px]:grid min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start min-[900px]:gap-8 wide:grid-cols-[1fr_420px] wide:gap-10">
        <div data-qa-region="gallery">
          <Gallery2 images={listing.media} sideBySideOnMobile desktopAspect="3/2" />
        </div>

        <div className="mt-2 min-[900px]:mt-0">
          <div data-qa-region="summary">
            <h1 className="text-[17px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px] wide:text-[40px] wide:leading-[48px]">
              {title}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-[#5F5D5D] min-[900px]:mt-2 min-[900px]:gap-[6px] min-[900px]:text-[13px] wide:text-[15px]">
              <Icon name="pin" size={12} className="min-[900px]:!h-[15px] min-[900px]:!w-[15px]" /> {listing.address}
            </p>
            <p className="mt-1 text-[18px] font-extrabold text-[#880206] min-[900px]:mt-3 min-[900px]:text-[26px] wide:mt-4">
              {formatCurrencyVnd(listing.price)}
              <span className="text-[11px] font-medium text-[#5F5D5D] min-[900px]:text-[14px]">/tháng</span>
            </p>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-[6px] min-[900px]:mt-3 min-[900px]:gap-2 wide:mt-6 wide:gap-3" data-qa-region="facts">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="min-w-0 rounded-lg border border-[#EDEBEA] p-[6px] text-center min-[900px]:p-2 wide:rounded-[12px] wide:p-3"
              >
                <Icon name={fact.icon} size={16} className="mx-auto text-[#880206] min-[900px]:!h-[22px] min-[900px]:!w-[22px]" />
                <p className="mt-1 truncate text-[11px] font-bold text-[#0C0D0D] min-[900px]:mt-2 min-[900px]:text-[15px] wide:text-[17px]">
                  {fact.value}
                </p>
                <p className="truncate text-[8px] text-[#5F5D5D] min-[900px]:text-[11px] wide:text-[13px]">{fact.label}</p>
              </div>
            ))}
          </div>

          {highlightLines.length > 0 && (
            <div
              className="mt-2 rounded-lg border border-[#EDEBEA] p-2 min-[900px]:mt-3 min-[900px]:border-0 min-[900px]:p-0 wide:mt-6"
              data-qa-region="highlights"
            >
              <h2 className="text-[12px] font-bold text-[#0C0D0D] min-[900px]:text-[16px] wide:text-[18px]">Thông tin nổi bật</h2>
              <ul className="mt-1 flex flex-col gap-[6px] leading-tight min-[900px]:mt-3 min-[900px]:gap-2 wide:gap-3">
                {highlightLines.map((h, index) => (
                  <li
                    key={`${index}-${h}`}
                    className="flex items-start gap-1 text-[10px] text-[#3A3838] min-[900px]:gap-2 min-[900px]:text-[13px] wide:text-[16px] wide:leading-[26px]"
                  >
                    <Icon name="check" size={11} className="mt-[2px] shrink-0 text-[#23825C] min-[900px]:!h-4 min-[900px]:!w-4" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 min-[900px]:mt-3 wide:mt-6" data-qa-region="actions">
            <ActionButtons listingName={title} />
          </div>
        </div>
      </div>

      <PropertyDetailTabs2
        detailRows={detailRows}
        address={listing.address}
        amenities={listing.amenities}
        locationNote={listing.locationNote}
        videoUrl={listing.videoUrl}
        media={listing.media}
      />

      {related.length > 0 && (
        <section className="v2-reveal mt-4 min-[900px]:mt-12" data-qa-region="related">
          <div className="flex items-end justify-between">
            <h2 className="text-[13px] font-extrabold text-[#0C0D0D] min-[900px]:text-[20px] wide:text-v2-h2">
              Bất động sản cùng khu vực
            </h2>
          </div>
          {/* Mobile: horizontal scroll strip with the next card peeking at
              the edge (master), not a wrapped 2-col grid. */}
          <div className="mt-2 flex snap-x gap-2 overflow-x-auto min-[900px]:mt-5 min-[900px]:grid min-[900px]:grid-cols-4 min-[900px]:gap-5 min-[900px]:overflow-visible wide:mt-6 wide:gap-6">
            {related.map((p, i) => (
              <div key={p.slug} className="w-[46%] shrink-0 snap-start min-[900px]:w-auto">
                <PropertyCardGrid2
                  listing={p}
                  mobileAspect="4/3"
                  imageOverride={
                    p.media.length > 0 ? undefined : RELATED_FALLBACK_IMAGES[i % RELATED_FALLBACK_IMAGES.length]
                  }
                  wideAspect="16/10"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom consultation CTA before the footer, matching the master. */}
      <section
        className="v2-reveal mt-4 flex flex-col items-start justify-between gap-2 rounded-lg bg-[#880206] p-3 text-white min-[900px]:mt-12 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:p-8 wide:rounded-[16px] wide:p-10"
        data-qa-region="bottom-cta"
      >
        <div>
          <h2 className="text-[12px] font-bold min-[900px]:text-[19px] wide:text-[22px]">
            Bạn cần tư vấn hoặc muốn xem nhà trực tiếp?
          </h2>
          <p className="mt-1 text-[10px] text-white/85 min-[900px]:text-[13px] wide:text-[16px]">
            Liên hệ ngay để được hỗ trợ nhanh chóng và tận tâm!
          </p>
        </div>
        <div className="flex w-full gap-2 min-[900px]:w-auto min-[900px]:gap-3">
          <a
            href="tel:0986602203"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-[#880206] min-[900px]:flex-none min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
          >
            <Icon name="phone" size={13} className="min-[900px]:!h-4 min-[900px]:!w-4" /> 0986 602 203
          </a>
          <a
            href={getZaloHref()}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#0068FF] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#0056D6] min-[900px]:flex-none min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[52px] wide:rounded-[10px] wide:px-6 wide:text-[15px]"
          >
            <Icon name="chat" size={13} className="text-white min-[900px]:!h-4 min-[900px]:!w-4" /> Nhắn Zalo ngay
          </a>
        </div>
      </section>
      </div>
    </>
  );
}
