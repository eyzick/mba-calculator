import type { ComponentType, ReactNode } from 'react'

/**
 * The full set of base-case planning inputs (Exhibit 1).
 *
 * Monetary figures that the case quotes "in millions" are stored in millions
 * (e.g. capitalRequired = 50 means $50M). Per-bond figures (par, price) are in
 * dollars. Rates are stored as decimals (0.10 = 10%).
 */
export interface Assumptions {
  // --- Capital structure / equity ---
  sharesOutstanding: number // millions of shares
  currentSharePrice: number // $ per share
  capitalRequired: number // $ millions

  // --- Existing bond ---
  existingBondPar: number // $ per bond
  existingBondCoupon: number // annual coupon rate (decimal)
  existingBondYears: number // years to maturity
  existingBondPrice: number // current market price ($)
  existingBondFreq: number // coupon payments per year

  // --- New bond ---
  newBondAmount: number // $ millions raised
  newBondYears: number
  newBondFreq: number // coupon payments per year

  // --- Bank loan: Blue Ridge (compounded monthly) ---
  blueRidgeAmount: number // $ millions
  blueRidgeYears: number
  blueRidgeApr: number // APR (decimal)
  blueRidgePeriodsPerYear: number // compounding periods / payments per year

  // --- Bank loan: Tidewater (compounded daily, 252-day year) ---
  tidewaterAmount: number // $ millions
  tidewaterYears: number
  tidewaterApr: number // APR (decimal)
  tidewaterCompoundingPerYear: number // 252
  tidewaterPaymentsPerYear: number // 12 monthly installments

  // --- New equity ---
  newEquityPrice: number // $ per share

  // --- Valuation (growing perpetuity) ---
  requiredReturn: number // r (decimal)
  growth: number // g (decimal)
  fcfGood: number // $ millions, good state
  fcfBad: number // $ millions, bad state
  probGood: number // probability of good state (decimal)
  probBad: number // probability of bad state (decimal)
}

export type AssumptionKey = keyof Assumptions

/** How a given field should be displayed/edited in the assumptions panel. */
export type FieldFormat = 'currency' | 'millions' | 'percent' | 'number'

export interface FieldMeta {
  key: AssumptionKey
  label: string
  format: FieldFormat
  step?: number
  hint?: string
}

export interface FieldGroup {
  id: string
  title: string
  fields: FieldMeta[]
}

/**
 * A self-contained input owned by a single calculator (not part of Exhibit 1).
 * Used for generic tools like PV/FV where the inputs are standalone.
 */
export interface CalcInput {
  key: string
  label: string
  format: FieldFormat
  default: number
  step?: number
  hint?: string
}

/** Runtime values for a calculator's local inputs, keyed by `CalcInput.key`. */
export type CalcInputValues = Record<string, number>

/** A single labelled output produced by a calculator. */
export interface ResultRow {
  label: string
  value: string
  /** Render this row prominently (the headline answer). */
  emphasis?: boolean
  note?: string
}

/** Calculators can group their outputs (e.g. "Good state" / "Bad state"). */
export interface ResultSection {
  heading?: string
  rows: ResultRow[]
}

/**
 * The contract every formula module implements. Add a new formula by creating
 * a module that exports one of these and registering it in the registry.
 */
export interface Calculator {
  /** Stable unique id. */
  id: string
  /** Human-readable title shown on the card. */
  title: string
  /** Which case / topic this belongs to (used to group cards). */
  caseGroup: string
  /** The formula, written for display (plain text, e.g. "V = FCFnext / (r − g)"). */
  formula: string
  /** Optional longer explanation shown under the formula. */
  description?: string
  /** Assumption keys this calculator depends on (drives highlighting). */
  usedKeys?: AssumptionKey[]
  /** Self-contained inputs this calculator edits locally (e.g. PV/FV tools). */
  inputs?: CalcInput[]
  /**
   * Pure function: shared assumptions + this calculator's local input values in,
   * result sections out. Optional when the calculator provides its own `Body`.
   */
  compute?: (a: Assumptions, inputs: CalcInputValues) => ResultSection[]
  /** Optional custom UI rendered below the standard results. */
  extra?: (a: Assumptions, inputs: CalcInputValues) => ReactNode
  /**
   * Optional fully-custom body component. When set, it replaces the standard
   * inputs/results UI entirely (the calculator manages its own state).
   */
  Body?: ComponentType
}
