import { PricingGrid } from "@/components/site-sections";
import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";
import { pricingTiers } from "@/lib/site-content";

export default function Page() {
  return (
    <SitePage eyebrow="Pricing" title="Clear plans for teams that want operational structure" description="Choose a plan based on how much of your company you want to run in one system, not based on bloated feature lists." primaryCta={{ label: "Start free", href: "/registrera" }} secondaryCta={{ label: "Contact sales", href: "/contact" }}>
      <PricingGrid items={pricingTiers} />
      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {[
          "No cluttered setup flow. Teams can start simple and expand into more modules over time.",
          "Growth is the default recommendation for service companies that want sales, delivery, and AI in one place.",
          "Scale is designed for deeper rollout, stronger process control, and more advanced workspace structure.",
        ].map((item) => (
          <ShellCard key={item} title="Why it matters" eyebrow="Decision support"><p className="text-sm leading-7 text-slate-300">{item}</p></ShellCard>
        ))}
      </section>
    </SitePage>
  );
}
