import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
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
    <div className="space-y-12 sm:space-y-16">
      <PageHero
        title="Order concrete"
        kicker="Mixers & pumps"
        description="Fast concrete delivery with mixers and pumps, plus excavation, grading and demolition services."
        background="/img/kamionislika2.webp"
        actions={[
          { label: "Send order", href: "#form" },
          { label: "Contact", href: "/en/contact" },
        ]}
      />

      <section id="form" className="content-section space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold sm:text-3xl">Tell us what you need</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Quantity, class, location, and whether you need pumps or mixers only. We’ll confirm the
            schedule quickly.
          </p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
