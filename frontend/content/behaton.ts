export type BehatonCity = {
  slug: string;
  name: string;
  intro: string;
  focus: string[];
};

export type BetonCity = BehatonCity;

export const behatonHighlights = [
  "Behaton kocke i ploče za dvorišta, staze, parkinge i poslovne površine širom Srbije",
  "Brza AI procena potrebne količine i preporuka modela prema nameni i opterećenju",
  "Savet za podlogu, nivelaciju, ivicnjake i odvodnjavanje pre ugradnje",
  "Organizacija isporuke i ugradnje u većim gradovima i regionalnim centrima po dogovoru",
];

export const behatonBenefits = [
  "Stabilna podloga i duga trajnost u svim vremenskim uslovima",
  "Brza ugradnja i lakše održavanje u odnosu na asfalt i klasične završne slojeve",
  "Uređene privatne, komercijalne i javne površine sa jasnom funkcijom",
  "Fleksibilne kombinacije boja, formata i debljina za različite tipove projekata",
];

export const behatonUseCases = [
  {
    title: "Dvorišta i prilazi",
    description:
      "Behaton je idealan za stambene prilaze, garaže i unutrašnja dvorišta jer trpi opterećenje i lako se obnavlja.",
  },
  {
    title: "Parking površine",
    description:
      "Za parkinge i poslovne objekte potrebna je precizna ugradnja i pravilna podloga kako bi površina ostala ravna.",
  },
  {
    title: "Staze i trotoari",
    description:
      "Za pešačke staze biramo format, boju i debljinu u skladu sa namenom i vizuelnim identitetom prostora.",
  },
];

export const behatonProcess = [
  {
    title: "Preporuka modela i količine",
    description:
      "Definišemo format, boju i debljinu na osnovu namene, opterećenja, kvadrature i lokacije projekta.",
  },
  {
    title: "Plan podloge i pripreme",
    description:
      "Pravilna podloga, tampon, nivelacija i odvodnjavanje obezbeđuju stabilnost i dug vek behatona.",
  },
  {
    title: "Isporuka i ugradnja",
    description:
      "Organizujemo logistiku, rokove i ugradnju u skladu sa gradom, pristupom terenu i dinamikom radova.",
  },
];

export const behatonFaq = [
  {
    q: "Koja je razlika između behaton kocke i behaton ploče?",
    a: "Kocke se koriste za površine koje trpe veća opterećenja, dok ploče više odgovaraju pešačkim zonama i dekorativnim površinama.",
  },
  {
    q: "Da li behaton može da se postavlja na terene sa nagibom?",
    a: "Može, ali je važno pravilno pripremiti podlogu, ivicnjake i odvodnjavanje kako bi se izbeglo pomeranje elemenata.",
  },
  {
    q: "Da li organizujete isporuku van juga Srbije?",
    a: "Da. Za behaton projekte organizujemo logistiku i preporuku modela za gradove širom Srbije, uz potvrdu termina i uslova isporuke.",
  },
  {
    q: "Koliko je vremena potrebno za ugradnju?",
    a: "Trajanje zavisi od površine, pripreme podloge i pristupa terenu, ali behaton omogućava brzu ugradnju i etapne radove.",
  },
];

