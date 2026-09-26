"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import JsonLd from "@/components/json-ld";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import QuickInquiryButton from "@/components/quick-inquiry-button";
import SplitText from "@/components/motion/split-text";
import { toCatalogItem } from "@/components/behaton/catalog-utils";
import { behatonBenefits, behatonCities, behatonFaq, behatonProcess } from "@/content/behaton";
import { company } from "@/content/site";
import type { Product } from "@/lib/api";
import { applyBehatonProductMedia } from "@/lib/behaton-media";
import { getProductSelectLabel } from "@/lib/products";

type Props = {
  slug: string;
  initialProduct: Product | null;
  initialRelated: Product[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.prevozkop.rs/api";
const ease = [0.16, 1, 0.3, 1] as const;

const isPackshotSrc = (src: string) =>
  /\.png$/i.test(src) || /removebg|packshot|studio|\/generated\//i.test(src);

export default function BehatonProductClient({ slug, initialProduct, initialRelated }: Props) {
  const [product, setProduct] = useState<Product | null>(
    initialProduct ? applyBehatonProductMedia(initialProduct) : null
  );
  const [related, setRelated] = useState<Product[]>(
    initialRelated.map((item) => applyBehatonProductMedia(item))
  );
  const [loadError, setLoadError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setProduct(initialProduct ? applyBehatonProductMedia(initialProduct) : null);
    setRelated(initialRelated.map((item) => applyBehatonProductMedia(item)));
    setLoadError(false);
    setActiveImage(0);
  }, [initialProduct, initialRelated, slug]);

  useEffect(() => {
    if (product) return;
    let canceled = false;

    async function loadProduct() {
      setLoadError(false);
      try {
        const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = applyBehatonProductMedia((await res.json()) as Product);
        if (!canceled) {
          setProduct(data);
        }
      } catch {
        if (!canceled) {
          setLoadError(true);
        }
      }
    }

    void loadProduct();
    return () => {
      canceled = true;
    };
  }, [product, slug]);

  useEffect(() => {
    if (!product || related.length > 0) return;
    let canceled = false;

    async function loadRelated() {
      try {
        const res = await fetch(`${API_BASE}/products?category=behaton&limit=60&offset=0`);
        if (!res.ok) return;
        const data = (await res.json()) as { data?: Product[] };
        const currentSlug = product?.slug;
        if (!currentSlug) return;
        const list = (data.data || [])
          .filter((item) => item.category?.trim().toLowerCase() === "behaton")
          .filter((item) => item.slug !== currentSlug)
          .map((item) => applyBehatonProductMedia(item))
          .slice(0, 3);
        if (!canceled) {
          setRelated(list);
        }
      } catch {
        // ignore
      }
    }

    void loadRelated();
    return () => {
      canceled = true;
    };
  }, [product, related.length, slug]);

  const productOptions = useMemo(() => {
    const labels = [
      ...(product ? [getProductSelectLabel(product)] : []),
      ...related.map((item) => getProductSelectLabel(item)),
    ];
    return Array.from(new Set(labels));
  }, [product, related]);

  const formProps = {
    selectLabel: "Model behatona (opciono)",
    selectPlaceholder: "Izaberite model behatona",
    selectOptions: productOptions,
    showQuantity: true,
    quantityLabel: "Količina behatona (opciono)",
    quantityPlaceholder: "npr. 120",
    quantityUnitLabel: "Jedinica",
    quantityUnits: ["m2", "m3", "kom", "paleta"],
  };

  if (!product) {
    return (
      <div className="bg-cement">
        <PageHero
          title="Behaton proizvod"
          kicker="Behaton"
          description={
            loadError
              ? "Trenutno ne možemo da učitamo detalje. Pošaljite upit i navedite model."
              : "Učitavanje detalja proizvoda."
          }
          background="/img/napolje1.webp"
          priority
          actions={[
            { label: "Pozovi odmah", href: "tel:+381605887471" },
            { label: "Pošalji upit", href: "#forma" },
          ]}
        />
        <section className="content-section py-20" id="forma">
          <ContactForm defaultSubject="Behaton - upit" subjectPlaceholder="Model, površina, rok..." {...formProps} />
        </section>
      </div>
    );
  }

  const specsValue = product.specs || null;
  const specsEntries = specsValue && !Array.isArray(specsValue) ? Object.entries(specsValue) : [];
  const specsList = Array.isArray(specsValue) ? specsValue : [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs";
  const displayTitle = product.short_description
    ? `${product.name} ${product.short_description}`
    : product.name;
  const displaySpecsEntries = [...specsEntries];
  if (
    product.short_description &&
    !displaySpecsEntries.some(([label]) => label.trim().toLowerCase() === "dimenzija")
  ) {
    displaySpecsEntries.unshift(["Dimenzija", product.short_description]);
  }

  const galleryImages = (() => {
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((item) => {
        if (item.src && !images.includes(item.src)) {
          images.push(item.src);
        }
      });
    }
    return images;
  })();

  const descriptionLines = (product.description || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const pricingRows = descriptionLines
    .filter((line) => line.includes(" - "))
    .map((line) => {
      const [label, ...rest] = line.split(" - ");
      return {
        label: label?.trim() || "",
        value: rest.join(" - ").trim(),
      };
    })
    .filter((item) => item.label && item.value);
  const detailParagraphs =
    pricingRows.length > 0
      ? descriptionLines.filter((line) => !/^cene po boji:?$/i.test(line) && !line.includes(" - "))
      : descriptionLines;
  const selectedProductOption = getProductSelectLabel(product);
  const item = toCatalogItem(product);
  const currentImage = galleryImages[activeImage] || galleryImages[0] || "/img/napolje1.webp";

  return (
    <div className="bg-cement">
      {/* ── Product hero: sticky gallery + spec sheet ─────────── */}
      <section className="bg-ink pb-20 pt-8 text-white sm:pb-28 sm:pt-12">
        <div className="content-section">
          <nav className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            <Link href="/" className="hover:text-primary">
              Početna
            </Link>
            <span>/</span>
            <Link href="/behaton" className="hover:text-primary">
              Katalog behatona
            </Link>
            <span>/</span>
            <span className="text-white/80">{item.model}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start" data-reveal-skip>
              <div
                className={clsx(
                  "relative aspect-[4/5] overflow-hidden rounded-[28px]",
                  isPackshotSrc(currentImage)
                    ? "bg-[radial-gradient(circle_at_50%_40%,#f6f4ee_0%,#d9d5cb_100%)]"
                    : "bg-dark-surface",
                )}
                data-cursor="view"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={`${displayTitle} ${activeImage + 1}`}
                    initial={{ opacity: 0, scale: 1.08, clipPath: "inset(0 0 0 100%)" }}
                    animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0 0%)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease }}
                    className={clsx(
                      "absolute inset-0 h-full w-full",
                      isPackshotSrc(currentImage) ? "object-contain p-10" : "object-cover",
                    )}
                  />
                </AnimatePresence>
                <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                  {String(activeImage + 1).padStart(2, "0")} / {String(galleryImages.length || 1).padStart(2, "0")}
                </span>
                {item.thickness && (
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                    d = {item.thickness} cm
                  </span>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1" data-lenis-prevent-wheel="">
                  {galleryImages.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      aria-label={`Slika ${idx + 1}`}
                      className={clsx(
                        "relative h-20 w-16 shrink-0 overflow-hidden rounded-xl transition-all duration-300 sm:h-24 sm:w-20",
                        idx === activeImage ? "ring-2 ring-primary" : "opacity-50 hover:opacity-100",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full bg-[#e6e2da] object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="section-label mb-5">{product.product_type || "Behaton ploča"}</p>
              <h1>
                <span className="sr-only">{displayTitle}</span>
                <SplitText
                  as="span"
                  trigger="ready"
                  lines={[{ text: item.model }]}
                  className="display-xl block text-[18vw] sm:text-[12vw] lg:text-[6.8vw]"
                />
              </h1>
              <p className="mt-4 font-mono text-[13px] uppercase tracking-[0.12em] text-primary">{item.spec}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <QuickInquiryButton
                  service="behaton"
                  product={product.name}
                  origin="behaton_product_detail"
                  label="Brzi upit za ovaj model"
                  className="btn-primary !text-sm"
                />
                <a href="tel:+381605887471" className="btn-outline-white">
                  Pozovi
                </a>
              </div>

              {detailParagraphs.length > 0 && (
                <div className="mt-10 space-y-4">
                  {detailParagraphs.map((paragraph, idx) => (
                    <p key={`${paragraph}-${idx}`} className="font-body text-base leading-relaxed text-white/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {/* Spec sheet */}
              <div className="mt-10 overflow-hidden rounded-[24px] border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/60">Tehnički list</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-primary">Prevoz Kop</span>
                </div>
                {displaySpecsEntries.length === 0 && specsList.length === 0 ? (
                  <p className="px-5 py-5 font-body text-sm text-white/60">Specifikacije će biti dostavljene na upit.</p>
                ) : (
                  <dl>
                    {displaySpecsEntries.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-4 border-b border-white/10 px-5 py-4 last:border-0">
                        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</dt>
                        <dd className="font-body text-[15px] text-white">
                          {Array.isArray(value) ? value.join(", ") : String(value)}
                        </dd>
                      </div>
                    ))}
                    {specsList.map((spec, idx) => (
                      <div key={`${spec}-${idx}`} className="border-b border-white/10 px-5 py-4 font-body text-[15px] text-white last:border-0">
                        {String(spec)}
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {pricingRows.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-[24px] bg-primary text-ink">
                  <p className="border-b border-ink/15 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.22em]">Cene po boji</p>
                  {pricingRows.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 last:border-0"
                    >
                      <span className="font-display text-2xl font-black uppercase [font-stretch:66%]">{row.label}</span>
                      <span className="text-right font-mono text-[13px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {product.applications && (
                <div className="mt-6 rounded-[24px] border border-white/10 px-5 py-5">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-primary">Primena</p>
                  <p className="mt-2 font-body text-[15px] leading-relaxed text-white/75">{product.applications}</p>
                </div>
              )}
              {product.document && (
                <a
                  href={product.document}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-6 flex items-center justify-between rounded-[24px] border border-white/10 px-5 py-5 transition-colors hover:border-primary"
                >
                  <span>
                    <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-primary">Dokumentacija</span>
                    <span className="mt-1 block font-display text-2xl font-black uppercase [font-stretch:66%]">Preuzmi tehnički list</span>
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 transition-all group-hover:rotate-90 group-hover:bg-primary group-hover:text-ink">
                    ↓
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-5">Prednosti</p>
            <h2 className="font-display text-6xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Zašto ovaj behaton
            </h2>
          </div>
          <ul className="border-t border-ink/15">
            {behatonBenefits.map((benefit, i) => (
              <li key={benefit} className="flex items-baseline gap-6 border-b border-ink/15 py-5">
                <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl font-extrabold uppercase leading-[1.02] text-ink [font-stretch:66%] sm:text-3xl">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <p className="section-label mb-5">Proces</p>
          <h2 className="mb-12 font-display text-6xl font-black uppercase leading-[0.88] [font-stretch:62%] sm:text-7xl">
            Kako ide <span className="text-primary">ugradnja</span>
          </h2>
          <ol className="grid gap-px overflow-hidden rounded-[24px] bg-white/10 md:grid-cols-3">
            {behatonProcess.map((step, idx) => (
              <li key={step.title} className="group bg-ink p-7 transition-colors duration-500 hover:bg-[#1a1916] sm:p-9">
                <span className="block font-display text-[6rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(244,161,0,0.75)] [font-stretch:62%] transition-colors duration-500 group-hover:text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-3xl font-extrabold uppercase leading-none [font-stretch:66%]">{step.title}</h3>
                <p className="mt-3 font-body text-[15px] leading-relaxed text-white/60">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Related models ────────────────────────────────── */}
      {related.length > 0 && (
        <section className="content-section py-24 sm:py-32">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="section-label mb-5">Katalog</p>
              <h2 className="font-display text-6xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
                Slični modeli
              </h2>
            </div>
            <Link href="/behaton" className="btn-outline">
              Ceo katalog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
            {related.map((rel) => {
              const r = toCatalogItem(rel);
              return (
                <Link
                  key={rel.slug}
                  href={`/behaton/${rel.slug}`}
                  data-cursor="view"
                  className="group relative block overflow-hidden rounded-[22px] bg-ink"
                >
                  <div className={clsx("relative aspect-[3/4] overflow-hidden", r.isPackshot && "bg-[#e6e2da]")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={rel.name}
                      loading="lazy"
                      className={clsx(
                        "h-full w-full transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.07]",
                        r.isPackshot ? "object-contain p-8" : "object-cover",
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <h3 className="font-display text-2xl font-black uppercase leading-[0.9] text-white [font-stretch:62%] sm:text-3xl">
                        {r.model}
                      </h3>
                      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/55">{r.spec}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Form ──────────────────────────────────────────── */}
      <section id="forma" className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
        <div className="content-section grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-label mb-5">Upit</p>
            <h2 className="font-display text-6xl font-black uppercase leading-[0.88] [font-stretch:62%] sm:text-7xl">
              Ponuda za <span className="text-primary">{item.model}</span>
            </h2>
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60">
              Navedite grad, površinu i planirani rok. Javljamo se sa predlogom i cenom — uz savet oko
              podloge, isporuke i ugradnje.
            </p>
            <a
              href="tel:+381605887471"
              className="mt-8 block font-display text-4xl font-black text-white [font-stretch:66%] hover:text-primary"
            >
              {company.phone}
            </a>
          </div>
          <div className="rounded-[28px] bg-paper p-2 text-ink sm:p-3">
            <ContactForm
              defaultSubject={`Behaton - ${product.name}`}
              defaultSelectValue={selectedProductOption}
              {...formProps}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="content-section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-label mb-5">FAQ</p>
            <h2 className="font-display text-6xl font-black uppercase leading-[0.88] text-ink [font-stretch:62%] sm:text-7xl">
              Česta pitanja
            </h2>
          </div>
          <div className="border-t border-ink/15">
            {behatonFaq.map((faq) => (
              <details key={faq.q} className="group border-b border-ink/15">
                <summary className="flex items-center justify-between gap-6 py-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase leading-[1] text-ink [font-stretch:70%] sm:text-3xl">
                    {faq.q}
                  </h3>
                  <span className="faq-icon grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/20 text-xl transition-all duration-500 group-open:border-primary group-open:bg-primary">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 font-body text-base leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cities ────────────────────────────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <p className="section-label mb-5">Lokacije</p>
        <h2 className="mb-10 font-display text-5xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-6xl">
          Lokalne ponude po gradu
        </h2>
        <ul className="grid grid-cols-2 border-t border-ink/15 sm:grid-cols-3 lg:grid-cols-4">
          {behatonCities.map((city) => (
            <li key={city.slug} className="border-b border-ink/15">
              <Link
                href={`/behaton/grad/${city.slug}`}
                title={city.intro}
                className="group flex items-center justify-between gap-2 py-4 pr-4 font-body text-[15px] font-medium text-ink transition-colors hover:text-primary"
              >
                Behaton {city.name}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        id="behaton-product-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: displayTitle,
          description: product.short_description || product.description || undefined,
          image: galleryImages.length > 0 ? galleryImages : undefined,
          brand: { "@type": "Brand", name: company.name },
          category: product.category,
          url: `${siteUrl}/behaton/${product.slug}`,
          additionalProperty: displaySpecsEntries.map(([label, value]) => ({
            "@type": "PropertyValue",
            name: label,
            value: Array.isArray(value) ? value.join(", ") : String(value),
          })),
        }}
      />
    </div>
  );
}
