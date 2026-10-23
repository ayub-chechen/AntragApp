import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Antrag, Werte } from "../antraege/typen";
import { zusammenfassung } from "./anzeige";

export interface Schriften {
  normal: ArrayBuffer | Uint8Array;
  fett: ArrayBuffer | Uint8Array;
}

const A4: [number, number] = [595.28, 841.89];
const RAND = 56;
const TINTE = rgb(0.086, 0.196, 0.239);
const GRAU = rgb(0.33, 0.38, 0.4);

/** Bricht Text so um, dass er in die Breite passt. */
function umbrechen(text: string, font: PDFFont, groesse: number, breite: number): string[] {
  const zeilen: string[] = [];
  for (const absatz of text.split("\n")) {
    let zeile = "";
    for (const wort of absatz.split(/\s+/)) {
      const probe = zeile ? `${zeile} ${wort}` : wort;
      if (font.widthOfTextAtSize(probe, groesse) <= breite || !zeile) zeile = probe;
      else {
        zeilen.push(zeile);
        zeile = wort;
      }
    }
    zeilen.push(zeile);
  }
  return zeilen;
}

/**
 * Erzeugt eine Übersicht der Angaben als PDF. Sie ersetzt nicht das amtliche Formular,
 * sondern hilft beim Übertragen und beim Termin. Schriften werden eingebettet,
 * damit Umlaute und Namen mit Sonderzeichen (z. B. ł, ş, ж) korrekt erscheinen.
 */
export async function erzeugePdf(antrag: Antrag, werte: Werte, schriften: Schriften, erstellt = new Date()): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const normal = await doc.embedFont(schriften.normal, { subset: true });
  const fett = await doc.embedFont(schriften.fett, { subset: true });

  doc.setTitle(`Ausfüllhilfe: ${antrag.titel}`);
  doc.setLanguage("de-DE");
  doc.setCreator("Antragshilfe Berlin");
  doc.setProducer("Antragshilfe Berlin");
  doc.setCreationDate(erstellt);
  doc.setModificationDate(erstellt);

  const breite = A4[0] - 2 * RAND;
  let seite: PDFPage = doc.addPage(A4);
  let y = A4[1] - RAND;

  const platz = (hoehe: number) => {
    if (y - hoehe < RAND + 24) {
      seite = doc.addPage(A4);
      y = A4[1] - RAND;
    }
  };

  const text = (inhalt: string, font: PDFFont, groesse: number, farbe = TINTE, x = RAND, max = breite) => {
    for (const zeile of umbrechen(inhalt, font, groesse, max)) {
      platz(groesse * 1.4);
      seite.drawText(zeile, { x, y: y - groesse, size: groesse, font, color: farbe });
      y -= groesse * 1.4;
    }
  };

  text("Ausfüllhilfe – kein amtliches Formular", normal, 10, GRAU);
  y -= 4;
  text(antrag.titel, fett, 22);
  y -= 2;
  text(
    `Erstellt am ${erstellt.toLocaleDateString("de-DE")} mit der Antragshilfe Berlin. ` +
      "Übertragen Sie diese Angaben in das amtliche Formular oder nutzen Sie sie für die Online-Anmeldung.",
    normal,
    10,
    GRAU,
  );
  y -= 12;

  for (const abschnitt of zusammenfassung(antrag, werte)) {
    platz(40);
    y -= 6;
    seite.drawRectangle({ x: RAND, y: y - 2, width: breite, height: 1, color: TINTE });
    y -= 8;
    text(abschnitt.titel, fett, 13);
    y -= 2;
    for (const { label, wert } of abschnitt.zeilen) {
      const labelBreite = 170;
      const labelZeilen = umbrechen(label, normal, 9.5, labelBreite - 12);
      const zeilen = umbrechen(wert, normal, 11, breite - labelBreite);
      const hoehe = Math.max(labelZeilen.length * 12.5, zeilen.length * 15.4);
      platz(Math.min(hoehe, 15.4 * 3));
      const start = y;
      const startSeite = seite;
      labelZeilen.forEach((z, i) => {
        seite.drawText(z, { x: RAND, y: start - 11 - i * 12.5, size: 9.5, font: normal, color: GRAU });
      });
      for (const z of zeilen) {
        platz(15.4);
        seite.drawText(z, { x: RAND + labelBreite, y: y - 11, size: 11, font: normal, color: TINTE });
        y -= 15.4;
      }
      y = (seite === startSeite ? Math.min(y, start - labelZeilen.length * 12.5) : y) - 3;
    }
  }

  y -= 10;
  platz(60);
  text("Zum Termin mitbringen", fett, 13);
  for (const u of antrag.unterlagen) text(`☐  ${u}`, normal, 10.5, TINTE, RAND + 4, breite - 4);

  y -= 10;
  text("Zuständig", fett, 11);
  text(`${antrag.zustaendig}. Gebühr: ${antrag.gebuehr}.${antrag.frist ? ` Frist: ${antrag.frist}.` : ""}`, normal, 10);
  y -= 6;
  text(`Amtliche Informationen: ${antrag.quelle_url}`, normal, 10);
  text(`Stand der Angaben in der App: ${new Date(antrag.stand).toLocaleDateString("de-DE")}`, normal, 9, GRAU);

  const seiten = doc.getPages();
  seiten.forEach((s, i) => {
    s.drawText(`Seite ${i + 1} von ${seiten.length}`, { x: RAND, y: RAND - 20, size: 8.5, font: normal, color: GRAU });
  });

  return doc.save();
}
