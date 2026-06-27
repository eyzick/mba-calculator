import { useEffect, useState } from 'react'
import './App.css'
import { AssumptionsPanel } from './components/AssumptionsPanel'
import { CalculatorLibrary } from './components/CalculatorLibrary'
import { AssumptionsProvider, useAssumptions } from './state/AssumptionsContext'

function Workspace() {
  const { isDirty } = useAssumptions()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__heading">
          <h1 className="app__brand">MBA 617 · Financial Calculator</h1>
          <p className="app__tagline">
            Search the formula library, expand the one you need, and edit any input — everything
            recalculates instantly.
          </p>
        </div>
        <button
          className={`btn btn--assumptions${isDirty ? ' btn--assumptions-dirty' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={drawerOpen}
        >
          Case assumptions
          {isDirty ? <span className="btn__dot" title="Edited from base case" /> : null}
        </button>
      </header>

      <main className="app__main">
        <CalculatorLibrary />
      </main>

      {drawerOpen ? (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div
            className="drawer"
            role="dialog"
            aria-label="Case assumptions"
            onClick={(e) => e.stopPropagation()}
          >
            <AssumptionsPanel onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function App() {
  return (
    <AssumptionsProvider>
      <Workspace />
    </AssumptionsProvider>
  )
}

export default App
