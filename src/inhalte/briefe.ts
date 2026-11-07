import { tx, type Tx } from "../i18n/sprache";

export interface BriefArt {
  id: string;
  muster: RegExp;
  titel: Tx;
  erklaerung: Tx;
  tun: Tx[];
  vorlagen?: string[];
}

/** Reihenfolge = Wichtigkeit. Ein Brief kann mehrere Arten haben (z. B. Bescheid mit Rückforderung). */
export const briefArten: BriefArt[] = [
  {
    id: "einladung",
    muster: /einladung|meldetermin|bitte (kommen|erscheinen) sie|persönlich(en)? vorzusprechen|laden sie .{0,30}ein/i,
    titel: tx("Einladung zu einem Termin", "Invitation to an appointment", "Приглашение на встречу"),
    erklaerung: tx(
      "Das Amt möchte Sie persönlich sprechen. Beim Jobcenter wird das Geld gekürzt, wenn Sie ohne wichtigen Grund nicht kommen.",
      "The office wants to see you in person. At the Jobcenter, payments are cut if you do not attend without good reason.",
      "Ведомство хочет поговорить с вами лично. В Jobcenter выплаты урежут, если вы не придёте без уважительной причины.",
    ),
    tun: [
      tx("Termin in Ihre Termine übernehmen.", "Add the appointment to your dates.", "Добавьте встречу в свои сроки."),
      tx(
        "Können Sie nicht: vorher anrufen oder schreiben und den Grund nennen, bei Krankheit mit Attest.",
        "If you cannot attend: call or write beforehand and give the reason; if ill, with a doctor's note.",
        "Если не можете: заранее позвоните или напишите и назовите причину, при болезни — со справкой.",
      ),
      tx("Genannte Unterlagen mitnehmen.", "Bring the documents mentioned.", "Возьмите указанные документы."),
    ],
    vorlagen: ["termin"],
  },
  {
    id: "mitwirkung",
    muster: /mitwirkung|fehlende unterlagen|reichen sie .{0,60}(nach|ein)|bitte (senden|schicken|übersenden|legen) sie|benötigen (wir )?(noch|folgende)|§\s?6[06] sgb i\b/i,
    titel: tx("Das Amt braucht noch Unterlagen", "The office needs more documents", "Ведомству нужны ещё документы"),
    erklaerung: tx(
      "Ohne die Unterlagen kann das Amt Zahlungen stoppen oder den Antrag ablehnen. Die Fristen sind oft kurz.",
      "Without the documents, the office can stop payments or reject the application. Deadlines are often short.",
      "Без документов ведомство может остановить выплаты или отказать. Сроки часто короткие.",
    ),
    tun: [
      tx("Unterlagen bis zur Frist schicken, als Kopie, nie das Original.", "Send the documents by the deadline, as copies, never originals.", "Отправьте документы до срока — копии, не оригиналы."),
      tx("Schaffen Sie es nicht: vor Ablauf um mehr Zeit bitten.", "If you can't make it: ask for more time before the deadline.", "Не успеваете — до окончания срока попросите продление."),
      tx(
        "Abgabe belegen lassen: Eingangsstempel, Upload-Bestätigung oder Einschreiben.",
        "Get proof of submission: receipt stamp, upload confirmation or registered mail.",
        "Сохраните подтверждение: штамп о получении, подтверждение загрузки или заказное письмо.",
      ),
    ],
    vorlagen: ["unterlagen", "frist"],
  },
  {
    id: "anhoerung",
    muster: /anhörung|anhören|gelegenheit,? sich .{0,30}zu äußern|stellung (zu )?nehmen/i,
    titel: tx("Anhörung: Sie dürfen Stellung nehmen", "Hearing: you may give your view", "Слушание: вы можете высказаться"),
    erklaerung: tx(
      "Das Amt will etwas zu Ihrem Nachteil entscheiden, z. B. Geld zurückfordern oder kürzen, und fragt vorher Ihre Sicht.",
      "The office intends to decide something to your disadvantage, e.g. reclaim or cut money, and asks for your view first.",
      "Ведомство собирается принять невыгодное для вас решение, например потребовать деньги назад или урезать, и сначала спрашивает ваше мнение.",
    ),
    tun: [
      tx("Bis zur Frist schriftlich antworten und erklären, wie es war.", "Reply in writing by the deadline and explain what happened.", "До срока письменно ответьте и объясните, как было."),
      tx("Belege beilegen.", "Enclose evidence.", "Приложите подтверждения."),
      tx("Bei Unsicherheit eine Beratungsstelle fragen.", "If unsure, ask an advice centre.", "Если не уверены — обратитесь в консультацию."),
    ],
    vorlagen: ["frist"],
  },
  {
    id: "rueckforderung",
    muster: /erstattung|zu erstatten|zurück(zu)?zahlen|rückforderung|überzahlung|aufhebungs- und erstattungsbescheid/i,
    titel: tx("Das Amt fordert Geld zurück", "The office is reclaiming money", "Ведомство требует вернуть деньги"),
    erklaerung: tx(
      "Sie sollen Geld zurückzahlen, das Sie nach Ansicht des Amts zu viel bekommen haben.",
      "You are asked to repay money which, in the office's view, you received in excess.",
      "От вас требуют вернуть деньги, которые, по мнению ведомства, вы получили лишние.",
    ),
    tun: [
      tx("Zeitraum und Beträge genau prüfen.", "Check the period and amounts carefully.", "Внимательно проверьте период и суммы."),
      tx("Ist es falsch: Widerspruch innerhalb der Frist.", "If it is wrong: object within the deadline.", "Если это ошибка — подайте возражение в срок."),
      tx("Können Sie nicht auf einmal zahlen: Ratenzahlung beantragen.", "If you cannot pay at once: ask to pay in instalments.", "Не можете заплатить сразу — попросите рассрочку."),
    ],
    vorlagen: ["widerspruch", "raten"],
  },
  {
    id: "ablehnung",
    muster: /abgelehnt|ablehnung|kein anspruch|nicht bewilligt|versagungsbescheid|hiermit versagt/i,
    titel: tx("Ablehnung", "Rejection", "Отказ"),
    erklaerung: tx(
      "Ihr Antrag wurde ganz oder teilweise abgelehnt. Der Grund steht meist unter „Begründung“.",
      "Your application was fully or partly rejected. The reason is usually under “Begründung”.",
      "Ваше заявление отклонено полностью или частично. Причина обычно указана в разделе «Begründung».",
    ),
    tun: [
      tx("Begründung lesen: Fehlt nur ein Nachweis?", "Read the reason: is just one document missing?", "Прочитайте причину: может, не хватает одного документа?"),
      tx("Widerspruch innerhalb eines Monats ist kostenlos.", "Objecting within one month is free of charge.", "Возражение в течение месяца бесплатно."),
      tx("Beratung holen, bevor die Frist abläuft.", "Get advice before the deadline passes.", "Получите консультацию до окончания срока."),
    ],
    vorlagen: ["widerspruch"],
  },
  {
    id: "mahnung",
    muster: /mahnung|zahlungserinnerung|säumniszuschlag|mahngebühr|vollstreckung|pfändung|inkasso/i,
    titel: tx("Mahnung oder Zahlungsaufforderung", "Payment reminder or demand", "Напоминание или требование оплаты"),
    erklaerung: tx(
      "Es wird Geld verlangt, das noch offen ist. Bei Vollstreckung oder Pfändung wird es ernst.",
      "Money is being demanded that is still outstanding. Enforcement or garnishment is serious.",
      "Требуют оплатить задолженность. При взыскании или аресте счёта дело серьёзное.",
    ),
    tun: [
      tx("Prüfen, ob die Forderung stimmt und von wem sie kommt.", "Check whether the claim is correct and who it is from.", "Проверьте, верно ли требование и от кого оно."),
      tx("Bezahlen oder Raten anbieten.", "Pay or offer instalments.", "Оплатите или предложите рассрочку."),
      tx(
        "Bei Pfändung sofort P-Konto einrichten und Schuldnerberatung fragen.",
        "In case of garnishment, set up a P-Konto immediately and ask debt advice.",
        "При взыскании сразу оформите P-Konto и обратитесь в консультацию по долгам.",
      ),
    ],
    vorlagen: ["raten"],
  },
  {
    id: "weiterbewilligung",
    muster: /weiterbewilligung|bewilligungszeitraum endet|folgeantrag|läuft .{0,20}aus/i,
    titel: tx("Antrag rechtzeitig verlängern", "Renew your application in time", "Вовремя продлите заявление"),
    erklaerung: tx(
      "Ihre Leistung läuft bald aus. Ohne neuen Antrag hört die Zahlung auf.",
      "Your benefit is ending soon. Without a new application, payments stop.",
      "Срок выплаты скоро закончится. Без нового заявления выплаты прекратятся.",
    ),
    tun: [tx("Weiterbewilligungs- oder Folgeantrag vor dem Ende stellen.", "Submit the renewal application before the end.", "Подайте заявление о продлении до окончания срока.")],
  },
  {
    id: "bewilligung",
    muster: /bewilligt|bewilligung|wir gewähren|werden .{0,40}(gewährt|gezahlt)|festgesetzt/i,
    titel: tx("Bewilligung: Sie bekommen Geld", "Approval: you will receive money", "Одобрение: вам назначены выплаты"),
    erklaerung: tx(
      "Ihr Antrag wurde bewilligt. Im Bescheid stehen Betrag und Zeitraum.",
      "Your application was approved. The notice states the amount and period.",
      "Ваше заявление одобрено. В решении указаны сумма и период.",
    ),
    tun: [
      tx("Beträge und Zeitraum prüfen.", "Check amounts and period.", "Проверьте суммы и период."),
      tx("Ende des Zeitraums merken und rechtzeitig verlängern.", "Note the end date and renew in time.", "Запомните дату окончания и вовремя продлите."),
      tx(
        "Änderungen sofort melden: Einkommen, Umzug, Haushalt.",
        "Report changes immediately: income, move, household.",
        "Сразу сообщайте об изменениях: доход, переезд, состав семьи.",
      ),
    ],
  },
];

