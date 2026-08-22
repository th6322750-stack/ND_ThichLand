"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { getPageContentRepository } from "@/lib/server/pageContent/providers";
import { normalizeAboutPageContent, normalizeContactPageContent } from "@/lib/data/pageContent";
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

function required(
  errors: Record<string, string>,
  key: string,
  value: string,
  label: string,
  maxLength = 1000,
): void {
  if (!value.trim()) errors[key] = `Vui lòng nhập ${label}.`;
  else if (value.trim().length > maxLength) errors[key] = `${label} không được quá ${maxLength} ký tự.`;
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

function validateAbout(content: AboutPageContent): Record<string, string> {
  const errors: Record<string, string> = {};
  const rootFields: [keyof AboutPageContent, string, number][] = [
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
  for (const [key, label, max] of rootFields) required(errors, String(key), String(content[key]), label, max);
  content.stats.forEach((item, index) => {
    required(errors, `stats.${index}.value`, item.value, `giá trị số liệu ${index + 1}`, 80);
    required(errors, `stats.${index}.label`, item.label, `nhãn số liệu ${index + 1}`, 160);
  });
  content.values.forEach((item, index) => {
    required(errors, `values.${index}.title`, item.title, `tiêu đề giá trị ${index + 1}`, 160);
    required(errors, `values.${index}.body`, item.body, `mô tả giá trị ${index + 1}`, 500);
  });
  content.areas.forEach((item, index) => {
    required(errors, `areas.${index}.title`, item.title, `tên lĩnh vực ${index + 1}`, 160);
    required(errors, `areas.${index}.description`, item.description, `mô tả lĩnh vực ${index + 1}`, 700);
    if (!validMediaUrl(item.image)) errors[`areas.${index}.image`] = "Đường dẫn ảnh không hợp lệ.";
  });
  if (!validMediaUrl(content.heroImage)) errors.heroImage = "Đường dẫn ảnh không hợp lệ.";
  return errors;
}

function cleanContact(input: ContactPageContent): ContactPageContent {
  const content = normalizeContactPageContent(input);
  return Object.fromEntries(
    Object.entries(content).map(([key, value]) => [key, value.trim()]),
  ) as unknown as ContactPageContent;
}

function validateContact(content: ContactPageContent): Record<string, string> {
  const errors: Record<string, string> = {};
  const longer = new Set(["metadataDescription", "heroBody", "formDescription", "formSuccessMessage"]);
  const labels: Record<keyof ContactPageContent, string> = {
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
  for (const [rawKey, value] of Object.entries(content)) {
    const key = rawKey as keyof ContactPageContent;
    required(errors, key, value, labels[key], longer.has(key) ? 1000 : 200);
  }
  return errors;
}

function unavailable(): boolean {
  return resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable";
}

export async function saveAboutPageContentAction(input: AboutPageContent): Promise<PageContentActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (unavailable()) return { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };
  const content = cleanAbout(input);
  const fieldErrors = validateAbout(content);
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Vui lòng kiểm tra lại các trường được đánh dấu.", fieldErrors };
  }
  await (await getPageContentRepository()).save("about", content);
  revalidatePath("/gioi-thieu");
  return { ok: true };
}

export async function saveContactPageContentAction(input: ContactPageContent): Promise<PageContentActionResult> {
  if (!(await getSession())) return UNAUTHORIZED;
  if (unavailable()) return { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };
  const content = cleanContact(input);
  const fieldErrors = validateContact(content);
  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Vui lòng kiểm tra lại các trường được đánh dấu.", fieldErrors };
  }
  await (await getPageContentRepository()).save("contact", content);
  revalidatePath("/lien-he");
  return { ok: true };
}
