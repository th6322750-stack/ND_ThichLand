import { z } from "zod";

const NAME_MAX = 120;
const TEXT_MAX = 500;
const MESSAGE_MAX = 2000;

export interface ContactFormInput {
  name: string;
  phone: string;
  need: string;
  area: string;
  message: string;
}

export interface ValidatedContact {
  name: string;
  phone: string;
  need: string;
  area: string;
  message: string;
}

/** Lenient Vietnamese phone normalization: accepts 0xxxxxxxxx, +84xxxxxxxxx, 84xxxxxxxxx,
 * with any spaces/dots/dashes/parens stripped first — deliberately loose on length (9-10
 * digits after the leading 0) to cover both mobile and landline formats without over-rejecting. */
export function normalizeVietnamesePhone(raw: string): string | null {
  const digits = raw.replace(/[\s.\-()]/g, "");
  let normalized = digits;
  if (normalized.startsWith("+84")) normalized = "0" + normalized.slice(3);
  else if (normalized.startsWith("84") && normalized.length >= 11) normalized = "0" + normalized.slice(2);
  if (!/^0\d{9,10}$/.test(normalized)) return null;
  return normalized;
}

// need/area/message are optional and silently truncated rather than
// rejected — a visitor pasting a long message shouldn't lose the whole
// submission to a length error on a field that isn't even required.
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên").max(NAME_MAX, "Họ và tên quá dài"),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .transform((value, ctx) => {
      const normalized = normalizeVietnamesePhone(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "Số điện thoại không hợp lệ" });
        return z.NEVER;
      }
      return normalized;
    }),
  need: z.string().trim().transform((v) => v.slice(0, TEXT_MAX)),
  area: z.string().trim().transform((v) => v.slice(0, TEXT_MAX)),
  message: z.string().trim().transform((v) => v.slice(0, MESSAGE_MAX)),
});

export function validateContactForm(input: ContactFormInput): {
  errors: Record<string, string>;
  value?: ValidatedContact;
} {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages && messages.length > 0) errors[field] = messages[0] as string;
    }
    return { errors };
  }
  return { errors: {}, value: parsed.data };
}
