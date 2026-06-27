import {
  annuityFV,
  annuityPV,
  cagr,
  effectiveAnnualRate,
  effectiveAnnualRateContinuous,
  futureValue,
  growingPerpetuityPV,
  npv,
  payment,
  perpetuityPV,
  presentValue,
} from '../lib/finance'
import { money, percent } from '../lib/format'
import type { Calculator } from '../lib/types'
import { CompoundingTable } from '../components/CompoundingTable'
import { AmortizationTable } from '../components/AmortizationTable'

const TVM = 'Time value of money'
const RATES = 'Rates & growth'

const isDue = (v: number | undefined) => v === 1

export const presentValueLumpSum: Calculator = {
  id: 'pv-lump-sum',
  title: 'Present value (lump sum)',
  caseGroup: TVM,
  formula: 'PV = FV / (1 + r/m)^(m·t)',
  description:
    'Discount a single future cash flow back to today, compounding m times per year (annual = 1, semiannual = 2, quarterly = 4, monthly = 12, daily = 365). Set m = 0 for continuous compounding (PV = FV·e^(−r·t)).',
  inputs: [
    { key: 'fv', label: 'Future value (FV)', format: 'currency', default: 1000, step: 100 },
    { key: 'r', label: 'Annual rate (r)', format: 'percent', default: 0.05, step: 0.25 },
    { key: 't', label: 'Years (t)', format: 'number', default: 10, step: 1 },
    {
      key: 'm',
      label: 'Compounding / year (m)',
      format: 'number',
      default: 1,
      step: 1,
      hint: 'annual 1 · semiannual 2 · quarterly 4 · monthly 12 · daily 365 · 0 = continuous',
    },
  ],
  compute: (_a, v) => {
    const continuous = v.m === 0
    const pv = continuous ? v.fv * Math.exp(-v.r * v.t) : presentValue(v.fv, v.r / v.m, v.m * v.t)
    const ear = continuous ? Math.exp(v.r) - 1 : effectiveAnnualRate(v.r, v.m)
    return [
      {
        rows: [
          { label: 'Present value', value: money(pv), emphasis: true },
          { label: 'Total discount', value: money(v.fv - pv) },
        ],
      },
      {
        heading: 'Compounding detail',
        rows: [
          {
            label: 'Periodic rate (r / m)',
            value: continuous ? '— (continuous)' : percent(v.r / v.m, 4),
          },
          {
            label: 'Number of periods (m · t)',
            value: continuous ? '— (continuous)' : String(v.m * v.t),
          },
          { label: 'Effective annual rate', value: percent(ear, 4) },
        ],
      },
    ]
  },
  extra: (_a, v) => <CompoundingTable r={v.r} m={v.m} />,
}

export const futureValueLumpSum: Calculator = {
  id: 'fv-lump-sum',
  title: 'Future value (lump sum)',
  caseGroup: TVM,
  formula: 'FV = PV (1 + r/m)^(m·t)',
  description:
    'Grow a single present cash flow forward, compounding m times per year (annual = 1, semiannual = 2, quarterly = 4, monthly = 12, daily = 365). Set m = 0 for continuous compounding (FV = PV·e^(r·t)).',
  inputs: [
    { key: 'pv', label: 'Present value (PV)', format: 'currency', default: 1000, step: 100 },
    { key: 'r', label: 'Annual rate (r)', format: 'percent', default: 0.05, step: 0.25 },
    { key: 't', label: 'Years (t)', format: 'number', default: 10, step: 1 },
    {
      key: 'm',
      label: 'Compounding / year (m)',
      format: 'number',
      default: 1,
      step: 1,
      hint: 'annual 1 · semiannual 2 · quarterly 4 · monthly 12 · daily 365 · 0 = continuous',
    },
  ],
  compute: (_a, v) => {
    const continuous = v.m === 0
    const fv = continuous
      ? v.pv * Math.exp(v.r * v.t)
      : futureValue(v.pv, v.r / v.m, v.m * v.t)
    const ear = continuous ? Math.exp(v.r) - 1 : effectiveAnnualRate(v.r, v.m)
    return [
      {
        rows: [
          { label: 'Future value', value: money(fv), emphasis: true },
          { label: 'Total interest earned', value: money(fv - v.pv) },
        ],
      },
      {
        heading: 'Compounding detail',
        rows: [
          {
            label: 'Periodic rate (r / m)',
            value: continuous ? '— (continuous)' : percent(v.r / v.m, 4),
          },
          {
            label: 'Number of periods (m · t)',
            value: continuous ? '— (continuous)' : String(v.m * v.t),
          },
          { label: 'Effective annual rate', value: percent(ear, 4) },
        ],
      },
    ]
  },
  extra: (_a, v) => <CompoundingTable r={v.r} m={v.m} principal={v.pv} t={v.t} />,
}

