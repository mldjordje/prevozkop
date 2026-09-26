import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import JsonLd from "@/components/json-ld";
import StatsSection from "@/components/stats-section";
import { CtaBand, LinkIndex, MarqueeBand, NumberedCards, SectionHead } from "@/components/sections";
import { services, stats } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Usluge: isporuka betona, visoke pumpe i zemljani radovi | Niš",
  description:
    "Prevozkop (Prevoz Kop) iz Niša pruža isporuku gotovog betona, visinske pumpe za beton (za višespratnice i nepristupačne terene) i zemljane radove (iskopi, ravnanje, priprema gradilišta). Radimo u Nišu, Leskovcu, Prokuplju, Aleksincu i širom juga/centralne Srbije.",
  path: "/usluge",
  image: "/img/kamionislika2.webp",
  keywords: [
    "usluge",
    "isporuka betona",
    "visinske pumpe za beton",
    "zemljani radovi nis",
    "iskopi temelja",
    "priprema gradilista",
    "rusenje objekata",
    "prevoz rasutih materijala",
  ],
  languages: srEnLanguages("/usluge", "/en/services"),
});

const serviceCatalog = [
  "Proizvodnja i isporuka gotovog betona",
  "Visinske pumpe za beton",
  "Iskopi i tamponiranje",
  "Rušenje i priprema terena",
  "Prevoz rasutih materijala",
  "Izgradnja temelja",
];

const coreServices = [
  {
    title: "Isporuka gotovog betona",
    description:
      "Organizujemo isporuku betona na gradilište mikserima, uz dogovor termina i logistike istovara (pristup, teren, visina).",
    href: "/porucivanje-betona#forma",
    cta: "Poruči beton",
    image: "/img/mikseri.webp",
  },
  {
    title: "Visoke pumpe za beton",
    description:
      "Betonske pumpe za betoniranje višespratnica, velikih visina i nepristupačnih terena. Pre izlaska proveravamo uslove i pristup.",
    href: "/kontakt",
    cta: "Provera uslova",
    image: "/img/napolje2.webp",
  },
  {
    title: "Zemljani radovi (iskopi i priprema)",
    description:
      "Zemljani radovi i priprema gradilišta: iskopi temelja, ravnanje terena i organizacija prilaza za mikser/pumpu.",
    href: "/kontakt",
    cta: "Dogovor na terenu",
    image: "/img/uterivac.webp",
  },
];

const processSteps = [
  { title: "Procena i planiranje", text: "Dolazimo na lokaciju, merimo i predlažemo optimalnu vrstu betona i vozila." },
  { title: "Brza isporuka", text: "Flota miksera, pumpi i kipera kreće odmah nakon dogovora — bez čekanja." },
  { title: "Kontrola kvaliteta", text: "Nadziremo svaki korak na terenu i obezbeđujemo da beton stigne u traženoj klasi." },
];

export default function ServicesPage() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Usluge u Nišu: isporuka betona, visinske pumpe i zemljani radovi"
        kicker="Ponuda"
        description="Prevozkop (Prevoz Kop) iz Niša: isporuka gotovog betona, visoke pumpe za beton i zemljani radovi (iskopi, priprema gradilišta) za stambenu i poslovnu gradnju."
        background="/img/kamionislika2.webp"
        priority
        actions={[{ label: "Poruči beton", href: "/porucivanje-betona#forma" }]}
      />

      {/* ── Core services: three tall editorial panels ─────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Glavne usluge"
          lines={["Građevinska podrška", "na jednom mestu"]}
          text="Pomažemo investitorima, izvođačima i majstorima da reše logistiku na gradilištu – od isporuke betona do izlaska visinske pumpe i pripreme terena (Niš i region)."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {coreServices.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              data-cursor={item.cta}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:aspect-[3/4]"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover opacity-70 transition-all duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06] group-hover:opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <span className="absolute left-6 top-6 font-mono text-[11px] tracking-[0.22em] text-white/70 sm:left-8 sm:top-8">
                {String(i + 1).padStart(2, "0")} / 03
              </span>
              <div className="relative">
                <h3 className="font-display text-4xl font-black uppercase leading-[0.9] [font-stretch:62%] sm:text-5xl">{item.title}</h3>
                <p className="mt-4 max-w-sm font-body text-[15px] leading-relaxed text-white/70">{item.description}</p>
                <span className="mt-6 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {item.cta}
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-primary transition-all duration-500 group-hover:rotate-[-45deg] group-hover:bg-primary group-hover:text-ink">
                    →
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <MarqueeBand words={["Beton", "Pumpe", "Iskopi", "Tampon", "Rušenje", "Transport", "Temelji"]} />

      {/* ── All services as an index ───────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Šta radimo"
          lines={["Betonska logistika,", { text: "pumpe i gradilište", className: "text-outline" }]}
          text="Od temelja do ploče – baza, vozni park i tim omogućavaju da projekti napreduju bez zastoja i bez improvizacije na terenu."
        />
        <LinkIndex
          links={services.map((service) => ({
            href: "/porucivanje-betona#forma",
            title: service.title,
            description: service.description,
            image: service.image,
          }))}
        />
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Proces"
            lines={["Kako", { text: "radimo", className: "text-primary" }]}
            text="Svaki posao počinjemo planom, a završavamo proverom kvaliteta. Vreme isporuke je prioritet, jer znamo koliko svaka minuta znači na gradilištu."
          />
          <NumberedCards items={processSteps} />
        </div>
      </section>

      <StatsSection stats={stats} />

      <CtaBand
        label="Hitna isporuka"
        lines={["Potreban beton,", { text: "pumpa ili iskop?", className: "text-primary" }]}
        text="Brzo reagujemo i organizujemo termin u skladu sa uslovima na gradilištu. Kontaktirajte nas za rezervaciju termina i procenu logistike."
        image="/img/vozila2.webp"
        bullets={[
          "Dostava mikserima i pumpama za beton",
          "Iskopi, tamponiranje, priprema nasipa",
          "Rušenje objekata i odvoz šuta",
          "Transport rasutih materijala",
          "Priprema i izgradnja temelja",
        ]}
      >
        <a href="tel:+381605887471" className="btn-primary">
          Pozovi odmah
        </a>
        <Link href="/porucivanje-betona#forma" className="btn-outline-white">
          Pošalji upit
        </Link>
      </CtaBand>

      <JsonLd
        id="usluge-itemlist-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Usluge - Prevoz Kop",
          itemListElement: serviceCatalog.map((name, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Service",
              name,
              provider: { "@id": `${SITE_URL}#organization` },
              areaServed: ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Srbija"],
            },
          })),
        }}
      />
      <JsonLd
        id="usluge-breadcrumbs-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Usluge", item: `${SITE_URL}/usluge` },
          ],
        }}
      />
    </div>
  );
}
