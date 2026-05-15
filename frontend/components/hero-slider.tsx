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

  /* ── Autoplay ── */
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

  /* ── Word-by-word reveal ── */
  useEffect(() => {
    if (!titleRef.current) return;
    const spans = titleRef.current.querySelectorAll<HTMLSpanElement>(".hw");
    if (!spans.length) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      spans.forEach((s) => Object.assign(s.style, { opacity: "1", transform: "none", filter: "none" }));
      return;
    }
    spans.forEach((s, i) => {
      Object.assign(s.style, {
        opacity: "0", transform: "translateY(22px)", filter: "blur(5px)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.09}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.09}s, filter 0.55s ease ${0.3 + i * 0.09}s`,
      });
    });
    const raf = requestAnimationFrame(() => {
      spans.forEach((s) => Object.assign(s.style, { opacity: "1", transform: "none", filter: "blur(0px)" }));
    });
    return () => cancelAnimationFrame(raf);
  }, [index]);

  const words = useMemo(() => activeSlide.title.split(" "), [activeSlide.title]);

  function goTo(i: number) { setIndex(i); setProgressKey((k) => k + 1); setAutoPlay(true); }
  function goToPrev() { goTo((index - 1 + slides.length) % slides.length); }
  function goToNext() { goTo((index + 1) % slides.length); }

  function onTouchStart(e: TouchEvent<HTMLElement>) { touchStartXRef.current = e.touches[0]?.clientX ?? null; }
  function onTouchEnd(e: TouchEvent<HTMLElement>) {
    if (touchStartXRef.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchStartXRef.current) - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? goToPrev() : goToNext();
  }

  return (
    <section
      className="relative isolate -mt-px overflow-hidden bg-zinc-950 text-white [touch-action:pan-y]"
      style={{ minHeight: "min(100svh, 820px)" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            initial={{ scale: 1.07, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ duration: 1.5, ease }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.image} alt={activeSlide.title} fill
              priority={index === 0} fetchPriority={index === 0 ? "high" : "auto"}
              sizes="100vw" className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Layered overlays ── */}
      {/* Primary dark vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />
      {/* Gold ambient left */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(ellipse 60% 70% at 0% 60%, rgba(244,161,0,0.18) 0%, transparent 60%)" }}
      />
      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />
      {/* Gold diagonal accent line */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1.5 opacity-70"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(244,161,0,0.8) 25%, rgba(244,161,0,0.4) 70%, transparent 100%)" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-end px-4 sm:px-6 lg:px-8"
        style={{ minHeight: "inherit", paddingBottom: "clamp(80px, 12vw, 140px)", paddingTop: "clamp(60px, 10vw, 100px)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Kicker */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {activeSlide.kicker}
              </span>
            </motion.div>

            {/* ── MEGA headline ── */}
            <h1
              ref={titleRef}
              className="max-w-[15ch] font-display font-black leading-[0.95] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
            >
              {words.map((word, i) => (
                <span key={`${word}-${i}-${index}`} className="hw mr-[0.2em] inline-block last:mr-0"
                  style={{ willChange: "transform, opacity, filter" }}>
                  {word}
                </span>
              ))}
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.45 }}
              className="max-w-lg text-base leading-relaxed text-white/70 sm:text-lg"
            >
              {activeSlide.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.55 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/porucivanje-betona#forma"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(244,161,0,0.55)]"
              >
                {activeSlide.ctaLabel}
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/usluge"
                className="hidden items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 sm:inline-flex"
              >
                Pogledaj usluge
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom bar: dots + arrows + counter ── */}
        <div className="mt-10 flex items-center gap-4 sm:mt-14">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <button key={slide.title} type="button" aria-label={`Slajd ${i + 1}`} onClick={() => goTo(i)}
                className={clsx("rounded-full transition-all duration-500",
                  i === index ? "h-2 w-10 bg-primary" : "h-2 w-2 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Counter */}
          <span className="hidden font-display text-sm font-bold tabular-nums text-white/30 sm:block">
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1 text-white/15">/</span>
            {String(slides.length).padStart(2, "0")}
          </span>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            {[{ fn: goToPrev, label: "Prethodni", icon: "M19 12H5M12 19l-7-7 7-7" }, { fn: goToNext, label: "Sledeci", icon: "M5 12h14M12 5l7 7-7 7" }].map(({ fn, label, icon }) => (
              <button key={label} type="button" aria-label={label} onClick={fn}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/15 active:scale-95"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {autoPlay && (
        <div className="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/10">
          <motion.div
            key={`p-${progressKey}-${index}`}
            className="h-full bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 9, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      )}
    </section>
  );
}
