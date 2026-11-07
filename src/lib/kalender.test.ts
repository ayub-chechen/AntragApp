import { describe, expect, it } from "vitest";
import { erzeugeIcs } from "./kalender";

describe("Kalender", () => {
  const ics = erzeugeIcs(
    [
      { id: "a", titel: "Frist: Elterngeld beantragen, bitte; jetzt", datum: new Date(2027, 3, 15) },
      { id: "b", titel: "Termin Jobcenter", datum: new Date(2026, 10, 20), uhrzeit: "9:30", beschreibung: "Zeile 1\nZeile 2" },
      { id: "c", titel: "Подать заявление на пособие по уходу за ребёнком и много другого текста", datum: new Date(2026, 11, 1) },
    ],
    new Date("2026-11-07T10:00:00Z"),
  );

  it("ist gültiges iCalendar mit CRLF und Zeitzone", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("TZID:Europe/Berlin");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
  });

  it("legt ganztägige Fristen und Termine mit Uhrzeit an", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20270415");
    expect(ics).toContain("DTEND;VALUE=DATE:20270416");
    expect(ics).toContain("DTSTART;TZID=Europe/Berlin:20261120T093000");
    expect(ics).toContain("DTEND;TZID=Europe/Berlin:20261120T103000");
  });

  it("maskiert Sonderzeichen und erinnert vorher", () => {
    expect(ics).toContain("SUMMARY:Frist: Elterngeld beantragen\\, bitte\\; jetzt");
    expect(ics).toContain("DESCRIPTION:Zeile 1\\nZeile 2");
    expect(ics).toContain("TRIGGER:-PT15H");
    expect(ics).toContain("TRIGGER:-PT2H");
  });

  it("faltet lange Zeilen bei höchstens 75 Bytes", () => {
    for (const zeile of ics.split("\r\n")) expect(new TextEncoder().encode(zeile).length).toBeLessThanOrEqual(75);
    expect(ics.replace(/\r\n /g, "")).toContain("SUMMARY:Подать заявление на пособие по уходу за ребёнком и много другого текста");
  });
});
