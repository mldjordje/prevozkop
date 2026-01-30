import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import {
  behatonBenefits,
  behatonCities,
  behatonFaq,
  behatonProcess,
  behatonUseCases,
} from "@/content/behaton";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

export const revalidate = 300;

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = behatonCities.find((item) => item.slug === params.slug);
  if (!city) {
    return {
      title: "Behaton lokalna ponuda",
      description: "Lokalne behaton ponude i ugradnja.",
      alternates: { canonical: "/behaton" },
    };
  }

  return {
    title: `Behaton ${city.name} - prodaja i ugradnja`,
    description: city.intro,
    alternates: { canonical: `/behaton/grad/${city.slug}` },
  };
}

export default async function BehatonCityPage({ params }: PageProps) {
  const city = behatonCities.find((item) => item.slug === params.slug);

  if (!city) {
    notFound();
  }

  let products: Product[] = [];
  try {
    const res = await getProducts({ limit: 50, offset: 0 });
    products =
      res.data?.filter((item) => item.category?.trim().toLowerCase() === "behaton") || [];
  } catch {
    products = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";

  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title={`Behaton ${city.name}`}
        kicker="Lokalna ponuda"
        description={city.intro}
        background="/img/napolje2.webp"
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
              Lokalni fokus
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Behaton resenja za {city.name}
            </h2>
            <p className="text-sm text-gray-700">
              Organizujemo isporuku i ugradnju behatona u {city.name}. Fokus je na stabilnoj podlozi,
              preciznoj nivelaciji i brzom dogovoru termina.
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
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Namena
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Najcesce behaton povrsine u {city.name}
            </h2>
          </div>
        </ScrollReveal>
        <StaggerReveal className="grid gap-6 md:grid-cols-3">
          {behatonUseCases.map((item) => (
            <ScrollReveal key={item.title} from="up">
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-dark">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-700">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      <section className="content-section space-y-6">
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Prednosti
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Zasto investitori biraju behaton
            </h2>
          </div>
        </ScrollReveal>
        <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {behatonBenefits.map((benefit) => (
            <ScrollReveal key={benefit} from="up">
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-4 text-sm font-semibold text-dark shadow-sm">
                {benefit}
              </div>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      {products.length > 0 && (
        <section className="content-section space-y-6">
          <ScrollReveal>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Modeli
              </span>
              <h2 className="text-3xl font-bold text-dark sm:text-4xl">
                Preporuceni modeli behatona
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/behaton/${product.slug}`}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {product.product_type || "Behaton"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-dark">{product.name}</h3>
                {product.short_description && (
                  <p className="mt-2 text-sm text-gray-600">{product.short_description}</p>
                )}
                <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                  Detalji {"->"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="content-section space-y-6" id="forma">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Upit
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Posaljite upit za behaton u {city.name}
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite lokaciju, povrsinu i namenu. Dobicete odgovor sa preporukom i logistikom.
          </p>
        </div>
        <ContactForm
          defaultSubject={`Behaton ${city.name} - upit`}
          subjectPlaceholder={`Behaton za ${city.name}`}
          selectLabel="Model behatona (opciono)"
          selectPlaceholder="Izaberite model behatona"
          selectOptions={products.map((item) => item.name)}
          showQuantity
          quantityLabel="Kolicina behatona (opciono)"
          quantityPlaceholder="npr. 120"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m2", "m3", "kom", "paleta"]}
        />
      </section>

      <section className="content-section">
        <div className="grid gap-6 rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-xl sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Proces
            </span>
            <h3 className="text-2xl font-bold text-dark sm:text-3xl">Kako izgleda saradnja</h3>
            <p className="text-sm text-gray-700">
              Lokalni tim dolazi na teren, meri i priprema plan ugradnje. Termin se dogovara brzo.
            </p>
          </ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2">
            {behatonProcess.map((step, idx) => (
              <ScrollReveal key={step.title} from="up">
                <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-5 text-sm shadow-sm">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h4 className="text-base font-semibold text-dark">{step.title}</h4>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            FAQ
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Cesta pitanja</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {behatonFaq.map((item) => (
            <div key={item.q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Script id="behaton-city-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Pocetna",
              item: `${siteUrl}`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Behaton",
              item: `${siteUrl}/behaton`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: city.name,
              item: `${siteUrl}/behaton/grad/${city.slug}`,
            },
          ],
        })}
      </Script>
    </div>
  );
}
