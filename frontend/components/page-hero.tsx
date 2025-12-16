import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type Props = {
  title: string;
  kicker?: string;
  description?: string;
  background: string;
  actions?: { label: string; href: string }[];
  priority?: boolean;
};

export default function PageHero({
  title,
  kicker,
  description,
  background,
  actions,
  priority = false,
}: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0">
        <Image
          src={background}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/30" />
      <div className="relative z-10 mx-auto flex min-h-[320px] max-w-6xl flex-col justify-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
        {kicker && (
          <span className="inline-flex w-fit rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {kicker}
          </span>
        )}
        <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-base text-gray-200 sm:text-lg">{description}</p>
        )}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                  "bg-primary text-dark shadow-[0_10px_40px_rgba(244,161,0,0.35)] hover:translate-y-[-2px]"
                )}
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
