import PageHero from "@/components/page-hero";
import { ScrollReveal, StaggerReveal } from "@/components/motion/reveal";
import TiltCard from "@/components/motion/tilt-card";
import { videos } from "@/content/site";

export default function VideoProjectsPage() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <PageHero
        title="Video galerija"
        kicker="Na terenu"
        description="YouTube snimci sa isporuke betona, pumpi, tamponiranja i pripreme terena."
        background="/img/kamion3.webp"
        priority
        actions={[{ label: "Pošalji upit", href: "/porucivanje-betona#forma" }]}
      />

      <section className="content-section space-y-8">
        <ScrollReveal className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Pogledajte nas u akciji
          </span>
          <h2 className="text-3xl font-bold text-dark sm:text-4xl">YouTube projekti</h2>
          <p className="max-w-3xl text-sm text-gray-700">
            Kratki klipovi iz naše baze i sa gradilišta — miksanje, pumpanje, transport i priprema
            nasipa.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {videos.map((video) => (
            <ScrollReveal key={video.youtubeId} from="up" className="h-full">
              <TiltCard className="flex h-full flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-md">
                <div
                  className={
                    video.ratio === "landscape"
                      ? "aspect-video overflow-hidden rounded-xl"
                      : "aspect-[9/16] overflow-hidden rounded-xl"
                  }
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-dark">{video.title}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">YouTube</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </StaggerReveal>
      </section>
    </div>
  );
}
