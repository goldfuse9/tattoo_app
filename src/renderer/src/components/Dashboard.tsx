import type { Entry, Expense, Settings } from '@shared/types'
import { formatCZK, formatDate, materialCost, startOfMonthISO, startOfWeekISO, todayISO } from '../utils'

interface Props {
  entries: Entry[]
  expenses: Expense[]
  settings: Settings
}

interface Summary {
  income: number
  materialCosts: number
  otherExpenses: number
  totalCosts: number
  profit: number
  sessions: number
}

function summarize(entries: Entry[], expenses: Expense[], settings: Settings, fromDate: string): Summary {
  const dayEntries = entries.filter((e) => e.date >= fromDate)
  const dayExpenses = expenses.filter((e) => e.date >= fromDate)
  const income = dayEntries.reduce((sum, e) => sum + e.payment, 0)
  const materialCosts = dayEntries.reduce((sum, e) => sum + materialCost(e, settings), 0)
  const otherExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalCosts = materialCosts + otherExpenses
  return { income, materialCosts, otherExpenses, totalCosts, profit: income - totalCosts, sessions: dayEntries.length }
}

function SummaryCard({ label, range, summary }: { label: string; range: string; summary: Summary }): JSX.Element {
  const profitPositive = summary.profit >= 0
  return (
    <div className="ledger-card">
      <div className="ledger-card-head">
        <h3>{label}</h3>
        <span className="ledger-card-range">{range}</span>
      </div>
      <dl className="ledger-rows">
        <div className="ledger-row">
          <dt>Příjem</dt>
          <dd className="num">{formatCZK(summary.income)}</dd>
        </div>
        <div className="ledger-row">
          <dt>Materiál (jehly, barva…)</dt>
          <dd className="num tone-red">{formatCZK(summary.materialCosts)}</dd>
        </div>
        <div className="ledger-row">
          <dt>Ostatní výdaje</dt>
          <dd className="num tone-red">{formatCZK(summary.otherExpenses)}</dd>
        </div>
      </dl>
      <div className="ledger-row ledger-total">
        <dt>Zisk</dt>
        <dd className={`num ${profitPositive ? 'tone-gold' : 'tone-red'}`}>{formatCZK(summary.profit)}</dd>
      </div>
      <div className="ledger-card-foot">{summary.sessions} sezení</div>
    </div>
  )
}

export default function Dashboard({ entries, expenses, settings }: Props): JSX.Element {
  const today = todayISO()
  const weekStart = startOfWeekISO()
  const monthStart = startOfMonthISO()

  const dayS = summarize(entries, expenses, settings, today)
  const weekS = summarize(entries, expenses, settings, weekStart)
  const monthS = summarize(entries, expenses, settings, monthStart)

  const recent = entries.slice(0, 6)

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="view-eyebrow">Denní kniha</p>
          <h1>Přehled</h1>
        </div>
      </header>

      <div className="card-grid">
        <SummaryCard label="Dnes" range={formatDate(today)} summary={dayS} />
        <SummaryCard label="Tento týden" range={`od ${formatDate(weekStart)}`} summary={weekS} />
        <SummaryCard label="Tento měsíc" range={`od ${formatDate(monthStart)}`} summary={monthS} />
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Poslední zápisy</h2>
        </div>
        {recent.length === 0 ? (
          <p className="empty-state">Zatím žádné zápisy. Přidej první sezení v záložce Zápisy.</p>
        ) : (
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Klient</th>
                <th className="num">Platba</th>
                <th className="num">Náklady</th>
                <th className="num">Zisk</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => {
                const cost = materialCost(e, settings)
                const profit = e.payment - cost
                return (
                  <tr key={e.id}>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.clientName || '—'}</td>
                    <td className="num">{formatCZK(e.payment)}</td>
                    <td className="num tone-red">{formatCZK(cost)}</td>
                    <td className={`num ${profit >= 0 ? 'tone-gold' : 'tone-red'}`}>{formatCZK(profit)}</td>
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
