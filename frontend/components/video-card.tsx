'use client';

import { useState } from "react";
import clsx from "clsx";
import type { Video } from "@/content/site";

/*
 * YouTube facade: a poster with a big play disc. The real iframe loads only
 * after a click — faster pages, and it feels like a curated reel.
 */
export default function VideoCard({ video, index }: { video: Video; index: number }) {
  const [playing, setPlaying] = useState(false);
  const portrait = video.ratio !== "landscape";

  return (
    <figure
      className={clsx(
        "group relative overflow-hidden rounded-[24px] bg-dark-surface",
        portrait ? "aspect-[9/16]" : "aspect-video",
      )}
      data-cursor={playing ? undefined : "Pusti"}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 text-left"
          aria-label={`Pusti video: ${video.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.35] object-cover transition-transform duration-[1.2s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.45]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30" />
          <span className="absolute left-4 top-4 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-white/85 backdrop-blur">
            {String(index + 1).padStart(2, "0")} · {portrait ? "Short" : "Video"}
          </span>
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-ink shadow-[0_20px_60px_-10px_rgba(244,161,0,0.8)] transition-transform duration-500 group-hover:scale-110">
            <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <figcaption className="absolute inset-x-0 bottom-0 p-5">
            <span className="block font-display text-3xl font-black uppercase leading-[0.92] text-white [font-stretch:62%]">
              {video.title}
            </span>
          </figcaption>
        </button>
      )}
    </figure>
  );
}
