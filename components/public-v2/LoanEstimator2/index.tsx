"use client";

import { useState } from "react";
import { estimateDecliningBalanceLoan } from "@/lib/loanEstimate";
import { formatCurrencyVnd } from "@/lib/format";

// A friendly starting point, immediately editable — never presented as a
// specific bank's real quoted rate (projects have no CMS-backed financing
// data, so nothing here is fabricated, only a calculator default).
const DEFAULT_RATE_PERCENT = 8;

function formatVndInput(n: number): string {
  return n > 0 ? new Intl.NumberFormat("vi-VN").format(n) : "";
}

function parseVndInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

const inputClass =
  "mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-2 text-[13px] text-[#0C0D0D] outline-none transition-colors duration-fast ease-base focus:border-[#880206]";
const labelClass = "text-[12px] font-semibold text-[#0C0D0D]";

/**
 * Self-contained financing estimator — pure client-side arithmetic, no
 * project data dependency (ProjectListing has no price field), so there is
 * nothing here that could misrepresent a specific project's real numbers.
 * Every input is user-typed; the result is clearly labelled as an estimate.
 *
 * Deliberately a small auxiliary widget, not a full-width feature section —
 * capped at max-w-md and kept single-column at every breakpoint (no
 * min-[900px]/wide upscaling) so it reads as a supplementary tool sitting
 * inside the page, not a section competing with the project's own content.
 */
export function LoanEstimator2() {
  const [propertyValue, setPropertyValue] = useState(0);
  const [loanRatio, setLoanRatio] = useState(50);
  const [termYears, setTermYears] = useState(20);
  const [rate, setRate] = useState(DEFAULT_RATE_PERCENT);

  const result = estimateDecliningBalanceLoan({
    propertyValue,
    loanRatioPercent: loanRatio,
    termYears,
    annualRatePercent: rate,
  });

  return (
    <div className="max-w-md rounded-lg border border-[#EDEBEA] p-3">
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className={labelClass}>Giá trị nhà đất</span>
          <div className="relative mt-1">
            <input
              type="text"
              inputMode="numeric"
              value={formatVndInput(propertyValue)}
              onChange={(e) => setPropertyValue(parseVndInput(e.target.value))}
              placeholder="VD: 3.000.000.000"
              aria-label="Giá trị nhà đất"
              className={`${inputClass} pr-8`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">đ</span>
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Tỉ lệ vay</span>
            <div className="relative mt-1">
              <input
                type="number"
                min={0}
                max={100}
                value={loanRatio}
                onChange={(e) => setLoanRatio(Math.min(100, Math.max(0, Number(e.target.value))))}
                aria-label="Tỉ lệ vay phần trăm"
                className={`${inputClass} pr-8`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">%</span>
            </div>
          </label>
          <label className="block">
            <span className={labelClass}>Thời hạn vay</span>
            <div className="relative mt-1">
              <input
                type="number"
                min={1}
                max={35}
                value={termYears}
                onChange={(e) => setTermYears(Math.max(1, Number(e.target.value)))}
                aria-label="Thời hạn vay theo năm"
                className={`${inputClass} pr-12`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">năm</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Lãi suất tham khảo</span>
            <div className="relative mt-1">
              <input
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                aria-label="Lãi suất tham khảo phần trăm mỗi năm"
                className={`${inputClass} pr-12`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">%/năm</span>
            </div>
          </label>
          <label className="block">
            <span className={labelClass}>Số tiền vay</span>
            <p className="mt-1 flex h-[36px] items-center rounded-md border border-[#EDEBEA] bg-[#F7F6F6] px-3 text-[13px] font-semibold text-[#0C0D0D]">
              {result ? formatCurrencyVnd(result.loanAmount) : "—"}
            </p>
          </label>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-[#F7F6F6] p-3">
        {result ? (
          <>
            <p className="text-[11px] text-[#5F5D5D]">Tổng số tiền bạn cần trả</p>
            <p className="mt-1 text-[18px] font-extrabold text-[#0C0D0D]">{formatCurrencyVnd(result.totalRepayment)}</p>

            <div className="mt-2 flex h-1 overflow-hidden rounded-full">
              <div className="bg-[#23825C]" style={{ width: `${result.ownCapitalPercent}%` }} />
              <div className="bg-[#880206]" style={{ width: `${result.principalPercent}%` }} />
              <div className="bg-[#C08E47]" style={{ width: `${result.interestPercent}%` }} />
            </div>

            <ul className="mt-2 flex flex-col gap-1">
              <li className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-[#3A3838]">
                  <span className="h-2 w-2 rounded-full bg-[#23825C]" /> Vốn tự có
                </span>
                <span className="font-semibold text-[#0C0D0D]">{formatCurrencyVnd(result.ownCapital)}</span>
              </li>
              <li className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-[#3A3838]">
                  <span className="h-2 w-2 rounded-full bg-[#880206]" /> Gốc cần trả
                </span>
                <span className="font-semibold text-[#0C0D0D]">{formatCurrencyVnd(result.loanAmount)}</span>
              </li>
              <li className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-[#3A3838]">
                  <span className="h-2 w-2 rounded-full bg-[#C08E47]" /> Lãi cần trả
                </span>
                <span className="font-semibold text-[#0C0D0D]">{formatCurrencyVnd(result.totalInterest)}</span>
              </li>
            </ul>

            <div className="mt-2 border-t border-[#E4E1E0] pt-2">
              <p className="flex items-center justify-between text-[12px] font-bold">
                <span className="text-[#0C0D0D]">Thanh toán tháng đầu</span>
                <span className="text-[#880206]">{formatCurrencyVnd(result.firstMonthPayment)}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="py-3 text-center text-[11px] text-[#5F5D5D]">Nhập giá trị nhà đất để xem ước tính khoản vay.</p>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-[#A6A6A6]">
        Kết quả tính theo phương pháp dư nợ giảm dần, chỉ dùng để tham khảo — không phải báo giá chính thức từ
        ngân hàng. Liên hệ NDTHICH để được tư vấn phương án tài chính cụ thể.
      </p>
    </div>
  );
}
