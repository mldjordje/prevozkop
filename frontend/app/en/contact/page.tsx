import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import { FormSection } from "@/components/sections";
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
    <div className="bg-cement">
      <PageHero
        title="Contact"
        kicker="Get in touch"
        description="Send project details or call us for fast scheduling and dispatch."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Call", href: "tel:+381605887471" },
          { label: "Email", href: `mailto:${company.email}` },
        ]}
      />
      <FormSection
        id="form"
        label="Request"
        lines={["Send a", { text: "request", className: "text-primary" }]}
        text="Tell us the location, required concrete class, and whether you need pumps or just mixers. We respond quickly with schedule and pricing."
        note="Mon – Sat, 08:00 – 20:00 · Reply within 2h"
      >
        <ContactForm />
      </FormSection>
    </div>
  );
}