const southSerbiaCities: BehatonCity[] = [
  {
    slug: "nis",
    name: "Niš",
    intro:
      "Prodaja i ugradnja behatona u Nišu uz brzu logistiku, pripremu podloge i savet oko izbora modela.",
    focus: ["dvorišta", "garažni prilazi", "parking površine"],
  },
  {
    slug: "leskovac",
    name: "Leskovac",
    intro:
      "Behaton rešenja za stambene i poslovne objekte u Leskovcu, uz lokalnu podršku i organizaciju isporuke.",
    focus: ["privatna dvorišta", "poslovni prilazi", "staze"],
  },
  {
    slug: "prokuplje",
    name: "Prokuplje",
    intro:
      "Ugradnja behatona u Prokuplju sa fokusom na izdržljivost i tačnu nivelaciju podloge.",
    focus: ["parking površine", "prilazi kucama", "trotoari"],
  },
  {
    slug: "aleksinac",
    name: "Aleksinac",
    intro:
      "Behaton za privatne i industrijske objekte u Aleksincu, uz savet oko formata i debljine.",
    focus: ["industrijski prilazi", "magacini", "dvorišta"],
  },
  {
    slug: "vranje",
    name: "Vranje",
    intro:
      "Prodaja i ugradnja behatona u Vranju za privatne i poslovne površine sa jasnim planom podloge.",
    focus: ["prilazi kucama", "dvorišta", "pešačke staze"],
  },
  {
    slug: "pirot",
    name: "Pirot",
    intro:
      "Behaton rešenja u Pirotu za parkinge, staze i uređenje oko objekata uz preciznu nivelaciju.",
    focus: ["parking površine", "staze", "ulazi u objekte"],
  },
  {
    slug: "zajecar",
    name: "Zaječar",
    intro:
      "Lokalna ponuda behatona u Zaječaru sa preporukom modela prema opterećenju i nameni.",
    focus: ["dvorišta", "kolski prilazi", "javne površine"],
  },
  {
    slug: "knjazevac",
    name: "Knjaževac",
    intro:
      "Ugradnja behatona u Knjaževcu sa fokusom na dug vek trajanja i lako održavanje površina.",
    focus: ["dvorišni prilazi", "parking", "staze oko kuće"],
  },
  {
    slug: "svrljig",
    name: "Svrljig",
    intro:
      "Behaton za Svrljig i okolinu uz dogovor oko isporuke, podloge i organizacije radova.",
    focus: ["prilazi", "privatna dvorišta", "pešačke zone"],
  },
  {
    slug: "doljevac",
    name: "Doljevac",
    intro:
      "Prodaja behatona u Doljevcu i terenska podrška za pripremu podloge i završnu ugradnju.",
    focus: ["garažni ulazi", "dvorišta", "manje parking površine"],
  },
  {
    slug: "merosina",
    name: "Merošina",
    intro:
      "Behaton ponuda u Merošini za privatne projekte i poslovne prilaze sa brzom logistikom.",
    focus: ["prilazi kucama", "poslovni ulazi", "staze"],
  },
  {
    slug: "gadzin-han",
    name: "Gadžin Han",
    intro:
      "Ugradnja behatona u Gadžinom Hanu sa preporukama za debljinu i stabilnu podlogu.",
    focus: ["dvorišta", "prilazi", "parking mesta"],
  },
  {
    slug: "sokobanja",
    name: "Sokobanja",
    intro:
      "Behaton za stambene i turističke objekte u Sokobanji uz estetski i funkcionalni izbor modela.",
    focus: ["staze", "hotelski prilazi", "parking"],
  },
  {
    slug: "blace",
    name: "Blace",
    intro:
      "Lokalna ponuda behatona u Blacu uz procenu terena i dogovor oko rokova ugradnje.",
    focus: ["dvorišne površine", "ulazi", "prolazi"],
  },
  {
    slug: "kursumlija",
    name: "Kuršumlija",
    intro:
      "Behaton rešenja u Kuršumliji za privatne i komercijalne površine uz pouzdanu isporuku.",
    focus: ["parking", "staze", "prilazi objektima"],
  },
  {
    slug: "bojnik",
    name: "Bojnik",
    intro:
      "Ugradnja behatona u Bojniku sa terenskom podrskom i jasnom specifikacijom modela.",
    focus: ["kolski prilazi", "dvorišta", "staze"],
  },
  {
    slug: "lebane",
    name: "Lebane",
    intro:
      "Prodaja i ugradnja behatona u Lebanu za dugotrajne površine koje trpe dnevno opterećenje.",
    focus: ["ulazi", "dvorišta", "parking prostori"],
  },
  {
    slug: "medvedja",
    name: "Medveđa",
    intro:
      "Behaton za Medveđu i okolinu uz savet oko izbora dezena, boje i debljine elemenata.",
    focus: ["staze", "prilazi", "dvorišni platoi"],
  },
  {
    slug: "bela-palanka",
    name: "Bela Palanka",
    intro:
      "Lokalna behaton ponuda u Beloj Palanci sa fokusom na stabilnu podlogu i kvalitetnu ugradnju.",
    focus: ["dvorišta", "kolski prilazi", "parking"],
  },
];

