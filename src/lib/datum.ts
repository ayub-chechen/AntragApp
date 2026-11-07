import { parseDatum } from "./validierung";

/** Alle Rechnungen mit Kalendertagen in Ortszeit, ohne Uhrzeit. */
export function tag(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function heute(): Date {
  return tag(new Date());
}

export function plusTage(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/**
 * Addiert Monate wie bei Fristen nach § 188 BGB: Gibt es den Tag im Zielmonat nicht
 * (z. B. 31. → Februar), endet die Frist am letzten Tag des Monats.
 */
export function plusMonate(d: Date, n: number): Date {
  const ziel = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const letzter = new Date(ziel.getFullYear(), ziel.getMonth() + 1, 0).getDate();
  return new Date(ziel.getFullYear(), ziel.getMonth(), Math.min(d.getDate(), letzter));
}

export function monatsende(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function tageBis(d: Date, von = heute()): number {
  return Math.round((tag(d).getTime() - tag(von).getTime()) / 86_400_000);
}

export function alsText(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function alsIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Liest TT.MM.JJJJ (Eingaben der App). */
export function lies(text: string | undefined): Date | null {
  return text ? parseDatum(text) : null;
}

/** Ostersonntag nach der Gaußschen Osterformel (gregorianisch). */
export function ostersonntag(jahr: number): Date {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31);
  const t = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(jahr, monat - 1, t);
}

/** Gesetzliche Feiertage in Berlin. */
export function istFeiertagBerlin(d: Date): boolean {
  const j = d.getFullYear();
  const fest = ["1.1", "8.3", "1.5", "3.10", "25.12", "26.12"];
  if (fest.includes(`${d.getDate()}.${d.getMonth() + 1}`)) return true;
  const ostern = ostersonntag(j);
  return [-2, 1, 39, 50].some((n) => plusTage(ostern, n).getTime() === tag(d).getTime());
}

/** Fällt das Fristende auf Samstag, Sonntag oder Feiertag, endet sie am nächsten Werktag (§ 193 BGB, § 26 SGB X). */
export function naechsterWerktag(d: Date): Date {
  let x = tag(d);
  while (x.getDay() === 0 || x.getDay() === 6 || istFeiertagBerlin(x)) x = plusTage(x, 1);
  return x;
}

/** Alter in vollen Jahren an einem Stichtag. */
export function alterAm(geburt: Date, stichtag = heute()): number {
  let jahre = stichtag.getFullYear() - geburt.getFullYear();
  if (stichtag.getMonth() < geburt.getMonth() || (stichtag.getMonth() === geburt.getMonth() && stichtag.getDate() < geburt.getDate())) jahre--;
  return jahre;
}
