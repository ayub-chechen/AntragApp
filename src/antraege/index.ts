import type { Antrag } from "./typen";
import wohnsitzanmeldung from "./wohnsitzanmeldung.json";

export const antraege: Antrag[] = [wohnsitzanmeldung as Antrag];

export function findeAntrag(id: string): Antrag | undefined {
  return antraege.find((a) => a.id === id);
}

export interface Lebenslage {
  id: string;
  titel: string;
  beschreibung: string;
  antraege: string[];
}

export const lebenslagen: Lebenslage[] = [
  { id: "umzug", titel: "Umzug", beschreibung: "Neue Wohnung anmelden", antraege: ["wohnsitzanmeldung"] },
  { id: "kind", titel: "Kind bekommen", beschreibung: "Elterngeld, Kindergeld, Kita-Gutschein", antraege: [] },
  { id: "ausweis", titel: "Ausweis und Pass", beschreibung: "Personalausweis oder Reisepass beantragen", antraege: [] },
  { id: "wohnen", titel: "Wohnen und Miete", beschreibung: "Wohngeld, Wohnberechtigungsschein", antraege: [] },
  { id: "auto", titel: "Auto und Parken", beschreibung: "Bewohnerparkausweis, Fahrzeug ummelden", antraege: [] },
];
