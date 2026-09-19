"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";
import { normalizeAboutPageContent, normalizeContactPageContent } from "@/lib/data/pageContent";
import { fieldErrorsFromZodError } from "@/lib/server/validation";
import { PERSISTENCE_NOT_CONFIGURED_ERROR, resolveProviderMode } from "@/lib/server/providerMode";
import type { AboutPageContent, ContactPageContent } from "@/lib/types";

export interface PageContentActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const UNAUTHORIZED: PageContentActionResult = {
  ok: false,
  error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};

function checkRequired(
  ctx: z.RefinementCtx,
  path: (string | number)[],
  value: string,
  label: string,
  maxLength = 1000,
): void {
  if (!value.trim()) ctx.addIssue({ code: "custom", path, message: `Vui lòng nhập ${label}.` });
  else if (value.trim().length > maxLength) {
    ctx.addIssue({ code: "custom", path, message: `${label} không được quá ${maxLength} ký tự.` });
  }
}

function validMediaUrl(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function cleanAbout(input: AboutPageContent): AboutPageContent {
  const content = normalizeAboutPageContent(input);
  return {
    ...content,
    metadataTitle: content.metadataTitle.trim(),
    metadataDescription: content.metadataDescription.trim(),
    heroEyebrow: content.heroEyebrow.trim(),
    heroTitle: content.heroTitle.trim(),
    heroBody: content.heroBody.trim(),
    heroImage: content.heroImage.trim(),
    heroMediaLabel: content.heroMediaLabel.trim(),
    statsEyebrow: content.statsEyebrow.trim(),
    statsTitle: content.statsTitle.trim(),
    statsDescription: content.statsDescription.trim(),
    stats: content.stats.map((item) => ({ value: item.value.trim(), label: item.label.trim() })),
    valuesEyebrow: content.valuesEyebrow.trim(),
    valuesTitle: content.valuesTitle.trim(),
    values: content.values.map((item) => ({ title: item.title.trim(), body: item.body.trim() })),
    areasEyebrow: content.areasEyebrow.trim(),
    areasTitle: content.areasTitle.trim(),
    areasDescription: content.areasDescription.trim(),
    areas: content.areas.map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      image: item.image.trim(),
    })),
    ctaTitle: content.ctaTitle.trim(),
    ctaSubtitle: content.ctaSubtitle.trim(),
    ctaCallLabel: content.ctaCallLabel.trim(),
    ctaZaloLabel: content.ctaZaloLabel.trim(),
  };
}

const ABOUT_ROOT_FIELDS: [keyof AboutPageContent, string, number][] = [
  ["metadataTitle", "tiêu đề SEO", 160],
  ["metadataDescription", "mô tả SEO", 320],
  ["heroEyebrow", "nhãn giới thiệu", 80],
  ["heroTitle", "tiêu đề giới thiệu", 200],
  ["heroBody", "nội dung giới thiệu", 1200],
  ["heroMediaLabel", "chú thích ảnh giới thiệu", 160],
  ["statsEyebrow", "nhãn năng lực", 80],
  ["statsTitle", "tiêu đề năng lực", 200],
  ["statsDescription", "mô tả năng lực", 500],
  ["valuesEyebrow", "nhãn giá trị", 80],
  ["valuesTitle", "tiêu đề giá trị", 200],
  ["areasEyebrow", "nhãn lĩnh vực", 80],
  ["areasTitle", "tiêu đề lĩnh vực", 200],
  ["areasDescription", "mô tả lĩnh vực", 500],
  ["ctaTitle", "tiêu đề CTA", 200],
  ["ctaSubtitle", "mô tả CTA", 500],
  ["ctaCallLabel", "nhãn nút gọi", 80],
  ["ctaZaloLabel", "nhãn nút Zalo", 80],
];

