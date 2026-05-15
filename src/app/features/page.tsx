import { FeatureGrid } from "@/components/site-sections";
import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";
import { featurePillars, productModules } from "@/lib/site-content";

export default function Page() {
  return (
    <SitePage eyebrow="Platform" title="A structured feature system instead of random functionality" description="Every module belongs somewhere, follows one consistent logic, and supports the same operational flow from first touch to retention." primaryCta={{ label: "Start free", href: "/registrera" }} secondaryCta={{ label: "Book demo", href: "/demo-booking" }}>
      <FeatureGrid items={featurePillars} eyebrow="Core module" />
      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <ShellCard title="Designed for daily use" eyebrow="UX principle"><p className="text-sm leading-7 text-slate-300">Every page follows the same hierarchy: clear title, short description, primary action, structured content area, and minimal distractions.</p></ShellCard>
        <ShellCard title="Built as one ecosystem" eyebrow="Architecture"><p className="text-sm leading-7 text-slate-300">Website, onboarding, portal, CRM, booking, billing, conversations, automation, analytics, and AI all share one visual and structural system.</p></ShellCard>
      </section>
      <section className="mt-10"><FeatureGrid items={productModules} eyebrow="Expansion layer" /></section>
    </SitePage>
  );
}
