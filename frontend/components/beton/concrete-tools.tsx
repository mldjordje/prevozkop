'use client';

import { useMemo, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useQuickInquiry } from "@/components/quick-inquiry";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── MB strength scale ─────────────────────────────────────────────────── */

export type MbClass = { klasa: string; cvrstoca: string; namena: string };

export function MbScale({ rows }: { rows: MbClass[] }) {
  const [active, setActive] = useState(2);
  return (
    <div data-reveal-skip className="border-t border-white/12">
      {rows.map((row, i) => {
        const isActive = active === i;
        return (
          <button
            key={row.klasa}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className="group relative block w-full border-b border-white/12 text-left"
          >
            <motion.span
              className="absolute inset-y-0 left-0 origin-left bg-primary"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: (i + 1) / rows.length }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.4, ease, delay: i * 0.08 }}
              style={{ width: "100%", opacity: isActive ? 1 : 0.14 }}
            />
            <span className="relative grid grid-cols-[1fr_auto] items-center gap-4 px-2 py-5 sm:grid-cols-[1.1fr_0.7fr_1.6fr] sm:py-7">
              <span
                className={clsx(
                  "font-display text-4xl font-black uppercase leading-none transition-colors duration-300 [font-stretch:62%] sm:text-6xl",
                  isActive ? "text-ink" : "text-white",
                )}
              >
                {row.klasa}
              </span>
              <span
                className={clsx(
                  "font-mono text-[12px] uppercase tracking-[0.14em] transition-colors duration-300",
                  isActive ? "text-ink/80" : "text-white/50",
                )}
              >
                {row.cvrstoca}
              </span>
              <span
                className={clsx(
                  "col-span-2 font-body text-[15px] leading-snug transition-colors duration-300 sm:col-span-1",
                  isActive ? "text-ink" : "text-white/65",
                )}
              >
                {row.namena}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Concrete volume calculator ────────────────────────────────────────── */

const SHAPES = [
  { id: "ploca", label: "Ploča / pod", thickness: 15 },
  { id: "temelj", label: "Trakasti temelj", thickness: 60 },
  { id: "stuba", label: "Staza / prilaz", thickness: 10 },
] as const;

const MIXER_M3 = 8; // okvirni kapacitet jedne ture miksera

function Field({
  label,
  unit,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55">{label}</span>
      <span className="mt-2 flex items-center rounded-2xl bg-cement px-4 transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(244,161,0,0.3)]">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full bg-transparent py-4 font-display text-3xl font-black text-ink outline-none [font-stretch:66%]"
        />
        <span className="font-mono text-[12px] text-ink/50">{unit}</span>
      </span>
    </label>
  );
}

export function ConcreteCalculator() {
  const quickInquiry = useQuickInquiry();
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("ploca");
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(8);
  const [thickness, setThickness] = useState(15);
  const [reserve, setReserve] = useState(true);

  const { volume, tours } = useMemo(() => {
    const raw = (length || 0) * (width || 0) * ((thickness || 0) / 100);
    const v = reserve ? raw * 1.05 : raw;
    return { volume: Math.round(v * 10) / 10, tours: Math.max(1, Math.ceil(v / MIXER_M3)) };
  }, [length, width, thickness, reserve]);

  return (
    <div data-reveal-skip className="grid overflow-hidden rounded-[28px] bg-paper text-ink lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-6 sm:p-10">
        <div className="mb-6 flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setShape(s.id);
                setThickness(s.thickness);
              }}
              className={clsx(
                "rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                shape === s.id ? "bg-ink text-white" : "bg-cement text-ink/70 hover:text-ink",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Dužina" unit="m" value={length} onChange={setLength} />
          <Field label={shape === "temelj" ? "Širina temelja" : "Širina"} unit="m" value={width} onChange={setWidth} />
          <Field label={shape === "temelj" ? "Dubina" : "Debljina"} unit="cm" value={thickness} onChange={setThickness} step={1} />
        </div>
        <label className="mt-6 flex cursor-pointer items-center gap-3 font-body text-sm text-ink/70">
          <input
            type="checkbox"
            checked={reserve}
            onChange={(e) => setReserve(e.target.checked)}
            className="h-5 w-5 accent-[#f4a100]"
          />
          Dodaj 5% rezerve (preporučeno zbog neravnina i gubitaka)
        </label>
        <p className="mt-6 font-body text-xs leading-relaxed text-ink/45">
          Kalkulacija je okvirna. Tačnu količinu i MB klasu potvrđujemo prema projektu i stanju na
          gradilištu.
        </p>
      </div>

      <div className="relative flex flex-col justify-between gap-8 overflow-hidden bg-ink p-6 text-white sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[90px]" />
        <div className="relative">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50">Potrebno betona</p>
          <motion.p
            key={volume}
            initial={{ y: 16, opacity: 0.2 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease }}
            className="mt-2 font-display text-[6.5rem] font-black leading-[0.8] text-primary [font-stretch:62%] sm:text-[8.5rem]"
          >
            {volume.toLocaleString("sr-RS")}
            <span className="ml-2 text-4xl text-white">m³</span>
          </motion.p>
          <p className="mt-5 font-body text-[15px] text-white/70">
            ≈ <strong className="text-white">{tours}</strong> {tours === 1 ? "tura miksera" : "ture miksera"} (okvirno ~{MIXER_M3} m³ po turi)
          </p>
        </div>
        <button
          type="button"
          className="btn-primary relative w-full"
          onClick={() =>
            quickInquiry.open({ service: "beton", product: `Kalkulator: ${volume} m³`, origin: "concrete_calculator" })
          }
        >
          Pošalji upit za {volume.toLocaleString("sr-RS")} m³
        </button>
      </div>
    </div>
  );
}