const nationwideCities: BehatonCity[] = [
  {
    slug: "beograd",
    name: "Beograd",
    intro:
      "Behaton za Beograd i prigradska naselja uz preporuku modela za prilaze, parkinge i uređenje oko objekata.",
    focus: ["dvorišta", "parking površine", "poslovni prilazi"],
  },
  {
    slug: "novi-sad",
    name: "Novi Sad",
    intro:
      "Prodaja i ugradnja behatona u Novom Sadu za privatne i poslovne projekte sa planom logistike i podloge.",
    focus: ["stambeni prilazi", "staze", "komercijalne površine"],
  },
  {
    slug: "subotica",
    name: "Subotica",
    intro:
      "Behaton rešenja u Subotici za dvorišta, parkinge i uređenje oko objekata uz pouzdanu isporuku.",
    focus: ["parking", "dvorišni platoi", "ulazi u objekte"],
  },
  {
    slug: "zrenjanin",
    name: "Zrenjanin",
    intro:
      "Lokalna ponuda behatona u Zrenjaninu sa savetom za pravilnu pripremu podloge i izbor debljine.",
    focus: ["privatna dvorišta", "prilazi", "pešačke zone"],
  },
  {
    slug: "pancevo",
    name: "Pančevo",
    intro:
      "Behaton za Pančevo i okolinu sa fokusom na izdržljive površine za domaćinstva i firme.",
    focus: ["prilazi kucama", "manji parking", "staze"],
  },
  {
    slug: "smederevo",
    name: "Smederevo",
    intro:
      "Prodaja i ugradnja behatona u Smederevu uz preporuku modela za veće opterećenje i lakše održavanje.",
    focus: ["kolski prilazi", "parking", "platoi"],
  },
  {
    slug: "pozarevac",
    name: "Požarevac",
    intro:
      "Behaton rešenja u Požarevcu za privatne i komercijalne površine uz jasan plan isporuke i ugradnje.",
    focus: ["dvorišta", "poslovni ulazi", "parking mesta"],
  },
  {
    slug: "vrsac",
    name: "Vršac",
    intro:
      "Ugradnja behatona u Vršcu sa fokusom na uređenje dvorišta, staza i pristupnih površina.",
    focus: ["staze", "prilazi", "dvorišni platoi"],
  },
  {
    slug: "kikinda",
    name: "Kikinda",
    intro:
      "Behaton za Kikindu i sever Banata uz savet oko formata, boje i stabilne podloge.",
    focus: ["kolski prilazi", "pešačke staze", "parking"],
  },
  {
    slug: "sremska-mitrovica",
    name: "Sremska Mitrovica",
    intro:
      "Prodaja behatona u Sremskoj Mitrovici za dvorišta, prilaze i poslovne površine uz dogovor oko termina.",
    focus: ["dvorišta", "prilazi objektima", "poslovni platoi"],
  },
  {
    slug: "indjija",
    name: "Inđija",
    intro:
      "Behaton rešenja u Inđiji sa logističkom podrskom za privatne i investitorske projekte.",
    focus: ["stambeni prilazi", "parking", "staze oko objekta"],
  },
  {
    slug: "ruma",
    name: "Ruma",
    intro:
      "Ugradnja behatona u Rumi sa preporukama za podlogu, nivelaciju i održavanje površina.",
    focus: ["prilazi", "dvorišta", "pešačke površine"],
  },
  {
    slug: "sabac",
    name: "Šabac",
    intro:
      "Behaton za Šabac i Mačvanski okrug uz procenu količine i savet za privatne i komercijalne površine.",
    focus: ["parking površine", "dvorišta", "trotoari"],
  },
  {
    slug: "loznica",
    name: "Loznica",
    intro:
      "Prodaja behatona u Loznici sa organizacijom isporuke i predlogom modela prema nameni terena.",
    focus: ["ulazi", "staze", "dvorišni platoi"],
  },
  {
    slug: "valjevo",
    name: "Valjevo",
    intro:
      "Behaton rešenja u Valjevu za uređenje privatnih i poslovnih površina uz brzu pripremu ponude.",
    focus: ["dvorišta", "prilazi", "parking prostori"],
  },
  {
    slug: "kragujevac",
    name: "Kragujevac",
    intro:
      "Behaton za Kragujevac i šumadijski region uz savet za opterećenje, debljinu i plan ugradnje.",
    focus: ["stambeni blokovi", "prilazi", "parking"],
  },
  {
    slug: "jagodina",
    name: "Jagodina",
    intro:
      "Ugradnja behatona u Jagodini sa fokusom na izdržljivost, ravnu podlogu i uredan završni izgled.",
    focus: ["dvorišta", "staze", "ulazi u objekte"],
  },
  {
    slug: "cuprija",
    name: "Ćuprija",
    intro:
      "Behaton za Ćupriju i okolinu uz preporuku modela za privatne kuće, prilaze i parkinge.",
    focus: ["kolski prilazi", "dvorišta", "parking mesta"],
  },
  {
    slug: "arandjelovac",
    name: "Aranđelovac",
    intro:
      "Prodaja i ugradnja behatona u Aranđelovcu za stambene i turističke objekte uz plan logistike.",
    focus: ["staze", "hotelski prilazi", "dvorišni platoi"],
  },
  {
    slug: "krusevac",
    name: "Kruševac",
    intro:
      "Behaton rešenja u Kruševcu za privatne i poslovne objekte sa savetom za pripremu terena.",
    focus: ["parking", "prilazi", "pešačke površine"],
  },
  {
    slug: "kraljevo",
    name: "Kraljevo",
    intro:
      "Behaton za Kraljevo i okolinu uz dogovor oko isporuke, podloge i završne ugradnje.",
    focus: ["dvorišta", "pristupni putevi", "parking površine"],
  },
  {
    slug: "cacak",
    name: "Čačak",
    intro:
      "Ugradnja behatona u Čačku sa fokusom na trajne površine koje se lako održavaju i obnavljaju.",
    focus: ["prilazi kucama", "staze", "platoi"],
  },
  {
    slug: "uzice",
    name: "Užice",
    intro:
      "Behaton ponuda u Užicu za dvorišta, parkinge i terene sa zahtevnijim pristupom i nivelacijom.",
    focus: ["dvorišta", "parking", "pešačke zone"],
  },
  {
    slug: "gornji-milanovac",
    name: "Gornji Milanovac",
    intro:
      "Prodaja behatona u Gornjem Milanovcu uz savet za podlogu i izbor formata prema vrsti površine.",
    focus: ["staze", "kolski prilazi", "ulazi"],
  },
  {
    slug: "novi-pazar",
    name: "Novi Pazar",
    intro:
      "Behaton za Novi Pazar i Raški region uz logističku organizaciju i preporuku modela za veća opterećenja.",
    focus: ["komercijalne površine", "dvorišta", "parking"],
  },
];

export const behatonCities: BehatonCity[] = [...southSerbiaCities, ...nationwideCities];

export const betonCities: BetonCity[] = southSerbiaCities.map((city) => ({
  slug: city.slug,
  name: city.name,
  intro: `Isporuka gotovog betona i betonske pumpe za ${city.name}. Organizujemo termin, logistiku i podršku na gradilištu.`,
  focus: [
    "isporuka betona mikserima",
    "beton pumpa i visinske pumpe",
    "zemljani radovi i priprema terena",
  ],
}));