export const absenderListe: { muster: RegExp; name: Tx }[] = [
  { muster: /jobcenter/i, name: tx("Jobcenter", "Jobcenter", "Jobcenter") },
  { muster: /familienkasse/i, name: tx("Familienkasse", "Family benefits office", "Familienkasse") },
  { muster: /agentur für arbeit|arbeitsagentur/i, name: tx("Agentur für Arbeit", "Employment agency", "Агентство по труду") },
  { muster: /finanzamt/i, name: tx("Finanzamt", "Tax office", "Налоговая (Finanzamt)") },
  { muster: /wohngeld/i, name: tx("Wohngeldstelle", "Housing benefit office", "Wohngeldstelle") },
  { muster: /elterngeld/i, name: tx("Elterngeldstelle", "Parental allowance office", "Elterngeldstelle") },
  { muster: /ausbildungsförderung|bafög|studierendenwerk/i, name: tx("BAföG-Amt", "BAföG office", "Ведомство BAföG") },
  { muster: /pflegekasse/i, name: tx("Pflegekasse", "Care insurance", "Касса по уходу") },
  { muster: /krankenkasse|\bAOK\b|techniker krankenkasse|barmer|\bDAK\b|\bIKK\b|\bBKK\b/i, name: tx("Krankenkasse", "Health insurer", "Больничная касса") },
  { muster: /beitragsservice|rundfunkbeitrag/i, name: tx("Beitragsservice (Rundfunkbeitrag)", "Beitragsservice (broadcasting fee)", "Beitragsservice (взнос за ТВ)") },
  { muster: /rentenversicherung/i, name: tx("Deutsche Rentenversicherung", "German Pension Insurance", "Пенсионное страхование") },
  { muster: /landesamt für einwanderung|ausländerbehörde/i, name: tx("Landesamt für Einwanderung", "State Immigration Office", "Ведомство по делам иммиграции") },
  { muster: /jugendamt|unterhaltsvorschuss/i, name: tx("Jugendamt", "Youth office", "Jugendamt") },
  { muster: /sozialamt|amt für soziales/i, name: tx("Sozialamt", "Social welfare office", "Sozialamt") },
  { muster: /bürgeramt|meldebehörde/i, name: tx("Bürgeramt", "Citizens' office", "Bürgeramt") },
  { muster: /gericht/i, name: tx("Gericht", "Court", "Суд") },
  { muster: /inkasso/i, name: tx("Inkasso-Unternehmen", "Debt collection agency", "Коллекторское агентство") },
];

