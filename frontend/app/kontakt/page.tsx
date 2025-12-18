import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/contact-form";
import PageHero from "@/components/page-hero";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Kontakt | Prevozkop (Prevoz Kop) – Niš",
  description:
    "Kontaktirajte Prevozkop iz Niša za isporuku betona, visoke pumpe za beton i zemljane radove. Servisna zona: Niš, Leskovac, Prokuplje, Aleksinac i južna/centralna Srbija.",
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Kontaktirajte nas"
        kicker="Kontakt"
        description="Brzo odgovaramo na upite i dogovaramo isporuku betona, visoke pumpe za beton i zemljane radove (iskopi, priprema gradilišta) u Nišu i regionu."
        background="/img/volvonov2.webp"
        priority
        actions={[
          { label: "Pozovi", href: "tel:+381605887471" },
          { label: "Pošalji upit", href: "#forma" },
        ]}
      />

      <section className="content-section">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-dark">Stupite u kontakt</h2>
              <p className="mt-2 text-sm text-gray-700">
                Pozovite nas za hitne isporuke ili pošaljite detalje projekta i odgovorićemo
                u najkraćem roku.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-800">
                <li>
                  <span className="text-gray-500">Adresa: </span>
                  {company.address}
                </li>
                <li>
                  <span className="text-gray-500">Telefon: </span>
                  <a className="text-primary" href="tel:+381605887471">
                    {company.phone}
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">Email: </span>
                  <a className="text-primary" href={`mailto:${company.email}`}>
                    {company.email}
                  </a>
                </li>
                <li>
                  <span className="text-gray-500">Radno vreme: </span>
                  {company.workingHours}
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-black/5 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-dark">Servisna zona</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Polazimo iz Niša i radimo u okolnim gradovima: Leskovac, Prokuplje, Aleksinac, kao
                  i širom južne i centralne Srbije (u dogovoru).
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Južna/Centralna Srbija"].map(
                    (city) => (
                      <span
                        key={city}
                        className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-dark"
                      >
                        {city}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-black/5 shadow-xl">
              <iframe
                title="Mapa Prevoz Kop"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.4041065583438!2d21.7812499!3d43.3292085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4755c9c6d19f399d%3A0x677ab617dde894eb!2sPREVOZ%20KOP%20BETONSKA%20BAZA!5e1!3m2!1sen!2srs!4v1739409789864!5m2!1sen!2srs"
                className="h-[360px] w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div id="forma" className="space-y-4">
            <h2 className="text-2xl font-bold text-dark">Pošaljite upit</h2>
            <p className="text-sm text-gray-700">
              Napišite koju količinu (m3) i klasu betona vam treba, da li je potrebna pumpa, kao i
              informacije o pristupu terenu. Ako planirate zemljane radove, navedite lokaciju i šta
              je potrebno (iskop, ravnanje, priprema gradilišta).
            </p>
            <p className="text-sm text-gray-700">
              Za poručivanje betona možete koristiti i stranicu{" "}
              <Link className="font-semibold text-primary" href="/porucivanje-betona#forma">
                Poručivanje betona
              </Link>
              .
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
