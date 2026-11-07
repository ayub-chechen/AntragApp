import { tx, type Tx } from "../i18n/sprache";
import { BETRAG } from "../inhalte/leistungen";
import type { Antworten } from "../inhalte/typen";

export type Stufe = "wahrscheinlich" | "pruefen" | "hinweis";

export interface CheckErgebnis {
  id: string;
  stufe: Stufe;
  gruende: Tx[];
  /** Geschätzter Betrag im Monat. */
  betrag?: { art: "etwa" | "bis"; wert: number } | { art: "spanne"; von: number; bis: number };
}

export function euro(n: number): Tx {
  const r = Math.round(n);
  return {
    de: `${r.toLocaleString("de-DE")} €`,
    en: `€${r.toLocaleString("en-GB")}`,
    ru: `${r.toLocaleString("ru-RU")} €`,
  };
}

const zahl = (s: string | undefined) => {
  if (!s) return NaN;
  const t = s.replace(/[€\s]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return Number(t);
};

export function kinderAlter(a: Antworten): number[] {
  return (a.kinder_alter ?? "")
    .split(/[,;\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 0 && n < 30);
}

const satz = (de: string, en: string, ru: string) => tx(de, en, ru);

/**
 * Grobe Orientierung, welche Leistungen in Frage kommen. Bewusst vorsichtig:
 * „wahrscheinlich“ nur bei klaren Fällen, sonst „prüfen“. Ersetzt keine Beratung
 * und keinen Bescheid (Rechtsdienstleistungsgesetz).
 */
export function pruefeAnsprueche(a: Antworten): CheckErgebnis[] {
  const erg: CheckErgebnis[] = [];
  const bekommt = new Set((a.bekommt ?? "").split(",").filter(Boolean));
  const alter = zahl(a.alter);
  const partner = a.partner === "ja";
  const kinder = kinderAlter(a);
  const minderjaehrig = kinder.filter((k) => k < 18);
  const inAusbildung = a.kinder_ausbildung === "ja" ? kinder.filter((k) => k >= 18 && k < 25) : [];
  const kgKinder = minderjaehrig.length + inAusbildung.length;
  const einkommen = Math.max(0, zahl(a.einkommen) || 0);
  const miete = Math.max(0, zahl(a.miete) || 0);
  const taetigkeit = a.taetigkeit ?? "";
  const erwerbstaetig = taetigkeit === "angestellt" || taetigkeit === "selbststaendig";
  const allein = !partner && kinder.length > 0;
  const vermoegen = a.vermoegen === "ja";
  const rentenalter = taetigkeit === "rente" || alter >= 67;
  const personen = 1 + (partner ? 1 : 0) + kinder.length;
  const neu = (id: string) => !bekommt.has(id);

  // Bedarf nach Regelsätzen 2026 plus Warmmiete.
  const R = BETRAG.regel;
  const elternBedarf = (partner ? 2 * R.partner : R.allein) + (kinder.length ? miete * ((1 + (partner ? 1 : 0)) / personen) : miete);
  const kinderBedarf =
    kinder.reduce((s, k) => s + (k < 6 ? R.u6 : k < 14 ? R.u14 : k < 18 ? R.u18 : R.erwachsenesKind), 0) +
    (kinder.length ? miete * (kinder.length / personen) : 0);
  const bedarf = elternBedarf + kinderBedarf;
  const kindergeld = kgKinder * BETRAG.kindergeld;
  // Bei Arbeitseinkommen bleibt ein Teil frei. Grob: 100 € plus 20 % des Rests, höchstens 348 € (mit Kindern 378 €).
  const freibetrag = erwerbstaetig ? Math.min(kinder.length ? 378 : 348, einkommen > 100 ? 100 + 0.2 * (einkommen - 100) : einkommen) : 0;
  const anrechenbar = Math.max(0, einkommen - freibetrag) + kindergeld;

  if (kgKinder > 0 && neu("kindergeld")) {
    erg.push({
      id: "kindergeld",
      stufe: "wahrscheinlich",
      gruende: [
        satz(
          `${kgKinder === 1 ? "Ein Kind" : `${kgKinder} Kinder`} unter 18 oder in Ausbildung.`,
          `${kgKinder === 1 ? "One child" : `${kgKinder} children`} under 18 or in education.`,
          `${kgKinder === 1 ? "Один ребёнок" : `Детей: ${kgKinder}`} до 18 лет или на учёбе.`,
        ),
      ],
      betrag: { art: "etwa", wert: kindergeld },
    });
  }

  if ((a.schwanger === "ja" || kinder.some((k) => k === 0)) && neu("elterngeld")) {
    erg.push({
      id: "elterngeld",
      stufe: "wahrscheinlich",
      gruende: [satz("Ein Baby ist unterwegs oder unter 1 Jahr.", "A baby is on the way or under 1 year old.", "Ожидается ребёнок или малышу меньше года.")],
      betrag: { art: "spanne", von: 300, bis: 1800 },
    });
  }

  if (a.schwanger === "ja" && taetigkeit === "angestellt") {
    erg.push({
      id: "mutterschaftsgeld",
      stufe: "wahrscheinlich",
      gruende: [satz("Schwanger und angestellt.", "Pregnant and employed.", "Беременность и работа по найму.")],
    });
  }

  const grundsicherungMoeglich = !rentenalter && taetigkeit !== "ausbildung" && alter >= 15;
  let grundsicherung: Stufe | null = null;
  if (grundsicherungMoeglich && neu("grundsicherungsgeld")) {
    if (anrechenbar < bedarf * 0.95 && !vermoegen) grundsicherung = "wahrscheinlich";
    else if (anrechenbar < bedarf * 1.15) grundsicherung = "pruefen";
    if (grundsicherung) {
      erg.push({
        id: "grundsicherungsgeld",
        stufe: grundsicherung,
        gruende: [
          {
            de: `Ihr Haushalt braucht nach den Regelsätzen etwa ${euro(bedarf).de} im Monat (mit Miete). Angerechnet werden etwa ${euro(anrechenbar).de}.`,
            en: `By the standard rates your household needs about ${euro(bedarf).en} a month (incl. rent). About ${euro(anrechenbar).en} counts as income.`,
            ru: `По базовым ставкам вашей семье нужно около ${euro(bedarf).ru} в месяц (с арендой). Учитывается доход около ${euro(anrechenbar).ru}.`,
          },
          ...(vermoegen
            ? [satz("Ersparnisse werden angerechnet, die Freibeträge hängen vom Alter ab.", "Savings are counted; allowances depend on age.", "Сбережения учитываются, необлагаемые суммы зависят от возраста.")]
            : []),
        ],
        betrag: { art: "etwa", wert: Math.max(0, bedarf - anrechenbar) },
      });
    }
  }

  if (rentenalter && neu("grundsicherung_alter")) {
    if (anrechenbar < bedarf * 1.1) {
      erg.push({
        id: "grundsicherung_alter",
        stufe: anrechenbar < bedarf * 0.95 && !vermoegen ? "wahrscheinlich" : "pruefen",
        gruende: [
          {
            de: `Bedarf etwa ${euro(bedarf).de} im Monat, Einkommen etwa ${euro(einkommen).de}.`,
            en: `Need about ${euro(bedarf).en} a month, income about ${euro(einkommen).en}.`,
            ru: `Потребность около ${euro(bedarf).ru} в месяц, доход около ${euro(einkommen).ru}.`,
          },
        ],
        betrag: { art: "etwa", wert: Math.max(0, bedarf - einkommen) },
      });
    }
  }

  // Kinderzuschlag und Wohngeld gehen dem Grundsicherungsgeld vor, wenn sie zusammen reichen.
  const vorrang = satz(
    "Zusammen mit Wohngeld kann das Grundsicherungsgeld ersetzen.",
    "Together with housing benefit, this can replace basic income support.",
    "Вместе с Wohngeld это может заменить Grundsicherungsgeld.",
  );
  if (kinder.some((k) => k < 25) && neu("kinderzuschlag")) {
    const mindest = allein ? 600 : 900;
    if (einkommen >= mindest && anrechenbar < bedarf + kinder.length * BETRAG.kinderzuschlag) {
      erg.push({
        id: "kinderzuschlag",
        stufe: "pruefen",
        gruende: [
          satz(
            "Sie haben Kinder und eigenes Einkommen, das knapp für die ganze Familie ist.",
            "You have children and your own income, which is tight for the whole family.",
            "У вас есть дети и собственный доход, которого семье едва хватает.",
          ),
          ...(grundsicherung ? [vorrang] : []),
        ],
        betrag: { art: "bis", wert: kinder.filter((k) => k < 25).length * BETRAG.kinderzuschlag },
      });
    }
  }

  if (allein && minderjaehrig.length > 0 && neu("unterhaltsvorschuss")) {
    const U = BETRAG.uvg;
    erg.push({
      id: "unterhaltsvorschuss",
      stufe: "pruefen",
      gruende: [
        satz(
          "Sie erziehen allein. Zahlt der andere Elternteil keinen oder zu wenig Unterhalt, springt das Jugendamt ein.",
          "You are a single parent. If the other parent pays no or too little maintenance, the youth office steps in.",
          "Вы воспитываете ребёнка одни. Если второй родитель не платит или платит мало, помогает Jugendamt.",
        ),
      ],
      betrag: { art: "bis", wert: minderjaehrig.reduce((s, k) => s + (k < 6 ? U.u6 : k < 12 ? U.u12 : U.u18), 0) },
    });
  }

  // Wohngeld: eigenes Einkommen, Miete im Verhältnis hoch, nicht deutlich über groben Grenzen.
  const wohngeldGrenze = 1900 + 650 * (personen - 1);
  if (
    neu("wohngeld") &&
    einkommen > 0 &&
    miete > 0 &&
    taetigkeit !== "ausbildung" &&
    (grundsicherung !== "wahrscheinlich" || erwerbstaetig || taetigkeit === "rente") &&
    einkommen <= wohngeldGrenze &&
    (miete / einkommen >= 0.3 || anrechenbar < bedarf * 1.4)
  ) {
    erg.push({
      id: "wohngeld",
      stufe: "pruefen",
      gruende: [
        {
          de: `Ihre Warmmiete ist ${Math.round((miete / einkommen) * 100)} % Ihres Einkommens.`,
          en: `Your rent is ${Math.round((miete / einkommen) * 100)}% of your income.`,
          ru: `Аренда составляет ${Math.round((miete / einkommen) * 100)} % вашего дохода.`,
        },
      ],
    });
  }

  if (taetigkeit === "arbeitslos" && neu("alg") && a.versichert !== "nein") {
    erg.push({
      id: "alg",
      stufe: a.versichert === "ja" ? "wahrscheinlich" : "pruefen",
      gruende: [
        a.versichert === "ja"
          ? satz("Mindestens 12 Monate versichert gearbeitet.", "At least 12 months of insured work.", "Не менее 12 месяцев страхового стажа.")
          : satz("Hängt davon ab, ob Sie 12 Monate versichert gearbeitet haben.", "Depends on whether you had 12 months of insured work.", "Зависит от наличия 12 месяцев страхового стажа."),
      ],
    });
  }

  if (taetigkeit === "ausbildung" && alter < 45 && neu("bafoeg")) {
    erg.push({
      id: "bafoeg",
      stufe: "pruefen",
      gruende: [
        satz(
          "Sie sind in Studium oder Ausbildung. Ob und wie viel, hängt vor allem vom Einkommen der Eltern ab.",
          "You are in studies or training. Whether and how much depends mainly on your parents' income.",
          "Вы учитесь. Будет ли и сколько — зависит в основном от дохода родителей.",
        ),
      ],
      betrag: { art: "bis", wert: BETRAG.bafoeg },
    });
  }

  if (a.pflege === "ja" && neu("pflegegrad")) {
    erg.push({
      id: "pflegegrad",
      stufe: "pruefen",
      gruende: [satz("Jemand braucht Hilfe im Alltag.", "Someone needs help in daily life.", "Кому-то нужна помощь в быту.")],
      betrag: { art: "spanne", von: 347, bis: 990 },
    });
  }

  if (a.behinderung === "ja") {
    erg.push({
      id: "schwerbehinderung",
      stufe: "pruefen",
      gruende: [
        satz(
          "Ab einem Grad der Behinderung von 50 gibt es den Ausweis und Nachteilsausgleiche.",
          "From a disability degree of 50 you get the card and compensations.",
          "Со степени инвалидности 50 положено удостоверение и льготы.",
        ),
      ],
    });
  }

  const hatSozialleistung =
    grundsicherung === "wahrscheinlich" ||
    bekommt.has("grundsicherungsgeld") ||
    bekommt.has("grundsicherung_alter") ||
    erg.some((e) => e.id === "grundsicherung_alter" && e.stufe === "wahrscheinlich");
  if (neu("rundfunk") && (hatSozialleistung || bekommt.has("bafoeg"))) {
    erg.push({
      id: "rundfunk",
      stufe: "pruefen",
      gruende: [
        satz(
          "Mit einem Bescheid über diese Leistung können Sie sich befreien lassen.",
          "With a notice for this benefit you can be exempted.",
          "С решением об этом пособии можно получить освобождение.",
        ),
      ],
    });
  }

  const familienleistung = ["wohngeld", "kinderzuschlag", "grundsicherungsgeld"].some((id) => bekommt.has(id) || erg.some((e) => e.id === id));
  if (kinder.some((k) => k < 25) && familienleistung) {
    erg.push({
      id: "but",
      stufe: "pruefen",
      gruende: [
        satz(
          "Kinder in Familien mit Wohngeld, Kinderzuschlag oder Grundsicherungsgeld bekommen das Bildungspaket.",
          "Children in families with housing benefit, child supplement or basic income support get the education package.",
          "Дети из семей с Wohngeld, Kinderzuschlag или Grundsicherungsgeld получают пакет на образование.",
        ),
      ],
    });
  }

  if (kinder.some((k) => k < 6) || a.schwanger === "ja") {
    erg.push({
      id: "kita",
      stufe: "hinweis",
      gruende: [satz("Für Kinder bis zur Einschulung.", "For children until they start school.", "Для детей до школы.")],
    });
  }

  if (einkommen > 0 && einkommen <= wohngeldGrenze && miete > 0) {
    erg.push({
      id: "wbs",
      stufe: "hinweis",
      gruende: [
        satz(
          "Mit Ihrem Einkommen kommt ein WBS für eine günstigere Wohnung in Frage.",
          "With your income, a WBS for a cheaper flat may be possible.",
          "С вашим доходом возможен WBS на более дешёвое жильё.",
        ),
      ],
    });
  }

  const rang: Record<Stufe, number> = { wahrscheinlich: 0, pruefen: 1, hinweis: 2 };
  return erg.sort((x, y) => rang[x.stufe] - rang[y.stufe]);
}
