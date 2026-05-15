'use client';

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";

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
  const ease = [0.22, 1, 0.36, 1] as const;
  const imageInitial = priority ? { scale: 1, opacity: 1 } : { scale: 1.06, opacity: 0 };

  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        <motion.div
          initial={imageInitial}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease }}
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

      {/* Overlays */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease }}
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.6, ease }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 30%, rgba(244,161,0,0.2) 0%, transparent 40%)",
        }}
      />

      {/* Gold top line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(244,161,0,0.6) 0%, rgba(244,161,0,0.3) 50%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[300px] max-w-6xl flex-col justify-center gap-5 px-4 py-14 sm:min-h-[380px] sm:px-6 sm:py-20 lg:px-8">
        {kicker && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/12 px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {kicker}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.05 }}
          className="font-display max-w-3xl text-4xl font-black leading-[1.0] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
            className="max-w-2xl font-body text-base leading-relaxed text-white/75 sm:text-lg"
          >
            {description}
          </motion.p>
        )}

        {actions && actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            {actions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-bold uppercase tracking-wider transition",
                  i === 0
                    ? "bg-primary text-dark shadow-[0_12px_40px_rgba(244,161,0,0.38)] hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(244,161,0,0.5)]"
                    : "border border-white/25 text-white hover:border-white/50 hover:bg-white/10"
                )}
              >
                {action.label}
                {i === 0 && (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
