import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Alle Angaben in diesen Tests sind erfunden.

async function keineA11yFehler(page: Page) {
  const ergebnis = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(ergebnis.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`)).toEqual([]);
}

test.describe("Barrierefreiheit aller Hauptseiten", () => {
  for (const pfad of ["/", "/lage/neu", "/lage/baby", "/check", "/termine", "/mein", "/brief", "/umzug-melden", "/hilfe", "/neuigkeiten", "/anleitung", "/organisationen", "/mehr", "/datenschutz"]) {
    test(pfad, async ({ page }) => {
      await page.goto(`/#${pfad}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await keineA11yFehler(page);
    });
  }
});

test("Fahrplan für ein Baby mit Fristen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Ein Baby kommt/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ein Baby kommt");

  await page.getByRole("button", { name: "Fahrplan erstellen" }).click();
  await expect(page.getByRole("alert")).toContainText("Bitte prüfen Sie");

  await page.getByLabel(/Geburtstermin/).fill("150327");
  await page.getByRole("group", { name: /verheiratet/ }).getByLabel("nein").check();
  await page.getByRole("group", { name: /schwangere Person angestellt/ }).getByLabel("ja").check();
  await page.getByRole("button", { name: "Fahrplan erstellen" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Ihr Fahrplan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Vaterschaft/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Elterngeld beantragen" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mutterschaftsgeld beantragen" })).toBeVisible();
  await keineA11yFehler(page);

  const haken = page.getByRole("button", { name: "Als erledigt markieren" }).first();
  await haken.click();
  await expect(page.getByRole("button", { name: /Erledigt/ }).first()).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: "Start" }).first().click();
  await expect(page.getByRole("heading", { level: 2, name: "Ihre Fahrpläne" })).toBeVisible();
  await expect(page.getByText(/1 von \d+ erledigt/)).toBeVisible();
});

test("Anspruchs-Check für eine Familie", async ({ page }) => {
  await page.goto("/#/check");
  await page.getByLabel("Wie alt sind Sie?").fill("34");
  await page.getByRole("group", { name: /Partnerin oder Partner/ }).getByLabel("ja").check();
  await page.getByLabel(/Wie alt sind die Kinder/).fill("1, 4");
  await page.getByLabel(/Angestellt/).check();
  await page.getByLabel(/netto/).fill("2300");
  await page.getByLabel(/Warmmiete/).fill("1050");
  await page.getByRole("button", { name: "Ergebnis zeigen" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Ihr Ergebnis" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Steht Ihnen wahrscheinlich zu" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kindergeld", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kinderzuschlag", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wohngeld", exact: true })).toBeVisible();
  await expect(page.getByText("518 €").first()).toBeVisible();
  await keineA11yFehler(page);
});

test("Sprache wechseln auf Russisch und Englisch", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Русский" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Что у вас происходит?");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Что у вас происходит?");
  await keineA11yFehler(page);

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What's coming up for you?");
  await page.goto("/#/antrag/wohnsitzanmeldung");
  // Das Formular selbst bleibt deutsch, weil das Amt es auf Deutsch braucht.
  await expect(page.getByText(/in German/).first()).toBeVisible();
});

test("Verschlüsselter Bereich: anlegen, sperren, mit PIN öffnen", async ({ page }) => {
  await page.goto("/#/mein");
  const pin = page.getByRole("textbox", { name: "PIN oder Passwort" });
  await pin.fill("sonne-2026");
  await page.getByLabel("PIN wiederholen").fill("sonne-2026");
  await page.getByRole("button", { name: "Verschlüsselt speichern" }).click();
  await expect(page.getByText("Gespeichert und verschlüsselt auf diesem Gerät.")).toBeVisible();

  await page.getByLabel("Vornamen").fill("Erika");
  await page.getByLabel("Familienname").fill("Beispiel");
  await page.waitForTimeout(500);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Ihre Angaben sind gesperrt" })).toBeVisible();
  await pin.fill("falsch-123");
  await page.getByRole("button", { name: "Entsperren" }).click();
  await expect(page.getByText("Die PIN stimmt nicht.")).toBeVisible();

  await pin.fill("sonne-2026");
  await page.getByRole("button", { name: "Entsperren" }).click();
  await expect(page.getByLabel("Vornamen")).toHaveValue("Erika");

  // Im Speicher steht nur verschlüsselter Text.
  const roh = await page.evaluate(
    () =>
      new Promise<string>((ok) => {
        const r = indexedDB.open("antragslotse");
        r.onsuccess = () => {
          const g = r.result.transaction("ablage").objectStore("ablage").get("tresor");
          g.onsuccess = () => ok(JSON.stringify(g.result));
        };
      }),
  );
  expect(roh).not.toContain("Erika");
  expect(roh).toContain("salz");

  // Profil wird im Formular vorausgefüllt.
  await page.goto("/#/antrag/wohnsitzanmeldung");
  await page.getByLabel("Einzugsdatum").fill("01.10.2026");
  await page.getByLabel("Straße", { exact: true }).fill("Musterstraße");
  await page.getByLabel("Hausnummer").fill("1");
  await page.getByLabel("Postleitzahl").fill("10115");
  await page.getByLabel("meine einzige Wohnung").check();
  await page.getByRole("button", { name: "Weiter" }).click();
  await expect(page.getByLabel("Familienname")).toHaveValue("Beispiel");
});

