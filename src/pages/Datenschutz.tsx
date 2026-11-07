import { tx, useSprache } from "../i18n/sprache";
import { link } from "../lib/router";

const T = {
  titel: tx("Datenschutz", "Privacy", "Конфиденциальность"),
  kurz: tx(
    "Kurz gesagt: Ihre Angaben verlassen Ihr Gerät nicht. Der Antragslotse hat keinen Server, der persönliche Daten empfängt.",
    "In short: your information never leaves your device. The Antragslotse has no server that receives personal data.",
    "Коротко: ваши данные не покидают устройство. У Antragslotse нет сервера, который получает личные данные.",
  ),
  wasTitel: tx("Was mit Ihren Angaben passiert", "What happens to your information", "Что происходит с вашими данными"),
  was: [
    tx(
      "Ohne PIN bleiben Ihre Angaben nur im Arbeitsspeicher, solange das Fenster offen ist.",
      "Without a PIN, your information stays only in memory while the window is open.",
      "Без PIN данные хранятся только в памяти, пока открыто окно.",
    ),
    tx(
      "Mit PIN werden sie verschlüsselt im Browser-Speicher (IndexedDB) dieses Geräts abgelegt: AES-GCM mit 256 Bit, der Schlüssel wird mit PBKDF2 aus Ihrer PIN abgeleitet. Ohne PIN kann niemand sie lesen.",
      "With a PIN, they are stored encrypted in this device's browser storage (IndexedDB): AES-GCM with 256 bits; the key is derived from your PIN with PBKDF2. Nobody can read it without the PIN.",
      "С PIN они хранятся зашифрованными в памяти браузера этого устройства (IndexedDB): AES-GCM 256 бит, ключ выводится из PIN через PBKDF2. Без PIN прочитать их нельзя.",
    ),
    tx(
      "Nach 15 Minuten ohne Bedienung sperrt sich der Speicher von selbst.",
      "Storage locks itself after 15 minutes without use.",
      "Через 15 минут бездействия хранилище блокируется само.",
    ),
    tx(
      "PDFs, Briefe, Kalenderdateien und Sicherungen werden auf Ihrem Gerät erzeugt und direkt heruntergeladen.",
      "PDFs, letters, calendar files and backups are created on your device and downloaded directly.",
      "PDF, письма, файлы календаря и резервные копии создаются на вашем устройстве и сразу скачиваются.",
    ),
    tx(
      "Vorlesen nutzt die Sprachausgabe Ihres Geräts. Der Brief-Erklärer arbeitet ohne Internet.",
      "Read-aloud uses your device's speech output. The letter explainer works offline.",
      "Чтение вслух использует синтез речи вашего устройства. «Объяснение писем» работает без интернета.",
    ),
    tx(
      "Gespeichert wird außerdem nur Ihre Sprachwahl, ohne Bezug zu Ihrer Person.",
      "The only other thing stored is your language choice, with no link to you as a person.",
      "Кроме этого сохраняется только выбранный язык, без связи с вашей личностью.",
    ),
  ],
  nichtTitel: tx("Was wir nicht tun", "What we don't do", "Чего мы не делаем"),
  nicht: [
    tx("Keine Analyse- oder Tracking-Werkzeuge, keine Cookies, keine Werbung.", "No analytics or tracking tools, no cookies, no ads.", "Никакой аналитики и слежки, никаких cookie, никакой рекламы."),
    tx("Keine Schriften oder Skripte von fremden Servern.", "No fonts or scripts from third-party servers.", "Никаких шрифтов и скриптов со сторонних серверов."),
    tx(
      "Keine Weitergabe an Ämter. Erst wenn Sie einen Link zu einem Amt öffnen, verlassen Sie den Antragslotsen.",
      "Nothing is passed to offices. You only leave the Antragslotse when you open a link to an office.",
      "Мы ничего не передаём в ведомства. Вы покидаете Antragslotse, только открыв ссылку на ведомство.",
    ),
  ],
  offlineTitel: tx("Offline-Nutzung", "Offline use", "Работа без интернета"),
  offline: tx(
    "Damit die App ohne Internet startet, speichert der Browser die Programmdateien. Darin sind keine persönlichen Angaben.",
    "So the app starts without internet, the browser stores the program files. They contain no personal information.",
    "Чтобы приложение запускалось без интернета, браузер сохраняет файлы программы. Личных данных в них нет.",
  ),
  entwurf: tx(
    "Diese Erklärung ist ein Entwurf für die Entwicklungsphase. Vor einer Veröffentlichung muss sie um Anbieterangaben ergänzt und rechtlich geprüft werden.",
    "This statement is a draft for the development phase. Before publication, provider details must be added and it must be legally reviewed.",
    "Это черновик для этапа разработки. Перед публикацией нужно добавить данные об операторе и провести юридическую проверку.",
  ),
  start: tx("Zur Startseite", "Go to home page", "На главную"),
};

export function Datenschutz() {
  const { t } = useSprache();
  return (
    <section className="seite text">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p>{t(T.kurz)}</p>
      <h2>{t(T.wasTitel)}</h2>
      <ul>
        {T.was.map((x, i) => (
          <li key={i}>{t(x)}</li>
        ))}
      </ul>
      <h2>{t(T.nichtTitel)}</h2>
      <ul>
        {T.nicht.map((x, i) => (
          <li key={i}>{t(x)}</li>
        ))}
      </ul>
      <h2>{t(T.offlineTitel)}</h2>
      <p>{t(T.offline)}</p>
      <p className="hinweis">{t(T.entwurf)}</p>
      <p>
        <a href={link("/")}>{t(T.start)}</a>
      </p>
    </section>
  );
}
