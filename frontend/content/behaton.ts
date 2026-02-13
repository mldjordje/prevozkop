export type BehatonCity = {
  slug: string;
  name: string;
  intro: string;
  focus: string[];
};

export type BetonCity = BehatonCity;

export const behatonHighlights = [
  "Kvalitetne behaton kocke i ploce za staze, dvorista i parkinge",
  "Jasne CTA poruke za poziv i brz upit",
  "Stranice prilagodjene Google Ads kampanjama",
  "Lokalni SEO sadrzaj za Nis i okruzne gradove",
];

export const behatonBenefits = [
  "Stabilna podloga i duga trajnost u svim vremenskim uslovima",
  "Brza ugradnja i lakse odrzavanje u odnosu na asfalt",
  "Vizuelno uredjene povrsine za privatne i poslovne objekte",
  "Fleksibilne kombinacije boja i formata",
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
    title: "Saveti za izbor modela",
    description:
      "Zajedno definisemo format, boju i debljinu na osnovu namene i opterecenja.",
  },
  {
    title: "Priprema podloge",
    description:
      "Pravilna podloga (tampon, nivelacija, vibro) obezbedjuje stabilnost i dug vek behatona.",
  },
  {
    title: "Isporuka i ugradnja",
    description:
      "Organizujemo isporuku i dogovaramo logistiku u skladu sa terminima i uslovima na terenu.",
  },
];

export const behatonFaq = [
  {
    q: "Koja je razlika izmedju behaton kocke i behaton ploce?",
    a: "Kocke se koriste za povrsine koje trpe veca opterecenja, dok ploce vise odgovaraju pesackim zonama i dekorativnim povrsinama.",
  },
  {
    q: "Da li behaton moze da se postavlja na terene sa nagibom?",
    a: "Moze, ali je vazno pravilno pripremiti podlogu i obezbediti odvodnjavanje kako bi se izbeglo pomeranje elemenata.",
  },
  {
    q: "Koliko je vremena potrebno za ugradnju?",
    a: "Trajanje zavisi od povrsine i pripreme podloge, ali behaton omogucava brzu ugradnju u odnosu na asfalt.",
  },
];

export const behatonCities: BehatonCity[] = [
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

export const betonCities: BetonCity[] = behatonCities.map((city) => ({
  slug: city.slug,
  name: city.name,
  intro: `Isporuka gotovog betona i betonske pumpe za ${city.name}. Organizujemo termin, logistiku i podrsku na gradilistu.`,
  focus: [
    "isporuka betona mikserima",
    "beton pumpa i visinske pumpe",
    "zemljani radovi i priprema terena",
  ],
}));
