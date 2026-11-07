/** Erzeugt eine iCalendar-Datei (.ics), die jede Kalender-App importieren kann. */

export interface KalenderEintrag {
  id: string;
  titel: string;
  datum: Date;
  uhrzeit?: string;
  beschreibung?: string;
}

const ZEITZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const zwei = (n: number) => String(n).padStart(2, "0");
const tagWert = (d: Date) => `${d.getFullYear()}${zwei(d.getMonth() + 1)}${zwei(d.getDate())}`;

function escape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Zeilen über 75 Bytes umbrechen (RFC 5545), ohne UTF-8-Zeichen zu zerteilen. */
function falte(zeile: string): string {
  const teile: string[] = [];
  let aktuell = "";
  let bytes = 0;
  for (const zeichen of zeile) {
    const laenge = new TextEncoder().encode(zeichen).length;
    if (bytes + laenge > (teile.length ? 74 : 75)) {
      teile.push(aktuell);
      aktuell = "";
      bytes = 0;
    }
    aktuell += zeichen;
    bytes += laenge;
  }
  teile.push(aktuell);
  return teile.join("\r\n ");
}

export function erzeugeIcs(eintraege: KalenderEintrag[], jetzt = new Date()): string {
  const stempel = jetzt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const zeilen = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Antragslotse Berlin//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...ZEITZONE];
  for (const e of eintraege) {
    zeilen.push("BEGIN:VEVENT", `UID:${e.id}@antragslotse.berlin`, `DTSTAMP:${stempel}`);
    const zeit = e.uhrzeit && /^(\d{1,2})[:.](\d{2})$/.exec(e.uhrzeit);
    if (zeit) {
      const start = `${tagWert(e.datum)}T${zwei(Number(zeit[1]))}${zeit[2]}00`;
      const ende = new Date(e.datum.getFullYear(), e.datum.getMonth(), e.datum.getDate(), Number(zeit[1]) + 1, Number(zeit[2]));
      zeilen.push(`DTSTART;TZID=Europe/Berlin:${start}`, `DTEND;TZID=Europe/Berlin:${tagWert(ende)}T${zwei(ende.getHours())}${zwei(ende.getMinutes())}00`);
    } else {
      const folgetag = new Date(e.datum.getFullYear(), e.datum.getMonth(), e.datum.getDate() + 1);
      zeilen.push(`DTSTART;VALUE=DATE:${tagWert(e.datum)}`, `DTEND;VALUE=DATE:${tagWert(folgetag)}`);
    }
    zeilen.push(`SUMMARY:${escape(e.titel)}`);
    if (e.beschreibung) zeilen.push(`DESCRIPTION:${escape(e.beschreibung)}`);
    // Erinnerungen: 3 Tage vorher und am Vortag, jeweils 9 Uhr bei ganztägigen Einträgen.
    for (const [trigger, text] of zeit
      ? [
          ["-P3D", "In 3 Tagen"],
          ["-PT2H", "In 2 Stunden"],
        ]
      : [
          ["-P2DT15H", "In 3 Tagen"],
          ["-PT15H", "Morgen"],
        ]) {
      zeilen.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escape(`${text}: ${e.titel}`)}`, `TRIGGER:${trigger}`, "END:VALARM");
    }
    zeilen.push("END:VEVENT");
  }
  zeilen.push("END:VCALENDAR");
  return zeilen.map(falte).join("\r\n") + "\r\n";
}
