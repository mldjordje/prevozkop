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
  tagline: "Betonska baza i gradevinske usluge",
  phone: "+381 60 588 7471",
  email: "prevozkopbb@gmail.com",
  address: "Krusce, Nis 18000",
  workingHours: "Pon - Sub, 08:00 - 20:00",
};

export const heroSlides: HeroSlide[] = [
  {
    title: "Gradimo vasu buducnost",
    kicker: "Kvalitet - Pouzdanost - Inovacija",
    description: "Betonska baza u Nisu sa brzom isporukom mikserima i pumpama za beton.",
    ctaLabel: "Poruci beton",
    ctaHref: "/porucivanje-betona#forma",
    image: "/img/rad1.jpg",
  },
  {
    title: "Resenja po vasoj meri",
    kicker: "Iskustvo - Preciznost - Efikasnost",
    description: "Planiranje, iskopi, tamponiranje i kompletna priprema terena za gradiliste.",
    ctaLabel: "Poruci beton",
    ctaHref: "/porucivanje-betona#forma",
    image: "/img/kamino4.jpg",
  },
  {
    title: "Vas partner u izgradnji",
    kicker: "Profesionalizam - Brzina - Sigurnost",
    description: "Pouzdana dostava betona, rasutih materijala i podrska na licu mesta.",
    ctaLabel: "Poruci beton",
    ctaHref: "/porucivanje-betona#forma",
    image: "/img/napolje2.jpg",
  },
];

export const services: Service[] = [
  {
    title: "Proizvodnja i isporuka betona",
    description: "Visokokvalitetne betonske mesavine sa sopstvene baze i brza isporuka mikserima.",
    image: "/img/rad1.jpg",
  },
  {
    title: "Iskopi i tamponiranje",
    description: "Sve vrste iskopa zemljista i priprema tampona za siguran temelj i stabilan teren.",
    image: "/img/uterivac.jpg",
  },
  {
    title: "Rusenje i priprema terena",
    description: "Bezbedno rusenje objekata, demontaza i ciscenje lokacije sa minimalnim zastoja.",
    image: "/img/vozila2.jpg",
  },
  {
    title: "Prevoz rasutih materijala",
    description: "Transport peska, sljunka, zemlje i nasipa u svim kolicinama, uz novu flotu vozila.",
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
  "Brza i tacna dostava mikserima i pumpama",
  "Iskopi, tamponiranje i priprema terena na jednom mestu",
  "Sigurnost i preciznost na svakom gradilistu",
];

export const projectGallery: ProjectCard[] = [];

export const videos: Video[] = [
  { title: "Dovoz i istovar betona", youtubeId: "07E0MTRD5PI", ratio: "portrait" },
  { title: "Priprema terena za izlazak pumpe", youtubeId: "ziqyEvYtA5o", ratio: "portrait" },
  { title: "Tamponiranje i valjanje", youtubeId: "Gpk-jR2Tu2E", ratio: "portrait" },
  { title: "Rad na visini - betoniranje", youtubeId: "3fhJ1LCW-ao", ratio: "portrait" },
  { title: "Izlazak flote na teren", youtubeId: "3jF-53e_K0E", ratio: "portrait" },
  { title: "Video vodic - pumpa za beton", youtubeId: "O3XdoZnSgKI", ratio: "landscape" },
];

export const team: TeamMember[] = [
  { name: "Operativni tim", role: "Logistika i koordinacija", image: "/img/tim1.webp" },
  { name: "Terenska ekipa", role: "Beton i transport", image: "/img/tim2.webp" },
  { name: "Inzenjering", role: "Nadzor i priprema", image: "/img/radnici1.webp" },
];
