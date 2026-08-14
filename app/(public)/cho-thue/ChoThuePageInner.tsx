"use client";

import { useMemo, useState } from "react";
import { Filter } from "@/components/public/Filter";
import { FilterDrawer } from "@/components/public/FilterDrawer";
import { PropertyCard } from "@/components/public/PropertyCard";
import { EmptySearchResults } from "@/components/public/EmptySearchResults";
import { Pagination } from "@/components/public/Pagination";
import { Icon } from "@/components/icons";
import { useRentalFilters } from "@/lib/useRentalFilters";
import { filterProperties, getLocationOptions, getPropertyTypeOptions } from "@/lib/rentalFilters";
import type { PropertyListing } from "@/lib/types";

const PAGE_SIZE = 9;

export function ChoThuePageInner({ properties }: { properties: PropertyListing[] }) {
  const { filters, page, setFilters, setPage, reset } = useRentalFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const locationOptions = useMemo(() => getLocationOptions(properties), [properties]);
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(properties), [properties]);
  const filtered = useMemo(() => filterProperties(properties, filters), [properties, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );
  const isEmpty = filtered.length === 0;

  const resultPills = (
    <>
      <span className="rounded-full bg-soft px-3 py-1 text-label text-success">Giá công khai</span>
      <span className="rounded-full bg-soft px-3 py-1 text-label text-gold">Diện tích công khai</span>
    </>
  );

  return (
    <>
      <div className="container-page py-10">
        <h1 className="text-h1-mobile text-ink desktop:text-h1">Cho thuê bất động sản</h1>

        {/* Mobile composition — matches 02_ChoThue_MOBILE.png */}
        <div className="desktop:hidden">
          <p className="mt-2 text-body text-muted">Tìm theo khu vực, giá, loại và diện tích.</p>

          <div className="mt-6 flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
            <Icon name="search" size={18} className="text-muted" />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              placeholder="Tìm theo địa chỉ, khu vực..."
              aria-label="Tìm theo địa chỉ, khu vực"
              className="w-full text-body text-ink outline-none placeholder:text-muted"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-6 py-3 text-button uppercase text-ink"
            >
              <Icon name="filter" size={16} /> Bộ lọc
            </button>
            <button
              type="button"
              aria-pressed="true"
              title="Thứ tự mặc định theo dữ liệu nguồn"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-6 py-3 text-button uppercase text-ink"
            >
              Mới nhất
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink px-3 py-1 text-label text-surface">
              {filtered.length} kết quả
            </span>
            {resultPills}
          </div>

          {isEmpty ? (
            <div className="mt-6">
              <EmptySearchResults
                title="Không tìm thấy căn phù hợp?"
                message="Thử mở rộng khoảng giá hoặc khu vực. Không tự hiển thị dữ liệu nội bộ."
                resetLabel="Đặt lại bộ lọc"
                onReset={reset}
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6">
              {visible.map((listing) => (
                <PropertyCard key={listing.slug} listing={listing} />
              ))}
            </div>
          )}

          <div className="mt-10">
            <Pagination page={safePage} total={totalPages} onChange={setPage} />
          </div>
        </div>

        {/* Desktop composition */}
        <div className="hidden desktop:block">
          <p className="mt-2 text-body text-muted">
            Nguồn phòng/căn/mặt bằng được chuẩn hóa từ dữ liệu vận hành thực tế.
          </p>

          <div className="mt-8 flex flex-row gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-md border border-line bg-surface px-4 py-3">
              <Icon name="search" size={18} className="text-muted" />
              <input
                type="search"
                value={filters.q}
                onChange={(e) => setFilters({ q: e.target.value })}
                placeholder="Tìm theo địa chỉ, khu vực hoặc mã phòng..."
                aria-label="Tìm theo địa chỉ, khu vực hoặc mã phòng"
                className="w-full text-body text-ink outline-none placeholder:text-muted"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              <Icon name="search" size={16} className="invert" /> Tìm kiếm
            </button>
          </div>

          <div className="mt-8 grid grid-cols-[280px_1fr] gap-8">
            <aside>
              <Filter
                value={filters}
                onChange={setFilters}
                onReset={reset}
                locationOptions={locationOptions}
                propertyTypeOptions={propertyTypeOptions}
                empty={isEmpty}
              />
            </aside>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-body text-ink">
                  <span className="font-bold">{filtered.length}</span> bất động sản phù hợp{" "}
                  <span className="ml-2 rounded-full bg-soft px-3 py-1 text-label text-success">
                    Giá công khai
                  </span>{" "}
                  <span className="rounded-full bg-soft px-3 py-1 text-label text-gold">
                    Diện tích công khai
                  </span>
                </p>
                <label className="flex items-center gap-2 text-body text-muted">
                  Sắp xếp:
                  <select className="rounded-md border border-line px-3 py-2 text-body text-ink" defaultValue="newest">
                    <option value="newest">Mới nhất</option>
                  </select>
                </label>
              </div>

              {isEmpty ? (
                <div className="mt-6">
                  <EmptySearchResults
                    title="Không tìm thấy căn phù hợp?"
                    message="Thử mở rộng khoảng giá hoặc khu vực. Không tự hiển thị dữ liệu nội bộ."
                    resetLabel="Đặt lại bộ lọc"
                    onReset={reset}
                  />
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3 wide:grid-cols-4">
                  {visible.map((listing) => (
                    <PropertyCard key={listing.slug} listing={listing} />
                  ))}
                </div>
              )}

              <div className="mt-10">
                <Pagination page={safePage} total={totalPages} onChange={setPage} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterDrawer
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
