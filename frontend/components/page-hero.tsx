'use client';

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ScrollReveal } from "./motion/reveal";

type Props = {
  title: string;
  kicker?: string;
  description?: string;
  background: string;
  actions?: { label: string; href: string }[];
  priority?: boolean;
};

export default function PageHero({
  title,
  kicker,
  description,
  background,
  actions,
  priority = false,
}: Props) {
  const imageInitial = priority ? { scale: 1, opacity: 1 } : { scale: 1.08, opacity: 0 };

  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0">
        <motion.div
          initial={imageInitial}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={background}
            alt=""
            fill
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/60 to-black/30"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9, rotate: 8 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(244,161,0,0.25), transparent 38%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 32%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-[320px] max-w-6xl flex-col justify-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
        {kicker && (
          <ScrollReveal>
            <span className="inline-flex w-fit rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {kicker}
            </span>
          </ScrollReveal>
        )}
        <ScrollReveal>
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
        </ScrollReveal>
        {description && (
          <ScrollReveal delay={0.05}>
            <p className="max-w-2xl text-base text-gray-200 sm:text-lg">{description}</p>
          </ScrollReveal>
        )}

        {actions && actions.length > 0 && (
          <ScrollReveal delay={0.12}>
            <div className="flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                    "bg-primary text-dark shadow-[0_12px_40px_rgba(244,161,0,0.35)] hover:translate-y-[-2px]"
                  )}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
