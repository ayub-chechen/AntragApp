import { useRef } from "react";
import { Vorlesen } from "../components/Vorlesen";
import { tx, useSprache } from "../i18n/sprache";
import { useInstallation } from "../lib/installieren";
import { link } from "../lib/router";

const T = {
  titel: tx("So funktioniert's", "How it works", "Как это работает"),
  einleitung: tx(
    "Der Antragslotse führt Sie durch Anträge und Ämter, Schritt für Schritt. Er ersetzt nicht das Amt, aber er sagt Ihnen, was wann zu tun ist.",
    "The Antragslotse guides you through applications and offices, step by step. It doesn't replace the office, but it tells you what to do when.",
    "Antragslotse шаг за шагом проводит вас через заявления и ведомства. Он не заменяет ведомство, но подсказывает, что и когда делать.",
  ),
  schritte: [
    {
      titel: tx("Lebenslage wählen", "Choose a life event", "Выберите ситуацию"),
      text: tx(
        "Auf der Startseite tippen Sie an, was bei Ihnen ansteht: Umzug, Baby, Studium, Jobverlust, wenig Geld oder Pflege.",
        "On the home page, tap what's coming up for you: moving, baby, studies, job loss, low income or care.",
        "На главной странице выберите, что у вас происходит: переезд, ребёнок, учёба, потеря работы, нехватка денег или уход.",
      ),
      pfad: "/",
    },
    {
      titel: tx("Ein paar Fragen beantworten", "Answer a few questions", "Ответьте на несколько вопросов"),
      text: tx(
        "Zum Beispiel das Datum des Umzugs oder der Geburt. Mehr nicht. Alles ist freiwillig, was nicht für die Fristen nötig ist.",
        "For example the date of the move or the birth. That's all. Anything not needed for deadlines is optional.",
        "Например, дату переезда или рождения. Больше ничего. Всё, что не нужно для сроков, — по желанию.",
      ),
    },
    {
      titel: tx("Fahrplan abarbeiten", "Work through your roadmap", "Выполняйте план"),
      text: tx(
        "Sie sehen alle Schritte in der richtigen Reihenfolge, mit Fristen, Unterlagen und Links zum richtigen Amt. Erledigtes haken Sie ab.",
        "You see all steps in the right order, with deadlines, documents and links to the right office. Tick off what's done.",
        "Вы видите все шаги в правильном порядке со сроками, документами и ссылками на нужное ведомство. Отмечайте выполненное.",
      ),
    },
    {
      titel: tx("Geld prüfen", "Check money", "Проверьте выплаты"),
      text: tx(
        "Der Anspruchs-Check zeigt in 3 Minuten, welche Leistungen in Frage kommen und ungefähr wie viel.",
        "The benefits check shows in 3 minutes which benefits may apply and roughly how much.",
        "Проверка за 3 минуты покажет, какие пособия могут подойти и примерно сколько.",
      ),
      pfad: "/check",
    },
    {
      titel: tx("Termine nicht verpassen", "Don't miss dates", "Не пропускайте сроки"),
      text: tx(
        "Unter „Termine“ stehen alle Fristen. Mit einem Tipp kommen sie in den Kalender Ihres Handys, das Sie dann erinnert.",
        "“Dates” lists every deadline. One tap adds them to your phone's calendar, which then reminds you.",
        "В разделе «Сроки» собраны все сроки. Одним нажатием они попадут в календарь телефона, и он напомнит.",
      ),
      pfad: "/termine",
    },
    {
      titel: tx("Briefe verstehen und beantworten", "Understand and answer letters", "Понимайте письма и отвечайте"),
      text: tx(
        "Text eines Amtsbriefs einfügen: Sie sehen, was das Amt will und bis wann. Eine Antwort, etwa ein Widerspruch, ist mit einem Klick vorbereitet.",
        "Paste the text of an official letter: you'll see what the office wants and by when. A reply, such as an objection, is prepared in one click.",
        "Вставьте текст письма: вы увидите, чего хочет ведомство и к какому сроку. Ответ, например возражение, готовится одним нажатием.",
      ),
      pfad: "/brief",
    },
    {
      titel: tx("Einmal eingeben, immer nutzen", "Enter once, use always", "Введите один раз — пользуйтесь всегда"),
      text: tx(
        "In „Mein Bereich“ speichern Sie Profil und Unterlagen verschlüsselt mit Ihrer PIN. Formulare und Briefe werden damit vorausgefüllt.",
        "In “My space” you store your profile and documents encrypted with your PIN. Forms and letters are pre-filled with it.",
        "В «Моих данных» профиль и документы хранятся зашифрованными под вашим PIN. Из них заполняются бланки и письма.",
      ),
      pfad: "/mein",
    },
    {
      titel: tx("Beim Amt einreichen", "Submit to the office", "Подайте в ведомство"),
      text: tx(
        "Den eigentlichen Antrag stellen Sie online beim Amt oder mit Ihren vorbereiteten Unterlagen vor Ort. Der Antragslotse sagt Ihnen, wo.",
        "You submit the actual application online to the office or in person with your prepared documents. The Antragslotse tells you where.",
        "Само заявление вы подаёте онлайн в ведомство или лично с подготовленными документами. Antragslotse подскажет, куда.",
      ),
    },
  ],
  installTitel: tx("Als App aufs Handy", "Put it on your phone as an app", "Установить как приложение"),
  installIphone: tx(
    "iPhone: In Safari auf „Teilen“ tippen, dann „Zum Home-Bildschirm“.",
    "iPhone: in Safari tap “Share”, then “Add to Home Screen”.",
    "iPhone: в Safari нажмите «Поделиться», затем «На экран Домой».",
  ),
  installAndroid: tx(
    "Android: Im Chrome-Menü (drei Punkte) „App installieren“ wählen.",
    "Android: in the Chrome menu (three dots), choose “Install app”.",
    "Android: в меню Chrome (три точки) выберите «Установить приложение».",
  ),
  installKnopf: tx("Jetzt installieren", "Install now", "Установить"),
  installiert: tx("Die App ist auf diesem Gerät installiert.", "The app is installed on this device.", "Приложение установлено на этом устройстве."),
  offline: tx(
    "Einmal geöffnet, funktioniert die App auch ohne Internet.",
    "Once opened, the app also works without internet.",
    "Открыв приложение один раз, им можно пользоваться и без интернета.",
  ),
  datenTitel: tx("Wo sind meine Daten?", "Where is my data?", "Где мои данные?"),
  datenText: tx(
    "Nur auf Ihrem Gerät. Es gibt keinen Server, der Ihre Angaben bekommt, keine Werbung und kein Tracking.",
    "Only on your device. There is no server receiving your information, no ads and no tracking.",
    "Только на вашем устройстве. Нет сервера, который получает ваши данные, нет рекламы и слежки.",
  ),
  mehr: tx("Mehr zum Datenschutz", "More about privacy", "Подробнее о конфиденциальности"),
  ausprobieren: tx("Ausprobieren", "Try it", "Попробовать"),
};

