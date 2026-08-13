import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { Gallery } from "@/components/public/Gallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { MapEmbed } from "@/components/public/MapEmbed";
import { StickyMobileActions } from "@/components/public/StickyMobileActions";
import { Icon, type IconName } from "@/components/icons";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { getPropertyBySlug, properties } from "@/lib/data/properties";
import type { PropertyListing } from "@/lib/types";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

// Facts row matches the approved renders' visual slots exactly (area/bedrooms/
// elevator/furnishing). Bedroom count and furnishing status have no backing
// field in data-source-map.json's public schema, so they render as "—"
// rather than being inferred from property_type or parsed from description —
// see .webby/implementation/IMPLEMENTATION_RECEIPT.json for the source-of-
// truth decision. This applies to both viewports: the desktop approved
// render (03_ChiTietChoThue_WEB.png) shows the same four slots.
function buildFacts(listing: PropertyListing): { icon: IconName; label: string; value: string }[] {
  return [
    { icon: "area", label: "Diện tích", value: formatArea(listing.area) },
    { icon: "bed", label: "Phòng ngủ", value: "—" },
    { icon: "building", label: "Thang máy", value: listing.verticalAccess },
    { icon: "check", label: "Nội thất", value: "—" },
  ];
}

function FactsGrid({ facts }: { facts: { icon: IconName; label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-md border border-line p-4">
          <Icon name={fact.icon} size={20} className="text-primary" />
          <p className="mt-2 text-h3 text-ink">{fact.value}</p>
          <p className="text-body text-muted">{fact.label}</p>
        </div>
      ))}
    </div>
  );
}

function ContactCard({ compact = false }: { compact?: boolean }) {
  const callButton = (
    <a
      href="tel:0986602203"
      className={`flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover ${compact ? "flex-1" : "w-full"}`}
    >
      <Icon name="phone" size={16} className="invert" /> {compact ? "Gọi ngay" : "Gọi 0986 602 203"}
    </a>
  );
  const zaloButton = (
    <a
      href="tel:0986602203"
      className={`flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft ${compact ? "flex-1" : "w-full"}`}
    >
      <Icon name="chat" size={16} /> Nhắn Zalo
    </a>
  );

  return (
    <div className="rounded-md border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h2 className="text-h3 text-ink">{compact ? "Liên hệ trực tiếp" : "Liên hệ NDTHICH"}</h2>
      <p className="mt-1 text-body text-muted">
        {compact ? "Hotline chính: 0986 602 203" : "Tư vấn trực tiếp, không qua form đặt lịch."}
      </p>
      {compact ? (
        <div className="mt-4 flex gap-3">
          {callButton}
          {zaloButton}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {callButton}
          {zaloButton}
        </div>
      )}
      {!compact && (
        <>
          <p className="mt-4 text-body text-muted">Hotline phụ</p>
          <p className="text-h3 text-ink">0985 551 396</p>
        </>
      )}
    </div>
  );
}

function CmsPlaceholderSection({ title }: { title: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-h2-mobile text-ink">{title}</h2>
      <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-md border border-line bg-soft p-6 text-center text-body text-muted">
        Nội dung dữ liệu/media theo CMS
      </div>
    </section>
  );
}

// Same visual container as CmsPlaceholderSection (heading + bordered box, same
// spacing) but bound to the authoritative listing.serviceFee value instead of
// a generic CMS placeholder — serviceFee is a real public field, not fabricated.
function ServiceFeeSection({ serviceFee }: { serviceFee: string }) {
  return (
    <section className="mt-10">
      <h2 className="text-h2-mobile text-ink">Phí dịch vụ</h2>
      <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-md border border-line bg-soft p-6 text-center">
        <p className="text-h3 text-ink">{serviceFee}</p>
      </div>
    </section>
  );
}

