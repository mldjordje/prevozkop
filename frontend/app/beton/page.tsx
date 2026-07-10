import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import JsonLd from "@/components/json-ld";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import { betonCities } from "@/content/behaton";
import { company } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Beton - gotov beton, MB klase, cena i isporuka | Prevoz Kop",
  description:
    "Sve o betonu: MB klase (MB10-MB50), sta odredjuje cenu betona po m3, isporuka mikserima i pumpama za Nis i okolinu. Trazite ponudu za gotov beton.",
  path: "/beton",
  image: "/img/kamionislika2.webp",
  keywords: [
    "beton",
    "gotov beton",
    "cena betona",
    "cena betona po m3",
    "mb klase betona",
    "beton nis",
    "isporuka betona",
    "beton pumpa",
    "beton za temelje",
    "beton za plocu",
  ],
  languages: srEnLanguages("/beton", "/en/order-concrete"),
});

const mbClasses = [
  { klasa: "MB 10 - MB 15", cvrstoca: "C8/10 - C12/15", namena: "Podloge, tampon sloj, ispune, nearmirani slojevi" },
  { klasa: "MB 20", cvrstoca: "C16/20", namena: "Temelji kuca, podne ploce, staze i prilazi" },
  { klasa: "MB 25", cvrstoca: "C20/25", namena: "Armirani temelji, medjuspratne ploce, stubovi" },
  { klasa: "MB 30", cvrstoca: "C25/30", namena: "Armirano-betonske konstrukcije, ploce, serklazi" },
  { klasa: "MB 35 - MB 40", cvrstoca: "C30/37", namena: "Nosive konstrukcije, opterecenije ploce i stubovi" },
  { klasa: "MB 45 - MB 50", cvrstoca: "C35/45", namena: "Industrijski i visoko opterecena konstruktivni beton" },
];

const priceFactors = [
  { title: "MB klasa i receptura", text: "Visa klasa (vise cementa i aditiva) znaci visu cenu po m3. Pumpani beton ima prilagodjenu recepturu." },
  { title: "Kolicina i termin", text: "Vece kolicine i unapred dogovoreni termin omogucavaju povoljniju logistiku i bolju cenu." },
  { title: "Udaljenost i prilaz", text: "Rastojanje od baze do gradilista i uslovi prilaza miksera uticu na cenu transporta." },
  { title: "Pumpa za beton", text: "Ako je potrebna pumpa ili visinska pumpa, dodaje se cena angazovanja pumpe prema dosegu i vremenu." },
];

const betonFaq = [
  {
    q: "Kolika je cena betona po m3?",
    a: "Cena betona zavisi od MB klase, kolicine, udaljenosti gradilista i toga da li je potrebna pumpa. Posaljite upit sa klasom, kolicinom i lokacijom i dobicete konkretnu ponudu po m3.",
  },
  {
    q: "Koju MB klasu betona da izaberem?",
    a: "Za podloge se koristi MB10-MB15, za temelje kuca i ploce MB20-MB25, a za armirano-betonske nosive konstrukcije MB30 i vise. Ako niste sigurni, javite namenu i predlozicemo klasu.",
  },
  {
    q: "Da li isporucujete beton pumpom i visinskom pumpom?",
    a: "Da. U zavisnosti od terena, dosega i visine saljemo odgovarajucu pumpu za bezbedan istovar i ugradnju betona.",
  },
  {
    q: "Za koje gradove radite isporuku betona?",
    a: "Primarno Nis i okolina (Leskovac, Prokuplje, Aleksinac, Doljevac, Merosina), uz dogovor za sire podrucje juzne i centralne Srbije.",
  },
];

const relatedLinks = [
  { href: "/porucivanje-betona", label: "Porucivanje betona" },
  { href: "/beton/grad/nis", label: "Beton Nis" },
  { href: "/beton/grad/leskovac", label: "Beton Leskovac" },
  { href: "/beton/grad/prokuplje", label: "Beton Prokuplje" },
  { href: "/usluge", label: "Sve usluge" },
];

