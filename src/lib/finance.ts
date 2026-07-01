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

/**
 * Solve for the periodic interest rate implied by a loan: given a present
 * value (amount borrowed), a level payment, and the number of payments, find
 * the rate `r` such that PV = PMT × [1 − (1 + r)⁻ⁿ] / r.
 *
 * There is no closed form, so this uses bisection (robust and monotonic since
 * the payment strictly increases in r). Returns the rate per period, or NaN if
 * the inputs are infeasible.
 */
export function rateFromPayment(pv: number, pmt: number, n: number): number {
  if (pv <= 0 || pmt <= 0 || n <= 0) return NaN

  // payment(pv, r, n) as a function of r, with the r → 0 limit handled.
  const paymentAt = (r: number) => (Math.abs(r) < 1e-12 ? pv / n : (pv * r) / (1 - Math.pow(1 + r, -n)))
  const f = (r: number) => paymentAt(r) - pmt

  let lo = -0.999999 // rate can't be ≤ −100% per period
  let hi = 1 // 100% per period upper bound, expanded below if needed

  if (f(lo) > 0) return NaN // payment too small to be feasible

  let fhi = f(hi)
  let guard = 0
  while (fhi < 0 && hi < 1e9 && guard++ < 200) {
    hi *= 2
    fhi = f(hi)
  }
  if (fhi < 0) return NaN // payment too large to be feasible

  let mid = 0
  for (let i = 0; i < 300; i++) {
    mid = (lo + hi) / 2
    const fm = f(mid)
    if (Math.abs(fm) < 1e-11) break
    if (fm < 0) lo = mid
    else hi = mid
  }
  return mid
}

export interface AmortizationRow {
  period: number
  payment: number
  interest: number
  principal: number
  balance: number
  cumulativeInterest: number
  cumulativePrincipal: number
}

/**
 * Build a full loan amortization schedule. `r` is the rate per period and `n`
 * the number of (integer) periods. The final period absorbs any rounding so
 * the ending balance is exactly zero.
 */
export function amortizationSchedule(principal: number, r: number, n: number): AmortizationRow[] {
  const periods = Math.max(0, Math.round(n))
  if (periods === 0 || principal <= 0) return []

  const pmt = payment(principal, r, periods)
  const rows: AmortizationRow[] = []
  let balance = principal
  let cumulativeInterest = 0
  let cumulativePrincipal = 0

  for (let p = 1; p <= periods; p++) {
    const interest = balance * r
    let principalPaid = pmt - interest
    if (p === periods) principalPaid = balance // clear any residual at the end
    balance = Math.max(0, balance - principalPaid)
    cumulativeInterest += interest
    cumulativePrincipal += principalPaid
    rows.push({
      period: p,
      payment: interest + principalPaid,
      interest,
      principal: principalPaid,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    })
  }
  return rows
}
