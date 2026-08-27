// Jeden zápis = jedno sezení s klientem
export interface Entry {
  id: string
  date: string // YYYY-MM-DD
  clientName: string
  payment: number // Kč přijaté od klienta
  needlesUsed: number // počet jehel
  inkCupsUsed: number // počet kalíšků barvy
  otherMaterialCost: number // Kč, ostatní materiál (rukavice, fólie, ubrousky...)
  note: string
  createdAt: string // ISO timestamp
}

export type ExpenseCategory = 'najem' | 'vybaveni' | 'material' | 'jine'

// Provozní výdaj, který není vázaný na konkrétního klienta
export interface Expense {
  id: string
  date: string // YYYY-MM-DD
  category: ExpenseCategory
  description: string
  amount: number // Kč
  createdAt: string
}

export interface Settings {
  needlePrice: number // Kč / jehla, pro automatický výpočet nákladů
  inkCupPrice: number // Kč / kalíšek barvy
}

export interface AppData {
  entries: Entry[]
  expenses: Expense[]
  settings: Settings
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  najem: 'Nájem a provoz',
  vybaveni: 'Vybavení',
  material: 'Materiál (nákup)',
  jine: 'Jiné'
}
