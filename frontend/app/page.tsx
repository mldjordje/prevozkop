import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import HeroVideo from "@/components/hero-video";
import FloatingCta from "@/components/floating-cta";
import StatsSection from "@/components/stats-section";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import TiltCard from "@/components/motion/tilt-card";
import { aboutHighlights, company, heroSlides, services, stats } from "@/content/site";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Prevozkop Nis - beton za Nis i okolinu, behaton za Srbiju",
  description:
    "Prevozkop iz Nisa obezbedjuje isporuku gotovog betona za Nis i okolinu, behaton za Srbiju, beton pumpe i zemljane radove za stambenu i poslovnu gradnju.",
  path: "/",
  image: "/img/napolje1.webp",
  keywords: [
    "beton nis", "isporuka betona nis", "isporuka betona", "behaton nis", "behaton",
    "gotov beton", "beton pumpa", "zemljani radovi", "prevozkop",
  ],
  languages: srEnLanguages("/", "/en"),
});

const homepageFaq = [
  {
    q: "Ko isporucuje gotov beton u Nisu?",
    a: "Prevozkop organizuje proizvodnju i isporuku gotovog betona na gradiliste u Nisu i okolini.",
  },
  {
    q: "Da li imate visinske pumpe za beton?",
    a: "Da, obezbedjujemo pumpe za beton ukljucujuci visinske pumpe za zahtevna gradilista.",
  },
  {
    q: "Kako da porucim beton i dogovorim termin?",
    a: "Najbrze je preko forme za porucivanje betona ili direktnim pozivom radi potvrde termina.",
  },
];

const priorityLinks = [
  {
    href: "/porucivanje-betona",
    title: "Isporuka betona Nis",
    description: "Porucivanje betona, miksera i beton pumpi u Nisu i okolini.",
  },
  {
    href: "/behaton",
    title: "Behaton Srbija",
    description: "Modeli, cene, isporuka i ugradnja behatona sirom Srbije.",
  },
  {
    href: "/beton/grad/nis",
    title: "Beton Nis",
    description: "Lokalna stranica za beton, pumpu i termin isporuke u Nisu.",
  },
  {
    href: "/behaton/grad/nis",
    title: "Behaton Nis",
    description: "Behaton u Nisu sa upitom i preporukama modela.",
  },
  {
    href: "/usluge",
    title: "Usluge",
    description: "Pregled betona, pumpi, zemljanih radova i logistike gradilista.",
  },
  {
    href: "/projekti",
    title: "Projekti",
    description: "Reference i galerija radova za dodatni signal poverenja.",
  },
];