export const annuityPresentValue: Calculator = {
  id: 'annuity-pv',
  title: 'Present value of an annuity',
  caseGroup: TVM,
  formula: 'PV = PMT × [1 − (1 + r)⁻ⁿ] / r',
  description: 'Value today of a stream of equal periodic payments.',
  inputs: [
    { key: 'pmt', label: 'Payment (PMT)', format: 'currency', default: 1000, step: 100 },
    { key: 'r', label: 'Rate per period (r)', format: 'percent', default: 0.05, step: 0.25 },
    { key: 'n', label: 'Periods (n)', format: 'number', default: 10, step: 1 },
    { key: 'due', label: 'Annuity due?', format: 'number', default: 0, step: 1, hint: '1 = due, 0 = ordinary' },
  ],
  compute: (_a, v) => [
    {
      rows: [
        {
          label: 'Present value',
          value: money(annuityPV(v.pmt, v.r, v.n, isDue(v.due))),
          emphasis: true,
        },
        { label: 'Sum of payments (undiscounted)', value: money(v.pmt * v.n) },
      ],
    },
  ],
}

export const annuityFutureValue: Calculator = {
  id: 'annuity-fv',
  title: 'Future value of an annuity',
  caseGroup: TVM,
  formula: 'FV = PMT × [(1 + r)ⁿ − 1] / r',
  description: 'Value at the end of a stream of equal periodic payments.',
  inputs: [
    { key: 'pmt', label: 'Payment (PMT)', format: 'currency', default: 1000, step: 100 },
    { key: 'r', label: 'Rate per period (r)', format: 'percent', default: 0.05, step: 0.25 },
    { key: 'n', label: 'Periods (n)', format: 'number', default: 10, step: 1 },
    { key: 'due', label: 'Annuity due?', format: 'number', default: 0, step: 1, hint: '1 = due, 0 = ordinary' },
  ],
  compute: (_a, v) => [
    {
      rows: [
        {
          label: 'Future value',
          value: money(annuityFV(v.pmt, v.r, v.n, isDue(v.due))),
          emphasis: true,
        },
        { label: 'Sum of payments (undiscounted)', value: money(v.pmt * v.n) },
      ],
    },
  ],
}

export const perpetuity: Calculator = {
  id: 'perpetuity-pv',
  title: 'Perpetuity',
  caseGroup: TVM,
  formula: 'PV = C / r',
  description: 'Value today of a level cash flow that continues forever.',
  inputs: [
    { key: 'c', label: 'Cash flow per period (C)', format: 'currency', default: 100, step: 10 },
    { key: 'r', label: 'Rate per period (r)', format: 'percent', default: 0.05, step: 0.25 },
  ],
  compute: (_a, v) => [
    { rows: [{ label: 'Present value', value: money(perpetuityPV(v.c, v.r)), emphasis: true }] },
  ],
}

export const growingPerpetuity: Calculator = {
  id: 'growing-perpetuity-pv',
  title: 'Growing perpetuity',
  caseGroup: TVM,
  formula: 'PV = C / (r − g)',
  description: 'Value today of a cash flow that grows at a constant rate forever. Requires r > g.',
  inputs: [
    { key: 'c', label: 'Next cash flow (C)', format: 'currency', default: 100, step: 10 },
    { key: 'r', label: 'Rate per period (r)', format: 'percent', default: 0.1, step: 0.25 },
    { key: 'g', label: 'Growth (g)', format: 'percent', default: 0.04, step: 0.25 },
  ],
  compute: (_a, v) => {
    const spread = v.r - v.g
    if (spread <= 0) {
      return [
        {
          rows: [
            {
              label: 'Present value',
              value: 'Undefined',
              emphasis: true,
              note: 'Requires r > g.',
            },
          ],
        },
      ]
    }
    return [
      {
        rows: [
          { label: 'Present value', value: money(growingPerpetuityPV(v.c, v.r, v.g)), emphasis: true },
          { label: 'r − g', value: percent(spread) },
        ],
      },
    ]
  },
}

