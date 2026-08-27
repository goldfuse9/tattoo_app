import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import type { AppData, Entry, Expense, Settings } from '../shared/types'

const DEFAULT_DATA: AppData = {
  entries: [],
  expenses: [],
  settings: { needlePrice: 15, inkCupPrice: 25 }
}

function getDataPath(): string {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'data.json')
}

function load(): AppData {
  const path = getDataPath()
  if (!existsSync(path)) {
    save(DEFAULT_DATA)
    return DEFAULT_DATA
  }
  try {
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppData>
    return {
      entries: parsed.entries ?? [],
      expenses: parsed.expenses ?? [],
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings }
    }
  } catch {
    // poškozený soubor - radši nepřijít o nic, vrátíme prázdná data
    return DEFAULT_DATA
  }
}

function save(data: AppData): void {
  writeFileSync(getDataPath(), JSON.stringify(data, null, 2), 'utf-8')
}

function sortByDateDesc<T extends { date: string; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

// --- Zápisy (sezení s klienty) ---

export function getEntries(): Entry[] {
  return sortByDateDesc(load().entries)
}

export function addEntry(entry: Entry): Entry[] {
  const data = load()
  data.entries.push(entry)
  save(data)
  return getEntries()
}

export function updateEntry(entry: Entry): Entry[] {
  const data = load()
  const idx = data.entries.findIndex((e) => e.id === entry.id)
  if (idx !== -1) data.entries[idx] = entry
  save(data)
  return getEntries()
}

export function deleteEntry(id: string): Entry[] {
  const data = load()
  data.entries = data.entries.filter((e) => e.id !== id)
  save(data)
  return getEntries()
}

// --- Výdaje (provozní náklady) ---

export function getExpenses(): Expense[] {
  return sortByDateDesc(load().expenses)
}

export function addExpense(expense: Expense): Expense[] {
  const data = load()
  data.expenses.push(expense)
  save(data)
  return getExpenses()
}

export function updateExpense(expense: Expense): Expense[] {
  const data = load()
  const idx = data.expenses.findIndex((e) => e.id === expense.id)
  if (idx !== -1) data.expenses[idx] = expense
  save(data)
  return getExpenses()
}

export function deleteExpense(id: string): Expense[] {
  const data = load()
  data.expenses = data.expenses.filter((e) => e.id !== id)
  save(data)
  return getExpenses()
}

// --- Nastavení ---

export function getSettings(): Settings {
  return load().settings
}

export function saveSettings(settings: Settings): Settings {
  const data = load()
  data.settings = settings
  save(data)
  return settings
}

export function getDataFilePath(): string {
  return getDataPath()
}
