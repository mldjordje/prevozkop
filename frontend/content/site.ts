export type HeroSlide = {
  title: string;
  kicker: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

export type Service = {
  title: string;
  description: string;
  image: string;
};

export type Stat = {
  label: string;
  value: string;
};

export type ProjectCard = {
  title: string;
  image: string;
  location?: string;
  category?: string;
};

export type TeamMember = {
  name: string;
  role?: string;
  image: string;
};

export type Video = {
  title: string;
  youtubeId: string;
  ratio?: "portrait" | "landscape";
};

export const company = {
  name: "Prevoz Kop",
  tagline: "Betonska baza i građevinske usluge",
  phone: "+381 60 588 7471",
  email: "prevozkopbb@gmail.com",
  address: "Krušce, Niš 18000",
  workingHours: "Pon - Sub, 08:00 - 20:00",
};

export const heroSlides: HeroSlide[] = [
  {
    title: "Gradimo vašu budućnost",
    kicker: "Kvalitet · Pouzdanost · Inovacija",
    description:
      "Betonska baza u Nišu sa brzom isporukom mikserima i pumpama za beton.",
    ctaLabel: "Kontaktirajte nas",
    ctaHref: "/kontakt",
    image: "/img/rad1.jpg",
  },
  {
    title: "Rešenja po vašoj meri",
    kicker: "Iskustvo · Preciznost · Efikasnost",
    description:
      "Planiranje, iskopi, tamponiranje i kompletna priprema terena za gradilište.",
    ctaLabel: "Naše usluge",
    ctaHref: "/usluge",
    image: "/img/kamino4.jpg",
  },
  {
    title: "Vaš partner u izgradnji",
    kicker: "Profesionalizam · Brzina · Sigurnost",
    description:
      "Pouzdana dostava betona, rasutih materijala i podrška na licu mesta.",
    ctaLabel: "Saznajte više",
    ctaHref: "/o-nama",
    image: "/img/napolje2.jpg",
  },
];

export const services: Service[] = [
  {
    title: "Proizvodnja i isporuka betona",
    description:
      "Visokokvalitetne betonske mešavine sa sopstvene baze i brza isporuka mikserima.",
    image: "/img/rad1.jpg",
  },
  {
    title: "Iskopi i tamponiranje",
    description:
      "Sve vrste iskopa zemljišta i priprema tampona za siguran temelj i stabilan teren.",
    image: "/img/uterivac.jpg",
  },
  {
    title: "Rušenje i priprema terena",
    description:
      "Bezbedno rušenje objekata, demontaža i čišćenje lokacije sa minimalnim zastoja.",
    image: "/img/vozila2.jpg",
  },
  {
    title: "Prevoz rasutih materijala",
    description:
      "Transport peska, šljunka, zemlje i nasipa u svim količinama, uz novu flotu vozila.",
    image: "/img/kamionislika1.jpg",
  },
  {
    title: "Izgradnja temelja",
    description:
      "Temeljenje za stambene, poslovne i industrijske objekte sa potpunom kontrolom kvaliteta.",
    image: "/img/rad2.jpg",
  },
];

export const stats: Stat[] = [
  { label: "Projekata", value: "250+" },
  { label: "Godina iskustva", value: "5+" },
  { label: "Vozila u floti", value: "150+" },
  { label: "Zaposlenih", value: "80+" },
];

export const aboutHighlights = [
  "Proizvodimo visokokvalitetni beton na sopstvenoj bazi",
  "Brza i tačna dostava mikserima i pumpama",
  "Iskopi, tamponiranje i priprema terena na jednom mestu",
  "Sigurnost i preciznost na svakom gradilištu",
];

export const projectGallery: ProjectCard[] = [
  {
    title: "Nasipanje betona – stambeni temelj",
    image: "/img/nasipanje1.webp",
    location: "Niš",
    category: "Beton",
  },
  {
    title: "Isporuka mikserima",
    image: "/img/mikseri.jpg",
    location: "Južna Srbija",
    category: "Logistika",
  },
  {
    title: "Rušenje objekta i čišćenje terena",
    image: "/img/rad4.webp",
    location: "Niš",
    category: "Rušenje",
  },
  {
    title: "Transport tampona",
    image: "/img/nasipanje2.webp",
    location: "Krušce",
    category: "Transport",
  },
  {
    title: "Priprema nasipa za put",
    image: "/img/nasipanje4.webp",
    location: "Toplica",
    category: "Infrastruktura",
  },
  {
    title: "Terenski rad sa pumpom",
    image: "/img/nasipanje5.webp",
    location: "Niš",
    category: "Beton",
  },
  {
    title: "Betoniranje ploče",
    image: "/img/portfolio/portfolio-05.jpg",
    location: "Srbija",
    category: "Beton",
  },
  {
    title: "Industrijski objekat",
    image: "/img/portfolio/portfolio-08.jpg",
    location: "Srbija",
    category: "Industrija",
  },
  {
    title: "Armatura i temelj",
    image: "/img/portfolio/portfolio-11.jpg",
    location: "Srbija",
    category: "Temeljenje",
  },
];

export const videos: Video[] = [
  { title: "Dovoz i istovar betona", youtubeId: "07E0MTRD5PI", ratio: "portrait" },
  { title: "Priprema terena za izlazak pumpe", youtubeId: "ziqyEvYtA5o", ratio: "portrait" },
  { title: "Tamponiranje i valjanje", youtubeId: "Gpk-jR2Tu2E", ratio: "portrait" },
  { title: "Rad na visini – betoniranje", youtubeId: "3fhJ1LCW-ao", ratio: "portrait" },
  { title: "Izlazak flote na teren", youtubeId: "3jF-53e_K0E", ratio: "portrait" },
  { title: "Video vodič – pumpa za beton", youtubeId: "O3XdoZnSgKI", ratio: "landscape" },
];

export const team: TeamMember[] = [
  { name: "Operativni tim", role: "Logistika i koordinacija", image: "/img/tim1.webp" },
  { name: "Terenska ekipa", role: "Beton i transport", image: "/img/tim2.webp" },
  { name: "Inženjering", role: "Nadzor i priprema", image: "/img/radnici1.webp" },
];
