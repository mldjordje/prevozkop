export type BehatonCity = {
  slug: string;
  name: string;
  intro: string;
  focus: string[];
};

export type BetonCity = BehatonCity;

export const behatonHighlights = [
  "Behaton kocke i ploce za dvorista, staze, parkinge i poslovne povrsine sirom Srbije",
  "Brza AI procena potrebne kolicine i preporuka modela prema nameni i opterecenju",
  "Savet za podlogu, nivelaciju, ivicnjake i odvodnjavanje pre ugradnje",
  "Organizacija isporuke i ugradnje u vecim gradovima i regionalnim centrima po dogovoru",
];

export const behatonBenefits = [
  "Stabilna podloga i duga trajnost u svim vremenskim uslovima",
  "Brza ugradnja i lakse odrzavanje u odnosu na asfalt i klasicne zavrsne slojeve",
  "Uredjene privatne, komercijalne i javne povrsine sa jasnom funkcijom",
  "Fleksibilne kombinacije boja, formata i debljina za razlicite tipove projekata",
];

export const behatonUseCases = [
  {
    title: "Dvorista i prilazi",
    description:
      "Behaton je idealan za stambene prilaze, garaze i unutrasnja dvorista jer trpi opterecenje i lako se obnavlja.",
  },
  {
    title: "Parking povrsine",
    description:
      "Za parkinge i poslovne objekte potrebna je precizna ugradnja i pravilna podloga kako bi povrsina ostala ravna.",
  },
  {
    title: "Staze i trotoari",
    description:
      "Za pesacke staze biramo format, boju i debljinu u skladu sa namenom i vizuelnim identitetom prostora.",
  },
];

export const behatonProcess = [
  {
    title: "Preporuka modela i kolicine",
    description:
      "Definisemo format, boju i debljinu na osnovu namene, opterecenja, kvadrature i lokacije projekta.",
  },
  {
    title: "Plan podloge i pripreme",
    description:
      "Pravilna podloga, tampon, nivelacija i odvodnjavanje obezbedjuju stabilnost i dug vek behatona.",
  },
  {
    title: "Isporuka i ugradnja",
    description:
      "Organizujemo logistiku, rokove i ugradnju u skladu sa gradom, pristupom terenu i dinamikom radova.",
  },
];

export const behatonFaq = [
  {
    q: "Koja je razlika izmedju behaton kocke i behaton ploce?",
    a: "Kocke se koriste za povrsine koje trpe veca opterecenja, dok ploce vise odgovaraju pesackim zonama i dekorativnim povrsinama.",
  },
  {
    q: "Da li behaton moze da se postavlja na terene sa nagibom?",
    a: "Moze, ali je vazno pravilno pripremiti podlogu, ivicnjake i odvodnjavanje kako bi se izbeglo pomeranje elemenata.",
  },
  {
    q: "Da li organizujete isporuku van juga Srbije?",
    a: "Da. Za behaton projekte organizujemo logistiku i preporuku modela za gradove sirom Srbije, uz potvrdu termina i uslova isporuke.",
  },
  {
    q: "Koliko je vremena potrebno za ugradnju?",
    a: "Trajanje zavisi od povrsine, pripreme podloge i pristupa terenu, ali behaton omogucava brzu ugradnju i etapne radove.",
  },
];

