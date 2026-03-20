import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import { company } from "@/content/site";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Isporuka betona Nis - porucivanje, pumpa i visinske pumpe",
  description:
    "Porucite beton u Nisu i regionu: isporuka mikserima, beton pumpa, visinske pumpe i podrska na gradilistu.",
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
  {
    href: "/beton/grad/nis",
    label: "Beton Nis",
  },
  {
    href: "/beton/grad/leskovac",
    label: "Beton Leskovac",
  },
  {
    href: "/beton/grad/prokuplje",
    label: "Beton Prokuplje",
  },
  {
    href: "/usluge",
    label: "Sve usluge",
  },
];

const benefits = [
  "Beton iz sopstvene baze, klase po zahtevu (MB10-MB40)",
  "Brza isporuka u Nisu i okolini mikserima i pumpama",
  "Nasipanje betona, tamponiranje i zemljani radovi",
  "Precizno planiranje termina i logistike",
];

const steps = [
  "Posaljite upit ili pozovite",
  "Dogovaramo kolicinu, klasu i vreme isporuke",
  "Mikseri i pumpa izlaze na teren po planu",
];

const serviceAreas = ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Juzna i centralna Srbija"];

const faqItems = [
  {
    q: "Kako da porucim beton?",
    a: "Posaljite upit sa lokacijom, kolicinom i terminom. Dispecer potvrduje raspolozivost i logistiku.",
  },
  {
    q: "Da li imate beton pumpu i visinsku pumpu?",
    a: "Da. U zavisnosti od terena i objekta saljemo odgovarajucu pumpu za bezbedan istovar.",
  },
  {
    q: "Da li radite i pripremu gradilista?",
    a: "Radimo zemljane radove, iskope i pripremu terena da isporuka i betoniranje idu bez zastoja.",
  },
];

export default function OrderConcretePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Porucivanje betona Nis - brza isporuka"
        kicker="Porudzbina betona"
        description="Mikseri, pumpe i terenska podrska za efikasno betoniranje."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Popuni porudzbinu", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Beton, pumpe, zemljani radovi
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Isporuka betona i logistika gradilista na jednom mestu
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Prevoz Kop organizuje proizvodnju i isporuku betona, izlazak pumpe i pripremu terena.
            Cilj je da beton stigne na vreme i u trazenoj klasi.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-black/5 bg-white px-5 py-4 text-sm font-semibold text-dark shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-black/5 bg-white px-5 py-5 shadow-lg sm:px-7 sm:py-6">
          <h3 className="text-xl font-bold text-dark">Kako poruciti beton</h3>
          <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Servisna zona
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Nis i okolni gradovi - jug i centralna Srbija
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceAreas.map((city) => (
            <span
              key={city}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-dark"
            >
              {city}
            </span>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Brzi linkovi
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Najvaznije stranice za isporuku betona
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Google i korisnici lakse razumeju temu sajta kada su glavne stranice za beton jasno
            povezane i imaju direktne ulaze za gradove i usluge.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {betonPriorityLinks.map((link) => (
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

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Cesta pitanja</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {faqItems.map((item) => (
            <div key={item.q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="forma" className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Online porudzbina
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Popunite zahtev za beton</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite kolicinu, klasu, lokaciju i da li je potrebna pumpa. Nas tim potvrduje termin
            i organizuje isporuku.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+381605887471"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] transition hover:translate-y-[-2px]"
            >
              Pozovi {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
            >
              {company.email}
            </a>
          </div>
        </div>
        <ContactForm />
      </section>

      <Script id="beton-service-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Proizvodnja i isporuka betona",
          serviceType: "Gotov beton, isporuka betona, pumpe za beton",
          provider: {
            "@type": "LocalBusiness",
            name: "Prevoz Kop",
            telephone: company.phone,
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
            areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Juzna Srbija", "Centralna Srbija"],
          },
          areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Juzna Srbija", "Centralna Srbija"],
        })}
      </Script>
      <Script id="porucivanje-betona-faq-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        })}
      </Script>
      <FloatingCta
        phone={company.phone}
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nisu."
      />
    </div>
  );
}
