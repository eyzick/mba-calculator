# MBA 617 · Financial Calculator

An extensible financial calculator for case work. All formulas read from one
shared, editable set of base-case assumptions (Exhibit 1) and recalculate live
as you change any input.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## How it works

- **Assumptions** live in `src/lib/assumptions.ts` (`BASE_CASE` values + the
  `FIELD_GROUPS` metadata that drives the editable panel).
- **State** is held in `src/state/AssumptionsContext.tsx`. Edits persist to
  `localStorage`; "Reset" restores Exhibit 1.
- **Formulas** are self-contained modules in `src/calculators/` that implement
  the `Calculator` interface (`src/lib/types.ts`).

## Adding a new formula

1. Create `src/calculators/myFormula.ts` exporting a `Calculator`:

   ```ts
   import { millions } from '../lib/format'
   import type { Calculator } from '../lib/types'

   export const myFormula: Calculator = {
     id: 'my-formula',
     title: 'My formula',
     caseGroup: 'Valuation',          // cards are grouped by this
     formula: 'X = a / b',
     usedKeys: ['fcfGood', 'requiredReturn'],
     compute: (a) => [
       { rows: [{ label: 'Result', value: millions(a.fcfGood / a.requiredReturn), emphasis: true }] },
     ],
   }
   ```

2. Register it in `src/calculators/registry.ts`.

That's it — the card renders automatically, grouped by `caseGroup`.

## Included formulas

- **Firm value — growing perpetuity**: `V = FCFnext / (r − g)`, reported for the
  good/bad planning states and as the probability-weighted expected value.

## Adding a new assumption input

1. Add the field to the `Assumptions` interface in `src/lib/types.ts`.
2. Add its default to `BASE_CASE` and an entry under the right `FIELD_GROUPS`
   group in `src/lib/assumptions.ts`.

It will appear in the panel and be available to every calculator.
