import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { writeFileSync } from 'fs'
import { randomUUID } from 'crypto'
import * as store from './store'
import type { Entry, Expense, Settings } from '../shared/types'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 880,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#18151d',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Zápisy
  ipcMain.handle('entries:getAll', () => store.getEntries())
  ipcMain.handle('entries:add', (_e, entry: Omit<Entry, 'id' | 'createdAt'>) =>
    store.addEntry({ ...entry, id: randomUUID(), createdAt: new Date().toISOString() })
  )
  ipcMain.handle('entries:update', (_e, entry: Entry) => store.updateEntry(entry))
  ipcMain.handle('entries:delete', (_e, id: string) => store.deleteEntry(id))

  // Výdaje
  ipcMain.handle('expenses:getAll', () => store.getExpenses())
  ipcMain.handle('expenses:add', (_e, expense: Omit<Expense, 'id' | 'createdAt'>) =>
    store.addExpense({ ...expense, id: randomUUID(), createdAt: new Date().toISOString() })
  )
  ipcMain.handle('expenses:update', (_e, expense: Expense) => store.updateExpense(expense))
  ipcMain.handle('expenses:delete', (_e, id: string) => store.deleteExpense(id))

  // Nastavení
  ipcMain.handle('settings:get', () => store.getSettings())
  ipcMain.handle('settings:save', (_e, settings: Settings) => store.saveSettings(settings))
  ipcMain.handle('app:getDataPath', () => store.getDataFilePath())

  // Export do CSV
  ipcMain.handle('export:csv', async (_e, payload: { filename: string; content: string }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: payload.filename,
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (result.canceled || !result.filePath) return { saved: false as const }
    writeFileSync(result.filePath, payload.content, 'utf-8')
    return { saved: true as const, path: result.filePath }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
