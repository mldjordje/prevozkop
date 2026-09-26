import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import ProjectsGrid from "@/app/projekti/projects-grid";
import { CtaBand, MarqueeBand, NumberedCards, SectionHead } from "@/components/sections";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Prevoz Kop | Concrete delivery and earthworks in Serbia",
  description:
    "Concrete production and delivery with mixers and pumps, excavation, demolition and earthworks across Niš and southern Serbia.",
  path: "/en",
  locale: "en_US",
  image: "/img/kamionislika2.webp",
  languages: srEnLanguages("/", "/en"),
});

const services = [
  { title: "Concrete delivery", text: "Mixers and pumps, on time and on spec." },
  { title: "Demolition", text: "Safe takedown of houses, halls and industrial objects." },
  { title: "Earthworks", text: "Excavation, grading, embankment and backfill." },
  { title: "Transport", text: "Bulk materials with tipper trucks and trailers." },
  { title: "Project support", text: "Site visits, logistics planning, material sourcing." },
  { title: "Recycling", text: "Concrete rubble removal and site cleanup." },
];

export default function HomeEn() {
  return (
    <div className="bg-cement">
      <PageHero
        title="Concrete supply, demolition and earthworks"
        kicker="Prevoz Kop"
        description="Concrete production and delivery with mixers and pumps, excavation, demolition, grading and transport of bulk materials across Niš and southern Serbia."
        background="/img/kamionislika2.webp"
        priority
        actions={[
          { label: "Order concrete", href: "/en/order-concrete#form" },
          { label: "Contact us", href: "/en/contact" },
        ]}
      />

      <MarqueeBand words={["Concrete", "Pumps", "Earthworks", "Demolition", "Transport", "Paving"]} />

      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Services"
            lines={["What", { text: "we do", className: "text-primary" }]}
            text="Concrete production and transport (mixers, pumps), demolition of structures, excavation, grading and all heavy-duty earthworks with modern machinery."
            aside={
              <Link href="/en/services" className="btn-outline-white">
                All services
              </Link>
            }
          />
          <NumberedCards items={services} />
        </div>
      </section>

      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Recent work"
          lines={["Project", { text: "gallery", className: "text-outline" }]}
          text="A selection of our recent jobs. For full descriptions and galleries open a project page."
          aside={
            <Link href="/en/projects" className="btn-outline">
              All projects
            </Link>
          }
        />
        <ProjectsGrid limit={6} />
      </section>

      <CtaBand lines={["Concrete that", { text: "arrives on time.", className: "text-primary" }]} image="/img/mikseri.webp">
        <Link href="/en/order-concrete#form" className="btn-primary">
          Order concrete
        </Link>
      </CtaBand>
    </div>
  );
}
