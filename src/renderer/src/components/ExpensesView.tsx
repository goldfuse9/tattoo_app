import { FormEvent, useState } from 'react'
import type { Expense, ExpenseCategory } from '@shared/types'
import { EXPENSE_CATEGORY_LABELS } from '@shared/types'
import { formatCZK, formatDate, todayISO } from '../utils'

interface Props {
  expenses: Expense[]
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  onUpdate: (expense: Expense) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const EMPTY_FORM = {
  date: todayISO(),
  category: 'material' as ExpenseCategory,
  description: '',
  amount: ''
}

export default function ExpensesView({ expenses, onAdd, onUpdate, onDelete }: Props): JSX.Element {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function startEdit(expense: Expense): void {
    setEditingId(expense.id)
    setForm({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount)
    })
  }

  function cancelEdit(): void {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(ev: FormEvent): Promise<void> {
    ev.preventDefault()
    setSaving(true)
    const payload = {
      date: form.date || todayISO(),
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount) || 0
    }
    try {
      if (editingId) {
        await onUpdate({ id: editingId, createdAt: '', ...payload })
      } else {
        await onAdd(payload)
      }
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="view-eyebrow">Provozní náklady</p>
          <h1>Výdaje</h1>
        </div>
      </header>

      <section className="panel">
        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Datum</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Kategorie</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
              >
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field-wide">
              <span>Popis</span>
              <input
                type="text"
                placeholder="Např. nákup jehel na sklad, nájem za srpen…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Částka (Kč)</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>
          </div>

          <div className="form-footer">
            <div className="form-preview" />
            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                  Zrušit úpravu
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {editingId ? 'Uložit změny' : 'Přidat výdaj'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Historie ({expenses.length})</h2>
          <span className="panel-head-total">
            Celkem <strong className="tone-red">{formatCZK(total)}</strong>
          </span>
        </div>
        {expenses.length === 0 ? (
          <p className="empty-state">Zatím žádné výdaje.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Kategorie</th>
                <th>Popis</th>
                <th className="num">Částka</th>
                <th aria-label="Akce" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className={editingId === expense.id ? 'is-editing' : ''}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{EXPENSE_CATEGORY_LABELS[expense.category]}</td>
                  <td className="cell-note">{expense.description || '—'}</td>
                  <td className="num tone-red">{formatCZK(expense.amount)}</td>
                  <td className="cell-actions">
                    <button type="button" className="btn-icon" onClick={() => startEdit(expense)} title="Upravit">
                      Upravit
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDelete(expense.id)}
                      title="Smazat"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
