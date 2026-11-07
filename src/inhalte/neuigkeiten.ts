import { tx, type Tx } from "../i18n/sprache";
import { LINKS } from "./links";

export interface Neuigkeit {
  id: string;
  /** Ab wann die Änderung gilt (ISO). */
  ab: string;
  titel: Tx;
  text: Tx;
  /** Betrifft diese Lebenslagen oder Leistungen. */
  betrifft: string[];
  link?: string;
  geplant?: boolean;
}

/** Regel-Radar, Stand 07.11.2026. Neue Einträge oben anfügen. */
export const neuigkeiten: Neuigkeit[] = [
  {
    id: "eudi-wallet",
    ab: "2027-01-02",
    geplant: true,
    titel: tx("Digitale Brieftasche fürs Handy (EUDI-Wallet)", "Digital wallet for your phone (EUDI Wallet)", "Цифровой кошелёк в телефоне (EUDI-Wallet)"),
    text: tx(
      "Ab Januar 2027 soll es eine staatliche Wallet-App geben, mit der man sich ausweisen und Nachweise digital vorlegen kann. Der Antragslotse soll sie unterstützen, sobald sie verfügbar ist.",
      "From January 2027, a government wallet app is planned that lets you identify yourself and present documents digitally. The Antragslotse aims to support it once available.",
      "С января 2027 года планируется государственное приложение-кошелёк для удостоверения личности и цифровых документов. Antragslotse планирует поддержать его, как только оно появится.",
    ),
    betrifft: ["neu"],
  },
  {
    id: "kindergeld-automatisch",
    ab: "2027-01-01",
    geplant: true,
    titel: tx("Kindergeld soll schrittweise ohne Antrag kommen", "Child benefit to come gradually without an application", "Kindergeld постепенно будут платить без заявления"),
    text: tx(
      "Ab 2027 soll die Familienkasse Kindergeld nach und nach automatisch zahlen. Bis es für Sie gilt, stellen Sie den Antrag bitte wie bisher.",
      "From 2027, the Familienkasse is to pay child benefit automatically, step by step. Until it applies to you, please apply as before.",
      "С 2027 года Familienkasse будет постепенно выплачивать Kindergeld автоматически. Пока это вас не касается, подавайте заявление как раньше.",
    ),
    betrifft: ["baby", "kindergeld"],
    link: LINKS.familienkasse,
  },
  {
    id: "grundsicherungsgeld",
    ab: "2026-07-01",
    titel: tx("Aus Bürgergeld wird Grundsicherungsgeld", "Bürgergeld becomes Grundsicherungsgeld", "Bürgergeld стал Grundsicherungsgeld"),
    text: tx(
      "Seit 1. Juli 2026 heißt die Leistung vom Jobcenter Grundsicherungsgeld. Die Regelsätze sind gleich geblieben (563 € für Alleinstehende). Versäumte Termine werden strenger gekürzt. Nehmen Sie Termine wahr oder sagen Sie vorher mit Grund ab.",
      "Since 1 July 2026, the Jobcenter benefit is called Grundsicherungsgeld. Standard rates stayed the same (€563 for single people). Missed appointments are penalised more strictly. Attend appointments or cancel in advance with a reason.",
      "С 1 июля 2026 года пособие Jobcenter называется Grundsicherungsgeld. Ставки не изменились (563 € для одиноких). За пропущенные встречи наказывают строже. Приходите или заранее отменяйте с причиной.",
    ),
    betrifft: ["job", "geld", "grundsicherungsgeld"],
    link: LINKS.grundsicherungOnline,
  },
  {
    id: "bafoeg-app",
    ab: "2026-04-01",
    titel: tx("BAföG per App beantragen", "Apply for BAföG via app", "BAföG можно оформить через приложение"),
    text: tx(
      "Seit April 2026 gibt es BAföG Digital auch als App. Der Antrag kommt ohne Papier aus.",
      "Since April 2026, BAföG Digital is also available as an app. The application is paperless.",
      "С апреля 2026 года BAföG Digital доступен и как приложение. Заявление подаётся без бумаги.",
    ),
    betrifft: ["studium", "bafoeg"],
    link: LINKS.bafoeg,
  },
  {
    id: "betraege-2026",
    ab: "2026-01-01",
    titel: tx("Kindergeld 259 €, Kinderzuschlag bis 297 €", "Child benefit €259, child supplement up to €297", "Kindergeld 259 €, Kinderzuschlag до 297 €"),
    text: tx(
      "Seit Januar 2026 gibt es 259 € Kindergeld pro Kind und bis zu 297 € Kinderzuschlag. Unterhaltsvorschuss: 227, 299 oder 394 € je nach Alter.",
      "Since January 2026, child benefit is €259 per child and child supplement up to €297. Maintenance advance: €227, €299 or €394 depending on age.",
      "С января 2026 года Kindergeld — 259 € на ребёнка, Kinderzuschlag — до 297 €. Unterhaltsvorschuss: 227, 299 или 394 € в зависимости от возраста.",
    ),
    betrifft: ["baby", "geld", "kindergeld", "kinderzuschlag", "unterhaltsvorschuss"],
    link: LINKS.familienkasse,
  },
  {
    id: "viertage",
    ab: "2025-01-01",
    titel: tx("Briefe vom Amt gelten erst nach 4 Tagen als zugestellt", "Official letters count as delivered after 4 days", "Письма из ведомств считаются доставленными через 4 дня"),
    text: tx(
      "Seit 2025 gilt ein Bescheid per Post am vierten Tag nach dem Absenden als bekannt gegeben (vorher drei). Ab dann läuft z. B. die Widerspruchsfrist von einem Monat. Der Brief-Erklärer rechnet so.",
      "Since 2025, a decision sent by post counts as notified on the fourth day after sending (previously three). The one-month objection period runs from then. The letter explainer calculates it this way.",
      "С 2025 года решение по почте считается объявленным на четвёртый день после отправки (раньше — на третий). С этого дня идёт, например, месячный срок возражения. «Объяснение писем» считает именно так.",
    ),
    betrifft: ["brief"],
  },
  {
    id: "anmeldung-online",
    ab: "2024-10-16",
    titel: tx("Wohnung online anmelden", "Register your address online", "Прописка онлайн"),
    text: tx(
      "In Berlin können Sie Ihre Wohnung online anmelden, mit Online-Ausweis und PIN. Die Bestätigung vom Vermieter laden Sie hoch.",
      "In Berlin you can register your address online with your online ID and PIN. You upload the landlord's confirmation.",
      "В Берлине можно прописаться онлайн с онлайн-удостоверением и PIN-кодом. Подтверждение арендодателя загружается.",
    ),
    betrifft: ["neu", "studium"],
    link: LINKS.wohnsitz,
  },
];
