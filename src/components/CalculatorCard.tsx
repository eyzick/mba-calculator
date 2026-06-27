import { useAssumptions } from '../state/AssumptionsContext'
import type { Calculator } from '../lib/types'

export function CalculatorCard({ calculator }: { calculator: Calculator }) {
  const { assumptions } = useAssumptions()
  const sections = calculator.compute(assumptions)

  return (
    <article className="card">
      <header className="card__header">
        <h3 className="card__title">{calculator.title}</h3>
        <code className="card__formula">{calculator.formula}</code>
        {calculator.description ? <p className="card__desc">{calculator.description}</p> : null}
      </header>

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

      {calculator.extra ? <div className="card__extra">{calculator.extra(assumptions)}</div> : null}
    </article>
  )
}
