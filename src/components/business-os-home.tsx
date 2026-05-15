"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  CircleAlert,
  Minus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { CrmShell } from "@/components/crm-shell";
import type { OverviewData } from "@/lib/server/business-data";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

type ChipTone = OverviewData["hero"]["statusChips"][number]["tone"];
type KpiTone = OverviewData["kpiLayer"][number]["tone"];
type PriorityTone = OverviewData["priorityEngine"]["items"][number]["tone"];
type FeedTone = OverviewData["liveOperations"]["items"][number]["tone"];
type CustomerTone = OverviewData["customerRadar"]["items"][number]["tone"];

const sectionClass =
  "rounded-[26px] border border-slate-200/70 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.05)]";
const subSectionClass =
  "rounded-[20px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.96))]";
const subtleSectionClass =
  "rounded-[22px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,251,252,0.96))] shadow-[0_10px_24px_rgba(15,23,42,0.04)]";

type KpiRiskLevel = OverviewData["kpiLayer"][number]["riskLevel"];

function chipToneClass(tone: ChipTone) {
  if (tone === "emerald") {
    return "border-emerald-200/80 bg-emerald-50/80 text-emerald-800";
  }

  if (tone === "amber") {
    return "border-amber-200/80 bg-amber-50/80 text-amber-800";
  }

  if (tone === "rose") {
    return "border-rose-200/80 bg-rose-50/80 text-rose-800";
  }

  return "border-slate-200/80 bg-slate-50/80 text-slate-700";
}

function kpiToneClass(tone: KpiTone) {
  if (tone === "emerald") {
    return "bg-emerald-500";
  }

  if (tone === "cyan") {
    return "bg-sky-500";
  }

  if (tone === "violet") {
    return "bg-violet-500";
  }

  if (tone === "amber") {
    return "bg-amber-500";
  }

  if (tone === "rose") {
    return "bg-rose-500";
  }

  return "bg-slate-400";
}

function priorityToneClass(tone: PriorityTone) {
  if (tone === "rose") {
    return "border-rose-200/80 bg-rose-50/70";
  }

  if (tone === "amber") {
    return "border-amber-200/80 bg-amber-50/70";
  }

  if (tone === "emerald") {
    return "border-emerald-200/80 bg-emerald-50/70";
  }

  return "border-slate-200/80 bg-slate-50/70";
}

function feedToneClass(tone: FeedTone) {
  if (tone === "rose") {
    return "bg-rose-500";
  }

  if (tone === "amber") {
    return "bg-amber-500";
  }

  if (tone === "emerald") {
    return "bg-emerald-500";
  }

  if (tone === "violet") {
    return "bg-violet-500";
  }

  return "bg-slate-400";
}

function customerToneClass(tone: CustomerTone) {
  if (tone === "rose") {
    return "border-rose-200/80 bg-rose-50/80 text-rose-800";
  }

  if (tone === "amber") {
    return "border-amber-200/80 bg-amber-50/80 text-amber-800";
  }

  return "border-emerald-200/80 bg-emerald-50/80 text-emerald-800";
}

const primaryKpiLabels = [
  "MRR",
  "ARR-estimat",
  "Aktiv pipeline",
  "Konvertering",
  "Win rate",
  "Kundhälsa",
  "Svarstid",
] as const;

function kpiSurfaceClass(tone: KpiTone, variant: "primary" | "secondary") {
  if (variant === "primary") {
    if (tone === "emerald") {
      return "bg-[linear-gradient(180deg,rgba(236,253,245,0.78),rgba(255,255,255,0.98))]";
    }

    if (tone === "cyan") {
      return "bg-[linear-gradient(180deg,rgba(240,249,255,0.86),rgba(255,255,255,0.98))]";
    }

    if (tone === "violet") {
      return "bg-[linear-gradient(180deg,rgba(245,243,255,0.88),rgba(255,255,255,0.98))]";
    }

    if (tone === "amber") {
      return "bg-[linear-gradient(180deg,rgba(255,251,235,0.88),rgba(255,255,255,0.98))]";
    }

    if (tone === "rose") {
      return "bg-[linear-gradient(180deg,rgba(255,241,242,0.88),rgba(255,255,255,0.98))]";
    }
  }

  return "bg-white/70";
}

