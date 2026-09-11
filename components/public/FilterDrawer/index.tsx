"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Filter } from "@/components/public/Filter";
import { EMPTY_RENTAL_FILTERS, type RentalFilterState } from "@/lib/rentalFilters";
import type { PropertyType } from "@/lib/types";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Currently committed shared filter state — only read to seed the draft when the drawer opens. */
  committedFilters: RentalFilterState;
  /** Called with the full draft once "Áp dụng" is pressed; the drawer closes right after. */
  onApply: (filters: RentalFilterState) => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

/**
 * Draft-first semantics: edits inside the drawer only ever touch a local
 * draft, never the shared committed filters/URL/results. The draft is
 * re-seeded from `committedFilters` on every open→close→open cycle, so
 * closing via X/Escape/backdrop silently discards whatever was in
 * progress. Only "Áp dụng" commits — including "Xóa bộ lọc", which just
 * clears the draft and still needs Áp dụng to take effect.
 */
export function FilterDrawer({
  open,
  onClose,
  committedFilters,
  onApply,
  locationOptions,
  propertyTypeOptions,
}: FilterDrawerProps) {
  const panelRef = useFocusTrap(open, onClose);
  const [draft, setDraft] = useState<RentalFilterState>(committedFilters);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(committedFilters);
    }
    wasOpenRef.current = open;
  }, [open, committedFilters]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleDraftChange(patch: Partial<RentalFilterState>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function handleDraftReset() {
    setDraft(EMPTY_RENTAL_FILTERS);
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
            className="flex h-[44px] w-[44px] items-center justify-center"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <Filter
          value={draft}
          onChange={handleDraftChange}
          onApply={handleApply}
          onReset={handleDraftReset}
          locationOptions={locationOptions}
          propertyTypeOptions={propertyTypeOptions}
        />
      </div>
    </>
  );
}
