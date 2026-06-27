import './App.css'
import { AssumptionsPanel } from './components/AssumptionsPanel'
import { CalculatorLibrary } from './components/CalculatorLibrary'
import { AssumptionsProvider } from './state/AssumptionsContext'

function App() {
  return (
    <AssumptionsProvider>
      <div className="app">
        <header className="app__header">
          <h1 className="app__brand">MBA 617 · Financial Calculator</h1>
          <p className="app__tagline">
            Search the formula library, expand the one you need, and edit any input — everything
            recalculates instantly.
          </p>
        </header>

        <div className="app__body">
          <AssumptionsPanel />

          <main className="app__main">
            <CalculatorLibrary />
          </main>
        </div>
      </div>
    </AssumptionsProvider>
  )
}

export default App
