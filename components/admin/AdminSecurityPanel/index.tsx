"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/public/FormField";
import {
  beginTwoFactorSetupAction,
  changeAdminPasswordAction,
  confirmTwoFactorSetupAction,
  disableTwoFactorAction,
  type AdminSecurityActionResult,
} from "@/app/actions/adminSecurity";

interface SetupState {
  secret: string;
  uri: string;
  setupToken: string;
}

function ResultMessage({ result, success }: { result?: AdminSecurityActionResult; success: string }) {
  if (!result) return null;
  return result.ok ? (
    <p role="status" className="mt-4 rounded-md border border-success bg-success/5 p-3 text-body text-success">
      {success}
    </p>
  ) : result.error ? (
    <p role="alert" className="mt-4 rounded-md border border-error bg-error/5 p-3 text-body text-error">
      {result.error}
    </p>
  ) : null;
}

export function AdminSecurityPanel({
  totpEnabled,
  persistenceAvailable,
  statusAvailable,
}: {
  totpEnabled: boolean;
  persistenceAvailable: boolean;
  statusAvailable: boolean;
}) {
  const router = useRouter();
  const [passwordResult, setPasswordResult] = useState<AdminSecurityActionResult>();
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [twoFactorResult, setTwoFactorResult] = useState<AdminSecurityActionResult>();
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [setup, setSetup] = useState<SetupState>();
  const [copied, setCopied] = useState(false);

  async function handlePasswordChange(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordResult(undefined);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const result = await changeAdminPasswordAction({
        currentPassword: String(data.get("currentPassword") ?? ""),
        currentTotpCode: String(data.get("currentTotpCode") ?? ""),
        newPassword: String(data.get("newPassword") ?? ""),
        confirmPassword: String(data.get("confirmPassword") ?? ""),
      });
      setPasswordResult(result);
      if (result.ok) form.reset();
    } catch {
      setPasswordResult({ ok: false, error: "Không thể lưu thay đổi bảo mật. Vui lòng thử lại." });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function beginSetup(form: HTMLFormElement) {
    setTwoFactorSaving(true);
    setTwoFactorResult(undefined);
    setCopied(false);
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const currentTotpCode = String(data.get("currentTotpCode") ?? "");
    try {
      const result = await beginTwoFactorSetupAction({ currentPassword, currentTotpCode });
      setTwoFactorResult(result);
      if (result.ok && result.secret && result.uri && result.setupToken) {
        setSetup({ secret: result.secret, uri: result.uri, setupToken: result.setupToken });
      }
    } catch {
      setTwoFactorResult({ ok: false, error: "Không thể tạo khóa 2FA mới. Vui lòng thử lại." });
    } finally {
      setTwoFactorSaving(false);
    }
  }

  async function handleBeginSetup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await beginSetup(e.currentTarget);
  }

  async function handleConfirmSetup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!setup) return;
    setTwoFactorSaving(true);
    setTwoFactorResult(undefined);
    const data = new FormData(e.currentTarget);
    try {
      const result = await confirmTwoFactorSetupAction({
        newTotpCode: String(data.get("newTotpCode") ?? ""),
        setupToken: setup.setupToken,
      });
      setTwoFactorResult(result);
      if (result.ok) {
        setSetup(undefined);
        router.refresh();
      }
    } catch {
      setTwoFactorResult({ ok: false, error: "Không thể bật 2FA. Vui lòng thử lại." });
    } finally {
      setTwoFactorSaving(false);
    }
  }

  async function handleDisable(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTwoFactorSaving(true);
    setTwoFactorResult(undefined);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const result = await disableTwoFactorAction({
        currentPassword: String(data.get("currentPassword") ?? ""),
        currentTotpCode: String(data.get("currentTotpCode") ?? ""),
      });
      setTwoFactorResult(result);
      if (result.ok) {
        form.reset();
        router.refresh();
      }
    } catch {
      setTwoFactorResult({ ok: false, error: "Không thể tắt 2FA. Vui lòng thử lại." });
    } finally {
      setTwoFactorSaving(false);
    }
  }

  const passwordErrors = passwordResult?.fieldErrors ?? {};
  const twoFactorErrors = twoFactorResult?.fieldErrors ?? {};

  return (
    <section className="rounded-md border border-line bg-surface p-6" aria-labelledby="admin-security-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="admin-security-title" className="text-h2-mobile text-ink desktop:text-h2">
            Bảo mật tài khoản admin
          </h2>
          <p className="mt-1 text-body text-muted">
            Chỉ admin đã đăng nhập và xác nhận mật khẩu hiện tại mới đổi được mật khẩu hoặc 2FA.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-label ${
            totpEnabled ? "bg-success/10 text-success" : "bg-[#FFF3D6] text-[#8A5A10]"
          }`}
        >
          2FA: {totpEnabled ? "ĐANG BẬT" : "ĐANG TẮT"}
        </span>
      </div>

      {!statusAvailable && (
        <p role="alert" className="mt-4 rounded-md border border-error bg-error/5 p-3 text-body text-error">
          Không kiểm tra được trạng thái bảo mật lúc này. Hệ thống tạm khóa đổi mật khẩu/2FA để an toàn — liên hệ đội
          kỹ thuật để kiểm tra lại cấu hình máy chủ.
        </p>
      )}
      {!persistenceAvailable && (
        <p role="alert" className="mt-4 rounded-md border border-[#D49A3A] bg-[#FFF8E8] p-3 text-body text-[#8A5A10]">
          Hệ thống lưu trữ chưa sẵn sàng. Chưa thể đổi mật khẩu hoặc bật/tắt 2FA lúc này để tránh mất dữ liệu — liên
          hệ đội kỹ thuật.
        </p>
      )}

      <div className="mt-6 grid gap-6 min-[1100px]:grid-cols-2">
        <form onSubmit={handlePasswordChange} noValidate className="rounded-md border border-line p-5">
          <h3 className="text-[18px] font-bold text-ink">Đổi mật khẩu</h3>
          <div className="mt-4 flex flex-col gap-4">
            <FormField
              label="Mật khẩu hiện tại"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              error={passwordErrors.currentPassword}
            />
            {totpEnabled && (
              <FormField
                label="Mã 2FA hiện tại"
                name="currentTotpCode"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                error={passwordErrors.currentTotpCode}
              />
            )}
            <FormField
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              hint="Tối thiểu 12 ký tự."
              error={passwordErrors.newPassword}
            />
            <FormField
              label="Nhập lại mật khẩu mới"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              error={passwordErrors.confirmPassword}
            />
          </div>
          <ResultMessage result={passwordResult} success="Đã đổi mật khẩu admin." />
          <button
            type="submit"
            disabled={passwordSaving || !persistenceAvailable || !statusAvailable}
            className="mt-5 min-h-[44px] rounded-sm bg-primary px-5 py-3 text-button uppercase text-surface disabled:opacity-50"
          >
            {passwordSaving ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>

        <div className="rounded-md border border-line p-5">
          <h3 className="text-[18px] font-bold text-ink">Xác thực 2 bước (Authenticator)</h3>
          <p className="mt-1 text-body text-muted">
            Dùng Google Authenticator, Microsoft Authenticator, 1Password hoặc ứng dụng TOTP tương thích.
          </p>

          {!setup && (
            <form onSubmit={totpEnabled ? handleDisable : handleBeginSetup} noValidate className="mt-4 flex flex-col gap-4">
              <FormField
                label="Mật khẩu hiện tại"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                error={twoFactorErrors.currentPassword}
              />
              {totpEnabled && (
                <FormField
                  label="Mã 2FA hiện tại"
                  name="currentTotpCode"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  error={twoFactorErrors.currentTotpCode}
                />
              )}
              <div className="flex flex-wrap gap-3">
                {totpEnabled && (
                  <button
                    type="button"
                    disabled={twoFactorSaving || !persistenceAvailable || !statusAvailable}
                    onClick={(event) => {
                      const form = event.currentTarget.form;
                      if (form) void beginSetup(form);
                    }}
                    className="min-h-[44px] rounded-sm border border-primary px-5 py-3 text-button uppercase text-primary disabled:opacity-50"
                  >
                    Thay khóa 2FA
                  </button>
                )}
                <button
                  type="submit"
                  disabled={twoFactorSaving || !persistenceAvailable || !statusAvailable}
                  className={`min-h-[44px] rounded-sm px-5 py-3 text-button uppercase disabled:opacity-50 ${
                    totpEnabled ? "border border-error text-error" : "bg-primary text-surface"
                  }`}
                >
                  {twoFactorSaving ? "Đang xử lý..." : totpEnabled ? "Tắt 2FA" : "Thiết lập 2FA"}
                </button>
              </div>
            </form>
          )}

          {setup && (
            <form onSubmit={handleConfirmSetup} noValidate className="mt-4">
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="text-label font-semibold text-ink">1. Thêm tài khoản vào Authenticator</p>
                <a href={setup.uri} className="mt-3 inline-flex min-h-[44px] items-center rounded-sm bg-primary px-4 text-button uppercase text-surface">
                  Mở ứng dụng Authenticator
                </a>
                <p className="mt-3 text-body text-muted">Hoặc nhập thủ công khóa này:</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="break-all rounded bg-surface px-3 py-2 text-body font-semibold tracking-[0.12em] text-ink">
                    {setup.secret}
                  </code>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(setup.secret);
                      setCopied(true);
                    }}
                    className="min-h-[44px] rounded-sm border border-line px-3 text-label text-ink"
                  >
                    {copied ? "Đã sao chép" : "Sao chép"}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <FormField
                  label="2. Nhập mã 6 số từ khóa mới"
                  name="newTotpCode"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  error={twoFactorErrors.newTotpCode}
                />
              </div>
              <ResultMessage result={twoFactorResult} success="Đã bật 2FA." />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="submit" disabled={twoFactorSaving} className="min-h-[44px] rounded-sm bg-primary px-5 py-3 text-button uppercase text-surface disabled:opacity-50">
                  {twoFactorSaving ? "Đang xác nhận..." : "Xác nhận bật 2FA"}
                </button>
                <button type="button" onClick={() => setSetup(undefined)} className="min-h-[44px] rounded-sm border border-line px-5 py-3 text-button uppercase text-ink">
                  Hủy
                </button>
              </div>
            </form>
          )}

          {!setup && <ResultMessage result={twoFactorResult} success={totpEnabled ? "Đã tắt 2FA." : "Sẵn sàng thiết lập 2FA."} />}
        </div>
      </div>
    </section>
  );
}
