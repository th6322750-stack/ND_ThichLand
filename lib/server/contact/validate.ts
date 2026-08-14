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

export function validateContactForm(input: ContactFormInput): {
  errors: Record<string, string>;
  value?: ValidatedContact;
} {
  const errors: Record<string, string> = {};

  const name = input.name.trim();
  if (!name) errors.name = "Vui lòng nhập họ và tên";
  else if (name.length > NAME_MAX) errors.name = "Họ và tên quá dài";

  const phoneNormalized = normalizeVietnamesePhone(input.phone.trim());
  if (!input.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
  else if (!phoneNormalized) errors.phone = "Số điện thoại không hợp lệ";

  const need = input.need.trim().slice(0, TEXT_MAX);
  const area = input.area.trim().slice(0, TEXT_MAX);
  const message = input.message.trim().slice(0, MESSAGE_MAX);

  if (Object.keys(errors).length > 0) return { errors };

  return { errors: {}, value: { name, phone: phoneNormalized!, need, area, message } };
}