export default function BetonPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Beton - gotov beton, MB klase, cena i isporuka"
        kicker="Betonska baza Nis"
        description="Proizvodnja i isporuka gotovog betona iz sopstvene baze. Sve MB klase, isporuka mikserima i pumpama, uz preciznu procenu termina i logistike."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Trazi ponudu", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      {/* MB klase */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">MB klase betona</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Klase betona i njihova namena
          </h2>
          <p className="max-w-3xl text-base text-muted">
            Beton se odredjuje po marki (MB) odnosno klasi cvrstoce (C). Izbor klase zavisi od toga
            sta se betonira - od podloga do nosivih armirano-betonskih konstrukcija.
          </p>
        </ScrollReveal>
        <div className="overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-lg">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-gray-50 text-xs uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-4 font-semibold">MB marka</th>
                <th className="px-5 py-4 font-semibold">Klasa (C)</th>
                <th className="px-5 py-4 font-semibold">Tipicna namena</th>
              </tr>
            </thead>
            <tbody>
              {mbClasses.map((row) => (
                <tr key={row.klasa} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-4 font-semibold text-dark">{row.klasa}</td>
                  <td className="px-5 py-4 text-muted">{row.cvrstoca}</td>
                  <td className="px-5 py-4 text-gray-700">{row.namena}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-faint">
          Nezavisno od klase, tacnu recepturu i kolicinu potvrdjujemo prema projektu i uslovima na
          gradilistu.
        </p>
      </section>

      {/* Sta odredjuje cenu */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Cena betona</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Sta odredjuje cenu betona po m3
          </h2>
          <p className="max-w-3xl text-base text-muted">
            Cena gotovog betona nije fiksna - formira se prema nekoliko faktora. Zato dajemo
            konkretnu ponudu po m3 cim znamo klasu, kolicinu i lokaciju.
          </p>
        </ScrollReveal>
        <StaggerReveal className="grid gap-4 md:grid-cols-2">
          {priceFactors.map((item, i) => (
            <ScrollReveal key={item.title} from="up" delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-black/5 bg-white px-5 py-5 shadow-sm">
                <h3 className="text-base font-semibold text-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-700">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </StaggerReveal>
        <div className="flex flex-wrap gap-3">
          <Link
            href="#forma"
            className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] transition hover:-translate-y-0.5"
          >
            Trazi ponudu za beton
          </Link>
          <Link
            href="tel:+381605887471"
            className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
          >
            Pozovi {company.phone}
          </Link>
        </div>
      </section>

      {/* Gradovi */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Lokacije</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Isporuka betona po gradovima
          </h2>
        </ScrollReveal>
        <StaggerReveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {betonCities.map((city) => (
            <ScrollReveal key={city.slug} from="up">
              <Link
                href={`/beton/grad/${city.slug}`}
                className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-dark">{city.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{city.intro}</p>
                <span className="mt-4 text-sm font-semibold text-primary">Lokalna ponuda {"->"}</span>
              </Link>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      {/* FAQ */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">FAQ</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">Cesta pitanja o betonu</h2>
        </ScrollReveal>
        <div className="grid gap-4 lg:grid-cols-2">
          {betonFaq.map((item) => (
            <div key={item.q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Forma */}
      <section id="forma" className="content-section space-y-6">
        <div className="space-y-2">
          <span className="section-label">Upit</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">Trazi ponudu za beton</h2>
          <p className="max-w-3xl text-base text-muted">
            Navedite MB klasu, kolicinu, lokaciju i da li je potrebna pumpa. Potvrdjujemo termin i
            saljemo cenu po m3.
          </p>
        </div>
        <ContactForm
          defaultSubject="Beton - upit za ponudu"
          subjectPlaceholder="Beton za temelj, plocu, gradiliste..."
          showQuantity
          quantityLabel="Kolicina betona (opciono)"
          quantityPlaceholder="npr. 20"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m3", "m2"]}
        />
      </section>

      {/* Povezane stranice */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Povezane stranice</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">Korisni linkovi</h2>
        </ScrollReveal>
        <div className="flex flex-wrap gap-3">
          {relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        id="beton-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Proizvodnja i isporuka gotovog betona",
          serviceType: "Gotov beton, isporuka betona, pumpe za beton",
          areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Doljevac", "Merosina", "Srbija"],
          url: `${SITE_URL}/beton`,
          provider: { "@id": `${SITE_URL}#organization` },
        }}
      />
      <JsonLd
        id="beton-breadcrumbs-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Beton", item: `${SITE_URL}/beton` },
          ],
        }}
      />
      <JsonLd
        id="beton-faq-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: betonFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <FloatingCta
        phone={company.phone}
        formHref="#forma"
        formLabel="Trazi ponudu"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me cena i isporuka betona."
      />
    </div>
  );
}
