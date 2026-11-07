import { ui } from "../i18n/ui";
import { tx, useSprache } from "../i18n/sprache";
import { beratung, krise } from "../inhalte/beratung";
import { link } from "../lib/router";

const T = {
  titel: tx("Hilfe und Beratung", "Help and advice", "Помощь и консультации"),
  einleitung: tx(
    "Manches lässt sich nicht allein klären. Diese Stellen beraten kostenlos, viele auch in anderen Sprachen.",
    "Some things can't be sorted out alone. These places give free advice, many in other languages too.",
    "Не всё можно решить самому. Эти организации консультируют бесплатно, многие и на других языках.",
  ),
  anrufen: tx("Anrufen", "Call", "Позвонить"),
  seite: tx("Zur Website", "Website", "Сайт"),
  mithelfen: tx("Jemand hilft Ihnen?", "Someone is helping you?", "Вам кто-то помогает?"),
  mithelfenText: tx(
    "Zeigen Sie Ihren Fahrplan einer Vertrauensperson oder Beraterin: Auf jeder Fahrplan-Seite gibt es „Teilen“ und „Drucken“. Ihre Angaben bleiben trotzdem bei Ihnen, es wird nichts hochgeladen.",
    "Show your roadmap to someone you trust or an adviser: every roadmap page has “Share” and “Print”. Your information still stays with you; nothing is uploaded.",
    "Покажите свой план доверенному человеку или консультанту: на каждой странице плана есть «Поделиться» и «Печать». Ваши данные всё равно остаются у вас, ничего не загружается.",
  ),
};

export function Hilfe() {
  const { t } = useSprache();
  return (
    <section className="seite">
      <h1 tabIndex={-1}>{t(T.titel)}</h1>
      <p className="einleitung">{t(T.einleitung)}</p>
      <ul className="stellen">
        {beratung.map((s) => (
          <li key={s.id} className="stelle-karte">
            <h2>{t(s.name)}</h2>
            <p>{t(s.hilft)}</p>
            {s.zeiten && <p className="klein">{t(s.zeiten)}</p>}
            <p className="halt-aktionen">
              {s.telefon && (
                <a className="knopf-zweit knopf-mittel" href={`tel:${s.telefon.replace(/\s/g, "")}`}>
                  {t(T.anrufen)}: {s.telefon}
                </a>
              )}
              {s.link && (
                <a className="extern" href={s.link} target="_blank" rel="noopener noreferrer">
                  {t(T.seite)}
                  <span className="sr">
                    {" "}
                    {t(s.name)} {t(ui.neuerTab)}
                  </span>
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
      <section className="unterblock" aria-labelledby="mithelfen">
        <h2 id="mithelfen">{t(T.mithelfen)}</h2>
        <p>{t(T.mithelfenText)}</p>
        <p>
          <a href={link("/")}>{t(ui.navStart)}</a>
        </p>
      </section>
      <section className="krise" aria-labelledby="krise">
        <h2 id="krise">{t(krise.titel)}</h2>
        <p>{t(krise.text)}</p>
      </section>
    </section>
  );
}
