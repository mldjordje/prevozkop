import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Poručivanje betona Niš | Prevoz Kop",
  description:
    "Poručite beton u Nišu i okolini: isporuka mikserima i pumpama, nasipanje betona, zemljani radovi i tamponiranje. Brza logistika, tačne količine i sigurnost na terenu.",
  keywords: [
    "poručivanje betona",
    "beton niš",
    "beton nish",
    "isporuka betona",
    "beton pumpa",
    "nasipanje betona",
    "zemljani radovi",
    "tamponiranje",
    "beton cena",
  ],
};

const benefits = [
  "Beton iz sopstvene baze, klase po zahtevu (MB10-MB40)",
  "Brza isporuka u Nišu i okolini mikserima i pumpama",
  "Nasipanje betona, tamponiranje i kompletni zemljani radovi",
  "Precizno zakazivanje termina i podrška na terenu",
];

const steps = [
  "Pošaljite porudžbinu ili pozovite - javlja se operater",
  "Definišemo količinu, klasu betona i vreme isporuke",
  "Na teren izlaze mikseri/pumpe, nadzor prati isporuku",
];

export default function OrderConcretePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Poručivanje betona Niš - isporuka danas"
        kicker="Porudžbina betona"
        description="Brza isporuka betona mikserima i pumpama, nasipanje betona i kompletni zemljani radovi. Pošaljite zahtev online ili pozovite."
        background="/img/kamionislika2.jpg"
        priority
        actions={[
          { label: "Popuni porudžbinu", href: "#forma" },
          { label: "Pozovi odmah", href: "tel:+381605887471" },
        ]}
      />

      <section className="content-section space-y-6">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Beton, pumpe, zemljani radovi
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Beton Niš, poručivanje betona i nasipanje na jednom mestu
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Prevoz Kop obezbeđuje beton iz sopstvene baze, transport mikserima i pumpama, kao i
            zemljane radove i tamponiranje. Radimo brzo i precizno da bi beton stigao u tačnoj klasi
            i terminu.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-black/5 bg-white px-5 py-4 text-sm font-semibold text-dark shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-black/5 bg-white px-5 py-5 shadow-lg sm:px-7 sm:py-6">
          <h3 className="text-xl font-bold text-dark">Kako poručiti beton</h3>
          <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="forma" className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Online porudžbina
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Popunite zahtev za beton</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Navedite količinu, klasu, lokaciju i da li je potrebna pumpa ili samo mikser. Naš
            dispečer potvrđuje termin i organizuje isporuku.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+381605887471"
              className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] transition hover:translate-y-[-2px]"
            >
              Pozovi {company.phone}
            </a>
            <a
              href="mailto:prevozkopbb@gmail.com"
              className="inline-flex items-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-dark transition hover:border-primary hover:text-primary"
            >
              {company.email}
            </a>
          </div>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
