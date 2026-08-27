/// <reference types="vite/client" />
import type { Entry, Expense, Settings } from '@shared/types'

export interface TrackerApi {
  entries: {
    getAll: () => Promise<Entry[]>
    add: (entry: Omit<Entry, 'id' | 'createdAt'>) => Promise<Entry[]>
    update: (entry: Entry) => Promise<Entry[]>
    delete: (id: string) => Promise<Entry[]>
  }
  expenses: {
    getAll: () => Promise<Expense[]>
    add: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense[]>
    update: (expense: Expense) => Promise<Expense[]>
    delete: (id: string) => Promise<Expense[]>
  }
  settings: {
    get: () => Promise<Settings>
    save: (settings: Settings) => Promise<Settings>
  }
  exportCsv: (payload: { filename: string; content: string }) => Promise<{ saved: boolean; path?: string }>
  getDataPath: () => Promise<string>
}

declare global {
  interface Window {
    api: TrackerApi
  }
}
