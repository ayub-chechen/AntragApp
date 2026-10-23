import type { Antrag, Feld, Werte } from "../antraege/typen";
import { istSichtbar } from "./validierung";

export function anzeigeWert(feld: Feld, wert: string | undefined): string {
  const v = (wert ?? "").trim();
  if (!v) return "";
  return feld.optionen?.find((o) => o.wert === v)?.label ?? v;
}

export interface Abschnitt {
  titel: string;
  zeilen: { label: string; wert: string }[];
}

/** Alle ausgefüllten, sichtbaren Felder, gruppiert nach Schritt. */
export function zusammenfassung(antrag: Antrag, werte: Werte): Abschnitt[] {
  return antrag.schritte
    .map((s) => ({
      titel: s.titel,
      zeilen: antrag.felder
        .filter((f) => f.schritt === s.id && istSichtbar(f, werte))
        .map((f) => ({ label: f.label, wert: anzeigeWert(f, werte[f.name]) }))
        .filter((z) => z.wert),
    }))
    .filter((a) => a.zeilen.length > 0);
}
