"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { Filter2 } from "@/components/public-v2/Filter2";
import { EMPTY_RENTAL_FILTERS, type RentalFilterState } from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface FilterDrawer2Props {
  open: boolean;
  onClose: () => void;
  committedFilters: RentalFilterState;
  onApply: (filters: RentalFilterState) => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

// Mobile "Lọc" bottom sheet — same draft-first semantics as
// components/public/FilterDrawer (edits stay local until "Áp dụng").
export function FilterDrawer2({ open, onClose, committedFilters, onApply, locationOptions, propertyTypeOptions }: FilterDrawer2Props) {
  const panelRef = useFocusTrap(open, onClose);
  const [draft, setDraft] = useState<RentalFilterState>(committedFilters);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && !wasOpenRef.current) setDraft(committedFilters);
    wasOpenRef.current = open;
  }, [open, committedFilters]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-sheet-backdrop bg-black/45 animate-v2-fade-in" aria-hidden="true" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Bộ lọc"
        className="fixed inset-x-0 bottom-0 z-sheet-panel max-h-[85vh] animate-v2-sheet-up overflow-y-auto rounded-t-2xl bg-white p-5"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Đóng bộ lọc"
            onClick={onClose}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-md transition-colors duration-fast ease-base hover:text-[#880206]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <Filter2
          value={draft}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
          onReset={() => setDraft(EMPTY_RENTAL_FILTERS)}
          locationOptions={locationOptions}
          propertyTypeOptions={propertyTypeOptions}
        />
      </div>
    </>
  );
}
