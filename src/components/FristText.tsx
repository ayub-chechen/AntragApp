import { tx, useSprache } from "../i18n/sprache";
import type { Frist } from "../inhalte/typen";
import { heute, tageBis } from "../lib/datum";

export function useDatumFormat() {
  const { locale, t } = useSprache();
  const datum = (d: Date) => d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const lang = (d: Date) => d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const relativ = (d: Date) => {
    const n = tageBis(d, heute());
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(n) < 14) return rtf.format(n, "day");
    if (Math.abs(n) < 60) return rtf.format(Math.round(n / 7), "week");
    return rtf.format(Math.round(n / 30.4), "month");
  };
  return { datum, lang, relativ, t };
}

const T = {
  bis: tx("bis", "by", "до"),
  ab: tx("ab", "from", "с"),
  etwa: tx("etwa", "around", "около"),
  zwischen: tx("zwischen", "between", "между"),
  und: tx("und", "and", "и"),
};

/** Zeigt eine Frist kurz an, z. B. „bis 12.11.2026 · in 5 Tagen“. */
export function FristText({ frist }: { frist: Frist }) {
  const { datum, relativ, t } = useDatumFormat();
  if (frist.ab && frist.bis) {
    const begonnen = tageBis(frist.ab) <= 0;
    return (
      <>
        {begonnen ? `${t(T.bis)} ${datum(frist.bis)}` : `${t(T.zwischen)} ${datum(frist.ab)} ${t(T.und)} ${datum(frist.bis)}`}
        <span className="relativ"> · {relativ(begonnen ? frist.bis : frist.ab)}</span>
      </>
    );
  }
  const [wort, d] = frist.bis ? [T.bis, frist.bis] : frist.ab ? [T.ab, frist.ab] : [T.etwa, frist.etwa!];
  return (
    <>
      {t(wort)} {datum(d)}
      <span className="relativ"> · {relativ(d)}</span>
    </>
  );
}
