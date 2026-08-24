"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getSiteSettingsRepository } from "@/lib/server/settings/providers";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";
import { fieldErrorsFromZodError } from "@/lib/server/validation";
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

const siteSettingsSchema = z.object({
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
  mapQuery: z.string().trim(),
  phonePrimary: z.string().trim().min(1, "Vui lòng nhập hotline chính"),
  phoneSecondary: z.string().trim(),
  email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  hoursWeekday: z.string().trim().min(1, "Vui lòng nhập giờ làm việc"),
  hoursWeekend: z.string().trim(),
  profilePdfUrl: z.string().trim(),
}) satisfies z.ZodType<SiteSettings>;

export async function saveSiteSettingsAction(input: SiteSettings): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable") return NOT_CONFIGURED;

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Vui lòng kiểm tra lại các trường được đánh dấu.",
      fieldErrors: fieldErrorsFromZodError(parsed.error),
    };
  }

  const repo = await getSiteSettingsRepository();
  await repo.save(parsed.data);

  // Every surface that renders the contact block or the footer.
  revalidatePath("/", "layout");
  return { ok: true };
}
