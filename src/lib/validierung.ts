import type { Feld, Werte } from "../antraege/typen";

const DATUM = /^(\d{2})\.(\d{2})\.(\d{4})$/;

/** Liest ein Datum im Format TT.MM.JJJJ. Gibt null zurück, wenn es das Datum nicht gibt. */
export function parseDatum(text: string): Date | null {
  const m = DATUM.exec(text.trim());
  if (!m) return null;
  const [tag, monat, jahr] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(jahr, monat - 1, tag);
  if (d.getFullYear() !== jahr || d.getMonth() !== monat - 1 || d.getDate() !== tag) return null;
  return d;
}

/**
 * Bringt eine Datumseingabe in die Form TT.MM.JJJJ, z. B. „231026“, „23102026“,
 * „23.10.26“ oder „23-10-2026“ zu „23.10.2026“. Unklare Eingaben bleiben unverändert,
 * damit die Prüfung eine Fehlermeldung zeigen kann.
 */
export function normalisiereDatum(text: string, nurVergangenheit = false): string {
  const t = text.trim();
  let tag: string, monat: string, jahr: string;
  const getrennt = /^(\d{1,2})[.\-/ ](\d{1,2})[.\-/ ](\d{2}|\d{4})$/.exec(t);
  if (getrennt) [, tag, monat, jahr] = getrennt;
  else if (/^\d{6}$/.test(t) || /^\d{8}$/.test(t)) [tag, monat, jahr] = [t.slice(0, 2), t.slice(2, 4), t.slice(4)];
  else return text;

  if (jahr.length === 2) {
    const jetzt = heute();
    let voll = 2000 + Number(jahr);
    // Zweistellige Jahre: 20xx, außer das Datum läge zu weit in der Zukunft (z. B. Geburtsdatum „150885“).
    const kandidat = new Date(voll, Number(monat) - 1, Number(tag));
    if ((nurVergangenheit && kandidat > jetzt) || voll > jetzt.getFullYear() + 20) voll -= 100;
    jahr = String(voll);
  }
  const ergebnis = `${tag.padStart(2, "0")}.${monat.padStart(2, "0")}.${jahr}`;
  return parseDatum(ergebnis) ? ergebnis : text;
}

/** Vereinheitlicht eine Eingabe je nach Feldtyp, bevor sie geprüft wird. */
export function normalisiere(feld: Feld, wert: string): string {
  if (feld.typ !== "datum" || !wert) return wert;
  return normalisiereDatum(wert, feld.validierung === "datum_vergangenheit");
}

function heute(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function istPlz(text: string): boolean {
  return /^\d{5}$/.test(text.trim());
}

export function istBerlinerPlz(text: string): boolean {
  if (!istPlz(text)) return false;
  const n = Number(text.trim());
  return n >= 10115 && n <= 14199;
}

export function istIban(text: string): boolean {
  const iban = text.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  if (iban.startsWith("DE") && iban.length !== 22) return false;
  const umgestellt = iban.slice(4) + iban.slice(0, 4);
  let rest = 0;
  for (const z of umgestellt) {
    const wert = z >= "A" ? (z.charCodeAt(0) - 55).toString() : z;
    for (const ziffer of wert) rest = (rest * 10 + Number(ziffer)) % 97;
  }
  return rest === 1;
}

/** Steuer-Identifikationsnummer: 11 Ziffern, erste nicht 0, Prüfziffer nach ISO 7064 MOD 11,10. */
export function istSteuerId(text: string): boolean {
  const id = text.replace(/\s+/g, "");
  if (!/^[1-9]\d{10}$/.test(id)) return false;
  let produkt = 10;
  for (let i = 0; i < 10; i++) {
    let summe = (Number(id[i]) + produkt) % 10;
    if (summe === 0) summe = 10;
    produkt = (summe * 2) % 11;
  }
  const pruef = (11 - produkt) % 10;
  return pruef === Number(id[10]);
}

export function istTelefon(text: string): boolean {
  const t = text.trim();
  if (!/^\+?[\d\s/()-]+$/.test(t)) return false;
  const ziffern = t.replace(/\D/g, "");
  return ziffern.length >= 6 && ziffern.length <= 15;
}

/** Prüft ein Feld und gibt eine verständliche Fehlermeldung zurück, oder null. */
export function pruefeFeld(feld: Feld, wert: string | undefined): string | null {
  const v = (wert ?? "").trim();
  if (!v) return feld.pflicht ? `Bitte geben Sie „${feld.label}“ an.` : null;

  if (feld.optionen && !feld.optionen.some((o) => o.wert === v)) {
    return `Bitte wählen Sie bei „${feld.label}“ eine der Möglichkeiten.`;
  }

  switch (feld.validierung) {
    case "plz":
      return istPlz(v) ? null : "Die Postleitzahl hat 5 Ziffern, zum Beispiel 10115.";
    case "plz_berlin":
      if (!istPlz(v)) return "Die Postleitzahl hat 5 Ziffern, zum Beispiel 10115.";
      return istBerlinerPlz(v) ? null : "Das ist keine Berliner Postleitzahl. Berliner Postleitzahlen liegen zwischen 10115 und 14199.";
    case "datum":
    case "datum_vergangenheit":
    case "datum_zukunft": {
      const d = parseDatum(v);
      if (!d) return "Bitte schreiben Sie das Datum als TT.MM.JJJJ, zum Beispiel 01.03.2026.";
      if (feld.validierung === "datum_vergangenheit" && d > heute()) return "Dieses Datum darf nicht in der Zukunft liegen.";
      if (feld.validierung === "datum_zukunft" && d < heute()) return "Dieses Dokument ist abgelaufen. Bitte nehmen Sie ein gültiges Dokument.";
      return null;
    }
    case "iban":
      return istIban(v) ? null : "Die IBAN stimmt nicht. Bitte prüfen Sie sie noch einmal, zum Beispiel DE89 3704 0044 0532 0130 00.";
    case "steuer_id":
      return istSteuerId(v) ? null : "Die Steuer-ID hat 11 Ziffern. Bitte prüfen Sie die Nummer.";
    case "telefon":
      return istTelefon(v) ? null : "Bitte geben Sie eine Telefonnummer mit Vorwahl an, zum Beispiel 030 1234567.";
    default:
      return null;
  }
}

export function istSichtbar(feld: Feld, werte: Werte): boolean {
  return !feld.wenn || werte[feld.wenn.feld] === feld.wenn.wert;
}

export function pruefeSchritt(felder: Feld[], werte: Werte): Record<string, string> {
  const fehler: Record<string, string> = {};
  for (const feld of felder) {
    if (!istSichtbar(feld, werte)) continue;
    const meldung = pruefeFeld(feld, werte[feld.name]);
    if (meldung) fehler[feld.name] = meldung;
  }
  return fehler;
}

/** Hinweis, wenn das Einzugsdatum länger als zwei Wochen zurückliegt. Kein Fehler, nur Information. */
export function fristHinweis(einzug: string): string | null {
  const d = parseDatum(einzug);
  if (!d) return null;
  const tage = Math.floor((heute().getTime() - d.getTime()) / 86_400_000);
  if (tage > 14) return "Die Anmeldefrist von zwei Wochen ist schon vorbei. Melden Sie sich trotzdem so bald wie möglich an.";
  return null;
}
