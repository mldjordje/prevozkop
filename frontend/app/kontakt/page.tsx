import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact-form";
import PageHero from "@/components/page-hero";
import FloatingCta from "@/components/floating-cta";
import JsonLd from "@/components/json-ld";
import { ChipLinks, FormSection } from "@/components/sections";
import { company } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kontakt | Prevozkop",
  description:
    "Kontaktirajte Prevozkop za isporuku betona, visoke pumpe i zemljane radove u Nišu i regionu.",
  path: "/kontakt",
  image: "/img/volvonov2.webp",
  keywords: [
    "kontakt beton nis",
    "porucivanje betona",
    "beton pumpa",
    "prevozkop kontakt",
    "prevoz kop telefon",
  ],
  languages: srEnLanguages("/kontakt", "/en/contact"),
});

const channels = [
  { label: "Telefon", value: company.phone, href: "tel:+381605887471", note: "Najbrži put — dispečer odgovara odmah" },
  { label: "Email", value: company.email, href: `mailto:${company.email}`, note: "Za projekte, specifikacije i ponude" },
  {
    label: "Adresa",
    value: company.address,
    href: "https://www.google.com/maps/search/?api=1&query=PREVOZ+KOP+BETONSKA+BAZA+Nis",
    note: "Betonska baza — Krušce bb",
  },
  { label: "Radno vreme", value: company.workingHours, note: "Hitne isporuke po dogovoru" },
];

const zones = ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Južna/Centralna Srbija"];

export default function ContactPage() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Kontaktirajte nas"
        kicker="Kontakt"
        description="Brzo odgovaramo na upite i dogovaramo isporuku betona, pumpe i zemljane radove."
        background="/img/volvonov2.webp"
        priority
        actions={[
          { label: "Pozovi", href: "tel:+381605887471" },
          { label: "Pošalji upit", href: "#forma" },
        ]}
      />

      {/* ── Channels as giant type rows ───────────────────── */}
      <section className="content-section py-24 sm:py-32">
        <p className="section-label mb-5">Stupite u kontakt</p>
        <h2 className="mb-12 max-w-3xl font-body text-lg leading-relaxed text-muted">
          Pozovite nas za hitne isporuke ili pošaljite detalje projekta i odgovorićemo u najkraćem roku.
        </h2>
        <ul className="border-t border-ink/15">
          {channels.map((c, i) => {
            const inner = (
              <>
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-y-100" />
                <span className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted group-hover:text-ink">
                  {String(i + 1).padStart(2, "0")} · {c.label}
                </span>
                <span className="relative break-all font-display text-4xl font-black uppercase leading-[0.9] text-ink [font-stretch:62%] sm:text-6xl lg:text-7xl">
                  {c.value}
                </span>
                <span className="relative font-body text-sm text-muted group-hover:text-ink/75 md:text-right">{c.note}</span>
              </>
            );
            const cls =
              "group relative grid gap-3 overflow-hidden py-7 md:grid-cols-[180px_1fr_220px] md:items-center md:gap-8";
            return (
              <li key={c.label} className="border-b border-ink/15">
                {c.href ? (
                  <a href={c.href} className={cls} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Map ───────────────────────────────────────────── */}
      <section className="content-section pb-24 sm:pb-32">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-between gap-8 rounded-[28px] bg-ink p-7 text-white sm:p-10">
            <div>
              <p className="section-label mb-5">Servisna zona</p>
              <h2 className="font-display text-5xl font-black uppercase leading-[0.88] [font-stretch:62%]">
                Polazimo iz Niša
              </h2>
              <p className="mt-4 font-body text-[15px] leading-relaxed text-white/65">
                Radimo u okolnim gradovima: Leskovac, Prokuplje, Aleksinac i region.
              </p>
            </div>
            <ChipLinks tone="dark" links={zones.map((z) => ({ href: "/porucivanje-betona#forma", label: z }))} />
          </div>
          <div className="relative min-h-[380px] overflow-hidden rounded-[28px] bg-ink" data-cursor="Mapa">
            <iframe
              title="Mapa Prevoz Kop"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.4041065583438!2d21.7812499!3d43.3292085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4755c9c6d19f399d%3A0x677ab617dde894eb!2sPREVOZ%20KOP%20BETONSKA%20BAZA!5e1!3m2!1sen!2srs!4v1739409789864!5m2!1sen!2srs"
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.85] contrast-[1.1] transition-[filter] duration-700 hover:grayscale-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <FormSection
        lines={["Pošaljite", { text: "upit", className: "text-primary" }]}
        text="Napišite količinu, klasu betona i informacije o pristupu terenu. Ako planirate zemljane radove, navedite lokaciju i šta je potrebno."
        extra={
          <p className="mt-8 font-body text-sm text-white/55">
            Za poručivanje betona možete koristiti i stranicu{" "}
            <Link className="text-primary hover:text-white" href="/porucivanje-betona#forma">
              Poručivanje betona
            </Link>
            .
          </p>
        }
      >
        <ContactForm />
      </FormSection>

      <JsonLd
        id="contact-page-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${SITE_URL}/kontakt`,
          about: { "@id": `${SITE_URL}#organization` },
        }}
      />
      <JsonLd
        id="contact-breadcrumbs-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Pocetna", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Kontakt", item: `${SITE_URL}/kontakt` },
          ],
        }}
      />
      <FloatingCta
        phone={company.phone}
        quickService="beton"
        formLabel="Brzi upit"
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Treba mi ponuda za beton."
      />
    </div>
  );
}