// Kept loosely typed (z.string() with no per-field constraints) at the shape
// level — every actual rule (required, max length, per-item index-aware
// labels, URL format) runs in superRefine below instead, mirroring the
// original imperative validator almost line for line. A field-level zod
// chain can't express "label includes this array item's own index" or
// "check every item in this array regardless of whether an earlier one
// already failed" without the same superRefine step anyway, so there was
// nothing to gain from splitting the rules across two mechanisms.
const aboutPageContentSchema = z
  .object({
    metadataTitle: z.string(),
    metadataDescription: z.string(),
    heroEyebrow: z.string(),
    heroTitle: z.string(),
    heroBody: z.string(),
    heroImage: z.string(),
    heroMediaLabel: z.string(),
    statsEyebrow: z.string(),
    statsTitle: z.string(),
    statsDescription: z.string(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })),
    valuesEyebrow: z.string(),
    valuesTitle: z.string(),
    values: z.array(z.object({ title: z.string(), body: z.string() })),
    areasEyebrow: z.string(),
    areasTitle: z.string(),
    areasDescription: z.string(),
    areas: z.array(z.object({ title: z.string(), description: z.string(), image: z.string() })),
    ctaTitle: z.string(),
    ctaSubtitle: z.string(),
    ctaCallLabel: z.string(),
    ctaZaloLabel: z.string(),
  })
  .superRefine((content, ctx) => {
    for (const [key, label, max] of ABOUT_ROOT_FIELDS) checkRequired(ctx, [key], String(content[key]), label, max);
    content.stats.forEach((item, index) => {
      checkRequired(ctx, ["stats", index, "value"], item.value, `giá trị số liệu ${index + 1}`, 80);
      checkRequired(ctx, ["stats", index, "label"], item.label, `nhãn số liệu ${index + 1}`, 160);
    });
    content.values.forEach((item, index) => {
      checkRequired(ctx, ["values", index, "title"], item.title, `tiêu đề giá trị ${index + 1}`, 160);
      checkRequired(ctx, ["values", index, "body"], item.body, `mô tả giá trị ${index + 1}`, 500);
    });
    content.areas.forEach((item, index) => {
      checkRequired(ctx, ["areas", index, "title"], item.title, `tên lĩnh vực ${index + 1}`, 160);
      checkRequired(ctx, ["areas", index, "description"], item.description, `mô tả lĩnh vực ${index + 1}`, 700);
      if (!validMediaUrl(item.image)) {
        ctx.addIssue({ code: "custom", path: ["areas", index, "image"], message: "Đường dẫn ảnh không hợp lệ." });
      }
    });
    if (!validMediaUrl(content.heroImage)) {
      ctx.addIssue({ code: "custom", path: ["heroImage"], message: "Đường dẫn ảnh không hợp lệ." });
    }
  }) satisfies z.ZodType<AboutPageContent>;

function cleanContact(input: ContactPageContent): ContactPageContent {
  const content = normalizeContactPageContent(input);
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => [key, value.trim()]),
  ) as unknown as ContactPageContent;
}

const CONTACT_FIELD_LABELS: Record<keyof ContactPageContent, string> = {
  metadataTitle: "tiêu đề SEO",
  metadataDescription: "mô tả SEO",
  heroTitle: "tiêu đề chính",
  heroBody: "nội dung giới thiệu",
  callButtonLabel: "chữ trên nút gọi",
  zaloButtonLabel: "chữ trên nút Zalo",
  mapLabel: "nhãn bản đồ",
  primaryPhoneLabel: "nhãn hotline chính",
  secondaryPhoneLabel: "nhãn hotline phụ",
  locationLabel: "nhãn địa chỉ",
  formTitle: "tiêu đề form",
  formDescription: "mô tả form",
  formNameLabel: "nhãn họ và tên",
  formPhoneLabel: "nhãn số điện thoại",
  formNeedLabel: "nhãn nhu cầu",
  formNeedPlaceholder: "gợi ý nhu cầu",
  formAreaLabel: "nhãn khu vực",
  formAreaPlaceholder: "gợi ý khu vực",
  formMessageLabel: "nhãn nội dung",
  formSubmitLabel: "chữ nút gửi",
  formSubmittingLabel: "chữ khi đang gửi",
  formNameRequiredError: "lỗi thiếu họ và tên",
  formPhoneRequiredError: "lỗi thiếu số điện thoại",
  formSuccessMessage: "thông báo gửi thành công",
};
const CONTACT_LONGER_FIELDS = new Set(["metadataDescription", "heroBody", "formDescription", "formSuccessMessage"]);

const contactPageContentSchema = z
  .object(
    Object.fromEntries(Object.keys(CONTACT_FIELD_LABELS).map((key) => [key, z.string()])) as Record<
      keyof ContactPageContent,
      z.ZodString
    >,
  )
  .superRefine((content, ctx) => {
    for (const rawKey of Object.keys(content)) {
      const key = rawKey as keyof ContactPageContent;
      checkRequired(ctx, [key], content[key], CONTACT_FIELD_LABELS[key], CONTACT_LONGER_FIELDS.has(key) ? 1000 : 200);
    }
  }) satisfies z.ZodType<ContactPageContent>;

function unavailable(): boolean {
  return resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable";
}

export async function saveAboutPageContentAction(input: AboutPageContent): Promise<PageContentActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (unavailable()) return { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };
  const content = cleanAbout(input);
  const parsed = aboutPageContentSchema.safeParse(content);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Vui lòng kiểm tra lại các trường được đánh dấu.",
      fieldErrors: fieldErrorsFromZodError(parsed.error),
    };
  }
  await (await getPageContentRepository()).save("about", content);
  revalidatePath("/gioi-thieu");
  return { ok: true };
}

export async function saveContactPageContentAction(input: ContactPageContent): Promise<PageContentActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (unavailable()) return { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };
  const content = cleanContact(input);
  const parsed = contactPageContentSchema.safeParse(content);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Vui lòng kiểm tra lại các trường được đánh dấu.",
      fieldErrors: fieldErrorsFromZodError(parsed.error),
    };
  }
  await (await getPageContentRepository()).save("contact", content);
  revalidatePath("/lien-he");
  return { ok: true };
}
