import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import JsonLd from "@/components/json-ld";
import { ConcreteCalculator } from "@/components/beton/concrete-tools";
import { ChipLinks, FaqList, FormSection, LinkIndex, MarqueeBand, SectionHead } from "@/components/sections";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";
import { company } from "@/content/site";

export const metadata: Metadata = buildMetadata({
  title: "Isporuka betona Niš i okolina - poručivanje, pumpa i visinske pumpe",
  description:
    "Poručite beton za Niš, Leskovac, Prokuplje, Aleksinac i okolinu: isporuka mikserima, beton pumpa, visinske pumpe i podrška na gradilištu.",
  path: "/porucivanje-betona",
  image: "/img/kamionislika2.webp",
  keywords: [
    "porucivanje betona",
    "beton nis",
    "isporuka betona",
    "isporuka betona nis",
    "gotov beton nis",
    "beton pumpa",
    "visinska pumpa",
    "zemljani radovi",
  ],
  languages: srEnLanguages("/porucivanje-betona", "/en/order-concrete"),
});

const betonPriorityLinks = [
  { href: "/beton", title: "Sve o betonu", description: "MB klase, cena po m³ i kalkulator" },
  { href: "/beton/grad/nis", title: "Beton Niš i okolina", description: "Lokalna isporuka, pumpa i termin" },
  { href: "/beton/grad/leskovac", title: "Beton Leskovac", description: "Isporuka betona za Leskovac" },
  { href: "/beton/grad/prokuplje", title: "Beton Prokuplje", description: "Isporuka betona za Prokuplje" },
  { href: "/usluge", title: "Sve usluge", description: "Pumpe, iskopi, rušenje i transport" },
];

const benefits = [
  "Beton iz sopstvene baze, klase po zahtevu (MB10–MB40)",
  "Brza isporuka u Nišu i okolini mikserima i pumpama",
  "Nasipanje betona, tamponiranje i zemljani radovi",
  "Precizno planiranje termina i logistike",
];

const steps = [
  { num: "01", text: "Pošaljite upit sa lokacijom, količinom i terminom" },
  { num: "02", text: "Dispečer potvrđuje raspoloživost i organizuje logistiku" },
  { num: "03", text: "Mikseri i pumpa izlaze na teren po dogovorenom planu" },
];

const serviceAreas = ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Južna i centralna Srbija"];

const faqItems = [
  {
    q: "Kako da poručim beton?",
    a: "Pošaljite upit sa lokacijom, količinom i terminom. Dispečer potvrđuje raspoloživost i logistiku.",
  },
  {
    q: "Da li imate beton pumpu i visinsku pumpu?",
    a: "Da. U zavisnosti od terena i objekta šaljemo odgovarajuću pumpu za bezbedan istovar.",
  },
  {
    q: "Da li radite i pripremu gradilišta?",
    a: "Radimo zemljane radove, iskope i pripremu terena da isporuka i betoniranje idu bez zastoja.",
  },
];

export default function OrderConcretePage() {
  return (
    <div className="bg-cement pb-24 md:pb-0">
      <PageHero
        title="Poručivanje betona za Niš i okolinu"
        kicker="Porudžbina betona"
        description="Mikseri, pumpe i terenska podrška za efikasno betoniranje."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Pošalji upit", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      <FormSection
        label="Online porudžbina"
        lines={["Popunite zahtev", { text: "za beton", className: "text-primary" }]}
        text="Navedite količinu, klasu, lokaciju i da li je potrebna pumpa. Naš tim potvrđuje termin i organizuje isporuku."
        extra={
          <ol className="mt-10 border-t border-white/12">
            {steps.map((step) => (
              <li key={step.num} className="flex gap-5 border-b border-white/12 py-4">
                <span className="font-display text-3xl font-black leading-none text-primary [font-stretch:62%]">{step.num}</span>
                <span className="pt-1 font-body text-[15px] text-white/75">{step.text}</span>
              </li>
            ))}
          </ol>
        }
      >
        <ContactForm />
      </FormSection>

      {/* ── Calculator ────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Kalkulator"
          lines={["Izračunajte", { text: "količinu", className: "text-outline" }]}
          text="Ne znate koliko m³ da poručite? Unesite dimenzije i dobićete okvirnu količinu i broj tura miksera."
        />
        <ConcreteCalculator />
      </section>

      <MarqueeBand words={serviceAreas.concat(["Doljevac", "Merošina"])} tone="ink" />

      {/* ── Benefits ──────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label mb-5">Beton, pumpe, zemljani radovi</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Isporuka betona i logistika gradilišta
            </h2>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Prevoz Kop organizuje proizvodnju i isporuku betona, izlazak pumpe i pripremu terena.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((item, i) => (
              <li
                key={item}
                className="group flex min-h-[200px] flex-col justify-between rounded-[24px] bg-paper p-6 ring-1 ring-ink/10 transition-colors duration-500 hover:bg-ink hover:text-white"
              >
                <span className="font-display text-6xl font-black leading-none text-primary [font-stretch:62%]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-2xl font-extrabold uppercase leading-[1] [font-stretch:66%]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Links ─────────────────────────────────────────── */}
      <section className="content-section pb-24 sm:pb-32">
        <SectionHead
          label="Servisna zona"
          lines={["Isporuka betona", "po gradovima"]}
          aside={<ChipLinks links={serviceAreas.map((c) => ({ href: "#forma", label: c }))} />}
        />
        <LinkIndex links={betonPriorityLinks} />
      </section>

      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section">
          <FaqList items={faqItems} />
        </div>
      </section>

      <JsonLd
        id="beton-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Proizvodnja i isporuka betona",
          serviceType: "Gotov beton, isporuka betona, pumpe za beton",
          provider: { "@id": `${SITE_URL}#organization` },
          areaServed: ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Doljevac", "Merošina"],
          url: `${SITE_URL}/porucivanje-betona`,
        }}
      />
      <JsonLd
        id="porucivanje-betona-faq-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <FloatingCta
        phone={company.phone}
        formHref="#forma"
        formLabel="Pošalji upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nišu."
      />
    </div>
  );
}
