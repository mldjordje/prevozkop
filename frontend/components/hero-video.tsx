'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import SplitText from "@/components/motion/split-text";
import { usePageReady } from "@/lib/page-ready";
import { useQuickInquiry } from "@/components/quick-inquiry";
import { company } from "@/content/site";

const ease = [0.16, 1, 0.3, 1] as const;
const easeIn = cubicBezier(0.7, 0, 0.84, 0);
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/*
 * "Window into the pour" hero.
 *
 * Act 1 — the footage is only visible *through* a giant BETON wordmark
 *          (an ink layer with white type, blended with `multiply`).
 * Act 2 — scrolling dives through the stem of the T until the footage
 *          fills the screen.
 * Act 3 — the headline, copy and CTAs rise over the now full-bleed video.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = usePageReady();
  const quickInquiry = useQuickInquiry();
  const [origin, setOrigin] = useState("50% 55%");
  const [act3, setAct3] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.35 });

  // Act 1 → 2
  const maskScale = useTransform(p, [0, 0.55], [1, 70], { ease: easeIn });
  const maskOpacity = useTransform(p, [0.4, 0.56], [1, 0]);
  const chromeOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const chromeY = useTransform(p, [0, 0.12], [0, -24]);
  const videoScale = useTransform(p, [0, 0.6], [1.25, 1]);
  // Act 3
  const shade = useTransform(p, [0.5, 0.75, 1], [0, 0.45, 0.65]);
  const progressRing = useTransform(p, [0, 1], [0, 1]);

  useMotionValueEvent(p, "change", (v) => setAct3(v > 0.58));

  // Aim the zoom at the middle of the T's stem so the dive lands on footage.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const t = tRef.current;
      const mask = maskRef.current;
      if (!t || !mask) return;
      const tr = t.getBoundingClientRect();
      const mr = mask.getBoundingClientRect();
      const x = tr.left + tr.width / 2 - mr.left;
      const y = tr.top + tr.height * 0.6 - mr.top;
      setOrigin(`${x}px ${y}px`);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section ref={ref} className="relative h-[230svh] bg-ink sm:h-[260svh]" data-reveal-skip>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Footage */}
        <motion.div className="absolute inset-0" style={{ scale: videoScale }}>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/img/napolje1.webp"
            aria-hidden="true"
          >
            <source media="(max-width: 767px)" src="https://api.prevozkop.rs/video/hero-mobile.mp4" type="video/mp4" />
            <source src="https://api.prevozkop.rs/video/hero-desktop.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: shade }} />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/90 to-transparent transition-opacity duration-700"
          style={{ opacity: act3 ? 1 : 0 }}
        />

        {/* Act 1: wordmark window (multiply: white type reveals the video) */}
        <motion.div
          ref={maskRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#2a2824] mix-blend-multiply will-change-transform"
          style={{ scale: maskScale, opacity: maskOpacity, transformOrigin: origin }}
        >
          <motion.span
            className="display-xl block select-none whitespace-nowrap text-[min(36vw,64svh)] leading-[0.8] text-white"
            initial={{ opacity: 0, y: "8%", letterSpacing: "0.08em" }}
            animate={ready ? { opacity: 1, y: "0%", letterSpacing: "-0.02em" } : {}}
            transition={{ duration: 1.6, ease }}
          >
            BE<span ref={tRef}>T</span>ON
          </motion.span>
        </motion.div>

        {/* Act 1 chrome */}
        <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ opacity: chromeOpacity, y: chromeY }}>
          <div className="mx-auto flex h-full max-w-[1360px] flex-col justify-between px-5 pb-28 pt-[calc(var(--nav-h)+1.5rem)] sm:px-8 md:pb-10 lg:px-12">
            <motion.div
              className="flex items-start justify-between font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/60"
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Betonska baza · Krušce, Niš
              </span>
              <span className="hidden text-right sm:block">
                MB 10 — MB 40
                <br />
                Mikseri · Pumpe · Behaton
              </span>
            </motion.div>

            <motion.div
              className="pointer-events-auto flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.1, ease, delay: 0.8 }}
            >
              <p className="max-w-sm font-body text-[15px] leading-relaxed text-white/75">
                Betonska baza iz Niša. Gotov beton, pumpe i zemljani radovi — i behaton za celu Srbiju.
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => quickInquiry.open({ service: "beton", origin: "home_hero" })}
                >
                  Poruči beton
                </button>
                <span className="hidden items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/55 md:flex">
                  <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#f4a100"
                      strokeWidth="1.5"
                      style={{ pathLength: progressRing }}
                    />
                  </svg>
                  Skrolujte u beton
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Act 3: headline over full footage */}
        <div
          className="absolute inset-0 z-20 mx-auto flex max-w-[1360px] flex-col justify-end px-5 pb-28 sm:px-8 md:pb-12 lg:px-12"
          style={{ pointerEvents: act3 ? "auto" : "none" }}
        >
          <motion.p
            className="mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/75"
            initial={false}
            animate={act3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, ease }}
          >
            <span className="h-2 w-2 bg-primary" />
            Isporuka betona · Niš i okolina
          </motion.p>
          <SplitText
            as="p"
            active={act3}
            stagger={0.06}
            className="display-xl text-[min(18vw,14svh)] text-white sm:text-[min(14vw,17svh)] lg:text-[min(10.5vw,19svh)]"
            lines={[{ text: "Beton koji" }, { text: "stiže na vreme.", className: "text-primary" }]}
          />
          <motion.div
            className="mt-7 grid gap-6 border-t border-white/15 pt-6 md:grid-cols-[1fr_auto] md:items-end"
            initial={false}
            animate={act3 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 24, filter: "blur(8px)" }}
            transition={{ duration: 0.9, ease, delay: act3 ? 0.35 : 0 }}
          >
            <p className="max-w-xl font-body text-base leading-relaxed text-white/75 sm:text-lg">
              Gotov beton sa sopstvene baze, mikseri i visinske pumpe za Niš i okolinu — i behaton
              za dvorišta, prilaze i parkinge širom Srbije.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => quickInquiry.open({ service: "beton", origin: "home_hero_act3" })}
              >
                Poruči beton
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <Link href="/behaton" className="btn-outline-white">
                Katalog behatona
              </Link>
              <a href="tel:+381605887471" className="btn-outline-white hidden lg:inline-flex">
                {company.phone}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
