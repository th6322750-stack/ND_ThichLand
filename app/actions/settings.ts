"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";
import type { SiteSettings } from "@/lib/types";

export interface SettingsActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const UNAUTHORIZED: SettingsActionResult = {
  ok: false,
  error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};
const NOT_CONFIGURED: SettingsActionResult = { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };

function validate(input: SiteSettings): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
  if (!input.phonePrimary.trim()) errors.phonePrimary = "Vui lòng nhập hotline chính";
  if (!input.email.trim()) {
    errors.email = "Vui lòng nhập email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Email không hợp lệ";
  }
  if (!input.hoursWeekday.trim()) errors.hoursWeekday = "Vui lòng nhập giờ làm việc";
  return errors;
}

export async function saveSiteSettingsAction(input: SiteSettings): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable") return NOT_CONFIGURED;

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại các trường được đánh dấu.", fieldErrors };
  }

  const repo = await getSiteSettingsRepository();
  await repo.save({
    address: input.address.trim(),
    mapQuery: input.mapQuery.trim(),
    phonePrimary: input.phonePrimary.trim(),
    phoneSecondary: input.phoneSecondary.trim(),
    email: input.email.trim(),
    hoursWeekday: input.hoursWeekday.trim(),
    hoursWeekend: input.hoursWeekend.trim(),
    profilePdfUrl: input.profilePdfUrl.trim(),
  });

  // Every surface that renders the contact block or the footer.
  revalidatePath("/", "layout");
  return { ok: true };
}
