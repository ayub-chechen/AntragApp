# Antragshilfe Berlin

Eine Web-App (PWA), mit der Berlinerinnen und Berliner Verwaltungsanträge Schritt für Schritt
ausfüllen, ihre Angaben als PDF speichern und dann selbst beim Amt oder auf
[service.berlin.de](https://service.berlin.de) einreichen.

**Stufe 1:** Ausfüllhilfe. Die App reicht nichts selbst ein und ist kein Angebot des Landes Berlin.

## Stand

- Lebenslagen-Startseite, erster Antrag: **Anmeldung einer Wohnung** (Leistung 120686)
- Geführtes Formular mit Fortschritts-Linie, Validierung (PLZ, Datum, IBAN, Steuer-ID, Telefon)
- PDF-Übersicht der Angaben, auf dem Gerät erzeugt, mit eingebetteter Schrift für Umlaute und Sonderzeichen
- Übergabe: Link zu service.berlin.de, Unterlagen-Checkliste, Frist und Gebühr
- Keine Datenspeicherung, kein Server, keine Drittanbieter ([DSGVO-Vorprüfung](docs/datenschutz-check.md))
- Barrierefreiheit: Labels, Fehlerliste mit Fokus, Tastaturbedienung, axe-Prüfung in den Tests

## Technik

React 19, TypeScript, Vite, pdf-lib. Anträge sind als JSON beschrieben (`src/antraege/*.json`),
die Oberfläche baut sich daraus auf. Ein neuer Antrag braucht also vor allem eine neue JSON-Datei.

```bash
npm install
npm run dev        # Entwicklung
npm test           # Unit-Tests (Validierung, PDF)
npm run test:e2e   # Playwright-Tests inkl. Barrierefreiheit
npm run build      # Produktions-Build nach dist/
```

## Offen

- Angaben mit dem aktuellen amtlichen Anmeldeformular abgleichen (`stand_geprueft` im JSON) und
  prüfen, ob das amtliche PDF Formularfelder hat. Dann direkt das amtliche PDF befüllen (`pdf_feld`).
- Weitere Personen (Familie) in einer Anmeldung
- Optional: Profil auf dem Gerät speichern, nur mit Einwilligung und verschlüsselt
- Impressum, Anbieterangaben, Hosting
