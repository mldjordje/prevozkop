'use client';

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

/*
 * Stylised delivery radar: equirectangular plot of the real coordinates of
 * the base (Krušce) and the towns we deliver concrete to, with pulses
 * radiating from the plant.
 */

const BASE = { lat: 43.3292, lon: 21.7812 };
const TOWNS = [
  { name: "Niš", slug: "nis", lat: 43.3209, lon: 21.8958, big: true },
  { name: "Aleksinac", slug: "aleksinac", lat: 43.5417, lon: 21.7078 },
  { name: "Prokuplje", slug: "prokuplje", lat: 43.2342, lon: 21.5881 },
  { name: "Leskovac", slug: "leskovac", lat: 42.9981, lon: 21.9461 },
  { name: "Doljevac", slug: "doljevac", lat: 43.1967, lon: 21.8331 },
  { name: "Merošina", slug: "merosina", lat: 43.2847, lon: 21.7208 },
  { name: "Svrljig", slug: "svrljig", lat: 43.4153, lon: 22.1261 },
  { name: "Gadžin Han", slug: "gadzin-han", lat: 43.2231, lon: 22.0319 },
];

const W = 800;
const H = 620;
const LON0 = 21.45;
const LON1 = 22.3;
const LAT0 = 43.62;
const LAT1 = 42.93;
const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * W;
const py = (lat: number) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;

export default function CoverageMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const bx = px(BASE.lon);
  const by = py(BASE.lat);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[28px] bg-ink" data-reveal-skip>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Zona isporuke betona oko Niša">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(244,161,0,0.35)" />
            <stop offset="100%" stopColor="rgba(244,161,0,0)" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <circle cx={bx} cy={by} r="260" fill="url(#glow)" />

        {/* range rings */}
        {[90, 180, 270].map((r, i) => (
          <motion.circle
            key={r}
            cx={bx}
            cy={by}
            r={r}
            fill="none"
            stroke="rgba(244,161,0,0.28)"
            strokeDasharray="4 8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.6, delay: 0.2 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* radar pulses */}
        {inView &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={bx}
              cy={by}
              fill="none"
              stroke="#f4a100"
              strokeWidth="2"
              initial={{ r: 8, opacity: 0.8 }}
              animate={{ r: 300, opacity: 0 }}
              transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
            />
          ))}

        {/* routes */}
        {TOWNS.map((t, i) => (
          <motion.line
            key={`l-${t.slug}`}
            x1={bx}
            y1={by}
            x2={px(t.lon)}
            y2={py(t.lat)}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.8 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* towns */}
        {TOWNS.map((t, i) => {
          const x = px(t.lon);
          const y = py(t.lat);
          return (
            <motion.g
              key={t.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 1.2 + i * 0.12 }}
            >
              <circle cx={x} cy={y} r={t.big ? 9 : 6} fill="#efede7" />
              <text
                x={x + 14}
                y={y + 5}
                fill="#efede7"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStretch: "66%",
                  fontWeight: 800,
                  fontSize: t.big ? 30 : 20,
                  textTransform: "uppercase",
                }}
              >
                {t.name}
              </text>
            </motion.g>
          );
        })}

        {/* base */}
        <g>
          <rect x={bx - 11} y={by - 11} width="22" height="22" fill="#f4a100" transform={`rotate(45 ${bx} ${by})`} />
          <text
            x={bx - 16}
            y={by - 22}
            textAnchor="end"
            fill="#f4a100"
            style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.18em" }}
          >
            BAZA · KRUŠCE
          </text>
        </g>
      </svg>

      <div className="flex flex-wrap gap-2 border-t border-white/10 p-4 sm:p-5">
        {TOWNS.map((t) => (
          <Link
            key={t.slug}
            href={`/beton/grad/${t.slug}`}
            className="rounded-full border border-white/15 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/75 transition-colors hover:border-primary hover:bg-primary hover:text-ink"
          >
            Beton {t.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
