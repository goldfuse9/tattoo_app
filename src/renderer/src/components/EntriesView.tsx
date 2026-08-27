import { FormEvent, useMemo, useState } from 'react'
import type { Entry, Settings } from '@shared/types'
import { entriesToCsv, formatCZK, formatDate, materialCost, todayISO } from '../utils'

interface Props {
  entries: Entry[]
  settings: Settings
  onAdd: (entry: Omit<Entry, 'id' | 'createdAt'>) => Promise<void>
  onUpdate: (entry: Entry) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const EMPTY_FORM = {
  date: todayISO(),
  clientName: '',
  payment: '',
  needlesUsed: '',
  inkCupsUsed: '',
  otherMaterialCost: '',
  note: ''
}

export default function EntriesView({ entries, settings, onAdd, onUpdate, onDelete }: Props): JSX.Element {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const previewCost =
    (Number(form.needlesUsed) || 0) * settings.needlePrice +
    (Number(form.inkCupsUsed) || 0) * settings.inkCupPrice +
    (Number(form.otherMaterialCost) || 0)
  const previewProfit = (Number(form.payment) || 0) - previewCost

  function startEdit(entry: Entry): void {
    setEditingId(entry.id)
    setForm({
      date: entry.date,
      clientName: entry.clientName,
      payment: String(entry.payment),
      needlesUsed: String(entry.needlesUsed),
      inkCupsUsed: String(entry.inkCupsUsed),
      otherMaterialCost: String(entry.otherMaterialCost),
      note: entry.note
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
      clientName: form.clientName.trim(),
      payment: Number(form.payment) || 0,
      needlesUsed: Number(form.needlesUsed) || 0,
      inkCupsUsed: Number(form.inkCupsUsed) || 0,
      otherMaterialCost: Number(form.otherMaterialCost) || 0,
      note: form.note.trim()
    }
    try {
      if (editingId) {
        await onUpdate({ id: editingId, createdAt: '', ...payload } as Entry)
      } else {
        await onAdd(payload)
      }
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  async function handleExport(): Promise<void> {
    const content = entriesToCsv(entries, settings)
    await window.api.exportCsv({ filename: 'tetovani-zapisy.csv', content })
  }

  const totalCount = entries.length
  const csvDisabled = useMemo(() => totalCount === 0, [totalCount])

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="view-eyebrow">Sezení s klienty</p>
          <h1>Zápisy</h1>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleExport} disabled={csvDisabled}>
          Export do CSV
        </button>
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
              <span>Klient</span>
              <input
                type="text"
                placeholder="Jméno nebo iniciály"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Platba od klienta (Kč)</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Počet jehel</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={form.needlesUsed}
                onChange={(e) => setForm({ ...form, needlesUsed: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Kalíšky barvy</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={form.inkCupsUsed}
                onChange={(e) => setForm({ ...form, inkCupsUsed: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Ostatní materiál (Kč)</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="rukavice, fólie…"
                value={form.otherMaterialCost}
                onChange={(e) => setForm({ ...form, otherMaterialCost: e.target.value })}
              />
            </label>
            <label className="field field-wide">
              <span>Poznámka</span>
              <input
                type="text"
                placeholder="Motiv, velikost, umístění…"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
          </div>

          <div className="form-footer">
            <div className="form-preview">
              Náklady materiálu <strong className="tone-red">{formatCZK(previewCost)}</strong> · Zisk{' '}
              <strong className={previewProfit >= 0 ? 'tone-gold' : 'tone-red'}>{formatCZK(previewProfit)}</strong>
            </div>
            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                  Zrušit úpravu
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {editingId ? 'Uložit změny' : 'Přidat zápis'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Historie ({totalCount})</h2>
        </div>
        {entries.length === 0 ? (
          <p className="empty-state">Zatím žádné zápisy.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Klient</th>
                <th className="num">Platba</th>
                <th className="num">Jehly</th>
                <th className="num">Barva</th>
                <th className="num">Náklady</th>
                <th className="num">Zisk</th>
                <th>Poznámka</th>
                <th aria-label="Akce" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const cost = materialCost(entry, settings)
                const profit = entry.payment - cost
                return (
                  <tr key={entry.id} className={editingId === entry.id ? 'is-editing' : ''}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{entry.clientName || '—'}</td>
                    <td className="num">{formatCZK(entry.payment)}</td>
                    <td className="num">{entry.needlesUsed}</td>
                    <td className="num">{entry.inkCupsUsed}</td>
                    <td className="num tone-red">{formatCZK(cost)}</td>
                    <td className={`num ${profit >= 0 ? 'tone-gold' : 'tone-red'}`}>{formatCZK(profit)}</td>
                    <td className="cell-note">{entry.note || '—'}</td>
                    <td className="cell-actions">
                      <button type="button" className="btn-icon" onClick={() => startEdit(entry)} title="Upravit">
                        Upravit
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={() => onDelete(entry.id)}
                        title="Smazat"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
