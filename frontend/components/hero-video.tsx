// Server Component — no 'use client' needed
// Pure HTML video + CSS overlays render on the server; only text animations are client-side

import HeroVideoContent from "@/components/hero-video-content";
import { company } from "@/content/site";

type Props = {
  title: string;
  kicker: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function HeroVideo({ title, kicker, description, ctaLabel, ctaHref }: Props) {
  return (
    <section
      className="relative isolate -mt-px overflow-hidden bg-zinc-950 text-white"
      style={{ minHeight: "min(100svh, 820px)" }}
    >
      {/* ── Video background ─────────────────────────────── */}
      {/* Portrait video — shown on mobile only (< md) */}
      <video
        className="absolute inset-0 h-full w-full object-cover md:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="https://api.prevozkop.rs/video/hero-mobile.mp4" type="video/mp4" />
      </video>

      {/* Landscape video — shown on tablet/desktop (>= md) */}
      <video
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="https://api.prevozkop.rs/video/hero-desktop.mp4" type="video/mp4" />
      </video>

      {/* ── Layered overlays ─────────────────────────────── */}
      {/* Primary dark vignette left-to-right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
      {/* Bottom fade for content legibility */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 to-transparent" />
      {/* Gold ambient radial left */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 0% 60%, rgba(244,161,0,0.18) 0%, transparent 60%)",
        }}
      />
      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
      {/* Gold diagonal accent line on left edge */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1.5 opacity-70"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(244,161,0,0.8) 25%, rgba(244,161,0,0.4) 70%, transparent 100%)",
        }}
      />

      {/* ── Content ──────────────────────────────────────── */}
      <div
        className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-4 sm:px-6 lg:px-8"
        style={{
          minHeight: "inherit",
          paddingBottom: "clamp(80px, 12vw, 140px)",
          paddingTop: "clamp(60px, 10vw, 100px)",
        }}
      >
        {/* Client component handles only the animated text */}
        <HeroVideoContent
          title={title}
          kicker={kicker}
          description={description}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
          phone={company.phone}
        />
      </div>
    </section>
  );
}
