import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export function SitePage({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <SiteShell compact>
      <section className="grid gap-6 border-b border-slate-200 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {primaryCta ? (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-medium text-white shadow-[0_12px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
            >
              {primaryCta.label}
            </Link>
          ) : null}
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </section>

      <div className="pt-10">{children}</div>
    </SiteShell>
  );
}
