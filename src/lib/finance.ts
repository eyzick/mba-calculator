/**
 * Reusable time-value-of-money helpers. All rates are periodic decimals
 * (e.g. 0.01 = 1% per period) unless noted, and `n` is a number of periods.
 */

/** Present value of a single future lump sum: PV = FV / (1 + r)^n. */
export function presentValue(fv: number, r: number, n: number): number {
  return fv / Math.pow(1 + r, n)
}

/** Future value of a single present lump sum: FV = PV (1 + r)^n. */
export function futureValue(pv: number, r: number, n: number): number {
  return pv * Math.pow(1 + r, n)
}

/**
 * Present value of a level annuity.
 * Ordinary (end-of-period): PV = PMT × [1 − (1 + r)^−n] / r.
 * Annuity-due multiplies by (1 + r).
 */
export function annuityPV(pmt: number, r: number, n: number, due = false): number {
  if (r === 0) return pmt * n * (due ? 1 : 1)
  const base = (pmt * (1 - Math.pow(1 + r, -n))) / r
  return due ? base * (1 + r) : base
}

/**
 * Future value of a level annuity.
 * Ordinary: FV = PMT × [(1 + r)^n − 1] / r. Annuity-due multiplies by (1 + r).
 */
export function annuityFV(pmt: number, r: number, n: number, due = false): number {
  if (r === 0) return pmt * n
  const base = (pmt * (Math.pow(1 + r, n) - 1)) / r
  return due ? base * (1 + r) : base
}

/** Level payment that amortizes a present value over n periods (loan PMT). */
export function payment(pv: number, r: number, n: number, due = false): number {
  if (n === 0) return NaN
  if (r === 0) return pv / n
  const base = (pv * r) / (1 - Math.pow(1 + r, -n))
  return due ? base / (1 + r) : base
}

/** Present value of a level perpetuity: PV = C / r. */
export function perpetuityPV(c: number, r: number): number {
  return c / r
}

/** Present value of a growing perpetuity: PV = C / (r − g). */
export function growingPerpetuityPV(c: number, r: number, g: number): number {
  return c / (r - g)
}

/**
 * Net present value of a cash-flow stream. `cashFlows[0]` is t = 0 (typically
 * the negative initial outlay); subsequent entries are t = 1, 2, …
 */
export function npv(r: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0)
}

/** Effective annual rate from an APR compounded m times per year. */
export function effectiveAnnualRate(apr: number, m: number): number {
  if (m <= 0) return NaN
  return Math.pow(1 + apr / m, m) - 1
}

/** Continuous-compounding effective annual rate: e^apr − 1. */
export function effectiveAnnualRateContinuous(apr: number): number {
  return Math.exp(apr) - 1
}

/** Compound annual growth rate from a beginning and ending value over n years. */
export function cagr(begin: number, end: number, n: number): number {
  if (begin <= 0 || n <= 0) return NaN
  return Math.pow(end / begin, 1 / n) - 1
}
