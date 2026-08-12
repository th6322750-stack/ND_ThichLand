import type { AdminPropertyRecord } from "../types";
import { properties } from "./properties";

// Mock INTERNAL-ONLY fields for admin views. Never imported by public routes.
const internalBySlug: Record<string, Pick<AdminPropertyRecord, "commission" | "guidePerson" | "internalNotes">> = {
  "can-ho-2pn-noi-that-day-du-p301": {
    commission: "Theo dữ liệu",
    guidePerson: "Tên / SĐT",
    internalNotes: "Ghi chú vận hành",
  },
  "studio-ban-cong-thoang-p301": {
    commission: "Theo dữ liệu",
    guidePerson: "Tên / SĐT",
    internalNotes: "Ghi chú vận hành",
  },
};

const defaultInternal = { commission: "Theo dữ liệu", guidePerson: "Tên / SĐT", internalNotes: "Ghi chú vận hành" };

export const adminProperties: AdminPropertyRecord[] = properties.map((property) => ({
  ...property,
  ...(internalBySlug[property.slug] ?? defaultInternal),
}));

export function getAdminPropertyBySlug(slug: string): AdminPropertyRecord | undefined {
  return adminProperties.find((p) => p.slug === slug);
}
