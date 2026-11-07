import { tx, useSprache } from "../i18n/sprache";

const T = {
  titel: tx("Für Organisationen", "For organisations", "Для организаций"),
  einleitung: tx(
    "Der Antragslotse hilft nicht nur Einzelnen. Er spart auch Organisationen Zeit, die täglich Menschen bei Anträgen begleiten oder neue Mitarbeitende nach Berlin holen.",
    "The Antragslotse doesn't only help individuals. It also saves time for organisations that support people with applications every day or bring new staff to Berlin.",
    "Antragslotse помогает не только отдельным людям. Он экономит время организациям, которые ежедневно помогают с заявлениями или привозят в Берлин новых сотрудников.",
  ),
  angebote: [
    {
      titel: tx("Beratungsstellen und soziale Träger", "Advice centres and social organisations", "Консультации и социальные организации"),
      text: tx(
        "Berater-Version mit Fahrplänen für mehrere Klientinnen und Klienten, mehrsprachig und zum Ausdrucken. Jahreslizenz pro Arbeitsplatz.",
        "Adviser version with roadmaps for several clients, multilingual and printable. Annual licence per workstation.",
        "Версия для консультантов с планами для нескольких клиентов, на разных языках и для печати. Годовая лицензия на рабочее место.",
      ),
    },
    {
      titel: tx("Relocation-Agenturen und Hochschulen", "Relocation agencies and universities", "Релокационные агентства и вузы"),
      text: tx(
        "Paket „Neu in Berlin“ für zuziehende Fachkräfte, Studierende und Forschende: Anmeldung, Steuer-ID, Krankenkasse, Aufenthalt. Abrechnung pro Person.",
        "“New in Berlin” package for incoming professionals, students and researchers: registration, tax ID, health insurance, residence. Billed per person.",
        "Пакет «Новые в Берлине» для приезжающих специалистов, студентов и исследователей: прописка, налоговый номер, страховка, ВНЖ. Оплата за человека.",
      ),
    },
    {
      titel: tx("Arbeitgeber", "Employers", "Работодатели"),
      text: tx(
        "Unterstützung genau dann, wenn sie gebraucht wird: beim Zuzug, bei Geburt und Elternzeit, bei Pflege von Angehörigen. Abrechnung pro Anlass, kein Monatsabo.",
        "Support exactly when it's needed: when moving here, at birth and parental leave, when caring for relatives. Billed per occasion, no monthly subscription.",
        "Помощь именно тогда, когда она нужна: при переезде, рождении ребёнка и отпуске по уходу, уходе за родственниками. Оплата за случай, без ежемесячной подписки.",
      ),
    },
    {
      titel: tx("Wohnungsunternehmen", "Housing companies", "Жилищные компании"),
      text: tx(
        "Für das Sozialmanagement: Mieterinnen und Mieter finden Wohngeld, Kinderzuschlag und Beratung, bevor Mietschulden entstehen.",
        "For social management: tenants find housing benefit, child supplement and advice before rent arrears build up.",
        "Для социальной службы: жильцы находят Wohngeld, Kinderzuschlag и консультации до того, как возникнут долги по аренде.",
      ),
    },
  ],
  grundsaetze: tx("Unsere Grundsätze", "Our principles", "Наши принципы"),
  liste: [
    tx("Für Privatpersonen ist der Antragslotse derzeit kostenlos.", "The Antragslotse is currently free for private individuals.", "Для частных лиц Antragslotse сейчас бесплатен."),
    tx("Keine Werbung, kein Verkauf von Daten, keine Provisionen von Anbietern.", "No ads, no sale of data, no commissions from providers.", "Никакой рекламы, продажи данных и комиссий от поставщиков."),
    tx(
      "Persönliche Angaben bleiben auf dem Gerät der Nutzerinnen und Nutzer. Organisationen sehen nur, was ihnen gezeigt wird.",
      "Personal information stays on users' devices. Organisations only see what they are shown.",
      "Личные данные остаются на устройствах пользователей. Организации видят только то, что им показывают.",
    ),
    tx("Inhalte werden regelmäßig mit den amtlichen Quellen abgeglichen.", "Content is regularly checked against official sources.", "Содержание регулярно сверяется с официальными источниками."),
  ],
  pilot: tx("Pilotpartner gesucht", "Looking for pilot partners", "Ищем пилотных партнёров"),
  pilotText: tx(
    "Wir suchen Organisationen in Berlin, die den Antragslotsen mit uns erproben. Die Kontaktadresse wird hier ergänzt.",
    "We are looking for organisations in Berlin to trial the Antragslotse with us. A contact address will be added here.",
    "Мы ищем организации в Берлине, которые вместе с нами испытают Antragslotse. Контактный адрес будет добавлен здесь.",
  ),
};

export function Organisationen() {
  const { t } = useSprache();
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>
      <ul className="stellen">
        {T.angebote.map((a, i) => (
          <li key={i} className="stelle-karte">
            <h2>{t(a.titel)}</h2>
            <p>{t(a.text)}</p>
          </li>
        ))}
      </ul>
      <section className="unterblock" aria-labelledby="grundsaetze">
        <h2 id="grundsaetze">{t(T.grundsaetze)}</h2>
        <ul className="haken">
          {T.liste.map((x, i) => (
            <li key={i}>{t(x)}</li>
          ))}
        </ul>
      </section>
      <section className="hinweis" aria-labelledby="pilot">
        <h2 id="pilot">{t(T.pilot)}</h2>
        <p>{t(T.pilotText)}</p>
      </section>
    </section>
  );
}
