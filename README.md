# Antragslotse Berlin

Eine Web-App (PWA), die Menschen in Berlin durch Anträge und Behördenpost lotst: Sie sagen, was in
Ihrem Leben passiert, und bekommen einen persönlichen Fahrplan mit Anträgen, Unterlagen und Fristen.
Auf Deutsch, Englisch und Russisch. Alle Angaben bleiben auf dem Gerät, auf Wunsch verschlüsselt.

Die App reicht nichts selbst ein, ersetzt keine Rechtsberatung und ist kein Angebot des Landes Berlin.
Sie führt zu den offiziellen Online-Diensten (service.berlin.de, ElterngeldDigital, BAföG Digital,
jobcenter.digital usw.).

## Was die App kann

| Bereich | Was es tut |
| --- | --- |
| **Lebenslagen-Lotse** | 6 Lebenslagen (Neu in Berlin, Baby, Studium, Job verloren, Geld reicht nicht, Pflege/Rente). Ein paar Fragen, dann ein Fahrplan mit Reihenfolge, Fristen, Unterlagen, Stellen und offiziellen Links. Schritte abhaken, vorlesen, drucken, teilen. |
| **Anspruchs-Check** | 16 Leistungen (Kindergeld, Kinderzuschlag, Wohngeld, Grundsicherungsgeld, Elterngeld, BAföG, Unterhaltsvorschuss, Pflegegeld …) mit Beträgen 2026, Begründung und Vorrang-Hinweisen. Orientierung, keine Zusage. |
| **Termine und Fristen** | Alle Fristen aus den Fahrplänen, Ablaufdaten von Ausweisen und eigene Termine an einem Ort. Export als Kalenderdatei (.ics) mit Erinnerung. |
| **Brief verstehen** | Text eines Amtsbriefs einfügen: erkennt Absender, Art des Briefs, Aktenzeichen, Beträge und Fristen (inkl. Widerspruchsfrist nach Zugangsregel, Wochenende und Berliner Feiertagen), erklärt Amtswörter, bereitet eine Antwort als PDF vor. |
| **Umzug melden** | Ein Formular, Briefe an bis zu 12 Stellen (Krankenkasse, Bank, Familienkasse …) als ein PDF. |
| **Ausfüllhilfe Wohnungsanmeldung** | Geführtes Formular mit Prüfungen, vorausgefüllt aus dem Profil, PDF für das Bürgeramt. |
| **Mein Bereich** | Profil (einmal eingeben, überall nutzen), Kinder, Unterlagen-Ordner mit Fotos/PDFs und Ablaufdatum, Sicherung als Datei, PIN ändern. Verschlüsselt mit AES-256, Schlüssel aus Ihrer PIN. |
| **Hilfe, Neuigkeiten, Für Organisationen** | Kostenlose Beratungsstellen, Regel-Änderungen 2026, Angebot für Beratungsstellen und Firmen. |

Kurze Anleitung für Nutzerinnen und Nutzer: [docs/anleitung.md](docs/anleitung.md) (auch in der App unter „Mehr → So funktioniert's“).

## Ausprobieren und veröffentlichen

```bash
npm install
npm run dev        # Entwicklung auf http://localhost:5173
npm test           # Unit-Tests (Fristen, Feiertage, Check, Brief-Erklärer, Verschlüsselung, Kalender, PDF)
npm run test:e2e   # Browser-Tests auf Desktop und Handy inkl. Barrierefreiheit (axe) und „keine fremden Server“
npm run build      # Produktions-Build nach dist/
```

Veröffentlichen: Nach dem Zusammenführen in `main` baut `.github/workflows/pages.yml` die App und stellt
sie auf GitHub Pages bereit. Dafür einmalig im Repository unter **Settings → Pages → Source** „GitHub
Actions“ wählen. Für den echten Betrieb besser ein Hosting in der EU mit eigener Domain
(siehe [docs/app-stores.md](docs/app-stores.md)).

Als App in die Stores: [docs/app-stores.md](docs/app-stores.md).

## Technik

React 19, TypeScript, Vite, pdf-lib. Kein Server, keine Cookies, kein Tracking, strenge
Content-Security-Policy im Build. Inhalte (Lebenslagen, Leistungen, Brief-Muster, Neuigkeiten) liegen
als Daten in `src/inhalte/`, Anträge als JSON in `src/antraege/`. Rechenlogik in `src/lib/`
(Fahrplan, Fristen, Check, Brief-Erklärer, Tresor), Seiten in `src/pages/`.

## Offen

- Inhalte fachlich prüfen lassen (Beträge, Fristen, Links) und einen Pflegeprozess festlegen
- Impressum, Anbieterangaben, Hosting in der EU, Datenschutzerklärung durch Fachperson
- Weitere Anträge als Ausfüllhilfe (Wohngeld, Kita-Gutschein, Elterngeld-Vorbereitung)
- Zahlungen (Paket pro Anlass) und Zugänge für Organisationen
- Store-Apps (siehe [docs/app-stores.md](docs/app-stores.md))
