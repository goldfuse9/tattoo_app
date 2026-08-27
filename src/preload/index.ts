import { contextBridge, ipcRenderer } from 'electron'
import type { Entry, Expense, Settings } from '../shared/types'

const api = {
  entries: {
    getAll: (): Promise<Entry[]> => ipcRenderer.invoke('entries:getAll'),
    add: (entry: Omit<Entry, 'id' | 'createdAt'>): Promise<Entry[]> =>
      ipcRenderer.invoke('entries:add', entry),
    update: (entry: Entry): Promise<Entry[]> => ipcRenderer.invoke('entries:update', entry),
    delete: (id: string): Promise<Entry[]> => ipcRenderer.invoke('entries:delete', id)
  },
  expenses: {
    getAll: (): Promise<Expense[]> => ipcRenderer.invoke('expenses:getAll'),
    add: (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense[]> =>
      ipcRenderer.invoke('expenses:add', expense),
    update: (expense: Expense): Promise<Expense[]> => ipcRenderer.invoke('expenses:update', expense),
    delete: (id: string): Promise<Expense[]> => ipcRenderer.invoke('expenses:delete', id)
  },
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke('settings:get'),
    save: (settings: Settings): Promise<Settings> => ipcRenderer.invoke('settings:save', settings)
  },
  exportCsv: (payload: { filename: string; content: string }): Promise<{ saved: boolean; path?: string }> =>
    ipcRenderer.invoke('export:csv', payload),
  getDataPath: (): Promise<string> => ipcRenderer.invoke('app:getDataPath')
}

contextBridge.exposeInMainWorld('api', api)

export type TrackerApi = typeof api