export interface Wort {
  wort: string;
  muster: RegExp;
  erklaerung: Tx;
}

export const glossar: Wort[] = [
  {
    wort: "Bescheid",
    muster: /bescheid/i,
    erklaerung: tx(
      "Die schriftliche Entscheidung des Amts. Er gilt, wenn Sie nicht rechtzeitig widersprechen.",
      "The office's written decision. It becomes binding if you do not object in time.",
      "Письменное решение ведомства. Вступает в силу, если вы вовремя не возразите.",
    ),
  },
  {
    wort: "Widerspruch",
    muster: /widerspruch/i,
    erklaerung: tx(
      "Ihr kostenloser Einwand gegen einen Bescheid. Ein kurzer Brief reicht, die Begründung kann später folgen.",
      "Your free objection to a decision. A short letter is enough; reasons can follow later.",
      "Бесплатное возражение против решения. Достаточно короткого письма, обоснование можно прислать позже.",
    ),
  },
  {
    wort: "Rechtsbehelfsbelehrung",
    muster: /rechtsbehelfsbelehrung/i,
    erklaerung: tx(
      "Der Abschnitt am Ende, der sagt, wie und bis wann Sie widersprechen können.",
      "The section at the end that explains how and by when you can object.",
      "Раздел в конце, где сказано, как и до какого срока можно возразить.",
    ),
  },
  {
    wort: "Bekanntgabe",
    muster: /bekanntgabe/i,
    erklaerung: tx(
      "Der Tag, an dem der Brief als zugestellt gilt: bei Post der vierte Tag nach dem Absenden.",
      "The day the letter counts as delivered: by post, the fourth day after it was sent.",
      "День, когда письмо считается доставленным: по почте — четвёртый день после отправки.",
    ),
  },
  {
    wort: "Mitwirkungspflicht",
    muster: /mitwirkung/i,
    erklaerung: tx(
      "Ihre Pflicht, Angaben zu machen und Nachweise zu bringen. Ohne sie kann das Amt Leistungen versagen.",
      "Your duty to provide information and evidence. Without it, the office can refuse benefits.",
      "Ваша обязанность предоставлять сведения и документы. Без этого ведомство может отказать в выплатах.",
    ),
  },
  {
    wort: "Anhörung",
    muster: /anhörung/i,
    erklaerung: tx(
      "Ihre Chance, sich zu äußern, bevor etwas zu Ihrem Nachteil entschieden wird.",
      "Your chance to comment before something is decided against you.",
      "Ваша возможность высказаться до принятия невыгодного решения.",
    ),
  },
  {
    wort: "Bedarfsgemeinschaft",
    muster: /bedarfsgemeinschaft/i,
    erklaerung: tx(
      "Alle Personen im Haushalt, deren Geld beim Jobcenter zusammen gerechnet wird, z. B. Paare und ihre Kinder.",
      "Everyone in the household whose money the Jobcenter counts together, e.g. couples and their children.",
      "Все члены семьи, чьи доходы Jobcenter считает вместе, например пара и их дети.",
    ),
  },
  {
    wort: "Bewilligungszeitraum",
    muster: /bewilligungszeitraum/i,
    erklaerung: tx("Der Zeitraum, für den Sie das Geld bekommen.", "The period for which you receive the money.", "Период, на который назначены выплаты."),
  },
  {
    wort: "Vorläufig",
    muster: /vorläufig/i,
    erklaerung: tx(
      "Die Entscheidung ist noch nicht endgültig, z. B. weil Ihr Einkommen schwankt. Später wird abgerechnet.",
      "The decision is not final yet, e.g. because your income varies. It will be settled later.",
      "Решение пока не окончательное, например из-за колеблющегося дохода. Позже будет перерасчёт.",
    ),
  },
  {
    wort: "Aufhebung",
    muster: /aufhebung|aufgehoben/i,
    erklaerung: tx(
      "Eine frühere Bewilligung wird ganz oder teilweise zurückgenommen.",
      "An earlier approval is withdrawn in full or in part.",
      "Прежнее решение о выплатах отменяется полностью или частично.",
    ),
  },
  {
    wort: "Kosten der Unterkunft",
    muster: /kosten der unterkunft|\bKdU\b/i,
    erklaerung: tx("Miete und Heizung, die das Amt übernimmt.", "Rent and heating paid by the office.", "Аренда и отопление, которые оплачивает ведомство."),
  },
  {
    wort: "Regelbedarf",
    muster: /regelbedarf|regelsatz/i,
    erklaerung: tx(
      "Der feste Betrag für Essen, Kleidung, Strom und Alltag, 2026 für Alleinstehende 563 €.",
      "The fixed amount for food, clothing, electricity and daily life; €563 for single people in 2026.",
      "Фиксированная сумма на еду, одежду, электричество и быт; в 2026 году 563 € для одиноких.",
    ),
  },
  {
    wort: "Leistungsminderung",
    muster: /leistungsminderung|minderung|sanktion/i,
    erklaerung: tx(
      "Eine Kürzung, z. B. wenn ein Termin ohne wichtigen Grund versäumt wurde.",
      "A cut, e.g. if an appointment was missed without good reason.",
      "Сокращение выплат, например за пропущенную без причины встречу.",
    ),
  },
  {
    wort: "Säumniszuschlag",
    muster: /säumniszuschlag/i,
    erklaerung: tx("Ein Aufschlag, weil zu spät gezahlt wurde.", "A surcharge for paying late.", "Надбавка за просрочку платежа."),
  },
  {
    wort: "Vollstreckung",
    muster: /vollstreckung|pfändung/i,
    erklaerung: tx(
      "Das Geld wird zwangsweise eingetrieben, z. B. vom Konto. Ein P-Konto schützt einen Grundbetrag.",
      "The money is collected by force, e.g. from your account. A P-Konto protects a basic amount.",
      "Принудительное взыскание, например со счёта. P-Konto защищает базовую сумму.",
    ),
  },
  {
    wort: "Zusicherung",
    muster: /zusicherung/i,
    erklaerung: tx(
      "Eine verbindliche Zusage vorab, z. B. dass das Jobcenter die neue Miete übernimmt.",
      "A binding advance promise, e.g. that the Jobcenter will cover the new rent.",
      "Обязательное предварительное согласие, например что Jobcenter оплатит новую аренду.",
    ),
  },
  {
    wort: "Formlos",
    muster: /formlos/i,
    erklaerung: tx("Ohne Vordruck: ein einfacher Brief oder eine E-Mail reicht.", "Without a form: a simple letter or email is enough.", "Без бланка: достаточно простого письма или e-mail."),
  },
  {
    wort: "Aktenzeichen",
    muster: /aktenzeichen|geschäftszeichen|\baz\.?\s/i,
    erklaerung: tx(
      "Die Nummer Ihres Vorgangs. Schreiben Sie sie auf jeden Brief an das Amt.",
      "Your case number. Write it on every letter to the office.",
      "Номер вашего дела. Указывайте его в каждом письме в ведомство.",
    ),
  },
];

