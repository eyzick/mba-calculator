import { useEffect, useMemo, useState } from 'react'
import { useAssumptions } from '../state/AssumptionsContext'
import type { CalcInputValues, Calculator } from '../lib/types'
import { NumberField } from './NumberField'

function storageKey(id: string) {
  return `mba617:calc:${id}`
}

function defaultsFor(calculator: Calculator): CalcInputValues {
  const out: CalcInputValues = {}
  for (const input of calculator.inputs ?? []) out[input.key] = input.default
  return out
}

interface CalculatorCardProps {
  calculator: Calculator
  expanded: boolean
  onToggle: () => void
}

export function CalculatorCard({ calculator, expanded, onToggle }: CalculatorCardProps) {
  const { assumptions } = useAssumptions()
  const defaults = useMemo(() => defaultsFor(calculator), [calculator])

  const [values, setValues] = useState<CalcInputValues>(() => {
    try {
      const raw = localStorage.getItem(storageKey(calculator.id))
      if (raw) return { ...defaults, ...(JSON.parse(raw) as CalcInputValues) }
    } catch {
      // ignore
    }
    return defaults
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(calculator.id), JSON.stringify(values))
    } catch {
      // ignore
    }
  }, [calculator.id, values])

  const hasInputs = (calculator.inputs?.length ?? 0) > 0
  const isDirty = useMemo(
    () => (calculator.inputs ?? []).some((i) => values[i.key] !== i.default),
    [calculator.inputs, values],
  )

  const sections = calculator.compute(assumptions, values)
  const headline = sections.flatMap((s) => s.rows).find((r) => r.emphasis)

  return (
    <article className={`card${expanded ? ' card--open' : ''}`}>
      <button
        type="button"
        className="card__header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="card__chevron" aria-hidden>
          ▸
        </span>
        <span className="card__heading">
          <span className="card__title">{calculator.title}</span>
          <code className="card__formula">{calculator.formula}</code>
        </span>
        {!expanded && headline ? <span className="card__preview">{headline.value}</span> : null}
      </button>

      {!expanded ? null : (
        <div className="card__body">
          {calculator.description ? <p className="card__desc">{calculator.description}</p> : null}

      {hasInputs ? (
        <div className="card__inputs">
          <div className="card__inputs-head">
            <span className="card__inputs-label">Inputs</span>
            <button
              className="btn btn--ghost"
              onClick={() => setValues(defaults)}
              disabled={!isDirty}
              title="Restore default inputs"
            >
              Reset
            </button>
          </div>
          {calculator.inputs!.map((input) => (
            <NumberField
              key={input.key}
              label={input.label}
              hint={input.hint}
              value={values[input.key]}
              format={input.format}
              step={input.step}
              onChange={(v) => setValues((prev) => ({ ...prev, [input.key]: v }))}
            />
          ))}
        </div>
      ) : null}

      <div className="card__results">
        {sections.map((section, si) => (
          <div key={si} className="result-section">
            {section.heading ? <p className="result-section__heading">{section.heading}</p> : null}
            {section.rows.map((row, ri) => (
              <div key={ri} className={`result-row${row.emphasis ? ' result-row--emphasis' : ''}`}>
                <div className="result-row__main">
                  <span className="result-row__label">{row.label}</span>
                  <span className="result-row__value">{row.value}</span>
                </div>
                {row.note ? <span className="result-row__note">{row.note}</span> : null}
              </div>
            ))}
          </div>
        ))}
      </div>

          {calculator.extra ? (
            <div className="card__extra">{calculator.extra(assumptions, values)}</div>
          ) : null}
        </div>
      )}
    </article>
  )
}
