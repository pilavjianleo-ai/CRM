import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="Privacy" title="Privacy policy" description="A structured SaaS platform also needs clear data expectations, responsible access, and transparent handling rules.">
      <ShellCard title="Data handling" eyebrow="Policy"><p className="text-sm leading-7 text-slate-300">This page outlines how workspace data, account access, and customer information are handled within the platform. It is currently presented as a structured placeholder and can be expanded into full legal copy during the next compliance phase.</p></ShellCard>
    </SitePage>
  );
}
