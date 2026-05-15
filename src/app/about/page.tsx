import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="About" title="Built for companies that want clarity, not operational noise" description="Relations System is designed as a premium Business OS where every workflow has a clear place and every page serves a purpose." primaryCta={{ label: "Book demo", href: "/demo-booking" }} secondaryCta={{ label: "See pricing", href: "/pricing" }}>
      <div className="grid gap-5 lg:grid-cols-2">
        <ShellCard title="Our point of view" eyebrow="Product philosophy"><p className="text-sm leading-7 text-slate-300">Most business software grows messy over time. We are rebuilding in the opposite direction: fewer random surfaces, stronger hierarchy, more connected workflows, and calmer decisions.</p></ShellCard>
        <ShellCard title="What we believe" eyebrow="Operating principle"><p className="text-sm leading-7 text-slate-300">AI should not sit beside the product as a gimmick. It should help inside real work: customer follow-up, risk detection, booking coordination, quote support, and analysis.</p></ShellCard>
      </div>
    </SitePage>
  );
}
