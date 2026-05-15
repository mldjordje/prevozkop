'use client';

import { TouchEvent, useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import type { HeroSlide } from "@/content/site";

type Props = { slides: HeroSlide[] };

const ease = cubicBezier(0.22, 1, 0.36, 1);

export default function HeroSlider({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartXRef = useRef<number | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const activeSlide = slides[index];

  /* ── Enable autoplay after first interaction ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const enable = () => setAutoPlay(true);
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, enable, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, enable));
  }, []);

  /* ── Autoplay interval ── */
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
      setProgressKey((k) => k + 1);
    }, 9000);
    return () => clearInterval(id);
  }, [autoPlay, slides.length]);

  /* ── Preload next image ── */
  useEffect(() => {
    if (!autoPlay) return;
    const next = slides[(index + 1) % slides.length];
    if (!next) return;
    const img = new window.Image();
    img.src = next.image;
  }, [autoPlay, index, slides]);

  /* ── GSAP word-by-word text animation ── */
  useEffect(() => {
    if (!titleRef.current) return;
    const spans = titleRef.current.querySelectorAll<HTMLSpanElement>(".hero-word");
    if (!spans.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      spans.forEach((s) => { s.style.opacity = "1"; s.style.transform = "none"; });
      return;
    }

    spans.forEach((s, i) => {
      s.style.opacity = "0";
      s.style.transform = "translateY(18px)";
      s.style.filter = "blur(4px)";
      s.style.transition = `opacity 0.6s cubic-bezier(0.22,1,0.36,1) ${0.35 + i * 0.08}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${0.35 + i * 0.08}s, filter 0.5s ease ${0.35 + i * 0.08}s`;
    });

    const raf = requestAnimationFrame(() => {
      spans.forEach((s) => {
        s.style.opacity = "1";
        s.style.transform = "none";
        s.style.filter = "blur(0px)";
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [index]);

  const words = useMemo(() => activeSlide.title.split(" "), [activeSlide.title]);
  const label = "Betonska baza u Nisu · isporuka · pumpe · zemljani radovi";

  function goTo(i: number) {
    setIndex(i);
    setProgressKey((k) => k + 1);
    setAutoPlay(true);
  }
  function goToPrev() { goTo((index - 1 + slides.length) % slides.length); }
  function goToNext() { goTo((index + 1) % slides.length); }

  function handleTouchStart(e: TouchEvent<HTMLElement>) {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  }
  function handleTouchEnd(e: TouchEvent<HTMLElement>) {
    if (touchStartXRef.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? goToPrev() : goToNext();
  }

  return (
    <section
      className="relative isolate -mt-px overflow-hidden bg-zinc-900 text-white [touch-action:pan-y]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.03, opacity: 0 }}
            transition={{ duration: 1.4, ease }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/88 via-black/70 to-black/45" />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 10% 20%, rgba(244,161,0,0.22) 0%, transparent 40%), radial-gradient(ellipse at 90% 75%, rgba(255,255,255,0.08) 0%, transparent 35%)",
        }}
      />
      {/* Grain on hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-6xl flex-col justify-center gap-6 px-4 py-12 sm:min-h-[72vh] sm:gap-8 sm:px-6 sm:py-20 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease }}
            className="max-w-3xl space-y-5 sm:space-y-7"
          >
            {/* Kicker */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {activeSlide.kicker}
              </span>
              <span className="hidden rounded-full bg-white/8 px-3 py-1.5 font-body text-xs text-white/70 backdrop-blur-sm sm:inline-flex">
                {label}
              </span>
            </div>

            {/* Headline — GSAP word animation */}
            <h1
              ref={titleRef}
              className="font-display text-4xl font-black leading-[1.0] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {words.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="hero-word mr-[0.22em] inline-block last:mr-0"
                  style={{ willChange: "transform, opacity, filter" }}
                >
                  {word}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="max-w-xl font-body text-base leading-relaxed text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-lg">
              {activeSlide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/porucivanje-betona#forma"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-dark shadow-[0_16px_48px_rgba(244,161,0,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(244,161,0,0.5)]"
              >
                {activeSlide.ctaLabel}
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/usluge"
                className="hidden items-center rounded-full border border-white/25 px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:border-white/50 hover:bg-white/10 sm:inline-flex"
              >
                Pogledaj usluge
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation: dots + arrows ── */}
        <div className="flex items-center gap-4">
          {/* Slide dots */}
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Idi na slajd ${i + 1}`}
                onClick={() => goTo(i)}
                className={clsx(
                  "rounded-full transition-all duration-500",
                  i === index
                    ? "h-2 w-8 bg-primary shadow-[0_0_12px_rgba(244,161,0,0.6)]"
                    : "h-2 w-2 bg-white/35 hover:bg-white/60"
                )}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Prethodni slajd"
              onClick={goToPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/16 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sledeci slajd"
              onClick={goToNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/16 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Slide counter */}
          <span className="hidden font-body text-xs font-semibold tabular-nums text-white/40 sm:inline">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        {/* ── Progress bar ── */}
        {autoPlay && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
            <motion.div
              key={`progress-${progressKey}-${index}`}
              className="h-full bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 9, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
