'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { HeroSlide } from "@/content/site";

type Props = {
  slides: HeroSlide[];
};

export default function HeroSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0">
        <Image
          src={current.image}
          alt={current.title}
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/60 to-black/40" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {current.kicker}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200">
            Betonska baza · Niš · 24/7 podrška
          </span>
        </div>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {current.title}
          </h1>
          <p className="text-base text-gray-200 sm:text-lg">{current.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={current.ctaHref}
            className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_20px_60px_rgba(244,161,0,0.35)] transition hover:translate-y-[-3px]"
          >
            {current.ctaLabel}
          </Link>
          <Link
            href="/usluge"
            className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
          >
            Pogledaj usluge
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Idi na slajd ${i + 1}`}
              onClick={() => setIndex(i)}
              className={clsx(
                "h-2.5 rounded-full transition-all",
                i === index ? "w-10 bg-primary" : "w-3 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
