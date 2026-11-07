import { tx } from "../i18n/sprache";
import { lies, monatsende, plusMonate, plusTage } from "../lib/datum";
import { LINKS } from "./links";
import type { Antworten, Frage, Lebenslage } from "./typen";

const ja = (a: Antworten, id: string) => a[id] === "ja";
const nein = (a: Antworten, id: string) => a[id] === "nein";

const JA_NEIN_OFFEN = tx(
  "Wenn Sie es nicht wissen, lassen Sie die Frage offen.",
  "If you don't know, leave it blank.",
  "Если не знаете, пропустите вопрос.",
);

function janein(id: string, frage: ReturnType<typeof tx>, extra: Partial<Frage> = {}): Frage {
  return { id, typ: "janein", frage, ...extra };
}

/** Geld, das es erst ab dem Antragsmonat gibt: Antrag noch in diesem Monat stellen. */
const abAntragsmonat = (_a: Antworten, h: Date) => ({ bis: monatsende(h) });
const AB_ANTRAGSMONAT = tx(
  "Gibt es erst ab dem Monat, in dem Sie den Antrag stellen. Jeder Monat Warten kostet Geld.",
  "Paid only from the month you apply. Every month you wait costs money.",
  "Выплачивается только с месяца подачи заявления. Каждый месяц ожидания — потерянные деньги.",
);

const RUNDFUNK = {
  titel: tx("Rundfunkbeitrag: Befreiung beantragen", "Broadcasting fee: apply for exemption", "Взнос за радио и ТВ: подать на освобождение"),
  link: { url: LINKS.rundfunk, text: tx("Zum Beitragsservice", "Go to the Beitragsservice", "На сайт Beitragsservice") },
};

