import type { Entry, Settings } from '@shared/types'

export function formatCZK(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}. ${m}. ${y}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function startOfWeekISO(base: Date = new Date()): string {
  const date = new Date(base)
  const day = (date.getDay() + 6) % 7 // pondělí = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

export function startOfMonthISO(base: Date = new Date()): string {
  const date = new Date(base.getFullYear(), base.getMonth(), 1)
  return date.toISOString().slice(0, 10)
}

// Náklady na materiál pro jeden zápis (jehly + barva dle nastavených cen + ostatní)
export function materialCost(entry: Entry, settings: Settings): number {
  return entry.needlesUsed * settings.needlePrice + entry.inkCupsUsed * settings.inkCupPrice + entry.otherMaterialCost
}

export function entryProfit(entry: Entry, settings: Settings): number {
  return entry.payment - materialCost(entry, settings)
}

export function csvEscape(value: string | number): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function entriesToCsv(entries: Entry[], settings: Settings): string {
  const header = [
    'Datum',
    'Klient',
    'Platba (Kč)',
    'Jehly',
    'Kalíšky barvy',
    'Ostatní materiál (Kč)',
    'Náklady celkem (Kč)',
    'Zisk (Kč)',
    'Poznámka'
  ]
  const rows = entries.map((e) => {
    const cost = materialCost(e, settings)
    return [
      e.date,
      e.clientName,
      e.payment,
      e.needlesUsed,
      e.inkCupsUsed,
      e.otherMaterialCost,
      cost,
      e.payment - cost,
      e.note
    ]
  })
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
}
