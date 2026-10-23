# DSGVO-Vorprüfung: Grundgerüst und Wohnsitzanmeldung

Stand: 23.10.2026. Technische Vorprüfung, keine Rechtsberatung.

| Punkt | Status | Maßnahme |
| --- | --- | --- |
| Datenarten | Risiko | Identität, Anschrift, Geburtsdaten, Familienstand, Ausweisdaten. Religionszugehörigkeit ist eine besondere Kategorie (Art. 9 DSGVO). Nur Daten der antragstellenden Person, noch keine Familienangehörigen. |
| Zweck und Rechtsgrundlage | ok | Einziger Zweck: Ausfüllhilfe auf dem Gerät. Da nichts an den Anbieter übermittelt wird, findet keine Verarbeitung durch den Anbieter statt. Vor einer Server- oder Speicherfunktion Einwilligung (Art. 6 Abs. 1 a, Art. 9 Abs. 2 a) einführen. |
| Datenminimierung | ok | Nur Felder des Anmeldeformulars. Ausweisdaten sind freiwillig. Kein Tracking, keine Cookies. |
| Speicherort | ok | Nur im Arbeitsspeicher (`src/pages/AntragSeite.tsx`, `useState`). Kein localStorage, kein Server. Der Service Worker (`public/sw.js`) cacht nur App-Dateien. |
| Löschung | ok | Schließen der Seite löscht alles. Knopf „Alle Angaben löschen“. Export = PDF. |
| Drittanbieter | ok | Keine. Schriften (Atkinson Hyperlegible, DejaVu Sans) werden mit ausgeliefert. Playwright-Test prüft, dass keine fremden Server angefragt werden. |
| Sicherheit (Art. 32) | offen | Keine Logs von Formulardaten. Vor Veröffentlichung: Content-Security-Policy und Hosting mit HTTPS in der EU festlegen. Repo ist öffentlich: keine echten Personendaten oder Geheimnisse committen, Testdaten sind erfunden. |
| Transparenz | offen | Datenschutzseite in einfachem Deutsch vorhanden (`src/pages/Datenschutz.tsx`), Anbieterangaben und Impressum fehlen noch. |
| DSFA | offen | Sobald Daten gespeichert, synchronisiert oder übermittelt werden (Stufe 2, FIT-Connect/eID), Datenschutz-Folgenabschätzung (Art. 35) durchführen und Fachperson einbeziehen. |
