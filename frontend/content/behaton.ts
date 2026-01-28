export type BehatonCity = {
  slug: string;
  name: string;
  intro: string;
  focus: string[];
};

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
];
