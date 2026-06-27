import type { Calculator } from '../lib/types'
import { firmValueGrowingPerpetuity } from './firmValue'
import { tvmCalculators } from './tvm'

/**
 * The list of every calculator the app knows about.
 *
 * To add a new formula:
 *   1. Create a module under `src/calculators/` that exports a `Calculator`.
 *   2. Import it here and add it to the array below.
 * It will automatically appear in the UI, grouped by its `caseGroup`.
 */
export const CALCULATORS: Calculator[] = [firmValueGrowingPerpetuity, ...tvmCalculators]

/** Calculators grouped by their `caseGroup`, preserving first-seen order. */
export function calculatorsByGroup(): { group: string; calculators: Calculator[] }[] {
  const order: string[] = []
  const map = new Map<string, Calculator[]>()
  for (const calc of CALCULATORS) {
    if (!map.has(calc.caseGroup)) {
      map.set(calc.caseGroup, [])
      order.push(calc.caseGroup)
    }
    map.get(calc.caseGroup)!.push(calc)
  }
  return order.map((group) => ({ group, calculators: map.get(group)! }))
}
