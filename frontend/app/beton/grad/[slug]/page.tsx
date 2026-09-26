import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import JsonLd from "@/components/json-ld";
import ContactForm from "@/components/contact-form";
import { ConcreteCalculator } from "@/components/beton/concrete-tools";
import {
  ChipLinks,
  CityIndex,
  CtaBand,
  FaqList,
  FormSection,
  MarqueeBand,
  NumberedCards,
  RuleList,
  SectionHead,
} from "@/components/sections";
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
    q: "Kako da poručim beton u svom gradu?",
    a: "Pošaljite upit sa količinom, lokacijom i terminom, a nas tim potvrđuje raspoloživost i logistiku.",
  },
  {
    q: "Da li je dostupna pumpa za beton?",
    a: "Da. Po potrebi šaljemo pumpu ili visinsku pumpu kada je prilaz otežan ili je betoniranje na visini.",
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
      title: "Isporuka betona Niš - gotov beton, pumpa i termin",
      description:
        "Isporuka gotovog betona u Nišu uz miksere, beton pumpu, visinske pumpe i podršku na gradilištu.",
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
          q: "Kako ide isporuka betona u Nišu?",
          a: "Prvo proveravamo lokaciju, prilaz, količinu i termin, a zatim organizujemo mikser i po potrebi beton pumpu ili visinsku pumpu.",
        },
        {
          q: "Da li šaljete beton pumpu za Niš i okolna naselja?",
          a: "Da. Beton pumpu šaljemo kada je potreban duži doseg, istovar preko ograde ili rad na visini i nepristupačnim pozicijama.",
        },
        {
          q: "Da li radite i pripremu terena pre betoniranja u Nišu?",
          a: "Da. Po dogovoru radimo zemljane radove, tamponiranje i pripremu pristupa za mikser i pumpu.",
        },
      ]
    : betonFaq;
  const relatedLinks = isNis
    ? [
        { href: "/porucivanje-betona", label: "Poručivanje betona" },
        { href: "/usluge", label: "Sve usluge" },
        { href: "/behaton/grad/nis", label: "Behaton Niš" },
        { href: "/kontakt", label: "Kontakt i hitan upit" },
      ]
    : [
        { href: "/porucivanje-betona", label: "Poručivanje betona" },
        { href: "/usluge", label: "Sve usluge" },
      ];

  return (
    <div className="bg-cement">
      <PageHero
        title={`Isporuka betona ${city.name}`}
        kicker="Lokalna beton logistika"
        description={city.intro}
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Pošalji upit", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-label mb-5">Beton i pumpa</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Isporuka i beton pumpa za <span className="text-primary">{city.name}</span>
            </h2>
            <p className="mt-6 max-w-lg font-body text-base leading-relaxed text-muted">
              Radimo isporuku gotovog betona, obezbeđujemo pumpu i organizujemo teren da betoniranje
              ide bez zastoja.
            </p>
          </div>
          <RuleList items={city.focus} big />
        </div>
      </section>

      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Kako radimo"
            lines={["Od poziva", { text: "do betoniranja", className: "text-primary" }]}
          />
          <NumberedCards
            items={[
              { title: "Brza procena", text: "Na osnovu lokacije i količine predlažemo vozila i termin." },
              { title: "Tačan dolazak", text: "Organizujemo dolazak miksera i pumpe prema dinamici gradilišta." },
              { title: "Podrška na terenu", text: "Po potrebi radimo pripremu terena i koordinaciju istovara." },
            ]}
          />
        </div>
      </section>

      <FormSection
        lines={["Upit za beton", { text: `u ${city.name}`, className: "text-primary" }]}
        text="Navedite količinu, klasu i termin. Potvrđujemo raspoloživost i logistiku."
      >
        <ContactForm
          defaultSubject={`Beton ${city.name} - upit`}
          subjectPlaceholder={`Beton i pumpa za ${city.name}`}
          showQuantity
          quantityLabel="Količina betona (opciono)"
          quantityPlaceholder="npr. 20"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m3", "m2"]}
        />
      </FormSection>

      <MarqueeBand words={localAreas} />

      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Kalkulator"
          lines={["Koliko betona", { text: `za ${city.name}?`, className: "text-outline" }]}
          text={
            isNis
              ? "Najčešće radimo temelje, ploče, privatne kuće, manje stambene objekte i komercijalna betoniranja širom Niša."
              : `Najčešće radimo isporuku betona za temelje, ploče i gradilišta u ${city.name}.`
          }
          aside={<ChipLinks links={relatedLinks} />}
        />
        <ConcreteCalculator />
      </section>

      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section">
          <FaqList items={localFaq} />
        </div>
      </section>

      <section className="content-section py-24 sm:py-32">
        <SectionHead label="Ostali gradovi" lines={["Beton", "po gradovima"]} size="md" />
        <CityIndex cities={betonCities} hrefBase="/beton/grad" prefix="Beton" current={city.slug} />
      </section>

      <CtaBand
        lines={[`Treba vam beton`, { text: `u ${city.name}?`, className: "text-primary" }]}
        text={`Pozovite ${company.phone} za brzu potvrdu termina i logistike.`}
        image="/img/mikseri.webp"
      >
        <a href="tel:+381605887471" className="btn-primary">
          Pozovi odmah
        </a>
      </CtaBand>

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
