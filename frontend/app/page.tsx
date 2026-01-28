import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HeroSlider from "@/components/hero-slider";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import TiltCard from "@/components/motion/tilt-card";
import { aboutHighlights, company, heroSlides, services, stats } from "@/content/site";
import { getProjects } from "@/lib/api";
import type { Project } from "@/lib/api";

export const metadata: Metadata = {
  title: "Isporuka betona, visinske pumpe i zemljani radovi u Nišu",
  description:
    "Prevozkop (Prevoz Kop) iz Niša pruža isporuku gotovog betona na gradilište, visoke pumpe za beton (velike visine, nepristupačan teren) i zemljane radove. Servisna zona: Niš, Leskovac, Prokuplje, Aleksinac i jug/centralna Srbija.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const featuredServices = services.slice(0, 4);
  let featuredProjects: Project[] = [];

  try {
    const response = await getProjects(6, 0);
    featuredProjects = response.data || [];
  } catch (error) {
    console.error("Neuspelo učitavanje projekata:", error);
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      <h1 className="sr-only">
        Prevozkop – isporuka betona, visinske pumpe za beton i zemljani radovi u Nišu
      </h1>
      <HeroSlider slides={heroSlides} />

      <section className="content-section">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal className="space-y-5" from="left">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              O nama
            </span>
            <h2 className="text-3xl font-bold leading-tight text-dark sm:text-4xl">
              Prevozkop: isporuka betona, visinske pumpe i zemljani radovi u Nišu
            </h2>
            <p className="text-base text-gray-700">
              Prevozkop (Prevoz Kop) je građevinska podrška iz Niša, specijalizovana za isporuku
              gotovog betona na gradilište, visoke pumpe za beton (velike visine, nepristupačan
              teren) i zemljane radove (iskopi, ravnanje terena, priprema gradilišta). Radimo u
              Nišu i okolnim gradovima (Leskovac, Prokuplje, Aleksinac), kao i širom juga/centralne
              Srbije – u dogovoru sa investitorom i uslovima na terenu.
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
                Više o nama
              </Link>
              <Link
                href="/porucivanje-betona#forma"
                className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
              >
                Poruči beton
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
              Naše usluge
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">
              Pružamo najbolje građevinske usluge
            </h2>
          </ScrollReveal>
          <ScrollReveal from="right">
            <Link
              href="/usluge"
              className="inline-flex items-center text-sm font-semibold text-primary"
            >
              Sve usluge →
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

      <section className="bg-white">
        <div className="content-section grid gap-6 rounded-3xl border border-black/5 bg-gradient-to-r from-white via-white to-primary/10 px-6 py-10 shadow-xl sm:px-10">
          <ScrollReveal className="flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Rezultati
            </span>
            <p className="text-sm text-gray-600">Flota novih vozila, provereni tim i stalne inovacije.</p>
          </ScrollReveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
            {stats.map((item) => (
              <ScrollReveal key={item.label} from="up">
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-6 text-center shadow-sm">
                  <div className="text-3xl font-bold text-dark">{item.value}</div>
                  <div className="text-sm font-semibold text-gray-600">{item.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="content-section space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <ScrollReveal className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Naši projekti
            </span>
            <h2 className="text-3xl font-bold text-dark sm:text-4xl">Galerija radova na terenu</h2>
          </ScrollReveal>
          <ScrollReveal from="right">
            <Link
              href="/projekti"
              className="inline-flex items-center text-sm font-semibold text-primary"
            >
              Pogledaj sve →
            </Link>
          </ScrollReveal>
        </div>
        {featuredProjects.length === 0 ? (
          <ScrollReveal>
            <p className="text-sm text-gray-600">
              Još uvek nema objavljenih projekata. Pratite nas za nove radove.
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
                    {project.published_at && (
                      <p className="text-sm text-gray-600">
                        Objavljeno: {new Date(project.published_at).toLocaleDateString("sr-RS")}
                      </p>
                    )}
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </StaggerReveal>
        )}
      </section>

      <section className="content-section">
        <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-dark text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,161,0,0.2),_transparent_40%)]" />
          <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
            <ScrollReveal className="space-y-4">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Kontakt
              </span>
              <h3 className="text-3xl font-bold leading-tight sm:text-4xl">
                Potreban vam je beton ili kompletni zemljani radovi?
              </h3>
              <p className="text-sm text-gray-200">
                Pozovite nas ili pošaljite upit. Naš tim odgovara brzo, predlaže najbolje rešenje i
                organizuje isporuku bez kašnjenja.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="tel:+381605887471"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
                >
                  Pozovi {company.phone}
                </Link>
                <Link
                  href="/porucivanje-betona#forma"
                  className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
                >
                  Pošalji upit
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal
              from="right"
              className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2"
            >
              <ContactCard label="Adresa" value={company.address} />
              <ContactCard label="Telefon" value={company.phone} />
              <ContactCard label="Email" value={company.email} />
              <ContactCard label="Radno vreme" value={company.workingHours} />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
