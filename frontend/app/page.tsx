import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import HeroSlider from "@/components/hero-slider";
import FloatingCta from "@/components/floating-cta";
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
    "beton nis",
    "isporuka betona nis",
    "isporuka betona",
    "behaton nis",
    "behaton",
    "gotov beton",
    "beton pumpa",
    "zemljani radovi",
    "prevozkop",
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
    description: "Landing stranica za porucivanje betona, miksera i beton pumpi u Nisu i okolini.",
  },
  {
    href: "/behaton",
    title: "Behaton Srbija",
    description: "Glavna SEO stranica za behaton, modele, cene, isporuku i ugradnju sirom Srbije.",
  },
  {
    href: "/beton/grad/nis",
    title: "Beton Nis",
    description: "Lokalna stranica za beton, pumpu i termin isporuke u Nisu.",
  },
  {
    href: "/behaton/grad/nis",
    title: "Behaton Nis",
    description: "Lokalna stranica za behaton u Nisu sa upitom i preporukama modela.",
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
    <div className="space-y-16 sm:space-y-24">
      <h1 className="sr-only">
        Prevozkop - isporuka betona, visinske pumpe za beton i zemljani radovi u Nisu
      </h1>
      <HeroSlider slides={heroSlides} />

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Vazne stranice
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Glavne stranice za beton u okolini Nisa i behaton u Srbiji
          </h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Ako trazite isporuku betona za Nis i okolinu, behaton za Srbiju, beton pumpu ili
            kompletne usluge, ovde su najvaznije stranice sajta sa konkretnim informacijama i upitom.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priorityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-dark">{link.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{link.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                Otvori stranicu {"->"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Najcesca pitanja
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Beton i isporuka u Nisu - brzi odgovori
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {homepageFaq.map((item) => (
            <div key={item.q} className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg">
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal className="space-y-5" from="left">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              O nama
            </span>
            <h2 className="text-3xl font-bold leading-tight text-dark sm:text-4xl">
              Prevozkop: beton, pumpe i zemljani radovi
            </h2>
            <p className="text-base text-gray-700">
              Prevozkop je gradjevinska podrska iz Nisa specijalizovana za isporuku gotovog betona,
              visoke pumpe i pripremu gradilista. Radimo u Nisu i okolnim gradovima uz jasnu
              logistiku i pouzdane rokove.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {aboutHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold text-dark shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/o-nama"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] transition hover:translate-y-[-2px]"
              >
                Vise o nama
              </Link>
              <Link
                href="/porucivanje-betona#forma"
                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
              >
                Poruci beton
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal
            from="right"
            className="relative overflow-hidden rounded-3xl border border-black/5 shadow-xl"
          >
            <div
              className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-white/40"
              aria-hidden
            />
            <Image
              src="/img/napolje1.webp"
              alt="Betonska baza i dostava"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </ScrollReveal>
        </div>
      </section>

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <ScrollReveal className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Nase usluge
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Gradjevinske usluge za teren i logistiku
            </h2>
          </ScrollReveal>
          <ScrollReveal from="right">
            <Link href="/usluge" className="inline-flex items-center text-sm font-semibold text-primary">
              Sve usluge -
            </Link>
          </ScrollReveal>
        </div>
        <StaggerReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredServices.map((service) => (
            <ScrollReveal key={service.title} from="up" className="h-full">
              <TiltCard className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold text-dark">{service.title}</h3>
                  <p className="text-sm text-gray-700">{service.description}</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <ScrollReveal className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Nasi projekti
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Galerija radova</h2>
          </ScrollReveal>
          <ScrollReveal from="right">
            <Link href="/projekti" className="inline-flex items-center text-sm font-semibold text-primary">
              Pogledaj sve -
            </Link>
          </ScrollReveal>
        </div>
        {featuredProjects.length === 0 ? (
          <ScrollReveal>
            <p className="text-sm text-gray-600">
              Jos uvek nema objavljenih projekata. Pratite nas za nove radove.
            </p>
          </ScrollReveal>
        ) : (
          <StaggerReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ScrollReveal key={project.id} from="up" className="h-full">
                <TiltCard className="group h-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-md">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={project.hero_image || "/img/napolje1.webp"}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">Projekat</p>
                    <h3 className="text-lg font-semibold text-dark">{project.title}</h3>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        )}
      </section>

      <Script id="home-localbusiness-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Prevoz Kop",
          url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
          telephone: company.phone,
          email: company.email,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Nis",
            addressCountry: "RS",
          },
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
      <FloatingCta phone={company.phone} callNumber="0603720415" whatsappNumber="0601491491" />
    </div>
  );
}
