/**
 * Single source of truth for Dubai purchase-cost assumptions and the mortgage
 * math shared by the calculator, the ROI projection, and the printable report.
 */
export const DUBAI_BUY_COSTS = {
  dldTransfer: 0.04, // 4% of price
  agency: 0.02, // 2% of price
  agencyVat: 0.05, // 5% VAT on the agency fee
  mortgageReg: 0.0025, // 0.25% of loan amount
} as const;

/** Fraction of price added as one-off buying costs (DLD + agency), excl. VAT/registration. */
export const BUY_COSTS = DUBAI_BUY_COSTS.dldTransfer + DUBAI_BUY_COSTS.agency; // 0.06

export function formatAed(n: number, round = true): string {
  return `AED ${(round ? Math.round(n) : n).toLocaleString()}`;
}

/** Standard amortized monthly repayment; safe for 0% rate and guards term ≤ 0. */
export function monthlyMortgage(loan: number, annualRatePct: number, termYears: number): number {
  const n = termYears * 12;
  if (n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  return r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export interface MortgageBreakdown {
  down: number;
  loan: number;
  ltv: number;
  monthly: number;
  dldFee: number;
  agency: number;
  mortgageReg: number;
  cashToClose: number;
  totalInterest: number;
}

export function mortgageBreakdown(
  price: number,
  downPct: number,
  annualRatePct: number,
  termYears: number
): MortgageBreakdown {
  const down = price * (downPct / 100);
  const loan = Math.max(0, price - down);
  const ltv = price > 0 ? (loan / price) * 100 : 0;
  const monthly = monthlyMortgage(loan, annualRatePct, termYears);
  const dldFee = price * DUBAI_BUY_COSTS.dldTransfer;
  const agency = price * DUBAI_BUY_COSTS.agency * (1 + DUBAI_BUY_COSTS.agencyVat);
  const mortgageReg = loan * DUBAI_BUY_COSTS.mortgageReg;
  const cashToClose = down + dldFee + agency + mortgageReg;
  const totalInterest = Math.max(0, monthly * termYears * 12 - loan);
  return { down, loan, ltv, monthly, dldFee, agency, mortgageReg, cashToClose, totalInterest };
}
