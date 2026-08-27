import { FormEvent, useEffect, useState } from 'react'
import type { Settings } from '@shared/types'

interface Props {
  settings: Settings
  onSave: (settings: Settings) => Promise<void>
}

export default function SettingsView({ settings, onSave }: Props): JSX.Element {
  const [needlePrice, setNeedlePrice] = useState(String(settings.needlePrice))
  const [inkCupPrice, setInkCupPrice] = useState(String(settings.inkCupPrice))
  const [saved, setSaved] = useState(false)
  const [dataPath, setDataPath] = useState<string | null>(null)

  useEffect(() => {
    window.api.getDataPath().then(setDataPath)
  }, [])

  async function handleSubmit(ev: FormEvent): Promise<void> {
    ev.preventDefault()
    await onSave({
      needlePrice: Number(needlePrice) || 0,
      inkCupPrice: Number(inkCupPrice) || 0
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="view">
      <header className="view-header">
        <div>
          <p className="view-eyebrow">Ceny materiálu</p>
          <h1>Nastavení</h1>
        </div>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>Jednotkové ceny</h2>
        </div>
        <p className="panel-note">
          Podle těchto cen se v Zápisech automaticky počítají náklady na materiál z počtu použitých jehel a kalíšků
          barvy.
        </p>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Cena za jehlu (Kč)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={needlePrice}
              onChange={(e) => setNeedlePrice(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Cena za kalíšek barvy (Kč)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={inkCupPrice}
              onChange={(e) => setInkCupPrice(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Uložit nastavení
            </button>
            {saved && <span className="save-confirm">Uloženo</span>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Data</h2>
        </div>
        <p className="panel-note">
          Všechny záznamy se ukládají lokálně v jednom souboru na tomto počítači — nikam se neposílají. Pro zálohu
          stačí tento soubor zkopírovat.
        </p>
        {dataPath && <code className="data-path">{dataPath}</code>}
      </section>
    </div>
  )
}
