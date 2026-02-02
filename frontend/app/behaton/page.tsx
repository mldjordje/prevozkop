import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import TiltCard from "@/components/motion/tilt-card";
import {
  behatonBenefits,
  behatonCities,
  behatonFaq,
  behatonProcess,
  behatonUseCases,
  behatonHighlights,
} from "@/content/behaton";
import { company } from "@/content/site";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Behaton Nis - prodaja, isporuka i ugradnja | Prevozkop",
  description:
    "Behaton Nis i jug Srbije: prodaja, isporuka i ugradnja behaton kocki i ploca u Nisu, Leskovcu, Prokuplju, Aleksincu i okolini.",
  alternates: { canonical: "/behaton" },
  keywords: [
    "behaton",
    "behaton nis",
    "behaton leskovac",
    "behaton prokuplje",
    "behaton aleksinac",
    "behaton jug srbije",
    "behaton kocke",
    "behaton ploce",
    "ugradnja behatona",
    "behaton dvoriste",
  ],
};

const behatonGallery = [
  { src: "/img/behaton/SLI_4651.JPG", alt: "Behaton projekat - dvoriste" },
  { src: "/img/behaton/SLI_4906.JPG", alt: "Behaton projekat - prilaz" },
  { src: "/img/behaton/SLI_4930.JPG", alt: "Behaton projekat - parking" },
  { src: "/img/behaton/SLI_4939.JPG", alt: "Behaton projekat - staze" },
  { src: "/img/behaton/SLI_4975.JPG", alt: "Behaton ploce - izlozeni dezen" },
];

async function fetchProductsDirect(limit: number) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
  const res = await fetch(`${API_BASE}/products?limit=${limit}&offset=0`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: Product[] };
  return data.data || [];
}

