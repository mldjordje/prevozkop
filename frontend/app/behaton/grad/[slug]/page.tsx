import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import JsonLd from "@/components/json-ld";
import BehatonCatalog from "@/components/behaton/catalog";
import { isRealBehatonProduct, toCatalogItem } from "@/components/behaton/catalog-utils";
import {
  ChipLinks,
  CityIndex,
  FaqList,
  FormSection,
  MarqueeBand,
  NumberedCards,
  RuleList,
  SectionHead,
} from "@/components/sections";
import {
  behatonBenefits,
  behatonCities,
  behatonFaq,
  behatonProcess,
  behatonUseCases,
} from "@/content/behaton";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import { getProductSelectLabel } from "@/lib/products";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

type RouteParams = { slug: string };
type PageProps = {
  params: Promise<RouteParams> | RouteParams;
};

export function generateStaticParams() {
  return behatonCities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = behatonCities.find((item) => item.slug === slug);
  if (!city) {
    return buildMetadata({
      title: "Behaton lokalna ponuda",
      description: "Lokalne behaton ponude i ugradnja.",
      path: "/behaton",
      image: "/img/behaton/optimized/SLI_4930.webp",
      languages: srEnLanguages("/behaton", "/en"),
    });
  }

  if (city.slug === "nis") {
    return buildMetadata({
      title: "Behaton Niš - prodaja, cena, isporuka i ugradnja",
      description:
        "Behaton u Nišu za dvorišta, prilaze i parkinge: prodaja, cena, preporuka modela, isporuka i ugradnja.",
      path: `/behaton/grad/${city.slug}`,
      image: "/img/behaton/optimized/SLI_4930.webp",
      languages: srEnLanguages(`/behaton/grad/${city.slug}`, "/en"),
    });
  }

  return buildMetadata({
    title: `Behaton ${city.name} - prodaja i ugradnja`,
    description: city.intro,
    path: `/behaton/grad/${city.slug}`,
    image: "/img/behaton/optimized/SLI_4930.webp",
    languages: srEnLanguages(`/behaton/grad/${city.slug}`, "/en"),
  });
}

