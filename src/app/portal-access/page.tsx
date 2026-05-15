import Link from "next/link";

import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="Portal" title="Customer and team portal access" description="Move clearly between the public website, authentication, onboarding, and the protected Business OS without feeling like you left the product ecosystem." primaryCta={{ label: "Login", href: "/login" }} secondaryCta={{ label: "Create account", href: "/registrera" }}>
      <div className="grid gap-5 lg:grid-cols-3">
        <ShellCard title="Existing workspace" eyebrow="Access"><p className="text-sm leading-7 text-slate-600">Sign in to continue into your protected portal, team workflows, and customer operations.</p><Link href="/login" className="mt-5 inline-flex text-sm font-medium text-slate-700 transition hover:text-emerald-700">Go to login</Link></ShellCard>
        <ShellCard title="New account" eyebrow="Onboarding"><p className="text-sm leading-7 text-slate-600">Create a workspace, add your first users, and begin with a structured onboarding flow.</p><Link href="/registrera" className="mt-5 inline-flex text-sm font-medium text-slate-700 transition hover:text-emerald-700">Create workspace</Link></ShellCard>
        <ShellCard title="Need a walkthrough?" eyebrow="Demo path"><p className="text-sm leading-7 text-slate-600">If you want guidance before entering the portal, start with a product demo instead of guessing.</p><Link href="/demo-booking" className="mt-5 inline-flex text-sm font-medium text-slate-700 transition hover:text-emerald-700">Book demo</Link></ShellCard>
      </div>
    </SitePage>
  );
}
