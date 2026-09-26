import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import Link from "next/link";
import StatsSection from "@/components/stats-section";
import { CtaBand, RuleList, SectionHead } from "@/components/sections";
import { ParallaxImage } from "@/components/motion/scroll-effects";
import { stats } from "@/content/site";
import { buildMetadata, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About | Prevoz Kop",
  description:
    "Family construction business focused on concrete delivery, earthworks and reliable site logistics.",
  path: "/en/about",
  locale: "en_US",
  image: "/img/volvonov2.webp",
  languages: srEnLanguages("/o-nama", "/en/about"),
});

export default function AboutEn() {
  return (
    <div className="bg-cement">
      <PageHero
        title="About Prevoz Kop"
        kicker="Family business"
        description="We produce and deliver concrete, demolish structures, perform excavation and earthworks, and transport bulk materials with our own fleet and crew."
        background="/img/volvonov2.webp"
        priority
      />

      <section className="content-section py-24 sm:py-32">
        <SectionHead
          label="Since 2020"
          lines={["Reliable partner", { text: "on site", className: "text-primary" }]}
          text="Heavy-duty experience in Niš and southern Serbia. We plan access, choose the right machinery, deliver concrete on schedule and keep your site tidy and safe."
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <ParallaxImage src="/img/radnici1.webp" alt="Prevoz Kop crew" className="aspect-[4/5] rounded-[28px]" sizes="(max-width:1024px) 100vw, 50vw" />
          <div className="flex flex-col justify-between gap-10">
            <RuleList
              big
              items={[
                "Own concrete base and logistics with mixers and pumps",
                "Modern machinery for excavation, grading and demolition",
                "Crew that coordinates suppliers and schedules deliveries",
                "Transparent pricing and clear communication in Serbian/English",
              ]}
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/en/order-concrete#form" className="btn-primary">
                Order concrete
              </Link>
              <Link href="/en/contact" className="btn-outline">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StatsSection stats={stats} />

      <CtaBand lines={["Let’s talk about", { text: "your site", className: "text-primary" }]} image="/img/napolje2.webp">
        <Link href="/en/order-concrete#form" className="btn-primary">
          Send a request
        </Link>
      </CtaBand>
    </div>
  );
}