export default async function HomePage() {
  const featuredServices = services.slice(0, 4);
  let featuredProjects: Project[] = [];

  try {
    const response = await getProjects(6, 0);
    featuredProjects = response.data || [];
  } catch (error) {
    console.error("Neuspelo ucitavanje projekata:", error);
  }

  return (
    <div className="pb-24 md:pb-0">
      <h1 className="sr-only">
        Prevozkop - isporuka betona, visinske pumpe za beton i zemljani radovi u Nisu
      </h1>

      <HeroVideo
        title={heroSlides[0].title}
        kicker={heroSlides[0].kicker}
        description={heroSlides[0].description}
        ctaLabel={heroSlides[0].ctaLabel}
        ctaHref={heroSlides[0].ctaHref}
      />

      {/* ── Stats ────────────────────────────────────────── */}
      <StatsSection stats={stats} />

      {/* ── Vazne stranice ───────────────────────────────── */}
      <section className="content-section space-y-8 py-16 sm:py-24">
        <ScrollReveal className="space-y-3">
          <span className="section-label">Vazne stranice</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Beton i behaton — sve na jednom mestu
          </h2>
          <p className="max-w-3xl font-body text-base text-muted">
            Isporuka betona za Nis i okolinu, behaton za Srbiju, pumpe i kompletne usluge.
          </p>
        </ScrollReveal>
        <StaggerReveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priorityLinks.map((link, i) => (
            <ScrollReveal key={link.href} from="up" delay={i * 0.05}>
              <Link
                href={link.href}
                className="group flex h-full flex-col rounded-2xl border border-[rgba(15,14,12,0.07)] bg-white p-6 shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_20px_56px_rgba(0,0,0,0.08),0_0_0_1px_rgba(244,161,0,0.12)]"
              >
                <h3 className="font-display text-xl font-bold text-dark">{link.title}</h3>
                <p className="mt-2 flex-1 font-body text-sm text-muted">{link.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary">
                  Otvori
                  <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      {/* ── O nama ───────────────────────────────────────── */}
      <section className="content-section py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal from="left" className="space-y-6">
            <span className="section-label">O nama</span>
            <h2 className="font-display text-4xl font-bold leading-tight text-dark sm:text-5xl">
              Prevozkop: beton, pumpe i zemljani radovi
            </h2>
            <p className="font-body text-base leading-relaxed text-muted">
              Prevozkop je gradjevinska podrska iz Nisa specijalizovana za isporuku gotovog betona,
              visoke pumpe i pripremu gradilista. Radimo u Nisu i okolnim gradovima uz jasnu
              logistiku i pouzdane rokove.
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {aboutHighlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-[rgba(15,14,12,0.06)] bg-white px-4 py-3 shadow-sm"
                >
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/15 text-center text-xs font-bold leading-5 text-primary">
                    ✓
                  </span>
                  <p className="font-body text-sm font-semibold text-dark">{item}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/o-nama" className="btn-primary">
                Vise o nama
              </Link>
              <Link href="/porucivanje-betona#forma" className="btn-outline">
                Posalji upit
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal from="right" className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl lg:aspect-auto lg:h-[480px]">
            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/10 via-transparent to-transparent" />
            <Image
              src="/img/napolje1.webp"
              alt="Betonska baza i dostava"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            {/* Floating badge */}
            <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-white/20 bg-dark/70 px-4 py-2.5 backdrop-blur-sm">
              <p className="font-display text-lg font-bold text-primary">{stats[0]?.value}</p>
              <p className="font-body text-xs text-white/70">{stats[0]?.label}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Usluge ───────────────────────────────────────── */}
      <section className="content-section space-y-8 py-16 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <ScrollReveal className="space-y-3">
            <span className="section-label">Nase usluge</span>
            <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
              Gradjevinske usluge za teren
            </h2>
          </ScrollReveal>
          <ScrollReveal from="right">
            <Link
              href="/usluge"
              className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary"
            >
              Sve usluge
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </ScrollReveal>
        </div>
        <StaggerReveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <ScrollReveal key={service.title} from="up" className="h-full">
              <TiltCard className="group h-full overflow-hidden rounded-2xl border border-[rgba(15,14,12,0.06)] bg-white shadow-sm transition-shadow duration-400 hover:shadow-[0_20px_56px_rgba(0,0,0,0.09)]">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="font-display text-xl font-bold text-dark">{service.title}</h3>
                  <p className="font-body text-sm leading-relaxed text-muted">{service.description}</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      {/* ── Projekti ─────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="content-section space-y-8 py-16 sm:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <ScrollReveal className="space-y-3">
              <span className="section-label">Nasi projekti</span>
              <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
                Galerija radova
              </h2>
            </ScrollReveal>
            <ScrollReveal from="right">
              <Link
                href="/projekti"
                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary"
              >
                Svi projekti
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
          <StaggerReveal className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ScrollReveal key={project.id} from="up" className="h-full">
                <TiltCard className="group h-full overflow-hidden rounded-2xl border border-[rgba(15,14,12,0.06)] bg-white shadow-sm transition-shadow duration-400 hover:shadow-[0_20px_56px_rgba(0,0,0,0.09)]">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={project.hero_image || "/img/napolje1.webp"}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  </div>
                  <div className="space-y-1 p-5">
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Projekat
                    </p>
                    <h3 className="font-display text-xl font-bold text-dark">{project.title}</h3>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="content-section space-y-8 py-16 sm:py-24">
        <ScrollReveal className="space-y-3">
          <span className="section-label">Najcesca pitanja</span>
          <h2 className="font-display text-4xl font-bold text-dark sm:text-5xl">
            Beton u Nisu — brzi odgovori
          </h2>
        </ScrollReveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {homepageFaq.map((item, i) => (
            <ScrollReveal key={item.q} from="up" delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-[rgba(15,14,12,0.07)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-dark">{item.q}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <Script id="home-localbusiness-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Prevoz Kop",
          url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
          telephone: company.phone,
          email: company.email,
          address: { "@type": "PostalAddress", addressLocality: "Nis", addressCountry: "RS" },
          areaServed: ["Nis", "Leskovac", "Prokuplje", "Aleksinac", "Juzna Srbija", "Centralna Srbija"],
        })}
      </Script>
      <Script id="home-faq-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homepageFaq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        })}
      </Script>

      <FloatingCta
        phone={company.phone}
        formHref="/porucivanje-betona#forma"
        formLabel="Posalji upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nisu."
      />
    </div>
  );
}
