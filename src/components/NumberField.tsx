import { useEffect, useState } from 'react'
import { fromDisplay, toDisplay } from '../lib/format'
import type { FieldFormat } from '../lib/types'

interface NumberFieldProps {
  label: string
  value: number
  format: FieldFormat
  step?: number
  hint?: string
  onChange: (value: number) => void
}

const suffixFor: Record<FieldFormat, string> = {
  currency: '$',
  millions: '$M',
  percent: '%',
  number: '',
}

/**
 * Controlled numeric input that edits in "display units" (e.g. percent shows
 * 10 for 0.10) but reports changes in the stored units. Keeps a local string
 * so the user can type freely (including transient empty / partial values).
 */
export function NumberField({ label, value, format, step, hint, onChange }: NumberFieldProps) {
  const [draft, setDraft] = useState(() => toDisplay(value, format))

  // Re-sync when the value changes externally (e.g. reset to base case).
  useEffect(() => {
    setDraft(toDisplay(value, format))
  }, [value, format])

  const commit = (raw: string) => {
    const parsed = fromDisplay(raw, format)
    if (Number.isFinite(parsed)) onChange(parsed)
  }

  const suffix = suffixFor[format]

  return (
    <label className="field">
      <span className="field__label">
        {label}
        {hint ? <span className="field__hint">{hint}</span> : null}
      </span>
      <span className="field__control">
        <input
          className="field__input"
          type="number"
          inputMode="decimal"
          value={draft}
          step={step ?? 'any'}
          onChange={(e) => {
            setDraft(e.target.value)
            commit(e.target.value)
          }}
          onBlur={() => setDraft(toDisplay(value, format))}
        />
        {suffix ? <span className="field__suffix">{suffix}</span> : null}
      </span>
    </label>
  )
}
