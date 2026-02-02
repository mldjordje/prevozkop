import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import FloatingCta from "@/components/floating-cta";
import { company } from "@/content/site";

export const metadata: Metadata = {
  title: "Poručivanje betona (gotov beton) – isporuka i beton pumpe | Niš",
  description:
    "Poručite beton u Nišu i okolini: isporuka gotovog betona na gradilište mikserima, visoke pumpe za beton za velike visine i nepristupačan teren, kao i zemljani radovi (iskopi, ravnanje terena, priprema). Prevozkop (Prevoz Kop) radi na području Niša, Leskovca, Prokuplja, Aleksinca i šire u južnoj/centralnoj Srbiji.",
  keywords: [
    "poručivanje betona",
    "beton Niš",
    "beton nish",
    "isporuka betona",
    "beton pumpa",
    "visoka pumpa za beton",
    "nasipanje betona",
    "zemljani radovi",
    "tamponiranje",
    "beton cena",
  ],
  alternates: { canonical: "/porucivanje-betona" },
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

const serviceAreas = ["Niš", "Leskovac", "Prokuplje", "Aleksinac", "Južna i centralna Srbija"];

const concreteUseCases = [
  {
    title: "Beton za temelje i iskope",
    description:
      "Dogovaramo klasu i konzistenciju prema projektu i uslovima na gradilištu, uz fokus na pristup miksera i dinamiku istovara.",
  },
  {
    title: "Beton za ploču, kuću ili garažu",
    description:
      "Za ploče i armirane konstrukcije važni su organizacija istovara i kontinuitet betoniranja, da se izbegnu hladni spojevi.",
  },
  {
    title: "Betoniranje na visini i nepristupačnom terenu",
    description:
      "Kada nema prostora za prilaz ili je objekat na većoj visini, visinske pumpe rešavaju logistiku i ubrzavaju betoniranje.",
  },
];

const logisticsChecklist = [
  "Adresa i tačna lokacija gradilišta (Niš / okolina)",
  "Količina (m³), željeni termin i okvir trajanja betoniranja",
  "Da li je potreban mikser + pumpa ili samo mikser",
  "Pristup: širina ulaza, nagib, podloga, prepreke i visina istovara",
  "Namena betona (temelji, ploča, stubovi, zidovi)",
];

const faqItems = [
  {
    q: "Ko isporučuje beton u Nišu?",
    a: "Prevozkop (Prevoz Kop) je građevinska podrška iz Niša koja organizuje isporuku gotovog betona na gradilište mikserima, uz opciju pumpe kada je potreban brži ili složeniji istovar.",
  },
  {
    q: "Da li radite beton sa pumpom i visinske pumpe za beton?",
    a: "Da. Na raspolaganju su betonske pumpe, uključujući visinske pumpe za betoniranje višespratnica, većih visina i nepristupačnih terena. Pre izlaska na teren proveravamo pristup i uslove rada.",
  },
  {
    q: "Kako da poručim beton i koju klasu da izaberem?",
    a: "Pošaljite upit ili pozovite i navedite namenu, količinu i lokaciju. Klasa betona se dogovara prema projektu/statiki i uslovima na gradilištu; ako niste sigurni, usmeriće vas operater na osnovu informacija koje dostavite.",
  },
  {
    q: "Koliko košta beton (cena betona po kubiku / m3)?",
    a: "Cena zavisi od klase betona, količine, udaljenosti, potrebe za pumpom, vremena i uslova istovara. Najbrže je da pošaljete detalje i dobićete tačnu ponudu za vaš slučaj.",
  },
  {
    q: "Da li radite zemljane radove i pripremu gradilišta?",
    a: "Da. Radimo zemljane radove kao što su iskopi, ravnanje terena i priprema gradilišta, što olakšava logistiku i ubrzava početak radova.",
  },
  {
    q: "Koju servisnu zonu pokrivate?",
    a: "Polazimo iz Niša i radimo u okolnim gradovima (Leskovac, Prokuplje, Aleksinac), kao i širom južne i centralne Srbije, u dogovoru sa investitorom i uslovima na terenu.",
  },
];

export default function OrderConcretePage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Poručivanje betona Niš - isporuka danas"
        kicker="Porudžbina betona"
        description="Brza isporuka betona mikserima i pumpama, nasipanje betona i kompletni zemljani radovi. Pošaljite zahtev online ili pozovite."
        background="/img/kamionislika2.webp"
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

      <section className="content-section space-y-8">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Tehnologija i logistika gradilišta
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Isporuka betona na gradilište – kada je teren zahtevan
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Prevozkop je građevinska podrška iz Niša, specijalizovana za isporuku gotovog betona,
            visoke pumpe za beton i zemljane radove. Fokus je na organizaciji kada su prisutni
            problemi pristupa, visine, terena ili potreba za brzim betoniranjem.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {concreteUseCases.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-dark">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-black/5 bg-white px-6 py-6 shadow-lg">
          <h3 className="text-xl font-bold text-dark">Šta je potrebno za brzu organizaciju</h3>
          <p className="mt-2 max-w-3xl text-sm text-gray-700">
            Što preciznije informacije dobijemo, to tačnije možemo da organizujemo mikser, pumpu i
            termin isporuke.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            {logisticsChecklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="grid gap-8 rounded-3xl border border-black/5 bg-dark px-6 py-10 text-white shadow-2xl sm:px-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Visoke pumpe
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              Visinska pumpa za beton za velike visine i nepristupačan teren
            </h2>
            <p className="text-sm text-gray-200">
              Kada je betoniranje na višim spratovima, u uskim ulicama ili bez mogućnosti prilaza
              miksera do tačke istovara, beton pumpa (posebno visinska pumpa) rešava problem
              logistike i ubrzava radove.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/kontakt"
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition hover:translate-y-[-2px]"
              >
                Provera uslova i termin
              </Link>
              <Link
                href="/usluge"
                className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
              >
                Usluge i oprema
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-base font-semibold">Najčešći slučajevi</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-200">
              <li>• Betoniranje višespratnica (velike visine)</li>
              <li>• Uski prilazi, ograničen manevar miksera</li>
              <li>• Dugačak domet do tačke ugradnje</li>
              <li>• Nepristupačan teren i složena gradilišta</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Zemljani radovi
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Iskop, ravnanje terena i priprema gradilišta
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Zemljani radovi su često ključni da bi isporuka betona i izlazak pumpe bili bezbedni i
            bez zastoja. Po potrebi radimo pripremu prilaza, ravnanje i organizaciju terena pre
            betoniranja.
          </p>
          <p className="max-w-3xl text-sm text-gray-700">
            Pogledajte detalje na stranici{" "}
            <Link className="font-semibold text-primary" href="/usluge">
              Usluge
            </Link>
            , ili nam pošaljite podatke o lokaciji.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Mašinski iskop i iskopi temelja",
            "Ravnanje i priprema podloge",
            "Priprema gradilišta za izlazak pumpe i miksera",
            "Odvoz zemlje/šuta i logistika terena",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-black/5 bg-white px-5 py-4 text-sm font-semibold text-dark shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Cena i ponuda
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Cena betona (beton m3) i uslovi isporuke
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Kada se pita „koliko košta beton“, najvažnije je da se uzmu u obzir klasa betona,
            količina, udaljenost, potreba za pumpom i uslovi istovara (pristup, visina, teren).
            Zbog toga cenu računamo konkretno za vaše gradilište.
          </p>
          <p className="max-w-3xl text-sm text-gray-700">
            Pošaljite zahtev na{" "}
            <Link className="font-semibold text-primary" href="#forma">
              formi
            </Link>{" "}
            ili nas pozovite – dobijate jasnu potvrdu termina i logistike.
          </p>
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Servisna zona
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">
            Niš i okolni gradovi – jug i centralna Srbija
          </h2>
          <p className="max-w-3xl text-base text-gray-700">
            Polazimo iz Niša i organizujemo isporuku i radove u okolini i regionu, u zavisnosti od
            udaljenosti i uslova na terenu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceAreas.map((city) => (
            <span
              key={city}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-dark"
            >
              {city}
            </span>
          ))}
        </div>
      </section>

      <section className="content-section space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            FAQ
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">Česta pitanja</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {faqItems.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-lg"
            >
              <h3 className="text-base font-semibold text-dark">{item.q}</h3>
              <p className="mt-2 text-sm text-gray-700">{item.a}</p>
            </div>
          ))}
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

      <Script id="beton-service-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Proizvodnja i isporuka betona",
          serviceType: "Gotov beton, isporuka betona, pumpe za beton",
          provider: {
            "@type": "LocalBusiness",
            name: "Prevoz Kop",
            telephone: company.phone,
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
            areaServed: [
              "Nis",
              "Leskovac",
              "Prokuplje",
              "Aleksinac",
              "Juzna Srbija",
              "Centralna Srbija",
            ],
          },
          areaServed: [
            "Nis",
            "Leskovac",
            "Prokuplje",
            "Aleksinac",
            "Juzna Srbija",
            "Centralna Srbija",
          ],
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
          },
        })}
      </Script>
      <Script id="porucivanje-betona-faq-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        })}
      </Script>
      <FloatingCta
        phone={company.phone}
        callNumber="0603720415"
        whatsappNumber="0601491491"
        message="Pozdrav! Zanima me isporuka betona u Nisu."
      />
    </div>
  );
}
