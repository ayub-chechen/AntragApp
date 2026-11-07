import { tx, type Tx } from "../i18n/sprache";
import type { DokArt, Frage } from "./typen";

export const dokArten: Record<DokArt, Tx> = {
  ausweis: tx("Ausweis oder Pass", "ID card or passport", "Удостоверение или паспорт"),
  aufenthalt: tx("Aufenthaltstitel oder Visum", "Residence permit or visa", "Вид на жительство или виза"),
  meldebescheinigung: tx("Meldebescheinigung", "Registration certificate", "Справка о прописке"),
  wgb: tx("Wohnungsgeberbestätigung", "Landlord's confirmation", "Подтверждение арендодателя"),
  mietvertrag: tx("Mietvertrag", "Lease", "Договор аренды"),
  urkunde: tx("Urkunde (Geburt, Ehe)", "Certificate (birth, marriage)", "Свидетельство (рождение, брак)"),
  einkommen: tx("Lohn- oder Einkommensnachweis", "Payslip or proof of income", "Справка о доходах"),
  kontoauszug: tx("Kontoauszug", "Bank statement", "Выписка со счёта"),
  steuer: tx("Steuer-ID oder Steuerbescheid", "Tax ID or tax assessment", "Налоговый номер или уведомление"),
  bescheid: tx("Bescheid vom Amt", "Official decision", "Решение ведомства"),
  bescheinigung: tx("Bescheinigung (Schule, Hochschule, Arbeitgeber)", "Certificate (school, university, employer)", "Справка (школа, вуз, работодатель)"),
  versicherung: tx("Versicherung oder Krankenkasse", "Insurance or health insurer", "Страховка или больничная касса"),
  medizin: tx("Ärztliche Unterlagen", "Medical documents", "Медицинские документы"),
  sonstiges: tx("Sonstiges", "Other", "Другое"),
};

export const profilGruppen: { titel: Tx; fragen: Frage[] }[] = [
  {
    titel: tx("Ihre Person", "About you", "О вас"),
    fragen: [
      { id: "person.vornamen", typ: "text", frage: tx("Vornamen", "First names", "Имя") },
      { id: "person.familienname", typ: "text", frage: tx("Familienname", "Surname", "Фамилия") },
      { id: "person.geburtsname", typ: "text", frage: tx("Geburtsname, falls anders", "Birth name, if different", "Фамилия при рождении, если другая") },
      { id: "person.doktorgrad", typ: "text", frage: tx("Doktorgrad", "Doctoral degree", "Учёная степень") },
      { id: "person.geburtsdatum", typ: "datum", frage: tx("Geburtsdatum", "Date of birth", "Дата рождения") },
      { id: "person.geburtsort", typ: "text", frage: tx("Geburtsort und Land", "Place and country of birth", "Место и страна рождения") },
      {
        id: "person.staatsangehoerigkeit",
        typ: "text",
        frage: tx("Staatsangehörigkeit (auf Deutsch, z. B. deutsch, polnisch)", "Citizenship (in German, e.g. deutsch, polnisch)", "Гражданство (по-немецки, например russisch, ukrainisch)"),
      },
      {
        id: "person.geschlecht",
        typ: "auswahl",
        frage: tx("Geschlecht", "Gender", "Пол"),
        optionen: [
          { wert: "weiblich", text: tx("weiblich", "female", "женский") },
          { wert: "maennlich", text: tx("männlich", "male", "мужской") },
          { wert: "divers", text: tx("divers", "diverse", "другой (divers)") },
          { wert: "ohne", text: tx("ohne Angabe", "not specified", "не указан") },
        ],
      },
      {
        id: "person.familienstand",
        typ: "auswahl",
        frage: tx("Familienstand", "Marital status", "Семейное положение"),
        optionen: [
          { wert: "ledig", text: tx("ledig", "single", "не в браке") },
          { wert: "verheiratet", text: tx("verheiratet", "married", "в браке") },
          { wert: "lebenspartnerschaft", text: tx("eingetragene Lebenspartnerschaft", "registered partnership", "зарегистрированное партнёрство") },
          { wert: "geschieden", text: tx("geschieden", "divorced", "в разводе") },
          { wert: "verwitwet", text: tx("verwitwet", "widowed", "вдова / вдовец") },
        ],
      },
    ],
  },
  {
    titel: tx("Ihre Adresse", "Your address", "Ваш адрес"),
    fragen: [
      { id: "adresse.strasse", typ: "text", frage: tx("Straße", "Street", "Улица") },
      { id: "adresse.hausnummer", typ: "text", frage: tx("Hausnummer", "House number", "Номер дома") },
      { id: "adresse.zusatz", typ: "text", frage: tx("Adresszusatz, z. B. Hinterhaus, bei …", "Address addition, e.g. rear building, c/o …", "Дополнение к адресу, например Hinterhaus, c/o …") },
      { id: "adresse.plz", typ: "text", frage: tx("Postleitzahl", "Postcode", "Почтовый индекс") },
      { id: "adresse.ort", typ: "text", frage: tx("Ort", "Town", "Город") },
    ],
  },
  {
    titel: tx("Kontakt", "Contact", "Контакты"),
    fragen: [
      { id: "kontakt.telefon", typ: "text", frage: tx("Telefon", "Phone", "Телефон") },
      { id: "kontakt.email", typ: "text", frage: tx("E-Mail", "Email", "E-mail") },
    ],
  },
  {
    titel: tx("Wichtige Nummern", "Important numbers", "Важные номера"),
    fragen: [
      { id: "nummer.steuerid", typ: "text", frage: tx("Steuer-Identifikationsnummer", "Tax ID", "Налоговый номер (Steuer-ID)") },
      { id: "nummer.versichert", typ: "text", frage: tx("Krankenversichertennummer", "Health insurance number", "Номер медицинской страховки") },
      { id: "nummer.rente", typ: "text", frage: tx("Rentenversicherungsnummer", "Pension insurance number", "Номер пенсионного страхования") },
      { id: "nummer.kindergeld", typ: "text", frage: tx("Kindergeldnummer", "Child benefit number", "Номер Kindergeld") },
      { id: "nummer.bg", typ: "text", frage: tx("Nummer der Bedarfsgemeinschaft (Jobcenter)", "Jobcenter household number (BG)", "Номер Bedarfsgemeinschaft (Jobcenter)") },
    ],
  },
];

/** Profil-Schlüssel → Felder der Wohnsitzanmeldung. */
export const profilZuAntrag: Record<string, string> = {
  "person.familienname": "familienname",
  "person.geburtsname": "geburtsname",
  "person.vornamen": "vornamen",
  "person.doktorgrad": "doktorgrad",
  "person.geschlecht": "geschlecht",
  "person.geburtsdatum": "geburtsdatum",
  "person.geburtsort": "geburtsort",
  "person.staatsangehoerigkeit": "staatsangehoerigkeit",
  "person.familienstand": "familienstand",
};

export function name(profil: Record<string, string>): string {
  return [profil["person.doktorgrad"], profil["person.vornamen"], profil["person.familienname"]].filter(Boolean).join(" ");
}

export function adresszeilen(profil: Record<string, string>): string[] {
  const strasse = [profil["adresse.strasse"], profil["adresse.hausnummer"]].filter(Boolean).join(" ");
  const ort = [profil["adresse.plz"], profil["adresse.ort"]].filter(Boolean).join(" ");
  return [strasse, profil["adresse.zusatz"], ort].filter((z): z is string => !!z);
}
