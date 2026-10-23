import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function keineA11yFehler(page: Page) {
  const ergebnis = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(ergebnis.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test("Startseite zeigt Lebenslagen und ist barrierefrei", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Was steht bei Ihnen an?");
  await expect(page.getByRole("link", { name: /Umzug/ })).toBeVisible();
  await keineA11yFehler(page);
});

test("Fehler werden verständlich angezeigt", async ({ page }) => {
  await page.goto("/#/antrag/wohnsitzanmeldung");
  await page.getByRole("button", { name: "Weiter" }).click();
  const liste = page.getByRole("alert");
  await expect(liste).toContainText("Bitte prüfen Sie 5 Angaben");
  await expect(liste).toBeFocused();
  await keineA11yFehler(page);

  await page.getByLabel("Postleitzahl").fill("20095");
  await page.getByRole("button", { name: "Weiter" }).click();
  await expect(page.getByText("Das ist keine Berliner Postleitzahl", { exact: false }).first()).toBeVisible();
  await liste.getByRole("link", { name: /Einzugsdatum/ }).click();
  await expect(page.getByLabel("Einzugsdatum")).toBeFocused();
});

test("Wohnsitzanmeldung ausfüllen und PDF herunterladen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Umzug/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Anmeldung einer Wohnung");

  // Erfundene Testperson
  await page.getByLabel("Einzugsdatum").fill("011026");
  await page.getByLabel("Einzugsdatum").blur();
  await expect(page.getByLabel("Einzugsdatum")).toHaveValue("01.10.2026");
  await page.getByLabel("Straße", { exact: true }).fill("Musterstraße");
  await page.getByLabel("Hausnummer").fill("12a");
  await page.getByLabel("Postleitzahl").fill("10115");
  await page.getByLabel("meine einzige Wohnung").check();
  await page.getByRole("button", { name: "Weiter" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Ihre Person" })).toBeFocused();
  await page.getByLabel("Familienname").fill("Müller-Łukasiewicz");
  await page.getByLabel("Vornamen").fill("Jörg");
  await page.getByLabel("Geschlecht").selectOption("maennlich");
  await page.getByLabel("Geburtsdatum").fill("24121990");
  await page.getByLabel("Geburtsort und Land").fill("Köln, Deutschland");
  await page.getByLabel("Staatsangehörigkeit").fill("deutsch");
  await page.getByLabel("Familienstand").selectOption("ledig");
  await page.getByLabel("Zugehörigkeit zu einer Religionsgesellschaft").selectOption("keine");
  await page.getByRole("button", { name: "Weiter" }).click();

  await page.getByLabel("im Ausland").check();
  await expect(page.getByRole("textbox", { name: "Staat", exact: true })).toBeVisible();
  await expect(page.getByLabel("Postleitzahl")).toHaveCount(0);
  await page.getByLabel("Straße und Hausnummer").fill("Rue de Rivoli 1");
  await page.getByRole("textbox", { name: "Ort", exact: true }).fill("Paris");
  await page.getByRole("textbox", { name: "Staat", exact: true }).fill("Frankreich");
  await page.getByRole("group", { name: "Behalten Sie die bisherige Wohnung?" }).getByLabel("nein").check();
  await page.getByRole("button", { name: "Weiter" }).click();

  await page.getByRole("button", { name: "Weiter" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Prüfen und speichern" })).toBeVisible();
  await expect(page.getByText("Müller-Łukasiewicz")).toBeVisible();
  await expect(page.getByText("24.12.1990")).toBeVisible();
  await keineA11yFehler(page);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF herunterladen" }).click();
  const datei = await download;
  expect(datei.suggestedFilename()).toBe("ausfuellhilfe-wohnsitzanmeldung.pdf");
  await expect(page.getByRole("status").filter({ hasText: "PDF heruntergeladen" })).toBeVisible();
  await expect(page.getByRole("link", { name: /service\.berlin\.de/ }).last()).toHaveAttribute("href", /service\.berlin\.de/);

  await page.getByRole("button", { name: "Alle Angaben löschen" }).click();
  await expect(page.getByLabel("Einzugsdatum")).toHaveValue("");
});

test("Keine Anfragen an fremde Server", async ({ page }) => {
  const fremd: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://localhost:4173") && !r.url().startsWith("blob:") && !r.url().startsWith("data:")) fremd.push(r.url());
  });
  await page.goto("/#/antrag/wohnsitzanmeldung");
  await page.waitForLoadState("networkidle");
  expect(fremd).toEqual([]);
});
