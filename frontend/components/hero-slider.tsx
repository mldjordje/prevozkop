'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type { HeroSlide } from "@/content/site";

type Props = {
  slides: HeroSlide[];
};

const fadeEase = [0.22, 1, 0.36, 1];

export default function HeroSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const activeSlide = slides[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const label = useMemo(
    () => "Betonska baza u Nišu · isporuka betona · pumpe · zemljani radovi",
    []
  );

  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ duration: 1.1, ease: fadeEase }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSlide.image}-overlay`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: fadeEase }}
          className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/35"
        />
      </AnimatePresence>
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.7, ease: fadeEase }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {activeSlide.kicker}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200">{label}</span>
            </div>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {activeSlide.title}
              </h1>
              <p className="text-base text-gray-200 sm:text-lg">{activeSlide.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeSlide.ctaHref}
                className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-dark shadow-[0_20px_60px_rgba(244,161,0,0.35)] transition hover:translate-y-[-3px]"
              >
                {activeSlide.ctaLabel}
              </Link>
              <Link
                href="/usluge"
                className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-dark"
              >
                Pogledaj usluge
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <motion.button
              key={slide.title}
              type="button"
              aria-label={`Idi na slajd ${i + 1}`}
              onClick={() => setIndex(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
