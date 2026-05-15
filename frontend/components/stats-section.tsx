'use client';

import { useEffect, useRef, useState } from "react";
import type { Stat } from "@/content/site";

function useCountUp(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [start, end, duration]);

  return count;
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rawNum = parseInt(stat.value.replace(/\D/g, ""), 10) || 0;
  const suffix = stat.value.replace(/[\d\s]/g, "");
  const count = useCountUp(rawNum, 1600, visible);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 py-2 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="font-display text-5xl font-black leading-none text-primary sm:text-6xl lg:text-7xl">
        {visible ? count : 0}
        {suffix}
      </span>
      <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {stat.label}
      </span>
    </div>
  );
}

type Props = { stats: Stat[] };

export default function StatsSection({ stats }: Props) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--c-dark)" }}
    >
      {/* Gold gradient edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(244,161,0,0.5) 40%, rgba(244,161,0,0.5) 60%, transparent)" }}
      />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(244,161,0,0.6) 0%, transparent 70%)" }}
      />

      <div className="content-section relative z-10 py-14 sm:py-20">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 100} />
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(244,161,0,0.3) 40%, rgba(244,161,0,0.3) 60%, transparent)" }}
      />
    </section>
  );
}
