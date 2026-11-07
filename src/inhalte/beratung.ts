import { tx, type Tx } from "../i18n/sprache";
import { LINKS } from "./links";

export interface Stelle {
  id: string;
  name: Tx;
  hilft: Tx;
  telefon?: string;
  zeiten?: Tx;
  link?: string;
  themen: string[];
}

/** Kostenlose Anlaufstellen. Stand 07.11.2026. */
export const beratung: Stelle[] = [
  {
    id: "115",
    name: tx("Behördennummer 115", "Public service number 115", "Справочная ведомств 115"),
    hilft: tx(
      "Auskunft zu allen Berliner Ämtern: Wer ist zuständig, was brauche ich?",
      "Information on all Berlin offices: who is responsible, what do I need?",
      "Справки обо всех ведомствах Берлина: кто отвечает, что нужно?",
    ),
    telefon: "115",
    link: LINKS.service,
    themen: ["neu", "allgemein"],
  },
  {
    id: "pflege",
    name: tx("Pflegestützpunkte Berlin", "Berlin care advice centres", "Pflegestützpunkte Берлина"),
    hilft: tx(
      "Kostenlose, neutrale Beratung zu Pflege, Pflegegrad und Hilfen im Alltag, auch zu Hause.",
      "Free, neutral advice on care, care levels and help in daily life, at home too.",
      "Бесплатные нейтральные консультации по уходу, степени ухода и помощи в быту, в том числе на дому.",
    ),
    telefon: "0800 59 500 59",
    zeiten: tx("Mo–Fr 9–18 Uhr, kostenlos", "Mon–Fri 9 am–6 pm, free", "Пн–пт 9–18, бесплатно"),
    link: LINKS.pflegestuetzpunkte,
    themen: ["pflege"],
  },
  {
    id: "schulden",
    name: tx("Schuldner- und Insolvenzberatung", "Debt and insolvency advice", "Консультация по долгам и банкротству"),
    hilft: tx(
      "Anerkannte, kostenlose Beratungsstellen in allen Bezirken. Hilfe bei Pfändung, P-Konto und Insolvenz.",
      "Recognised free advice centres in all districts. Help with garnishment, P-Konto and insolvency.",
      "Признанные бесплатные консультации во всех районах. Помощь при взыскании, P-Konto и банкротстве.",
    ),
    link: LINKS.schuldnerStellen,
    themen: ["geld"],
  },
  {
    id: "willkommen",
    name: tx("Willkommenszentrum Berlin", "Berlin Welcome Center", "Willkommenszentrum Berlin"),
    hilft: tx(
      "Beratung für Zugewanderte zu Aufenthalt, Arbeit, Sprache und Ämtern, in vielen Sprachen.",
      "Advice for newcomers on residence, work, language and offices, in many languages.",
      "Консультации для приезжих о пребывании, работе, языке и ведомствах, на многих языках.",
    ),
    link: LINKS.willkommen,
    themen: ["neu"],
  },
  {
    id: "teilhabe",
    name: tx("Teilhabeberatung (EUTB)", "Participation advice (EUTB)", "Консультации по инклюзии (EUTB)"),
    hilft: tx(
      "Unabhängige Beratung für Menschen mit Behinderung und Angehörige, oft von Betroffenen selbst.",
      "Independent advice for people with disabilities and their families, often by peers.",
      "Независимые консультации для людей с инвалидностью и их близких, часто от людей с похожим опытом.",
    ),
    link: LINKS.teilhabe,
    themen: ["pflege"],
  },
  {
    id: "studierendenwerk",
    name: tx("Studierendenwerk Berlin", "Studierendenwerk Berlin (student services)", "Studierendenwerk Berlin"),
    hilft: tx("BAföG-Beratung, Sozialberatung und Wohnheime für Studierende.", "BAföG advice, social counselling and halls of residence for students.", "Консультации по BAföG, социальная помощь и общежития для студентов."),
    link: LINKS.studierendenwerk,
    themen: ["studium"],
  },
  {
    id: "caritas",
    name: tx("Online-Beratung der Caritas", "Caritas online counselling", "Онлайн-консультации Caritas"),
    hilft: tx(
      "Anonyme, kostenlose Beratung per Chat oder Mail, z. B. zu Schulden, Schwangerschaft, Migration.",
      "Anonymous, free advice by chat or email, e.g. on debt, pregnancy, migration.",
      "Анонимные бесплатные консультации в чате или по почте: долги, беременность, миграция.",
    ),
    link: LINKS.caritasOnline,
    themen: ["geld", "baby", "neu", "allgemein"],
  },
  {
    id: "verbraucher",
    name: tx("Verbraucherzentrale Berlin", "Consumer advice centre Berlin", "Центр защиты прав потребителей"),
    hilft: tx("Hilfe bei Verträgen, Rechnungen, Inkasso und Energie.", "Help with contracts, bills, debt collection and energy.", "Помощь с договорами, счетами, коллекторами и энергией."),
    link: LINKS.verbraucher,
    themen: ["geld"],
  },
  {
    id: "patienten",
    name: tx("Unabhängige Patientenberatung", "Independent patient advice", "Независимая консультация пациентов"),
    hilft: tx("Fragen zu Krankenkasse, Behandlung und Patientenrechten.", "Questions on health insurance, treatment and patient rights.", "Вопросы о больничной кассе, лечении и правах пациентов."),
    link: LINKS.patienten,
    themen: ["pflege", "allgemein"],
  },
];

export const krise = {
  titel: tx("In einer akuten Krise", "In an acute crisis", "В острой кризисной ситуации"),
  text: tx(
    "Die Telefonseelsorge ist rund um die Uhr erreichbar, kostenlos und anonym: 0800 111 0 111 oder 0800 111 0 222. Im Notfall: 112.",
    "The telephone helpline is available around the clock, free and anonymous: 0800 111 0 111 or 0800 111 0 222. In an emergency: 112.",
    "Телефон доверия работает круглосуточно, бесплатно и анонимно: 0800 111 0 111 или 0800 111 0 222. В экстренном случае: 112.",
  ),
};
