"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { properties } from "@/lib/data/properties";
import {
  AREA_RANGES,
  EMPTY_RENTAL_FILTERS,
  PRICE_RANGES,
  getLocationOptions,
  getPropertyTypeOptions,
  rentalFiltersToParams,
} from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface HomeSearchState {
  propertyType: PropertyType | "";
  location: string;
  priceRange: string;
  areaRange: string;
}

const EMPTY_STATE: HomeSearchState = { propertyType: "", location: "", priceRange: "", areaRange: "" };

const SELECT_BASE = "rounded-md border border-line px-4 py-3 text-body focus:border-primary focus:outline-none";

export function SearchPanel() {
  const router = useRouter();
  const [state, setState] = useState<HomeSearchState>(EMPTY_STATE);

  const locationOptions = useMemo(() => getLocationOptions(properties), []);
  const propertyTypeOptions = useMemo(() => getPropertyTypeOptions(properties), []);

  function handleSearch() {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, ...state }, 1);
    const qs = params.toString();
    router.push(qs ? `/cho-thue?${qs}` : "/cho-thue");
  }

  return (
    <div className="rounded-md border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h2 className="text-h3 text-ink">Tìm bất động sản cho thuê</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-5 desktop:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Loại BĐS</span>
          <select
            className={`${SELECT_BASE} ${state.propertyType ? "text-ink" : "text-muted"}`}
            value={state.propertyType}
            onChange={(e) => setState((s) => ({ ...s, propertyType: e.target.value as PropertyType | "" }))}
          >
            <option value="">Chọn...</option>
            {propertyTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Khu vực</span>
          <select
            className={`${SELECT_BASE} ${state.location ? "text-ink" : "text-muted"}`}
            value={state.location}
            onChange={(e) => setState((s) => ({ ...s, location: e.target.value }))}
          >
            <option value="">Chọn...</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Khoảng giá</span>
          <select
            className={`${SELECT_BASE} ${state.priceRange ? "text-ink" : "text-muted"}`}
            value={state.priceRange}
            onChange={(e) => setState((s) => ({ ...s, priceRange: e.target.value }))}
          >
            <option value="">Chọn...</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Diện tích</span>
          <select
            className={`${SELECT_BASE} ${state.areaRange ? "text-ink" : "text-muted"}`}
            value={state.areaRange}
            onChange={(e) => setState((s) => ({ ...s, areaRange: e.target.value }))}
          >
            <option value="">Chọn...</option>
            {AREA_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          <Icon name="search" size={16} className="invert" /> Tìm kiếm
        </button>
      </div>
    </div>
  );
}
