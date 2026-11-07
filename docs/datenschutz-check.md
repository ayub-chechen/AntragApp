# DSGVO-Vorprüfung: Antragslotse Berlin

Stand: 07.11.2026. Technische Vorprüfung, keine Rechtsberatung. Vorgänger-Stand vom 23.10.2026
(nur Wohnsitzanmeldung, nur Arbeitsspeicher) ist durch diese Fassung ersetzt.

| Punkt | Status | Maßnahme |
| --- | --- | --- |
| Datenarten | Risiko | Identität, Anschrift, Geburtsdaten, Familienstand, Kinder, Ausweis- und Steuernummern, Einkommen und Miete (Check), Inhalte von Behördenbriefen, hochgeladene Dokumente. Besondere Kategorien (Art. 9): Religionszugehörigkeit (Wohnsitzanmeldung), Gesundheit, Pflege und Behinderung (Check, Lebenslage Pflege), Schwangerschaft. |
| Zweck und Rechtsgrundlage | ok | Zweck: Orientierung und Ausfüllhilfe auf dem Gerät. Es wird nichts an den Anbieter übermittelt, eine Verarbeitung durch den Anbieter findet nicht statt. Das dauerhafte Speichern ist eine bewusste Entscheidung der Person (PIN festlegen) mit Erklärung vorher. |
| Datenminimierung | ok | Check fragt Alter, Beträge und Ja/Nein, keine Namen, und speichert nur mit PIN. Profilfelder sind alle freiwillig. Kein Tracking, keine Cookies, keine Analyse. |
| Speicherort | ok | Ohne PIN nur im Arbeitsspeicher (`src/lib/daten.tsx`), weg beim Schließen. Mit PIN in IndexedDB (`antragslotse` / `ablage` / `tresor`) als ein verschlüsselter Datensatz. `localStorage` enthält nur die gewählte Sprache. Der Service Worker (`public/sw.js`) cacht nur App-Dateien. |
| Verschlüsselung (Art. 32) | ok | `src/lib/tresor.ts`: Schlüssel aus PIN mit PBKDF2-SHA-256 (250.000 Runden, zufälliges Salz), AES-GCM-256 mit neuem IV bei jedem Speichern. Schlüssel nur im Arbeitsspeicher, automatische Sperre nach 15 Minuten. Unit-Test prüft, dass falsche PINs scheitern; Browser-Test prüft, dass in IndexedDB kein Klartext steht. Grenze: Eine kurze Ziffern-PIN ist bei Gerätezugriff durchprobierbar, daher mindestens 6 Zeichen und Hinweis auf längere Passphrasen. |
| Löschung | ok | „Alles auf diesem Gerät löschen“ mit Bestätigung, auch ohne PIN möglich (bei vergessener PIN). Einzelne Fahrpläne, Termine, Dokumente löschbar. |
| Übertragbarkeit | ok | Sicherung als Datei (verschlüsselt, gleiche PIN), Einspielen auf anderem Gerät. |
| Drittanbieter | ok | Keine. Schriften werden mit ausgeliefert. Content-Security-Policy im Build (`connect-src 'self'`) verhindert technisch das Senden an fremde Server. Playwright-Test prüft auf allen Hauptseiten, dass keine fremden Server angefragt werden. Links zu Behörden öffnen erst auf Klick. |
| Vorlesen | Hinweis | Nutzt die Sprachausgabe des Geräts (`speechSynthesis`). Einige Browser nutzen dafür Online-Stimmen des Herstellers. In der Datenschutzseite erwähnen. |
| Sicherheit sonstiges | offen | Beim Hosting zusätzlich Header setzen (CSP, `frame-ancestors 'none'`, `nosniff`), Hosting in der EU, Server-Logs ohne volle IP. Repo ist öffentlich: keine echten Personendaten oder Geheimnisse committen, alle Testdaten sind erfunden. |
| Transparenz | offen | Datenschutzseite in einfacher Sprache in DE/EN/RU vorhanden (`src/pages/Datenschutz.tsx`). Impressum, Anbieterangaben und eine geprüfte Datenschutzerklärung fehlen noch. |
| Rechtsdienstleistung | offen | Check und Brief-Erklärer sind als allgemeine Orientierung formuliert („keine Rechtsberatung“, Verweis auf Beratungsstellen). Vor dem Start von Fachperson prüfen lassen (RDG). |
| DSFA | offen | Wegen Art.-9-Daten auf dem Gerät noch keine Pflicht für den Anbieter, da er nichts verarbeitet. Sobald synchronisiert, an Organisationen geteilt oder übermittelt wird (Stufe 2, FIT-Connect/eID), Datenschutz-Folgenabschätzung (Art. 35) durchführen. |
