import { describe, it, expect } from "vitest";
import { estimateDecliningBalanceLoan } from "@/lib/loanEstimate";

describe("estimateDecliningBalanceLoan", () => {
  // Verified against a real published example (batdongsan.com.vn "Ước tính
  // khoản vay" widget, checked 2026-08-17): 3 tỷ property, 50% loan ratio,
  // 5 years, 6%/year -> "Lãi cần trả" 228.750.000đ, "Thanh toán tháng đầu"
  // 32.500.000đ, total ~3.23 tỷ. This locks the formula against a
  // known-correct external reference, not just internal consistency.
  it("matches the published reference example exactly", () => {
    const result = estimateDecliningBalanceLoan({
      propertyValue: 3_000_000_000,
      loanRatioPercent: 50,
      termYears: 5,
      annualRatePercent: 6,
    });
    expect(result).not.toBeNull();
    expect(result!.loanAmount).toBe(1_500_000_000);
    expect(result!.ownCapital).toBe(1_500_000_000);
    expect(Math.round(result!.totalInterest)).toBe(228_750_000);
    expect(Math.round(result!.firstMonthPayment)).toBe(32_500_000);
    expect(Math.round(result!.totalRepayment / 1_000_000)).toBe(3_229); // ~3.23 tỷ
  });

  it("returns null for invalid or incomplete input instead of a fabricated number", () => {
    expect(estimateDecliningBalanceLoan({ propertyValue: 0, loanRatioPercent: 50, termYears: 20, annualRatePercent: 8 })).toBeNull();
    expect(estimateDecliningBalanceLoan({ propertyValue: 1_000_000_000, loanRatioPercent: -5, termYears: 20, annualRatePercent: 8 })).toBeNull();
    expect(estimateDecliningBalanceLoan({ propertyValue: 1_000_000_000, loanRatioPercent: 150, termYears: 20, annualRatePercent: 8 })).toBeNull();
    expect(estimateDecliningBalanceLoan({ propertyValue: 1_000_000_000, loanRatioPercent: 50, termYears: 0, annualRatePercent: 8 })).toBeNull();
  });

  it("a 0% loan ratio means no loan — full price is own capital, zero interest", () => {
    const result = estimateDecliningBalanceLoan({
      propertyValue: 2_000_000_000,
      loanRatioPercent: 0,
      termYears: 20,
      annualRatePercent: 8,
    });
    expect(result!.loanAmount).toBe(0);
    expect(result!.ownCapital).toBe(2_000_000_000);
    expect(result!.totalInterest).toBe(0);
    expect(result!.totalRepayment).toBe(2_000_000_000);
  });

  it("percentages always sum to ~100", () => {
    const result = estimateDecliningBalanceLoan({
      propertyValue: 5_000_000_000,
      loanRatioPercent: 70,
      termYears: 15,
      annualRatePercent: 9.5,
    });
    const sum = result!.ownCapitalPercent + result!.principalPercent + result!.interestPercent;
    expect(sum).toBeCloseTo(100, 5);
  });
});
