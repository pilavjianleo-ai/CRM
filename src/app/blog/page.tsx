import { ArticleGrid } from "@/components/site-sections";
import { SitePage } from "@/components/site-page";
import { blogPosts } from "@/lib/site-content";

export default function Page() {
  return (
    <SitePage eyebrow="Blog" title="Ideas on structure, operations, AI, and premium product design" description="Thoughts on how modern service companies can replace clutter, disconnected systems, and reactive work with one coherent operating model." primaryCta={{ label: "Book demo", href: "/demo-booking" }} secondaryCta={{ label: "Start free", href: "/registrera" }}>
      <ArticleGrid items={blogPosts} />
    </SitePage>
  );
}
