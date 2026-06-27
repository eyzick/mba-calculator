import './App.css'
import { AssumptionsPanel } from './components/AssumptionsPanel'
import { CalculatorCard } from './components/CalculatorCard'
import { calculatorsByGroup } from './calculators/registry'
import { AssumptionsProvider } from './state/AssumptionsContext'

function App() {
  const groups = calculatorsByGroup()

  return (
    <AssumptionsProvider>
      <div className="app">
        <header className="app__header">
          <h1 className="app__brand">MBA 617 · Financial Calculator</h1>
          <p className="app__tagline">
            Edit any assumption on the left — every formula recalculates instantly.
          </p>
        </header>

        <div className="app__body">
          <AssumptionsPanel />

          <main className="app__main">
            {groups.map(({ group, calculators }) => (
              <section key={group} className="case-group">
                <h2 className="case-group__title">{group}</h2>
                <div className="case-group__cards">
                  {calculators.map((calc) => (
                    <CalculatorCard key={calc.id} calculator={calc} />
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </AssumptionsProvider>
  )
}

export default App
