'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { Service } from "@/content/site";
import { ParallaxImage } from "@/components/motion/scroll-effects";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/*
 * Desktop: the section pins and the service cards travel sideways as you
 * scroll down. Mobile: a vertical stack of tall parallax cards.
 */
export default function ServicesScroller({ services }: { services: Service[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useIsoLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const track = trackRef.current;
      if (track) setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(rawX, { stiffness: 140, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <section className="bg-ink pb-20 pt-4 text-white lg:hidden" aria-label="Usluge">
        <div className="content-section space-y-5">
          {services.map((service, i) => (
            <article key={service.title} className="overflow-hidden rounded-[22px] bg-dark-surface">
              <ParallaxImage
                src={service.image}
                alt={service.title}
                sizes="100vw"
                className="aspect-[4/5] w-full"
                strength={10}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                    {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-display text-[2.4rem] font-black uppercase leading-[0.9] text-white [font-stretch:62%]">
                    {service.title}
                  </h3>
                  <p className="mt-3 font-body text-[15px] leading-relaxed text-white/70">{service.description}</p>
                </div>
              </ParallaxImage>
            </article>
          ))}
          <Link href="/usluge" className="btn-outline-white w-full">
            Sve usluge
          </Link>
        </div>
      </section>

    <section
      ref={sectionRef}
      className="relative hidden bg-ink text-white lg:block"
      style={{ height: `calc(100vh + ${distance}px)` }}
      aria-label="Usluge"
      data-reveal-skip
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="content-section mb-8 flex w-full items-end justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/45">
            Skrolujte — usluge se pomeraju
          </p>
          <div className="h-[2px] w-48 overflow-hidden bg-white/10">
            <motion.div className="h-full origin-left bg-primary" style={{ scaleX: progress }} />
          </div>
        </div>

        <motion.div ref={trackRef} className="flex w-max gap-6 pl-12 pr-12" style={{ x }}>
          {services.map((service, i) => (
            <article
              key={service.title}
              data-cursor="Usluga"
              className="group relative h-[68vh] w-[44vw] max-w-[720px] shrink-0 overflow-hidden rounded-[28px] bg-dark-surface"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="45vw"
                className="object-cover transition-transform duration-[1.4s] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <div className="absolute left-7 top-6 font-display text-[7rem] font-black leading-none text-white/10 [font-stretch:62%]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="max-w-[18ch] font-display text-5xl font-black uppercase leading-[0.9] [font-stretch:62%]">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-md font-body text-base leading-relaxed text-white/70 transition-all duration-700 [transition-timing-function:var(--ease-out)] lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
          <Link
            href="/usluge"
            className="group grid h-[68vh] w-[28vw] shrink-0 place-items-center rounded-[28px] border border-white/15 text-center text-white transition-colors duration-500 hover:border-primary hover:bg-primary hover:text-ink"
          >
            <span>
              <span className="block font-display text-6xl font-black uppercase leading-[0.9] [font-stretch:62%]">
                Sve
                <br />
                usluge
              </span>
              <span className="mt-6 inline-grid h-16 w-16 place-items-center rounded-full border border-current transition-transform duration-500 group-hover:rotate-[-45deg]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
    </>
  );
}
