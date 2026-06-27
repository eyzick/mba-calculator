import { useMemo } from 'react'
import { amortizationSchedule } from '../lib/finance'
import { money } from '../lib/format'

interface AmortizationProps {
  principal: number
  /** Rate per period (decimal). */
  r: number
  /** Number of periods. */
  n: number
}

const compactUSD = (value: number) =>
  Intl.NumberFormat('en-US', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(value)

// SVG chart geometry.
const W = 640
const H = 220
const PAD = { l: 52, r: 14, t: 14, b: 28 }
const plotW = W - PAD.l - PAD.r
const plotH = H - PAD.t - PAD.b

function PayoffChart({ principal, schedule }: { principal: number; schedule: ReturnType<typeof amortizationSchedule> }) {
  const periods = schedule.length
  const totalInterest = schedule[periods - 1]?.cumulativeInterest ?? 0
  const yMax = Math.max(principal, totalInterest) || 1

  const x = (p: number) => PAD.l + (p / periods) * plotW
  const y = (v: number) => PAD.t + (1 - v / yMax) * plotH
  const yBottom = PAD.t + plotH

  // Series include the t = 0 starting point.
  const balancePts = [[0, principal], ...schedule.map((row) => [row.period, row.balance])]
  const interestPts = [[0, 0], ...schedule.map((row) => [row.period, row.cumulativeInterest])]

  const toLine = (pts: number[][]) => pts.map(([p, v]) => `${x(p).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const areaPath = [
    `M ${x(0).toFixed(1)},${yBottom.toFixed(1)}`,
    ...balancePts.map(([p, v]) => `L ${x(p).toFixed(1)},${y(v).toFixed(1)}`),
    `L ${x(periods).toFixed(1)},${yBottom.toFixed(1)}`,
    'Z',
  ].join(' ')

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Loan payoff chart">
      {/* gridlines + y labels */}
      {[0, 0.5, 1].map((f) => {
        const gy = PAD.t + (1 - f) * plotH
        return (
          <g key={f}>
            <line className="chart__grid" x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy} />
            <text className="chart__ylabel" x={PAD.l - 8} y={gy + 3} textAnchor="end">
              {compactUSD(yMax * f)}
            </text>
          </g>
        )
      })}

      {/* balance area + line */}
      <path className="chart__area" d={areaPath} />
      <polyline className="chart__balance" points={toLine(balancePts)} />

      {/* cumulative interest line */}
      <polyline className="chart__interest" points={toLine(interestPts)} />

      {/* x labels */}
      <text className="chart__xlabel" x={PAD.l} y={H - 8} textAnchor="start">
        0
      </text>
      <text className="chart__xlabel" x={W - PAD.r} y={H - 8} textAnchor="end">
        {periods} periods
      </text>
    </svg>
  )
}

export function AmortizationTable({ principal, r, n }: AmortizationProps) {
  const schedule = useMemo(() => amortizationSchedule(principal, r, n), [principal, r, n])

  if (schedule.length === 0) {
    return <p className="amort__empty">Enter a positive principal and number of periods to build a schedule.</p>
  }

  const last = schedule[schedule.length - 1]
  const totalPaid = last.cumulativePrincipal + last.cumulativeInterest

  return (
    <div className="amort">
      <div className="chart__legend">
        <span className="chart__legend-item">
          <span className="chart__swatch chart__swatch--balance" /> Remaining balance
        </span>
        <span className="chart__legend-item">
          <span className="chart__swatch chart__swatch--interest" /> Cumulative interest
        </span>
      </div>

      <PayoffChart principal={principal} schedule={schedule} />

      <div className="amort__summary">
        <span>
          Total paid <strong>{money(totalPaid)}</strong>
        </span>
        <span>
          Total interest <strong>{money(last.cumulativeInterest)}</strong>
        </span>
      </div>

      <details className="compound">
        <summary className="compound__summary">Amortization schedule ({schedule.length} periods)</summary>
        <div className="amort__scroll">
          <table className="compound__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Payment</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{money(row.payment)}</td>
                  <td>{money(row.interest)}</td>
                  <td>{money(row.principal)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
