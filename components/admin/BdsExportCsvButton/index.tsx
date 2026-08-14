"use client";

import type { AdminPropertyRecord } from "@/lib/types";

interface BdsExportCsvButtonProps {
  records: AdminPropertyRecord[];
}

const COLUMNS: { key: keyof AdminPropertyRecord; label: string }[] = [
  { key: "roomNo", label: "Mã/phòng" },
  { key: "location", label: "Khu vực" },
  { key: "address", label: "Địa chỉ" },
  { key: "price", label: "Giá" },
  { key: "serviceFee", label: "Phí dịch vụ" },
  { key: "area", label: "Diện tích" },
  { key: "verticalAccess", label: "Thang" },
  { key: "propertyType", label: "Loại BĐS" },
  { key: "bedroomCount", label: "Số phòng ngủ" },
  { key: "furnishingStatus", label: "Nội thất" },
  { key: "availability", label: "Trạng thái" },
  { key: "published", label: "Đã đăng" },
  { key: "commission", label: "Hoa hồng (nội bộ)" },
  { key: "guidePerson", label: "Người dẫn (nội bộ)" },
  { key: "internalNotes", label: "Ghi chú nội bộ" },
];

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildCsv(records: AdminPropertyRecord[]): string {
  const header = COLUMNS.map((c) => csvEscape(c.label)).join(",");
  const rows = records.map((r) => COLUMNS.map((c) => csvEscape(r[c.key])).join(","));
  return [header, ...rows].join("\n");
}

/** Admin-only export — the CSV intentionally includes internal columns (contract: protected export, unlike any public data path). */
export function BdsExportCsvButton({ records }: BdsExportCsvButtonProps) {
  function handleExport() {
    const csv = "﻿" + buildCsv(records);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ndthich-bds-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center justify-center rounded-md border border-line px-6 py-3 text-button uppercase text-ink hover:border-primary"
    >
      Xuất CSV
    </button>
  );
}
