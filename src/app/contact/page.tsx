import { SitePage } from "@/components/site-page";
import { ShellCard } from "@/components/shell-card";

export default function Page() {
  return (
    <SitePage eyebrow="Contact" title="Talk to the team behind the platform" description="Whether you want a demo, migration guidance, or help structuring your operation, start here." primaryCta={{ label: "Book demo", href: "/demo-booking" }} secondaryCta={{ label: "Start free", href: "/registrera" }}>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          { title: "Sales", text: "Get a platform walkthrough tailored to your workflows and team structure." },
          { title: "Support", text: "Need help with setup, access, or product questions? Reach out to the team." },
          { title: "Partnerships", text: "Explore implementation, onboarding, or strategic rollout conversations." },
        ].map((item) => (
          <ShellCard key={item.title} title={item.title} eyebrow="Contact path"><p className="text-sm leading-7 text-slate-300">{item.text}</p></ShellCard>
        ))}
      </div>
    </SitePage>
  );
}
