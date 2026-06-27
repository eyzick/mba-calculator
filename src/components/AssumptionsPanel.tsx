import { FIELD_GROUPS } from '../lib/assumptions'
import { useAssumptions } from '../state/AssumptionsContext'
import { NumberField } from './NumberField'

export function AssumptionsPanel({ onClose }: { onClose?: () => void }) {
  const { assumptions, setField, reset, isDirty } = useAssumptions()

  return (
    <aside className="panel">
      <div className="panel__header">
        <div>
          <h2 className="panel__title">Assumptions</h2>
          <p className="panel__subtitle">Exhibit 1 — base case</p>
        </div>
        <div className="panel__header-actions">
          <button className="btn" onClick={reset} disabled={!isDirty} title="Restore Exhibit 1 values">
            Reset
          </button>
          {onClose ? (
            <button className="btn btn--icon" onClick={onClose} aria-label="Close assumptions">
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <div className="panel__groups">
        {FIELD_GROUPS.map((group) => (
          <section key={group.id} className="group">
            <h3 className="group__title">{group.title}</h3>
            <div className="group__fields">
              {group.fields.map((f) => (
                <NumberField
                  key={f.key}
                  label={f.label}
                  hint={f.hint}
                  value={assumptions[f.key]}
                  format={f.format}
                  step={f.step}
                  onChange={(v) => setField(f.key, v)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
