import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import SplitText from "@/components/motion/split-text";
import { ParallaxImage, VelocityMarquee } from "@/components/motion/scroll-effects";

/*
 * Shared editorial building blocks so every page speaks the same visual
 * language as the landing: mono labels, condensed display type, hairline
 * rules, ink/cement contrast.
 */

type Tone = "light" | "dark";
type Line = string | { text: string; className?: string };

const toneText = (tone: Tone) => (tone === "dark" ? "text-white" : "text-ink");
const toneMuted = (tone: Tone) => (tone === "dark" ? "text-white/60" : "text-muted");
const toneRule = (tone: Tone) => (tone === "dark" ? "border-white/12" : "border-ink/15");

/* ── Section heading ───────────────────────────────────────────────────── */

export function SectionHead({
  label,
  lines,
  text,
  tone = "light",
  size = "lg",
  as = "h2",
  aside,
  className,
}: {
  label?: string;
  lines: Line[] | string;
  text?: ReactNode;
  tone?: Tone;
  size?: "xl" | "lg" | "md";
  as?: "h1" | "h2" | "h3" | "p";
  aside?: ReactNode;
  className?: string;
}) {
  const sizes = {
    xl: "display-xl text-[15vw] sm:text-[10vw] lg:text-[7.5vw]",
    lg: "display-xl text-[12.5vw] sm:text-[8vw] lg:text-[5.6vw]",
    md: "font-display text-5xl font-black uppercase leading-[0.9] [font-stretch:62%] sm:text-6xl lg:text-7xl",
  } as const;

  return (
    <div className={clsx("mb-12 grid gap-6 sm:mb-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-end", className)}>
      <div>
        {label && <p className="section-label mb-5">{label}</p>}
        <SplitText as={as} lines={lines} className={clsx(sizes[size], toneText(tone))} />
      </div>
      {(text || aside) && (
        <div className="space-y-5 lg:justify-self-end">
          {text && <p className={clsx("max-w-md font-body text-base leading-relaxed", toneMuted(tone))}>{text}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}

/* ── FAQ accordion (native details → answers stay in HTML for SEO) ─────── */

export function FaqList({
  items,
  tone = "light",
  label = "FAQ",
  title = "Česta pitanja",
}: {
  items: { q: string; a: string }[];
  tone?: Tone;
  label?: string;
  title?: string;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="section-label mb-5">{label}</p>
        <h2 className={clsx("font-display text-5xl font-black uppercase leading-[0.88] [font-stretch:62%] sm:text-7xl", toneText(tone))}>
          {title}
        </h2>
      </div>
      <div className={clsx("border-t", toneRule(tone))}>
        {items.map((item, i) => (
          <details key={item.q} className={clsx("group border-b", toneRule(tone))}>
            <summary className="flex items-center justify-between gap-6 py-6">
              <span className="flex items-baseline gap-5">
                <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={clsx("font-display text-2xl font-extrabold uppercase leading-[1] [font-stretch:70%] sm:text-3xl", toneText(tone))}>
                  {item.q}
                </h3>
              </span>
              <span
                className={clsx(
                  "faq-icon grid h-11 w-11 shrink-0 place-items-center rounded-full border text-xl transition-all duration-500 group-open:border-primary group-open:bg-primary group-open:text-ink",
                  tone === "dark" ? "border-white/20 text-white" : "border-ink/20 text-ink",
                )}
              >
                +
              </span>
            </summary>
            <p className={clsx("max-w-2xl pb-7 pl-9 font-body text-base leading-relaxed", toneMuted(tone))}>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ── Editorial link index (big rows, yellow wipe on hover) ────────────── */

export function LinkIndex({
  links,
}: {
  links: { href: string; title: string; description?: string; image?: string }[];
}) {
  return (
    <ul className="border-t border-ink/15">
      {links.map((link, i) => (
        <li key={link.href + link.title} className="border-b border-ink/15">
          <Link
            href={link.href}
            className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden py-5 text-ink sm:gap-8 sm:py-7"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-y-100" />
            <span className="relative pl-1 font-mono text-[11px] tracking-[0.2em] text-muted group-hover:text-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="relative">
              <span className="block font-display text-3xl font-black uppercase leading-[0.9] transition-transform duration-500 [font-stretch:62%] group-hover:translate-x-3 sm:text-5xl lg:text-6xl">
                {link.title}
              </span>
              {link.description && (
                <span className="mt-2 block font-body text-sm text-muted group-hover:text-ink/75">{link.description}</span>
              )}
            </span>
            {link.image ? (
              <span className="relative mr-1 hidden h-20 w-32 overflow-hidden rounded-xl opacity-0 transition-all duration-500 group-hover:opacity-100 md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={link.image} alt="" loading="lazy" className="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover:scale-100" />
              </span>
            ) : (
              <span className="relative mr-1 grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-transform duration-500 group-hover:rotate-[-45deg] group-hover:border-ink">
                →
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Numbered cards (process / factors) ───────────────────────────────── */

export function NumberedCards({
  items,
  tone = "dark",
  cols = 3,
}: {
  items: { title: string; text: string }[];
  tone?: Tone;
  cols?: 2 | 3 | 4;
}) {
  const grid = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" }[cols];
  return (
    <ol className={clsx("grid gap-px overflow-hidden rounded-[24px]", grid, tone === "dark" ? "bg-white/10" : "bg-ink/10")}>
      {items.map((step, idx) => (
        <li
          key={step.title}
          className={clsx(
            "group relative p-7 transition-colors duration-500 sm:p-9",
            tone === "dark" ? "bg-ink text-white hover:bg-[#1a1916]" : "bg-paper text-ink hover:bg-white",
          )}
        >
          <span className="block font-display text-[5.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(244,161,0,0.75)] [font-stretch:62%] transition-colors duration-500 group-hover:text-primary sm:text-[6.5rem]">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-6 font-display text-3xl font-extrabold uppercase leading-none [font-stretch:66%]">{step.title}</h3>
          <p className={clsx("mt-3 font-body text-[15px] leading-relaxed", toneMuted(tone))}>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/* ── Hairline feature list ────────────────────────────────────────────── */

export function RuleList({ items, tone = "light", big = false }: { items: string[]; tone?: Tone; big?: boolean }) {
  return (
    <ul className={clsx("border-t", toneRule(tone))}>
      {items.map((item, i) => (
        <li key={item} className={clsx("group flex items-baseline gap-6 border-b py-5", toneRule(tone))}>
          <span className="font-mono text-[11px] tracking-[0.2em] text-primary">{String(i + 1).padStart(2, "0")}</span>
          <span
            className={clsx(
              "transition-transform duration-500 group-hover:translate-x-2",
              big
                ? "font-display text-2xl font-extrabold uppercase leading-[1.02] [font-stretch:66%] sm:text-3xl"
                : "font-body text-[16px] font-medium",
              toneText(tone),
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Chip links ───────────────────────────────────────────────────────── */

export function ChipLinks({ links, tone = "light" }: { links: { href: string; label: string }[]; tone?: Tone }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className={clsx(
            "rounded-full border px-4 py-2.5 font-body text-sm font-medium transition-colors",
            tone === "dark"
              ? "border-white/15 text-white hover:border-primary hover:bg-primary hover:text-ink"
              : "border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-white",
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

/* ── City index (dense grid of local-page links) ───────────────────────── */

export function CityIndex({
  cities,
  hrefBase,
  prefix,
  current,
}: {
  cities: { slug: string; name: string; intro?: string }[];
  hrefBase: string;
  prefix: string;
  current?: string;
}) {
  return (
    <ul className="grid grid-cols-2 border-t border-ink/15 sm:grid-cols-3 lg:grid-cols-4">
      {cities.map((city) => (
        <li key={city.slug} className="border-b border-ink/15">
          <Link
            href={`${hrefBase}/${city.slug}`}
            title={city.intro}
            className={clsx(
              "group flex items-center justify-between gap-2 py-4 pr-4 font-body text-[15px] font-medium transition-colors hover:text-primary sm:text-base",
              current === city.slug ? "text-primary" : "text-ink",
            )}
          >
            <span>
              {prefix} {city.name}
            </span>
            <span className="translate-x-[-6px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ── Big marquee band ─────────────────────────────────────────────────── */

export function MarqueeBand({ words, tone = "gold" }: { words: string[]; tone?: "gold" | "ink" }) {
  return (
    <div className={clsx("py-4 sm:py-5", tone === "gold" ? "bg-primary text-ink" : "bg-ink text-white")}>
      <VelocityMarquee baseVelocity={-1.6}>
        {words.map((w) => (
          <span key={w} className="marquee-item font-display text-4xl font-black uppercase [font-stretch:62%] sm:text-6xl">
            {w}
            <span className={clsx("mx-4 inline-block h-3 w-3 rotate-45 sm:h-4 sm:w-4", tone === "gold" ? "bg-ink" : "bg-primary")} />
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}

/* ── Full-bleed CTA band with parallax photo ──────────────────────────── */

export function CtaBand({
  label,
  lines,
  text,
  image = "/img/mikseri.webp",
  children,
  bullets,
}: {
  label?: string;
  lines: Line[];
  text?: string;
  image?: string;
  children?: ReactNode;
  bullets?: string[];
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <ParallaxImage src={image} alt="" sizes="100vw" strength={10} className="!absolute inset-0 opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="content-section relative grid gap-10 py-24 sm:py-32 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          {label && <p className="section-label mb-5">{label}</p>}
          <SplitText lines={lines} className="display-xl text-[14vw] sm:text-[9vw] lg:text-[6.4vw]" />
          {text && <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-white/70 sm:text-lg">{text}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {bullets && (
          <ul className="border-t border-white/15">
            {bullets.map((b, i) => (
              <li key={b} className="flex gap-5 border-b border-white/15 py-4 font-body text-[15px] text-white/80">
                <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ── Form section: sticky pitch on the left, paper card on the right ───── */

export function FormSection({
  id = "forma",
  label = "Upit",
  lines,
  text,
  children,
  extra,
  note = "Pon – Sub, 08:00 – 20:00 · Odgovor u roku od 2h",
}: {
  id?: string;
  label?: string;
  lines: Line[];
  text?: string;
  children: ReactNode;
  extra?: ReactNode;
  note?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
      <div className="content-section grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="section-label mb-5">{label}</p>
          <SplitText lines={lines} className="display-xl text-[13vw] sm:text-[8.5vw] lg:text-[5.4vw]" />
          {text && <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60">{text}</p>}
          <div className="mt-8 space-y-2 font-mono text-[12px] uppercase tracking-[0.16em] text-white/50">
            <a href="tel:+381605887471" className="block font-display text-4xl font-black normal-case tracking-normal text-white [font-stretch:66%] hover:text-primary">
              +381 60 588 7471
            </a>
            <p>{note}</p>
          </div>
          {extra}
        </div>
        <div className="rounded-[28px] bg-paper p-2 text-ink sm:p-3">{children}</div>
      </div>
    </section>
  );
}
