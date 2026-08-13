"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { login } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (login(email, password)) {
      router.push("/admin");
    } else {
      setError("Vui lòng nhập email/tài khoản và mật khẩu");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 desktop:grid-cols-[1fr_1fr]">
      <div className="flex flex-col justify-center bg-footer px-10 py-16 desktop:px-20">
        <div className="flex items-center gap-3">
          <Image src="/assets/logos/NO_LOGO.svg" alt="NDTHICH ADMIN" width={48} height={48} unoptimized />
          <span className="text-h3 text-surface">NDTHICH ADMIN</span>
        </div>
        <h1 className="mt-10 text-h1-mobile text-surface desktop:text-h1">
          Quản trị nội dung
          <br />
          BĐS &amp; dự án
        </h1>
        <p className="mt-6 max-w-sm text-body-lg-mobile text-[#B9B9B9] desktop:text-body-lg">
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
            {error && (
              <p role="alert" className="mt-3 text-body text-error">
                {error}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-body text-ink">
                <input type="checkbox" name="remember" className="h-4 w-4" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-label text-primary hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
            >
              Đăng nhập
            </button>
          </form>
          <p className="mt-6 text-center text-body text-muted">NO LOGO • sẽ thay sau</p>
        </div>
      </div>
    </div>
  );
}
