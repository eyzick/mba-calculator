import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAssumptions } from '../state/AssumptionsContext'
import type { CalcInputValues, Calculator } from '../lib/types'
import { NumberField } from './NumberField'

function storageKey(id: string) {
  return `mba617:calc:${id}`
}

function sizeKey(id: string) {
  return `mba617:size:${id}`
}

interface CardSize {
  w: number
  h: number
}

const MIN_W = 320
const MIN_H = 220

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

  // Drag-to-resize: when a size is set the card breaks out to its own
  // full-width row so it can grow freely.
  const cardRef = useRef<HTMLElement>(null)
  const [size, setSize] = useState<CardSize | null>(() => {
    try {
      const raw = localStorage.getItem(sizeKey(calculator.id))
      return raw ? (JSON.parse(raw) as CardSize) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (size) localStorage.setItem(sizeKey(calculator.id), JSON.stringify(size))
      else localStorage.removeItem(sizeKey(calculator.id))
    } catch {
      // ignore
    }
  }, [calculator.id, size])

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const maxW = el.parentElement?.getBoundingClientRect().width ?? window.innerWidth
    const startX = e.clientX
    const startY = e.clientY

    const onMove = (ev: PointerEvent) => {
      const w = Math.min(maxW, Math.max(MIN_W, rect.width + (ev.clientX - startX)))
      const h = Math.max(MIN_H, rect.height + (ev.clientY - startY))
      setSize({ w, h })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.classList.remove('resizing')
    }
    document.body.classList.add('resizing')
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  const sections = calculator.compute ? calculator.compute(assumptions, values) : []
  const headline = sections.flatMap((s) => s.rows).find((r) => r.emphasis)
  const Body = calculator.Body

  const sized = expanded && size != null
  const style = sized ? { width: size!.w, height: size!.h } : undefined

  return (
    <article
      ref={cardRef}
      className={`card${expanded ? ' card--open' : ''}${sized ? ' card--sized' : ''}`}
      style={style}
    >
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

      {Body ? <Body /> : null}
      {!Body && hasInputs ? (
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

      {sections.length > 0 ? (
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
      ) : null}

          {!Body && calculator.extra ? (
            <div className="card__extra">{calculator.extra(assumptions, values)}</div>
          ) : null}

          <div
            className="card__resize"
            onPointerDown={startResize}
            onDoubleClick={() => setSize(null)}
            title="Drag to resize · double-click to reset"
            role="separator"
            aria-label="Resize card"
          />
        </div>
      )}
    </article>
  )
}
