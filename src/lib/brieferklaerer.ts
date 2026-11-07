import { tx, type Tx } from "../i18n/sprache";
import { absenderListe, briefArten, glossar, type BriefArt, type Wort } from "../inhalte/briefe";
import { alsText, lies, naechsterWerktag, plusMonate, plusTage } from "./datum";
import { normalisiereDatum } from "./validierung";

export interface GefundeneFrist {
  art: "bis" | "termin" | "widerspruch" | "klage" | "relativ";
  datum: Date;
  uhrzeit?: string;
  titel: Tx;
  /** Textstelle im Brief, damit man es nachprüfen kann. */
  stelle: string;
  verschoben?: boolean;
}

export interface Analyse {
  arten: BriefArt[];
  absender?: Tx;
  briefdatum?: Date;
  zugang?: Date;
  aktenzeichen?: string;
  betraege: string[];
  fristen: GefundeneFrist[];
  woerter: Wort[];
}

const DATUM = String.raw`(\d{1,2}\.\s?\d{1,2}\.\s?(?:\d{4}|\d{2}))`;
const ZAHLWORT: Record<string, number> = { einer: 1, eines: 1, einem: 1, ein: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, acht: 8, zehn: 10, vierzehn: 14 };

function datumAus(text: string): Date | null {
  return lies(normalisiereDatum(text.replace(/\s/g, "")));
}

function stelle(text: string, index: number, laenge: number): string {
  const start = Math.max(0, index - 40);
  return (start > 0 ? "…" : "") + text.slice(start, index + laenge + 30).replace(/\s+/g, " ").trim() + "…";
}

/** Sucht das Datum des Schreibens: „Berlin, den 12.10.2026“, „Datum: …“ oder das erste Datum oben im Brief. */
export function findeBriefdatum(text: string): Date | undefined {
  const mitWort = new RegExp(String.raw`(?:datum|berlin|den)\s*[:,]?\s*(?:den\s*)?${DATUM}`, "i").exec(text);
  if (mitWort) return datumAus(mitWort[1]) ?? undefined;
  const oben = new RegExp(DATUM).exec(text.slice(0, 600));
  return oben ? (datumAus(oben[1]) ?? undefined) : undefined;
}

/**
 * Erklärt einen Behördenbrief anhand von Schlüsselwörtern. Alles läuft auf dem Gerät,
 * der Text wird nicht gesendet. Fristen nach Bekanntgabe: Briefdatum + 4 Tage
 * (§ 37 SGB X, § 41 VwVfG, seit 2025), späterer tatsächlicher Zugang zählt.
 */
