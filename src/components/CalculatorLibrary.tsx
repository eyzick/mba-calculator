import { useMemo, useState } from 'react'
import { calculatorsByGroup } from '../calculators/registry'
import type { Calculator } from '../lib/types'
import { CalculatorCard } from './CalculatorCard'

/** Lowercased searchable text for a calculator. */
function searchText(calc: Calculator): string {
  return [
    calc.title,
    calc.formula,
    calc.description ?? '',
    calc.caseGroup,
    ...(calc.inputs?.map((i) => i.label) ?? []),
  ]
    .join(' ')
    .toLowerCase()
}

function matches(calc: Calculator, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const hay = searchText(calc)
  return tokens.every((t) => hay.includes(t))
}

export function CalculatorLibrary() {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const tokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  )
  const searching = tokens.length > 0

  const groups = useMemo(() => {
    return calculatorsByGroup()
      .map(({ group, calculators }) => ({
        group,
        calculators: calculators.filter((c) => matches(c, tokens)),
      }))
      .filter((g) => g.calculators.length > 0)
  }, [tokens])

  const totalMatches = groups.reduce((n, g) => n + g.calculators.length, 0)
  const allIds = useMemo(() => groups.flatMap((g) => g.calculators.map((c) => c.id)), [groups])
  const allExpanded = allIds.length > 0 && allIds.every((id) => expanded.has(id))

  const toggleCard = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleGroup = (group: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(group) ? next.delete(group) : next.add(group)
      return next
    })

  const expandAll = () => setExpanded(new Set(allIds))
  const collapseAll = () => setExpanded(new Set())

  return (
    <section className="library">
      <div className="library__toolbar">
        <div className="search">
          <span className="search__icon" aria-hidden>
            ⌕
          </span>
          <input
            className="search__input"
            type="search"
            placeholder="Search formulas… (e.g. annuity, NPV, perpetuity)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search formulas"
          />
          {query ? (
            <button className="search__clear" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          ) : null}
        </div>
        <div className="library__actions">
          <span className="library__count">
            {totalMatches} formula{totalMatches === 1 ? '' : 's'}
          </span>
          <button className="btn btn--ghost" onClick={allExpanded ? collapseAll : expandAll}>
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="library__empty">No formulas match “{query}”.</p>
      ) : (
        groups.map(({ group, calculators }) => {
          const groupCollapsed = collapsedGroups.has(group)
          return (
            <section key={group} className="case-group">
              <button
                type="button"
                className="case-group__title"
                onClick={() => toggleGroup(group)}
                aria-expanded={!groupCollapsed}
              >
                <span className={`case-group__chevron${groupCollapsed ? '' : ' case-group__chevron--open'}`}>
                  ▸
                </span>
                {group}
                <span className="case-group__badge">{calculators.length}</span>
              </button>
              {groupCollapsed ? null : (
                <div className="case-group__cards">
                  {calculators.map((calc) => (
                    <CalculatorCard
                      key={calc.id}
                      calculator={calc}
                      expanded={searching || expanded.has(calc.id)}
                      onToggle={() => toggleCard(calc.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}
    </section>
  )
}
