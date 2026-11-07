import { tx } from "./sprache";

/** Texte, die an vielen Stellen vorkommen. */
export const ui = {
  app: tx("Antragslotse Berlin", "Antragslotse Berlin", "Antragslotse Berlin"),
  zumInhalt: tx("Zum Inhalt springen", "Skip to content", "Перейти к содержанию"),
  navStart: tx("Start", "Home", "Главная"),
  navCheck: tx("Check", "Check", "Проверка"),
  navTermine: tx("Termine", "Dates", "Сроки"),
  navMein: tx("Mein Bereich", "My space", "Мои данные"),
  navMehr: tx("Mehr", "More", "Ещё"),
  hauptnavigation: tx("Hauptnavigation", "Main navigation", "Основная навигация"),
  sprache: tx("Sprache", "Language", "Язык"),
  weiter: tx("Weiter", "Next", "Далее"),
  zurueck: tx("Zurück", "Back", "Назад"),
  speichern: tx("Speichern", "Save", "Сохранить"),
  abbrechen: tx("Abbrechen", "Cancel", "Отмена"),
  loeschen: tx("Löschen", "Delete", "Удалить"),
  ja: tx("Ja", "Yes", "Да"),
  nein: tx("Nein", "No", "Нет"),
  freiwillig: tx("(freiwillig)", "(optional)", "(необязательно)"),
  neuerTab: tx("(öffnet in neuem Tab)", "(opens in a new tab)", "(откроется в новой вкладке)"),
  datumHilfe: tx("Format TT.MM.JJJJ, z. B. 15.03.2027", "Format DD.MM.YYYY, e.g. 15.03.2027", "Формат ДД.ММ.ГГГГ, например 15.03.2027"),
  datumFehler: tx("Bitte ein Datum wie 15.03.2027 eingeben.", "Please enter a date like 15.03.2027.", "Введите дату в виде 15.03.2027."),
  pflichtFehler: tx("Bitte beantworten Sie diese Frage.", "Please answer this question.", "Пожалуйста, ответьте на этот вопрос."),
  zahlFehler: tx("Bitte eine Zahl eingeben, z. B. 1200.", "Please enter a number, e.g. 1200.", "Введите число, например 1200."),
  fehlerTitel: (n: number) =>
    tx(
      n === 1 ? "Bitte prüfen Sie eine Angabe" : `Bitte prüfen Sie ${n} Angaben`,
      n === 1 ? "Please check one answer" : `Please check ${n} answers`,
      n === 1 ? "Проверьте один ответ" : `Проверьте ответы: ${n}`,
    ),
  keineRechtsberatung: tx(
    "Der Antragslotse ist kein Angebot des Landes Berlin und keine Rechtsberatung. Er hilft beim Verstehen und Vorbereiten. Einreichen können Sie nur beim Amt selbst.",
    "The Antragslotse is not a service of the State of Berlin and not legal advice. It helps you understand and prepare. You can only submit applications to the office itself.",
    "Antragslotse — не сервис земли Берлин и не юридическая консультация. Он помогает понять и подготовиться. Подать заявление можно только в самом ведомстве.",
  ),
  datenschutz: tx("Datenschutz", "Privacy", "Конфиденциальность"),
  anleitung: tx("So funktioniert's", "How it works", "Как это работает"),
  vorlesen: tx("Vorlesen", "Read aloud", "Прочитать вслух"),
  vorlesenStopp: tx("Vorlesen beenden", "Stop reading", "Остановить чтение"),
  heute: tx("heute", "today", "сегодня"),
  gesperrtHinweis: tx(
    "Ihre gespeicherten Angaben sind gesperrt.",
    "Your saved information is locked.",
    "Ваши сохранённые данные заблокированы.",
  ),
  entsperren: tx("Entsperren", "Unlock", "Разблокировать"),
  nurFenster: tx(
    "Ihre Angaben sind nur in diesem Fenster. Dauerhaft und verschlüsselt speichern können Sie in „Mein Bereich“.",
    "Your answers live only in this window. You can save them permanently and encrypted in “My space”.",
    "Ваши данные есть только в этом окне. Сохранить их надолго и в зашифрованном виде можно в разделе «Мои данные».",
  ),
  formularDeutsch: tx(
    "",
    "Official forms and letters to offices are in German, so these fields stay German. Explanations are in your language.",
    "Официальные бланки и письма в ведомства — на немецком, поэтому эти поля остаются на немецком. Пояснения — на вашем языке.",
  ),
};
