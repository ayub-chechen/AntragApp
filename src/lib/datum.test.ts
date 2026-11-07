import { describe, expect, it } from "vitest";
import { alterAm, alsText, istFeiertagBerlin, monatsende, naechsterWerktag, ostersonntag, plusMonate, tageBis } from "./datum";

const d = (j: number, m: number, t: number) => new Date(j, m - 1, t);

describe("Datum", () => {
  it("addiert Monate wie bei Fristen und kürzt auf das Monatsende", () => {
    expect(alsText(plusMonate(d(2026, 1, 31), 1))).toBe("28.02.2026");
    expect(alsText(plusMonate(d(2026, 11, 6), 1))).toBe("06.12.2026");
    expect(alsText(plusMonate(d(2027, 1, 15), -3))).toBe("15.10.2026");
  });

  it("kennt Ostern und die Berliner Feiertage", () => {
    expect(alsText(ostersonntag(2026))).toBe("05.04.2026");
    expect(alsText(ostersonntag(2027))).toBe("28.03.2027");
    expect(istFeiertagBerlin(d(2027, 3, 8))).toBe(true); // Frauentag
    expect(istFeiertagBerlin(d(2026, 4, 3))).toBe(true); // Karfreitag
    expect(istFeiertagBerlin(d(2026, 5, 14))).toBe(true); // Himmelfahrt
    expect(istFeiertagBerlin(d(2026, 11, 9))).toBe(false);
  });

  it("schiebt Fristen vom Wochenende und Feiertag auf den nächsten Werktag", () => {
    expect(alsText(naechsterWerktag(d(2026, 12, 6)))).toBe("07.12.2026"); // Sonntag
    expect(alsText(naechsterWerktag(d(2026, 12, 25)))).toBe("28.12.2026"); // Weihnachten, dann Wochenende
    expect(alsText(naechsterWerktag(d(2026, 11, 10)))).toBe("10.11.2026");
  });

  it("rechnet Tage, Monatsende und Alter", () => {
    expect(tageBis(d(2026, 11, 14), d(2026, 11, 7))).toBe(7);
    expect(tageBis(d(2026, 3, 30), d(2026, 3, 28))).toBe(2); // über die Zeitumstellung
    expect(alsText(monatsende(d(2028, 2, 10)))).toBe("29.02.2028");
    expect(alterAm(d(1990, 12, 24), d(2026, 12, 23))).toBe(35);
    expect(alterAm(d(1990, 12, 24), d(2026, 12, 24))).toBe(36);
  });
});
