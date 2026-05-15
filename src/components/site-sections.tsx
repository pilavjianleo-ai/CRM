import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ShellCard } from "@/components/shell-card";
import type { SiteFeature } from "@/lib/site-content";

export function FeatureGrid({
  items,
  eyebrow = "Feature",
}: {
  items: SiteFeature[];
  eyebrow?: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <ShellCard key={item.title} title={item.title} eyebrow={eyebrow}>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <Icon className="h-5 w-5 text-emerald-700" />
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          </ShellCard>
        );
      })}
    </div>
  );
}

export function PricingGrid({
  items,
}: {
  items: Array<{
    name: string;
    price: string;
    cadence: string;
    description: string;
    features: string[];
    featured?: boolean;
  }>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((plan) => (
        <ShellCard
          key={plan.name}
          title={plan.name}
          eyebrow={plan.featured ? "Most popular" : "Plan"}
          className={plan.featured ? "border-emerald-200" : ""}
        >
          <p className="text-4xl font-semibold text-slate-950">{plan.price}</p>
          <p className="mt-2 text-sm text-slate-500">{plan.cadence}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description}</p>
          <div className="mt-5 space-y-3">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                <Check className="h-4 w-4 text-emerald-700" />
                {feature}
              </div>
            ))}
          </div>
          <Link
            href="/registrera"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Start with {plan.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ShellCard>
      ))}
    </div>
  );
}

export function FaqGrid({
  items,
}: {
  items: Array<{ title: string; description: string }>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item) => (
        <ShellCard key={item.title} title={item.title} eyebrow="FAQ">
          <p className="text-sm leading-7 text-slate-600">{item.description}</p>
        </ShellCard>
      ))}
    </div>
  );
}

export function ArticleGrid({
  items,
}: {
  items: Array<{
    title: string;
    excerpt: string;
    category: string;
    href: string;
  }>;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {items.map((item) => (
        <ShellCard key={item.title} title={item.title} eyebrow={item.category}>
          <p className="text-sm leading-7 text-slate-600">{item.excerpt}</p>
          <Link
            href={item.href}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-emerald-700"
          >
            Read article
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ShellCard>
      ))}
    </div>
  );
}
