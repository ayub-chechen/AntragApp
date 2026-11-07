import type { Antworten, Frage, Frist, Lebenslage, Schritt } from "../inhalte/typen";
import { lies, tageBis } from "./datum";

export type Status = "erledigt" | "ueberfaellig" | "bald" | "offen";

export interface FahrplanSchritt {
  schritt: Schritt;
  frist: Frist | null;
  /** Wichtigstes Datum für Sortierung und Kalender. */
  datum: Date | null;
  status: Status;
}

/** Fragen, die bei diesen Antworten zu sehen sind. */
export function sichtbareFragen(fragen: Frage[], a: Antworten): Frage[] {
  return fragen.filter((f) => !f.wenn || f.wenn(a));
}

/** Prüft Pflichtfragen und Datumsangaben. Gibt die IDs der Fragen mit Fehler zurück. */
export function fehlendeAntworten(fragen: Frage[], a: Antworten): string[] {
  return sichtbareFragen(fragen, a)
    .filter((f) => {
      const w = a[f.id]?.trim();
      if (f.typ === "datum" && w) return !lies(w);
      return f.pflicht && !w;
    })
    .map((f) => f.id);
}

export function hauptdatum(f: Frist | null): Date | null {
  return f ? (f.bis ?? f.etwa ?? f.ab ?? null) : null;
}

/**
 * Erstellt den persönlichen Fahrplan: nur Schritte, die auf die Antworten passen,
 * mit berechneten Fristen und zeitlich geordnet. Schritte ohne Datum bleiben
 * hinter dem Schritt, nach dem sie im Inhalt stehen.
 */
export function erstelleFahrplan(lage: Lebenslage, a: Antworten, erledigt: string[], heute: Date): FahrplanSchritt[] {
  let zuletzt = -Infinity;
  const liste = lage.schritte
    .filter((s) => !s.wenn || s.wenn(a))
    .map((schritt, index) => {
      const frist = schritt.frist?.(a, heute) ?? null;
      const datum = hauptdatum(frist);
      if (datum) zuletzt = datum.getTime();
      const istErledigt = erledigt.includes(schritt.id);
      let status: Status = "offen";
      if (istErledigt) status = "erledigt";
      else if (frist?.bis) {
        const tage = tageBis(frist.bis, heute);
        status = tage < 0 ? "ueberfaellig" : tage <= 14 ? "bald" : "offen";
      }
      return { schritt, frist, datum, status, sortierung: datum?.getTime() ?? zuletzt, index };
    });
  liste.sort((x, y) => (x.sortierung === y.sortierung ? x.index - y.index : x.sortierung < y.sortierung ? -1 : 1));
  return liste.map(({ schritt, frist, datum, status }) => ({ schritt, frist, datum, status }));
}