export const lebenslagen: Lebenslage[] = [
  {
    id: "neu",
    titel: tx("Neu in Berlin oder umgezogen", "New in Berlin or moved house", "Переезд в Берлин или внутри города"),
    kurz: tx(
      "Wohnung anmelden, Steuer-ID, Krankenkasse, neue Adresse überall melden.",
      "Register your address, tax ID, health insurance, update your address everywhere.",
      "Прописка, налоговый номер, медстраховка, смена адреса во всех ведомствах.",
    ),
    fragen: [
      {
        id: "einzug",
        typ: "datum",
        pflicht: true,
        frage: tx("Wann ziehen Sie ein oder sind eingezogen?", "When do you move in, or when did you?", "Когда вы въезжаете или уже въехали?"),
      },
      {
        id: "herkunft",
        typ: "auswahl",
        pflicht: true,
        frage: tx("Woher ziehen Sie?", "Where are you moving from?", "Откуда вы переезжаете?"),
        optionen: [
          { wert: "berlin", text: tx("Aus Berlin (Umzug innerhalb Berlins)", "From within Berlin", "Из другого района Берлина") },
          { wert: "deutschland", text: tx("Aus einem anderen Ort in Deutschland", "From elsewhere in Germany", "Из другого города Германии") },
          { wert: "ausland", text: tx("Aus dem Ausland", "From abroad", "Из-за границы") },
        ],
      },
      {
        id: "staat",
        typ: "auswahl",
        frage: tx("Welche Staatsangehörigkeit haben Sie?", "What is your citizenship?", "Какое у вас гражданство?"),
        wenn: (a) => a.herkunft === "ausland",
        optionen: [
          { wert: "deutsch", text: tx("Deutsch", "German", "Немецкое") },
          { wert: "eu", text: tx("EU, EWR oder Schweiz", "EU, EEA or Switzerland", "ЕС, ЕЭЗ или Швейцария") },
          { wert: "andere", text: tx("Eine andere", "Another one", "Другое") },
        ],
      },
      janein("kinder", tx("Ziehen Kinder mit um?", "Are children moving with you?", "Переезжают ли с вами дети?")),
      janein(
        "leistungen",
        tx(
          "Bekommen Sie Geld von einem Amt, z. B. Kindergeld, Grundsicherungsgeld, BAföG oder Wohngeld?",
          "Do you receive money from an authority, e.g. child benefit, basic income support, BAföG or housing benefit?",
          "Получаете ли вы выплаты от ведомств, например Kindergeld, Grundsicherungsgeld, BAföG или Wohngeld?",
        ),
      ),
      janein("auto", tx("Haben Sie ein Auto oder Motorrad?", "Do you own a car or motorbike?", "Есть ли у вас машина или мотоцикл?")),
    ],
    schritte: [
      {
        id: "zusicherung",
        wenn: (a) => ja(a, "leistungen"),
        titel: tx(
          "Vor dem Umzug: Jobcenter fragen, wenn Sie Grundsicherungsgeld bekommen",
          "Before moving: ask the Jobcenter if you receive basic income support",
          "До переезда: спросите Jobcenter, если получаете Grundsicherungsgeld",
        ),
        text: tx(
          "Bekommen Sie Grundsicherungsgeld, holen Sie vor der Unterschrift unter den neuen Mietvertrag die Zusicherung des Jobcenters ein. Sonst zahlt es eine zu teure Miete eventuell nicht ganz und keine Umzugskosten.",
          "If you receive basic income support, get the Jobcenter's written approval before signing the new lease. Otherwise it may not cover rent that is too high, nor the moving costs.",
          "Если вы получаете Grundsicherungsgeld, получите письменное согласие Jobcenter до подписания нового договора аренды. Иначе слишком дорогую аренду могут оплатить не полностью, а расходы на переезд — не возместить.",
        ),
        frist: (a) => {
          const e = lies(a.einzug);
          return e ? { bis: e } : null;
        },
        link: { url: LINKS.jobcenter, text: tx("Zu jobcenter.digital", "Go to jobcenter.digital", "На jobcenter.digital") },
      },
      {
        id: "wgb",
        titel: tx("Wohnungsgeberbestätigung holen", "Get the landlord's confirmation", "Получить подтверждение от арендодателя"),
        text: tx(
          "Ihr Vermieter oder die Person, bei der Sie einziehen, bestätigt schriftlich Ihren Einzug. Ohne dieses Blatt klappt die Anmeldung nicht. Den Vordruck gibt es auf service.berlin.de.",
          "Your landlord, or the person you move in with, confirms your move in writing (Wohnungsgeberbestätigung). You cannot register without it. The form is on service.berlin.de.",
          "Арендодатель или человек, к которому вы въезжаете, письменно подтверждает ваш въезд (Wohnungsgeberbestätigung). Без него прописаться нельзя. Бланк есть на service.berlin.de.",
        ),
        frist: (a) => {
          const e = lies(a.einzug);
          return e ? { ab: e } : null;
        },
        unterlagen: [{ art: "mietvertrag", text: tx("Mietvertrag", "Lease", "Договор аренды") }],
      },
      {
        id: "anmelden",
        titel: tx("Wohnung anmelden", "Register your address", "Прописаться (Anmeldung)"),
        text: tx(
          "Innerhalb von 2 Wochen nach dem Einzug. Mit Online-Ausweis geht es online, sonst mit Termin im Bürgeramt. Unsere Ausfüllhilfe sammelt alle Angaben für das Formular.",
          "Within 2 weeks after moving in. With an online ID you can do it online, otherwise book an appointment at a Bürgeramt. Our form helper collects everything the form asks for.",
          "В течение 2 недель после въезда. С онлайн-функцией удостоверения — онлайн, иначе по записи в Bürgeramt. Наш помощник соберёт все данные для бланка.",
        ),
        frist: (a) => {
          const e = lies(a.einzug);
          return e ? { bis: plusTage(e, 14) } : null;
        },
        fristText: tx("§ 17 Bundesmeldegesetz", "Federal Registration Act, § 17", "§ 17 Федерального закона о регистрации"),
        wo: tx("Jedes Berliner Bürgeramt, gebührenfrei", "Any Berlin Bürgeramt, free of charge", "Любой Bürgeramt Берлина, бесплатно"),
        unterlagen: [
          { art: "ausweis", text: tx("Ausweis oder Reisepass", "ID card or passport", "Удостоверение личности или паспорт") },
          { art: "wgb", text: tx("Wohnungsgeberbestätigung", "Landlord's confirmation", "Подтверждение арендодателя") },
        ],
        intern: { pfad: "/antrag/wohnsitzanmeldung", text: tx("Ausfüllhilfe öffnen", "Open form helper", "Открыть помощника") },
        link: { url: LINKS.wohnsitz, text: tx("Termin oder Online-Anmeldung", "Appointment or online registration", "Запись или онлайн-регистрация") },
      },
      {
        id: "aufenthalt",
        wenn: (a) => a.herkunft === "ausland" && a.staat === "andere",
        titel: tx(
          "Aufenthaltstitel beim Landesamt für Einwanderung",
          "Residence permit at the State Immigration Office (LEA)",
          "Вид на жительство в Земельном ведомстве по делам иммиграции (LEA)",
        ),
        text: tx(
          "Wenn Sie mit Visum eingereist sind: Termin beim LEA früh buchen, deutlich vor Ablauf des Visums. Termine sind knapp. Die Meldebescheinigung von der Anmeldung brauchen Sie dafür.",
          "If you came with a visa: book an LEA appointment early, well before your visa expires. Appointments are scarce. You will need the registration certificate (Meldebescheinigung).",
          "Если вы въехали по визе: запишитесь в LEA заранее, задолго до окончания визы. Записей мало. Понадобится справка о прописке (Meldebescheinigung).",
        ),
        fristText: tx("vor Ablauf Ihres Visums", "before your visa expires", "до окончания визы"),
        unterlagen: [
          { art: "ausweis", text: tx("Reisepass mit Visum", "Passport with visa", "Паспорт с визой") },
          { art: "meldebescheinigung", text: tx("Meldebescheinigung", "Registration certificate", "Справка о прописке") },
        ],
        link: { url: LINKS.einwanderung, text: tx("Termin beim LEA", "LEA appointment", "Запись в LEA") },
      },
      {
        id: "steuerid",
        wenn: (a) => a.herkunft === "ausland",
        titel: tx("Steuer-ID kommt per Post", "Your tax ID arrives by post", "Налоговый номер придёт по почте"),
        text: tx(
          "Nach der Anmeldung schickt das Bundeszentralamt für Steuern Ihre Steuer-Identifikationsnummer per Brief, meist nach einigen Wochen. Ihr Arbeitgeber braucht sie für die Lohnabrechnung.",
          "After registering, the Federal Central Tax Office sends your tax ID by letter, usually after a few weeks. Your employer needs it for payroll.",
          "После прописки Федеральное налоговое ведомство пришлёт налоговый номер (Steuer-ID) письмом, обычно через несколько недель. Он нужен работодателю для расчёта зарплаты.",
        ),
        frist: (a) => {
          const e = lies(a.einzug);
          return e ? { etwa: plusTage(e, 35) } : null;
        },
        link: { url: LINKS.bzst, text: tx("Bundeszentralamt für Steuern", "Federal Central Tax Office", "Федеральное налоговое ведомство") },
      },
      {
        id: "versicherung",
        wenn: (a) => a.herkunft === "ausland",
        titel: tx("Krankenversicherung und Bankkonto", "Health insurance and bank account", "Медстраховка и банковский счёт"),
        text: tx(
          "In Deutschland muss jede Person krankenversichert sein. Als Angestellte geben Sie Ihre Krankenkasse beim Arbeitgeber an. Jede Person hat Anspruch auf ein Basiskonto, auch ohne festes Einkommen.",
          "Everyone in Germany must have health insurance. As an employee, tell your employer which health insurer you chose. Everyone has the right to a basic bank account, even without a steady income.",
          "В Германии медицинская страховка обязательна. Работающие сообщают работодателю свою больничную кассу. Каждый имеет право на базовый счёт (Basiskonto), даже без постоянного дохода.",
        ),
      },
      {
        id: "rundfunk",
        titel: tx("Rundfunkbeitrag anmelden oder ummelden", "Register or update the broadcasting fee", "Зарегистрировать или изменить взнос за радио и ТВ"),
        text: tx(
          "Pro Wohnung zahlt nur eine Person. Wohnt schon jemand mit Beitragskonto bei Ihnen, melden Sie das. Mit bestimmten Leistungen, z. B. Grundsicherungsgeld oder BAföG, können Sie sich befreien lassen.",
          "Only one person per household pays. If someone in your home already pays, report that. With certain benefits, e.g. basic income support or BAföG, you can apply for an exemption.",
          "Платит один человек на квартиру. Если кто-то из жильцов уже платит, сообщите об этом. При некоторых пособиях, например Grundsicherungsgeld или BAföG, можно получить освобождение.",
        ),
        link: RUNDFUNK.link,
      },
      {
        id: "aemter",
        wenn: (a) => ja(a, "leistungen"),
        titel: tx("Neue Adresse den Ämtern melden", "Tell the authorities your new address", "Сообщить новый адрес в ведомства"),
        text: tx(
          "Familienkasse, Jobcenter, BAföG-Amt oder Wohngeldstelle müssen Ihre neue Adresse kennen. Sonst kommen Briefe nicht an und Zahlungen können stoppen. Der Umzugs-Melder schreibt die Briefe für Sie.",
          "The family benefits office, Jobcenter, BAföG office or housing benefit office must know your new address. Otherwise letters get lost and payments can stop. The move notifier writes the letters for you.",
          "Familienkasse, Jobcenter, ведомство BAföG или Wohngeld должны знать ваш новый адрес. Иначе письма не дойдут, а выплаты могут остановиться. «Уведомление о переезде» составит письма за вас.",
        ),
        frist: (a) => {
          const e = lies(a.einzug);
          return e ? { bis: plusTage(e, 14) } : null;
        },
        unterlagen: [{ art: "meldebescheinigung", text: tx("Meldebescheinigung", "Registration certificate", "Справка о прописке") }],
        intern: { pfad: "/umzug-melden", text: tx("Umzugs-Melder öffnen", "Open move notifier", "Открыть уведомление о переезде") },
      },
      {
        id: "adressen",
        titel: tx(
          "Adresse bei Bank, Krankenkasse, Arbeitgeber und Versicherungen ändern",
          "Update your address with your bank, health insurer, employer and insurers",
          "Сменить адрес в банке, больничной кассе, у работодателя и в страховых",
        ),
        text: tx(
          "Am einfachsten mit einem Brief pro Stelle, den der Umzugs-Melder vorbereitet. Ein Nachsendeauftrag bei der Deutschen Post leitet Briefe einige Monate weiter (kostenpflichtig).",
          "Easiest with one letter per organisation, prepared by the move notifier. A mail forwarding order with Deutsche Post forwards letters for a few months (paid).",
          "Проще всего — по письму в каждую организацию, их подготовит «Уведомление о переезде». Платная услуга пересылки почты Deutsche Post (Nachsendeauftrag) несколько месяцев пересылает письма.",
        ),
        intern: { pfad: "/umzug-melden", text: tx("Briefe vorbereiten", "Prepare letters", "Подготовить письма") },
      },
      {
        id: "kita",
        wenn: (a) => ja(a, "kinder"),
        titel: tx("Kita-Gutschein und Schulplatz", "Daycare voucher and school place", "Ваучер на детский сад и место в школе"),
        text: tx(
          "Für die Kita brauchen Sie einen Kita-Gutschein vom Jugendamt Ihres Bezirks: frühestens 9 und spätestens 2 Monate vor dem Wunsch-Start. Die Kita ist in Berlin beitragsfrei. Schulpflichtige Kinder melden Sie bei der zuständigen Grundschule oder dem Schulamt an.",
          "For daycare you need a Kita voucher from the youth office of your district: at the earliest 9 and at the latest 2 months before the desired start. Daycare in Berlin is free of fees. Register school-age children with the local primary school or the school office.",
          "Для детского сада нужен ваучер (Kita-Gutschein) от Jugendamt вашего района: не раньше чем за 9 и не позже чем за 2 месяца до начала. Детский сад в Берлине бесплатный. Детей школьного возраста записывают в районную начальную школу или через Schulamt.",
        ),
        link: { url: LINKS.kitaGutschein, text: tx("Kita-Gutschein auf berlin.de", "Kita voucher on berlin.de", "Kita-Gutschein на berlin.de") },
        unterlagen: [{ art: "urkunde", text: tx("Geburtsurkunde des Kindes", "Child's birth certificate", "Свидетельство о рождении ребёнка") }],
      },
      {
        id: "fahrzeug",
        wenn: (a) => ja(a, "auto"),
        titel: tx("Fahrzeug ummelden und Bewohnerparkausweis", "Update vehicle papers and get a resident parking permit", "Перерегистрировать машину и получить парковочный пропуск жителя"),
        text: tx(
          "Die neue Adresse muss in die Fahrzeugpapiere (Zulassungsbehörde). Das alte Kennzeichen dürfen Sie behalten. In Parkzonen bekommen Sie einen Bewohnerparkausweis.",
          "The new address must be entered in the vehicle papers (registration office). You may keep your old number plate. In parking zones you can get a resident parking permit.",
          "Новый адрес нужно внести в документы на машину (Zulassungsbehörde). Старый номер можно оставить. В платных зонах можно получить пропуск жителя.",
        ),
        fristText: tx("unverzüglich nach dem Umzug", "promptly after moving", "сразу после переезда"),
        link: { url: LINKS.service, text: tx("Auf service.berlin.de suchen", "Search service.berlin.de", "Искать на service.berlin.de") },
        unterlagen: [{ text: tx("Zulassungsbescheinigung Teil I", "Registration certificate part I", "Свидетельство о регистрации, часть I") }],
      },
    ],
  },

  {
    id: "baby",
    titel: tx("Ein Baby kommt", "A baby is on the way", "Скоро будет ребёнок"),
    kurz: tx(
      "Mutterschaftsgeld, Elternzeit, Geburtsurkunde, Elterngeld, Kindergeld, Kita.",
      "Maternity pay, parental leave, birth certificate, parental allowance, child benefit, daycare.",
      "Пособие по беременности, отпуск по уходу, свидетельство о рождении, Elterngeld, Kindergeld, детский сад.",
    ),
    fragen: [
      {
        id: "geburt",
        typ: "datum",
        pflicht: true,
        frage: tx(
          "Wann ist der errechnete Geburtstermin oder der Geburtstag?",
          "What is the due date, or the date of birth?",
          "Какой предполагаемый срок родов или дата рождения?",
        ),
      },
      janein("verheiratet", tx("Sind die Eltern miteinander verheiratet?", "Are the parents married to each other?", "Состоят ли родители в браке друг с другом?")),
      janein("mutter_job", tx("Ist die schwangere Person angestellt?", "Is the pregnant person employed?", "Работает ли беременная по найму?")),
      janein("partner_job", tx("Ist der andere Elternteil angestellt?", "Is the other parent employed?", "Работает ли второй родитель по найму?")),
      janein("allein", tx("Werden Sie das Kind allein erziehen?", "Will you raise the child alone?", "Будете ли вы воспитывать ребёнка в одиночку?")),
      janein(
        "knapp",
        tx("Ist das Geld im Haushalt eher knapp?", "Is money in your household rather tight?", "Денег в семье скорее не хватает?"),
        { hilfe: JA_NEIN_OFFEN },
      ),
      janein("kita", tx("Soll das Kind mit etwa einem Jahr in die Kita?", "Should the child start daycare at about one year?", "Пойдёт ли ребёнок в сад примерно в год?")),
    ],
    schritte: [
      {
        id: "vaterschaft",
        wenn: (a) => nein(a, "verheiratet"),
        titel: tx("Vaterschaft und gemeinsames Sorgerecht erklären", "Acknowledge paternity and joint custody", "Признать отцовство и оформить совместную опеку"),
        text: tx(
          "Bei unverheirateten Eltern geht das schon vor der Geburt, kostenlos beim Jugendamt. Dann kann der Vater gleich in die Geburtsurkunde eingetragen werden.",
          "Unmarried parents can do this before the birth, free of charge at the youth office. Then the father can be entered in the birth certificate right away.",
          "Неженатые родители могут сделать это ещё до родов, бесплатно в Jugendamt. Тогда отца сразу впишут в свидетельство о рождении.",
        ),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { bis: g } : null;
        },
        wo: tx("Jugendamt Ihres Bezirks (kostenlos) oder Standesamt", "Youth office of your district (free) or registry office", "Jugendamt вашего района (бесплатно) или ЗАГС (Standesamt)"),
        unterlagen: [
          { art: "ausweis", text: tx("Ausweise beider Eltern", "IDs of both parents", "Удостоверения обоих родителей") },
          { art: "urkunde", text: tx("Geburtsurkunden der Eltern", "Parents' birth certificates", "Свидетельства о рождении родителей") },
        ],
      },
      {
        id: "mutterschaftsgeld",
        wenn: (a) => ja(a, "mutter_job"),
        titel: tx("Mutterschaftsgeld beantragen", "Apply for maternity pay", "Подать на пособие по беременности (Mutterschaftsgeld)"),
        text: tx(
          "Der Mutterschutz beginnt 6 Wochen vor dem Termin. Den Antrag stellen Sie bei Ihrer Krankenkasse, mit der Bescheinigung über den Geburtstermin von Ärztin oder Hebamme. Diese gibt es frühestens 7 Wochen vor dem Termin.",
          "Maternity protection starts 6 weeks before the due date. Apply with your health insurer, using the due-date certificate from your doctor or midwife. You can get it at the earliest 7 weeks before the due date.",
          "Декретный отпуск начинается за 6 недель до срока. Заявление подают в больничную кассу со справкой о сроке родов от врача или акушерки. Её выдают не раньше чем за 7 недель до срока.",
        ),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: plusTage(g, -49) } : null;
        },
        wo: tx("Ihre Krankenkasse", "Your health insurer", "Ваша больничная касса"),
        unterlagen: [{ art: "medizin", text: tx("Bescheinigung über den Geburtstermin", "Due-date certificate", "Справка о предполагаемом сроке родов") }],
      },
      {
        id: "elternzeit",
        wenn: (a) => ja(a, "mutter_job") || ja(a, "partner_job"),
        titel: tx("Elternzeit beim Arbeitgeber anmelden", "Notify your employer of parental leave", "Заявить работодателю об отпуске по уходу за ребёнком"),
        text: tx(
          "Schriftlich, spätestens 7 Wochen vor Beginn. Soll der andere Elternteil ab der Geburt zu Hause sein, ist das 7 Wochen vor dem Termin. Für die Mutter beginnt die Elternzeit meist nach dem Mutterschutz, 8 Wochen nach der Geburt.",
          "In writing, at the latest 7 weeks before it starts. If the other parent wants to be at home from the birth, that means 7 weeks before the due date. For the mother, parental leave usually starts after maternity protection, 8 weeks after the birth.",
          "Письменно, не позднее чем за 7 недель до начала. Если второй родитель хочет быть дома с рождения — за 7 недель до срока. У матери отпуск по уходу обычно начинается после декрета, через 8 недель после родов.",
        ),
        frist: (a) => {
          const g = lies(a.geburt);
          if (!g) return null;
          return { bis: ja(a, "partner_job") ? plusTage(g, -49) : plusTage(g, 56 - 49) };
        },
        fristText: tx("§ 16 Bundeselterngeld- und Elternzeitgesetz", "Federal Parental Allowance Act, § 16", "§ 16 закона об Elterngeld и Elternzeit"),
      },
      {
        id: "geburtsanzeige",
        titel: tx("Geburt beim Standesamt anzeigen", "Register the birth at the registry office", "Зарегистрировать рождение в ЗАГСе (Standesamt)"),
        text: tx(
          "Innerhalb einer Woche nach der Geburt. In der Klinik hilft man meist dabei. Mehrere Geburtsurkunden für Elterngeld, Kindergeld und Krankenkasse sind gebührenfrei.",
          "Within one week after the birth. Hospitals usually help with this. Several birth certificates for parental allowance, child benefit and health insurance are free of charge.",
          "В течение недели после родов. В роддоме обычно помогают. Несколько свидетельств о рождении для Elterngeld, Kindergeld и больничной кассы выдаются бесплатно.",
        ),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { bis: plusTage(g, 7) } : null;
        },
        fristText: tx("§ 18 Personenstandsgesetz", "Civil Status Act, § 18", "§ 18 закона о гражданском состоянии"),
        wo: tx("Standesamt des Bezirks, in dem das Kind geboren wurde", "Registry office of the district where the child was born", "Standesamt района, где родился ребёнок"),
        unterlagen: [
          { art: "ausweis", text: tx("Ausweise der Eltern", "Parents' IDs", "Удостоверения родителей") },
          { art: "urkunde", text: tx("Geburts- oder Heiratsurkunde der Eltern", "Parents' birth or marriage certificate", "Свидетельства о рождении или браке родителей") },
        ],
      },
      {
        id: "krankenkasse",
        titel: tx("Kind bei der Krankenkasse anmelden", "Register the child with your health insurer", "Записать ребёнка в больничную кассу"),
        text: tx(
          "Mit der Geburtsurkunde. Bei gesetzlich versicherten Eltern ist das Kind meist kostenlos familienversichert.",
          "With the birth certificate. If the parents have statutory insurance, the child is usually insured free of charge.",
          "Со свидетельством о рождении. Если родители застрахованы в государственной кассе, ребёнок обычно застрахован бесплатно.",
        ),
        unterlagen: [{ art: "urkunde", text: tx("Geburtsurkunde des Kindes", "Child's birth certificate", "Свидетельство о рождении ребёнка") }],
      },
      {
        id: "elterngeld",
        titel: tx("Elterngeld beantragen", "Apply for parental allowance (Elterngeld)", "Подать на Elterngeld"),
        text: tx(
          "Elterngeld ersetzt 65 bis 67 Prozent des Netto-Einkommens vor der Geburt. Es wird nur 3 Monate rückwirkend gezahlt, also spätestens im 3. Lebensmonat beantragen. In Berlin geht das online mit ElterngeldDigital.",
          "Parental allowance replaces 65 to 67 percent of your net income before the birth. It is paid back only 3 months, so apply by the 3rd month of life at the latest. In Berlin you can apply online with ElterngeldDigital.",
          "Elterngeld заменяет 65–67 % чистого дохода до рождения ребёнка. Задним числом платят только за 3 месяца, поэтому подайте не позднее 3-го месяца жизни ребёнка. В Берлине можно онлайн через ElterngeldDigital.",
        ),
        geld: tx("300 bis 1.800 € im Monat", "€300 to €1,800 per month", "от 300 до 1 800 € в месяц"),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: g, bis: plusMonate(g, 3) } : null;
        },
        tipp: tx(
          "Bei einem zu versteuernden Jahreseinkommen der Eltern über 175.000 € gibt es kein Elterngeld.",
          "If the parents' taxable annual income is above €175,000, there is no parental allowance.",
          "Если налогооблагаемый годовой доход родителей выше 175 000 €, Elterngeld не положен.",
        ),
        unterlagen: [
          { art: "urkunde", text: tx("Geburtsurkunde für Elterngeld", "Birth certificate for parental allowance", "Свидетельство о рождении для Elterngeld") },
          { art: "einkommen", text: tx("Gehaltsnachweise der letzten 12 Monate", "Payslips for the last 12 months", "Справки о зарплате за последние 12 месяцев") },
        ],
        link: { url: LINKS.elterngeldDigital, text: tx("Zu ElterngeldDigital", "Go to ElterngeldDigital", "На ElterngeldDigital") },
      },
      {
        id: "kindergeld",
        titel: tx("Kindergeld beantragen", "Apply for child benefit (Kindergeld)", "Подать на Kindergeld"),
        text: tx(
          "Zuständig ist die Familienkasse. Sie brauchen die Steuer-ID des Kindes, die nach der Geburtsanzeige per Post kommt. Kindergeld wird nur 6 Monate rückwirkend gezahlt.",
          "The family benefits office (Familienkasse) is responsible. You need the child's tax ID, which arrives by post after the birth is registered. Child benefit is paid back only 6 months.",
          "Отвечает Familienkasse. Нужен налоговый номер ребёнка — он придёт по почте после регистрации рождения. Задним числом Kindergeld платят только за 6 месяцев.",
        ),
        geld: tx("259 € im Monat pro Kind", "€259 per month per child", "259 € в месяц на ребёнка"),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: g, bis: plusMonate(g, 6) } : null;
        },
        unterlagen: [{ art: "steuer", text: tx("Steuer-ID des Kindes", "Child's tax ID", "Налоговый номер ребёнка") }],
        link: { url: LINKS.familienkasse, text: tx("Zur Familienkasse", "Go to the Familienkasse", "На сайт Familienkasse") },
      },
      {
        id: "kinderzuschlag",
        wenn: (a) => ja(a, "knapp"),
        titel: tx("Kinderzuschlag prüfen", "Check child supplement (Kinderzuschlag)", "Проверить Kinderzuschlag"),
        text: tx(
          "Zusätzlich zum Kindergeld, wenn das Einkommen für die Eltern reicht, aber nicht für die ganze Familie. Gibt es nicht rückwirkend.",
          "On top of child benefit, if your income covers the parents but not the whole family. Not paid retroactively.",
          "Доплата к Kindergeld, если дохода хватает родителям, но не всей семье. Задним числом не выплачивается.",
        ),
        geld: tx("bis zu 297 € im Monat pro Kind", "up to €297 per month per child", "до 297 € в месяц на ребёнка"),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: g } : null;
        },
        link: { url: LINKS.familienkasse, text: tx("Zur Familienkasse", "Go to the Familienkasse", "На сайт Familienkasse") },
      },
      {
        id: "unterhaltsvorschuss",
        wenn: (a) => ja(a, "allein"),
        titel: tx("Unterhaltsvorschuss prüfen", "Check child maintenance advance", "Проверить Unterhaltsvorschuss"),
        text: tx(
          "Zahlt der andere Elternteil keinen oder zu wenig Unterhalt, springt das Jugendamt ein. Rückwirkend höchstens für einen Monat, also früh beantragen.",
          "If the other parent pays no or too little maintenance, the youth office steps in. Paid back at most one month, so apply early.",
          "Если второй родитель не платит алименты или платит мало, помогает Jugendamt. Задним числом — максимум за один месяц, поэтому подайте рано.",
        ),
        geld: tx("227 € im Monat für Kinder unter 6", "€227 per month for children under 6", "227 € в месяц на ребёнка до 6 лет"),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: g, bis: plusMonate(g, 1) } : null;
        },
        wo: tx("Jugendamt Ihres Bezirks", "Youth office of your district", "Jugendamt вашего района"),
      },
      {
        id: "wohngeld",
        wenn: (a) => ja(a, "knapp"),
        titel: tx("Wohngeld prüfen", "Check housing benefit (Wohngeld)", "Проверить Wohngeld"),
        text: tx(
          "Mit Kind steigt der Anspruch. Wohngeld gibt es ab dem Antragsmonat.",
          "With a child, your entitlement rises. Housing benefit is paid from the month you apply.",
          "С ребёнком право на пособие растёт. Wohngeld платят с месяца подачи заявления.",
        ),
        link: { url: LINKS.wohngeld, text: tx("Wohngeld auf service.berlin.de", "Housing benefit on service.berlin.de", "Wohngeld на service.berlin.de") },
      },
      {
        id: "kita",
        wenn: (a) => ja(a, "kita"),
        titel: tx("Kita-Gutschein beantragen", "Apply for the daycare voucher", "Подать на ваучер в детский сад"),
        text: tx(
          "Beim Jugendamt Ihres Wohnbezirks, frühestens 9 und spätestens 2 Monate vor dem Wunsch-Start. Für einen Start mit einem Jahr also zwischen dem 3. und 10. Lebensmonat. Kita-Plätze früh suchen.",
          "At the youth office of your district, at the earliest 9 and at the latest 2 months before the desired start. For a start at age one, that is between month 3 and month 10. Start looking for a place early.",
          "В Jugendamt вашего района, не раньше чем за 9 и не позже чем за 2 месяца до начала. Для старта в год — между 3-м и 10-м месяцем жизни. Ищите место заранее.",
        ),
        frist: (a) => {
          const g = lies(a.geburt);
          return g ? { ab: plusMonate(g, 3), bis: plusMonate(g, 10) } : null;
        },
        link: { url: LINKS.kitaGutschein, text: tx("Kita-Gutschein auf berlin.de", "Kita voucher on berlin.de", "Kita-Gutschein на berlin.de") },
      },
    ],
  },

  {
    id: "studium",
    titel: tx("Studium oder Ausbildung beginnen", "Starting university or training", "Начало учёбы или профобучения"),
    kurz: tx(
      "BAföG, Krankenversicherung, Kindergeld, Rundfunkbeitrag, Folgeantrag.",
      "BAföG, health insurance, child benefit, broadcasting fee, follow-up application.",
      "BAföG, медстраховка, Kindergeld, взнос за ТВ, повторное заявление.",
    ),
    fragen: [
      {
        id: "beginn",
        typ: "datum",
        pflicht: true,
        frage: tx("Wann beginnt Ihr Studium oder Ihre Ausbildung?", "When does your degree or training start?", "Когда начинается учёба или обучение?"),
      },
      {
        id: "art",
        typ: "auswahl",
        pflicht: true,
        frage: tx("Was beginnen Sie?", "What are you starting?", "Что вы начинаете?"),
        optionen: [
          { wert: "studium", text: tx("Studium an einer Hochschule", "University degree", "Учёбу в вузе") },
          { wert: "schule", text: tx("Schulische Ausbildung, z. B. Berufsfachschule", "School-based training, e.g. vocational school", "Обучение в профшколе (Berufsfachschule)") },
          { wert: "betrieb", text: tx("Ausbildung in einem Betrieb, mit Vergütung", "Apprenticeship in a company, with pay", "Обучение на предприятии с оплатой") },
        ],
      },
      janein("eltern", tx("Wohnen Sie bei Ihren Eltern?", "Do you live with your parents?", "Вы живёте с родителями?")),
      janein("unter25", tx("Sind Sie jünger als 25?", "Are you under 25?", "Вам меньше 25 лет?")),
      janein("umzug", tx("Ziehen Sie dafür in eine neue Wohnung?", "Are you moving to a new home for it?", "Вы переезжаете ради этого на новую квартиру?")),
    ],
    schritte: [
      {
        id: "anmelden",
        wenn: (a) => ja(a, "umzug"),
        titel: tx("Neue Wohnung anmelden", "Register your new address", "Прописаться по новому адресу"),
        text: tx(
          "Innerhalb von 2 Wochen nach dem Einzug. Den ganzen Umzug begleitet die Lebenslage „Neu in Berlin oder umgezogen“.",
          "Within 2 weeks after moving in. The life event “New in Berlin or moved house” guides you through the whole move.",
          "В течение 2 недель после въезда. Весь переезд сопровождает раздел «Переезд в Берлин или внутри города».",
        ),
        intern: { pfad: "/lage/neu", text: tx("Zur Lebenslage Umzug", "Go to “moving”", "К разделу о переезде") },
      },
      {
        id: "krankenversicherung",
        wenn: (a) => a.art === "studium",
        titel: tx("Krankenversicherung klären", "Sort out health insurance", "Оформить медстраховку"),
        text: tx(
          "Unter 25 meist kostenlos über die Familienversicherung der Eltern, sonst studentische Krankenversicherung. Für die Einschreibung meldet die Krankenkasse Ihren Status elektronisch an die Hochschule.",
          "Under 25 usually free through your parents' family insurance, otherwise student health insurance. For enrolment, the insurer reports your status electronically to the university.",
          "До 25 лет обычно бесплатно через семейную страховку родителей, иначе студенческая страховка. Для зачисления больничная касса передаёт ваш статус в вуз электронно.",
        ),
        frist: (a) => {
          const b = lies(a.beginn);
          return b ? { bis: plusTage(b, -28) } : null;
        },
        fristText: tx("vor der Einschreibung", "before enrolment", "до зачисления"),
      },
      {
        id: "bafoeg",
        wenn: (a) => a.art !== "betrieb",
        titel: tx("BAföG beantragen", "Apply for BAföG", "Подать на BAföG"),
        text: tx(
          "Gezahlt wird ab dem Monat des Antrags, nicht rückwirkend. Deshalb spätestens im ersten Monat beantragen. Zur Not reicht zuerst ein kurzer formloser Antrag, die Unterlagen kommen später. Beim Studium ist die Hälfte ein zinsloses Darlehen.",
          "Paid from the month you apply, not retroactively. So apply in the first month at the latest. If needed, a short informal application is enough at first; documents can follow. For university students, half is an interest-free loan.",
          "Выплачивается с месяца подачи, не задним числом. Поэтому подайте не позднее первого месяца учёбы. В крайнем случае сначала хватит короткого заявления в свободной форме, документы можно донести. У студентов половина — беспроцентный кредит.",
        ),
        geld: tx(
          "bis 992 € im Monat (mit eigener Wohnung und eigener Krankenversicherung)",
          "up to €992 per month (with own home and own health insurance)",
          "до 992 € в месяц (при отдельном жилье и своей страховке)",
        ),
        frist: (a) => {
          const b = lies(a.beginn);
          return b ? { bis: monatsende(b) } : null;
        },
        unterlagen: [
          { art: "bescheinigung", text: tx("Immatrikulations- oder Schulbescheinigung", "Enrolment or school certificate", "Справка о зачислении или из школы") },
          { art: "steuer", text: tx("Steuerbescheide der Eltern", "Parents' tax assessments", "Налоговые уведомления родителей") },
          { art: "kontoauszug", text: tx("Nachweise über eigenes Vermögen", "Proof of your own savings", "Подтверждение собственных сбережений") },
        ],
        link: { url: LINKS.bafoeg, text: tx("Zu BAföG Digital", "Go to BAföG Digital", "На BAföG Digital") },
      },
      {
        id: "bab",
        wenn: (a) => a.art === "betrieb",
        titel: tx("Berufsausbildungsbeihilfe prüfen", "Check vocational training allowance (BAB)", "Проверить Berufsausbildungsbeihilfe (BAB)"),
        text: tx(
          "Wenn Sie für die Ausbildung nicht bei den Eltern wohnen können und die Vergütung nicht reicht, kann die Agentur für Arbeit Berufsausbildungsbeihilfe zahlen.",
          "If you cannot live with your parents during training and your pay is not enough, the employment agency may pay a vocational training allowance.",
          "Если во время обучения вы не можете жить у родителей и оплаты не хватает, агентство по труду может выплачивать Berufsausbildungsbeihilfe.",
        ),
        wo: tx("Agentur für Arbeit", "Employment agency", "Агентство по труду (Agentur für Arbeit)"),
      },
      {
        id: "kindergeld",
        wenn: (a) => ja(a, "unter25"),
        titel: tx("Kindergeld läuft weiter: Nachweis schicken", "Child benefit continues: send proof", "Kindergeld продолжается: отправить подтверждение"),
        text: tx(
          "Ihre Eltern bekommen bis zu Ihrem 25. Geburtstag weiter Kindergeld, solange Sie in Ausbildung sind. Die Familienkasse braucht dafür die Schul- oder Immatrikulationsbescheinigung.",
          "Your parents keep getting child benefit until you turn 25, as long as you are in education. The Familienkasse needs your school or enrolment certificate.",
          "Родители получают Kindergeld до вашего 25-летия, пока вы учитесь. Familienkasse нужна справка из школы или вуза.",
        ),
        geld: tx("259 € im Monat", "€259 per month", "259 € в месяц"),
        frist: (a) => {
          const b = lies(a.beginn);
          return b ? { etwa: b } : null;
        },
        unterlagen: [{ art: "bescheinigung", text: tx("Immatrikulations- oder Schulbescheinigung", "Enrolment or school certificate", "Справка о зачислении или из школы") }],
        link: { url: LINKS.familienkasse, text: tx("Zur Familienkasse", "Go to the Familienkasse", "На сайт Familienkasse") },
      },
      {
        id: "rundfunk",
        wenn: (a) => nein(a, "eltern") && a.art !== "betrieb",
        titel: RUNDFUNK.titel,
        text: tx(
          "Wer BAföG bekommt und nicht bei den Eltern wohnt, kann sich vom Rundfunkbeitrag befreien lassen. Antrag mit dem BAföG-Bescheid.",
          "If you receive BAföG and do not live with your parents, you can be exempted from the broadcasting fee. Apply with your BAföG notice.",
          "Если вы получаете BAföG и живёте отдельно от родителей, можно освободиться от взноса. Заявление — с решением о BAföG.",
        ),
        unterlagen: [{ art: "bescheid", text: tx("BAföG-Bescheid", "BAföG notice", "Решение о BAföG") }],
        link: RUNDFUNK.link,
      },
      {
        id: "wohngeld",
        wenn: (a) => nein(a, "eltern"),
        titel: tx("Wohngeld nur, wenn kein BAföG möglich ist", "Housing benefit only if BAföG is not possible", "Wohngeld — только если BAföG невозможен"),
        text: tx(
          "Wer dem Grunde nach BAföG oder Berufsausbildungsbeihilfe bekommen kann, hat meist keinen Anspruch auf Wohngeld. Ausnahmen gibt es, z. B. wenn Sie zu alt für BAföG sind.",
          "If you are in principle eligible for BAföG or BAB, you usually cannot get housing benefit. There are exceptions, e.g. if you are too old for BAföG.",
          "Если вам в принципе положен BAföG или BAB, Wohngeld обычно не дают. Бывают исключения, например если вы старше возраста для BAföG.",
        ),
        link: { url: LINKS.wohngeld, text: tx("Wohngeld auf service.berlin.de", "Housing benefit on service.berlin.de", "Wohngeld на service.berlin.de") },
      },
      {
        id: "folgeantrag",
        wenn: (a) => a.art !== "betrieb",
        titel: tx("BAföG-Folgeantrag stellen", "Submit the BAföG follow-up application", "Подать повторное заявление на BAföG"),
        text: tx(
          "BAföG wird meist für ein Jahr bewilligt. Stellen Sie den Folgeantrag 2 Monate vor dem Ende, dann läuft das Geld ohne Lücke weiter.",
          "BAföG is usually granted for one year. Apply again 2 months before it ends so payments continue without a gap.",
          "BAföG обычно назначают на год. Подайте повторное заявление за 2 месяца до окончания, чтобы выплаты шли без перерыва.",
        ),
        frist: (a) => {
          const b = lies(a.beginn);
          return b ? { bis: plusMonate(b, 10) } : null;
        },
        link: { url: LINKS.bafoeg, text: tx("Zu BAföG Digital", "Go to BAföG Digital", "На BAföG Digital") },
      },
      {
        id: "leistungsnachweis",
        wenn: (a) => a.art === "studium",
        titel: tx("Leistungsnachweis nach dem 4. Semester", "Proof of progress after the 4th semester", "Подтверждение успеваемости после 4-го семестра"),
        text: tx(
          "Für BAföG ab dem 5. Semester brauchen Sie eine Bescheinigung der Hochschule über Ihre bisherigen Leistungen.",
          "For BAföG from the 5th semester, you need a certificate from your university about your progress so far.",
          "Для BAföG с 5-го семестра нужна справка вуза о вашей успеваемости.",
        ),
        frist: (a) => {
          const b = lies(a.beginn);
          return b ? { etwa: plusMonate(b, 24) } : null;
        },
        unterlagen: [{ art: "bescheinigung", text: tx("Leistungsbescheinigung der Hochschule", "University progress certificate", "Справка об успеваемости из вуза") }],
      },
    ],
  },

  {
    id: "job",
    titel: tx("Job verloren oder Kündigung bekommen", "Lost your job or got notice", "Потеря работы или увольнение"),
    kurz: tx(
      "Arbeitsuchend melden, Kündigungsfrist, Arbeitslosengeld, Grundsicherungsgeld.",
      "Register as a jobseeker, dismissal deadline, unemployment benefit, basic income support.",
      "Встать на учёт, срок для иска, пособие по безработице, Grundsicherungsgeld.",
    ),
    fragen: [
      {
        id: "kenntnis",
        typ: "datum",
        pflicht: true,
        frage: tx(
          "Wann haben Sie von der Kündigung oder dem Vertragsende erfahren?",
          "When did you learn about the dismissal or the end of your contract?",
          "Когда вы узнали об увольнении или окончании договора?",
        ),
        hilfe: tx("Bei einer Kündigung: der Tag, an dem sie Ihnen zuging.", "For a dismissal: the day you received it.", "При увольнении — день, когда вы его получили."),
      },
      {
        id: "ende",
        typ: "datum",
        pflicht: true,
        frage: tx("Wann ist der letzte Arbeitstag?", "When is your last working day?", "Когда последний рабочий день?"),
      },
      janein("kuendigung", tx("Hat Ihr Arbeitgeber gekündigt?", "Did your employer dismiss you?", "Вас уволил работодатель?")),
      janein(
        "versichert",
        tx(
          "Waren Sie in den letzten 30 Monaten mindestens 12 Monate angestellt (versicherungspflichtig)?",
          "In the last 30 months, were you employed (with social insurance) for at least 12 months?",
          "Работали ли вы за последние 30 месяцев не менее 12 месяцев по найму (с соцстрахованием)?",
        ),
        { hilfe: JA_NEIN_OFFEN },
      ),
      janein(
        "reicht",
        tx("Reicht das Geld danach zum Leben?", "Will you have enough money to live on afterwards?", "Хватит ли потом денег на жизнь?"),
        { hilfe: JA_NEIN_OFFEN },
      ),
      janein("kinder", tx("Leben Kinder in Ihrem Haushalt?", "Do children live in your household?", "Живут ли в вашей семье дети?")),
    ],
    schritte: [
      {
        id: "arbeitsuchend",
        titel: tx("Arbeitsuchend melden", "Register as a jobseeker", "Встать на учёт как ищущий работу"),
        text: tx(
          "Spätestens 3 Monate vor dem Ende. Erfahren Sie es kurzfristiger, innerhalb von 3 Tagen. Wer zu spät ist, bekommt eine Woche kein Arbeitslosengeld. Das geht online oder telefonisch.",
          "At the latest 3 months before the end. If you learn about it at shorter notice, within 3 days. If you are late, you lose one week of unemployment benefit. You can do it online or by phone.",
          "Не позднее чем за 3 месяца до окончания работы. Если узнали позже — в течение 3 дней. При опоздании неделю не платят пособие. Можно онлайн или по телефону.",
        ),
        frist: (a) => {
          const k = lies(a.kenntnis);
          const e = lies(a.ende);
          if (!k || !e) return null;
          const drei = plusMonate(e, -3);
          return { bis: drei >= k ? drei : plusTage(k, 3) };
        },
        fristText: tx("§ 38 SGB III", "§ 38 Social Code III", "§ 38 Социального кодекса III"),
        link: { url: LINKS.arbeitslosMelden, text: tx("Zur Agentur für Arbeit", "Go to the employment agency", "На сайт агентства по труду") },
      },
      {
        id: "klage",
        wenn: (a) => ja(a, "kuendigung"),
        titel: tx("Kündigung prüfen lassen: 3 Wochen Frist", "Have the dismissal checked: 3-week deadline", "Проверить увольнение: срок 3 недели"),
        text: tx(
          "Gegen eine Kündigung können Sie nur innerhalb von 3 Wochen nach Zugang beim Arbeitsgericht klagen. Lassen Sie sich sofort beraten, z. B. bei der Gewerkschaft, einer Fachanwältin oder der Rechtsantragstelle des Arbeitsgerichts.",
          "You can only challenge a dismissal at the labour court within 3 weeks of receiving it. Get advice immediately, e.g. from a union, a specialist lawyer or the labour court's legal application office.",
          "Оспорить увольнение в суде по трудовым делам можно только в течение 3 недель после получения. Сразу получите консультацию: в профсоюзе, у адвоката или в приёмной суда (Rechtsantragstelle).",
        ),
        frist: (a) => {
          const k = lies(a.kenntnis);
          return k ? { bis: plusTage(k, 21) } : null;
        },
        fristText: tx("§ 4 Kündigungsschutzgesetz", "Protection Against Dismissal Act, § 4", "§ 4 закона о защите от увольнения"),
        wo: tx("Arbeitsgericht Berlin", "Berlin labour court", "Суд по трудовым делам Берлина"),
        unterlagen: [{ text: tx("Kündigungsschreiben und Arbeitsvertrag", "Dismissal letter and employment contract", "Письмо об увольнении и трудовой договор") }],
      },
      {
        id: "arbeitslos",
        titel: tx("Arbeitslos melden und Arbeitslosengeld beantragen", "Register as unemployed and apply for unemployment benefit", "Зарегистрироваться как безработный и подать на пособие"),
        text: tx(
          "Spätestens am ersten Tag ohne Arbeit, sonst beginnt das Geld später. Vorsicht bei Aufhebungsverträgen: Dann droht eine Sperrzeit von bis zu 12 Wochen.",
          "On your first day without work at the latest, otherwise payments start later. Be careful with termination agreements: they can lead to a benefit block of up to 12 weeks.",
          "Не позднее первого дня без работы, иначе выплаты начнутся позже. Осторожно с соглашением о расторжении: возможна блокировка пособия до 12 недель.",
        ),
        geld: tx(
          "Arbeitslosengeld: 60 % des pauschalierten Netto-Gehalts, mit Kind 67 %",
          "Unemployment benefit: 60% of your standardised net pay, with a child 67%",
          "Пособие: 60 % от расчётной чистой зарплаты, с ребёнком 67 %",
        ),
        frist: (a) => {
          const e = lies(a.ende);
          return e ? { bis: plusTage(e, 1) } : null;
        },
        unterlagen: [
          { text: tx("Arbeitsbescheinigung vom Arbeitgeber", "Employment certificate from your employer", "Справка с работы (Arbeitsbescheinigung)") },
          { text: tx("Kündigung oder Aufhebungsvertrag", "Dismissal letter or termination agreement", "Увольнение или соглашение о расторжении") },
        ],
        link: { url: LINKS.arbeitslosMelden, text: tx("Zur Agentur für Arbeit", "Go to the employment agency", "На сайт агентства по труду") },
        tipp: tx(
          "Ohne 12 Monate Versicherungszeit gibt es meist kein Arbeitslosengeld. Dann ist Grundsicherungsgeld wichtig.",
          "Without 12 months of insured employment there is usually no unemployment benefit. Then basic income support matters.",
          "Без 12 месяцев страхового стажа пособия обычно нет. Тогда важен Grundsicherungsgeld.",
        ),
      },
      {
        id: "grundsicherung",
        wenn: (a) => nein(a, "reicht"),
        titel: tx("Grundsicherungsgeld beim Jobcenter beantragen", "Apply for basic income support at the Jobcenter", "Подать на Grundsicherungsgeld в Jobcenter"),
        text: tx(
          "Seit 1. Juli 2026 heißt das Bürgergeld Grundsicherungsgeld. Es gibt das Geld ab dem Monat des Antrags, ein formloser Antrag reicht zuerst. Termine beim Jobcenter immer wahrnehmen oder vorher mit Grund absagen, sonst wird gekürzt.",
          "Since 1 July 2026, Bürgergeld is called Grundsicherungsgeld. It is paid from the month you apply; an informal application is enough at first. Always attend Jobcenter appointments or cancel in advance with a reason, otherwise payments are cut.",
          "С 1 июля 2026 года Bürgergeld называется Grundsicherungsgeld. Деньги платят с месяца подачи, сначала хватит заявления в свободной форме. Всегда приходите на встречи в Jobcenter или заранее отменяйте с причиной, иначе выплаты урежут.",
        ),
        geld: tx("Regelsatz 563 € für Alleinstehende, plus Miete und Heizung", "Standard rate €563 for single people, plus rent and heating", "Базовая ставка 563 € для одиноких, плюс аренда и отопление"),
        frist: (a, h) => {
          const e = lies(a.ende);
          return { bis: monatsende(e && e > h ? plusTage(e, 1) : h) };
        },
        fristText: AB_ANTRAGSMONAT,
        link: { url: LINKS.jobcenter, text: tx("Zu jobcenter.digital", "Go to jobcenter.digital", "На jobcenter.digital") },
      },
      {
        id: "familie",
        wenn: (a) => nein(a, "reicht") && ja(a, "kinder"),
        titel: tx("Kinderzuschlag und Wohngeld als Alternative prüfen", "Check child supplement and housing benefit as an alternative", "Проверить Kinderzuschlag и Wohngeld как альтернативу"),
        text: tx(
          "Für Familien mit etwas Einkommen, z. B. Arbeitslosengeld, können Kinderzuschlag und Wohngeld zusammen besser passen als Grundsicherungsgeld.",
          "For families with some income, e.g. unemployment benefit, child supplement plus housing benefit can be a better fit than basic income support.",
          "Семьям с небольшим доходом, например с пособием по безработице, Kinderzuschlag вместе с Wohngeld могут подойти лучше, чем Grundsicherungsgeld.",
        ),
        intern: { pfad: "/check", text: tx("Anspruchs-Check machen", "Do the benefits check", "Пройти проверку права на пособия") },
      },
      {
        id: "krankenversicherung",
        titel: tx("Krankenversicherung sichern", "Keep your health insurance", "Сохранить медстраховку"),
        text: tx(
          "Mit Arbeitslosengeld oder Grundsicherungsgeld sind Sie weiter versichert. Ohne Leistungen müssen Sie sich selbst versichern. Melden Sie sich bei Ihrer Krankenkasse.",
          "With unemployment benefit or basic income support you stay insured. Without benefits you must insure yourself. Contact your health insurer.",
          "С пособием по безработице или Grundsicherungsgeld страховка сохраняется. Без пособий нужно страховаться самостоятельно. Обратитесь в свою больничную кассу.",
        ),
        frist: (a) => {
          const e = lies(a.ende);
          return e ? { etwa: plusTage(e, 1) } : null;
        },
      },
      {
        id: "rundfunk",
        wenn: (a) => nein(a, "reicht"),
        titel: RUNDFUNK.titel,
        text: tx(
          "Mit dem Bescheid über Grundsicherungsgeld können Sie sich befreien lassen.",
          "With your basic income support notice, you can be exempted.",
          "С решением о Grundsicherungsgeld можно получить освобождение.",
        ),
        unterlagen: [{ art: "bescheid", text: tx("Bescheid des Jobcenters", "Jobcenter notice", "Решение Jobcenter") }],
        link: RUNDFUNK.link,
      },
    ],
  },

  {
    id: "geld",
    titel: tx("Das Geld reicht nicht", "Money is not enough", "Не хватает денег"),
    kurz: tx(
      "Wohngeld, Kinderzuschlag, Bildungspaket, Grundsicherung, Schuldnerberatung.",
      "Housing benefit, child supplement, education package, basic income support, debt advice.",
      "Wohngeld, Kinderzuschlag, пакет на образование, базовое обеспечение, помощь с долгами.",
    ),
    fragen: [
      janein("kinder", tx("Leben Kinder in Ihrem Haushalt?", "Do children live in your household?", "Живут ли в вашей семье дети?")),
      janein("allein", tx("Erziehen Sie allein?", "Are you a single parent?", "Вы воспитываете детей в одиночку?"), { wenn: (a) => ja(a, "kinder") }),
      janein("arbeit", tx("Haben Sie eigenes Einkommen, z. B. Lohn, Rente oder Arbeitslosengeld?", "Do you have your own income, e.g. wages, pension or unemployment benefit?", "Есть ли у вас свой доход: зарплата, пенсия или пособие по безработице?")),
      janein(
        "rente",
        tx(
          "Haben Sie das Rentenalter erreicht oder sind dauerhaft voll erwerbsgemindert?",
          "Have you reached pension age or are you permanently fully unable to work?",
          "Вы достигли пенсионного возраста или полностью и надолго нетрудоспособны?",
        ),
      ),
      janein("schulden", tx("Haben Sie Schulden, die Sie nicht mehr zahlen können?", "Do you have debts you can no longer pay?", "Есть ли долги, которые вы больше не можете платить?")),
    ],
    schritte: [
      {
        id: "check",
        titel: tx("Anspruchs-Check machen", "Do the benefits check", "Пройти проверку права на пособия"),
        text: tx(
          "In 3 Minuten sehen, welche Leistungen für Ihren Haushalt in Frage kommen und wie viel ungefähr.",
          "See in 3 minutes which benefits may fit your household and roughly how much.",
          "За 3 минуты узнайте, какие пособия могут подойти вашей семье и примерно сколько.",
        ),
        intern: { pfad: "/check", text: tx("Check starten", "Start check", "Начать проверку") },
      },
      {
        id: "wohngeld",
        wenn: (a) => ja(a, "arbeit"),
        titel: tx("Wohngeld beantragen", "Apply for housing benefit", "Подать на Wohngeld"),
        text: tx(
          "Zuschuss zur Miete für Menschen mit eigenem Einkommen, auch für Rentnerinnen und Rentner.",
          "A rent subsidy for people with their own income, pensioners included.",
          "Доплата к аренде для людей со своим доходом, в том числе пенсионеров.",
        ),
        frist: abAntragsmonat,
        fristText: AB_ANTRAGSMONAT,
        unterlagen: [
          { art: "mietvertrag", text: tx("Mietvertrag und letzte Nebenkostenabrechnung", "Lease and latest service charge statement", "Договор аренды и последний расчёт коммунальных") },
          { art: "einkommen", text: tx("Einkommensnachweise", "Proof of income", "Подтверждение дохода") },
        ],
        link: { url: LINKS.wohngeld, text: tx("Wohngeld auf service.berlin.de", "Housing benefit on service.berlin.de", "Wohngeld на service.berlin.de") },
      },
      {
        id: "kinderzuschlag",
        wenn: (a) => ja(a, "kinder") && ja(a, "arbeit"),
        titel: tx("Kinderzuschlag beantragen", "Apply for child supplement", "Подать на Kinderzuschlag"),
        text: tx(
          "Zusätzlich zum Kindergeld für Familien, deren Einkommen für die Eltern reicht, aber nicht für die Kinder.",
          "On top of child benefit, for families whose income covers the parents but not the children.",
          "Доплата к Kindergeld семьям, чьего дохода хватает родителям, но не детям.",
        ),
        geld: tx("bis zu 297 € im Monat pro Kind", "up to €297 per month per child", "до 297 € в месяц на ребёнка"),
        frist: abAntragsmonat,
        fristText: AB_ANTRAGSMONAT,
        link: { url: LINKS.familienkasse, text: tx("Zur Familienkasse", "Go to the Familienkasse", "На сайт Familienkasse") },
      },
      {
        id: "unterhaltsvorschuss",
        wenn: (a) => ja(a, "allein"),
        titel: tx("Unterhaltsvorschuss beantragen", "Apply for child maintenance advance", "Подать на Unterhaltsvorschuss"),
        text: tx(
          "Wenn der andere Elternteil keinen oder zu wenig Unterhalt zahlt. Rückwirkend höchstens ein Monat.",
          "If the other parent pays no or too little maintenance. Paid back at most one month.",
          "Если второй родитель не платит алименты или платит мало. Задним числом — максимум за месяц.",
        ),
        geld: tx("227 bis 394 € im Monat, je nach Alter", "€227 to €394 per month, depending on age", "от 227 до 394 € в месяц в зависимости от возраста"),
        frist: abAntragsmonat,
        wo: tx("Jugendamt Ihres Bezirks", "Youth office of your district", "Jugendamt вашего района"),
      },
      {
        id: "but",
        wenn: (a) => ja(a, "kinder"),
        titel: tx("Bildung und Teilhabe und berlinpass", "Education and participation package and berlinpass", "Пакет на образование и участие, berlinpass"),
        text: tx(
          "Für Kinder aus Familien mit Grundsicherungsgeld, Wohngeld oder Kinderzuschlag: Schulbedarf, Klassenfahrten, Nachhilfe und Vereinsbeiträge. Mit dem berlinpass gibt es Ermäßigungen.",
          "For children in families with basic income support, housing benefit or child supplement: school supplies, class trips, tutoring and club fees. The berlinpass gives discounts.",
          "Для детей из семей с Grundsicherungsgeld, Wohngeld или Kinderzuschlag: школьные принадлежности, поездки с классом, репетитор, кружки. С berlinpass — скидки.",
        ),
        link: { url: LINKS.but, text: tx("Bildungspaket auf service.berlin.de", "Education package on service.berlin.de", "Пакет на service.berlin.de") },
      },
      {
        id: "grundsicherung",
        wenn: (a) => !ja(a, "rente"),
        titel: tx("Grundsicherungsgeld beim Jobcenter", "Basic income support at the Jobcenter", "Grundsicherungsgeld в Jobcenter"),
        text: tx(
          "Wenn alles zusammen nicht zum Leben reicht. Es gibt das Geld ab dem Antragsmonat, ein formloser Antrag reicht zuerst.",
          "If everything together is not enough to live on. Paid from the month you apply; an informal application is enough at first.",
          "Если всего вместе не хватает на жизнь. Платят с месяца подачи, сначала хватит заявления в свободной форме.",
        ),
        geld: tx("Regelsatz 563 € für Alleinstehende, plus Miete und Heizung", "Standard rate €563 for single people, plus rent and heating", "Базовая ставка 563 € для одиноких, плюс аренда и отопление"),
        frist: abAntragsmonat,
        fristText: AB_ANTRAGSMONAT,
        link: { url: LINKS.jobcenter, text: tx("Zu jobcenter.digital", "Go to jobcenter.digital", "На jobcenter.digital") },
      },
      {
        id: "grundsicherung_alter",
        wenn: (a) => ja(a, "rente"),
        titel: tx("Grundsicherung im Alter beim Sozialamt", "Basic income in old age at the social welfare office", "Базовое обеспечение в старости (Sozialamt)"),
        text: tx(
          "Wenn die Rente nicht reicht. Ihre Kinder müssen erst ab 100.000 € Jahreseinkommen etwas dazu zahlen.",
          "If your pension is not enough. Your children only have to contribute if they earn more than €100,000 a year.",
          "Если пенсии не хватает. Дети должны доплачивать, только если их годовой доход выше 100 000 €.",
        ),
        geld: tx("Regelsatz 563 € plus Miete und Heizung", "Standard rate €563 plus rent and heating", "Базовая ставка 563 € плюс аренда и отопление"),
        frist: abAntragsmonat,
        link: { url: LINKS.grundsicherungAlter, text: tx("Auf service.berlin.de", "On service.berlin.de", "На service.berlin.de") },
      },
      {
        id: "wbs",
        titel: tx("Wohnberechtigungsschein (WBS)", "Housing eligibility certificate (WBS)", "Право на социальное жильё (WBS)"),
        text: tx(
          "Mit dem WBS können Sie sich auf günstigere Sozialwohnungen bewerben.",
          "With a WBS you can apply for cheaper social housing.",
          "С WBS можно претендовать на более дешёвое социальное жильё.",
        ),
        link: { url: LINKS.wbs, text: tx("WBS auf service.berlin.de", "WBS on service.berlin.de", "WBS на service.berlin.de") },
      },
      {
        id: "rundfunk",
        titel: RUNDFUNK.titel,
        text: tx(
          "Mit einem Bescheid über Grundsicherungsgeld, Grundsicherung im Alter oder BAföG (ohne Eltern-Wohnung) sind Sie befreit.",
          "With a notice for basic income support, basic income in old age or BAföG (not living with parents) you can be exempted.",
          "С решением о Grundsicherungsgeld, базовом обеспечении в старости или BAföG (при отдельном проживании) — освобождение.",
        ),
        link: RUNDFUNK.link,
      },
      {
        id: "schulden",
        wenn: (a) => ja(a, "schulden"),
        titel: tx("Kostenlose Schuldnerberatung", "Free debt advice", "Бесплатная консультация по долгам"),
        text: tx(
          "Anerkannte Beratungsstellen in Berlin helfen kostenlos. Ein Pfändungsschutzkonto (P-Konto) schützt Ihr Geld bis zur Freigrenze. Die Umwandlung ist bei Ihrer Bank kostenlos.",
          "Recognised advice centres in Berlin help free of charge. A garnishment protection account (P-Konto) protects your money up to the exemption limit. Your bank must convert it for free.",
          "Признанные консультации в Берлине помогают бесплатно. Счёт с защитой от взыскания (P-Konto) защищает деньги до необлагаемого предела. Банк переводит счёт бесплатно.",
        ),
        link: { url: LINKS.schuldnerStellen, text: tx("Beratungsstellen finden", "Find advice centres", "Найти консультацию") },
      },
    ],
  },

  {
    id: "pflege",
    titel: tx("Pflege, Krankheit oder Rente", "Care, illness or retirement", "Уход, болезнь или пенсия"),
    kurz: tx(
      "Pflegegrad, Pflegestützpunkt, Schwerbehindertenausweis, Rente, Vorsorge.",
      "Care level, care advice centre, disability card, pension, power of attorney.",
      "Степень ухода, консультация по уходу, удостоверение инвалида, пенсия, доверенность.",
    ),
    fragen: [
      {
        id: "wer",
        typ: "auswahl",
        frage: tx("Für wen suchen Sie Hilfe?", "Who are you looking for help for?", "Для кого вы ищете помощь?"),
        optionen: [
          { wert: "selbst", text: tx("Für mich selbst", "For myself", "Для себя") },
          { wert: "angehoerig", text: tx("Für eine Angehörige oder einen Angehörigen", "For a relative", "Для родственника") },
        ],
      },
      janein(
        "pflege",
        tx(
          "Braucht die Person im Alltag regelmäßig Hilfe, z. B. beim Waschen, Essen, im Haushalt?",
          "Does the person regularly need help in daily life, e.g. washing, eating, housework?",
          "Нужна ли человеку регулярная помощь в быту: мыться, есть, по хозяйству?",
        ),
      ),
      janein("behinderung", tx("Gibt es eine chronische Krankheit oder Behinderung?", "Is there a chronic illness or disability?", "Есть ли хроническое заболевание или инвалидность?")),
      janein("rente_bald", tx("Steht der Rentenbeginn bevor?", "Is retirement coming up?", "Скоро ли выход на пенсию?")),
      {
        id: "rentenbeginn",
        typ: "datum",
        frage: tx("Wann soll die Rente beginnen?", "When should the pension start?", "Когда должна начаться пенсия?"),
        wenn: (a) => ja(a, "rente_bald"),
      },
      janein(
        "reicht",
        tx("Reicht das Einkommen zum Leben?", "Is the income enough to live on?", "Хватает ли дохода на жизнь?"),
        { hilfe: JA_NEIN_OFFEN },
      ),
    ],
    schritte: [
      {
        id: "pflegegrad",
        wenn: (a) => ja(a, "pflege"),
        titel: tx("Pflegegrad bei der Pflegekasse beantragen", "Apply for a care level at the care insurance", "Подать на степень ухода в кассу по уходу"),
        text: tx(
          "Ein Anruf bei der Pflegekasse (sie gehört zur Krankenkasse) reicht als Antrag. Leistungen gibt es ab dem Antragsmonat, deshalb gleich anrufen. Danach kommt eine Gutachterin oder ein Gutachter vom Medizinischen Dienst.",
          "A phone call to the care insurance (part of the health insurer) counts as an application. Benefits start from the month you apply, so call right away. Then an assessor from the medical service visits.",
          "Звонка в кассу по уходу (она при больничной кассе) достаточно как заявления. Выплаты — с месяца подачи, поэтому звоните сразу. Потом придёт эксперт медицинской службы (Medizinischer Dienst).",
        ),
        geld: tx("Pflegegeld ab Pflegegrad 2: 347 bis 990 € im Monat", "Care allowance from care level 2: €347 to €990 per month", "Пособие по уходу со 2-й степени: от 347 до 990 € в месяц"),
        frist: abAntragsmonat,
        fristText: AB_ANTRAGSMONAT,
        wo: tx("Pflegekasse bei der Krankenkasse", "Care insurance at the health insurer", "Касса по уходу при больничной кассе"),
      },
      {
        id: "beratung",
        wenn: (a) => ja(a, "pflege"),
        titel: tx("Kostenlos beraten lassen im Pflegestützpunkt", "Free advice at a care advice centre", "Бесплатная консультация в Pflegestützpunkt"),
        text: tx(
          "Die Berliner Pflegestützpunkte beraten kostenlos und neutral, auf Wunsch auch zu Hause. Servicenummer 0800 59 500 59, Montag bis Freitag 9 bis 18 Uhr.",
          "Berlin's care advice centres give free, neutral advice, at home if you wish. Hotline 0800 59 500 59, Monday to Friday 9 am to 6 pm.",
          "Берлинские Pflegestützpunkte консультируют бесплатно и нейтрально, по желанию на дому. Телефон 0800 59 500 59, пн–пт с 9 до 18.",
        ),
        link: { url: LINKS.pflegestuetzpunkte, text: tx("Zu den Pflegestützpunkten", "Go to the care advice centres", "На сайт Pflegestützpunkte") },
      },
      {
        id: "tagebuch",
        wenn: (a) => ja(a, "pflege"),
        titel: tx("Pflegetagebuch führen", "Keep a care diary", "Вести дневник ухода"),
        text: tx(
          "Notieren Sie ein bis zwei Wochen lang, wobei und wie lange geholfen wird. Das hilft beim Termin mit dem Gutachter. Legen Sie Arztberichte bereit.",
          "For one to two weeks, note what help is needed and for how long. This helps at the assessment. Have medical reports ready.",
          "Одну-две недели записывайте, в чём и сколько времени нужна помощь. Это поможет на осмотре. Подготовьте медицинские заключения.",
        ),
        unterlagen: [{ art: "medizin", text: tx("Arztberichte und Medikamentenplan", "Medical reports and medication plan", "Медицинские заключения и план приёма лекарств") }],
      },
      {
        id: "schwerbehinderung",
        wenn: (a) => ja(a, "behinderung"),
        titel: tx("Schwerbehindertenausweis beantragen", "Apply for a severe disability card", "Подать на удостоверение тяжёлой инвалидности"),
        text: tx(
          "Ab einem Grad der Behinderung von 50. Er bringt Nachteilsausgleiche, z. B. einen Steuer-Pauschbetrag, Zusatzurlaub oder einen früheren Rentenbeginn. Zuständig ist das Versorgungsamt beim LAGeSo.",
          "From a disability degree of 50. It brings compensations, e.g. a tax allowance, extra holiday or earlier retirement. The pension office at LAGeSo is responsible.",
          "Со степени инвалидности 50. Даёт льготы: налоговый вычет, дополнительный отпуск, более ранняя пенсия. Отвечает Versorgungsamt при LAGeSo.",
        ),
        unterlagen: [{ art: "medizin", text: tx("Arztberichte", "Medical reports", "Медицинские заключения") }],
        link: { url: LINKS.schwerbehinderung, text: tx("Auf service.berlin.de", "On service.berlin.de", "На service.berlin.de") },
      },
      {
        id: "rente",
        wenn: (a) => ja(a, "rente_bald"),
        titel: tx("Rente beantragen", "Apply for your pension", "Подать на пенсию"),
        text: tx(
          "Etwa 3 Monate vor dem gewünschten Beginn bei der Deutschen Rentenversicherung, online oder kostenlos in einer Beratungsstelle. Prüfen Sie vorher Ihren Versicherungsverlauf auf Lücken.",
          "About 3 months before the desired start, with the German Pension Insurance, online or free at an advice centre. Check your insurance record for gaps beforehand.",
          "Примерно за 3 месяца до желаемой даты в Deutsche Rentenversicherung, онлайн или бесплатно в консультации. Заранее проверьте страховой стаж на пробелы.",
        ),
        frist: (a) => {
          const r = lies(a.rentenbeginn);
          return r ? { bis: plusMonate(r, -3) } : null;
        },
        link: { url: LINKS.rente, text: tx("Zur Rentenversicherung", "Go to the pension insurance", "На сайт пенсионного страхования") },
      },
      {
        id: "grundsicherung",
        wenn: (a) => nein(a, "reicht"),
        titel: tx("Grundsicherung oder Wohngeld prüfen", "Check basic income support or housing benefit", "Проверить базовое обеспечение или Wohngeld"),
        text: tx(
          "Reicht die Rente nicht, gibt es Grundsicherung im Alter beim Sozialamt. Bei etwas höherer Rente kann Wohngeld passen. Beides ab dem Antragsmonat.",
          "If the pension is not enough, there is basic income in old age at the social welfare office. With a slightly higher pension, housing benefit may fit. Both from the month you apply.",
          "Если пенсии не хватает — базовое обеспечение в старости в Sozialamt. При чуть большей пенсии может подойти Wohngeld. Оба — с месяца подачи.",
        ),
        frist: abAntragsmonat,
        link: { url: LINKS.grundsicherungAlter, text: tx("Auf service.berlin.de", "On service.berlin.de", "На service.berlin.de") },
      },
      {
        id: "pflegezeit",
        wenn: (a) => a.wer === "angehoerig",
        titel: tx("Freistellung für pflegende Angehörige", "Time off for family carers", "Отпуск для ухаживающих родственников"),
        text: tx(
          "Beschäftigte können sich bis zu 10 Arbeitstage im Jahr kurzfristig freistellen lassen, mit Pflegeunterstützungsgeld der Pflegekasse. Länger geht es mit Pflegezeit oder Familienpflegezeit.",
          "Employees can take up to 10 working days a year at short notice, with care support pay from the care insurance. Longer breaks are possible with care leave or family care leave.",
          "Работники могут взять до 10 рабочих дней в году по срочной необходимости с пособием от кассы по уходу. Дольше — через Pflegezeit или Familienpflegezeit.",
        ),
        link: { url: LINKS.familienportal, text: tx("Familienportal des Bundes", "Federal family portal", "Семейный портал") },
      },
      {
        id: "vorsorge",
        titel: tx("Vorsorgevollmacht und Patientenverfügung", "Lasting power of attorney and living will", "Доверенность и распоряжение пациента"),
        text: tx(
          "Damit Angehörige im Notfall entscheiden dürfen. Vordrucke gibt es kostenlos beim Bundesjustizministerium. Eintragen lassen können Sie sie im Zentralen Vorsorgeregister.",
          "So relatives may decide in an emergency. Free templates are available from the Federal Ministry of Justice. You can register them in the Central Register of Lasting Powers of Attorney.",
          "Чтобы родственники могли принимать решения в экстренном случае. Бесплатные бланки есть у Министерства юстиции. Зарегистрировать можно в Центральном реестре (Vorsorgeregister).",
        ),
        link: { url: LINKS.vorsorge, text: tx("Zentrales Vorsorgeregister", "Central register", "Центральный реестр") },
      },
    ],
  },
];

export function findeLage(id: string): Lebenslage | undefined {
  return lebenslagen.find((l) => l.id === id);
}
