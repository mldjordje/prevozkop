import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/json-ld";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import QuickInquiryButton from "@/components/quick-inquiry-button";
import SplitText from "@/components/motion/split-text";
import { ParallaxImage, ScrollFillText, VelocityMarquee } from "@/components/motion/scroll-effects";
import BehatonCatalog from "@/components/behaton/catalog";
import { sortBehatonProducts, toCatalogItem } from "@/components/behaton/catalog-utils";
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
import { getProductSelectLabel } from "@/lib/products";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Behaton Srbija - cena, prodaja, isporuka i ugradnja",
  description:
    "Behaton za dvorišta, prilaze, parkinge i poslovne površine širom Srbije: preporuka modela, procena količine, isporuka i ugradnja.",
  path: "/behaton",
  image: "/img/behaton/optimized/SLI_4930.webp",
  keywords: [
    "behaton",
    "behaton srbija",
    "behaton nis",
    "behaton beograd",
    "behaton novi sad",
    "behaton kragujevac",
    "cena behaton",
    "prodaja behatona",
    "ugradnja behatona",
    "behaton kocke srbija",
    "behaton ploce srbija",
    "behaton kocke",
    "behaton ploce",
    "behaton dvoriste",
  ],
  languages: srEnLanguages("/behaton", "/en"),
});

const behatonGallery = [
  { src: "/img/behaton/optimized/SLI_4930.webp", alt: "Behaton projekat - parking" },
  { src: "/img/behaton/optimized/SLI_4651.webp", alt: "Behaton projekat - dvoriste" },
  { src: "/img/behaton/optimized/SLI_4906.webp", alt: "Behaton projekat - prilaz" },
  { src: "/img/behaton/optimized/SLI_4939.webp", alt: "Behaton projekat - staze" },
  { src: "/img/behaton/optimized/SLI_4975.webp", alt: "Behaton ploce - izlozeni dezen" },
];

const featuredSeoLinks = [
  { href: "/behaton", label: "Behaton Srbija" },
  { href: "/behaton/grad/nis", label: "Behaton Niš" },
  { href: "/behaton/grad/beograd", label: "Behaton Beograd" },
  { href: "/behaton/grad/novi-sad", label: "Behaton Novi Sad" },
  { href: "/kontakt", label: "Kontakt za behaton" },
];

