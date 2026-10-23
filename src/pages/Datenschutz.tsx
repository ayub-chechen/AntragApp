import { link } from "../lib/router";

export function Datenschutz() {
  return (
    <section className="seite text">
      <h1 tabIndex={-1}>Datenschutz</h1>
      <p>
        Kurz gesagt: Ihre Angaben verlassen Ihr Gerät nicht. Die Antragshilfe hat keinen Server, der
        Formulardaten empfängt.
      </p>
      <h2>Was mit Ihren Angaben passiert</h2>
      <ul>
        <li>Sie werden nur im Arbeitsspeicher Ihres Browsers gehalten, solange die Seite offen ist.</li>
        <li>Das PDF wird auf Ihrem Gerät erzeugt und direkt heruntergeladen.</li>
        <li>Beim Schließen oder Neuladen der Seite sind die Angaben weg. Mit „Alle Angaben löschen“ geht das sofort.</li>
      </ul>
      <h2>Was wir nicht tun</h2>
      <ul>
        <li>Keine Analyse- oder Tracking-Werkzeuge, keine Cookies.</li>
        <li>Keine Schriften oder Skripte von fremden Servern.</li>
        <li>Keine Weitergabe an Ämter. Das Einreichen machen Sie selbst.</li>
      </ul>
      <h2>Offline-Nutzung</h2>
      <p>
        Damit die App auch ohne Internet startet, speichert der Browser die Programmdateien. Darin
        sind keine persönlichen Angaben enthalten.
      </p>
      <p className="hinweis">
        Diese Erklärung ist ein Entwurf für die Entwicklungsphase und muss vor einer
        Veröffentlichung um Anbieterangaben und eine rechtliche Prüfung ergänzt werden.
      </p>
      <p>
        <a href={link("/")}>Zur Startseite</a>
      </p>
    </section>
  );
}
