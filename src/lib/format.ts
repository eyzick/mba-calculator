import type { FieldFormat } from './types'

/** Format a plain dollar amount with two decimals, e.g. 958.4 -> "$958.40". */
export function money(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/** Format a value expressed in $millions, e.g. 550 -> "$550.00M". */
export function millions(valueInMillions: number, fractionDigits = 2): string {
  if (!Number.isFinite(valueInMillions)) return '—'
  const sign = valueInMillions < 0 ? '-' : ''
  const abs = Math.abs(valueInMillions)
  return `${sign}$${abs.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}M`
}

/** Format a decimal rate as a percent, e.g. 0.1 -> "10.00%". */
export function percent(rate: number, fractionDigits = 2): string {
  if (!Number.isFinite(rate)) return '—'
  return `${(rate * 100).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`
}

/** Plain number with thousands separators. */
export function number(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })
}

/** Format a stored value for display in an assumptions input field. */
export function toDisplay(value: number, format: FieldFormat): string {
  if (format === 'percent') return String(+(value * 100).toFixed(6))
  return String(value)
}

/** Parse what the user typed in an assumptions input back into a stored value. */
export function fromDisplay(raw: string, format: FieldFormat): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return NaN
  if (format === 'percent') return parsed / 100
  return parsed
}