function kpiRiskBadgeClass(level: KpiRiskLevel) {
  if (level === "Hög") {
    return "border-rose-200/80 bg-rose-50/80 text-rose-800";
  }

  if (level === "Förhöjd" || level === "Medel") {
    return "border-amber-200/80 bg-amber-50/80 text-amber-800";
  }

  return "border-emerald-200/80 bg-emerald-50/80 text-emerald-800";
}

function getKpiTrendMeta(item: OverviewData["kpiLayer"][number]) {
  if (item.tone === "emerald" || item.tone === "cyan") {
    return {
      label: "Positiv signal",
      icon: ArrowUpRight,
      className: "border-emerald-200/80 bg-emerald-50/80 text-emerald-800",
    };
  }

  if (item.tone === "rose" || item.riskLevel === "Hög") {
    return {
      label: "Kräver fokus",
      icon: ArrowDownRight,
      className: "border-rose-200/80 bg-rose-50/80 text-rose-800",
    };
  }

  if (item.tone === "amber" || item.riskLevel === "Förhöjd" || item.riskLevel === "Medel") {
    return {
      label: "Bevaka",
      icon: CircleAlert,
      className: "border-amber-200/80 bg-amber-50/80 text-amber-800",
    };
  }

  return {
    label: "Stabil",
    icon: Minus,
    className: "border-slate-200/80 bg-slate-50/80 text-slate-600",
  };
}

function getOrderedKpis(items: OverviewData["kpiLayer"]) {
  const preferredLabels = [
    "MRR",
    "YRR",
    "ARR-estimat",
    "MRR / intäktstryck",
    "Aktiv pipeline",
    "Win rate",
    "Lead velocity",
    "Konvertering",
    "Bokningsbelastning",
    "Kundhälsa",
    "Churn-risk",
    "Team load",
    "Svarstid",
    "Risksignaler",
    "Dialogtryck",
    "Aktivitetstempo",
  ];

  const preferred = preferredLabels
    .map((label) => items.find((item) => item.label === label))
    .filter((item): item is OverviewData["kpiLayer"][number] => Boolean(item));

  const overflow = items.filter((item) => !preferred.some((entry) => entry.label === item.label));

  return [...preferred, ...overflow];
}

function getConnectedKpiCellClass(index: number, total: number) {
  const classes = ["group", "block", "p-4", "transition", "hover:bg-slate-50/70", "sm:p-[18px]"];

  if (index < total - 1) {
    classes.push("border-b", "border-slate-200/70");
  }

  const mdColumns = 2;
  const mdRows = Math.ceil(total / mdColumns);
  const mdRow = Math.floor(index / mdColumns);
  const mdColumn = index % mdColumns;

  if (mdColumn < mdColumns - 1) {
    classes.push("md:border-r", "md:border-slate-200/70");
  }

  if (mdRow < mdRows - 1) {
    classes.push("md:border-b", "md:border-slate-200/70");
  } else {
    classes.push("md:border-b-0");
  }

  const xlColumns = 4;
  const xlRows = Math.ceil(total / xlColumns);
  const xlRow = Math.floor(index / xlColumns);
  const xlColumn = index % xlColumns;

  if (xlColumn < xlColumns - 1) {
    classes.push("xl:border-r", "xl:border-slate-200/70");
  } else {
    classes.push("xl:border-r-0");
  }

  if (xlRow < xlRows - 1) {
    classes.push("xl:border-b", "xl:border-slate-200/70");
  } else {
    classes.push("xl:border-b-0");
  }

  return classes.join(" ");
}

