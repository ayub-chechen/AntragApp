# Vom Web zur App im Store

Der Antragslotse ist eine Progressive Web App (PWA). Sie lässt sich schon heute auf dem Handy
installieren (Symbol auf dem Startbildschirm, Vollbild, funktioniert offline). Für die App-Stores
gibt es drei Wege, ohne die App neu zu schreiben.

## 1. Hosting (Voraussetzung)

- Zum Testen: GitHub Pages (Workflow `.github/workflows/pages.yml`, einmalig unter Settings → Pages
  „GitHub Actions“ wählen).
- Für den Betrieb: eigene Domain (z. B. antragslotse.de) bei einem Anbieter in der EU mit HTTPS.
  Der Inhalt von `dist/` ist eine statische Website, es braucht keinen Server-Code.
- Zusätzlich als HTTP-Header setzen: `Content-Security-Policy` (wie im Build),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`.

## 2. Android (Google Play)

- **PWABuilder** (pwabuilder.com, kostenlos, von Microsoft): URL eingeben, „Package for stores“ →
  Android. Heraus kommt ein Paket (Trusted Web Activity), das die Web-App im Vollbild zeigt.
- Datei `/.well-known/assetlinks.json` auf der eigenen Domain ablegen (PWABuilder erzeugt sie).
  Das geht nur mit eigener Domain, nicht mit einer Unterseite von github.io.
- Google-Play-Entwicklerkonto: einmalig 25 US-Dollar. Bei neuen privaten Konten verlangt Google
  einen geschlossenen Test mit mindestens 12 Testern über 14 Tage; ein Organisationskonto (UG)
  braucht das nicht, dafür eine D-U-N-S-Nummer.

## 3. iPhone (App Store)

- **Capacitor** (capacitorjs.com, kostenlos): packt `dist/` in eine native iOS-Hülle.
  `npm i @capacitor/core @capacitor/cli @capacitor/ios`, `npx cap init`, `npx cap add ios`,
  dann in Xcode bauen. Braucht einen Mac.
- Apple-Entwicklerprogramm: 99 US-Dollar im Jahr.
- Apple lehnt reine „Website in einer Hülle“ oft ab (Richtlinie 4.2). Vorteil verschaffen mit
  nativen Funktionen: Erinnerungen als Mitteilungen, Kamera für Briefe und Unterlagen,
  Face ID statt PIN, Teilen-Menü.

## Was sich für die Store-Version lohnt

- Push-Erinnerungen an Fristen (heute: Kalenderdatei)
- Brief fotografieren und Text erkennen (OCR auf dem Gerät)
- Entsperren mit Fingerabdruck oder Face ID
- In-App-Kauf für Pakete pro Anlass (z. B. „Neu in Berlin“)

## Rechtliches vor dem Start

Impressum und Anbieterangaben, Datenschutzerklärung durch Fachperson, Hinweis „kein Angebot des
Landes Berlin“, keine Rechtsberatung (RDG). Beim Hosting Auftragsverarbeitungsvertrag prüfen, auch
wenn die App keine Personendaten an den Server sendet (Server-Logs mit IP-Adressen).
