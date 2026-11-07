import type { Tx } from "../i18n/sprache";

/** Antworten auf Fragen. Datumsangaben immer als TT.MM.JJJJ, Ja/Nein als "ja"/"nein". */
export type Antworten = Record<string, string>;

export type FrageTyp = "datum" | "janein" | "auswahl" | "zahl" | "text" | "mehrfach";

export interface Option {
  wert: string;
  text: Tx;
}

export interface Frage {
  id: string;
  typ: FrageTyp;
  frage: Tx;
  hilfe?: Tx;
  optionen?: Option[];
  pflicht?: boolean;
  /** Frage nur zeigen, wenn diese Bedingung erfüllt ist. */
  wenn?: (a: Antworten) => boolean;
}

/** Arten von Unterlagen im Unterlagen-Ordner. */
export type DokArt =
  | "ausweis"
  | "aufenthalt"
  | "meldebescheinigung"
  | "wgb"
  | "mietvertrag"
  | "urkunde"
  | "einkommen"
  | "kontoauszug"
  | "steuer"
  | "bescheid"
  | "bescheinigung"
  | "versicherung"
  | "medizin"
  | "sonstiges";

export interface Frist {
  /** Ab wann man etwas tun kann. */
  ab?: Date;
  /** Bis wann man es spätestens tun sollte. */
  bis?: Date;
  /** Ungefährer Zeitpunkt, z. B. wann ein Brief kommt. */
  etwa?: Date;
}

export interface Schritt {
  id: string;
  titel: Tx;
  text: Tx;
  wenn?: (a: Antworten) => boolean;
  frist?: (a: Antworten, heute: Date) => Frist | null;
  /** Kurze Erklärung, woher die Frist kommt. */
  fristText?: Tx;
  wo?: Tx;
  geld?: Tx;
  unterlagen?: { art?: DokArt; text: Tx }[];
  link?: { url: string; text: Tx };
  intern?: { pfad: string; text: Tx };
  tipp?: Tx;
}

export interface Lebenslage {
  id: string;
  titel: Tx;
  kurz: Tx;
  fragen: Frage[];
  schritte: Schritt[];
}

export interface Leistung {
  id: string;
  name: Tx;
  was: Tx;
  wo: Tx;
  link?: string;
  lage?: string;
  /** Wichtiger Hinweis zu Rückwirkung oder Frist. */
  frist?: Tx;
}