export function analysiere(text: string, optionen: { briefdatum?: Date; erhalten?: Date } = {}): Analyse {
  const t = text.replace(/ /g, " ");
  const briefdatum = optionen.briefdatum ?? findeBriefdatum(t);
  let zugang = briefdatum ? plusTage(briefdatum, 4) : undefined;
  if (optionen.erhalten && (!zugang || optionen.erhalten > zugang)) zugang = optionen.erhalten;
  const fristen: GefundeneFrist[] = [];

  // Feste Daten mit „bis“, „spätestens“ oder „vorlegen bis“.
  const bisMuster = new RegExp(String.raw`(?:bis\s+(?:zum|spätestens|einschließlich)?|spätestens\s+(?:am|bis(?:\s+zum)?)?|innerhalb\s+.{0,25}?bis\s+(?:zum)?)\s*${DATUM}`, "gi");
  for (const m of t.matchAll(bisMuster)) {
    const d = datumAus(m[1]);
    if (d && !fristen.some((f) => f.datum.getTime() === d.getTime()))
      fristen.push({ art: "bis", datum: d, titel: tx("Frist laut Brief", "Deadline in the letter", "Срок по письму"), stelle: stelle(t, m.index!, m[0].length) });
  }

  // Termine mit Uhrzeit.
  const terminMuster = new RegExp(String.raw`(?:am|termin[^\n.]{0,20}?)\s*(?:\w+,\s*(?:den\s*)?)?${DATUM}\s*(?:,\s*)?um\s*(\d{1,2}[:.]\d{2})`, "gi");
  for (const m of t.matchAll(terminMuster)) {
    const d = datumAus(m[1]);
    if (d)
      fristen.push({
        art: "termin",
        datum: d,
        uhrzeit: m[2].replace(".", ":"),
        titel: tx("Termin laut Brief", "Appointment in the letter", "Встреча по письму"),
        stelle: stelle(t, m.index!, m[0].length),
      });
  }

  // Widerspruch oder Klage innerhalb eines Monats nach Bekanntgabe.
  const monatMuster = /(widerspruch|klage)[^]{0,200}?innerhalb\s+eines\s+monats|innerhalb\s+eines\s+monats[^]{0,200}?(widerspruch|klage)/gi;
  const monat = monatMuster.exec(t);
  if (monat && zugang) {
    const istKlage = /klage/i.test(monat[1] ?? monat[2] ?? "");
    const roh = plusMonate(zugang, 1);
    const datum = naechsterWerktag(roh);
    fristen.push({
      art: istKlage ? "klage" : "widerspruch",
      datum,
      verschoben: datum.getTime() !== roh.getTime(),
      titel: istKlage
        ? tx("Letzter Tag für eine Klage", "Last day to file a lawsuit", "Последний день для иска")
        : tx("Letzter Tag für einen Widerspruch", "Last day to object", "Последний день для возражения"),
      stelle: stelle(t, monat.index, monat[0].length),
    });
  }

  // Relative Fristen wie „innerhalb von 2 Wochen“ ab Zugang.
  const relativ = /innerhalb\s+(?:von\s+)?(\d+|einer|eines|einem|zwei|drei|vier|fünf|sechs|acht|zehn|vierzehn)\s+(tag|tage|tagen|woche|wochen)\b/gi;
  for (const m of t.matchAll(relativ)) {
    if (!zugang) break;
    const n = /\d/.test(m[1]) ? Number(m[1]) : (ZAHLWORT[m[1].toLowerCase()] ?? 0);
    if (!n) continue;
    const datum = naechsterWerktag(plusTage(zugang, /woche/i.test(m[2]) ? n * 7 : n));
    if (!fristen.some((f) => f.datum.getTime() === datum.getTime()))
      fristen.push({ art: "relativ", datum, titel: tx("Frist laut Brief", "Deadline in the letter", "Срок по письму"), stelle: stelle(t, m.index!, m[0].length) });
  }

  const az = /(aktenzeichen|geschäftszeichen|\baz\.?|bg-nummer|nummer der bedarfsgemeinschaft|kindergeldnummer|kundennummer|beitragsnummer|versicherungsnummer|steuernummer)\s*[:.]?\s*([A-Z0-9][A-Z0-9 /.\-]{3,28}[A-Z0-9])/i.exec(t);

  let arten = briefArten.filter((a) => a.muster.test(t));
  // „nicht bewilligt“ oder „Weiterbewilligung“ ist keine Bewilligung.
  if (arten.some((a) => a.id === "ablehnung" || a.id === "rueckforderung") || !/(?<!weiter)bewillig/i.test(t.replace(/nicht\s+bewilligt/gi, "")))
    arten = arten.filter((a) => a.id !== "bewilligung" || /wir gewähren|festgesetzt|werden .{0,40}(gewährt|gezahlt)/i.test(t));
  if (arten.some((a) => a.id === "ablehnung")) arten = arten.filter((a) => a.id !== "bewilligung");

  return {
    arten,
    absender: absenderListe.find((a) => a.muster.test(t))?.name,
    briefdatum,
    zugang,
    aktenzeichen: az?.[2].trim(),
    betraege: [...new Set([...t.matchAll(/\d{1,3}(?:\.\d{3})*,\d{2}\s?(?:€|EUR|Euro)/g)].map((m) => m[0]))].slice(0, 6),
    fristen: fristen.sort((a, b) => a.datum.getTime() - b.datum.getTime()),
    woerter: glossar.filter((w) => w.muster.test(t)),
  };
}

export const datumText = alsText;
