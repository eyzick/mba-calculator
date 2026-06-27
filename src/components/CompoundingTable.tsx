import { effectiveAnnualRate, futureValue } from '../lib/finance'
import { money, percent } from '../lib/format'

const FREQUENCIES = [
  { label: 'Annual', m: 1 },
  { label: 'Semiannual', m: 2 },
  { label: 'Quarterly', m: 4 },
  { label: 'Monthly', m: 12 },
  { label: 'Weekly', m: 52 },
  { label: 'Daily', m: 365 },
]

interface CompoundingTableProps {
  /** Nominal annual rate (decimal). */
  r: number
  /** Currently selected compounding frequency (to highlight the row). */
  m?: number
  /** If provided, also show the grown value of this principal over `t` years. */
  principal?: number
  t?: number
}

/**
 * A collapsible table comparing effective annual yields (APY) across
 * compounding frequencies for a given nominal annual rate. Uses a native
 * <details> disclosure so it carries its own show/hide state.
 */
export function CompoundingTable({ r, m, principal, t }: CompoundingTableProps) {
  const showValue = principal != null && t != null
  return (
    <details className="compound">
      <summary className="compound__summary">Compare compounding frequencies (APY)</summary>
      <div className="compound__scroll">
        <table className="compound__table">
          <thead>
            <tr>
              <th>Frequency</th>
              <th>m</th>
              <th>Periodic rate</th>
              <th>APY</th>
              {showValue ? <th>Value</th> : null}
            </tr>
          </thead>
          <tbody>
            {FREQUENCIES.map((f) => (
              <tr key={f.m} className={m === f.m ? 'compound__row--active' : ''}>
                <td>{f.label}</td>
                <td>{f.m}</td>
                <td>{percent(r / f.m, 4)}</td>
                <td>{percent(effectiveAnnualRate(r, f.m), 4)}</td>
                {showValue ? <td>{money(futureValue(principal!, r / f.m, f.m * t!))}</td> : null}
              </tr>
            ))}
            <tr className={m === 0 ? 'compound__row--active' : ''}>
              <td>Continuous</td>
              <td>∞</td>
              <td>—</td>
              <td>{percent(Math.exp(r) - 1, 4)}</td>
              {showValue ? <td>{money(principal! * Math.exp(r * t!))}</td> : null}
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  )
}
