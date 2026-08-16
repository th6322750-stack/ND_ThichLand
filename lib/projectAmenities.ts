import type { IconName } from "@/components/icons";

// Single source of truth for the "Tiện ích nổi bật" list, used by BOTH the
// admin picker (DuAnForm) and the public /du-an/[slug] icon render — a
// closed catalog so every displayed amenity always gets its correct icon
// (the previous design stored free text and matched icons by ARRAY
// POSITION, which silently mismatched for any project whose amenities
// weren't in this exact order).
export interface ProjectAmenityOption {
  label: string;
  icon: IconName;
}

export const PROJECT_AMENITY_CATALOG: ProjectAmenityOption[] = [
  { label: "Hồ bơi vô cực", icon: "pool" },
  { label: "Gym & Yoga", icon: "dumbbell" },
  { label: "Công viên nội khu", icon: "tree" },
  { label: "Khu BBQ", icon: "grill" },
  { label: "Shophouse", icon: "shop" },
  { label: "An ninh 24/7", icon: "shield" },
  { label: "Sảnh đón sang trọng", icon: "building" },
  { label: "Bãi đỗ xe", icon: "key" },
  { label: "Sân chơi trẻ em", icon: "star" },
  { label: "Kết nối giao thông thuận tiện", icon: "pin" },
  { label: "Thang máy tốc độ cao", icon: "sort" },
];

const AMENITY_ICON_BY_LABEL = new Map(PROJECT_AMENITY_CATALOG.map((a) => [a.label, a.icon]));

// Fallback for a legacy/off-catalog label (e.g. imported from before this
// catalog existed) — never crashes, just renders a neutral marker instead
// of guessing a specific icon that might not match.
const FALLBACK_ICON: IconName = "check";

export function iconForAmenity(label: string): IconName {
  return AMENITY_ICON_BY_LABEL.get(label) ?? FALLBACK_ICON;
}
