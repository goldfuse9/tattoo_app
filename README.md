# Tetování Tracker

Desktopová appka pro Mac na sledování příjmů, výdajů a spotřeby materiálu
tetovacího studia. Postavená na Electron + React + TypeScript, běží
kompletně offline — všechna data zůstávají v jednom souboru na tvém počítači.

## Co appka umí

- **Přehled** — souhrn za dnešek / tento týden / tento měsíc: příjem,
  náklady na materiál, ostatní výdaje, čistý zisk.
- **Zápisy** — jeden zápis = jedno sezení: datum, klient, kolik zaplatil,
  kolik jehel a kalíšků barvy jsi použil, případný ostatní materiál a
  poznámka. Náklady na materiál a zisk appka počítá sama.
- **Výdaje** — provozní náklady nevázané na klienta (nájem, vybavení,
  nákup zásob…).
- **Nastavení** — cena za jehlu a za kalíšek barvy, podle kterých se
  automaticky počítají náklady v Zápisech. Také tu vidíš, kam se ukládá
  datový soubor.
- **Export do CSV** — v Zápisech, pro účetnictví nebo zálohu.

Vizuálně appka vychází z estetiky účetní knihy a tetovacích šablon
(stencil papír) — tmavé pozadí, sériový nadpisový font, zlatá pro zisk a
červená pro náklady (starý účetní zvyk).

## Spuštění (vývojový režim)

Potřebuješ [Node.js](https://nodejs.org) (verze 18+). V terminálu:

```bash
cd tattoo-tracker
npm install
npm run dev
```

Otevře se appka v okně. V tomto režimu se automaticky obnovuje při úpravě
kódu.

## Sestavení .dmg bez vlastního Macu (GitHub Actions)

Projekt obsahuje hotový workflow (`.github/workflows/build-mac.yml`), který
appku sestaví na skutečném Macu v cloudu zdarma přes GitHub Actions —
nemusíš nic instalovat ani mít po ruce Mac.

1. Nahraj tuhle složku (i s `.github/`) do GitHub repozitáře — klidně
   soukromého.
2. V repozitáři otevři záložku **Actions**, klikni na **Build macOS app**
   → **Run workflow**. (Při dalších push do `main` se spustí sám.)
3. Počkej pár minut — běží to na opravdovém macOS runneru.
4. V detailu doběhlého běhu, dole v sekci **Artifacts**, stáhneš hotový
   `.dmg` i `.zip`.

Na veřejném repozitáři je to úplně zdarma a bez limitu. Na soukromém
repozitáři to jede z měsíční kvóty minut (macOS runner se počítá 10×
oproti Linuxu) — jedno sestavení trvá pár minut, takže i na volném plánu
(2000 minut/měsíc) je v pohodě prostor na desítky sestavení.

## Sestavení jako opravdová Mac appka (lokálně)

Pokud po ruce Mac máš a chceš appku sestavit přímo na něm:

```bash
npm run build:mac
```

Tenhle příkaz musí běžet **na Macu** (potřebuje macOS nástroje pro
zabalení `.app`/`.dmg` — proto ho nešlo dokončit už tady). Po doběhnutí
najdeš hotovou appku ve složce `dist/` (přesnou cestu appka na konci
vypíše do terminálu) — `Tetování Tracker.dmg` si pak jen přetáhneš do
Applications jako každou jinou appku.

**Appka není podepsaná Apple certifikátem** (to vyžaduje placený Apple
Developer účet), takže při prvním spuštění macOS zahlásí, že appku od
neověřeného vývojáře nelze otevřít. Řešení:

1. Klikni na appku pravým tlačítkem → **Otevřít** → potvrdit **Otevřít**.
2. Pokud by to nepomohlo, spusť v Terminálu:
   `xattr -cr "/Applications/Tetování Tracker.app"`

Po prvním potvrzení se appka příště spouští normálně.

## Kde appka ukládá data

Všechno se ukládá lokálně v jednom JSON souboru (žádný cloud, žádný
účet) — přesnou cestu appka zobrazuje v záložce Nastavení. Pro zálohu
stačí tento soubor zkopírovat.

## Případná rozšíření do budoucna

- Vlastní ikonka appky (stačí přidat `build/icon.icns`).
- Víc kategorií/barev jehel a inkoustů, pokud bys chtěl detailnější
  rozpad nákladů.
- Synchronizace mezi více zařízeními přes Supabase — podobně jako u
  MiniFinance, pokud by se appka měla používat z víc míst.
