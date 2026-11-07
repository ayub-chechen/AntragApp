import { tx, type Tx } from "../i18n/sprache";
import type { Frage } from "./typen";

export interface FragenGruppe {
  titel: Tx;
  fragen: Frage[];
}

const kinderAlter = (a: Record<string, string>) =>
  (a.kinder_alter ?? "")
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

export const checkFragen: FragenGruppe[] = [
  {
    titel: tx("Ihr Haushalt", "Your household", "Ваша семья"),
    fragen: [
      { id: "alter", typ: "zahl", pflicht: true, frage: tx("Wie alt sind Sie?", "How old are you?", "Сколько вам лет?") },
      {
        id: "partner",
        typ: "janein",
        pflicht: true,
        frage: tx("Leben Sie mit Partnerin oder Partner zusammen?", "Do you live with a partner?", "Вы живёте с партнёром или партнёршей?"),
      },
      {
        id: "kinder_alter",
        typ: "text",
        frage: tx("Wie alt sind die Kinder in Ihrem Haushalt?", "How old are the children in your household?", "Сколько лет детям в вашей семье?"),
        hilfe: tx(
          "Alter in Jahren mit Komma getrennt, z. B. 0, 4, 19. Ohne Kinder leer lassen. Ein Baby unter 1 Jahr ist 0.",
          "Ages in years separated by commas, e.g. 0, 4, 19. Leave empty if there are none. A baby under 1 is 0.",
          "Возраст в годах через запятую, например 0, 4, 19. Без детей — оставьте пустым. Младенец до года — 0.",
        ),
      },
      {
        id: "kinder_ausbildung",
        typ: "janein",
        frage: tx(
          "Sind die Kinder ab 18 in Schule, Ausbildung oder Studium?",
          "Are the children aged 18 or over in school, training or studies?",
          "Учатся ли дети старше 18 лет (школа, обучение, вуз)?",
        ),
        wenn: (a) => kinderAlter(a).some((n) => n >= 18 && n < 25),
      },
      {
        id: "schwanger",
        typ: "janein",
        frage: tx("Erwarten Sie oder Ihre Partnerin ein Kind?", "Are you or your partner expecting a child?", "Ждёте ли вы или ваша партнёрша ребёнка?"),
      },
    ],
  },
  {
    titel: tx("Arbeit und Geld", "Work and money", "Работа и деньги"),
    fragen: [
      {
        id: "taetigkeit",
        typ: "auswahl",
        pflicht: true,
        frage: tx("Was machen Sie gerade hauptsächlich?", "What do you mainly do at the moment?", "Чем вы сейчас в основном заняты?"),
        optionen: [
          { wert: "angestellt", text: tx("Angestellt (auch Teilzeit oder Minijob)", "Employed (incl. part-time or mini-job)", "Работаю по найму (в т. ч. частично или мини-джоб)") },
          { wert: "selbststaendig", text: tx("Selbstständig", "Self-employed", "Самозанятый") },
          { wert: "arbeitslos", text: tx("Arbeitslos oder bald arbeitslos", "Unemployed or soon unemployed", "Безработный или скоро буду") },
          { wert: "ausbildung", text: tx("Studium, Schule oder Ausbildung", "Studies, school or training", "Учёба, школа или профобучение") },
          { wert: "elternzeit", text: tx("Elternzeit", "Parental leave", "Отпуск по уходу за ребёнком") },
          { wert: "rente", text: tx("Rente", "Retired", "На пенсии") },
          { wert: "sonstiges", text: tx("Etwas anderes", "Something else", "Другое") },
        ],
      },
      {
        id: "versichert",
        typ: "janein",
        frage: tx(
          "Waren Sie in den letzten 30 Monaten mindestens 12 Monate versicherungspflichtig angestellt?",
          "In the last 30 months, were you employed with social insurance for at least 12 months?",
          "Работали ли вы за последние 30 месяцев не менее 12 месяцев по найму с соцстрахованием?",
        ),
        wenn: (a) => a.taetigkeit === "arbeitslos",
      },
      {
        id: "einkommen",
        typ: "zahl",
        pflicht: true,
        frage: tx(
          "Wie viel Geld hat Ihr Haushalt im Monat netto, ohne Kindergeld?",
          "How much net money does your household have per month, excluding child benefit?",
          "Сколько чистыми получает ваша семья в месяц, без Kindergeld?",
        ),
        hilfe: tx(
          "Alles zusammen: Lohn, Rente, Arbeitslosengeld, Unterhalt. Eine Schätzung reicht.",
          "Everything together: wages, pension, unemployment benefit, maintenance. An estimate is fine.",
          "Всё вместе: зарплата, пенсия, пособие, алименты. Достаточно примерной суммы.",
        ),
      },
      {
        id: "miete",
        typ: "zahl",
        pflicht: true,
        frage: tx("Wie hoch ist Ihre Warmmiete im Monat?", "How much is your rent per month including heating and service charges?", "Сколько вы платите за аренду в месяц вместе с коммунальными и отоплением?"),
        hilfe: tx("Miete plus Nebenkosten und Heizung. Ohne Miete: 0.", "Rent plus service charges and heating. No rent: 0.", "Аренда плюс коммунальные и отопление. Если не платите — 0."),
      },
      {
        id: "vermoegen",
        typ: "janein",
        frage: tx(
          "Haben Sie größere Ersparnisse, etwa mehr als 10.000 €?",
          "Do you have larger savings, roughly more than €10,000?",
          "Есть ли у вас крупные сбережения, примерно больше 10 000 €?",
        ),
      },
    ],
  },
  {
    titel: tx("Gesundheit", "Health", "Здоровье"),
    fragen: [
      {
        id: "pflege",
        typ: "janein",
        frage: tx(
          "Braucht jemand in Ihrem Haushalt Pflege oder regelmäßig Hilfe im Alltag?",
          "Does someone in your household need care or regular help in daily life?",
          "Нужен ли кому-то в семье уход или регулярная помощь в быту?",
        ),
      },
      {
        id: "behinderung",
        typ: "janein",
        frage: tx(
          "Hat jemand eine Behinderung oder eine schwere chronische Krankheit?",
          "Does someone have a disability or a serious chronic illness?",
          "Есть ли у кого-то инвалидность или тяжёлое хроническое заболевание?",
        ),
      },
    ],
  },
  {
    titel: tx("Was bekommen Sie schon?", "What do you already receive?", "Что вы уже получаете?"),
    fragen: [
      {
        id: "bekommt",
        typ: "mehrfach",
        frage: tx("Kreuzen Sie an, was Sie schon bekommen.", "Tick what you already receive.", "Отметьте, что вы уже получаете."),
        optionen: [
          { wert: "kindergeld", text: tx("Kindergeld", "Child benefit", "Kindergeld") },
          { wert: "elterngeld", text: tx("Elterngeld", "Parental allowance", "Elterngeld") },
          { wert: "kinderzuschlag", text: tx("Kinderzuschlag", "Child supplement", "Kinderzuschlag") },
          { wert: "unterhaltsvorschuss", text: tx("Unterhaltsvorschuss", "Maintenance advance", "Unterhaltsvorschuss") },
          { wert: "wohngeld", text: tx("Wohngeld", "Housing benefit", "Wohngeld") },
          { wert: "grundsicherungsgeld", text: tx("Grundsicherungsgeld", "Basic income support", "Grundsicherungsgeld") },
          { wert: "grundsicherung_alter", text: tx("Grundsicherung im Alter", "Basic income in old age", "Базовое обеспечение в старости") },
          { wert: "alg", text: tx("Arbeitslosengeld", "Unemployment benefit", "Пособие по безработице") },
          { wert: "bafoeg", text: tx("BAföG", "BAföG", "BAföG") },
          { wert: "pflegegrad", text: tx("Pflegegrad", "Care level", "Степень ухода") },
          { wert: "rundfunk", text: tx("Rundfunk-Befreiung", "Broadcasting fee exemption", "Освобождение от взноса за ТВ") },
        ],
      },
    ],
  },
];

export const alleCheckFragen = checkFragen.flatMap((g) => g.fragen);