export default async function BehatonPage() {
  let products: Product[] = [];

  try {
    const res = await fetchProductsDirect(100);
    products = res.filter((item) => item.category?.trim().toLowerCase() === "behaton");
  } catch (error) {
    console.error("Neuspelo ucitavanje behaton proizvoda:", error);
  }

  const productOptions = products.map((product) => product.name);

  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Behaton Nis - prodaja i ugradnja behatona"
        kicker="Behaton Pro"
        description="Konkretne ponude za behaton kocke i ploce, uz savet oko izbora modela, pripreme podloge i dogovor oko isporuke i ugradnje."
        background="/img/napolje5.webp"
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
              Ponuda za behaton
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Behaton ponuda prilagodjena vasem projektu
            </h2>
            <p className="text-sm text-gray-700">
              Dobijate jasnu preporuku za model, debljinu i namenu behatona, kao i smernice za
              pripremu podloge, rokove i logistiku isporuke.
            </p>
          </ScrollReveal>
          <StaggerReveal className="grid gap-3">
            {behatonHighlights.map((item) => (
              <ScrollReveal key={item} from="up">
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-dark shadow-sm">
                  {item}
                </div>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="content-section space-y-6" id="ponuda">
        <div className="flex flex-col gap-2">
          <ScrollReveal>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Ponuda
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Modeli behatona koji se najcesce traze
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="max-w-3xl text-sm text-gray-700">
              Izaberite model behatona prema nameni, opterecenju i vizuelnom stilu. Svaki model ima
              svoju detaljnu stranicu sa specifikacijama i preporukama.
            </p>
          </ScrollReveal>
        </div>

        {products.length === 0 ? (
          <ScrollReveal>
            <p className="text-sm text-gray-600">
              Trenutno nema objavljenih behaton proizvoda. Pozovite nas za preporuku.
            </p>
          </ScrollReveal>
        ) : (
          <StaggerReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ScrollReveal key={product.id} from="up" className="h-full">
                <Link
                  href={`/behaton/${product.slug}`}
                  className="group block h-full"
                  aria-label={`Detalji i upit za ${product.name}`}
                >
                  <TiltCard className="h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={product.image || "/img/napolje1.webp"}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex h-full flex-col gap-3 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary">
                        {product.product_type || "Behaton"}
                      </p>
                      <h3 className="text-lg font-semibold text-dark">{product.name}</h3>
                      {product.short_description && (
                        <p className="text-sm text-gray-700">{product.short_description}</p>
                      )}
                      <div className="flex-1" />
                      <span className="inline-flex w-fit items-center text-sm font-semibold text-primary">
                        Detalji i upit {"->"}
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        )}
      </section>

      <section className="content-section space-y-6" id="forma">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Upit
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Posaljite upit za behaton</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite povrsinu, namenu i grad. Dobicete odgovor sa preporukom i sledecim koracima.
          </p>
        </div>
        <ContactForm
          defaultSubject="Behaton - upit"
          subjectPlaceholder="Behaton za dvoriste, parking..."
          selectLabel="Model behatona (opciono)"
          selectPlaceholder="Izaberite model behatona"
          selectOptions={productOptions}
          showQuantity
          quantityLabel="Kolicina behatona (opciono)"
          quantityPlaceholder="npr. 120"
          quantityUnitLabel="Jedinica"
          quantityUnits={["m2", "m3", "kom", "paleta"]}
        />
      </section>

      <section className="content-section space-y-6" id="projekti">
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Galerija
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Izvodjeni behaton projekti i detalji
            </h2>
            <p className="max-w-3xl text-sm text-gray-700">
              Pogledajte deo realizovanih behaton povrsina i prikaz izlozenih ploca.
            </p>
          </div>
        </ScrollReveal>
        <StaggerReveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {behatonGallery.map((item) => (
            <ScrollReveal key={item.src} from="up">
              <div className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-lg">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      <section className="content-section space-y-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Prednosti
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Zasto behaton</h2>
            <p className="text-sm text-gray-700">
              Behaton obezbedjuje trajnost, lakse odrzavanje i uredjen izgled povrsina. Pravilna
              ugradnja podloge i odabir modela cini razliku.
            </p>
          </ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2">
            {behatonBenefits.map((benefit) => (
              <ScrollReveal key={benefit} from="up">
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-4 text-sm font-semibold text-dark shadow-sm">
                  {benefit}
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
              Gde se najcesce ugradjuje behaton
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

      <section className="content-section space-y-6" id="lokacije">
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Lokacije
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Behaton za Nis, Leskovac i jug Srbije
            </h2>
            <p className="max-w-3xl text-sm text-gray-700">
              Radimo prodaju i ugradnju behatona u Nisu, Leskovcu, Prokuplju, Aleksincu i okolini,
              uz preciznu procenu i dogovor oko termina.
            </p>
          </div>
        </ScrollReveal>
        <StaggerReveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {behatonCities.map((city) => (
            <ScrollReveal key={city.slug} from="up">
              <Link
                href={`/behaton/grad/${city.slug}`}
                className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold text-dark">{city.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{city.intro}</p>
                <span className="mt-4 text-sm font-semibold text-primary">
                  Lokalna ponuda {"->"}
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      <section className="content-section">
        <div className="grid gap-6 rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-xl sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Proces
            </span>
            <h3 className="text-2xl font-bold text-dark sm:text-3xl">Kako izgleda saradnja</h3>
            <p className="text-sm text-gray-700">
              Brzo definisemo namenu, pripremu i logistiku isporuke. Cilj je da imate precizan plan
              pre pocetka radova.
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
        <div className="grid gap-8 rounded-3xl border border-black/5 bg-dark px-6 py-10 text-white shadow-2xl sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Brza ponuda
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Potrebna vam je cena za behaton ili ugradnju?
            </h2>
            <p className="text-sm text-gray-200">
              Pozovite nas ili posaljite upit. Dobicete preporuku modela, logistike i okvirne
              rokove.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="tel:+381605887471"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
              >
                Pozovi {company.phone}
              </Link>
              <Link
                href="#forma"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
              >
                Posalji upit
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <ul className="space-y-3 text-sm text-gray-200">
              <li>- Behaton kocke i ploce za sve tipove povrsina</li>
              <li>- Saveti oko podloge i nivelacije terena</li>
              <li>- Lokalna isporuka i dogovor termina</li>
              <li>- Brza preporuka modela i okvirna kalkulacija</li>
            </ul>
          </div>
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

      <Script id="behaton-faq-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: behatonFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        })}
      </Script>

      <Script id="behaton-service-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Behaton ploce i kocke - prodaja i ugradnja",
          serviceType: "Behaton ploce i kocke",
          provider: {
            "@type": "LocalBusiness",
            name: company.name,
            telephone: company.phone,
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
            areaServed: [
              "Nis",
              "Leskovac",
              "Prokuplje",
              "Aleksinac",
              "Juzna Srbija",
            ],
          },
          areaServed: [
            "Nis",
            "Leskovac",
            "Prokuplje",
            "Aleksinac",
            "Juzna Srbija",
          ],
        })}
      </Script>
      <FloatingCta
        phone={company.phone}
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me ponuda za behaton ploce."
      />
    </div>
  );
}
