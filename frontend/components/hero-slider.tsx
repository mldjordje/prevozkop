'use client';

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion, cubicBezier } from "framer-motion";
import type { HeroSlide } from "@/content/site";

type Props = {
  slides: HeroSlide[];
};

const fadeEase = cubicBezier(0.22, 1, 0.36, 1);

export default function HeroSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const activeSlide = slides[index];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 9000);
    return () => clearInterval(id);
  }, [slides.length]);

  // Preload narednog slajda da slike ne kasne u prelazu.
  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    if (!next) return;
    const img = new window.Image();
    img.src = next.image;
  }, [index, slides]);

  const label = useMemo(
    () => "Betonska baza u Nišu · isporuka betona · pumpe · zemljani radovi",
    []
  );

  const goToNext = () => setIndex((prev) => (prev + 1) % slides.length);
  const goToPrev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    setTouchStartX(null);
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-zinc-900 text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.02, opacity: 0 }}
            transition={{ duration: 1.3, ease: fadeEase }}
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
          transition={{ duration: 1, ease: fadeEase }}
          className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/45 to-black/25 sm:from-black/60 sm:via-black/35 sm:to-black/20"
        />
      </AnimatePresence>
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8, rotate: 6 }}
        transition={{ duration: 2.4, ease: fadeEase }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 25%, rgba(244,161,0,0.28), transparent 35%), radial-gradient(circle at 85% 65%, rgba(255,255,255,0.14), transparent 35%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.85, ease: fadeEase }}
            className="space-y-6 rounded-2xl bg-black/15 p-4 shadow-xl ring-1 ring-white/10 backdrop-blur-[2px] sm:max-w-4xl sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0 sm:backdrop-blur-0"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {activeSlide.kicker}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200">{label}</span>
            </div>
            <div className="max-w-4xl space-y-4 drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
              <h1 className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {activeSlide.title}
              </h1>
              <p className="text-pretty text-base text-gray-100 sm:text-lg sm:text-gray-100">
                {activeSlide.description}
              </p>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  i === index
                    ? "w-10 bg-primary"
                    : "w-3 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <button
              type="button"
              onClick={goToPrev}
              className="rounded-full border border-white/30 px-3 py-2 transition hover:border-white hover:bg-white hover:text-dark"
            >
              Prethodni
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="rounded-full bg-white/90 px-3 py-2 text-dark transition hover:bg-white"
            >
              Sledeći
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