export default async function BehatonPage() {
  let products: Product[] = [];

  try {
    const res = await getProducts({ category: "behaton", limit: 120, offset: 0 });
    products = sortBehatonProducts(
      (res.data || []).filter((item) => item.category?.trim().toLowerCase() === "behaton"),
    );
  } catch (error) {
    console.error("Neuspelo učitavanje behaton proizvoda:", error);
  }

  const catalog = products.map(toCatalogItem);
  const thicknesses = Array.from(new Set(catalog.map((c) => c.thickness).filter(Boolean))) as number[];
  const productOptions = Array.from(new Set(products.map((product) => getProductSelectLabel(product))));

  return (
    <div className="bg-cement">
      {/* ── Catalog-first header ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink pb-16 pt-[calc(var(--nav-h)+1.5rem)] text-white sm:pb-24 sm:pt-[calc(var(--nav-h)+4rem)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[140px]" />

        <div className="content-section relative">
          <h1 className="sr-only">Behaton Srbija - katalog, prodaja i ugradnja behatona</h1>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="section-label mb-5">Behaton Pro · Katalog modela</p>
              <SplitText
                as="p"
                trigger="ready"
                delay={0.1}
                className="display-xl text-[17vw] sm:text-[13vw] lg:text-[9.5vw]"
                lines={[{ text: "Katalog" }, { text: "behatona", className: "text-primary" }]}
              />
            </div>
            <div className="space-y-6 lg:pb-3">
              <p className="max-w-md font-body text-[15px] leading-relaxed text-white/70 sm:text-lg">
                Behaton kocke i ploče za dvorišta, prilaze, parkinge i staze — sa preporukom modela,
                procenom količine, isporukom i ugradnjom širom Srbije.
              </p>
              <dl className="hidden grid-cols-3 border-y border-white/10 py-4 sm:grid">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Modela</dt>
                  <dd className="mt-1 font-display text-4xl font-black [font-stretch:62%]">{catalog.length || "—"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Debljine</dt>
                  <dd className="mt-1 font-display text-4xl font-black [font-stretch:62%]">
                    {thicknesses.length ? `${Math.min(...thicknesses)}–${Math.max(...thicknesses)}` : "6–10"}
                    <span className="ml-1 text-lg text-white/50">cm</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Isporuka</dt>
                  <dd className="mt-1 font-display text-4xl font-black [font-stretch:62%]">Srbija</dd>
                </div>
              </dl>
            </div>
          </div>

          <div id="ponuda" className="mt-10 scroll-mt-24 sm:mt-14">
            <BehatonCatalog items={catalog} />
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:p-8">
            <p className="max-w-xl font-display text-2xl font-extrabold uppercase leading-[0.95] [font-stretch:66%] sm:text-3xl">
              Niste sigurni koji model? <span className="text-primary">Preporučićemo vam za 5 minuta.</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <QuickInquiryButton service="behaton" origin="behaton_catalog_cta" label="Pošalji upit" className="btn-primary !text-sm" />
              <a href="tel:+381605887471" className="btn-outline-white">
                Pozovi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────── */}
      <div className="border-y border-ink/10 bg-primary py-4 text-ink">
        <VelocityMarquee baseVelocity={-1.6}>
          {["Dvorišta", "Prilazi", "Parkinzi", "Staze", "Trotoari", "Poslovni objekti"].map((w) => (
            <span key={w} className="marquee-item font-display text-4xl font-black uppercase [font-stretch:62%] sm:text-6xl">
              {w}
              <span className="mx-4 inline-block h-3 w-3 rotate-45 bg-ink sm:h-4 sm:w-4" />
            </span>
          ))}
        </VelocityMarquee>
      </div>

      {/* ── Manifesto ──────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-36">
        <p className="section-label mb-8">Ponuda za behaton</p>
        <ScrollFillText
          as="h2"
          className="max-w-6xl font-display text-[2.6rem] font-extrabold uppercase leading-[0.95] text-ink [font-stretch:66%] sm:text-7xl lg:text-[6.2rem]"
          text="Behaton ponuda prilagođena vašem projektu — model, debljina i namena, uz jasan plan podloge, rokova i isporuke."
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {behatonHighlights.map((item, i) => (
            <li key={item} className="flex min-h-[150px] flex-col justify-between gap-6 bg-paper p-6">
              <span className="font-mono text-[11px] tracking-[0.2em] text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-body text-[17px] font-medium leading-snug text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Gallery ────────────────────────────────────────── */}
      <section id="projekti" className="bg-ink py-20 text-white sm:py-28">
        <div className="content-section">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 md:flex-row md:items-end">
            <SplitText
              className="display-xl text-[15vw] sm:text-[10vw] lg:text-[7.5vw]"
              lines={[{ text: "Ugrađeno." }, { text: "Izvedeno.", className: "text-outline text-white" }]}
            />
            <p className="max-w-sm font-body text-base text-white/60">
              Izvođeni behaton projekti i detalji — deo realizovanih površina i prikaz izloženih ploča.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-12">
            <ParallaxImage
              src={behatonGallery[0].src}
              alt={behatonGallery[0].alt}
              unoptimized
              sizes="100vw"
              className="aspect-[4/5] rounded-[22px] sm:aspect-[16/9] md:col-span-12"
            />
            {behatonGallery.slice(1).map((item, i) => (
              <ParallaxImage
                key={item.src}
                src={item.src}
                alt={item.alt}
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                strength={8}
                className={
                  i % 3 === 0
                    ? "aspect-[4/5] rounded-[22px] md:col-span-7 md:aspect-[4/3]"
                    : "aspect-[4/5] rounded-[22px] md:col-span-5 md:aspect-auto"
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits + use cases ───────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label mb-5">Prednosti</p>
            <SplitText
              className="font-display text-6xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-8xl"
              lines={["Zašto", "behaton"]}
            />
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
              Behaton obezbeđuje trajnost, lakše održavanje i uređen izgled površina. Pravilna
              ugradnja podloge i odabir modela čini razliku.
            </p>
          </div>
          <div>
            <ul className="border-t border-ink/15">
              {behatonBenefits.map((benefit, i) => (
                <li key={benefit} className="group flex items-baseline gap-6 border-b border-ink/15 py-6">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-3xl font-extrabold uppercase leading-none text-ink transition-transform duration-500 [font-stretch:66%] group-hover:translate-x-2 sm:text-4xl">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
            <h2 className="mb-6 mt-16 font-display text-4xl font-black uppercase text-ink [font-stretch:62%] sm:text-5xl">
              Gde se najčešće ugrađuje behaton
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {behatonUseCases.map((item) => (
                <div key={item.title} className="rounded-[20px] bg-paper p-6 ring-1 ring-ink/10">
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-none text-ink [font-stretch:66%]">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ────────────────────────────────────────── */}
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <p className="section-label mb-5">Proces</p>
          <SplitText
            className="display-xl text-[14vw] sm:text-[9vw] lg:text-[6.5vw]"
            lines={["Kako izgleda", "saradnja"]}
          />
          <p className="mt-6 max-w-xl font-body text-base text-white/60">
            Brzo definišemo namenu, pripremu i logistiku isporuke. Cilj je da imate precizan plan
            pre početka radova.
          </p>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[24px] bg-white/10 md:grid-cols-3">
            {behatonProcess.map((step, idx) => (
              <li key={step.title} className="group relative bg-ink p-7 transition-colors duration-500 hover:bg-[#1a1916] sm:p-9">
                <span className="block font-display text-[6.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(244,161,0,0.7)] [font-stretch:62%] transition-colors duration-500 group-hover:text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-3xl font-extrabold uppercase leading-none [font-stretch:66%]">
                  {step.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-white/60">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Cities ─────────────────────────────────────────── */}
      <section id="lokacije" className="content-section scroll-mt-24 py-24 sm:py-32">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="section-label mb-5">Lokacije</p>
            <h2 className="font-display text-5xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-7xl">
              Behaton za gradove širom Srbije
            </h2>
          </div>
          <p className="max-w-lg font-body text-base leading-relaxed text-muted">
            Radimo prodaju i ugradnju behatona u Beogradu, Novom Sadu, Nišu, Kragujevcu, Subotici,
            Valjevu, Čačku i drugim gradovima, uz preciznu procenu i dogovor oko termina.
          </p>
        </div>
        <ul className="grid grid-cols-2 border-t border-ink/15 sm:grid-cols-3 lg:grid-cols-4">
          {behatonCities.map((city) => (
            <li key={city.slug} className="border-b border-ink/15">
              <Link
                href={`/behaton/grad/${city.slug}`}
                className="group flex items-center justify-between gap-2 py-4 pr-4 font-body text-[15px] font-medium text-ink transition-colors hover:text-primary sm:text-base"
                title={city.intro}
              >
                <span>Behaton {city.name}</span>
                <span className="translate-x-[-6px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Niš + key links */}
        <div className="mt-16 grid gap-8 overflow-hidden rounded-[28px] bg-paper p-7 ring-1 ring-ink/10 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="section-label mb-4">Behaton Niš</p>
            <h2 className="font-display text-4xl font-black uppercase leading-[0.92] text-ink [font-stretch:62%] sm:text-5xl">
              Behaton Niš kao jak lokalni signal uz glavni fokus na Srbiju
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed text-muted">
              Pored glavnog fokusa na upit behaton Srbija, ova stranica podržava i lokalne pretrage
              kao što su behaton Niš, cena behatona u Nišu i ugradnja behatona u Nišu kroz interne
              linkove, lokalne stranice i upit za konkretan grad.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/behaton/grad/nis" className="btn-primary">
                Otvori Behaton Niš
              </Link>
              <Link href="#lokacije" className="btn-outline">
                Svi gradovi
              </Link>
            </div>
          </div>
          <div className="space-y-5">
            <ul className="space-y-2.5 font-body text-sm text-ink/80">
              <li>— Behaton Niš cena i preporuka modela</li>
              <li>— Behaton Niš prodaja i isporuka po dogovoru</li>
              <li>— Ugradnja behatona u Nišu i okolini</li>
              <li>— Nacionalna ponuda za gradove širom Srbije</li>
            </ul>
            <div>
              <h3 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
                Glavne stranice za behaton
              </h3>
              <div className="flex flex-wrap gap-2">
                {featuredSeoLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-ink/15 px-4 py-2 font-body text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inquiry form ───────────────────────────────────── */}
      <section id="forma" className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
        <div className="content-section grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label mb-5">Upit</p>
            <SplitText
              className="display-xl text-[14vw] sm:text-[9vw] lg:text-[5.8vw]"
              lines={[{ text: "Pošaljite upit" }, { text: "za behaton", className: "text-primary" }]}
            />
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60">
              Navedite površinu, namenu i grad. Dobićete odgovor sa preporukom, logistikom i
              sledećim koracima.
            </p>
            <div className="mt-8 space-y-2 font-mono text-[12px] uppercase tracking-[0.16em] text-white/50">
              <a href="tel:+381605887471" className="block text-2xl tracking-normal text-white hover:text-primary">
                {company.phone}
              </a>
              <p>{company.workingHours}</p>
            </div>
          </div>
          <div className="rounded-[28px] bg-paper p-5 text-ink sm:p-8">
            <ContactForm
              defaultSubject="Behaton - upit"
              subjectPlaceholder="Behaton za dvorište, parking..."
              selectLabel="Model behatona (opciono)"
              selectPlaceholder="Izaberite model behatona"
              selectOptions={productOptions}
              showQuantity
              quantityLabel="Količina behatona (opciono)"
              quantityPlaceholder="npr. 120"
              quantityUnitLabel="Jedinica"
              quantityUnits={["m2", "m3", "kom", "paleta"]}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-5">FAQ</p>
            <h2 className="font-display text-6xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Česta pitanja
            </h2>
          </div>
          <div className="border-t border-ink/15">
            {behatonFaq.map((item) => (
              <details key={item.q} className="group border-b border-ink/15">
                <summary className="flex items-center justify-between gap-6 py-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-[1] text-ink [font-stretch:70%] sm:text-3xl">
                    {item.q}
                  </h3>
                  <span className="faq-icon grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/20 text-xl transition-transform duration-500">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 font-body text-base leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        id="behaton-faq-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: behatonFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />

      <JsonLd
        id="behaton-service-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Behaton ploče i kocke - prodaja i ugradnja",
          serviceType: "Behaton ploče i kocke",
          provider: { "@id": `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs"}#organization` },
          areaServed: [
            "Srbija",
            "Beograd",
            "Novi Sad",
            "Niš",
            "Kragujevac",
            "Subotica",
            "Valjevo",
            "Leskovac",
          ],
        }}
      />
      {products.length > 0 && (
        <JsonLd
          id="behaton-product-itemlist-jsonld"
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: products.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs"}/behaton/${item.slug}`,
            })),
          }}
        />
      )}
      <FloatingCta
        phone={company.phone}
        quickService="behaton"
        formLabel="Brzi upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me ponuda za behaton ploče."
      />
    </div>
  );
}