export default async function BehatonCityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = behatonCities.find((item) => item.slug === slug);

  if (!city) {
    notFound();
  }

  let products: Product[] = [];
  try {
    const res = await getProducts({ category: "behaton", limit: 120, offset: 0 });
    products =
      res.data?.filter((item) => item.category?.trim().toLowerCase() === "behaton") || [];
  } catch {
    products = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";
  const isNis = city.slug === "nis";
  const localAreas = isNis
    ? ["Pantelej", "Palilula", "Crveni Krst", "Medijana", "Durlan", "Ledena Stena"]
    : city.focus;
  const localFaq = isNis
    ? [
        {
          q: "Da li radite behaton u Nišu za dvorišta i garažne prilaze?",
          a: "Da. U Nišu najčešće radimo privatna dvorišta, garažne prilaze, parking mesta i staze oko objekata, uz savet za podlogu i odvodnjavanje.",
        },
        {
          q: "Kako ide procena za behaton u Nišu?",
          a: "Pošaljete kvadraturu, lokaciju i namenu površine, a mi predlažemo odgovarajući model, debljinu, okvirnu količinu i logistiku isporuke.",
        },
        {
          q: "Da li organizujete i ugradnju behatona u Nišu?",
          a: "Da. Po dogovoru organizujemo i ugradnju, posebno kada je potrebna priprema podloge, nivelacija i jasna dinamika radova.",
        },
      ]
    : behatonFaq;
  const relatedLinks = isNis
    ? [
        { href: "/behaton", label: "Glavna behaton stranica" },
        { href: "/porucivanje-betona", label: "Isporuka betona Niš" },
        { href: "/beton/grad/nis", label: "Beton Niš" },
        { href: "/kontakt", label: "Kontakt i upit" },
      ]
    : [
        { href: "/behaton", label: "Glavna behaton stranica" },
        { href: "/kontakt", label: "Kontakt" },
      ];

  const catalog = products.filter(isRealBehatonProduct).map(toCatalogItem);
  const localTriplet = isNis
    ? [
        {
          title: "Behaton Niš cena",
          text: "Okvirna cena zavisi od modela, debljine, količine, boje i logistike isporuke do lokacije u Nišu.",
        },
        {
          title: "Behaton Niš prodaja",
          text: "Pomažemo pri izboru modela i količine za dvorišta, prilaze, parkinge i poslovne površine u Nišu.",
        },
        {
          title: "Behaton Niš ugradnja",
          text: "Po dogovoru organizujemo i ugradnju uz plan podloge, nivelaciju i raspored radova na terenu.",
        },
      ]
    : behatonProcess.map((step) => ({ title: step.title, text: step.description }));

  return (
    <div className="bg-cement">
      <PageHero
        title={`Behaton ${city.name}`}
        kicker="Lokalna ponuda"
        description={city.intro}
        background="/img/behaton/optimized/SLI_4930.webp"
        priority
        actions={[
          { label: "Pošalji upit", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      {/* ── Local focus ───────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="section-label mb-5">Lokalni fokus</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Behaton rešenja za <span className="text-primary">{city.name}</span>
            </h2>
            <p className="mt-6 max-w-lg font-body text-base leading-relaxed text-muted">
              Organizujemo isporuku i ugradnju behatona u {city.name}. Fokus je na stabilnoj podlozi,
              preciznoj nivelaciji i brzom dogovoru termina.
            </p>
          </div>
          <RuleList items={city.focus} big />
        </div>
      </section>

      {/* ── Catalog strip ─────────────────────────────────── */}
      {catalog.length > 0 && (
        <section className="bg-ink py-24 text-white sm:py-32">
          <div className="content-section">
            <SectionHead
              tone="dark"
              label="Modeli"
              lines={["Preporučeni", { text: "modeli behatona", className: "text-primary" }]}
              text={`Kompletan katalog je dostupan i za ${city.name} — izaberite model i pošaljite upit.`}
            />
            <BehatonCatalog items={catalog} />
          </div>
        </section>
      )}

      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label={isNis ? "Behaton Niš" : "Saradnja"}
          lines={isNis ? ["Cena, prodaja", "i ugradnja"] : ["Kako izgleda", "saradnja"]}
          text="Lokalni tim dolazi na teren, meri i priprema plan ugradnje. Termin se dogovara brzo."
        />
        <NumberedCards items={localTriplet} tone="light" />
      </section>

      <MarqueeBand words={localAreas} tone="ink" />

      {/* ── Zones + use cases ─────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Lokalne zone"
          lines={[`Gde se behaton`, { text: `traži u ${city.name}`, className: "text-outline" }]}
          text={
            isNis
              ? "Najčešći upiti iz Niša dolaze za dvorišta, prilaze i parkinge oko porodičnih kuća, manjih zgrada i poslovnih objekata."
              : `Najčešći upiti u ${city.name} dolaze za prilaze, staze, parkinge i uređenje oko objekata.`
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {behatonUseCases.map((item) => (
            <div key={item.title} className="rounded-[24px] bg-paper p-7 ring-1 ring-ink/10">
              <h3 className="font-display text-3xl font-black uppercase leading-none text-ink [font-stretch:62%]">{item.title}</h3>
              <p className="mt-3 font-body text-[15px] leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-5">Prednosti</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-6xl">
              Zašto investitori biraju behaton
            </h2>
            <div className="mt-8">
              <ChipLinks links={relatedLinks} />
            </div>
          </div>
          <RuleList items={behatonBenefits} big />
        </div>
      </section>

      <FormSection
        lines={["Upit za behaton", { text: `u ${city.name}`, className: "text-primary" }]}
        text="Navedite lokaciju, površinu i namenu. Dobićete odgovor sa preporukom i logistikom."
      >
        <ContactForm
          defaultSubject={`Behaton ${city.name} - upit`}
          subjectPlaceholder={`Behaton za ${city.name}`}
          selectLabel="Model behatona (opciono)"
          selectPlaceholder="Izaberite model behatona"
          selectOptions={products.map((item) => getProductSelectLabel(item))}
          showQuantity
          quantityLabel="Količina behatona (opciono)"
          quantityPlaceholder="npr. 120"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m2", "m3", "kom", "paleta"]}
        />
      </FormSection>

      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section">
          <FaqList items={localFaq} />
        </div>
      </section>

      <section className="content-section py-24 sm:py-32">
        <SectionHead label="Ostali gradovi" lines={["Behaton", "širom Srbije"]} size="md" />
        <CityIndex cities={behatonCities} hrefBase="/behaton/grad" prefix="Behaton" current={city.slug} />
      </section>

      <JsonLd
        id="behaton-city-breadcrumbs"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: `${siteUrl}` },
            { "@type": "ListItem", position: 2, name: "Behaton", item: `${siteUrl}/behaton` },
            {
              "@type": "ListItem",
              position: 3,
              name: city.name,
              item: `${siteUrl}/behaton/grad/${city.slug}`,
            },
          ],
        }}
      />
      <JsonLd
        id="behaton-city-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Behaton ${city.name}`,
          serviceType: "Prodaja i ugradnja behatona",
          provider: { "@id": `${siteUrl}#organization` },
          areaServed: [city.name, ...(isNis ? ["Pantelej", "Palilula", "Medijana"] : [])],
          url: `${siteUrl}/behaton/grad/${city.slug}`,
        }}
      />
      <JsonLd
        id="behaton-city-faq-jsonld"
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
