import { useEffect, useMemo, useState } from 'react'
import { tvmSolve, type TvmVar } from '../lib/finance'
import { money, number as fmtNumber, percent } from '../lib/format'
import type { FieldFormat } from '../lib/types'
import { NumberField } from './NumberField'

const STORAGE = 'mba617:tvm-solver'

interface SolverState {
  n: number
  rate: number // annual nominal, decimal
  pv: number
  pmt: number
  fv: number
  m: number // periods per year
  begin: boolean
  unknown: TvmVar
}

const DEFAULT: SolverState = {
  n: 60,
  rate: 0.09147,
  pv: 32500,
  pmt: -676.96,
  fv: 0,
  m: 12,
  begin: false,
  unknown: 'rate',
}

const FIELDS: { key: TvmVar; label: string; format: FieldFormat; step?: number }[] = [
  { key: 'n', label: 'N — number of periods', format: 'number', step: 1 },
  { key: 'rate', label: 'I/Y — annual rate', format: 'percent', step: 0.25 },
  { key: 'pv', label: 'PV — present value', format: 'currency', step: 100 },
  { key: 'pmt', label: 'PMT — payment', format: 'currency', step: 10 },
  { key: 'fv', label: 'FV — future value', format: 'currency', step: 100 },
]

function formatSolved(unknown: TvmVar, value: number): string {
  if (!Number.isFinite(value)) return 'No solution'
  switch (unknown) {
    case 'rate':
      return percent(value, 4)
    case 'n':
      return `${fmtNumber(value, 3)} periods`
    default:
      return money(value)
  }
}

export function TvmSolver() {
  const [state, setState] = useState<SolverState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as SolverState) }
    } catch {
      // ignore
    }
    return DEFAULT
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const set = (patch: Partial<SolverState>) => setState((prev) => ({ ...prev, ...patch }))

  const solved = useMemo(() => {
    const i = state.rate / state.m
    const periodic = tvmSolve(state.unknown, {
      n: state.n,
      i,
      pv: state.pv,
      pmt: state.pmt,
      fv: state.fv,
      type: state.begin ? 1 : 0,
    })
    // The solver returns a *per-period* rate; present it annualized.
    return state.unknown === 'rate' ? periodic * state.m : periodic
  }, [state])

  return (
    <div className="tvm">
      <p className="tvm__hint">
        Select the variable to solve for, then fill in the other four. Uses the calculator sign
        convention — cash <em>in</em> is positive, cash <em>out</em> negative (so PV and PMT usually
        have opposite signs).
      </p>

      <div className="tvm__grid">
        {FIELDS.map((f) => {
          const isUnknown = state.unknown === f.key
          return (
            <div key={f.key} className={`tvm__row${isUnknown ? ' tvm__row--solve' : ''}`}>
              <label className="tvm__pick">
                <input
                  type="radio"
                  name="tvm-unknown"
                  checked={isUnknown}
                  onChange={() => set({ unknown: f.key })}
                />
                <span>Solve</span>
              </label>
              {isUnknown ? (
                <div className="tvm__result">
                  <span className="tvm__result-label">{f.label}</span>
                  <span className="tvm__result-value">{formatSolved(f.key, solved)}</span>
                </div>
              ) : (
                <NumberField
                  label={f.label}
                  value={state[f.key]}
                  format={f.format}
                  step={f.step}
                  onChange={(v) => set({ [f.key]: v } as Partial<SolverState>)}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="tvm__settings">
        <NumberField
          label="Periods / year (m)"
          hint="monthly 12 · quarterly 4 · annual 1"
          value={state.m}
          format="number"
          step={1}
          onChange={(v) => set({ m: v })}
        />
        <div className="tvm__toggle">
          <span className="field__label">Payment timing</span>
          <div className="seg">
            <button
              className={`seg__btn${!state.begin ? ' seg__btn--on' : ''}`}
              onClick={() => set({ begin: false })}
            >
              End
            </button>
            <button
              className={`seg__btn${state.begin ? ' seg__btn--on' : ''}`}
              onClick={() => set({ begin: true })}
            >
              Begin
            </button>
          </div>
        </div>
        <button className="btn btn--ghost" onClick={() => setState(DEFAULT)}>
          Reset
        </button>
      </div>
    </div>
  )
}
