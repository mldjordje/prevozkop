"use client";

import Link from "next/link";
import { cubicBezier, motion } from "framer-motion";
import { useMemo } from "react";

const ease = cubicBezier(0.22, 1, 0.36, 1);

type Props = {
  title: string;
  kicker: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  phone: string;
};

export default function HeroVideoContent({
  title,
  kicker,
  description,
  ctaLabel,
  ctaHref,
  phone,
}: Props) {
  const words = useMemo(() => title.split(" "), [title]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className="space-y-6 sm:space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          {kicker}
        </span>
      </motion.div>

      <h1
        className="max-w-[15ch] font-display font-black leading-[0.95] tracking-[-0.02em] text-white"
        style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-[0.2em] inline-block last:mr-0"
            initial={{ opacity: 0, y: 22, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, ease, delay: 0.3 + index * 0.09 }}
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.45 }}
        className="max-w-lg text-base leading-relaxed text-white/70 sm:text-lg"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.55 }}
        className="flex flex-wrap items-center gap-3"
      >
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-dark shadow-[0_12px_40px_rgba(244,161,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:opacity-100 hover:shadow-[0_20px_60px_rgba(244,161,0,0.55)]"
        >
          {ctaLabel}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="hidden items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:opacity-100 sm:inline-flex"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Pozovi odmah
        </a>
      </motion.div>
    </motion.div>
  );
}
