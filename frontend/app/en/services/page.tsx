import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import Link from "next/link";
import { CtaBand, NumberedCards, SectionHead } from "@/components/sections";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Services | Prevoz Kop",
  description:
    "Concrete delivery, demolition, excavation, grading and transport services across Niš and southern Serbia.",
  path: "/en/services",
  locale: "en_US",
  image: "/img/volvonov2.webp",
  languages: srEnLanguages("/usluge", "/en/services"),
});

const items = [
  { title: "Concrete delivery", text: "Mixers and pumps, controlled slump, on-time dispatch, site logistics." },
  { title: "Demolition", text: "Selective demolition, debris removal and transport." },
  { title: "Excavation & grading", text: "Foundations, trenches, embankments and backfill." },
  { title: "Bulk transport", text: "Sand, gravel, stone, crushed concrete, soil." },
  { title: "Site prep", text: "Compaction, subbase, access planning and haul roads." },
  { title: "Project support", text: "Material sourcing, scheduling, on-site supervision." },
];

export default function ServicesEn() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Services"
        kicker="What we offer"
        description="Concrete production and delivery, demolition, excavation, grading and transport of bulk materials across Niš and southern Serbia."
        background="/img/volvonov2.webp"
        priority
        actions={[{ label: "Order concrete", href: "/en/order-concrete#form" }]}
      />
      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Core services"
            lines={["Turnkey", { text: "site support", className: "text-primary" }]}
            text="Heavy-duty support for residential, commercial and industrial projects."
          />
          <NumberedCards items={items} />
        </div>
      </section>
      <CtaBand lines={["Need concrete", { text: "on site?", className: "text-primary" }]} image="/img/mikseri.webp">
        <Link href="/en/order-concrete#form" className="btn-primary">
          Order concrete
        </Link>
      </CtaBand>
    </div>
  );
}