export const loanPayment: Calculator = {
  id: 'loan-payment',
  title: 'Loan payment (amortizing)',
  caseGroup: TVM,
  formula: 'PMT = PV × r / [1 − (1 + r)⁻ⁿ]',
  description: 'Level payment that fully amortizes a loan over n periods.',
  inputs: [
    { key: 'pv', label: 'Loan principal (PV)', format: 'currency', default: 250000, step: 1000 },
    { key: 'r', label: 'Rate per period (r)', format: 'percent', default: 0.005, step: 0.05, hint: 'e.g. monthly = APR / 12' },
    { key: 'n', label: 'Number of payments (n)', format: 'number', default: 360, step: 1 },
  ],
  compute: (_a, v) => {
    const pmt = payment(v.pv, v.r, v.n)
    const total = pmt * v.n
    return [
      {
        rows: [
          { label: 'Payment per period', value: money(pmt), emphasis: true },
          { label: 'Total paid', value: money(total) },
          { label: 'Total interest', value: money(total - v.pv) },
        ],
      },
    ]
  },
  extra: (_a, v) => <AmortizationTable principal={v.pv} r={v.r} n={v.n} />,
}

export const netPresentValue: Calculator = {
  id: 'npv-level',
  title: 'Net present value (level cash flows)',
  caseGroup: TVM,
  formula: 'NPV = −C₀ + Σ Cₜ / (1 + r)ᵗ',
  description:
    'NPV of a project with an initial outlay followed by a level cash flow each period.',
  inputs: [
    { key: 'outlay', label: 'Initial outlay (C₀)', format: 'currency', default: 1000, step: 100 },
    { key: 'cashFlow', label: 'Cash flow per period', format: 'currency', default: 200, step: 10 },
    { key: 'r', label: 'Discount rate (r)', format: 'percent', default: 0.1, step: 0.25 },
    { key: 'n', label: 'Periods (n)', format: 'number', default: 8, step: 1 },
  ],
  compute: (_a, v) => {
    const flows = [-v.outlay, ...Array.from({ length: Math.max(0, Math.round(v.n)) }, () => v.cashFlow)]
    const value = npv(v.r, flows)
    const pvInflows = value + v.outlay
    return [
      {
        rows: [
          {
            label: 'NPV',
            value: money(value),
            emphasis: true,
            note: value >= 0 ? 'Positive NPV — accept.' : 'Negative NPV — reject.',
          },
          { label: 'PV of inflows', value: money(pvInflows) },
          { label: 'Profitability index (PV inflows / outlay)', value: (pvInflows / v.outlay).toFixed(2) },
        ],
      },
    ]
  },
}

export const effectiveRate: Calculator = {
  id: 'effective-annual-rate',
  title: 'Effective annual rate (EAR)',
  caseGroup: RATES,
  formula: 'EAR = (1 + APR / m)ᵐ − 1',
  description: 'Convert a nominal APR with m compounding periods into an effective annual rate.',
  inputs: [
    { key: 'apr', label: 'APR (nominal)', format: 'percent', default: 0.12, step: 0.05 },
    { key: 'm', label: 'Compounding / year (m)', format: 'number', default: 12, step: 1, hint: 'daily ≈ 365, 0 = continuous' },
  ],
  compute: (_a, v) => {
    const ear = v.m === 0 ? effectiveAnnualRateContinuous(v.apr) : effectiveAnnualRate(v.apr, v.m)
    return [
      {
        rows: [
          { label: 'Effective annual rate', value: percent(ear, 4), emphasis: true },
          { label: 'Periodic rate (APR / m)', value: v.m === 0 ? '— (continuous)' : percent(v.apr / v.m, 4) },
        ],
      },
    ]
  },
}

export const growthRate: Calculator = {
  id: 'cagr',
  title: 'Compound annual growth rate (CAGR)',
  caseGroup: RATES,
  formula: 'CAGR = (End / Begin)^(1/n) − 1',
  description: 'Annualized growth rate between a beginning and ending value over n years.',
  inputs: [
    { key: 'begin', label: 'Beginning value', format: 'currency', default: 100, step: 10 },
    { key: 'end', label: 'Ending value', format: 'currency', default: 200, step: 10 },
    { key: 'n', label: 'Years (n)', format: 'number', default: 5, step: 1 },
  ],
  compute: (_a, v) => [
    {
      rows: [
        { label: 'CAGR', value: percent(cagr(v.begin, v.end, v.n), 4), emphasis: true },
        { label: 'Total growth', value: percent(v.end / v.begin - 1, 2) },
      ],
    },
  ],
}

export const tvmCalculators: Calculator[] = [
  presentValueLumpSum,
  futureValueLumpSum,
  annuityPresentValue,
  annuityFutureValue,
  perpetuity,
  growingPerpetuity,
  loanPayment,
  netPresentValue,
  effectiveRate,
  growthRate,
]