export interface Vorlage {
  id: string;
  name: Tx;
  betreff: (z: { datum?: string; aktenzeichen?: string }) => string;
  text: (z: { datum?: string; aktenzeichen?: string }) => string;
}

/** Antwortbriefe gehen an deutsche Ämter, deshalb sind sie immer auf Deutsch. */
export const vorlagen: Vorlage[] = [
  {
    id: "widerspruch",
    name: tx("Widerspruch einlegen", "Lodge an objection", "Подать возражение (Widerspruch)"),
    betreff: (z) => `Widerspruch gegen den Bescheid${z.datum ? ` vom ${z.datum}` : ""}${z.aktenzeichen ? `, Az. ${z.aktenzeichen}` : ""}`,
    text: (z) =>
      `hiermit lege ich Widerspruch gegen Ihren Bescheid${z.datum ? ` vom ${z.datum}` : ""} ein.\n\nDie Begründung reiche ich nach. Bitte senden Sie mir eine Eingangsbestätigung.`,
  },
  {
    id: "frist",
    name: tx("Um mehr Zeit bitten", "Ask for more time", "Попросить продлить срок"),
    betreff: (z) => `Bitte um Fristverlängerung${z.aktenzeichen ? `, Az. ${z.aktenzeichen}` : ""}`,
    text: (z) =>
      `zu Ihrem Schreiben${z.datum ? ` vom ${z.datum}` : ""} bitte ich um Verlängerung der Frist um zwei Wochen.\n\nGrund: [bitte ergänzen, z. B. Unterlagen von Dritten fehlen noch].\n\nVielen Dank.`,
  },
  {
    id: "unterlagen",
    name: tx("Unterlagen nachreichen", "Send documents", "Отправить документы"),
    betreff: (z) => `Nachreichung von Unterlagen${z.aktenzeichen ? `, Az. ${z.aktenzeichen}` : ""}`,
    text: (z) =>
      `zu Ihrem Schreiben${z.datum ? ` vom ${z.datum}` : ""} sende ich Ihnen die angeforderten Unterlagen:\n\n- [Unterlage 1]\n- [Unterlage 2]\n\nBitte bestätigen Sie mir den Eingang.`,
  },
  {
    id: "termin",
    name: tx("Termin absagen oder verlegen", "Cancel or move an appointment", "Отменить или перенести встречу"),
    betreff: (z) => `Termin${z.datum ? ` aus Ihrem Schreiben vom ${z.datum}` : ""}${z.aktenzeichen ? `, Az. ${z.aktenzeichen}` : ""}`,
    text: () =>
      `den vorgesehenen Termin kann ich leider nicht wahrnehmen.\n\nGrund: [bitte ergänzen, z. B. Krankheit, Attest liegt bei].\n\nBitte nennen Sie mir einen neuen Termin.`,
  },
  {
    id: "raten",
    name: tx("Ratenzahlung beantragen", "Request instalments", "Попросить рассрочку"),
    betreff: (z) => `Antrag auf Ratenzahlung${z.aktenzeichen ? `, Az. ${z.aktenzeichen}` : ""}`,
    text: (z) =>
      `die Forderung aus Ihrem Schreiben${z.datum ? ` vom ${z.datum}` : ""} kann ich nicht auf einmal bezahlen.\n\nIch beantrage Ratenzahlung in Höhe von [Betrag] € monatlich.\n\nMeine Einnahmen und Ausgaben lege ich auf Wunsch gern dar.`,
  },
];
