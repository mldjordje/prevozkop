import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import JsonLd from "@/components/json-ld";
import ContactForm from "@/components/contact-form";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import { betonCities } from "@/content/behaton";
import { company } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

type RouteParams = { slug: string };
type PageProps = {
  params: Promise<RouteParams> | RouteParams;
};

export function generateStaticParams() {
  return betonCities.map((city) => ({ slug: city.slug }));
}

const betonFaq = [
  {
    q: "Kako da porucim beton u svom gradu?",
    a: "Posaljite upit sa kolicinom, lokacijom i terminom, a nas tim potvrduje raspolozivost i logistiku.",
  },
  {
    q: "Da li je dostupna pumpa za beton?",
    a: "Da. Po potrebi saljemo pumpu ili visinsku pumpu kada je prilaz otezan ili je betoniranje na visini.",
  },
  {
    q: "Da li radite i pripremu terena?",
    a: "Radimo zemljane radove, pripremu podloge i koordinaciju pristupa miksera i pumpe.",
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = betonCities.find((item) => item.slug === slug);
  if (!city) {
    return buildMetadata({
      title: "Isporuka betona po gradu | Prevozkop",
      description: "Lokalna isporuka gotovog betona i pumpe za beton.",
      path: "/porucivanje-betona",
      image: "/img/kamionislika2.webp",
      languages: srEnLanguages("/porucivanje-betona", "/en/order-concrete"),
    });
  }

  if (city.slug === "nis") {
    return buildMetadata({
      title: "Isporuka betona Nis - gotov beton, pumpa i termin",
      description:
        "Isporuka gotovog betona u Nisu uz miksere, beton pumpu, visinske pumpe i podrsku na gradilistu.",
      path: `/beton/grad/${city.slug}`,
      image: "/img/kamionislika2.webp",
      languages: srEnLanguages(`/beton/grad/${city.slug}`, "/en/order-concrete"),
    });
  }

  return buildMetadata({
    title: `Beton ${city.name} | Isporuka i pumpa`,
    description: city.intro,
    path: `/beton/grad/${city.slug}`,
    image: "/img/kamionislika2.webp",
    languages: srEnLanguages(`/beton/grad/${city.slug}`, "/en/order-concrete"),
  });
}

export default async function BetonCityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = betonCities.find((item) => item.slug === slug);
  if (!city) notFound();
  const isNis = city.slug === "nis";
  const localAreas = isNis
    ? ["Centar", "Durlan", "Pantelej", "Palilula", "Ledena Stena", "Medijana"]
    : city.focus;
  const localFaq = isNis
    ? [
        {
          q: "Kako ide isporuka betona u Nisu?",
          a: "Prvo proveravamo lokaciju, prilaz, kolicinu i termin, a zatim organizujemo mikser i po potrebi beton pumpu ili visinsku pumpu.",
        },
        {
          q: "Da li saljete beton pumpu za Nis i okolna naselja?",
          a: "Da. Beton pumpu saljemo kada je potreban duzi doseg, istovar preko ograde ili rad na visini i nepristupacnim pozicijama.",
        },
        {
          q: "Da li radite i pripremu terena pre betoniranja u Nisu?",
          a: "Da. Po dogovoru radimo zemljane radove, tamponiranje i pripremu pristupa za mikser i pumpu.",
        },
      ]
    : betonFaq;
  const relatedLinks = isNis
    ? [
        { href: "/porucivanje-betona", label: "Porucivanje betona" },
        { href: "/usluge", label: "Sve usluge" },
        { href: "/behaton/grad/nis", label: "Behaton Nis" },
        { href: "/kontakt", label: "Kontakt i hitan upit" },
      ]
    : [
        { href: "/porucivanje-betona", label: "Porucivanje betona" },
        { href: "/usluge", label: "Sve usluge" },
      ];

  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title={`Isporuka betona ${city.name}`}
        kicker="Lokalna beton logistika"
        description={city.intro}
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Pozovi odmah", href: "tel:+381605887471" },
          { label: "Posalji upit", href: "#forma" },
        ]}
      />

      <section className="content-section space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Beton i pumpa
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Isporuka i beton pumpa za {city.name}
            </h2>
            <p className="text-sm text-gray-700">
              Radimo isporuku gotovog betona, obezbedjujemo pumpu i organizujemo teren da betoniranje
              ide bez zastoja.
            </p>
          </ScrollReveal>
          <StaggerReveal className="grid gap-3">
            {city.focus.map((item) => (
              <ScrollReveal key={item} from="up">
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-dark shadow-sm">
                  {item}
                </div>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Lokalne zone
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Gde najcesce isporucujemo beton u {city.name}
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            {isNis
              ? "Najcesce radimo temelje, ploce, privatne kuce, manje stambene objekte i komercijalna betoniranja sirom Nisa."
              : `Najcesce radimo isporuku betona za temelje, ploce i gradilista u ${city.name}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {localAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-dark"
            >
              {area}
            </span>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="grid gap-6 rounded-3xl border border-black/5 bg-white px-6 py-8 shadow-xl lg:grid-cols-3">
          {[
            {
              title: "Brza procena",
              text: "Na osnovu lokacije i kolicine predlazemo vozila i termin.",
            },
            {
              title: "Tacan dolazak",
              text: "Organizujemo dolazak miksera i pumpe prema dinamici gradilista.",
            },
            {
              title: "Podrska na terenu",
              text: "Po potrebi radimo pripremu terena i koordinaciju istovara.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/5 bg-gray-50 p-5">
              <h3 className="text-lg font-semibold text-dark">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Povezane stranice
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Korisni linkovi za beton i gradiliste
          </h2>
        </div>
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

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Cesta pitanja</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {localFaq.map((item) => (
            <div key={item.q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="forma" className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Upit</span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Posaljite upit za beton u {city.name}
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite kolicinu, klasu i termin. Potvrdujemo raspolozivost i logistiku.
          </p>
        </div>
        <ContactForm
          defaultSubject={`Beton ${city.name} - upit`}
          subjectPlaceholder={`Beton i pumpa za ${city.name}`}
          showQuantity
          quantityLabel="Kolicina betona (opciono)"
          quantityPlaceholder="npr. 20"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m3", "m2"]}
        />
      </section>

      <section className="content-section">
        <div className="rounded-3xl border border-black/5 bg-dark px-6 py-10 text-white shadow-2xl sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-bold sm:text-4xl">Treba vam beton u {city.name}?</h3>
              <p className="mt-2 text-sm text-gray-200">
                Pozovite {company.phone} za brzu potvrdu termina i logistike.
              </p>
            </div>
            <Link
              href="tel:+381605887471"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)]"
            >
              Pozovi odmah
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        id="beton-city-breadcrumbs"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Beton", item: `${SITE_URL}/beton` },
            { "@type": "ListItem", position: 3, name: city.name, item: `${SITE_URL}/beton/grad/${city.slug}` },
          ],
        }}
      />
      <JsonLd
        id="beton-city-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Isporuka betona ${city.name}`,
          serviceType: "Gotov beton, beton pumpa i visinske pumpe",
          provider: { "@id": `${SITE_URL}#organization` },
          areaServed: [city.name, ...(isNis ? ["Pantelej", "Palilula", "Medijana"] : [])],
          url: `${SITE_URL}/beton/grad/${city.slug}`,
        }}
      />
      <JsonLd
        id="beton-city-faq-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: localFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </div>
  );
}
