"use client";

import { useEffect } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Filter } from "@/components/public/Filter";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function FilterDrawer({ open, onClose }: FilterDrawerProps) {
  const panelRef = useFocusTrap(open, onClose);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

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
          <button type="button" aria-label="Đóng bộ lọc" onClick={onClose}>
            ✕
          </button>
        </div>
        <Filter onApply={onClose} onReset={onClose} />
      </div>
    </>
  );
}
