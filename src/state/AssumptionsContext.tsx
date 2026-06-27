import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { BASE_CASE } from '../lib/assumptions'
import type { Assumptions, AssumptionKey } from '../lib/types'

const STORAGE_KEY = 'mba617:assumptions'

interface AssumptionsContextValue {
  assumptions: Assumptions
  /** Update a single field. */
  setField: (key: AssumptionKey, value: number) => void
  /** Restore the Exhibit 1 base case. */
  reset: () => void
  /** True when the current values differ from the base case. */
  isDirty: boolean
}

const AssumptionsContext = createContext<AssumptionsContextValue | null>(null)

function load(): Assumptions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return BASE_CASE
    const parsed = JSON.parse(raw) as Partial<Assumptions>
    // Merge so newly-added fields always have a sensible default.
    return { ...BASE_CASE, ...parsed }
  } catch {
    return BASE_CASE
  }
}

export function AssumptionsProvider({ children }: { children: ReactNode }) {
  const [assumptions, setAssumptions] = useState<Assumptions>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assumptions))
    } catch {
      // ignore storage failures (e.g. private mode)
    }
  }, [assumptions])

  const setField = useCallback((key: AssumptionKey, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => setAssumptions(BASE_CASE), [])

  const isDirty = useMemo(
    () => (Object.keys(BASE_CASE) as AssumptionKey[]).some((k) => assumptions[k] !== BASE_CASE[k]),
    [assumptions],
  )

  const value = useMemo(
    () => ({ assumptions, setField, reset, isDirty }),
    [assumptions, setField, reset, isDirty],
  )

  return <AssumptionsContext.Provider value={value}>{children}</AssumptionsContext.Provider>
}

export function useAssumptions(): AssumptionsContextValue {
  const ctx = useContext(AssumptionsContext)
  if (!ctx) throw new Error('useAssumptions must be used within an AssumptionsProvider')
  return ctx
}
