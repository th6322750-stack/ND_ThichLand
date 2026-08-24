"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { PageHeader } from "@/components/admin/PageHeader";
import { saveSiteSettingsAction } from "@/app/actions/settings";
import { uploadMediaAction } from "@/app/actions/media";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { mapQueryOf } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Kept in state purely so the map preview below follows what is typed —
  // the operator can confirm the pin lands on the right building before saving.
  const [preview, setPreview] = useState<SiteSettings>(initial);
  const [profilePdfUrl, setProfilePdfUrl] = useState<string>(initial.profilePdfUrl);
  const [profileState, setProfileState] = useState<UploaderState>("empty");
  const [profileError, setProfileError] = useState<string>();
  const profileInputRef = useRef<HTMLInputElement>(null);

  async function handleProfileFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProfileError(undefined);
    setProfileState("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadMediaAction(fd);
      if (!result.ok || !result.record) {
        setProfileError(result.error);
        setProfileState("error");
        return;
      }
      setProfilePdfUrl(result.record.webViewLink);
      setProfileState("empty");
    } catch {
      setProfileState("error");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSaved(false);
    setFieldErrors({});
    try {
      const form = new FormData(e.currentTarget);
      const input: SiteSettings = {
        address: String(form.get("address") ?? ""),
        mapQuery: String(form.get("mapQuery") ?? ""),
        phonePrimary: String(form.get("phonePrimary") ?? ""),
        phoneSecondary: String(form.get("phoneSecondary") ?? ""),
        email: String(form.get("email") ?? ""),
        hoursWeekday: String(form.get("hoursWeekday") ?? ""),
        hoursWeekend: String(form.get("hoursWeekend") ?? ""),
        profilePdfUrl,
      };
      const result = await saveSiteSettingsAction(input);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setPreview(input);
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function syncPreview(e: FormEvent<HTMLFormElement>) {
    const form = new FormData(e.currentTarget);
    setPreview((p) => ({
      ...p,
      address: String(form.get("address") ?? ""),
      mapQuery: String(form.get("mapQuery") ?? ""),
    }));
  }

  const previewQuery = mapQueryOf(preview);

  return (
    <form onSubmit={handleSubmit} onChange={syncPreview} noValidate className="flex flex-col gap-6">
      <PageHeader
        title="Cài đặt liên hệ"
        description="Địa chỉ, hotline, email và giờ làm việc hiển thị ở khối liên hệ trang chủ và chân trang."
        action={
          <button
            type="submit"
            disabled={saving}
            className="rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        }
      />

      {error && (
        <p role="alert" className="rounded-md border border-error bg-error/5 p-4 text-body text-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-md border border-success bg-success/5 p-4 text-body text-success">
          Đã lưu. Khối liên hệ và bản đồ trên website đã cập nhật.
        </p>
      )}

      <FormSection title="Địa chỉ & bản đồ">
        <FormField
          label="Địa chỉ hiển thị"
          name="address"
          required
          defaultValue={initial.address}
          error={fieldErrors.address}
          hint="Chuỗi này vừa hiện trên website vừa là toạ độ tìm của bản đồ."
        />
        <FormField
          label="Toạ độ tìm riêng cho bản đồ"
          name="mapQuery"
          defaultValue={initial.mapQuery}
          placeholder="Để trống nếu bản đồ đã ghim đúng"
          hint="Chỉ dùng khi địa chỉ trên ghim sai chỗ — điền toạ độ (vd: 10.8014, 106.7109) hoặc tên toà nhà."
        />
      </FormSection>

      <FormSection title="Kiểm tra vị trí ghim">
        {/* Full-width inside FormSection's 2-col grid — the point of this
            block is to be big enough to actually recognise the street. */}
        <div className="min-[1200px]:col-span-2">
          <div className="relative h-[320px] overflow-hidden rounded-md border border-line">
            <iframe
              key={previewQuery}
              src={`https://www.google.com/maps?q=${encodeURIComponent(previewQuery)}&output=embed&hl=vi&z=16`}
              title={`Xem trước bản đồ ${previewQuery}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <p className="mt-2 text-body text-muted">
            Đang tìm: <span className="text-ink">{previewQuery || "(chưa có địa chỉ)"}</span> — ghim sai thì
            điền ô “Toạ độ tìm riêng” ở trên.
          </p>
        </div>
      </FormSection>

      <FormSection title="Hotline & email">
        <FormField
          label="Hotline chính"
          name="phonePrimary"
          type="tel"
          required
          defaultValue={initial.phonePrimary}
          error={fieldErrors.phonePrimary}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={initial.email}
          error={fieldErrors.email}
        />
      </FormSection>

      <FormSection title="Hồ sơ năng lực">
        {/* Full-width inside FormSection's 2-col grid. */}
        <div className="min-[1200px]:col-span-2">
          <p className="text-body text-muted">
            File PDF hiển thị ở mục “Hồ sơ năng lực” trên trang chủ. Chưa có file thì mục đó không xuất hiện.
          </p>
          {profilePdfUrl ? (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md border border-line bg-soft px-4 py-3">
              <span className="text-body text-ink">Đã có file hồ sơ</span>
              <a
                href={profilePdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
              >
                Mở xem ↗
              </a>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="text-label text-primary transition-opacity duration-fast ease-base hover:opacity-70"
              >
                Thay file khác
              </button>
              <button
                type="button"
                onClick={() => setProfilePdfUrl("")}
                className="text-label text-muted transition-colors duration-fast ease-base hover:text-error"
              >
                Gỡ xuống
              </button>
            </div>
          ) : (
            <div className="mt-3 max-w-sm">
              <Uploader
                state={profileState}
                errorMessage={profileError}
                onClick={() => profileInputRef.current?.click()}
                onRetry={() => profileInputRef.current?.click()}
              />
              <p className="mt-2 text-body text-muted">Chọn file PDF, tối đa 25MB.</p>
            </div>
          )}
          <input
            ref={profileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleProfileFile}
          />
        </div>
      </FormSection>

      <FormSection title="Giờ làm việc">
        <FormField
          label="Ngày thường"
          name="hoursWeekday"
          required
          defaultValue={initial.hoursWeekday}
          error={fieldErrors.hoursWeekday}
          placeholder="Thứ 2 - Thứ 7: 8:00 - 18:00"
        />
        <FormField
          label="Cuối tuần"
          name="hoursWeekend"
          defaultValue={initial.hoursWeekend}
          placeholder="Chủ nhật: 8:00 - 12:00"
          hint="Để trống nếu không làm cuối tuần — dòng này sẽ ẩn trên website."
        />
      </FormSection>
    </form>
  );
}
