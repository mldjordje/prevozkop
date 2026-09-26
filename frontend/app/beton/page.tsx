import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import JsonLd from "@/components/json-ld";
import { ConcreteCalculator, MbScale } from "@/components/beton/concrete-tools";
import {
  ChipLinks,
  CityIndex,
  FaqList,
  FormSection,
  MarqueeBand,
  NumberedCards,
  SectionHead,
} from "@/components/sections";
import { betonCities } from "@/content/behaton";
import { company } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Beton - gotov beton, MB klase, cena i isporuka | Prevoz Kop",
  description:
    "Sve o betonu: MB klase (MB10-MB50), šta određuje cenu betona po m3, isporuka mikserima i pumpama za Niš i okolinu. Tražite ponudu za gotov beton.",
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
    "kalkulator betona",
  ],
  languages: srEnLanguages("/beton", "/en/order-concrete"),
});

const mbClasses = [
  { klasa: "MB 10 - MB 15", cvrstoca: "C8/10 - C12/15", namena: "Podloge, tampon sloj, ispune, nearmirani slojevi" },
  { klasa: "MB 20", cvrstoca: "C16/20", namena: "Temelji kuća, podne ploče, staze i prilazi" },
  { klasa: "MB 25", cvrstoca: "C20/25", namena: "Armirani temelji, međuspratne ploče, stubovi" },
  { klasa: "MB 30", cvrstoca: "C25/30", namena: "Armirano-betonske konstrukcije, ploče, serklaži" },
  { klasa: "MB 35 - MB 40", cvrstoca: "C30/37", namena: "Nosive konstrukcije, opterećenije ploče i stubovi" },
  { klasa: "MB 45 - MB 50", cvrstoca: "C35/45", namena: "Industrijski i visoko opterećena konstruktivni beton" },
];

const priceFactors = [
  { title: "MB klasa i receptura", text: "Viša klasa (više cementa i aditiva) znači višu cenu po m3. Pumpani beton ima prilagođenu recepturu." },
  { title: "Količina i termin", text: "Veće količine i unapred dogovoreni termin omogućavaju povoljniju logistiku i bolju cenu." },
  { title: "Udaljenost i prilaz", text: "Rastojanje od baze do gradilišta i uslovi prilaza miksera utiču na cenu transporta." },
  { title: "Pumpa za beton", text: "Ako je potrebna pumpa ili visinska pumpa, dodaje se cena angažovanja pumpe prema dosegu i vremenu." },
];

const betonFaq = [
  {
    q: "Kolika je cena betona po m3?",
    a: "Cena betona zavisi od MB klase, količine, udaljenosti gradilišta i toga da li je potrebna pumpa. Pošaljite upit sa klasom, količinom i lokacijom i dobićete konkretnu ponudu po m3.",
  },
  {
    q: "Koju MB klasu betona da izaberem?",
    a: "Za podloge se koristi MB10-MB15, za temelje kuća i ploče MB20-MB25, a za armirano-betonske nosive konstrukcije MB30 i više. Ako niste sigurni, javite namenu i predložićemo klasu.",
  },
  {
    q: "Da li isporučujete beton pumpom i visinskom pumpom?",
    a: "Da. U zavisnosti od terena, dosega i visine šaljemo odgovarajuću pumpu za bezbedan istovar i ugradnju betona.",
  },
  {
    q: "Za koje gradove radite isporuku betona?",
    a: "Primarno Niš i okolina (Leskovac, Prokuplje, Aleksinac, Doljevac, Merošina), uz dogovor za šire područje južne i centralne Srbije.",
  },
];

const relatedLinks = [
  { href: "/porucivanje-betona", label: "Poručivanje betona" },
  { href: "/beton/grad/nis", label: "Beton Niš" },
  { href: "/beton/grad/leskovac", label: "Beton Leskovac" },
  { href: "/beton/grad/prokuplje", label: "Beton Prokuplje" },
  { href: "/usluge", label: "Sve usluge" },
];

export default function BetonPage() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Beton - gotov beton, MB klase, cena i isporuka"
        kicker="Betonska baza Niš"
        description="Proizvodnja i isporuka gotovog betona iz sopstvene baze. Sve MB klase, isporuka mikserima i pumpama, uz preciznu procenu termina i logistike."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Traži ponudu", href: "#forma" },
          { label: "Kalkulator", href: "#kalkulator" },
        ]}
      />

      {/* ── MB scale ──────────────────────────────────────── */}
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="MB klase betona"
            lines={["Klase betona", { text: "i njihova namena", className: "text-primary" }]}
            text="Beton se određuje po marki (MB) odnosno klasi čvrstoće (C). Izbor klase zavisi od toga šta se betonira - od podloga do nosivih armirano-betonskih konstrukcija. Pređite preko klase."
          />
          <MbScale rows={mbClasses} />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
            Tačnu recepturu i količinu potvrđujemo prema projektu i uslovima na gradilištu.
          </p>
        </div>
      </section>

      <FormSection
        lines={["Traži ponudu", { text: "za beton", className: "text-primary" }]}
        text="Navedite MB klasu, količinu, lokaciju i da li je potrebna pumpa. Potvrđujemo termin i šaljemo cenu po m3."
      >
        <ContactForm
          defaultSubject="Beton - upit za ponudu"
          subjectPlaceholder="Beton za temelj, ploču, gradilište..."
          showQuantity
          quantityLabel="Količina betona (opciono)"
          quantityPlaceholder="npr. 20"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m3", "m2"]}
        />
      </FormSection>

      {/* ── Calculator ────────────────────────────────────── */}
      <section id="kalkulator" className="content-section scroll-mt-24 py-24 sm:py-32">
        <SectionHead
          label="Kalkulator betona"
          lines={["Koliko vam", { text: "betona treba?", className: "text-outline" }]}
          text="Unesite dimenzije ploče, temelja ili staze i odmah dobijate okvirnu količinu u m³ i broj tura miksera. Jednim klikom šaljete upit sa tom količinom."
        />
        <ConcreteCalculator />
      </section>

      <MarqueeBand words={["MB 20", "MB 25", "MB 30", "Pumpa", "Mikser", "Temelj", "Ploča"]} />

      {/* ── Price factors ─────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Cena betona"
          lines={["Šta određuje", "cenu po m³"]}
          text="Cena gotovog betona nije fiksna - formira se prema nekoliko faktora. Zato dajemo konkretnu ponudu po m3 čim znamo klasu, količinu i lokaciju."
          aside={
            <div className="flex flex-wrap gap-3">
              <Link href="#forma" className="btn-primary">
                Traži ponudu
              </Link>
              <a href="tel:+381605887471" className="btn-outline">
                {company.phone}
              </a>
            </div>
          }
        />
        <NumberedCards items={priceFactors} tone="light" cols={4} />
      </section>


      {/* ── Cities ────────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Lokacije"
          lines={["Isporuka betona", "po gradovima"]}
          aside={<ChipLinks links={relatedLinks} />}
        />
        <CityIndex cities={betonCities} hrefBase="/beton/grad" prefix="Beton" />
      </section>

      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section">
          <FaqList items={betonFaq} title="Česta pitanja o betonu" />
        </div>
      </section>

      <JsonLd
        id="beton-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Proizvodnja i isporuka gotovog betona",
          serviceType: "Gotov beton, isporuka betona, pumpe za beton",
          areaServed: ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Doljevac", "Merošina", "Srbija"],
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
        quickService="beton"
        formLabel="Brzi upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me cena i isporuka betona."
      />
    </div>
  );
}