export function BusinessOsHome({
  data,
}: {
  data?: OverviewData;
}) {
  const overview: OverviewData = data ?? {
    hero: {
      eyebrow: "AI-native overview",
      title: "Få en tydlig bild av verksamheten",
      summary:
        "Konverteringen ökar när svar och uppföljning sker snabbt. Börja med leads, kunder och uppgifter för att bygga en skarp daglig översikt.",
      liveLabel: "Inga live-signaler ännu",
      focus: {
        label: "Dagens fokus",
        value: "Skapa första prioriteten",
        note: "Lägg in arbete och ansvar för att göra overviewn skarp och användbar.",
      },
      opportunity: {
        label: "Största möjlighet",
        value: "Bygg pipelinefart",
        note: "Säljflödet blir tydligt när första leads och offerter registreras.",
      },
      risk: {
        label: "Största risk",
        value: "Ingen tydlig risksignal ännu",
        note: "Riskbilden blir verklig när kunder, dialoger och fakturor samspelar.",
      },
      teamStatus: {
        label: "Teamstatus",
        value: "Väntar på aktivitet",
        note: "Kapacitet och belastning blir tydliga när arbete fördelas i systemet.",
      },
      primaryAction: {
        label: "Öppna pipeline",
        href: "/pipeline",
      },
      secondaryActions: [
        { label: "Se uppgifter", href: "/uppgifter" },
        { label: "Starta AI-analys", href: "/ai-assistent" },
      ],
      statusChips: [
        { label: "Intäkt", value: "0 kr", tone: "slate" },
        { label: "Pipeline", value: "0 aktiva", tone: "slate" },
        { label: "Kundhälsa", value: "Ingen baslinje", tone: "amber" },
      ],
    },
    kpiLayer: [
      {
        group: "Intäkt",
        label: "MRR",
        value: "0 kr",
        trend: "Ingen run-rate ännu",
        momentum: "Återkommande intäkt byggs när fakturaflöden och pipeline växer.",
        comparison: "Ingen månatlig bas ännu",
        benchmark: "Fler återkommande affärer krävs",
        reason: "För lite ekonomisk historik för tydlig MRR.",
        action: "Öppna fakturering",
        href: "/fakturering",
        riskLevel: "Medel",
        tone: "amber",
      },
      {
        group: "Intäkt",
        label: "YRR",
        value: "0 kr",
        trend: "Ingen årstakt ännu",
        momentum: "Årstakten stärks när run-raten blir tydligare.",
        comparison: "Ingen årsbas ännu",
        benchmark: "MRR behövs för tydlig YRR",
        reason: "För lite data för att skapa tydlig årstakt.",
        action: "Öppna statistik",
        href: "/statistik",
        riskLevel: "Medel",
        tone: "slate",
      },
      {
        group: "Intäkt",
        label: "ARR-estimat",
        value: "0 kr",
        trend: "Ingen annualiserad bas ännu",
        momentum: "Mer intäktsdata behövs för starkare ARR-estimat.",
        comparison: "Ingen annualiserad bild ännu",
        benchmark: "Fakturor och pipeline bygger estimatet",
        reason: "För lite ekonomisk signaldata i systemet.",
        action: "Öppna statistik",
        href: "/statistik",
        riskLevel: "Medel",
        tone: "amber",
      },
      {
        group: "Intäkt",
        label: "Intäkt idag",
        value: "0 kr",
        trend: "Ingen aktivitet",
        momentum: "Börja med offerter och fakturering.",
        comparison: "Ingen baslinje ännu",
        benchmark: "Fakturering låser upp ekonomisk bild",
        reason: "Ekonomisk data saknas ännu.",
        action: "Öppna fakturering",
        href: "/fakturering",
        riskLevel: "Medel",
        tone: "amber",
      },
      {
        group: "Sälj",
        label: "Aktiv pipeline",
        value: "0 aktiva",
        trend: "+0 idag",
        momentum: "Första leadet aktiverar pipelinen.",
        comparison: "Ingen rörelse ännu",
        benchmark: "Pipeline byggs av leads och offerter",
        reason: "Säljflödet är tomt.",
        action: "Skapa lead",
        href: "/leads",
        riskLevel: "Medel",
        tone: "violet",
      },
      {
        group: "Sälj",
        label: "Konvertering",
        value: "0%",
        trend: "Inga vunna affärer",
        momentum: "Svarstid och uppföljning driver konvertering.",
        comparison: "Ingen jämförelse ännu",
        benchmark: "Offertsteg ger kontext till kvoten",
        reason: "För få affärer i systemet.",
        action: "Öppna pipeline",
        href: "/pipeline",
        riskLevel: "Medel",
        tone: "slate",
      },
      {
        group: "Sälj",
        label: "Win rate",
        value: "0%",
        trend: "Ingen stabil stängningsgrad ännu",
        momentum: "Vunna och förlorade affärer bygger win rate.",
        comparison: "Ingen benchmark ännu",
        benchmark: "Stäng fler affärer för tydligare kvot",
        reason: "För få stängda affärer i systemet.",
        action: "Öppna pipeline",
        href: "/pipeline",
        riskLevel: "Medel",
        tone: "violet",
      },
      {
        group: "Sälj",
        label: "Lead velocity",
        value: "0%",
        trend: "Ingen aktiv leadhastighet ännu",
        momentum: "Uppföljning och färsk kontakt driver lead velocity.",
        comparison: "Ingen rörelse att jämföra ännu",
        benchmark: "Fler leads behövs för tydlig trend",
        reason: "För lite aktiv leadvolym.",
        action: "Skapa lead",
        href: "/leads",
        riskLevel: "Medel",
        tone: "amber",
      },
      {
        group: "Drift",
        label: "Bokningsläge",
        value: "0 bokningar",
        trend: "Tom kalender",
        momentum: "Bokningar visar kapacitet och leveransläge.",
        comparison: "Ingen veckobild ännu",
        benchmark: "Kalendern aktiverar driftpanelen",
        reason: "Ingen driftplan finns ännu.",
        action: "Ny bokning",
        href: "/bokningar",
        riskLevel: "Medel",
        tone: "amber",
      },
      {
        group: "Kunder",
        label: "Kundhälsa",
        value: "0 relationer",
        trend: "Ingen kundbas",
        momentum: "Kunddialoger och historik bygger hälsobilden.",
        comparison: "Ingen signal ännu",
        benchmark: "Fler kunder ger bättre överblick",
        reason: "Kundbas saknas.",
        action: "Lägg till kund",
        href: "/kunder",
        riskLevel: "Medel",
        tone: "cyan",
      },
      {
        group: "Kunder",
        label: "Churn-risk",
        value: "0%",
        trend: "Ingen tydlig churn-risk ännu",
        momentum: "Riskrelationer och lägre aktivitet bygger churn-signaler.",
        comparison: "Låg churn-press",
        benchmark: "Fler kundrelationer behövs för säkrare bild",
        reason: "För lite kundhistorik i systemet.",
        action: "Öppna kunder",
        href: "/kunder",
        riskLevel: "Låg",
        tone: "emerald",
      },
      {
        group: "Team",
        label: "Team load",
        value: "Låg",
        trend: "Ingen kö ännu",
        momentum: "Uppgifter och dialoger visar verklig belastning.",
        comparison: "Ingen kapacitetsbild ännu",
        benchmark: "Teamytan blir bättre med mer arbete",
        reason: "För få operativa signaler.",
        action: "Öppna team",
        href: "/team",
        riskLevel: "Låg",
        tone: "emerald",
      },
      {
        group: "Team",
        label: "Svarstid",
        value: "0h",
        trend: "Ingen aktiv svarskö ännu",
        momentum: "Konversationer och teamkapacitet bygger svarstidsbilden.",
        comparison: "Ingen svarsbenchmark ännu",
        benchmark: "Dialogtryck behövs för tydlig mätning",
        reason: "För få aktiva dialoger i systemet.",
        action: "Öppna konversationer",
        href: "/konversationer",
        riskLevel: "Låg",
        tone: "slate",
      },
      {
        group: "Kunder",
        label: "Risksignaler",
        value: "0",
        trend: "Inga tydliga risker",
        momentum: "Risker blir tydliga när kund- och ekonomidata växer.",
        comparison: "Låg signalnivå",
        benchmark: "Kund- och fakturaflöden bygger riskbilden",
        reason: "För lite verksamhetsdata för tydlig riskdetektion.",
        action: "Lägg till kunder och fakturor",
        href: "/kunder",
        riskLevel: "Låg",
        tone: "emerald",
      },
      {
        group: "Team",
        label: "Dialogtryck",
        value: "0",
        trend: "Inga aktiva dialoger",
        momentum: "Konversationer visar svarstryck och ägarskap.",
        comparison: "Lugnt inflöde",
        benchmark: "Dialogflödet blir tydligare med fler relationer",
        reason: "Inga kunddialoger har ännu byggt upp tryck.",
        action: "Öppna konversationer",
        href: "/konversationer",
        riskLevel: "Låg",
        tone: "slate",
      },
      {
        group: "Drift",
        label: "Aktivitetstempo",
        value: "0",
        trend: "Lågt tempo",
        momentum: "Aktivitet, bokningar och AI-signaler bygger en stark overview.",
        comparison: "Låg signaltäthet",
        benchmark: "Mer aktivitet ger bättre beslutsunderlag",
        reason: "Arbetsytan har ännu inte tillräckligt mycket rörelse.",
        action: "Registrera mer arbete i systemet",
        href: "/oversikt",
        riskLevel: "Förhöjd",
        tone: "amber",
      },
      {
        group: "Sälj",
        label: "Fokuskö",
        value: "0",
        trend: "Ingen aktiv kö ännu",
        momentum: "Tasks, risker och deadlines bygger dagens fokuslista.",
        comparison: "Lätt fokusbild",
        benchmark: "Prioriteringsmotorn blir skarpare när fler flöden används",
        reason: "För få aktiva processer för att skapa en tung kö.",
        action: "Skapa uppgifter och nästa steg",
        href: "/uppgifter",
        riskLevel: "Låg",
        tone: "slate",
      },
    ],
    priorityEngine: {
      headline: "Dagens fokus",
      summary: "Det viktigaste som bör göras härnäst.",
      items: [
        {
          title: "Följ upp första leadet",
          detail: "Bygg pipeline och börja mäta säljrörelse.",
          meta: "Sälj",
          impact: "Ger verklig kontext till KPI:er och AI-insikter.",
          href: "/leads",
          cta: "Öppna leads",
          tone: "amber",
        },
        {
          title: "Skapa veckans första bokning",
          detail: "Aktivera drift, planering och kapacitetsbilden.",
          meta: "Drift",
          impact: "Gör overviewn mer användbar i vardagen.",
          href: "/bokningar",
          cta: "Ny bokning",
          tone: "emerald",
        },
        {
          title: "Lägg till en kund",
          detail: "Bygg kundradar och relationstracking.",
          meta: "Kunder",
          impact: "Ger översikten bättre risk- och hälsobild.",
          href: "/kunder",
          cta: "Öppna kunder",
          tone: "slate",
        },
      ],
    },
    liveOperations: {
      headline: "Liveaktivitet",
      summary: "Senaste rörelser i arbetsytan.",
      items: [
        {
          title: "AI är redo för sammanfattning",
          detail: "Kör en snabb analys så fort leads eller kunder finns i systemet.",
          time: "Nu",
          type: "AI",
          href: "/ai-assistent",
          cta: "Öppna AI",
          tone: "emerald",
        },
        {
          title: "Pipeline väntar på första leadet",
          detail: "När första leadet registreras börjar overviewn ge skarpare vägledning.",
          time: "Startläge",
          type: "Sälj",
          href: "/leads",
          cta: "Skapa lead",
          tone: "amber",
        },
      ],
    },
    revenueEngine: {
      headline: "Pipeline",
      summary: "Aktiva affärer, steg och konvertering.",
      strongestStage: "Ingen ännu",
      totalValue: "0 kr",
      href: "/pipeline",
      stages: [
        { label: "Nya leads", count: 0, value: "0 kr", percentage: 0 },
        { label: "Kvalificering", count: 0, value: "0 kr", percentage: 0 },
        { label: "Offert", count: 0, value: "0 kr", percentage: 0 },
      ],
    },
    teamPulse: {
      headline: "Team",
      summary: "Belastning, aktivitet och ansvar.",
      memberCount: "0",
      activeConversationCount: "0",
      memberInitials: [],
      workloadLabel: "Låg",
      note: "När teamet arbetar i systemet blir ansvar, tempo och kö tydliga här.",
      items: [
        { label: "Aktiva", value: "0", note: "Inga aktiva ägare ännu." },
        { label: "Uppgifter", value: "0", note: "Ingen arbetskö ännu." },
        { label: "Dialoger", value: "0", note: "Inget svarstryck ännu." },
      ],
    },
    customerRadar: {
      headline: "Kunder",
      summary: "Relationer, riskkunder och aktivitet.",
      items: [],
    },
    operationsDeck: {
      headline: "Bokningar",
      summary: "Schema, kapacitet och deadlines.",
      items: [
        {
          title: "Ingen veckoplan ännu",
          status: "Startläge",
          detail: "Skapa bokningar eller uppgifter för att bygga driftbilden.",
          meta: "Kalendern är tom just nu",
          href: "/bokningar",
          cta: "Planera vecka",
          tone: "amber",
        },
      ],
    },
    aiCommand: {
      headline: "AI-insikt",
      summary: "Leads som får svar snabbt brukar konvertera bättre. Prioritera uppföljning tidigt i flödet.",
      command: "Sammanfatta arbetsytan och föreslå tre nästa steg.",
      focusPoints: ["Svarstid", "Riskkunder", "Pipeline"],
      recommendations: [
        {
          title: "Prioritera dagens arbete",
          detail: "Låt AI sammanfatta vad som är viktigast just nu.",
          href: "/ai-assistent",
          cta: "Starta AI",
        },
      ],
      actions: [
        { label: "AI-sammanfattning", href: "/ai-assistent" },
        { label: "Öppna pipeline", href: "/pipeline" },
      ],
    },
  };

  const orderedKpis = getOrderedKpis(overview.kpiLayer);
  const primaryKpis = primaryKpiLabels
    .map((label) => orderedKpis.find((item) => item.label === label))
    .filter((item): item is OverviewData["kpiLayer"][number] => Boolean(item));
  const secondaryKpis = orderedKpis.filter(
    (item) => !primaryKpiLabels.some((label) => label === item.label),
  );
  const kpiGroups = ["Intäkt", "Sälj", "Kunder", "Team", "Drift"] as const;
  const activeKpiGroups = kpiGroups
    .map((group) => ({
      group,
      count: orderedKpis.filter((item) => item.group === group).length,
    }))
    .filter((entry) => entry.count > 0);
  const focusItems = overview.priorityEngine.items.slice(0, 4);
  const liveItems = overview.liveOperations.items.slice(0, 5);
  const kpiSummary = {
    total: orderedKpis.length,
    warnings: orderedKpis.filter((item) =>
      item.riskLevel === "Hög" || item.riskLevel === "Förhöjd" || item.riskLevel === "Medel",
    ).length,
    positive: orderedKpis.filter((item) => item.tone === "emerald" || item.tone === "cyan").length,
  };
  const quickActions = [
    { label: "Skapa lead", href: "/leads" },
    { label: "Ny bokning", href: "/bokningar" },
    { label: "Ny offert", href: "/offerter" },
    { label: "Skapa uppgift", href: "/uppgifter" },
    { label: "Starta automation", href: "/automationer" },
    { label: "AI-sammanfattning", href: "/ai-assistent" },
  ];
  const operationalPanels = [
    {
      title: "Pipeline",
      value: overview.revenueEngine.totalValue,
      note: overview.revenueEngine.strongestStage,
      href: overview.revenueEngine.href,
      icon: TrendingUp,
    },
    {
      title: "Bokningar",
      value:
        orderedKpis.find((item) => item.label === "Bokningsbelastning" || item.label === "Bokningsläge")
          ?.value ?? "0",
      note: overview.operationsDeck.items[0]?.title ?? "Ingen plan ännu",
      href: "/bokningar",
      icon: CalendarClock,
    },
    {
      title: "Kunder",
      value:
        orderedKpis.find((item) => item.label === "Kundhälsa")?.value ??
        `${overview.customerRadar.items.length} fokus`,
      note:
        overview.customerRadar.items[0]?.name ??
        "Kundradarn blir skarp när relationer och dialoger fylls på",
      href: "/kunder",
      icon: Users,
    },
    {
      title: "Team",
      value: overview.teamPulse.workloadLabel,
      note: `${overview.teamPulse.memberCount} i teamet · ${overview.teamPulse.activeConversationCount} dialoger`,
      href: "/team",
      icon: Wallet,
    },
  ];
  const heroFacts = [
    overview.hero.focus.value,
    overview.hero.opportunity.value,
    overview.hero.risk.value,
  ];
  const aiRecommendation = overview.aiCommand.recommendations[0];

  return (
    <CrmShell
      title="Översikt"
      description="Förstå läget snabbt, se dagens fokus och gå vidare till rätt åtgärd."
    >
      <div className="grid gap-4 pb-4">
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.34 }}
          className={`${sectionClass} overflow-hidden p-5 sm:p-6`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              {overview.hero.eyebrow}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
              <Activity className="h-3.5 w-3.5" />
              {overview.hero.liveLabel}
            </span>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="min-w-0">
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.15rem]">
                {overview.hero.title}
              </h2>
              <p className="mt-2.5 max-w-3xl text-[15px] leading-7 text-slate-600">
                {overview.hero.summary}
              </p>

              <div className="mt-4 space-y-2">
                {heroFacts.map((fact) => (
                  <div key={fact} className="flex items-start gap-3 text-[14px] text-slate-700">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href={overview.hero.primaryAction.href}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(5,150,105,0.98),rgba(4,120,87,0.95))] px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(5,150,105,0.14)] transition hover:-translate-y-[1px] hover:shadow-[0_14px_24px_rgba(5,150,105,0.18)]"
                >
                  {overview.hero.primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {overview.hero.secondaryActions.slice(0, 2).map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className={`${subSectionClass} p-4`}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Snabb läsning</p>
              <div className="mt-3 grid gap-2.5">
                {overview.hero.statusChips.map((chip) => (
                  <div key={chip.label} className="flex items-center justify-between gap-3">
                    <span className="text-[14px] text-slate-500">{chip.label}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${chipToneClass(chip.tone)}`}>
                      {chip.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          {...fadeUp}
          transition={{ duration: 0.3 }}
          className={`${subtleSectionClass} overflow-hidden`}
        >
          <div className="flex flex-col gap-3 border-b border-slate-200/70 px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:px-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">KPI-översikt</p>
              <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-slate-950">
                Nyckeltal för idag
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1">
                {kpiSummary.total} KPI:er
              </span>
              <span className="rounded-full border border-amber-200/80 bg-amber-50/70 px-2.5 py-1 text-amber-800">
                {kpiSummary.warnings} att bevaka
              </span>
              <span className="rounded-full border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-1 text-emerald-800">
                {kpiSummary.positive} stabila signaler
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-slate-200/70 px-4 py-2.5 sm:px-5">
            {activeKpiGroups.map((entry) => (
              <span
                key={entry.group}
                className="rounded-full border border-slate-200/80 bg-slate-50/70 px-2.5 py-1 text-[11px] text-slate-600"
              >
                {entry.group} · {entry.count}
              </span>
            ))}
          </div>
          <div className="border-b border-slate-200/70 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Primära KPI:er</p>
                <p className="mt-1 text-sm text-slate-600">De viktigaste signalerna för dagens läge.</p>
              </div>
              <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                {primaryKpis.length} viktigaste
              </span>
            </div>
          </div>
          <div className="grid gap-0 border-b border-slate-200/70 md:grid-cols-2 xl:grid-cols-3">
          {primaryKpis.map((item, index) => {
            const trendMeta = getKpiTrendMeta(item);
            const TrendIcon = trendMeta.icon;

            return (
            <Link
              key={item.label}
              href={item.href}
              className={`group block p-4 transition hover:bg-slate-50/70 sm:p-5 ${kpiSurfaceClass(item.tone, "primary")} ${
                index < primaryKpis.length - 1 ? "border-b border-slate-200/70" : ""
              } ${
                index % 2 === 0 ? "md:border-r md:border-slate-200/70 xl:border-r" : "md:border-r-0"
              } ${
                index < 4 ? "xl:border-b xl:border-slate-200/70" : "xl:border-b-0"
              } ${
                index % 3 !== 2 ? "xl:border-r xl:border-slate-200/70" : "xl:border-r-0"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.group}</p>
                  <p className="mt-1 truncate text-[13px] font-medium text-slate-700">{item.label}</p>
                </div>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${kpiToneClass(item.tone)}`} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium ${trendMeta.className}`}>
                  <TrendIcon className="h-3 w-3" />
                  {trendMeta.label}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${kpiRiskBadgeClass(item.riskLevel)}`}>
                  {item.riskLevel}
                </span>
              </div>
              <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-slate-950">
                {item.value}
              </p>
              <p className="mt-1.5 text-[13px] text-slate-500">{item.trend}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="truncate text-[11px] text-slate-400">{item.comparison}</p>
                <span className="shrink-0 text-[11px] font-medium text-slate-600">
                  {item.action}
                </span>
              </div>
            </Link>
            );
          })}
          </div>
          <div className="px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Kompletterande KPI:er</p>
                <p className="mt-1 text-sm text-slate-600">Alla resterande signaler för team, drift och uppföljning.</p>
              </div>
              <span className="rounded-full border border-slate-200/80 bg-slate-50/70 px-2.5 py-1 text-[11px] text-slate-600">
                {secondaryKpis.length} kompletterande
              </span>
            </div>
          </div>
          <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          {secondaryKpis.map((item, index) => {
            const trendMeta = getKpiTrendMeta(item);
            const TrendIcon = trendMeta.icon;

            return (
            <Link
              key={item.label}
              href={item.href}
              className={`${getConnectedKpiCellClass(index, secondaryKpis.length)} ${kpiSurfaceClass(item.tone, "secondary")}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.group}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-slate-700">{item.label}</p>
                </div>
                <span className={`h-2 w-2 rounded-full ${kpiToneClass(item.tone)}`} />
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 px-2 py-1 text-[10px] text-slate-600">
                <TrendIcon className="h-3 w-3" />
                {trendMeta.label}
              </div>
              <p className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 text-[13px] text-slate-500">{item.trend}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-[11px] text-slate-400">{item.comparison}</p>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${kpiRiskBadgeClass(item.riskLevel)}`}>
                  {item.riskLevel}
                </span>
              </div>
            </Link>
            );
          })}
          </div>
        </motion.section>

        <motion.section
          {...fadeUp}
          transition={{ duration: 0.3 }}
          className={`${sectionClass} p-4`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Snabbåtgärder
            </span>
            {quickActions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </motion.section>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.32 }}
            className={`${sectionClass} p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Dagens fokus
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  Det viktigaste just nu
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600">
                <CircleAlert className="h-3.5 w-3.5" />
                {focusItems.length} fokus
              </div>
            </div>

            <div className={`${subSectionClass} mt-4 overflow-hidden`}>
              {focusItems.map((item, index) => (
                <div
                  key={item.title}
                  className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
                    index < focusItems.length - 1 ? "border-b border-slate-200/70" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.tone === "rose"
                          ? "bg-rose-500"
                          : item.tone === "amber"
                            ? "bg-amber-500"
                            : item.tone === "emerald"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${priorityToneClass(item.tone)}`}>
                          {item.meta}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                      <p className="mt-1 text-[12px] text-slate-400">{item.impact}</p>
                    </div>
                  </div>
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {item.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            {...fadeUp}
            transition={{ duration: 0.32 }}
            className={`${sectionClass} p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  AI-insikt
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  Kort rekommendation
                </h3>
              </div>
              <BrainCircuit className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{overview.aiCommand.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {overview.aiCommand.focusPoints.slice(0, 3).map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600"
                >
                  {point}
                </span>
              ))}
            </div>
            {aiRecommendation ? (
              <Link
                href={aiRecommendation.href}
                className={`${subSectionClass} mt-4 block p-4 transition hover:bg-white`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-950">{aiRecommendation.title}</p>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {aiRecommendation.cta}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{aiRecommendation.detail}</p>
              </Link>
            ) : null}
          </motion.section>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.32 }}
            className={`${sectionClass} p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Liveaktivitet
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  Senaste aktivitet
                </h3>
              </div>
              <Activity className="h-4.5 w-4.5 text-emerald-600" />
            </div>

            <div className={`${subSectionClass} mt-4 overflow-hidden`}>
              {liveItems.map((item, index) => (
                <Link
                  key={`${item.title}-${item.time}`}
                  href={item.href}
                  className={`flex items-start gap-3 px-4 py-3.5 transition hover:bg-slate-50/80 ${
                    index < liveItems.length - 1 ? "border-b border-slate-200/70" : ""
                  }`}
                >
                  <span className={`mt-2 h-2.5 w-2.5 rounded-full ${feedToneClass(item.tone)}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <span className="rounded-full border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{item.time}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-slate-500">{item.detail}</p>
                      <span className="text-[11px] font-medium text-slate-600">{item.cta}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section
            {...fadeUp}
            transition={{ duration: 0.32 }}
            className={`${sectionClass} p-5`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Operativa paneler
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  Snabb överblick
                </h3>
              </div>
              <BriefcaseBusiness className="h-4.5 w-4.5 text-emerald-600" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {operationalPanels.map((panel) => {
                const Icon = panel.icon;

                return (
                  <Link
                    key={panel.title}
                    href={panel.href}
                    className={`${subSectionClass} block p-4 transition hover:bg-white`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-medium text-slate-900">{panel.title}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                      {panel.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{panel.note}</p>
                  </Link>
                );
              })}

              {overview.customerRadar.items.length > 0 ? (
                <Link
                  href={overview.customerRadar.items[0].href}
                  className={`${subSectionClass} block p-4 transition hover:bg-white sm:col-span-2`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-slate-900">Kundsignal</p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] ${customerToneClass(
                        overview.customerRadar.items[0].tone,
                      )}`}
                    >
                      {overview.customerRadar.items[0].state}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {overview.customerRadar.items[0].name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{overview.customerRadar.items[0].note}</p>
                </Link>
              ) : null}
            </div>
          </motion.section>
        </div>
      </div>
    </CrmShell>
  );
}
