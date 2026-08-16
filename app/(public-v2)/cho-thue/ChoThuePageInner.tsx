"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Filter2 } from "@/components/public-v2/Filter2";
import { FilterDrawer2 } from "@/components/public-v2/FilterDrawer2";
import { PropertyListRow2 } from "@/components/public-v2/PropertyListRow2";
import { Pagination2 } from "@/components/public-v2/Pagination2";
import { MobileBottomNav2 } from "@/components/public-v2/MobileBottomNav2";
import { EmptySearchResults } from "@/components/public/EmptySearchResults";
import { useRentalFilters } from "@/lib/useRentalFilters";
import { filterProperties, getLocationOptions, getPropertyTypeOptions } from "@/lib/rentalFilters";
import type { PropertyListing } from "@/lib/types";

const PAGE_SIZE = 6;

export function ChoThuePageInner({ properties }: { properties: PropertyListing[] }) {
  const { filters, page, setFilters, setPage, reset } = useRentalFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const locationOptions = useMemo(() => getLocationOptions(properties), [properties]);
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(properties), [properties]);
  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(() => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filtered, safePage]);
  const isEmpty = filtered.length === 0;

  return (
    <>
      {/* HERO_PACK_PREMIUM_V1: same 4K master shared by mobile AND desktop
          (was WEB-only before, with a different 42%-wide asset) — crop per
          NDTHICH_HERO_PACK_PREMIUM_V1/HERO_ASSET_MANIFEST.json (mobile 76%
          50%, desktop 50% 50%). Full-bleed at every width, same pattern as
          Home's hero. */}
      <section className="relative overflow-hidden bg-[#F7F6F6]" data-qa-region="hero">
        <div className="relative h-[240px] min-[900px]:h-[430px] wide:h-[460px]">
          {/* Mobile crop — manifest objectPosition "76% 50%". */}
          <div className="absolute inset-0 min-[900px]:hidden">
            <Image
              src="/assets/v2/hero/NDTHICH_RENTAL_HERO_PREMIUM_4K.png"
              alt="NDTHICH — cho thuê bất động sản"
              fill
              className="object-cover"
              style={{ objectPosition: "76% 50%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          {/* Desktop/wide crop — same asset, manifest objectPosition "50% 50%". */}
          <div className="absolute inset-0 hidden min-[900px]:block">
            <Image
              src="/assets/v2/hero/NDTHICH_RENTAL_HERO_PREMIUM_4K.png"
              alt="NDTHICH — cho thuê bất động sản"
              fill
              className="object-cover"
              style={{ objectPosition: "50% 50%" }}
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          <div
            className="absolute inset-0 min-[900px]:hidden"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.93) 45%, rgba(255,255,255,.55) 68%, rgba(255,255,255,0) 88%)",
            }}
          />
          <div
            className="absolute inset-0 hidden min-[900px]:block"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,.97) 0%, rgba(255,255,255,.9) 32%, rgba(255,255,255,.6) 48%, rgba(255,255,255,.2) 62%, rgba(255,255,255,0) 74%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 min-[900px]:hidden">
            <h1 className="text-[22px] font-extrabold leading-[1.15] text-[#0C0D0D]">
              Cho thuê
              <br />
              <span className="text-[#880206]">Bất động sản</span>
            </h1>
            <p className="mt-1 max-w-[220px] text-[13px] leading-snug text-[#5F5D5D]">
              Tìm kiếm không gian sống và mặt bằng kinh doanh phù hợp với bạn
            </p>
          </div>
        </div>

        <div className="v2-container absolute inset-0 hidden min-[900px]:flex min-[900px]:items-center">
          <div className="w-[55%] wide:max-w-[620px]">
            <h1 className="text-[32px] font-extrabold leading-tight text-[#0C0D0D] wide:text-v2-h1">
              Cho thuê
              <br />
              <span className="text-[#880206]">Bất động sản</span>
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-[#5F5D5D] wide:text-[17px] wide:leading-[28px]">
              Tìm kiếm không gian sống và mặt bằng kinh doanh phù hợp với bạn
            </p>
          </div>
        </div>
      </section>

      <div className="v2-container py-3 min-[900px]:py-6 wide:py-10">
        <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê" }]} className="hidden min-[900px]:flex" />

        {/* Mobile title/controls block — the hero above now owns the page's
            h1, so this is a secondary heading (h2), not a duplicate h1. */}
        <div className="min-[900px]:hidden" data-qa-region="heading">
          <h2 className="text-[16px] font-extrabold text-[#0C0D0D]">Cho thuê bất động sản</h2>
          <div className="mt-2 grid grid-cols-2 gap-2" data-qa-region="filter-sort">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center gap-2 rounded-md border border-[#E4E1E0] px-4 py-2 text-[12px] font-semibold text-[#0C0D0D]"
            >
              <Icon name="filter" size={14} /> Lọc
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md border border-[#E4E1E0] px-4 py-2 text-[12px] font-semibold text-[#0C0D0D]"
            >
              <Icon name="sort" size={14} /> Sắp xếp
            </button>
          </div>
        </div>
        <p className="mt-2 text-[12px] font-bold text-[#0C0D0D] min-[900px]:hidden">{filtered.length} kết quả</p>

        {/* Sidebar targets ~25% of the content column (master), not a fixed
            280px rail — 1fr/3fr keeps that ratio at any content width. */}
        <div className="mt-2 grid grid-cols-1 gap-8 min-[900px]:mt-6 min-[900px]:grid-cols-[260px_1fr] wide:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden min-[900px]:block" data-qa-region="sidebar">
            <div className="rounded-lg border border-[#EDEBEA] bg-white p-5 wide:rounded-[16px] wide:p-6">
              <Filter2
                value={filters}
                onChange={setFilters}
                onReset={reset}
                locationOptions={locationOptions}
                propertyTypeOptions={propertyTypeOptions}
              />
            </div>
          </aside>

          <div data-qa-region="list">
            <div className="hidden items-center justify-between min-[900px]:flex">
              <p className="text-[15px] text-[#0C0D0D] wide:text-[17px]">
                Tìm thấy <span className="font-bold">{filtered.length}</span> bất động sản
              </p>
              <label className="flex items-center gap-2 text-[13px] text-[#5F5D5D] wide:text-[14px]">
                Sắp xếp:
                <select
                  className="rounded-md border border-[#E4E1E0] px-3 py-2 text-[13px] text-[#0C0D0D] wide:h-[48px] wide:px-4 wide:text-[14px]"
                  defaultValue="newest"
                >
                  <option value="newest">Mới nhất</option>
                </select>
              </label>
            </div>

            {isEmpty ? (
              <div className="mt-6">
                <EmptySearchResults
                  title="Không tìm thấy căn phù hợp?"
                  message="Thử mở rộng khoảng giá hoặc khu vực."
                  resetLabel="Đặt lại bộ lọc"
                  onReset={reset}
                />
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2 min-[900px]:mt-0 min-[900px]:gap-5">
                {visible.map((listing) => (
                  <PropertyListRow2 key={listing.slug} listing={listing} />
                ))}
              </div>
            )}

            {/* Master's mobile viewport shows the fixed bottom tab bar
                instead of numbered pagination — desktop-style pagination
                is desktop-only. */}
            <div className="mt-8 hidden min-[900px]:block" data-qa-region="pagination">
              <Pagination2 page={safePage} total={totalPages} onChange={setPage} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding on mobile clears the fixed bottom nav bar. */}
      <div className="h-[56px] min-[900px]:hidden" aria-hidden="true" />
      <MobileBottomNav2 />

      <FilterDrawer2
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        committedFilters={filters}
        onApply={setFilters}
        locationOptions={locationOptions}
        propertyTypeOptions={propertyTypeOptions}
      />
    </>
  );
}
