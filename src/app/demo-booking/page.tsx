import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="Demo" title="Book a structured product walkthrough" description="See how the website, portal, leads, bookings, billing, analytics, and AI layers connect into one Business OS." primaryCta={{ label: "Start free", href: "/registrera" }} secondaryCta={{ label: "Portal access", href: "/portal-access" }}>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <ShellCard title="What the demo covers" eyebrow="Agenda"><div className="space-y-3 text-sm leading-7 text-slate-300"><p>How leads move into pipeline, bookings, quotes, billing, and retention workflows.</p><p>How AI assists with next actions, summaries, messages, and business analysis.</p><p>How teams use one structured portal instead of fragmented tools.</p></div></ShellCard>
        <ShellCard title="Best for" eyebrow="Fit"><div className="space-y-3 text-sm leading-7 text-slate-300"><p>Service companies with operational complexity.</p><p>Teams that want better structure without heavier software.</p><p>Leaders who want one system of truth across sales and delivery.</p></div></ShellCard>
      </div>
    </SitePage>
  );
}