const southSerbiaCities: BehatonCity[] = [
  {
    slug: "nis",
    name: "Nis",
    intro:
      "Prodaja i ugradnja behatona u Nisu uz brzu logistiku, pripremu podloge i savet oko izbora modela.",
    focus: ["dvorista", "garazni prilazi", "parking povrsine"],
  },
  {
    slug: "leskovac",
    name: "Leskovac",
    intro:
      "Behaton resenja za stambene i poslovne objekte u Leskovcu, uz lokalnu podrsku i organizaciju isporuke.",
    focus: ["privatna dvorista", "poslovni prilazi", "staze"],
  },
  {
    slug: "prokuplje",
    name: "Prokuplje",
    intro:
      "Ugradnja behatona u Prokuplju sa fokusom na izdrzljivost i tacnu nivelaciju podloge.",
    focus: ["parking povrsine", "prilazi kucama", "trotoari"],
  },
  {
    slug: "aleksinac",
    name: "Aleksinac",
    intro:
      "Behaton za privatne i industrijske objekte u Aleksincu, uz savet oko formata i debljine.",
    focus: ["industrijski prilazi", "magacini", "dvorista"],
  },
  {
    slug: "vranje",
    name: "Vranje",
    intro:
      "Prodaja i ugradnja behatona u Vranju za privatne i poslovne povrsine sa jasnim planom podloge.",
    focus: ["prilazi kucama", "dvorista", "pesacke staze"],
  },
  {
    slug: "pirot",
    name: "Pirot",
    intro:
      "Behaton resenja u Pirotu za parkinge, staze i uredjenje oko objekata uz preciznu nivelaciju.",
    focus: ["parking povrsine", "staze", "ulazi u objekte"],
  },
  {
    slug: "zajecar",
    name: "Zajecar",
    intro:
      "Lokalna ponuda behatona u Zajecaru sa preporukom modela prema opterecenju i nameni.",
    focus: ["dvorista", "kolski prilazi", "javne povrsine"],
  },
  {
    slug: "knjazevac",
    name: "Knjazevac",
    intro:
      "Ugradnja behatona u Knjazevcu sa fokusom na dug vek trajanja i lako odrzavanje povrsina.",
    focus: ["dvorisni prilazi", "parking", "staze oko kuce"],
  },
  {
    slug: "svrljig",
    name: "Svrljig",
    intro:
      "Behaton za Svrljig i okolinu uz dogovor oko isporuke, podloge i organizacije radova.",
    focus: ["prilazi", "privatna dvorista", "pesacke zone"],
  },
  {
    slug: "doljevac",
    name: "Doljevac",
    intro:
      "Prodaja behatona u Doljevcu i terenska podrska za pripremu podloge i zavrsnu ugradnju.",
    focus: ["garazni ulazi", "dvorista", "manje parking povrsine"],
  },
  {
    slug: "merosina",
    name: "Merosina",
    intro:
      "Behaton ponuda u Merosini za privatne projekte i poslovne prilaze sa brzom logistikom.",
    focus: ["prilazi kucama", "poslovni ulazi", "staze"],
  },
  {
    slug: "gadzin-han",
    name: "Gadzin Han",
    intro:
      "Ugradnja behatona u Gadzinom Hanu sa preporukama za debljinu i stabilnu podlogu.",
    focus: ["dvorista", "prilazi", "parking mesta"],
  },
  {
    slug: "sokobanja",
    name: "Sokobanja",
    intro:
      "Behaton za stambene i turisticke objekte u Sokobanji uz estetski i funkcionalni izbor modela.",
    focus: ["staze", "hotelski prilazi", "parking"],
  },
  {
    slug: "blace",
    name: "Blace",
    intro:
      "Lokalna ponuda behatona u Blacu uz procenu terena i dogovor oko rokova ugradnje.",
    focus: ["dvorisne povrsine", "ulazi", "prolazi"],
  },
  {
    slug: "kursumlija",
    name: "Kursumlija",
    intro:
      "Behaton resenja u Kursumliji za privatne i komercijalne povrsine uz pouzdanu isporuku.",
    focus: ["parking", "staze", "prilazi objektima"],
  },
  {
    slug: "bojnik",
    name: "Bojnik",
    intro:
      "Ugradnja behatona u Bojniku sa terenskom podrskom i jasnom specifikacijom modela.",
    focus: ["kolski prilazi", "dvorista", "staze"],
  },
  {
    slug: "lebane",
    name: "Lebane",
    intro:
      "Prodaja i ugradnja behatona u Lebanu za dugotrajne povrsine koje trpe dnevno opterecenje.",
    focus: ["ulazi", "dvorista", "parking prostori"],
  },
  {
    slug: "medvedja",
    name: "Medvedja",
    intro:
      "Behaton za Medvedju i okolinu uz savet oko izbora dezena, boje i debljine elemenata.",
    focus: ["staze", "prilazi", "dvorisni platoi"],
  },
  {
    slug: "bela-palanka",
    name: "Bela Palanka",
    intro:
      "Lokalna behaton ponuda u Beloj Palanci sa fokusom na stabilnu podlogu i kvalitetnu ugradnju.",
    focus: ["dvorista", "kolski prilazi", "parking"],
  },
];

