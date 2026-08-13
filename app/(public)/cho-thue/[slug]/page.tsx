import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { Gallery } from "@/components/public/Gallery";
import { PropertyCard } from "@/components/public/PropertyCard";
import { MapEmbed } from "@/components/public/MapEmbed";
import { StickyMobileActions } from "@/components/public/StickyMobileActions";
import { Icon } from "@/components/icons";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { getPropertyBySlug, properties } from "@/lib/data/properties";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
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

  const facts = [
    { icon: "area" as const, label: "Diện tích", value: formatArea(listing.area) },
    { icon: "home" as const, label: "Loại BĐS", value: listing.propertyType },
    { icon: "building" as const, label: "Thang", value: listing.verticalAccess },
    { icon: "check" as const, label: "Tình trạng", value: listing.availability },
  ];

  return (
    <div className="container-page py-8 pb-28 desktop:pb-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Cho thuê", href: "/cho-thue" },
          { label: listing.description.split(",")[0] || listing.roomNo },
        ]}
      />

      <div className="mt-6">
        <Gallery images={listing.media} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 desktop:grid-cols-[1fr_320px]">
        <div>
          <span className="rounded-full bg-success px-3 py-1 text-label text-surface">
            {listing.availability}
          </span>
          <h1 className="mt-3 text-h1-mobile text-ink desktop:text-h1">
            {listing.description.split(",")[0] || listing.roomNo}
          </h1>
          <p className="mt-2 text-body text-muted">
            {listing.location} • {listing.address}
          </p>
          <p className="mt-4 text-price text-primary">{formatCurrencyVnd(listing.price)}/tháng</p>

          <div className="mt-6 grid grid-cols-2 gap-3 tablet:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md border border-line p-4">
                <Icon name={fact.icon} size={20} className="text-primary" />
                <p className="mt-2 text-h3 text-ink">{fact.value}</p>
                <p className="text-body text-muted">{fact.label}</p>
              </div>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-h2-mobile text-ink desktop:text-h2">Mô tả chi tiết</h2>
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
            <h2 className="text-h2-mobile text-ink desktop:text-h2">Thông tin &amp; tiện ích</h2>
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
            <h2 className="text-h2-mobile text-ink desktop:text-h2">Media &amp; vị trí</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div className="aspect-[4/3] rounded-md bg-soft" />
              <MapEmbed address={listing.address} />
            </div>
          </section>
        </div>

        <aside className="desktop:sticky desktop:top-24 desktop:h-fit">
          <div className="rounded-md border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <h2 className="text-h3 text-ink">Liên hệ NDTHICH</h2>
            <p className="mt-1 text-body text-muted">Tư vấn trực tiếp, không qua form đặt lịch.</p>
            <a
              href="tel:0986602203"
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="phone" size={16} className="invert" /> Gọi 0986 602 203
            </a>
            <a
              href="tel:0986602203"
              className="mt-3 flex items-center justify-center gap-2 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
            >
              <Icon name="chat" size={16} /> Nhắn Zalo
            </a>
            <p className="mt-4 text-body text-muted">Hotline phụ</p>
            <p className="text-h3 text-ink">0985 551 396</p>
          </div>
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
