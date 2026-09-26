import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import { FormSection } from "@/components/sections";
import ContactForm from "@/components/contact-form";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Order Concrete | Prevoz Kop",
  description:
    "Send a concrete request with quantity, class and location. Fast response for mixers and pumps in Niš and southern Serbia.",
  path: "/en/order-concrete",
  locale: "en_US",
  image: "/img/kamionislika2.webp",
  languages: srEnLanguages("/porucivanje-betona", "/en/order-concrete"),
});

export default function OrderConcreteEn() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Order concrete"
        kicker="Mixers & pumps"
        description="Fast concrete delivery with mixers and pumps, plus excavation, grading and demolition services."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Send order", href: "#form" },
          { label: "Contact", href: "/en/contact" },
        ]}
      />
      <FormSection
        id="form"
        label="Order"
        lines={["Tell us what", { text: "you need", className: "text-primary" }]}
        text="Quantity, class, location, and whether you need pumps or mixers only. We’ll confirm the schedule quickly."
        note="Mon – Sat, 08:00 – 20:00 · Reply within 2h"
      >
        <ContactForm />
      </FormSection>
    </div>
  );
}
