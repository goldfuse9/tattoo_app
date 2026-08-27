import { useEffect, useState, useCallback } from 'react'
import type { Entry, Expense, Settings } from '@shared/types'
import Dashboard from './components/Dashboard'
import EntriesView from './components/EntriesView'
import ExpensesView from './components/ExpensesView'
import SettingsView from './components/SettingsView'

type Tab = 'prehled' | 'zapisy' | 'vydaje' | 'nastaveni'

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'prehled', label: 'Přehled', hint: '01' },
  { id: 'zapisy', label: 'Zápisy', hint: '02' },
  { id: 'vydaje', label: 'Výdaje', hint: '03' },
  { id: 'nastaveni', label: 'Nastavení', hint: '04' }
]

export default function App(): JSX.Element {
  const [tab, setTab] = useState<Tab>('prehled')
  const [entries, setEntries] = useState<Entry[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settings, setSettings] = useState<Settings>({ needlePrice: 15, inkCupPrice: 25 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      const [e, x, s] = await Promise.all([
        window.api.entries.getAll(),
        window.api.expenses.getAll(),
        window.api.settings.get()
      ])
      if (cancelled) return
      setEntries(e)
      setExpenses(x)
      setSettings(s)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const addEntry = useCallback(async (entry: Omit<Entry, 'id' | 'createdAt'>) => {
    setEntries(await window.api.entries.add(entry))
  }, [])
  const updateEntry = useCallback(async (entry: Entry) => {
    setEntries(await window.api.entries.update(entry))
  }, [])
  const deleteEntry = useCallback(async (id: string) => {
    setEntries(await window.api.entries.delete(id))
  }, [])

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses(await window.api.expenses.add(expense))
  }, [])
  const updateExpense = useCallback(async (expense: Expense) => {
    setExpenses(await window.api.expenses.update(expense))
  }, [])
  const deleteExpense = useCallback(async (id: string) => {
    setExpenses(await window.api.expenses.delete(id))
  }, [])

  const saveSettings = useCallback(async (next: Settings) => {
    setSettings(await window.api.settings.save(next))
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <span>Načítám záznamy…</span>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark" aria-hidden="true" />
          <div>
            <div className="sidebar-brand-title">Tetování</div>
            <div className="sidebar-brand-sub">Deník příjmů a výdajů</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`sidebar-nav-item ${tab === t.id ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
              type="button"
            >
              <span className="sidebar-nav-hint">{t.hint}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">Data se ukládají lokálně na tomto Macu</div>
      </aside>

      <main className="app-main">
        {tab === 'prehled' && <Dashboard entries={entries} expenses={expenses} settings={settings} />}
        {tab === 'zapisy' && (
          <EntriesView
            entries={entries}
            settings={settings}
            onAdd={addEntry}
            onUpdate={updateEntry}
            onDelete={deleteEntry}
          />
        )}
        {tab === 'vydaje' && (
          <ExpensesView expenses={expenses} onAdd={addExpense} onUpdate={updateExpense} onDelete={deleteExpense} />
        )}
        {tab === 'nastaveni' && <SettingsView settings={settings} onSave={saveSettings} />}
      </main>
    </div>
  )
}
