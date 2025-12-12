import ContactForm from "@/components/contact-form";
import PageHero from "@/components/page-hero";
import { company } from "@/content/site";

export default function ContactPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Kontaktirajte nas"
        kicker="Kontakt"
        description="Brzo odgovaramo na upite i dogovaramo isporuku betona, zemljanih radova i transporta."
        background="/img/volvonov2.jpg"
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
              Napišite koje količine i vrstu betona vam trebaju ili koje radove planirate.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
