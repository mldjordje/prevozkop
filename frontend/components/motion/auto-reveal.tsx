"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { onPageReady } from "@/lib/page-ready";

/*
 * Site-wide text reveal. Every heading, paragraph, list item, label and button
 * in <main>/<footer> fades up out of a soft blur as it enters the viewport,
 * staggered per batch. Elements that own their animation opt out with
 * `data-reveal-skip` (on themselves or an ancestor).
 *
 * Content stays in the server HTML (SEO) — only a class is toggled.
 */

const SELECTOR = [
  "h1", "h2", "h3", "h4", "h5", "p", "li", "dt", "dd", "blockquote", "figcaption",
  "label", "summary", ".section-label", ".btn-primary", ".btn-outline", ".btn-outline-white",
  "[data-reveal]",
]
  .map((tag) => `:is(main, footer) ${tag}`)
  .join(",");

const SKIP = "[data-reveal-skip], .ar-done, header, dialog, [role='dialog']";

export default function AutoReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    // First paint of a repeat visit already showed the SSR HTML (no preloader
    // curtain) — only hide what is still below the fold, to avoid a flash.
    const curtainUp = !root.classList.contains("pk-ready") && !root.classList.contains("pk-skip");
    const vh = window.innerHeight;

    const targets: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      if (el.closest(SKIP)) return;
      if (el.classList.contains("ar")) return;
      // Nested match (p inside li): let the outer element carry the motion.
      if (el.parentElement?.closest(".ar")) return;
      if (!curtainUp && root.classList.contains("pk-ready") === false && el.getBoundingClientRect().top < vh) return;
      el.classList.add("ar");
      targets.push(el);
    });

    let queue: HTMLElement[] = [];
    let flushRaf = 0;
    const flush = () => {
      flushRaf = 0;
      queue
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i * 70, 560)}ms`;
          el.classList.add("ar-in");
          window.setTimeout(() => {
            el.style.transitionDelay = "";
          }, 1600 + i * 70);
        });
      queue = [];
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          queue.push(entry.target as HTMLElement);
        });
        if (queue.length && !flushRaf) flushRaf = requestAnimationFrame(flush);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const stop = onPageReady(() => targets.forEach((el) => io.observe(el)));
    return () => {
      stop();
      io.disconnect();
      if (flushRaf) cancelAnimationFrame(flushRaf);
    };
  }, [pathname]);

  return null;
}
