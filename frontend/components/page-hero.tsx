'use client';

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion, useScroll, useTransform } from "framer-motion";
import SplitText from "@/components/motion/split-text";
import { usePageReady } from "@/lib/page-ready";

type Props = {
  title: string;
  kicker?: string;
  description?: string;
  background: string;
  actions?: { label: string; href: string }[];
  priority?: boolean;
};

const ease = [0.16, 1, 0.3, 1] as const;

export default function PageHero({
  title,
  kicker,
  description,
  background,
  actions,
  priority = false,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const ready = usePageReady();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-ink text-white"
      data-reveal-skip
    >
      <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={ready ? { clipPath: "inset(0 0 0% 0)" } : {}}
          transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
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
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

      <motion.div
        className="relative z-10 mx-auto flex min-h-[64svh] max-w-[1360px] flex-col justify-end gap-6 px-5 pb-12 pt-20 sm:min-h-[70vh] sm:px-8 sm:pb-16 lg:px-12"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {kicker && (
          <motion.p
            className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/75"
            initial={{ opacity: 0, x: -16 }}
            animate={ready ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease }}
          >
            <span className="h-2 w-2 bg-primary" />
            {kicker}
          </motion.p>
        )}

        <SplitText
          as="h1"
          trigger="ready"
          delay={0.1}
          stagger={0.05}
          lines={title}
          className="max-w-[18ch] font-display text-[13vw] font-black uppercase leading-[0.86] [font-stretch:62%] sm:text-7xl lg:text-8xl xl:text-[7.5rem]"
        />

        <div className="flex flex-col gap-6 border-t border-white/15 pt-6 md:flex-row md:items-end md:justify-between">
          {description && (
            <motion.p
              className="max-w-2xl font-body text-base leading-relaxed text-white/75 sm:text-lg"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 1, ease, delay: 0.45 }}
            >
              {description}
            </motion.p>
          )}

          {actions && actions.length > 0 && (
            <motion.div
              className="flex shrink-0 flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease, delay: 0.6 }}
            >
              {actions.map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={clsx(i === 0 ? "btn-primary" : "btn-outline-white")}
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
      </motion.div>
    </section>
  );
}
