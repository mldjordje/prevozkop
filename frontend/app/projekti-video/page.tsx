import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import JsonLd from "@/components/json-ld";
import VideoCard from "@/components/video-card";
import { CtaBand, SectionHead } from "@/components/sections";
import { videos } from "@/content/site";
import { buildMetadata, SITE_URL, srEnLanguages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Video galerija - isporuka betona, pumpe i zemljani radovi",
  description:
    "Video snimci sa terena: isporuka betona mikserima, pumpe za beton, tamponiranje i priprema terena. Prevoz Kop, betonska baza Niš.",
  path: "/projekti-video",
  image: "/img/kamion3.webp",
  keywords: ["video beton", "isporuka betona video", "pumpa za beton video", "prevoz kop video"],
  languages: srEnLanguages("/projekti-video", "/en/projects"),
});

export default function VideoProjectsPage() {
  const landscape = videos.filter((v) => v.ratio === "landscape");
  const portrait = videos.filter((v) => v.ratio !== "landscape");

  return (
    <div className="bg-cement">
      <PageHero
        title="Video galerija"
        kicker="Na terenu"
        description="YouTube snimci sa isporuke betona, pumpi, tamponiranja i pripreme terena."
        background="/img/kamion3.webp"
        priority
        actions={[{ label: "Pošalji upit", href: "/porucivanje-betona#forma" }]}
      />

      <section className="bg-ink py-24 text-white sm:py-32">
        <div className="content-section">
          <SectionHead
            tone="dark"
            label="Pogledajte nas u akciji"
            lines={["Kratko.", { text: "Sa terena.", className: "text-primary" }]}
            text="Kratki klipovi iz naše baze i sa gradilišta — miksanje, pumpanje, transport i priprema nasipa."
          />

          {landscape.map((video) => (
            <div key={video.youtubeId} className="mb-5">
              <VideoCard video={video} index={videos.indexOf(video)} />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            {portrait.map((video) => (
              <VideoCard key={video.youtubeId} video={video} index={videos.indexOf(video)} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        label="Vaše gradilište"
        lines={["Sledeći snimak", { text: "može biti kod vas", className: "text-primary" }]}
        image="/img/kamion3.webp"
      >
        <Link href="/porucivanje-betona#forma" className="btn-primary">
          Poruči beton
        </Link>
        <Link href="/projekti" className="btn-outline-white">
          Foto galerija
        </Link>
      </CtaBand>

      <JsonLd
        id="video-itemlist-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Video galerija - Prevoz Kop",
          itemListElement: videos.map((video, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "VideoObject",
              name: video.title,
              description: video.title,
              thumbnailUrl: [`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`],
              embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
              contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
              publisher: { "@id": `${SITE_URL}#organization` },
            },
          })),
        }}
      />
    </div>
  );
}
