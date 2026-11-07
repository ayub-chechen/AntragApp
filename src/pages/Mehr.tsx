import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { link } from "../lib/router";

const PUNKTE = [
  { pfad: "/brief", titel: tx("Brief verstehen", "Understand a letter", "Понять письмо"), text: tx("Fristen, Fachwörter, Antwortbrief", "Deadlines, jargon, reply letter", "Сроки, термины, ответное письмо") },
  { pfad: "/umzug-melden", titel: tx("Umzug melden", "Report a move", "Сообщить о переезде"), text: tx("Briefe an alle Stellen", "Letters to every organisation", "Письма во все организации") },
  { pfad: "/antrag/wohnsitzanmeldung", titel: tx("Wohnung anmelden", "Register your address", "Прописаться"), text: tx("Ausfüllhilfe mit PDF", "Form helper with PDF", "Помощь с бланком и PDF") },
  { pfad: "/hilfe", titel: tx("Hilfe und Beratung", "Help and advice", "Помощь и консультации"), text: tx("Kostenlose Stellen in Berlin", "Free services in Berlin", "Бесплатные службы в Берлине") },
  { pfad: "/neuigkeiten", titel: tx("Neuigkeiten", "News", "Новости"), text: tx("Was sich bei Anträgen ändert", "What is changing in applications", "Что меняется в заявлениях") },
  { pfad: "/anleitung", titel: ui.anleitung, text: tx("Kurze Anleitung und App installieren", "Short guide and app install", "Краткая инструкция и установка") },
  { pfad: "/organisationen", titel: tx("Für Organisationen", "For organisations", "Для организаций"), text: tx("Beratungsstellen, Arbeitgeber, Hochschulen", "Advice centres, employers, universities", "Консультации, работодатели, вузы") },
  { pfad: "/datenschutz", titel: ui.datenschutz, text: tx("Ihre Daten bleiben bei Ihnen", "Your data stays with you", "Ваши данные остаются у вас") },
];

export function Mehr() {
  const { t } = useSprache();
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(ui.navMehr)}</h1>
      <ul className="lagen">
        {PUNKTE.map((p) => (
          <li key={p.pfad} className="lage">
            <a href={link(p.pfad)}>
              <span className="lage-titel">{t(p.titel)}</span>
              <span className="lage-text">{t(p.text)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
