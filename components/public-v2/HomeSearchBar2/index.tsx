"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { AREA_RANGES, EMPTY_RENTAL_FILTERS, PRICE_RANGES, rentalFiltersToParams } from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface HomeSearchState {
  propertyType: PropertyType | "";
  location: string;
  priceRange: string;
  areaRange: string;
  q: string;
}

const EMPTY_STATE: HomeSearchState = { propertyType: "", location: "", priceRange: "", areaRange: "", q: "" };

const SELECT_CLASS = "mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D]";

interface HomeSearchBar2Props {
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Client-side search — builds a clean query string via the same
// rentalFiltersToParams helper components/public/SearchPanel already uses
// (only non-empty fields are set), instead of a native form GET submission
// that would serialize every empty field into the URL.
export function HomeSearchBar2({ locationOptions, propertyTypeOptions }: HomeSearchBar2Props) {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="rounded-lg border border-[#EDEBEA] bg-white p-4 min-[900px]:flex min-[900px]:flex-wrap min-[900px]:items-end min-[900px]:gap-3 min-[900px]:p-5">
      <p className="mb-3 text-[15px] font-bold text-[#0C0D0D] min-[900px]:hidden">Tìm kiếm bất động sản</p>
      {/* Desktop-only reorder via CSS order (mobile keeps the original DOM
          order/layout untouched): Từ khóa is order-1 + full width, which
          forces it alone onto its own row in the flex-wrap container; the
          4 selects + button are order-2 and wrap together onto the row
          below. min-w keeps each select's placeholder text from clipping. */}
      <div className="grid grid-cols-2 gap-3 min-[900px]:order-2 min-[900px]:flex min-[900px]:flex-1 min-[900px]:flex-wrap min-[900px]:gap-3">
        <label className="min-[900px]:min-w-[130px] min-[900px]:flex-1">
          <span className="block text-[12px] text-[#5F5D5D]">Loại bất động sản</span>
          <select
            className={SELECT_CLASS}
            value={state.propertyType}
            onChange={(e) => setState((s) => ({ ...s, propertyType: e.target.value as PropertyType | "" }))}
          >
            <option value="">Chọn loại</option>
            {propertyTypeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[130px] min-[900px]:flex-1">
          <span className="block text-[12px] text-[#5F5D5D]">Khu vực</span>
          <select className={SELECT_CLASS} value={state.location} onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}>
            <option value="">Chọn khu vực</option>
            {locationOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[130px] min-[900px]:flex-1">
          <span className="block text-[12px] text-[#5F5D5D]">Khoảng giá</span>
          <select className={SELECT_CLASS} value={state.priceRange} onChange={(e) => setState((s) => ({ ...s, priceRange: e.target.value }))}>
            <option value="">Chọn khoảng giá</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-[900px]:min-w-[130px] min-[900px]:flex-1">
          <span className="block text-[12px] text-[#5F5D5D]">Diện tích</span>
          <select className={SELECT_CLASS} value={state.areaRange} onChange={(e) => setState((s) => ({ ...s, areaRange: e.target.value }))}>
            <option value="">Chọn diện tích</option>
            {AREA_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block min-[900px]:order-1 min-[900px]:mt-0 min-[900px]:w-full">
        <span className="block text-[12px] text-[#5F5D5D]">Từ khóa</span>
        <input
          type="search"
          value={state.q}
          onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
          placeholder="Nhập từ khóa, vị trí, dự án..."
          className="mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D] placeholder:text-[#A6A6A6]"
        />
      </label>
      <button
        type="button"
        onClick={handleSearch}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#880206] px-6 py-[10px] text-[13px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:order-2 min-[900px]:mt-0 min-[900px]:w-auto"
      >
        <Icon name="search" size={16} className="invert" /> Tìm kiếm
      </button>
    </div>
  );
}