export function Anleitung() {
  const { t } = useSprache();
  const ref = useRef<HTMLDivElement>(null);
  const inst = useInstallation();
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <div className="werkzeugleiste">
        <Vorlesen ziel={ref} />
      </div>
      <div ref={ref}>
        <p className="einleitung">{t(T.einleitung)}</p>
        <ol className="anleitung">
          {T.schritte.map((s, i) => (
            <li key={i}>
              <h2>{t(s.titel)}</h2>
              <p>{t(s.text)}</p>
              {s.pfad && <a href={link(s.pfad)}>{t(T.ausprobieren)}</a>}
            </li>
          ))}
        </ol>
        <section className="unterblock" aria-labelledby="install">
          <h2 id="install">{t(T.installTitel)}</h2>
          {inst.installiert ? (
            <p className="erfolg">{t(T.installiert)}</p>
          ) : (
            <>
              {inst.moeglich && (
                <p>
                  <button type="button" className="knopf" onClick={inst.installiere}>
                    {t(T.installKnopf)}
                  </button>
                </p>
              )}
              <ul className="haken">
                <li>{t(T.installIphone)}</li>
                <li>{t(T.installAndroid)}</li>
              </ul>
            </>
          )}
          <p>{t(T.offline)}</p>
        </section>
        <section className="unterblock" aria-labelledby="daten">
          <h2 id="daten">{t(T.datenTitel)}</h2>
          <p>
            {t(T.datenText)} <a href={link("/datenschutz")}>{t(T.mehr)}</a>
          </p>
        </section>
      </div>
    </section>
  );
}
