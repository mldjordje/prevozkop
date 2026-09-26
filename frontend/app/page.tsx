import type { Metadata } from "next";
import Link from "next/link";
import HeroVideo from "@/components/hero-video";
import FloatingCta from "@/components/floating-cta";
import JsonLd from "@/components/json-ld";
import StatsSection from "@/components/stats-section";
import SplitText from "@/components/motion/split-text";
import { ParallaxImage, ScrollFillText, VelocityMarquee } from "@/components/motion/scroll-effects";
import ServicesScroller from "@/components/home/services-scroller";
import CoverageMap from "@/components/home/coverage-map";
import { isRealBehatonProduct, toCatalogItem } from "@/components/behaton/catalog-utils";
import { aboutHighlights, company, services, stats } from "@/content/site";
import { getProducts, getProjects } from "@/lib/api";
import type { Product, Project } from "@/lib/api";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Prevozkop Niš - beton za Niš i okolinu, behaton za Srbiju",
  description:
    "Prevozkop iz Niša obezbeđuje isporuku gotovog betona za Niš i okolinu, behaton za Srbiju, beton pumpe i zemljane radove za stambenu i poslovnu gradnju.",
  path: "/",
  image: "/img/napolje1.webp",
  keywords: [
    "beton nis", "isporuka betona nis", "isporuka betona", "behaton nis", "behaton",
    "gotov beton", "beton pumpa", "zemljani radovi", "prevozkop",
  ],
  languages: srEnLanguages("/", "/en"),
});

const homepageFaq = [
  {
    q: "Ko isporučuje gotov beton u Nišu?",
    a: "Prevozkop organizuje proizvodnju i isporuku gotovog betona na gradilište u Nišu i okolini.",
  },
  {
    q: "Da li imate visinske pumpe za beton?",
    a: "Da, obezbeđujemo pumpe za beton uključujući visinske pumpe za zahtevna gradilišta.",
  },
  {
    q: "Kako da poručim beton i dogovorim termin?",
    a: "Najbrže je preko forme za poručivanje betona ili direktnim pozivom radi potvrde termina.",
  },
];

const priorityLinks = [
  {
    href: "/porucivanje-betona",
    title: "Isporuka betona Niš",
    description: "Poručivanje betona, miksera i beton pumpi u Nišu i okolini.",
    image: "/img/mikseri.webp",
  },
  {
    href: "/behaton",
    title: "Behaton Srbija",
    description: "Modeli, cene, isporuka i ugradnja behatona širom Srbije.",
    image: "/img/behaton/optimized/SLI_4930.webp",
  },
  {
    href: "/beton/grad/nis",
    title: "Beton Niš",
    description: "Lokalna stranica za beton, pumpu i termin isporuke u Nišu.",
    image: "/img/napolje1.webp",
  },
  {
    href: "/behaton/grad/nis",
    title: "Behaton Niš",
    description: "Behaton u Nišu sa upitom i preporukama modela.",
    image: "/img/behaton/optimized/SLI_4651.webp",
  },
  {
    href: "/usluge",
    title: "Usluge",
    description: "Pregled betona, pumpi, zemljanih radova i logistike gradilišta.",
    image: "/img/uterivac.webp",
  },
  {
    href: "/projekti",
    title: "Projekti",
    description: "Reference i galerija radova za dodatni signal poverenja.",
    image: "/img/rad2.webp",
  },
];

const orderSteps = [
  { title: "Upit ili poziv", text: "Pošaljite formu ili pozovite — recite lokaciju, količinu i vrstu radova." },
  { title: "Klasa i termin", text: "Dogovaramo MB klasu betona, potrebnu pumpu i tačan termin isporuke." },
  { title: "Mikser na lokaciji", text: "Beton sa naše baze stiže mikserom na gradilište, po potrebi uz pumpu." },
  { title: "Ugradnja", text: "Betoniranje teče bez zastoja, a mi koordinišemo sledeće ture." },
];

const projectLayouts = [
  "md:col-span-4 aspect-[4/5] md:aspect-[16/11]",
  "md:col-span-2 aspect-[4/5] md:aspect-auto",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-2 aspect-[4/5]",
  "md:col-span-6 aspect-[4/5] md:aspect-[21/9]",
];

