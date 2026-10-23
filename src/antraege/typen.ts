export type FeldTyp = "text" | "datum" | "auswahl" | "radio" | "plz";

export type Validierung =
  | "plz"
  | "plz_berlin"
  | "datum"
  | "datum_vergangenheit"
  | "datum_zukunft"
  | "iban"
  | "steuer_id"
  | "telefon";

export interface Option {
  wert: string;
  label: string;
}

export interface Feld {
  name: string;
  label: string;
  typ: FeldTyp;
  pflicht: boolean;
  schritt: string;
  validierung?: Validierung;
  hilfetext?: string;
  optionen?: Option[];
  autocomplete?: string;
  /** Feldname im amtlichen PDF. null, solange das Formular nicht analysiert ist. */
  pdf_feld: string | null;
  /** Gemeinsames Profil-Schema für wiederkehrende Personendaten. */
  profil?: string;
  /** Nur anzeigen, wenn ein anderes Feld einen bestimmten Wert hat. */
  wenn?: { feld: string; wert: string };
}

export interface Schritt {
  id: string;
  titel: string;
  beschreibung?: string;
}

export interface Antrag {
  id: string;
  titel: string;
  kurz: string;
  lebenslage: string;
  leistungs_id: string;
  quelle_url: string;
  online_url: string | null;
  stand: string;
  stand_geprueft: boolean;
  zustaendig: string;
  gebuehr: string;
  frist: string | null;
  unterlagen: string[];
  schritte: Schritt[];
  felder: Feld[];
}

export type Werte = Record<string, string>;