const nationwideCities: BehatonCity[] = [
  {
    slug: "beograd",
    name: "Beograd",
    intro:
      "Behaton za Beograd i prigradska naselja uz preporuku modela za prilaze, parkinge i uredjenje oko objekata.",
    focus: ["dvorista", "parking povrsine", "poslovni prilazi"],
  },
  {
    slug: "novi-sad",
    name: "Novi Sad",
    intro:
      "Prodaja i ugradnja behatona u Novom Sadu za privatne i poslovne projekte sa planom logistike i podloge.",
    focus: ["stambeni prilazi", "staze", "komercijalne povrsine"],
  },
  {
    slug: "subotica",
    name: "Subotica",
    intro:
      "Behaton resenja u Subotici za dvorista, parkinge i uredjenje oko objekata uz pouzdanu isporuku.",
    focus: ["parking", "dvorisni platoi", "ulazi u objekte"],
  },
  {
    slug: "zrenjanin",
    name: "Zrenjanin",
    intro:
      "Lokalna ponuda behatona u Zrenjaninu sa savetom za pravilnu pripremu podloge i izbor debljine.",
    focus: ["privatna dvorista", "prilazi", "pesacke zone"],
  },
  {
    slug: "pancevo",
    name: "Pancevo",
    intro:
      "Behaton za Pancevo i okolinu sa fokusom na izdrzljive povrsine za domacinstva i firme.",
    focus: ["prilazi kucama", "manji parking", "staze"],
  },
  {
    slug: "smederevo",
    name: "Smederevo",
    intro:
      "Prodaja i ugradnja behatona u Smederevu uz preporuku modela za vece opterecenje i lakse odrzavanje.",
    focus: ["kolski prilazi", "parking", "platoi"],
  },
  {
    slug: "pozarevac",
    name: "Pozarevac",
    intro:
      "Behaton resenja u Pozarevcu za privatne i komercijalne povrsine uz jasan plan isporuke i ugradnje.",
    focus: ["dvorista", "poslovni ulazi", "parking mesta"],
  },
  {
    slug: "vrsac",
    name: "Vrsac",
    intro:
      "Ugradnja behatona u Vrscu sa fokusom na uredjenje dvorista, staza i pristupnih povrsina.",
    focus: ["staze", "prilazi", "dvorisni platoi"],
  },
  {
    slug: "kikinda",
    name: "Kikinda",
    intro:
      "Behaton za Kikindu i sever Banata uz savet oko formata, boje i stabilne podloge.",
    focus: ["kolski prilazi", "pesacke staze", "parking"],
  },
  {
    slug: "sremska-mitrovica",
    name: "Sremska Mitrovica",
    intro:
      "Prodaja behatona u Sremskoj Mitrovici za dvorista, prilaze i poslovne povrsine uz dogovor oko termina.",
    focus: ["dvorista", "prilazi objektima", "poslovni platoi"],
  },
  {
    slug: "indjija",
    name: "Indjija",
    intro:
      "Behaton resenja u Indjiji sa logistickom podrskom za privatne i investitorske projekte.",
    focus: ["stambeni prilazi", "parking", "staze oko objekta"],
  },
  {
    slug: "ruma",
    name: "Ruma",
    intro:
      "Ugradnja behatona u Rumi sa preporukama za podlogu, nivelaciju i odrzavanje povrsina.",
    focus: ["prilazi", "dvorista", "pesacke povrsine"],
  },
  {
    slug: "sabac",
    name: "Sabac",
    intro:
      "Behaton za Sabac i Macvanski okrug uz procenu kolicine i savet za privatne i komercijalne povrsine.",
    focus: ["parking povrsine", "dvorista", "trotoari"],
  },
  {
    slug: "loznica",
    name: "Loznica",
    intro:
      "Prodaja behatona u Loznici sa organizacijom isporuke i predlogom modela prema nameni terena.",
    focus: ["ulazi", "staze", "dvorisni platoi"],
  },
  {
    slug: "valjevo",
    name: "Valjevo",
    intro:
      "Behaton resenja u Valjevu za uredjenje privatnih i poslovnih povrsina uz brzu pripremu ponude.",
    focus: ["dvorista", "prilazi", "parking prostori"],
  },
  {
    slug: "kragujevac",
    name: "Kragujevac",
    intro:
      "Behaton za Kragujevac i sumadijski region uz savet za opterecenje, debljinu i plan ugradnje.",
    focus: ["stambeni blokovi", "prilazi", "parking"],
  },
  {
    slug: "jagodina",
    name: "Jagodina",
    intro:
      "Ugradnja behatona u Jagodini sa fokusom na izdrzljivost, ravnu podlogu i uredan zavrsni izgled.",
    focus: ["dvorista", "staze", "ulazi u objekte"],
  },
  {
    slug: "cuprija",
    name: "Cuprija",
    intro:
      "Behaton za Cupriju i okolinu uz preporuku modela za privatne kuce, prilaze i parkinge.",
    focus: ["kolski prilazi", "dvorista", "parking mesta"],
  },
  {
    slug: "arandjelovac",
    name: "Arandjelovac",
    intro:
      "Prodaja i ugradnja behatona u Arandjelovcu za stambene i turisticke objekte uz plan logistike.",
    focus: ["staze", "hotelski prilazi", "dvorisni platoi"],
  },
  {
    slug: "krusevac",
    name: "Krusevac",
    intro:
      "Behaton resenja u Krusevcu za privatne i poslovne objekte sa savetom za pripremu terena.",
    focus: ["parking", "prilazi", "pesacke povrsine"],
  },
  {
    slug: "kraljevo",
    name: "Kraljevo",
    intro:
      "Behaton za Kraljevo i okolinu uz dogovor oko isporuke, podloge i zavrsne ugradnje.",
    focus: ["dvorista", "pristupni putevi", "parking povrsine"],
  },
  {
    slug: "cacak",
    name: "Cacak",
    intro:
      "Ugradnja behatona u Cacku sa fokusom na trajne povrsine koje se lako odrzavaju i obnavljaju.",
    focus: ["prilazi kucama", "staze", "platoi"],
  },
  {
    slug: "uzice",
    name: "Uzice",
    intro:
      "Behaton ponuda u Uzicu za dvorista, parkinge i terene sa zahtevnijim pristupom i nivelacijom.",
    focus: ["dvorista", "parking", "pesacke zone"],
  },
  {
    slug: "gornji-milanovac",
    name: "Gornji Milanovac",
    intro:
      "Prodaja behatona u Gornjem Milanovcu uz savet za podlogu i izbor formata prema vrsti povrsine.",
    focus: ["staze", "kolski prilazi", "ulazi"],
  },
  {
    slug: "novi-pazar",
    name: "Novi Pazar",
    intro:
      "Behaton za Novi Pazar i Raski region uz logisticku organizaciju i preporuku modela za veca opterecenja.",
    focus: ["komercijalne povrsine", "dvorista", "parking"],
  },
];

export const behatonCities: BehatonCity[] = [...southSerbiaCities, ...nationwideCities];

export const betonCities: BetonCity[] = southSerbiaCities.map((city) => ({
  slug: city.slug,
  name: city.name,
  intro: `Isporuka gotovog betona i betonske pumpe za ${city.name}. Organizujemo termin, logistiku i podrsku na gradilistu.`,
  focus: [
    "isporuka betona mikserima",
    "beton pumpa i visinske pumpe",
    "zemljani radovi i priprema terena",
  ],
}));
