import { millions, percent } from '../lib/format'
import type { Calculator } from '../lib/types'

/**
 * Firm value as a growing perpetuity:
 *
 *   V = FCFnext / (r − g)
 *
 * The case gives FCFnext in two states (good / bad) with planning
 * probabilities, so we report each state plus the probability-weighted
 * (expected) firm value.
 */
export const firmValueGrowingPerpetuity: Calculator = {
  id: 'firm-value-growing-perpetuity',
  title: 'Firm value — growing perpetuity',
  caseGroup: 'Valuation',
  formula: 'V = FCFnext / (r − g)',
  description:
    'Value of operating assets as a growing perpetuity. With two planning states, the expected value uses probability-weighted FCFnext.',
  usedKeys: ['fcfGood', 'fcfBad', 'probGood', 'probBad', 'requiredReturn', 'growth'],
  compute: (a) => {
    const spread = a.requiredReturn - a.growth
    const valueOf = (fcf: number) => fcf / spread

    const expectedFcf = a.probGood * a.fcfGood + a.probBad * a.fcfBad
    const expectedValue = valueOf(expectedFcf)

    if (spread <= 0) {
      return [
        {
          rows: [
            {
              label: 'Firm value (V)',
              value: 'Undefined',
              emphasis: true,
              note: 'Requires r > g. Increase the required return or lower growth.',
            },
            { label: 'r − g', value: percent(spread) },
          ],
        },
      ]
    }

    return [
      {
        rows: [
          {
            label: 'Expected firm value (V)',
            value: millions(expectedValue),
            emphasis: true,
            note: `Expected FCFnext = ${millions(expectedFcf)} ÷ (r − g = ${percent(spread)})`,
          },
        ],
      },
      {
        heading: 'By planning state',
        rows: [
          {
            label: `Good state · FCFnext = ${millions(a.fcfGood)} (p = ${percent(a.probGood, 0)})`,
            value: millions(valueOf(a.fcfGood)),
          },
          {
            label: `Bad state · FCFnext = ${millions(a.fcfBad)} (p = ${percent(a.probBad, 0)})`,
            value: millions(valueOf(a.fcfBad)),
          },
        ],
      },
    ]
  },
}
