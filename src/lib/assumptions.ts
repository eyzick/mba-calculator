import type { Assumptions, FieldGroup } from './types'

/** Base-case planning data — Exhibit 1. */
export const BASE_CASE: Assumptions = {
  // Capital structure / equity
  sharesOutstanding: 40, // million shares
  currentSharePrice: 12.0,
  capitalRequired: 50, // $M

  // Existing bond
  existingBondPar: 1000,
  existingBondCoupon: 0.06,
  existingBondYears: 5,
  existingBondPrice: 958.42,
  existingBondFreq: 2,

  // New bond ($50M, 5y, semiannual, issued at par)
  newBondAmount: 50,
  newBondYears: 5,
  newBondFreq: 2,

  // Blue Ridge Bank loan ($50M, 5y, monthly, 7.18% APR comp. monthly)
  blueRidgeAmount: 50,
  blueRidgeYears: 5,
  blueRidgeApr: 0.0718,
  blueRidgePeriodsPerYear: 12,

  // Tidewater National Bank loan ($50M, 5y, monthly installments,
  // 7.20% APR compounded daily, 252-day year)
  tidewaterAmount: 50,
  tidewaterYears: 5,
  tidewaterApr: 0.072,
  tidewaterCompoundingPerYear: 252,
  tidewaterPaymentsPerYear: 12,

  // New equity
  newEquityPrice: 12.0,

  // Valuation
  requiredReturn: 0.1,
  growth: 0.04,
  fcfGood: 60, // $M
  fcfBad: 6, // $M
  probGood: 0.5,
  probBad: 0.5,
}

/**
 * Metadata describing how each assumption is grouped, labelled, and edited.
 * The assumptions panel renders generically from this, so adding inputs is
 * just a matter of extending the `Assumptions` type and this list.
 */
export const FIELD_GROUPS: FieldGroup[] = [
  {
    id: 'equity',
    title: 'Capital structure & equity',
    fields: [
      { key: 'sharesOutstanding', label: 'Shares outstanding', format: 'number', step: 1, hint: 'millions of shares' },
      { key: 'currentSharePrice', label: 'Current share price', format: 'currency', step: 0.25 },
      { key: 'capitalRequired', label: 'Capital required', format: 'millions', step: 1 },
      { key: 'newEquityPrice', label: 'New equity issue price', format: 'currency', step: 0.25 },
    ],
  },
  {
    id: 'valuation',
    title: 'Valuation (growing perpetuity)',
    fields: [
      { key: 'requiredReturn', label: 'Required return (r)', format: 'percent', step: 0.25 },
      { key: 'growth', label: 'Long-run growth (g)', format: 'percent', step: 0.25 },
      { key: 'fcfGood', label: 'FCFnext — good state', format: 'millions', step: 1 },
      { key: 'fcfBad', label: 'FCFnext — bad state', format: 'millions', step: 1 },
      { key: 'probGood', label: 'Probability — good', format: 'percent', step: 5 },
      { key: 'probBad', label: 'Probability — bad', format: 'percent', step: 5 },
    ],
  },
  {
    id: 'existingBond',
    title: 'Existing bond',
    fields: [
      { key: 'existingBondPar', label: 'Par value', format: 'currency', step: 100 },
      { key: 'existingBondCoupon', label: 'Coupon rate (annual)', format: 'percent', step: 0.25 },
      { key: 'existingBondYears', label: 'Years to maturity', format: 'number', step: 1 },
      { key: 'existingBondPrice', label: 'Current price', format: 'currency', step: 1 },
      { key: 'existingBondFreq', label: 'Coupons per year', format: 'number', step: 1 },
    ],
  },
  {
    id: 'newBond',
    title: 'New bond',
    fields: [
      { key: 'newBondAmount', label: 'Amount raised', format: 'millions', step: 1 },
      { key: 'newBondYears', label: 'Term (years)', format: 'number', step: 1 },
      { key: 'newBondFreq', label: 'Coupons per year', format: 'number', step: 1 },
    ],
  },
  {
    id: 'blueRidge',
    title: 'Bank loan — Blue Ridge',
    fields: [
      { key: 'blueRidgeAmount', label: 'Loan amount', format: 'millions', step: 1 },
      { key: 'blueRidgeYears', label: 'Term (years)', format: 'number', step: 1 },
      { key: 'blueRidgeApr', label: 'APR', format: 'percent', step: 0.05 },
      { key: 'blueRidgePeriodsPerYear', label: 'Periods per year', format: 'number', step: 1, hint: 'compounded monthly = 12' },
    ],
  },
  {
    id: 'tidewater',
    title: 'Bank loan — Tidewater',
    fields: [
      { key: 'tidewaterAmount', label: 'Loan amount', format: 'millions', step: 1 },
      { key: 'tidewaterYears', label: 'Term (years)', format: 'number', step: 1 },
      { key: 'tidewaterApr', label: 'APR', format: 'percent', step: 0.05 },
      { key: 'tidewaterCompoundingPerYear', label: 'Compounding per year', format: 'number', step: 1, hint: 'daily, 252-day year' },
      { key: 'tidewaterPaymentsPerYear', label: 'Payments per year', format: 'number', step: 1 },
    ],
  },
]
