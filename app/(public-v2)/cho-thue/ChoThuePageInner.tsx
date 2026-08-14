"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
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
      {/* WEB hero — master keeps this as a single compact horizontal band
          (heading/text left, photo full-bleed right), not a separate text
          block plus a second boxed image band below it. Hidden entirely on
          mobile: 02_ChoThue_MOBILE.png has no hero photo or breadcrumb at
          all — just the title/Lọc/Sắp xếp/count block rendered below. */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-white via-[#FBF7F5] to-[#F2E5E6] min-[900px]:block">
        <div className="absolute inset-y-0 right-0 w-[42%]">
          <Image src="/assets/v2/properties/office-abc.png" alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-10 py-10">
          <div className="w-[55%]">
            <h1 className="text-[32px] font-extrabold leading-tight text-[#0C0D0D]">
              Cho thuê
              <br />
              <span className="text-[#880206]">Bất động sản</span>
            </h1>
            <p className="mt-2 max-w-md text-[14px] text-[#5F5D5D]">
              Tìm kiếm không gian sống và mặt bằng kinh doanh phù hợp với bạn
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10">
        <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê" }]} className="hidden min-[900px]:flex" />

        {/* Mobile title/controls block — replaces the WEB hero+breadcrumb entirely on mobile. */}
        <div className="min-[900px]:hidden">
          <h1 className="text-[18px] font-extrabold text-[#0C0D0D]">Cho thuê bất động sản</h1>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center gap-2 rounded-md border border-[#E4E1E0] px-4 py-3 text-[13px] font-semibold text-[#0C0D0D]"
            >
              <Icon name="filter" size={16} /> Lọc
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-md border border-[#E4E1E0] px-4 py-3 text-[13px] font-semibold text-[#0C0D0D]"
            >
              <Icon name="sort" size={16} /> Sắp xếp
            </button>
          </div>
        </div>
        <p className="mt-3 text-[14px] font-bold text-[#0C0D0D] min-[900px]:hidden">{filtered.length} kết quả</p>

        {/* Sidebar targets ~25% of the content column (master), not a fixed
            280px rail — 1fr/3fr keeps that ratio at any content width. */}
        <div className="mt-4 grid grid-cols-1 gap-8 min-[900px]:mt-6 min-[900px]:grid-cols-[1fr_3fr]">
          {/* Desktop sidebar */}
          <aside className="hidden min-[900px]:block">
            <div className="rounded-lg border border-[#EDEBEA] bg-white p-5">
              <Filter2
                value={filters}
                onChange={setFilters}
                onReset={reset}
                locationOptions={locationOptions}
                propertyTypeOptions={propertyTypeOptions}
              />
            </div>
          </aside>

          <div>
            <div className="hidden items-center justify-between min-[900px]:flex">
              <p className="text-[15px] text-[#0C0D0D]">
                Tìm thấy <span className="font-bold">{filtered.length}</span> bất động sản
              </p>
              <label className="flex items-center gap-2 text-[13px] text-[#5F5D5D]">
                Sắp xếp:
                <select className="rounded-md border border-[#E4E1E0] px-3 py-2 text-[13px] text-[#0C0D0D]" defaultValue="newest">
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
              <div className="mt-4 flex flex-col gap-4 min-[900px]:mt-0 min-[900px]:gap-5">
                {visible.map((listing) => (
                  <PropertyListRow2 key={listing.slug} listing={listing} />
                ))}
              </div>
            )}

            {/* Master's mobile viewport shows the fixed bottom tab bar
                instead of numbered pagination — desktop-style pagination
                is desktop-only. */}
            <div className="mt-8 hidden min-[900px]:block">
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
