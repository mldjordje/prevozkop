import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import ContactForm from "@/components/contact-form";
import { company } from "@/content/site";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact | Prevoz Kop",
  description:
    "Contact Prevoz Kop for concrete delivery, pumps, excavation and demolition jobs in Serbia.",
  path: "/en/contact",
  locale: "en_US",
  image: "/img/kamionislika2.webp",
  languages: srEnLanguages("/kontakt", "/en/contact"),
});

export default function ContactEn() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        title="Contact"
        kicker="Get in touch"
        description="Send project details or call us for fast scheduling and dispatch."
        background="/img/kamionislika2.webp"
        actions={[
          { label: "Call", href: `tel:${company.phone}` },
          { label: "Email", href: `mailto:${company.email}` },
        ]}
      />

      <section className="content-section space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Send a request</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Tell us the location, required concrete class, and whether you need pumps or just
            mixers. We respond quickly with schedule and pricing.
          </p>
        </div>
        <div id="form">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
