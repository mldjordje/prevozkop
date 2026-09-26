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
    <div ref={ref} className="group relative flex flex-col justify-between gap-10 border-white/10 p-6 sm:p-8 [&:not(:last-child)]:border-b lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r">
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
        {String(delay / 100 + 1).padStart(2, "0")} — {stat.label}
      </span>
      <span className="font-display text-[5.5rem] font-black leading-[0.8] text-white [font-stretch:62%] transition-colors duration-500 group-hover:text-primary sm:text-[7.5rem] xl:text-[9rem]">
        {visible ? count : 0}
        <span className="text-primary">{suffix}</span>
      </span>
    </div>
  );
}

type Props = { stats: Stat[] };

export default function StatsSection({ stats }: Props) {
  return (
    <section className="relative overflow-hidden bg-ink text-white" data-reveal-skip>
      <div className="content-section py-6 sm:py-10">
        <div className="grid overflow-hidden rounded-[28px] border border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
