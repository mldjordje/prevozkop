import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import { ScrollReveal } from "@/components/motion/reveal";
import { company } from "@/content/site";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Isporuka betona Nis i okolina - porucivanje, pumpa i visinske pumpe",
  description:
    "Porucite beton za Nis, Leskovac, Prokuplje, Aleksinac i okolinu: isporuka mikserima, beton pumpa, visinske pumpe i podrska na gradilistu.",
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
  { href: "/beton/grad/nis", label: "Beton Nis i okolina" },
  { href: "/beton/grad/leskovac", label: "Beton Leskovac" },
  { href: "/beton/grad/prokuplje", label: "Beton Prokuplje" },
  { href: "/usluge", label: "Sve usluge" },
];

const benefits = [
  { icon: "🏗", text: "Beton iz sopstvene baze, klase po zahtevu (MB10–MB40)" },
  { icon: "🚚", text: "Brza isporuka u Nisu i okolini mikserima i pumpama" },
  { icon: "⛏", text: "Nasipanje betona, tamponiranje i zemljani radovi" },
  { icon: "📋", text: "Precizno planiranje termina i logistike" },
];

const steps = [
  { num: "01", text: "Posaljite upit sa lokacijom, kolicinom i terminom" },
  { num: "02", text: "Dispecer potvrduje raspolozivost i organizuje logistiku" },
  { num: "03", text: "Mikseri i pumpa izlaze na teren po dogovorenom planu" },
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
    <div className="space-y-16 pb-24 sm:space-y-24 md:pb-0">
      <PageHero
        title="Porucivanje betona za Nis i okolinu"
        kicker="Porudzbina betona"
        description="Mikseri, pumpe i terenska podrska za efikasno betoniranje."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Posalji upit →", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      {/* ── FORMA — odmah ispod hero-a ─────────────────────── */}
      <section id="forma" className="content-section">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: Context */}
          <ScrollReveal from="left" className="space-y-6 lg:sticky lg:top-24">
            <div className="space-y-3">
              <span className="section-label">Online porudzbina</span>
              <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
                Popunite zahtev za beton
              </h2>
              <p className="text-base text-muted">
                Navedite kolicinu, klasu, lokaciju i da li je potrebna pumpa. Nas tim potvrduje
                termin i organizuje isporuku.
              </p>
            </div>

            {/* Process steps */}
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <span className="font-display text-2xl font-bold text-primary/40">
                    {step.num}
                  </span>
                  <p className="pt-1 text-sm text-muted">{step.text}</p>
                </div>
              ))}
            </div>

            {/* Contact fallback */}
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-dark">
                Radije biste pozvonom?
              </p>
              <a
                href="tel:+381605887471"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-75"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {company.phone}
              </a>
              <p className="mt-1 text-xs text-faint">Pon – Sub, 08:00 – 20:00</p>
            </div>
          </ScrollReveal>

          {/* Right: Form */}
          <ScrollReveal from="right">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Benefiti ──────────────────────────────────────── */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Beton, pumpe, zemljani radovi</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Isporuka betona i logistika gradilista
          </h2>
          <p className="max-w-3xl text-base text-muted">
            Prevoz Kop organizuje proizvodnju i isporuku betona, izlazak pumpe i pripremu terena.
          </p>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((item, i) => (
            <ScrollReveal key={item.text} from="up" delay={i * 0.06}>
              <div className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-semibold text-dark">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Servisna zona ─────────────────────────────────── */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Servisna zona</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Nis i okolina
          </h2>
        </ScrollReveal>
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

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">FAQ</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Cesta pitanja
          </h2>
        </ScrollReveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {faqItems.map((item, i) => (
            <ScrollReveal key={item.q} from="up" delay={i * 0.07}>
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-dark">{item.q}</h3>
                <p className="mt-2 text-sm text-muted">{item.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Brzi linkovi ──────────────────────────────────── */}
      <section className="content-section space-y-6">
        <ScrollReveal className="space-y-2">
          <span className="section-label">Brzi linkovi</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Isporuka betona po gradovima
          </h2>
        </ScrollReveal>
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
            areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Doljevac", "Merosina"],
          },
          areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Doljevac", "Merosina"],
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
        formHref="#forma"
        formLabel="Posalji upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nisu."
      />
    </div>
  );
}
