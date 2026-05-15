import { FaqGrid } from "@/components/site-sections";
import { SitePage } from "@/components/site-page";
import { faqItems } from "@/lib/site-content";

export default function Page() {
  return (
    <SitePage eyebrow="FAQ" title="Answers for teams evaluating a more structured platform" description="The platform is built to reduce cognitive load, unify workflows, and make the whole business easier to run day after day." primaryCta={{ label: "Book demo", href: "/demo-booking" }} secondaryCta={{ label: "Contact us", href: "/contact" }}>
      <FaqGrid items={faqItems} />
    </SitePage>
  );
}
