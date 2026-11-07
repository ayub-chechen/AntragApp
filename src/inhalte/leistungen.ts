import { tx } from "../i18n/sprache";
import { LINKS } from "./links";
import type { Leistung } from "./typen";

/** Beträge Stand 2026, geprüft am 07.11.2026. */
export const BETRAG = {
  kindergeld: 259,
  kinderzuschlag: 297,
  regel: { allein: 563, partner: 506, u6: 357, u14: 390, u18: 471, erwachsenesKind: 451 },
  uvg: { u6: 227, u12: 299, u18: 394 },
  bafoeg: 992,
} as const;

export const leistungen: Leistung[] = [
  {
    id: "kindergeld",
    name: tx("Kindergeld", "Child benefit (Kindergeld)", "Kindergeld (пособие на ребёнка)"),
    was: tx(
      "Für jedes Kind unter 18 und für Kinder bis 25 in Ausbildung oder Studium.",
      "For every child under 18, and for children up to 25 in training or studies.",
      "На каждого ребёнка до 18 лет и до 25 лет, если он учится.",
    ),
    wo: tx("Familienkasse", "Family benefits office (Familienkasse)", "Familienkasse"),
    link: LINKS.familienkasse,
    lage: "baby",
    frist: tx("Nur 6 Monate rückwirkend.", "Paid back only 6 months.", "Задним числом — только за 6 месяцев."),
  },
  {
    id: "elterngeld",
    name: tx("Elterngeld", "Parental allowance (Elterngeld)", "Elterngeld (родительское пособие)"),
    was: tx(
      "Ersetzt nach der Geburt einen Teil des Einkommens: 65 bis 67 Prozent, 300 bis 1.800 € im Monat.",
      "Replaces part of your income after the birth: 65 to 67 percent, €300 to €1,800 per month.",
      "Заменяет часть дохода после рождения: 65–67 %, от 300 до 1 800 € в месяц.",
    ),
    wo: tx("Elterngeldstelle des Bezirks, online mit ElterngeldDigital", "District parental allowance office, online via ElterngeldDigital", "Elterngeldstelle района, онлайн через ElterngeldDigital"),
    link: LINKS.elterngeldDigital,
    lage: "baby",
    frist: tx("Nur 3 Monate rückwirkend.", "Paid back only 3 months.", "Задним числом — только за 3 месяца."),
  },
  {
    id: "mutterschaftsgeld",
    name: tx("Mutterschaftsgeld", "Maternity pay", "Mutterschaftsgeld (пособие по беременности)"),
    was: tx(
      "Für Angestellte im Mutterschutz, 6 Wochen vor bis 8 Wochen nach der Geburt.",
      "For employees on maternity protection, 6 weeks before to 8 weeks after the birth.",
      "Для работающих в декрете: за 6 недель до и 8 недель после родов.",
    ),
    wo: tx("Krankenkasse", "Health insurer", "Больничная касса"),
    lage: "baby",
  },
  {
    id: "kinderzuschlag",
    name: tx("Kinderzuschlag", "Child supplement (Kinderzuschlag)", "Kinderzuschlag (доплата на детей)"),
    was: tx(
      "Für Familien, deren Einkommen für die Eltern reicht, aber nicht für die Kinder.",
      "For families whose income covers the parents but not the children.",
      "Для семей, чьего дохода хватает родителям, но не детям.",
    ),
    wo: tx("Familienkasse", "Family benefits office (Familienkasse)", "Familienkasse"),
    link: LINKS.familienkasse,
    lage: "geld",
    frist: tx("Nicht rückwirkend, erst ab Antragsmonat.", "Not retroactive, only from the month you apply.", "Не задним числом, только с месяца подачи."),
  },
  {
    id: "unterhaltsvorschuss",
    name: tx("Unterhaltsvorschuss", "Child maintenance advance", "Unterhaltsvorschuss (аванс алиментов)"),
    was: tx(
      "Für Alleinerziehende, wenn der andere Elternteil keinen oder zu wenig Unterhalt zahlt.",
      "For single parents if the other parent pays no or too little maintenance.",
      "Для одиноких родителей, если второй родитель не платит алименты или платит мало.",
    ),
    wo: tx("Jugendamt des Bezirks", "District youth office", "Jugendamt района"),
    lage: "geld",
    frist: tx("Höchstens 1 Monat rückwirkend.", "Paid back at most 1 month.", "Задним числом — максимум за 1 месяц."),
  },
  {
    id: "wohngeld",
    name: tx("Wohngeld", "Housing benefit (Wohngeld)", "Wohngeld (жилищное пособие)"),
    was: tx(
      "Zuschuss zur Miete für Haushalte mit eigenem, aber kleinem Einkommen.",
      "A rent subsidy for households with their own but low income.",
      "Доплата к аренде для семей с собственным, но небольшим доходом.",
    ),
    wo: tx("Wohngeldstelle des Bezirks", "District housing benefit office", "Wohngeldstelle района"),
    link: LINKS.wohngeld,
    lage: "geld",
    frist: tx("Ab dem Antragsmonat.", "From the month you apply.", "С месяца подачи."),
  },
  {
    id: "grundsicherungsgeld",
    name: tx("Grundsicherungsgeld (früher Bürgergeld)", "Basic income support (formerly Bürgergeld)", "Grundsicherungsgeld (раньше Bürgergeld)"),
    was: tx(
      "Sichert das Existenzminimum für erwerbsfähige Menschen und ihre Familien: Regelsatz plus Miete und Heizung.",
      "Covers the minimum cost of living for people able to work and their families: standard rate plus rent and heating.",
      "Обеспечивает прожиточный минимум трудоспособным и их семьям: базовая ставка плюс аренда и отопление.",
    ),
    wo: tx("Jobcenter", "Jobcenter", "Jobcenter"),
    link: LINKS.jobcenter,
    lage: "geld",
    frist: tx("Ab dem Antragsmonat.", "From the month you apply.", "С месяца подачи."),
  },
  {
    id: "grundsicherung_alter",
    name: tx("Grundsicherung im Alter", "Basic income in old age", "Базовое обеспечение в старости"),
    was: tx(
      "Wenn Rente und Einkommen im Rentenalter oder bei voller Erwerbsminderung nicht reichen.",
      "If pension and income are not enough in old age or with full incapacity to work.",
      "Если пенсии и дохода не хватает в пенсионном возрасте или при полной нетрудоспособности.",
    ),
    wo: tx("Sozialamt des Bezirks", "District social welfare office", "Sozialamt района"),
    link: LINKS.grundsicherungAlter,
    lage: "pflege",
  },
  {
    id: "alg",
    name: tx("Arbeitslosengeld", "Unemployment benefit", "Пособие по безработице (Arbeitslosengeld)"),
    was: tx(
      "60 Prozent des pauschalierten Netto-Gehalts, mit Kind 67 Prozent.",
      "60 percent of your standardised net pay, 67 percent with a child.",
      "60 % расчётной чистой зарплаты, с ребёнком 67 %.",
    ),
    wo: tx("Agentur für Arbeit", "Employment agency", "Агентство по труду"),
    link: LINKS.arbeitslosMelden,
    lage: "job",
  },
  {
    id: "bafoeg",
    name: tx("BAföG", "BAföG (student finance)", "BAföG (стипендия на учёбу)"),
    was: tx(
      "Für Studium und schulische Ausbildung, abhängig vom Einkommen der Eltern.",
      "For university and school-based training, depending on your parents' income.",
      "На учёбу в вузе и профшколе, зависит от дохода родителей.",
    ),
    wo: tx("BAföG-Amt, online mit BAföG Digital", "BAföG office, online via BAföG Digital", "Ведомство BAföG, онлайн через BAföG Digital"),
    link: LINKS.bafoeg,
    lage: "studium",
    frist: tx("Ab dem Antragsmonat, nicht rückwirkend.", "From the month you apply, not retroactive.", "С месяца подачи, не задним числом."),
  },
  {
    id: "pflegegrad",
    name: tx("Pflegegrad und Pflegegeld", "Care level and care allowance", "Степень ухода и пособие по уходу"),
    was: tx(
      "Wer im Alltag Hilfe braucht, bekommt je nach Pflegegrad Pflegegeld oder Pflegedienst.",
      "If someone needs help in daily life, they get care allowance or care services depending on the care level.",
      "Кому нужна помощь в быту, получает пособие или помощь службы ухода в зависимости от степени.",
    ),
    wo: tx("Pflegekasse bei der Krankenkasse", "Care insurance at the health insurer", "Касса по уходу при больничной кассе"),
    link: LINKS.pflegestuetzpunkte,
    lage: "pflege",
    frist: tx("Ab dem Antragsmonat, ein Anruf reicht.", "From the month you apply; a phone call is enough.", "С месяца подачи, достаточно звонка."),
  },
  {
    id: "schwerbehinderung",
    name: tx("Schwerbehindertenausweis", "Severe disability card", "Удостоверение тяжёлой инвалидности"),
    was: tx(
      "Nachteilsausgleiche wie Steuer-Pauschbetrag, Zusatzurlaub oder Kündigungsschutz.",
      "Compensations such as a tax allowance, extra holiday or protection against dismissal.",
      "Льготы: налоговый вычет, дополнительный отпуск, защита от увольнения.",
    ),
    wo: tx("Versorgungsamt beim LAGeSo", "Pension office at LAGeSo", "Versorgungsamt при LAGeSo"),
    link: LINKS.schwerbehinderung,
    lage: "pflege",
  },
  {
    id: "rundfunk",
    name: tx("Befreiung vom Rundfunkbeitrag", "Broadcasting fee exemption", "Освобождение от взноса за радио и ТВ"),
    was: tx(
      "Mit Grundsicherungsgeld, Grundsicherung im Alter oder BAföG ohne Eltern-Wohnung zahlen Sie keinen Beitrag.",
      "With basic income support, basic income in old age, or BAföG while not living with parents, you pay no fee.",
      "При Grundsicherungsgeld, базовом обеспечении в старости или BAföG при отдельном проживании взнос не платят.",
    ),
    wo: tx("ARD ZDF Deutschlandradio Beitragsservice", "ARD ZDF Deutschlandradio Beitragsservice", "ARD ZDF Deutschlandradio Beitragsservice"),
    link: LINKS.rundfunk,
  },
  {
    id: "but",
    name: tx("Bildung und Teilhabe, berlinpass", "Education and participation, berlinpass", "Пакет на образование и участие, berlinpass"),
    was: tx(
      "Schulbedarf, Klassenfahrten, Nachhilfe, Vereine und Ermäßigungen für Kinder aus Familien mit wenig Geld.",
      "School supplies, class trips, tutoring, clubs and discounts for children in low-income families.",
      "Школьные принадлежности, поездки, репетитор, кружки и скидки для детей из семей с небольшим доходом.",
    ),
    wo: tx("Jobcenter, Wohngeldstelle oder Bezirksamt", "Jobcenter, housing benefit office or district office", "Jobcenter, Wohngeldstelle или Bezirksamt"),
    link: LINKS.but,
    lage: "geld",
  },
  {
    id: "kita",
    name: tx("Kita-Gutschein", "Daycare voucher (Kita-Gutschein)", "Ваучер в детский сад"),
    was: tx(
      "Die Kita ist in Berlin beitragsfrei. Den Gutschein gibt es 9 bis 2 Monate vor dem Start.",
      "Daycare in Berlin is free of fees. The voucher is issued 9 to 2 months before the start.",
      "Детский сад в Берлине бесплатный. Ваучер выдают за 9–2 месяца до начала.",
    ),
    wo: tx("Jugendamt des Wohnbezirks", "Youth office of your district", "Jugendamt вашего района"),
    link: LINKS.kitaGutschein,
    lage: "baby",
  },
  {
    id: "wbs",
    name: tx("Wohnberechtigungsschein (WBS)", "Housing eligibility certificate (WBS)", "Право на социальное жильё (WBS)"),
    was: tx(
      "Berechtigt zur Bewerbung auf geförderte, günstigere Wohnungen.",
      "Lets you apply for subsidised, cheaper flats.",
      "Даёт право претендовать на субсидируемое, более дешёвое жильё.",
    ),
    wo: tx("Wohnungsamt des Bezirks", "District housing office", "Wohnungsamt района"),
    link: LINKS.wbs,
    lage: "geld",
  },
];

export function findeLeistung(id: string): Leistung | undefined {
  return leistungen.find((l) => l.id === id);
}
