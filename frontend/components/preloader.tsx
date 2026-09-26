"use client";

import { useEffect, useRef, useState } from "react";
import { markPageReady } from "@/lib/page-ready";

/*
 * First-visit preloader: a "batch plant" readout. The wordmark fills with
 * concrete-yellow as the counter climbs, status lines roll through the mixing
 * sequence, then the panel lifts like a curtain.
 *
 * Skipped (via the inline script in layout) on repeat visits in the same
 * session, on /admin, and for prefers-reduced-motion. A CSS failsafe hides it
 * after 6s even if JS never runs.
 */

const STEPS = [
  "Doziramo agregat",
  "Dodajemo cement",
  "Mešamo MB 30",
  "Punimo mikser",
  "Krećemo ka gradilištu",
];

const MIN_DURATION = 2300;
const MAX_DURATION = 4200;

export default function Preloader() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const counterRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("pk-skip")) {
      markPageReady();
      const id = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(id);
    }

    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const start = performance.now();
    let raf = 0;
    let shown = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      // Ease toward 90 while waiting for load, then sprint to 100.
      const timeTarget = Math.min(elapsed / MIN_DURATION, 1);
      const canFinish = (loaded && elapsed >= MIN_DURATION) || elapsed >= MAX_DURATION;
      const target = canFinish ? 100 : Math.min(92, 100 * (1 - Math.pow(1 - timeTarget, 2.2)));
      shown += (target - shown) * (canFinish ? 0.22 : 0.09);
      if (canFinish && 100 - shown < 0.4) shown = 100;

      const value = Math.round(shown);
      if (counterRef.current) counterRef.current.textContent = String(value).padStart(3, "0");
      if (fillRef.current) fillRef.current.style.clipPath = `inset(${100 - shown}% 0 0 0)`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown / 100})`;
      setStep(Math.min(STEPS.length - 1, Math.floor((shown / 100) * STEPS.length)));

      if (shown >= 100) {
        try {
          sessionStorage.setItem("pk-seen", "1");
        } catch {}
        window.setTimeout(() => {
          setPhase("leaving");
          markPageReady();
          window.setTimeout(() => setPhase("done"), 1100);
        }, 180);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="pk-preloader"
      data-phase={phase}
      aria-hidden="true"
    >
      <div className="pk-preloader__panel">
        <div className="pk-preloader__grid" />

        <div className="pk-preloader__top">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Prevoz Kop · Betonska baza
          </span>
          <span className="hidden sm:inline">43.3292° N — 21.7812° E</span>
        </div>

        <div className="pk-preloader__center">
          <div className="pk-preloader__word">
            <span className="pk-preloader__outline">Prevoz Kop</span>
            <div ref={fillRef} className="pk-preloader__fill" style={{ clipPath: "inset(100% 0 0 0)" }}>
              <span>Prevoz Kop</span>
            </div>
          </div>
          <div className="pk-preloader__steps">
            <div
              className="pk-preloader__steps-track"
              style={{ transform: `translateY(-${step * 100}%)` }}
            >
              {STEPS.map((s, i) => (
                <span key={s}>
                  <em>{String(i + 1).padStart(2, "0")}</em> {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pk-preloader__bottom">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            Beton · Behaton · Pumpe · Iskopi
          </div>
          <span ref={counterRef} className="pk-preloader__counter">
            000
          </span>
        </div>

        <div className="pk-preloader__bar">
          <div ref={barRef} style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}
