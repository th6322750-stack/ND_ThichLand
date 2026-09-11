export interface LoanEstimateInput {
  propertyValue: number; // VND
  loanRatioPercent: number; // 0-100
  termYears: number;
  annualRatePercent: number;
}

export interface LoanEstimateResult {
  loanAmount: number;
  ownCapital: number;
  totalInterest: number;
  totalRepayment: number;
  firstMonthPayment: number;
  ownCapitalPercent: number;
  principalPercent: number;
  interestPercent: number;
}

/**
 * Declining-balance ("dư nợ giảm dần") amortization — the standard Vietnamese
 * bank repayment method: principal is repaid in equal monthly installments,
 * interest is charged on the remaining balance each month (so it shrinks
 * every month rather than staying flat).
 *
 * Closed-form rather than a month-by-month loop: with constant monthly
 * principal P/n, the remaining balance before month k is P - (k-1)*(P/n),
 * so total interest sums to a triangular-number series —
 * `rate * (n*loanAmount - monthlyPrincipal * n*(n-1)/2)`.
 *
 * For never-fabricate reasons this is presentational-tool math only, not a
 * real bank quote: the default annual rate is an editable placeholder, never
 * claimed to be a specific bank's actual rate.
 */
export function estimateDecliningBalanceLoan(input: LoanEstimateInput): LoanEstimateResult | null {
  const { propertyValue, loanRatioPercent, termYears, annualRatePercent } = input;
  if (!(propertyValue > 0)) return null;
  if (loanRatioPercent < 0 || loanRatioPercent > 100) return null;
  if (!(termYears > 0) || annualRatePercent < 0) return null;

  const loanAmount = propertyValue * (loanRatioPercent / 100);
  const ownCapital = propertyValue - loanAmount;
  const months = Math.round(termYears * 12);
  if (months <= 0) return null;

  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPrincipal = loanAmount / months;
  const totalInterest = monthlyRate * (months * loanAmount - (monthlyPrincipal * (months * (months - 1))) / 2);
  const firstMonthInterest = loanAmount * monthlyRate;
  const firstMonthPayment = monthlyPrincipal + firstMonthInterest;
  const totalRepayment = ownCapital + loanAmount + totalInterest;

  const pct = (v: number) => (totalRepayment > 0 ? (v / totalRepayment) * 100 : 0);

  return {
    loanAmount,
    ownCapital,
    totalInterest,
    totalRepayment,
    firstMonthPayment,
    ownCapitalPercent: pct(ownCapital),
    principalPercent: pct(loanAmount),
    interestPercent: pct(totalInterest),
  };
}
