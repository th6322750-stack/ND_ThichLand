"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await loginAction(form);
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        if (result.requiresTwoFactor) setRequiresTwoFactor(true);
        setError(result.error ?? (result.requiresTwoFactor ? undefined : "Đăng nhập thất bại."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 desktop:grid-cols-[7fr_11fr]">
      <div className="flex flex-col justify-center bg-footer px-10 py-16 desktop:px-20">
        <div className="flex items-center gap-3">
          {/* Opaque JPEG with its own baked-in white background, so the
              white plate behind it is deliberate (see Sidebar) rather than
              a stray background. */}
          <span className="flex items-center rounded-sm bg-surface px-3 py-2">
            <Image
              src="/assets/v2/branding/dac-thich-land-logo-400.jpg"
              alt="NDTHICH LAND"
              width={512}
              height={512}
              className="h-8 w-auto"
              unoptimized
              loading="eager"
            />
          </span>
          <span className="text-label uppercase tracking-[0.14em] text-line/60">Quản trị</span>
        </div>
        <h1 className="mt-10 text-h1-mobile text-surface desktop:text-h1">
          Quản trị nội dung
          <br />
          BĐS &amp; dự án
        </h1>
        <p className="mt-6 max-w-sm text-body-lg-mobile text-line/70 desktop:text-body-lg">
          Dữ liệu phòng cho thuê, dự án và tin tức được quản lý theo schema đã chuẩn hóa.
        </p>
      </div>

      <div className="flex items-center justify-center bg-soft px-6 py-16">
        <div className="w-full max-w-md rounded-md border border-line bg-surface p-8">
          <h2 className="text-h2-mobile text-ink desktop:text-h2">Đăng nhập quản trị</h2>
          <p className="mt-1 text-body text-muted">Sử dụng tài khoản được cấp.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6">
            <FormField label="Email / tài khoản" name="email" required placeholder="Nhập / chọn..." />
            <div className="mt-6">
              <FormField label="Mật khẩu" name="password" type="password" required />
            </div>
            {requiresTwoFactor && (
              <div className="mt-6">
                <FormField
                  label="Mã xác thực 2 bước"
                  name="totpCode"
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  hint="Nhập mã 6 số đang hiển thị trong ứng dụng Authenticator."
                />
              </div>
            )}
            {error && (
              <p role="alert" className="mt-3 text-body text-error">
                {error}
              </p>
            )}
            <div className="mt-4 flex items-center">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-body text-ink">
                <input type="checkbox" name="remember" className="h-5 w-5" />
                Ghi nhớ đăng nhập
              </label>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100"
            >
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
