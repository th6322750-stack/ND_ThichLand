"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { Breadcrumb2 } from "@/components/public-v2/Breadcrumb2";
import { Filter2 } from "@/components/public-v2/Filter2";
import { FilterDrawer2 } from "@/components/public-v2/FilterDrawer2";
import { PropertyListRow2 } from "@/components/public-v2/PropertyListRow2";
import { Pagination2 } from "@/components/public-v2/Pagination2";
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBF7F5] to-[#F2E5E6]">
        <div className="mx-auto max-w-[1240px] px-4 py-8 min-[900px]:px-10 min-[900px]:py-10">
          <h1 className="text-[26px] font-extrabold leading-tight text-[#0C0D0D] min-[900px]:text-[32px]">
            Cho thuê
            <br />
            <span className="text-[#880206]">Bất động sản</span>
          </h1>
          <p className="mt-2 max-w-md text-[13px] text-[#5F5D5D] min-[900px]:text-[14px]">
            Tìm kiếm không gian sống và mặt bằng kinh doanh phù hợp với bạn
          </p>
        </div>
        <div className="relative mx-auto hidden h-[160px] max-w-[1240px] px-10 min-[900px]:block">
          <div className="absolute right-10 top-1/2 h-[130px] w-[45%] -translate-y-1/2 overflow-hidden rounded-lg">
            <Image src="/assets/v2/properties/office-abc.png" alt="" fill className="object-cover" unoptimized />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-4 py-6 min-[900px]:px-10">
        <Breadcrumb2 items={[{ label: "Trang chủ", href: "/" }, { label: "Cho thuê" }]} />

        {/* Mobile controls */}
        <div className="mt-4 grid grid-cols-2 gap-3 min-[900px]:hidden">
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
        <p className="mt-3 text-[14px] font-bold text-[#0C0D0D] min-[900px]:hidden">{filtered.length} kết quả</p>

        <div className="mt-4 grid grid-cols-1 gap-8 min-[900px]:mt-6 min-[900px]:grid-cols-[280px_1fr]">
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

            <div className="mt-8">
              <Pagination2 page={safePage} total={totalPages} onChange={setPage} />
            </div>
          </div>
        </div>
      </div>

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