test("Brief erklären: Fristen richtig berechnet und übernommen", async ({ page }) => {
  await page.goto("/#/brief");
  await page.getByRole("button", { name: "Beispiel einfügen" }).click();
  await page.getByRole("button", { name: "Brief erklären" }).click();

  await expect(page.getByRole("heading", { name: "Das steht im Brief" })).toBeVisible();
  await expect(page.getByText("Jobcenter").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fristen und Termine" })).toBeVisible();
  const fristen = page.locator(".terminliste");
  // Frist aus dem Brief und Widerspruchsfrist: 02.11. + 4 Tage Zugang + 1 Monat = 06.12. (Sonntag) → Montag 07.12.
  await expect(fristen).toContainText("20. November 2026");
  await expect(fristen).toContainText("7. Dezember 2026");
  await keineA11yFehler(page);

  await fristen.getByRole("button", { name: "In Termine übernehmen" }).first().click();
  await expect(page.getByText("In Ihren Terminen gespeichert.").first()).toBeVisible();

  await page.goto("/#/termine");
  await expect(page.getByText(/20\.11\.2026|20\. November 2026/).first()).toBeVisible();
});

test("Termine: eigenen Termin eintragen und Kalenderdatei laden", async ({ page }) => {
  await page.goto("/#/termine");
  await page.getByLabel("Was?").fill("Termin Bürgeramt");
  await page.getByLabel("Datum", { exact: true }).fill("03.12.2026");
  await page.getByLabel("Uhrzeit").fill("09:30");
  await page.getByRole("button", { name: "Termin speichern" }).click();
  await expect(page.getByText("Termin Bürgeramt", { exact: true })).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Alle in den Kalender (.ics)" }).click();
  const datei = await download;
  expect(datei.suggestedFilename()).toBe("antragslotse-termine.ics");
  const inhalt = await (await datei.createReadStream()).toArray();
  const text = Buffer.concat(inhalt).toString("utf8");
  expect(text).toContain("BEGIN:VCALENDAR");
  expect(text).toContain("DTSTART;TZID=Europe/Berlin:20261203T093000");
});

test("Umzug melden: Briefe als PDF, ohne Verstoß gegen die Inhaltsrichtlinie", async ({ page }) => {
  const fehler: string[] = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  page.on("pageerror", (e) => fehler.push(e.message));
  await page.goto("/#/umzug-melden");
  await page.getByLabel("Ihr Name").fill("Erika Beispiel");
  await page.getByLabel("Umzugsdatum").fill("01.12.2026");
  await page.getByLabel("Bisherige Adresse").fill("Musterweg 1\n12345 Musterstadt");
  await page.getByLabel("Neue Adresse").fill("Beispielstraße 2\n10115 Berlin");
  await page.getByLabel("Krankenkasse").check();
  await page.getByLabel("Bank").check();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Alle Briefe als PDF" }).click();
  expect((await download).suggestedFilename()).toBe("umzug-briefe.pdf");
  expect(fehler).toEqual([]);
});

test("Keine Anfragen an fremde Server auf allen Seiten", async ({ page }) => {
  const fremd: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("http://localhost:4173") && !u.startsWith("blob:") && !u.startsWith("data:")) fremd.push(u);
  });
  const fehler: string[] = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  for (const pfad of ["/", "/lage/neu", "/check", "/termine", "/mein", "/brief", "/umzug-melden", "/hilfe", "/anleitung"]) {
    await page.goto(`/#${pfad}`);
    await page.waitForLoadState("networkidle");
  }
  expect(fremd).toEqual([]);
  expect(fehler).toEqual([]);
});
