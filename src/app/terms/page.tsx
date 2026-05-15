import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="Terms" title="Terms of service" description="Clear expectations around subscription use, account ownership, billing, and workspace access are part of a production-ready SaaS foundation.">
      <ShellCard title="Service terms" eyebrow="Policy"><p className="text-sm leading-7 text-slate-300">This route establishes the legal structure for platform usage and is ready to be expanded into full production terms. It now exists as part of the rebuilt website architecture instead of being absent from the ecosystem.</p></ShellCard>
    </SitePage>
  );
}
