"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProjectAction } from "@/app/actions/projects";
import type { ProjectRecord } from "@/lib/server/projects/repository";

export function ProjectRowActions({ record }: { record: ProjectRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Xóa dự án "${record.name}"? Dự án sẽ được ẩn khỏi danh sách công khai.`)) return;
    setBusy(true);
    try {
      await deleteProjectAction(record.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      // Quiet until reached for, then red — same rule as BdsRowActions, so
      // "Sửa" (primary) and the destructive action never read as one pair.
      className="text-label text-muted transition-colors duration-fast ease-base hover:text-error disabled:opacity-60"
    >
      {busy ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
