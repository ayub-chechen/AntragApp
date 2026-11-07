import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { umbrechen, type Schriften } from "./pdf";

export interface Brief {
  absender: string[];
  empfaenger: string[];
  ortDatum: string;
  betreff: string;
  /** Text ohne Anrede; Absätze mit Leerzeile getrennt. */
  text: string;
  name: string;
  anlagen?: string[];
}

const A4: [number, number] = [595.28, 841.89];
const MM = 72 / 25.4;
const LINKS = 25 * MM;
const RECHTS = 20 * MM;
const TINTE = rgb(0.1, 0.1, 0.1);
const GRAU = rgb(0.38, 0.38, 0.38);

/** Ganzer Brieftext, z. B. zum Kopieren in eine E-Mail oder ein Online-Formular. */
export function briefAlsText(b: Brief): string {
  return [
    b.absender.join(", "),
    "",
    ...b.empfaenger,
    "",
    b.ortDatum,
    "",
    b.betreff,
    "",
    "Sehr geehrte Damen und Herren,",
    "",
    b.text,
    "",
    "Mit freundlichen Grüßen",
    "",
    b.name,
    ...(b.anlagen?.length ? ["", `Anlagen: ${b.anlagen.join(", ")}`] : []),
  ].join("\n");
}

/**
 * Erzeugt Briefe nach DIN 5008 (vereinfacht), einen pro Seite, damit man sie
 * ausdrucken, unterschreiben und in ein Fensterkuvert stecken kann.
 */
export async function erzeugeBriefe(briefe: Brief[], schriften: Schriften, titel = "Briefe"): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const normal = await doc.embedFont(schriften.normal, { subset: true });
  const fett = await doc.embedFont(schriften.fett, { subset: true });
  doc.setTitle(titel);
  doc.setLanguage("de-DE");
  doc.setCreator("Antragslotse Berlin");
  doc.setProducer("Antragslotse Berlin");

  const breite = A4[0] - LINKS - RECHTS;

  for (const b of briefe) {
    let seite: PDFPage = doc.addPage(A4);
    let y = A4[1] - 27 * MM;
    const zeile = (text: string, font: PDFFont, groesse: number, farbe = TINTE, abstand = 1.35) => {
      for (const z of umbrechen(text, font, groesse, breite)) {
        if (y < 25 * MM) {
          seite = doc.addPage(A4);
          y = A4[1] - 25 * MM;
        }
        seite.drawText(z, { x: LINKS, y: y - groesse, size: groesse, font, color: farbe });
        y -= groesse * abstand;
      }
    };

    // Rücksendeangabe klein über dem Anschriftfeld, Anschrift ab 45 mm von oben.
    y = A4[1] - 45 * MM;
    zeile(b.absender.join(" · "), normal, 7.5, GRAU);
    y -= 4;
    for (const z of b.empfaenger) zeile(z, normal, 11);

    y = A4[1] - 98 * MM;
    const datumBreite = normal.widthOfTextAtSize(b.ortDatum, 11);
    seite.drawText(b.ortDatum, { x: A4[0] - RECHTS - datumBreite, y: y - 11, size: 11, font: normal, color: TINTE });
    y -= 30;
    zeile(b.betreff, fett, 11.5);
    y -= 14;
    zeile("Sehr geehrte Damen und Herren,", normal, 11);
    y -= 8;
    for (const absatz of b.text.split(/\n{2,}/)) {
      for (const z of absatz.split("\n")) zeile(z, normal, 11, TINTE, 1.45);
      y -= 8;
    }
    zeile("Mit freundlichen Grüßen", normal, 11);
    y -= 40;
    seite.drawLine({ start: { x: LINKS, y: y + 8 }, end: { x: LINKS + 60 * MM, y: y + 8 }, thickness: 0.5, color: GRAU });
    zeile(b.name, normal, 11);
    if (b.anlagen?.length) {
      y -= 14;
      zeile("Anlagen", fett, 10);
      for (const a of b.anlagen) zeile(`– ${a}`, normal, 10);
    }
  }
  return doc.save();
}
