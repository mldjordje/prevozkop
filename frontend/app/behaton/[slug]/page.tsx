import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import { behatonBenefits, behatonCities, behatonFaq, behatonProcess } from "@/content/behaton";
import { company } from "@/content/site";
import { getProduct, getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";

export const revalidate = 300;

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    return {
      title: `${product.name} | Behaton`,
      description:
        product.short_description ||
        product.description ||
        "Detalji o behaton proizvodu i preporuke za ugradnju.",
      alternates: { canonical: `/behaton/${product.slug}` },
    };
  } catch {
    return {
      title: "Behaton proizvod",
      description: "Detalji o behaton proizvodu i ponudi.",
      alternates: { canonical: "/behaton" },
    };
  }
}

export default async function BehatonProductPage({ params }: PageProps) {
  let product: Product | null = null;

  try {
    product = await getProduct(params.slug);
  } catch {
    product = null;
  }

  if (!product) {
    notFound();
  }

  let related: Product[] = [];
  try {
    const res = await getProducts({ category: "behaton", limit: 20, offset: 0 });
    related = (res.data || []).filter((item) => item.slug !== product!.slug).slice(0, 3);
  } catch {
    related = [];
  }

  const productOptions = [product.name, ...related.map((item) => item.name)];
  const specsValue = product.specs || null;
  const specsEntries = specsValue && !Array.isArray(specsValue) ? Object.entries(specsValue) : [];
  const specsList = Array.isArray(specsValue) ? specsValue : [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";

  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title={product.name}
        kicker={product.product_type || "Behaton"}
        description={product.short_description || undefined}
        background={product.image || "/img/napolje1.webp"}
        priority
        actions={[
          { label: "Pozovi odmah", href: "tel:+381605887471" },
          { label: "Posalji upit", href: "#forma" },
        ]}
      />

      <section className="content-section space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal className="space-y-4">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Detalji
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">{product.name}</h2>
            {product.description && <p className="text-sm text-gray-700">{product.description}</p>}
            {product.applications && (
              <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 text-sm text-gray-700 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Primena
                </p>
                <p className="mt-2">{product.applications}</p>
              </div>
            )}
          </ScrollReveal>
          <ScrollReveal className="space-y-3" from="right">
            <div className="rounded-3xl border border-black/5 bg-white px-6 py-6 shadow-lg">
              <h3 className="text-xl font-bold text-dark">Specifikacije</h3>
              {specsEntries.length === 0 && specsList.length === 0 ? (
                <p className="mt-3 text-sm text-gray-600">
                  Specifikacije ce biti dostavljene na upit.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 text-sm text-gray-700">
                  {specsEntries.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-dark">{label}</span>
                      <span className="text-gray-600">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </div>
                  ))}
                  {specsList.map((item, idx) => (
                    <div key={`${item}-${idx}`} className="rounded-xl border border-black/5 bg-gray-50 px-3 py-2">
                      {String(item)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="content-section space-y-6">
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Prednosti
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Zasto ovaj behaton</h2>
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

      <section className="content-section">
        <div className="grid gap-6 rounded-3xl border border-black/5 bg-white px-6 py-10 shadow-xl sm:px-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal className="space-y-3">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Proces
            </span>
            <h3 className="text-2xl font-bold text-dark sm:text-3xl">Kako ide ugradnja</h3>
            <p className="text-sm text-gray-700">
              Od izbora modela do zavrsnih radova, pratimo jasne korake da bi povrsina ostala stabilna.
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
              Brzi dogovor
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Zelite ponudu za {product.name}?
            </h2>
            <p className="text-sm text-gray-200">
              Posaljite upit ili pozovite. Dobicete savet oko podloge, isporuke i ugradnje.
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
              <li>- Preporuka modela i dimenzija</li>
              <li>- Priprema podloge i nivelacija</li>
              <li>- Organizacija isporuke</li>
              <li>- Brza reakcija na upite</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section space-y-6" id="forma">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Upit
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Posaljite upit za {product.name}</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite grad, povrsinu i planirani rok. Javljamo se sa predlogom i cenom.
          </p>
        </div>
        <ContactForm
          defaultSubject={`Behaton - ${product.name}`}
          defaultSelectValue={product.name}
          selectLabel="Model behatona (opciono)"
          selectPlaceholder="Izaberite model behatona"
          selectOptions={productOptions}
        />
      </section>

      {related.length > 0 && (
        <section className="content-section space-y-6">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Slicni modeli</h2>
          </ScrollReveal>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/behaton/${item.slug}`}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {item.product_type || "Behaton"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-dark">{item.name}</h3>
                {item.short_description && (
                  <p className="mt-2 text-sm text-gray-600">{item.short_description}</p>
                )}
                <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                  Detalji {"->"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="content-section space-y-6">
        <ScrollReveal>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Lokacije
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Lokalne ponude po gradu</h2>
          </div>
        </ScrollReveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {behatonCities.map((city) => (
            <Link
              key={city.slug}
              href={`/behaton/grad/${city.slug}`}
              className="rounded-2xl border border-black/5 bg-white p-5 text-sm shadow-sm transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-dark">{city.name}</h3>
              <p className="mt-2 text-gray-600">{city.intro}</p>
              <span className="mt-4 inline-flex font-semibold text-primary">
                Lokalna ponuda {"->"}
              </span>
            </Link>
          ))}
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

      <Script id="behaton-product-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.short_description || product.description || undefined,
          image: product.image ? [product.image] : undefined,
          brand: { "@type": "Brand", name: company.name },
          category: product.category,
          additionalProperty: specsEntries.map(([label, value]) => ({
            "@type": "PropertyValue",
            name: label,
            value: Array.isArray(value) ? value.join(", ") : String(value),
          })),
        })}
      </Script>
      <Script id="behaton-product-breadcrumbs" type="application/ld+json">
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
              name: product.name,
              item: `${siteUrl}/behaton/${product.slug}`,
            },
          ],
        })}
      </Script>
    </div>
  );
}