export default async function ChoThueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = getPropertyBySlug(slug);
  if (!listing) notFound();

  const related = properties.filter((p) => p.slug !== listing.slug).slice(0, 3);
  const title = listing.description.split(",")[0] || listing.roomNo;
  const facts = buildFacts(listing);

  return (
    <div className="container-page py-8 pb-28 desktop:pb-8">
      {/* Breadcrumb — mobile master uses a short generic trail, desktop uses the full path */}
      <div className="desktop:hidden">
        <Breadcrumb items={[{ label: "Cho thuê", href: "/cho-thue" }, { label: "Chi tiết BĐS" }]} />
      </div>
      <div className="hidden desktop:block">
        <Breadcrumb
          items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê", href: "/cho-thue" }, { label: title }]}
        />
      </div>

      <div className="mt-6">
        <Gallery images={listing.media} />
      </div>

      {/* Mobile composition — matches 03_ChiTietChoThue_MOBILE.png as its own section sequence */}
      <div className="desktop:hidden">
        <span className="mt-6 inline-block rounded-full bg-success px-3 py-1 text-label text-surface">
          {listing.availability}
        </span>
        <h1 className="mt-3 text-h1-mobile text-ink">{title}</h1>
        <p className="mt-2 text-body text-muted">
          {listing.location} • {listing.address}
        </p>
        <p className="mt-4 text-price text-primary">{formatCurrencyVnd(listing.price)}/tháng</p>

        <div className="mt-6">
          <FactsGrid facts={facts} />
        </div>

        <div className="mt-6">
          <ContactCard compact />
        </div>

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Mô tả chi tiết</h2>
          <p className="mt-4 text-body text-body">{listing.description}</p>
        </section>

        {listing.highlights.length > 0 && (
          <section className="mt-10">
            <h2 className="text-h2-mobile text-ink">Đặc điểm nổi bật</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {listing.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-body text-ink">
                  <Icon name="check" size={16} className="text-success" /> {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        <ServiceFeeSection serviceFee={listing.serviceFee} />
        <CmsPlaceholderSection title="Video / media" />

        <section className="mt-10">
          <h2 className="text-h2-mobile text-ink">Vị trí trên bản đồ</h2>
          <div className="mt-4">
            <MapEmbed address={listing.address} />
          </div>
        </section>
      </div>

      {/* Desktop composition — two-column layout with sticky contact aside */}
      <div className="hidden desktop:grid desktop:grid-cols-[1fr_320px] desktop:gap-8 desktop:mt-8">
        <div>
          <span className="rounded-full bg-success px-3 py-1 text-label text-surface">
            {listing.availability}
          </span>
          <h1 className="mt-3 text-h1 text-ink">{title}</h1>
          <p className="mt-2 text-body text-muted">
            {listing.location} • {listing.address}
          </p>
          <p className="mt-4 text-price text-primary">{formatCurrencyVnd(listing.price)}/tháng</p>

          <div className="mt-6">
            <FactsGrid facts={facts} />
          </div>

          <section className="mt-10">
            <h2 className="text-h2 text-ink">Mô tả chi tiết</h2>
            <div className="mt-4 rounded-md border border-line p-6 text-body text-body">
              <p>{listing.description}</p>
              {listing.highlights.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {listing.highlights.map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-h2 text-ink">Thông tin &amp; tiện ích</h2>
            <div className="mt-4 divide-y divide-line rounded-md border border-line">
              {[
                ["Loại BĐS", listing.propertyType],
                ["Diện tích", formatArea(listing.area)],
                ["Giá thuê", `${formatCurrencyVnd(listing.price)}/tháng`],
                ["Phí dịch vụ", listing.serviceFee],
                ["Thang", listing.verticalAccess],
                ["Tình trạng", listing.availability],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-6 py-3 text-body">
                  <span className="text-muted">{label}</span>
                  <span className="font-bold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-h2 text-ink">Media &amp; vị trí</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div className="aspect-[4/3] rounded-md bg-soft" />
              <MapEmbed address={listing.address} />
            </div>
          </section>
        </div>

        <aside className="desktop:sticky desktop:top-24 desktop:h-fit">
          <ContactCard />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-label text-primary">GỢI Ý</span>
              <h2 className="mt-2 text-h2-mobile text-ink desktop:text-h2">BĐS tương tự</h2>
            </div>
            <Link href="/cho-thue" className="text-label text-primary hover:underline">
              Xem thêm
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 tablet:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.slug} listing={p} />
            ))}
          </div>
        </section>
      )}

      <StickyMobileActions />
    </div>
  );
}
