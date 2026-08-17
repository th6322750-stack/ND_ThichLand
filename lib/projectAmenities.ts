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

// Neutral fallback: used both for a legacy/off-catalog label (see
// iconForAmenity below) and, deliberately, for catalog entries below that
// have no dedicated icon in the frozen 35-icon set — a checkmark only claims
// "included," never a specific depiction, so it can't misrepresent anything.
const FALLBACK_ICON: IconName = "check";

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
  // Added 2026-08-17 after comparing against a reference project listing
  // (batdongsan.com.vn). These 3 have a real matching icon in the frozen
  // 35-icon set.
  { label: "Cửa hàng tiện lợi", icon: "shop" },
  { label: "Trung tâm thương mại", icon: "building" },
  { label: "Phòng sinh hoạt cộng đồng", icon: "home" },
  // User explicitly requested these 6 be added anyway, despite no dedicated
  // icon existing for any of them in the frozen set. Assigned FALLBACK_ICON
  // (a plain checkmark) rather than borrowing a thematically-close-but-wrong
  // glyph (e.g. "grill" for Nhà hàng) — a checkmark only claims "this
  // amenity is included," it doesn't misrepresent WHAT it looks like, unlike
  // e.g. using a pool photo for a project with no pool. Swap to a real icon
  // the moment a matching one exists in the frozen set.
  { label: "Sân bóng đá", icon: FALLBACK_ICON },
  { label: "Lối thoát hiểm", icon: FALLBACK_ICON },
  { label: "Hệ thống PCCC", icon: FALLBACK_ICON },
  { label: "Spa", icon: FALLBACK_ICON },
  { label: "Cà phê", icon: FALLBACK_ICON },
  { label: "Nhà hàng", icon: FALLBACK_ICON },
];

const AMENITY_ICON_BY_LABEL = new Map(PROJECT_AMENITY_CATALOG.map((a) => [a.label, a.icon]));

// Handles a legacy/off-catalog label (e.g. imported from before this catalog
// existed) — never crashes, just renders the same neutral marker instead of
// guessing a specific icon that might not match.
export function iconForAmenity(label: string): IconName {
  return AMENITY_ICON_BY_LABEL.get(label) ?? FALLBACK_ICON;
}
