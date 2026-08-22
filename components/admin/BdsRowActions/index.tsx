"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hideBdsSourceRecordAction, deleteCustomBdsRecordAction } from "@/app/actions/bds";
import type { AdminPropertyRecord } from "@/lib/types";

// Sheet-derived rows are never deleted (contract: rawRentalSheetReadOnly) —
// only hidden via an override patch. Custom (Admin-created) rows use the
// real soft-delete path. Same distinction app/actions/bds.ts already makes.
export function BdsRowActions({ record }: { record: AdminPropertyRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    const isSourceRow = Boolean(record.sourceId);
    const confirmMsg = isSourceRow
      ? `Ẩn "${record.roomNo}" khỏi danh sách công khai? (Không xóa dòng gốc trên Sheet)`
      : `Xóa "${record.roomNo}"? Bản ghi sẽ được ẩn khỏi danh sách công khai.`;
    if (!window.confirm(confirmMsg)) return;

    setBusy(true);
    try {
      if (isSourceRow) {
        await hideBdsSourceRecordAction(record.sourceId!);
      } else {
        await deleteCustomBdsRecordAction(`custom:${record.slug}`);
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={busy}
      // "Sửa" is primary (#8A1822) and this was error (#C43D45) — two reds
      // side by side, so the destructive action read as just another link.
      // It stays quiet until you reach for it, then commits to red.
      className="text-label text-muted transition-colors duration-fast ease-base hover:text-error disabled:opacity-60"
    >
      {busy ? "Đang xóa..." : record.sourceId ? "Ẩn" : "Xóa"}
    </button>
  );
}
