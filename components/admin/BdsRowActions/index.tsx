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
      className="text-label text-error hover:underline disabled:opacity-60"
    >
      {busy ? "Đang xóa..." : record.sourceId ? "Ẩn" : "Xóa"}
    </button>
  );
}
