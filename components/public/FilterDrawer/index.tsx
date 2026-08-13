"use client";

import { useEffect } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Filter } from "@/components/public/Filter";
import type { RentalFilterState } from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  value: RentalFilterState;
  onChange: (patch: Partial<RentalFilterState>) => void;
  onApply: () => void;
  onReset: () => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

export function FilterDrawer({
  open,
  onClose,
  value,
  onChange,
  onApply,
  onReset,
  locationOptions,
  propertyTypeOptions,
}: FilterDrawerProps) {
  const panelRef = useFocusTrap(open, onClose);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleApply() {
    onApply();
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-sheet-backdrop bg-[rgba(0,0,0,.42)]" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc"
        className="fixed inset-x-0 bottom-0 z-sheet-panel max-h-[85vh] overflow-y-auto rounded-t-xl bg-surface p-6"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Đóng bộ lọc"
            className="flex h-11 w-11 items-center justify-center"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <Filter
          value={value}
          onChange={onChange}
          onApply={handleApply}
          onReset={onReset}
          locationOptions={locationOptions}
          propertyTypeOptions={propertyTypeOptions}
        />
      </div>
    </>
  );
}