export default async function HomePage() {
  let featuredProjects: Project[] = [];
  let behatonProducts: Product[] = [];

  const [projectsRes, productsRes] = await Promise.allSettled([
    getProjects(6, 0),
    getProducts({ category: "behaton", limit: 120, offset: 0 }),
  ]);
  if (projectsRes.status === "fulfilled") featuredProjects = projectsRes.value.data || [];
  else console.error("Neuspelo učitavanje projekata:", projectsRes.reason);
  if (productsRes.status === "fulfilled") {
    behatonProducts = (productsRes.value.data || [])
      .filter((p) => p.category?.trim().toLowerCase() === "behaton")
      .filter(isRealBehatonProduct);
  } else {
    console.error("Neuspelo učitavanje behaton proizvoda:", productsRes.reason);
  }
  const behatonPreview = behatonProducts.slice(0, 8).map(toCatalogItem);

  return (
    <div className="bg-cement pb-24 md:pb-0">
      <h1 className="sr-only">
        Prevozkop - isporuka betona, visinske pumpe za beton i zemljani radovi u Nišu
      </h1>

      <HeroVideo />

      {/* ── Marquee ─────────────────────────────────────── */}
      <div className="relative z-10 -mt-px bg-ink py-6 text-white sm:py-8">
        <VelocityMarquee baseVelocity={-1.4}>
          {["Gotov beton", "Visinske pumpe", "Behaton", "Iskopi", "Tamponiranje", "Prevoz materijala"].map((w, i) => (
            <span
              key={w}
              className={`marquee-item font-display text-6xl font-black uppercase [font-stretch:62%] sm:text-8xl lg:text-[9rem] ${
                i % 2 ? "text-outline text-white/80" : "text-white"
              }`}
            >
              {w}
              <span className="mx-5 inline-block h-4 w-4 rounded-full bg-primary sm:h-6 sm:w-6" />
            </span>
          ))}
        </VelocityMarquee>
      </div>

      {/* ── Manifesto / O nama ───────────────────────────── */}
      <section className="content-section py-24 sm:py-36">
        <div className="mb-10 flex items-center justify-between">
          <p className="section-label">O nama</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Niš · Krušce bb</p>
        </div>
        <ScrollFillText
          as="h2"
          className="font-display text-[2.7rem] font-extrabold uppercase leading-[0.93] text-ink [font-stretch:66%] sm:text-7xl lg:text-[6.6rem]"
          text="Prevozkop: beton, pumpe i zemljani radovi. Sa naše betonske baze u Nišu do vašeg gradilišta — bez čekanja i bez izgovora."
        />

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          <ParallaxImage
            src="/img/napolje1.webp"
            alt="Betonska baza i dostava"
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="aspect-[4/5] rounded-[28px] sm:aspect-[16/11] lg:col-span-7"
          >
            <div className="absolute bottom-5 left-5 rounded-2xl bg-ink/75 px-5 py-4 text-white backdrop-blur-md">
              <p className="font-display text-5xl font-black leading-none text-primary [font-stretch:62%]">{stats[0]?.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{stats[0]?.label}</p>
            </div>
          </ParallaxImage>

          <div className="flex flex-col justify-between gap-10 lg:col-span-5">
            <div className="space-y-6">
              <p className="font-body text-lg leading-relaxed text-ink/80">
                Prevozkop je građevinska podrška iz Niša specijalizovana za isporuku gotovog betona,
                visoke pumpe i pripremu gradilišta. Radimo u Nišu i okolnim gradovima uz jasnu
                logistiku i pouzdane rokove.
              </p>
              <ul className="border-t border-ink/15">
                {aboutHighlights.map((item, i) => (
                  <li key={item} className="flex gap-5 border-b border-ink/15 py-4">
                    <span className="pt-1 font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-body text-[16px] font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/o-nama" className="btn-primary">
                Više o nama
              </Link>
              <Link href="/porucivanje-betona#forma" className="btn-outline">
                Pošalji upit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Usluge (horizontal scroll on desktop) ────────── */}
      <section className="bg-ink pt-24 text-white sm:pt-32">
        <div className="content-section flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-label mb-5">Naše usluge</p>
            <SplitText
              className="display-xl text-[14vw] sm:text-[10vw] lg:text-[7.5vw]"
              lines={[{ text: "Građevinske usluge" }, { text: "za teren", className: "text-primary" }]}
            />
          </div>
          <p className="max-w-sm font-body text-base text-white/60">
            Od proizvodnje betona do pripreme terena — jedna ekipa, jedna odgovornost, jedan telefon.
          </p>
        </div>
      </section>
      <ServicesScroller services={services} />

      {/* ── Stats ────────────────────────────────────────── */}
      <StatsSection stats={stats} />

      {/* ── Behaton teaser ───────────────────────────────── */}
      <section className="overflow-hidden py-24 sm:py-32">
        <div className="content-section">
          <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="section-label mb-5">Behaton katalog</p>
              <SplitText
                className="display-xl text-[15vw] text-ink sm:text-[10vw] lg:text-[7.5vw]"
                lines={[{ text: "Behaton" }, { text: "za celu Srbiju", className: "text-outline" }]}
              />
            </div>
            <div className="space-y-5">
              <p className="max-w-md font-body text-base leading-relaxed text-muted">
                Kocke i ploče za dvorišta, prilaze, parkinge i staze. Izaberite model, a mi računamo
                količinu, isporuku i ugradnju.
              </p>
              <Link href="/behaton" className="btn-primary">
                Ceo katalog{behatonProducts.length ? ` · ${behatonProducts.length} modela` : ""}
              </Link>
            </div>
          </div>
        </div>

        {behatonPreview.length > 0 ? (
          <div
            data-lenis-prevent-wheel=""
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:gap-5 sm:px-8 lg:px-12 [&::-webkit-scrollbar]:hidden"
          >
            {behatonPreview.map((item, i) => (
              <Link
                key={item.id}
                href={`/behaton/${item.slug}`}
                data-cursor="view"
                className="group relative w-[72vw] shrink-0 snap-start overflow-hidden rounded-[24px] bg-ink sm:w-[40vw] lg:w-[23vw]"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className={`h-full w-full transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.07] ${
                      item.isPackshot ? "bg-[#e9e6df] object-contain p-8" : "object-cover"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.2em] text-white/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-3xl font-black uppercase leading-[0.9] text-white [font-stretch:62%]">
                      {item.model}
                    </h3>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/55">{item.spec}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href="/behaton"
              className="grid w-[60vw] shrink-0 snap-start place-items-center rounded-[24px] bg-primary text-center text-ink sm:w-[30vw] lg:w-[18vw]"
            >
              <span className="font-display text-5xl font-black uppercase leading-[0.9] [font-stretch:62%]">
                Ceo
                <br />
                katalog →
              </span>
            </Link>
          </div>
        ) : (
          <div className="content-section">
            <ParallaxImage
              src="/img/behaton/optimized/SLI_4930.webp"
              alt="Behaton projekat"
              unoptimized
              className="aspect-[16/9] rounded-[28px]"
            />
          </div>
        )}
      </section>

      {/* ── Kako poručiti ────────────────────────────────── */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label mb-5">Kako poručiti</p>
            <SplitText
              className="display-xl text-[14vw] text-ink sm:text-[9vw] lg:text-[6vw]"
              lines={["Četiri koraka", "do betona"]}
            />
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Najbrže je preko forme za poručivanje betona ili direktnim pozivom radi potvrde
              termina.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/porucivanje-betona#forma" className="btn-primary">
                Poruči beton
              </Link>
              <a href="tel:+381605887471" className="btn-outline">
                {company.phone}
              </a>
            </div>
          </div>
          <ol className="space-y-4">
            {orderSteps.map((step, i) => (
              <li
                key={step.title}
                className="group grid grid-cols-[auto_1fr] gap-6 rounded-[24px] bg-cement p-6 ring-1 ring-ink/10 transition-colors duration-500 hover:bg-ink hover:text-white sm:p-8"
              >
                <span className="font-display text-7xl font-black leading-[0.8] text-primary [font-stretch:62%] sm:text-8xl">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-3xl font-extrabold uppercase leading-none [font-stretch:66%] sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 font-body text-[15px] leading-relaxed text-muted transition-colors group-hover:text-white/65">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Zona isporuke ─────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-label mb-5">Zona isporuke</p>
            <h2 className="font-display text-6xl font-black uppercase leading-[0.86] text-ink [font-stretch:62%] sm:text-8xl">
              Iz Krušca <span className="text-outline">do vašeg</span> gradilišta
            </h2>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Beton isporučujemo iz sopstvene baze u Nišu i okolini — Leskovac, Prokuplje, Aleksinac,
              Doljevac, Merošina — uz dogovor za šire područje južne i centralne Srbije. Behaton
              isporučujemo širom Srbije.
            </p>
          </div>
          <CoverageMap />
        </div>
      </section>

      {/* ── Projekti ─────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="bg-ink py-24 text-white sm:py-32">
          <div className="content-section">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="section-label mb-5">Naši projekti</p>
                <SplitText
                  className="display-xl text-[15vw] sm:text-[10vw] lg:text-[7.5vw]"
                  lines={[{ text: "Galerija" }, { text: "radova", className: "text-primary" }]}
                />
              </div>
              <Link href="/projekti" className="btn-outline-white">
                Svi projekti
              </Link>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-6">
              {featuredProjects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/projekti/${project.slug}`}
                  data-cursor="view"
                  className={`group relative block ${
                    featuredProjects.length === 1
                      ? projectLayouts[projectLayouts.length - 1]
                      : projectLayouts[i % projectLayouts.length]
                  }`}
                >
                  <ParallaxImage
                    src={project.hero_image || "/img/napolje1.webp"}
                    alt={project.title}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    strength={8}
                    className="!absolute inset-0 rounded-[24px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                          Projekat {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 font-display text-3xl font-black uppercase leading-[0.92] [font-stretch:62%] sm:text-4xl">
                          {project.title}
                        </h3>
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 backdrop-blur transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-ink">
                        →
                      </span>
                    </div>
                  </ParallaxImage>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Važne stranice (editorial index) ─────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="section-label mb-5">Važne stranice</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-7xl">
              Beton i behaton — sve na jednom mestu
            </h2>
          </div>
          <p className="max-w-md font-body text-base text-muted lg:justify-self-end">
            Isporuka betona za Niš i okolinu, behaton za Srbiju, pumpe i kompletne usluge.
          </p>
        </div>
        <ul className="border-t border-ink/15">
          {priorityLinks.map((link, i) => (
            <li key={link.href} className="border-b border-ink/15">
              <Link
                href={link.href}
                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden py-6 text-ink sm:gap-8 sm:py-8"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-y-100" />
                <span className="relative pl-1 font-mono text-[11px] tracking-[0.2em] text-muted group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative">
                  <h3 className="font-display text-4xl font-black uppercase leading-[0.9] transition-transform duration-500 [font-stretch:62%] group-hover:translate-x-3 sm:text-6xl lg:text-7xl">
                    {link.title}
                  </h3>
                  <p className="mt-2 font-body text-sm text-muted group-hover:text-ink/75">{link.description}</p>
                </span>
                <span className="relative mr-1 hidden h-20 w-32 overflow-hidden rounded-xl opacity-0 transition-all duration-500 group-hover:opacity-100 md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={link.image} alt="" loading="lazy" className="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover:scale-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-5">Najčešća pitanja</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-7xl">
              Beton u Nišu — brzi odgovori
            </h2>
          </div>
          <div className="border-t border-ink/15">
            {homepageFaq.map((item) => (
              <details key={item.q} className="group border-b border-ink/15">
                <summary className="flex items-center justify-between gap-6 py-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-[1] text-ink [font-stretch:70%] sm:text-3xl">
                    {item.q}
                  </h3>
                  <span className="faq-icon grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/20 text-xl transition-transform duration-500">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 font-body text-base leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        id="home-faq-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homepageFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <FloatingCta
        phone={company.phone}
        quickService="beton"
        formLabel="Brzi upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nišu."
      />
    </div>
  );
}
