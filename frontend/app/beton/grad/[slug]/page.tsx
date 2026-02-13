import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import { betonCities } from "@/content/behaton";
import { company } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

type PageProps = {
  params: { slug: string };
};

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
  const city = betonCities.find((item) => item.slug === params.slug);
  if (!city) {
    return buildMetadata({
      title: "Isporuka betona po gradu | Prevozkop",
      description: "Lokalna isporuka gotovog betona i pumpe za beton.",
      path: "/porucivanje-betona",
      image: "/img/kamionislika2.webp",
      languages: srEnLanguages("/porucivanje-betona", "/en/order-concrete"),
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

export default function BetonCityPage({ params }: PageProps) {
  const city = betonCities.find((item) => item.slug === params.slug);
  if (!city) notFound();

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
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Cesta pitanja</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {betonFaq.map((item) => (
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

      <Script id="beton-city-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Porucivanje betona", item: `${SITE_URL}/porucivanje-betona` },
            { "@type": "ListItem", position: 3, name: city.name, item: `${SITE_URL}/beton/grad/${city.slug}` },
          ],
        })}
      </Script>
    </div>
  );
}
