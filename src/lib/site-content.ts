import {
  Bot,
  CalendarDays,
  ChartColumn,
  CreditCard,
  FileText,
  MessageSquareText,
  Settings2,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SiteNavItem = {
  label: string;
  href: string;
};

export type SiteFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const siteNav: SiteNavItem[] = [
  { label: "Funktioner", href: "/features" },
  { label: "Priser", href: "/pricing" },
  { label: "Om oss", href: "/about" },
  { label: "Blogg", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/contact" },
];

export const featurePillars: SiteFeature[] = [
  {
    title: "AI-assistent som jobbar på riktigt",
    description:
      "Sammanfatta kunder, skriv uppföljningar, föreslå nästa steg och få risksignaler innan affärer tappar fart.",
    icon: Bot,
  },
  {
    title: "Leads och pipeline i ett flöde",
    description:
      "Följ varje affär från första kontakt till offert, bokning och vinst med tydligt ansvar och nästa aktivitet.",
    icon: Users,
  },
  {
    title: "Bokningar som hänger ihop med resten",
    description:
      "Synka kalender, team, kunder och uppgifter så att drift och försäljning arbetar i samma system.",
    icon: CalendarDays,
  },
  {
    title: "Offerter och fakturering utan glapp",
    description:
      "Bygg offerter, följ status, spåra betalningar och få struktur mellan försäljning och ekonomi.",
    icon: FileText,
  },
  {
    title: "Konversationer med full kontext",
    description:
      "Samla kunddialoger i ett gemensamt center där teamet ser historik, kundhälsa och nästa steg direkt.",
    icon: MessageSquareText,
  },
  {
    title: "Statistik som går att agera på",
    description:
      "Förstå intäkter, retention, beläggning och konvertering i ett lugnt och begripligt beslutsunderlag.",
    icon: ChartColumn,
  },
];

export const operatingSystemLayers = [
  {
    title: "Marknad till lead",
    description:
      "Formulär, kampanjer och demo-bokningar går in i samma strukturerade inflöde.",
  },
  {
    title: "Lead till bokning",
    description:
      "Pipeline, AI-uppföljning och offerter driver affären framåt utan manuella glapp.",
  },
  {
    title: "Bokning till leverans",
    description:
      "Kalender, team, uppgifter och kundöversikt gör den dagliga driften lugnare.",
  },
  {
    title: "Leverans till retention",
    description:
      "AI, statistik och kundhälsa fångar risk, upsell och nästa bästa steg efter jobbet.",
  },
];

export const productModules: SiteFeature[] = [
  {
    title: "Översikt och dagliga prioriteringar",
    description:
      "En dashboard som visar vad teamet ska göra nu, inte allt som finns i systemet.",
    icon: Sparkles,
  },
  {
    title: "Automationer och arbetsflöden",
    description:
      "Bygg uppföljningar, påminnelser och återaktivering utan att lämna kundkontexten.",
    icon: Workflow,
  },
  {
    title: "Billing och abonnemang",
    description:
      "Planer, betalningar, förfallna fakturor och återkommande intäkter i samma vy.",
    icon: CreditCard,
  },
  {
    title: "Inställningar och workspace-kontroll",
    description:
      "Hantera arbetsyta, team, roller och portalåtkomst i en tydlig struktur.",
    icon: Settings2,
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "499 kr",
    cadence: "per månad",
    description:
      "För mindre team som vill få struktur på leads, kunder, bokningar och uppföljning.",
    features: [
      "CRM och kundöversikt",
      "Leads och pipeline",
      "Bokningar",
      "Grundläggande AI-stöd",
    ],
  },
  {
    name: "Growth",
    price: "1 490 kr",
    cadence: "per månad",
    description:
      "För bolag som vill standardisera arbetssätt, automatisera mer och få tydligare business intelligence.",
    features: [
      "Allt i Starter",
      "Automationer",
      "Offerter och billing",
      "Avancerad statistik",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: "3 490 kr",
    cadence: "per månad",
    description:
      "För team som vill köra hela verksamheten i ett fullt AI-drivet Business OS.",
    features: [
      "Allt i Growth",
      "Fler användare och roller",
      "Prioriterad support",
      "Strategisk onboarding",
    ],
  },
];

export const testimonials = [
  {
    quote:
      "Det känns inte längre som att vi hoppar mellan fem system. Teamet ser samma verklighet varje dag.",
    name: "Emma Larsson",
    title: "Servicechef",
  },
  {
    quote:
      "Vi fick struktur på uppföljningen direkt och AI-förslagen sparar tid utan att kännas gimmickiga.",
    name: "Jonas Berg",
    title: "VD",
  },
  {
    quote:
      "Det här är första gången vår portal känns som ett riktigt operativsystem och inte bara ett CRM.",
    name: "Sara Nyholm",
    title: "Kundansvarig",
  },
];

export const faqItems = [
  {
    title: "Är det här byggt för små eller större team?",
    description:
      "Det fungerar för båda. Strukturen är enkel nog för mindre team men byggd för att skala med fler användare, fler processer och fler intäktsflöden.",
  },
  {
    title: "Är AI bara en extra funktion ovanpå systemet?",
    description:
      "Nej. AI är tänkt som ett arbetslager som hjälper i leads, kunder, bokningar, konversationer och analys i stället för att leva separat.",
  },
  {
    title: "Kan vi använda systemet utan att byta allt på en gång?",
    description:
      "Ja. Plattformen är strukturerad så att teamet kan börja med leads och kundarbete, och sedan aktivera fler delar steg för steg.",
  },
  {
    title: "Hur fungerar onboarding och demo?",
    description:
      "Ni kan boka demo, skapa konto och komma in i portalen direkt. Därefter byggs arbetsytan upp i en lugn och tydlig onboarding.",
  },
];

export const blogPosts = [
  {
    title: "Why service companies outgrow legacy CRM faster than they think",
    excerpt:
      "A structured Business OS reduces switching, missed follow-ups, and the hidden cost of operational chaos.",
    category: "Strategy",
    href: "/blog",
  },
  {
    title: "Designing AI so it assists operations instead of interrupting them",
    excerpt:
      "The best AI layer is quiet, contextual, and deeply connected to workflows, not bolted on as a novelty.",
    category: "AI",
    href: "/blog",
  },
  {
    title: "How to connect pipeline, bookings, billing, and retention into one system",
    excerpt:
      "A unified architecture gives teams better decisions, cleaner handoffs, and less manual reconciliation.",
    category: "Operations",
    href: "/blog",
  },
];

export const footerLinks = [
  { label: "Funktioner", href: "/features" },
  { label: "Priser", href: "/pricing" },
  { label: "Boka demo", href: "/demo-booking" },
  { label: "Portalåtkomst", href: "/portal-access" },
  { label: "Integritet", href: "/privacy-policy" },
  { label: "Villkor", href: "/terms" },
];
