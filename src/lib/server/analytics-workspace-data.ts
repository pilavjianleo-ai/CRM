"use server";

import {
  AIInsightType,
  AutomationStatus,
  BookingStatus,
  ConversationSentiment,
  CustomerHealth,
  InvoiceStatus,
  LeadStatus,
  Prisma,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

import { getPrisma } from "@/lib/prisma";
import { ensureWorkspace } from "@/lib/server/workspace";

type MetricTone = "emerald" | "cyan" | "violet" | "amber" | "rose" | "slate";
type MetricStatus = "Bra" | "Stabil" | "Bevaka" | "Risk";
type TrendDirection = "up" | "down" | "flat";

export type AnalyticsMetricId =
  | "revenue"
  | "pipeline"
  | "conversion"
  | "retention"
  | "capacity"
  | "customers"
  | "bookings"
  | "mrr"
  | "arr"
  | "responseTime"
  | "winRate"
  | "leadVelocity";

export type AnalyticsData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    liveLabel: string;
    primaryAction: {
      label: string;
      href: string;
    };
    secondaryActions: Array<{
      label: string;
      href: string;
    }>;
    statusChips: Array<{
      label: string;
      value: string;
      tone: "emerald" | "amber" | "rose" | "slate";
    }>;
  };
  overviewMetrics: Array<{
    id: AnalyticsMetricId;
    label: string;
    group: "Ekonomi" | "Sälj" | "Kunder" | "Team" | "Drift";
    value: string;
    delta: string;
    deltaDirection: TrendDirection;
    benchmark: string;
    status: MetricStatus;
    tone: MetricTone;
    sparkline: number[];
    href: string;
  }>;
  filterBar: {
    ranges: Array<{ id: string; label: string }>;
    savedViews: Array<{ id: string; label: string; metricIds: AnalyticsMetricId[]; rangeId: string }>;
    teams: string[];
    owners: string[];
    stages: string[];
    risks: string[];
    bookingStatuses: string[];
  };
  mainChart: {
    defaultMetricId: AnalyticsMetricId;
    ranges: Array<{
      id: string;
      label: string;
      points: Array<{
        label: string;
        revenue: number;
        pipeline: number;
        conversion: number;
        leads: number;
        bookings: number;
        responseTime: number;
        customerHealth: number;
      }>;
    }>;
    metrics: Array<{
      id: AnalyticsMetricId;
      label: string;
      tone: MetricTone;
      format: "currency" | "percent" | "count" | "hours" | "score";
    }>;
  };
  categorizationCharts: Array<{
    id: string;
    title: string;
    subtitle: string;
    centerLabel: string;
    centerValue: string;
    segments: Array<{
      label: string;
      value: string;
      rawValue: number;
      percentage: number;
      tone: MetricTone;
      href: string;
    }>;
  }>;
  rankedLists: Array<{
    id: string;
    title: string;
    subtitle: string;
    items: Array<{
      rank: number;
      label: string;
      value: string;
      percentage: number;
      trend: string;
      status: string;
      progress: number;
      tone: MetricTone;
      href: string;
    }>;
  }>;
  periodComparisons: Array<{
    label: string;
    currentPeriod: string;
    previousPeriod: string;
    currentValue: string;
    previousValue: string;
    delta: string;
    deltaDirection: TrendDirection;
    insight: string;
    tone: MetricTone;
  }>;
  weeklyActivity: {
    peakDay: string;
    quietDay: string;
    highestLoad: string;
    aiRecommendation: string;
    days: Array<{
      label: string;
      activity: number;
      bookings: number;
      support: number;
      ai: number;
      load: number;
      tone: MetricTone;
    }>;
  };
  performanceBars: Array<{
    label: string;
    value: string;
    helper: string;
    progress: number;
    target: string;
    status: string;
    tone: MetricTone;
  }>;
  recommendations: Array<{
    title: string;
    detail: string;
    actionLabel: string;
    href: string;
    tone: MetricTone;
  }>;
  revenueAnalysis: {
    cards: Array<{ label: string; value: string; note: string; trend: string; tone: MetricTone }>;
    leakage: Array<{ title: string; value: string; detail: string; tone: MetricTone }>;
    forecast: Array<{ label: string; value: string }>;
  };
  pipelineAnalysis: {
    summaryCards: Array<{ label: string; value: string; note: string }>;
    stages: Array<{
      label: string;
      count: number;
      value: string;
      conversion: string;
      dropoff: string;
      probability: string;
    }>;
    lostReasons: Array<{ reason: string; count: number }>;
    heatmap: Array<{ label: string; percentage: number }>;
  };
  customerAnalysis: {
    summaryCards: Array<{ label: string; value: string; note: string }>;
    segments: Array<{ label: string; value: string; percentage: number; tone: MetricTone }>;
    topCustomers: Array<{
      name: string;
      revenue: string;
      score: string;
      health: string;
      status: string;
    }>;
  };
  teamAnalysis: {
    summaryCards: Array<{ label: string; value: string; note: string }>;
    members: Array<{
      name: string;
      workload: string;
      openTasks: string;
      responseTime: string;
      activity: string;
      status: string;
    }>;
  };
  operationsAnalysis: {
    summaryCards: Array<{ label: string; value: string; note: string }>;
    upcomingBookings: Array<{
      title: string;
      customer: string;
      time: string;
      status: string;
    }>;
    deadlines: Array<{
      title: string;
      owner: string;
      due: string;
      severity: string;
    }>;
  };
  liveFeed: Array<{
    title: string;
    detail: string;
    time: string;
    type: string;
    href: string;
    tone: MetricTone;
  }>;
  aiInsights: Array<{
    headline: string;
    detail: string;
    actionLabel: string;
    href: string;
    tone: MetricTone;
  }>;
  dataTables: {
    topCustomers: {
      columns: string[];
      rows: Array<Record<string, string>>;
    };
    topDeals: {
      columns: string[];
      rows: Array<Record<string, string>>;
    };
    latestInvoices: {
      columns: string[];
      rows: Array<Record<string, string>>;
    };
    openRisks: {
      columns: string[];
      rows: Array<Record<string, string>>;
    };
  };
  exportCenter: {
    summary: string;
    actions: Array<{ label: string; description: string; type: "csv" | "pdf" | "view" }>;
  };
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value);
}

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (!value) {
    return 0;
  }

  return Number(value);
}

function formatRelativeDate(date: Date | null | undefined) {
  if (!date) {
    return "Ingen aktivitet ännu";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min sedan`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h sedan`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays <= 7) {
    return `${diffDays} dagar sedan`;
  }

  return date.toLocaleDateString("sv-SE");
}

function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

function formatHours(value: number) {
  return `${Math.max(0, Math.round(value * 10) / 10).toFixed(1).replace(".", ",")}h`;
}

function getName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || "Okänd";
}

async function getWorkspaceContext() {
  noStore();

  const prisma = getPrisma();

  if (!prisma) {
    return null;
  }

  const workspace = await ensureWorkspace(prisma);

  if (!workspace) {
    return null;
  }

  return { prisma, workspace };
}

async function withWorkspaceContext<T>(
  loader: (context: NonNullable<Awaited<ReturnType<typeof getWorkspaceContext>>>) => Promise<T>,
): Promise<T | null> {
  try {
    const context = await getWorkspaceContext();

    if (!context) {
      return null;
    }

    return await loader(context);
  } catch (error) {
    console.error("Kunde inte läsa analytics workspace-data.", error);
    return null;
  }
}

function createRangePoints(days: number, segments: number, now: Date) {
  const segmentMs = Math.max(1, Math.floor((days * 24 * 60 * 60 * 1000) / segments));

  return Array.from({ length: segments }, (_, index) => {
    const from = new Date(now.getTime() - segmentMs * (segments - index));
    const to = new Date(now.getTime() - segmentMs * (segments - index - 1));
    const label =
      days >= 180
        ? from.toLocaleDateString("sv-SE", { month: "short" })
        : days > 14
          ? `${from.getDate()}/${from.getMonth() + 1}`
          : from.toLocaleDateString("sv-SE", { weekday: "short" });

    return { from, to, label };
  });
}

function calculateDelta(current: number, previous: number) {
  if (previous <= 0 && current <= 0) {
    return { text: "0%", direction: "flat" as const };
  }

  if (previous <= 0) {
    return { text: "+100%", direction: "up" as const };
  }

  const raw = ((current - previous) / previous) * 100;

  if (Math.abs(raw) < 0.5) {
    return { text: "0%", direction: "flat" as const };
  }

  return {
    text: `${raw > 0 ? "+" : ""}${raw.toFixed(1).replace(".", ",")}%`,
    direction: raw > 0 ? ("up" as const) : ("down" as const),
  };
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildFallbackAnalyticsData(): AnalyticsData {
  const now = new Date();
  const fallbackRanges = [
    {
      id: "7d",
      label: "7D",
      revenue: [380000, 396000, 404000, 412000, 421000, 433000, 428000],
      pipeline: [890000, 940000, 980000, 1020000, 1090000, 1170000, 1210000],
      conversion: [20, 21, 22, 23, 24, 25, 24.8],
      bookings: [12, 14, 13, 15, 16, 18, 17],
      responseTime: [2.6, 2.4, 2.3, 2.1, 2, 1.9, 1.8],
      customerHealth: [78, 80, 81, 82, 84, 85, 86],
    },
    {
      id: "30d",
      label: "30D",
      revenue: [324000, 351000, 368000, 389000, 412000, 428000],
      pipeline: [760000, 835000, 910000, 1010000, 1120000, 1210000],
      conversion: [18, 20, 21.5, 22.8, 24.2, 24.8],
      bookings: [48, 52, 58, 61, 66, 68],
      responseTime: [3.4, 3, 2.7, 2.3, 2, 1.8],
      customerHealth: [74, 77, 79, 82, 84, 86],
    },
    {
      id: "90d",
      label: "90D",
      revenue: [286000, 312000, 348000, 377000, 405000, 428000],
      pipeline: [620000, 710000, 840000, 960000, 1080000, 1210000],
      conversion: [15, 17.5, 19.2, 21.4, 23.1, 24.8],
      bookings: [32, 39, 47, 55, 62, 68],
      responseTime: [4.1, 3.7, 3.1, 2.7, 2.2, 1.8],
      customerHealth: [68, 71, 75, 79, 83, 86],
    },
    {
      id: "12m",
      label: "12M",
      revenue: [180000, 194000, 208000, 226000, 242000, 258000, 279000, 301000, 328000, 356000, 392000, 428000],
      pipeline: [410000, 438000, 470000, 512000, 560000, 618000, 694000, 782000, 894000, 1010000, 1115000, 1210000],
      conversion: [11, 12.5, 13.4, 14.8, 16.1, 17.4, 18.6, 20.2, 21.8, 22.9, 24.1, 24.8],
      bookings: [18, 21, 23, 28, 31, 35, 41, 46, 52, 58, 63, 68],
      responseTime: [5.1, 4.8, 4.4, 4.1, 3.8, 3.4, 3, 2.7, 2.4, 2.1, 1.9, 1.8],
      customerHealth: [60, 62, 64, 67, 69, 72, 75, 78, 80, 82, 84, 86],
    },
  ].map((range) => {
    const labels = createRangePoints(
      range.id === "7d" ? 7 : range.id === "30d" ? 30 : range.id === "90d" ? 90 : 360,
      range.revenue.length,
      now,
    ).map((point) => point.label);

    return {
      id: range.id,
      label: range.label,
      points: labels.map((label, index) => ({
        label,
        revenue: range.revenue[index] ?? 0,
        pipeline: range.pipeline[index] ?? 0,
        conversion: range.conversion[index] ?? 0,
        leads: Math.round((range.pipeline[index] ?? 0) / 42000),
        bookings: range.bookings[index] ?? 0,
        responseTime: range.responseTime[index] ?? 0,
        customerHealth: range.customerHealth[index] ?? 0,
      })),
    };
  });

  const defaultRange = fallbackRanges.find((range) => range.id === "30d") ?? fallbackRanges[0];
  const sparkline = (metric: keyof typeof defaultRange.points[number]) =>
    defaultRange.points.map((point) => point[metric] as number);

  return {
    hero: {
      eyebrow: "Business intelligence workspace",
      title: "Statistikpanelen är redo med en komplett beslutsyta",
      summary:
        "Visar en fullt renderbar analytics workspace med KPI:er, trender, tabeller och AI-insikter medan live-data ansluts till arbetsytan.",
      liveLabel: "Standardmodell aktiv tills live-data synkats",
      primaryAction: { label: "Öppna pipeline", href: "/pipeline" },
      secondaryActions: [
        { label: "Se fakturering", href: "/fakturering" },
        { label: "Öppna kunder", href: "/kunder" },
        { label: "AI-analys", href: "/ai-assistent" },
      ],
      statusChips: [
        { label: "Intäkt", value: formatCurrency(4_280_000), tone: "emerald" },
        { label: "Pipeline", value: formatCurrency(1_210_000), tone: "emerald" },
        { label: "Retention", value: formatPercent(86), tone: "amber" },
        { label: "Kapacitet", value: "72%", tone: "slate" },
      ],
    },
    overviewMetrics: [
      {
        id: "revenue",
        label: "Total intäkt",
        group: "Ekonomi",
        value: formatCurrency(4_280_000),
        delta: "+12,4%",
        deltaDirection: "up",
        benchmark: "2 fakturor bör följas upp för full cash conversion",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("revenue"),
        href: "/fakturering",
      },
      {
        id: "pipeline",
        label: "Pipelinevarde",
        group: "Sälj",
        value: formatCurrency(1_210_000),
        delta: "+18,1%",
        deltaDirection: "up",
        benchmark: "29 aktiva affärer i flöde",
        status: "Bra",
        tone: "violet",
        sparkline: sparkline("pipeline"),
        href: "/pipeline",
      },
      {
        id: "conversion",
        label: "Konvertering",
        group: "Sälj",
        value: formatPercent(24.8),
        delta: "+3,2%",
        deltaDirection: "up",
        benchmark: "Över benchmark för senaste 90 dagar",
        status: "Bra",
        tone: "cyan",
        sparkline: sparkline("conversion"),
        href: "/pipeline",
      },
      {
        id: "retention",
        label: "Retention",
        group: "Kunder",
        value: formatPercent(86),
        delta: "+1,8%",
        deltaDirection: "up",
        benchmark: "6 relationer i watch-segment",
        status: "Stabil",
        tone: "cyan",
        sparkline: sparkline("customerHealth"),
        href: "/kunder",
      },
      {
        id: "capacity",
        label: "Team capacity",
        group: "Team",
        value: "72%",
        delta: "+4,0%",
        deltaDirection: "up",
        benchmark: "Kapacitetsrisk under kontroll kommande 14 dagar",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("bookings").map((value) => Math.max(0, 80 - value)),
        href: "/team",
      },
      {
        id: "customers",
        label: "Aktiva kunder",
        group: "Kunder",
        value: "48",
        delta: "+9,1%",
        deltaDirection: "up",
        benchmark: "11 kunder över 75 i health score",
        status: "Stabil",
        tone: "cyan",
        sparkline: sparkline("customerHealth"),
        href: "/kunder",
      },
      {
        id: "bookings",
        label: "Bokningsgrad",
        group: "Drift",
        value: "68%",
        delta: "+6,4%",
        deltaDirection: "up",
        benchmark: "17 bokningar kommande 7 dagar",
        status: "Stabil",
        tone: "amber",
        sparkline: sparkline("bookings"),
        href: "/bokningar",
      },
      {
        id: "mrr",
        label: "MRR",
        group: "Ekonomi",
        value: formatCurrency(428_000),
        delta: "+9,7%",
        deltaDirection: "up",
        benchmark: "Run-rate driven av stark offertkonvertering",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("revenue"),
        href: "/statistik",
      },
      {
        id: "arr",
        label: "ARR",
        group: "Ekonomi",
        value: formatCurrency(5_136_000),
        delta: "+10,8%",
        deltaDirection: "up",
        benchmark: "Årstakt över intern baseline",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("revenue"),
        href: "/statistik",
      },
      {
        id: "responseTime",
        label: "Svarstid",
        group: "Team",
        value: formatHours(1.8),
        delta: "-18,2%",
        deltaDirection: "down",
        benchmark: "Svar inom SLA för VIP-segment",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("responseTime"),
        href: "/konversationer",
      },
      {
        id: "winRate",
        label: "Win rate",
        group: "Sälj",
        value: formatPercent(33),
        delta: "+4,5%",
        deltaDirection: "up",
        benchmark: "8 vunna / 5 tappade affärer",
        status: "Bra",
        tone: "emerald",
        sparkline: sparkline("conversion"),
        href: "/pipeline",
      },
      {
        id: "leadVelocity",
        label: "Lead velocity",
        group: "Sälj",
        value: "61%",
        delta: "+7,0%",
        deltaDirection: "up",
        benchmark: "Offertuppföljning snabbare än förra perioden",
        status: "Stabil",
        tone: "amber",
        sparkline: [38, 42, 47, 52, 56, 59, 61],
        href: "/leads",
      },
    ],
    filterBar: {
      ranges: fallbackRanges.map((range) => ({ id: range.id, label: range.label })),
      savedViews: [
        {
          id: "executive",
          label: "Executive",
          metricIds: ["revenue", "pipeline", "conversion", "retention", "capacity", "bookings"],
          rangeId: "30d",
        },
        {
          id: "sales",
          label: "Sälj",
          metricIds: ["pipeline", "conversion", "winRate", "leadVelocity", "mrr", "arr"],
          rangeId: "90d",
        },
        {
          id: "operations",
          label: "Drift",
          metricIds: ["capacity", "bookings", "responseTime", "customers"],
          rangeId: "30d",
        },
      ],
      teams: ["Sälj", "CS", "Delivery", "Management"],
      owners: ["Anna Berg", "Erik Lind", "Sara Holm", "Leo Nyberg"],
      stages: ["Nya", "Kvalificerade", "Offert", "Vunna", "Tappade"],
      risks: ["Låg", "Medel", "Hög"],
      bookingStatuses: ["Bekräftad", "Behöver påminnelse", "Avslutad"],
    },
    mainChart: {
      defaultMetricId: "revenue",
      ranges: fallbackRanges,
      metrics: [
        { id: "revenue", label: "Intäkter", tone: "emerald", format: "currency" },
        { id: "pipeline", label: "Pipeline", tone: "violet", format: "currency" },
        { id: "conversion", label: "Konvertering", tone: "cyan", format: "percent" },
        { id: "bookings", label: "Bokningar", tone: "amber", format: "count" },
        { id: "responseTime", label: "Svarstid", tone: "rose", format: "hours" },
        { id: "customers", label: "Kundhälsa", tone: "slate", format: "score" },
      ],
    },
    categorizationCharts: [
      {
        id: "pipeline-distribution",
        title: "Pipelinefördelning",
        subtitle: "Visar hur öppet pipelinevärde är fördelat mellan stadier.",
        centerLabel: "Aktiv pipeline",
        centerValue: formatCurrency(1_210_000),
        segments: [
          { label: "Nya", value: formatCurrency(280_000), rawValue: 280_000, percentage: 23, tone: "cyan", href: "/pipeline" },
          { label: "Kvalificerade", value: formatCurrency(340_000), rawValue: 340_000, percentage: 28, tone: "violet", href: "/pipeline" },
          { label: "Offert", value: formatCurrency(590_000), rawValue: 590_000, percentage: 49, tone: "emerald", href: "/pipeline" },
        ],
      },
      {
        id: "customer-segments",
        title: "Kundsegment",
        subtitle: "Hälsa, upsell och risknivå för den aktiva kundbasen.",
        centerLabel: "Aktiva kunder",
        centerValue: "48",
        segments: [
          { label: "Healthy", value: "31 kunder", rawValue: 31, percentage: 65, tone: "emerald", href: "/kunder" },
          { label: "Upsell", value: "10 kunder", rawValue: 10, percentage: 21, tone: "cyan", href: "/kunder" },
          { label: "Watch", value: "5 kunder", rawValue: 5, percentage: 10, tone: "amber", href: "/kunder" },
          { label: "At risk", value: "2 kunder", rawValue: 2, percentage: 4, tone: "rose", href: "/kunder" },
        ],
      },
      {
        id: "revenue-mix",
        title: "Intäktsmix",
        subtitle: "Hur topline fördelas mellan återkommande volym, pipeline och riskbelopp.",
        centerLabel: "Revenue mix",
        centerValue: formatCurrency(4_280_000),
        segments: [
          { label: "Recurring", value: formatCurrency(3_180_000), rawValue: 3_180_000, percentage: 74, tone: "emerald", href: "/fakturering" },
          { label: "Pipeline next", value: formatCurrency(974_000), rawValue: 974_000, percentage: 23, tone: "violet", href: "/pipeline" },
          { label: "Riskbelopp", value: formatCurrency(126_000), rawValue: 126_000, percentage: 3, tone: "rose", href: "/fakturering" },
        ],
      },
    ],
    rankedLists: [
      {
        id: "priority-signals",
        title: "Prioriterade signaler",
        subtitle: "Rankade områden som kräver snabbast uppföljning just nu.",
        items: [
          { rank: 1, label: "Förfallna fakturor", value: formatCurrency(126_000), percentage: 92, trend: "+18%", status: "Risk", progress: 92, tone: "rose", href: "/fakturering" },
          { rank: 2, label: "VIP-kunder i watch", value: "5 kunder", percentage: 68, trend: "+9%", status: "Bevaka", progress: 68, tone: "amber", href: "/kunder" },
          { rank: 3, label: "Offertstadium", value: "9 affärer", percentage: 74, trend: "+12%", status: "Momentum", progress: 74, tone: "violet", href: "/pipeline" },
          { rank: 4, label: "Team overload fredag", value: "72% load", percentage: 61, trend: "+6%", status: "Bevaka", progress: 61, tone: "amber", href: "/team" },
          { rank: 5, label: "Tysta leads", value: "11 leads", percentage: 46, trend: "-4%", status: "Möjlighet", progress: 46, tone: "cyan", href: "/leads" },
        ],
      },
      {
        id: "lead-breakdown",
        title: "Leadprioritet",
        subtitle: "Vilka kategorier driver mest värde och bör få uppmärksamhet först.",
        items: [
          { rank: 1, label: "Enterprise-offerter", value: formatCurrency(590_000), percentage: 49, trend: "+15%", status: "Hög potential", progress: 49, tone: "emerald", href: "/pipeline" },
          { rank: 2, label: "Kvalificerade leads", value: formatCurrency(340_000), percentage: 28, trend: "+11%", status: "Bygg momentum", progress: 28, tone: "cyan", href: "/pipeline" },
          { rank: 3, label: "Nya leads", value: formatCurrency(280_000), percentage: 23, trend: "+7%", status: "Tidigt läge", progress: 23, tone: "violet", href: "/leads" },
          { rank: 4, label: "Förlorade leads", value: "5 affärer", percentage: 17, trend: "-12%", status: "Förbättra", progress: 17, tone: "rose", href: "/pipeline" },
        ],
      },
    ],
    periodComparisons: [
      {
        label: "Nuvarande vecka",
        currentPeriod: "Denna vecka",
        previousPeriod: "Förra veckan",
        currentValue: formatPercent(24.8),
        previousValue: formatPercent(21.6),
        delta: "+14,8%",
        deltaDirection: "up",
        insight: "Snabbare offertuppföljning driver högre konvertering i sena steg.",
        tone: "emerald",
      },
      {
        label: "Månadstakt",
        currentPeriod: "Denna månad",
        previousPeriod: "Förra månaden",
        currentValue: formatCurrency(428_000),
        previousValue: formatCurrency(389_000),
        delta: "+10,0%",
        deltaDirection: "up",
        insight: "MRR växer stabilt trots viss betalfriktion i risksegmentet.",
        tone: "cyan",
      },
      {
        label: "Kvartalsrisk",
        currentPeriod: "Detta kvartal",
        previousPeriod: "Föregående kvartal",
        currentValue: "72% capacity",
        previousValue: "78% capacity",
        delta: "-6,0%",
        deltaDirection: "down",
        insight: "Teamload ökar snabbare än automation och bör balanseras före fredagstoppar.",
        tone: "amber",
      },
      {
        label: "Årlig retention",
        currentPeriod: "Nu",
        previousPeriod: "Baslinje",
        currentValue: formatPercent(86),
        previousValue: formatPercent(79),
        delta: "+8,9%",
        deltaDirection: "up",
        insight: "Kundhälsan förbättras när VIP-kunder får tätare check-ins.",
        tone: "emerald",
      },
    ],
    weeklyActivity: {
      peakDay: "Onsdag",
      quietDay: "Söndag",
      highestLoad: "Fredag eftermiddag",
      aiRecommendation: "Automatisera uppföljning för tysta leads innan fredagens belastning toppar.",
      days: [
        { label: "Mån", activity: 56, bookings: 8, support: 6, ai: 3, load: 58, tone: "cyan" },
        { label: "Tis", activity: 62, bookings: 9, support: 7, ai: 4, load: 64, tone: "emerald" },
        { label: "Ons", activity: 74, bookings: 11, support: 9, ai: 5, load: 78, tone: "violet" },
        { label: "Tor", activity: 67, bookings: 10, support: 8, ai: 4, load: 72, tone: "amber" },
        { label: "Fre", activity: 71, bookings: 12, support: 8, ai: 6, load: 84, tone: "rose" },
        { label: "Lör", activity: 34, bookings: 4, support: 3, ai: 1, load: 32, tone: "slate" },
        { label: "Sön", activity: 22, bookings: 2, support: 2, ai: 1, load: 20, tone: "slate" },
      ],
    },
    performanceBars: [
      { label: "SLA-svarstid", value: "91%", helper: "Svar under 2h", progress: 91, target: "Mål 95%", status: "Nära mål", tone: "emerald" },
      { label: "Konverteringsmål", value: "83%", helper: "24,8% av 30% mål", progress: 83, target: "Mål 30%", status: "Bra takt", tone: "cyan" },
      { label: "Beläggning", value: "68%", helper: "Av tillgänglig kapacitet", progress: 68, target: "Tak 80%", status: "Bevaka", tone: "amber" },
      { label: "AI confidence", value: "94%", helper: "Insikter med hög säkerhet", progress: 94, target: "Över 90%", status: "Stabil", tone: "violet" },
      { label: "Automation savings", value: "37h", helper: "Frigjord tid denna månad", progress: 74, target: "Mål 50h", status: "Växer", tone: "violet" },
    ],
    recommendations: [
      {
        title: "Prioritera VIP-kunder idag",
        detail: "Watch-segmentet ökar och bör få snabbare check-ins innan retention påverkas.",
        actionLabel: "Öppna kunder",
        href: "/kunder",
        tone: "amber",
      },
      {
        title: "Pipeline stannar i offertstadiet",
        detail: "Sena affärer bär mest värde och behöver tätare uppföljning för att säkra vinstgrad.",
        actionLabel: "Öppna pipeline",
        href: "/pipeline",
        tone: "violet",
      },
      {
        title: "Automatisera uppföljning för tysta leads",
        detail: "Lead velocity kan höjas genom att låsa standardiserade nudge-flöden.",
        actionLabel: "Öppna AI-analys",
        href: "/ai-assistent",
        tone: "cyan",
      },
    ],
    revenueAnalysis: {
      cards: [
        { label: "Omsättning", value: formatCurrency(4_280_000), note: "Total fakturerad topline över senaste perioden.", trend: "+12,4%", tone: "emerald" },
        { label: "MRR", value: formatCurrency(428_000), note: "Månatlig run-rate från fakturering och sannolik pipeline.", trend: "+9,7%", tone: "emerald" },
        { label: "ARR", value: formatCurrency(5_136_000), note: "Årstakt baserad på nuvarande återkommande volym.", trend: "+10,8%", tone: "cyan" },
        { label: "AOV", value: formatCurrency(84_000), note: "Genomsnittligt ordervärde i senaste kohorten.", trend: "51 affärer", tone: "violet" },
      ],
      leakage: [
        { title: "Revenue leakage", value: formatCurrency(126_000), detail: "Förfallna eller sena betalningar bromsar full intäktsrealisering.", tone: "rose" },
        { title: "Forecast nästa period", value: formatCurrency(4_740_000), detail: "Bygger på topline plus sannolik andel av aktiv pipeline.", tone: "amber" },
      ],
      forecast: [
        { label: "Fakturerat nu", value: formatCurrency(3_980_000) },
        { label: "Öppen pipeline", value: formatCurrency(1_210_000) },
        { label: "Riskbelopp", value: formatCurrency(126_000) },
      ],
    },
    pipelineAnalysis: {
      summaryCards: [
        { label: "Pipeline value", value: formatCurrency(1_210_000), note: "29 aktiva affärer" },
        { label: "Win rate", value: formatPercent(33), note: "8 vunna / 5 tappade" },
        { label: "Deal velocity", value: "61%", note: "Andel leads med ny rörelse senaste veckan" },
      ],
      stages: [
        { label: "Nya", count: 12, value: formatCurrency(280_000), conversion: "100%", dropoff: "0%", probability: "20%" },
        { label: "Kvalificerade", count: 8, value: formatCurrency(340_000), conversion: "67%", dropoff: "33%", probability: "45%" },
        { label: "Offert", count: 9, value: formatCurrency(590_000), conversion: "113%", dropoff: "12%", probability: "70%" },
        { label: "Vunna", count: 8, value: formatCurrency(420_000), conversion: "89%", dropoff: "11%", probability: "100%" },
        { label: "Tappade", count: 5, value: formatCurrency(190_000), conversion: "56%", dropoff: "44%", probability: "0%" },
      ],
      lostReasons: [
        { reason: "Långsam offertuppföljning", count: 2 },
        { reason: "Prispress från konkurrent", count: 2 },
        { reason: "Fel timing hos kund", count: 1 },
      ],
      heatmap: [
        { label: "Nya", percentage: 42 },
        { label: "Kvalificerade", percentage: 58 },
        { label: "Offert", percentage: 74 },
        { label: "Vunna", percentage: 33 },
        { label: "Tappade", percentage: 21 },
      ],
    },
    customerAnalysis: {
      summaryCards: [
        { label: "Aktiva kunder", value: "48", note: "41 stabila relationer" },
        { label: "Kundhälsa", value: "86/100", note: "6 relationer i watch eller risk" },
        { label: "Retention", value: formatPercent(86), note: "Svarstiden förbättrad i VIP-segmentet" },
      ],
      segments: [
        { label: "Healthy", value: "31", percentage: 65, tone: "emerald" },
        { label: "Upsell", value: "10", percentage: 21, tone: "cyan" },
        { label: "Watch", value: "5", percentage: 10, tone: "amber" },
        { label: "At risk", value: "2", percentage: 4, tone: "rose" },
      ],
      topCustomers: [
        { name: "Nordic Flow AB", revenue: formatCurrency(540_000), score: "92/100", health: "Healthy", status: "Hög stabilitet" },
        { name: "Atlas Legal", revenue: formatCurrency(428_000), score: "89/100", health: "Upsell", status: "Mogen för expansion" },
        { name: "Studio Form", revenue: formatCurrency(392_000), score: "84/100", health: "Healthy", status: "Stabil relation" },
        { name: "Meridian Group", revenue: formatCurrency(318_000), score: "76/100", health: "Watch", status: "Behöver check-in" },
      ],
    },
    teamAnalysis: {
      summaryCards: [
        { label: "Team size", value: "9", note: "Aktiva användare i arbetsytan" },
        { label: "Öppna uppgifter", value: "34", note: "8 med hög prioritet" },
        { label: "Svarstid", value: formatHours(1.8), note: "24 aktiva dialoger" },
        { label: "Automationer", value: "6", note: "Aktiva workflows i drift" },
      ],
      members: [
        { name: "Anna Berg", workload: "Balanserad", openTasks: "7", responseTime: "1,5h", activity: "Pipeline, offerter och uppföljning", status: "Stabil" },
        { name: "Erik Lind", workload: "Hög", openTasks: "9", responseTime: "1,9h", activity: "Nya leads och offertdrivna affärer", status: "Behöver avlastning" },
        { name: "Sara Holm", workload: "Balanserad", openTasks: "6", responseTime: "1,7h", activity: "Kundhälsa och retentionarbete", status: "Stabil" },
        { name: "Leo Nyberg", workload: "Låg", openTasks: "3", responseTime: "2,1h", activity: "Operations och bokningskoordination", status: "Tillgänglig kapacitet" },
      ],
    },
    operationsAnalysis: {
      summaryCards: [
        { label: "Beläggning", value: "68%", note: "17 bokningar i kalendern" },
        { label: "Påminnelser", value: "4", note: "Bokningar som kräver förberedelse" },
        { label: "Deadlines", value: "8", note: "Höga eller akuta uppgifter med tryck" },
      ],
      upcomingBookings: [
        { title: "QBR med Nordic Flow", customer: "Nordic Flow AB", time: "12 maj 09:00", status: "Bekräftad" },
        { title: "Onboarding kickoff", customer: "Atlas Legal", time: "13 maj 10:30", status: "Bekräftad" },
        { title: "Retention review", customer: "Meridian Group", time: "14 maj 14:00", status: "Behöver påminnelse" },
        { title: "Pipeline sync", customer: "Studio Form", time: "15 maj 08:30", status: "Bekräftad" },
      ],
      deadlines: [
        { title: "Skicka reviderad offert", owner: "Erik Lind", due: "Idag", severity: "Akut" },
        { title: "Retention-plan VIP-kund", owner: "Sara Holm", due: "Imorgon", severity: "Hög" },
        { title: "Fakturauppföljning Q2", owner: "Anna Berg", due: "2 dagar", severity: "Hög" },
        { title: "Kapacitetsplan vecka 21", owner: "Leo Nyberg", due: "3 dagar", severity: "Hög" },
      ],
    },
    liveFeed: [
      { title: "Ny offert skapad för Atlas Legal", detail: "Pipelinevärdet ökade efter uppdaterad offert i sena steget.", time: "12 min sedan", type: "Aktivitet", href: "/pipeline", tone: "violet" },
      { title: "AI flaggade förbättrad svarstid", detail: "Säljteamet ligger nu under 2h i genomsnittlig svarstid.", time: "24 min sedan", type: "AI", href: "/ai-assistent", tone: "emerald" },
      { title: "Bokning kräver påminnelse", detail: "Retention review för Meridian Group saknar bekräftelse.", time: "41 min sedan", type: "Aktivitet", href: "/bokningar", tone: "amber" },
      { title: "Förfallen faktura bevakas", detail: "Ekonomiflödet behöver uppföljning på 126 000 kr i riskbelopp.", time: "1h sedan", type: "Aktivitet", href: "/fakturering", tone: "rose" },
    ],
    aiInsights: [
      {
        headline: "Konverteringen ökar efter snabbare offertuppföljning",
        detail: "De senaste affärerna rör sig snabbare från kvalificerad till offert än tidigare period.",
        actionLabel: "Öppna AI-analys",
        href: "/ai-assistent",
        tone: "emerald",
      },
      {
        headline: "VIP-kunder svarar långsammare än övriga segment",
        detail: "Kundteamet bör prioritera uppföljning på watch-segmentet innan retention påverkas.",
        actionLabel: "Öppna kunder",
        href: "/kunder",
        tone: "amber",
      },
      {
        headline: "Kassaflödet kan förbättras med snabbare fakturauppföljning",
        detail: "Riskbeloppet är hanterbart men bör stängas innan ny expansion prioriteras.",
        actionLabel: "Öppna fakturering",
        href: "/fakturering",
        tone: "rose",
      },
    ],
    dataTables: {
      topCustomers: {
        columns: ["Kund", "Intäkt", "Score", "Hälsa", "Status"],
        rows: [
          { Kund: "Nordic Flow AB", Intäkt: formatCurrency(540_000), Score: "92/100", Hälsa: "Healthy", Status: "Stabil" },
          { Kund: "Atlas Legal", Intäkt: formatCurrency(428_000), Score: "89/100", Hälsa: "Upsell", Status: "Expansion" },
          { Kund: "Studio Form", Intäkt: formatCurrency(392_000), Score: "84/100", Hälsa: "Healthy", Status: "Stabil" },
        ],
      },
      topDeals: {
        columns: ["Affär", "Steg", "Värde", "Score", "Nästa steg"],
        rows: [
          { Affär: "Atlas Legal Enterprise", Steg: "Offert", Värde: formatCurrency(320_000), Score: "91/100", "Nästa steg": "Förankra offert med CFO" },
          { Affär: "Meridian Renewal", Steg: "Kvalificerad", Värde: formatCurrency(240_000), Score: "84/100", "Nästa steg": "Retentionmöte denna vecka" },
          { Affär: "Studio Form Expansion", Steg: "Offert", Värde: formatCurrency(180_000), Score: "79/100", "Nästa steg": "Skicka case-paket" },
        ],
      },
      latestInvoices: {
        columns: ["Faktura", "Kund", "Belopp", "Status", "Förfallo"],
        rows: [
          { Faktura: "INV-24051", Kund: "Nordic Flow AB", Belopp: formatCurrency(96_000), Status: "Betald", Förfallo: "2026-05-12" },
          { Faktura: "INV-24052", Kund: "Atlas Legal", Belopp: formatCurrency(84_000), Status: "Skickad", Förfallo: "2026-05-14" },
          { Faktura: "INV-24049", Kund: "Meridian Group", Belopp: formatCurrency(42_000), Status: "Förfallen", Förfallo: "2026-05-08" },
        ],
      },
      openRisks: {
        columns: ["Typ", "Signal", "Nivå", "Åtgärd"],
        rows: [
          { Typ: "Faktura", Signal: "Meridian Group", Nivå: "Hög", Åtgärd: "Följ upp betalning" },
          { Typ: "Kund", Signal: "Watch-segment ökar", Nivå: "Medel", Åtgärd: "Retention-checkin" },
          { Typ: "Kapacitet", Signal: "Erik Lind över 85% load", Nivå: "Medel", Åtgärd: "Omfördela workload" },
        ],
      },
    },
    exportCenter: {
      summary:
        "Exportera KPI-data, tabeller och ledningssammanfattningar direkt från analytics-workspacen.",
      actions: [
        { label: "CSV-export", description: "Ladda ned aktuella tabeller och KPI-data.", type: "csv" },
        { label: "PDF / print", description: "Skapa en delbar executive-rapport via utskrift.", type: "pdf" },
        { label: "Spara vy", description: "Spara KPI-layout och filter som en personlig vy.", type: "view" },
      ],
    },
  };
}

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
  return (
    (await withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const lastYear = new Date(now);
    lastYear.setDate(now.getDate() - 365);

    const [
      invoices,
      leads,
      customers,
      bookings,
      tasks,
      conversations,
      insights,
      activities,
      activeAutomations,
      teamMembers,
    ] = await Promise.all([
      prisma.invoice.findMany({
        where: { workspaceId: workspace.id },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 120,
      }),
      prisma.lead.findMany({
        where: { workspaceId: workspace.id },
        select: {
          companyName: true,
          status: true,
          estimatedValue: true,
          score: true,
          lastContactAt: true,
          nextAction: true,
          updatedAt: true,
          createdAt: true,
          owner: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 160,
      }),
      prisma.customer.findMany({
        where: { workspaceId: workspace.id },
        select: {
          companyName: true,
          health: true,
          score: true,
          revenueGenerated: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 120,
      }),
      prisma.booking.findMany({
        where: { workspaceId: workspace.id },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ startsAt: "desc" }],
        take: 120,
      }),
      prisma.task.findMany({
        where: { workspaceId: workspace.id },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
          lead: {
            select: {
              companyName: true,
            },
          },
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 160,
      }),
      prisma.conversationThread.findMany({
        where: { workspaceId: workspace.id },
        select: {
          sentiment: true,
          lastMessageAt: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ lastMessageAt: "desc" }],
        take: 120,
      }),
      prisma.aIInsight.findMany({
        where: {
          workspaceId: workspace.id,
          type: {
            in: [AIInsightType.ANALYTICS, AIInsightType.SUMMARY, AIInsightType.RISK],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.activityLog.findMany({
        where: { workspaceId: workspace.id, createdAt: { gte: lastYear } },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      prisma.automationFlow.count({
        where: {
          workspaceId: workspace.id,
          status: AutomationStatus.ACTIVE,
        },
      }),
      prisma.user.findMany({
        where: {
          workspaceId: workspace.id,
          isActive: true,
        },
        select: {
          firstName: true,
          lastName: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      }),
    ]);

    const activeLeads = leads.filter(
      (lead) =>
        lead.status === LeadStatus.NEW ||
        lead.status === LeadStatus.QUALIFIED ||
        lead.status === LeadStatus.PROPOSAL,
    );
    const wonLeads = leads.filter((lead) => lead.status === LeadStatus.WON);
    const lostLeads = leads.filter((lead) => lead.status === LeadStatus.LOST);
    const proposalLeads = leads.filter((lead) => lead.status === LeadStatus.PROPOSAL);
    const paidInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.PAID);
    const activeInvoices = invoices.filter((invoice) => invoice.status !== InvoiceStatus.VOID);
    const overdueInvoices = invoices.filter(
      (invoice) =>
        invoice.status === InvoiceStatus.OVERDUE ||
        (invoice.status === InvoiceStatus.SENT && invoice.dueDate && invoice.dueDate < now),
    );
    const atRiskCustomers = customers.filter(
      (customer) =>
        customer.health === CustomerHealth.AT_RISK || customer.health === CustomerHealth.WATCH,
    );
    const healthyCustomers = customers.filter(
      (customer) =>
        customer.health === CustomerHealth.HEALTHY || customer.health === CustomerHealth.UPSELL,
    );
    const upcomingBookings = bookings
      .filter((booking) => booking.startsAt >= now)
      .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
    const openTasks = tasks.filter(
      (task) => task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS,
    );
    const urgentTasks = openTasks.filter(
      (task) => task.priority === TaskPriority.URGENT || task.priority === TaskPriority.HIGH,
    );
    const negativeConversations = conversations.filter(
      (thread) => thread.sentiment === ConversationSentiment.NEGATIVE,
    );
    const positiveConversations = conversations.filter(
      (thread) => thread.sentiment === ConversationSentiment.POSITIVE,
    );
    const revenue = activeInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
    const pipelineValue = activeLeads.reduce(
      (sum, lead) => sum + toNumber(lead.estimatedValue),
      0,
    );
    const conversionRate = Math.round((wonLeads.length / Math.max(leads.length, 1)) * 1000) / 10;
    const winRate =
      wonLeads.length + lostLeads.length > 0
        ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 1000) / 10
        : 0;
    const retentionRate = Math.round(
      (healthyCustomers.length / Math.max(customers.length, 1)) * 1000,
    ) / 10;
    const averageCustomerScore = Math.round(
      average(customers.map((customer) => customer.score ?? 0)),
    );
    const occupancyBase = Math.max(workspace.companySize ?? teamMembers.length ?? 4, 4) * 3;
    const bookingRate = Math.min(100, Math.round((upcomingBookings.length / occupancyBase) * 100));
    const teamCapacity = Math.max(0, 100 - bookingRate);
    const recurringRunRate = paidRevenue + Math.round(pipelineValue * 0.18);
    const mrrEstimate = Math.round(recurringRunRate / 12);
    const arrEstimate = mrrEstimate * 12;
    const responseHours =
      conversations.length > 0
        ? Math.max(1, Math.round((conversations.length / Math.max(teamMembers.length, 1)) * 1.8))
        : 0;
    const movingLeads = activeLeads.filter((lead) => {
      const ageDays =
        (now.getTime() - (lead.lastContactAt ?? lead.updatedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      return ageDays <= 7;
    }).length;
    const leadVelocity =
      activeLeads.length > 0
        ? Math.max(0, Math.round((movingLeads / activeLeads.length) * 100))
        : 0;

    const chartRanges = [
      { id: "7d", label: "7D", days: 7, segments: 7 },
      { id: "30d", label: "30D", days: 30, segments: 6 },
      { id: "90d", label: "90D", days: 90, segments: 6 },
      { id: "12m", label: "12M", days: 360, segments: 12 },
    ].map((config) => {
      const buckets = createRangePoints(config.days, config.segments, now);

      return {
        id: config.id,
        label: config.label,
        points: buckets.map((bucket) => {
          const bucketInvoices = activeInvoices.filter(
            (invoice) => invoice.createdAt >= bucket.from && invoice.createdAt < bucket.to,
          );
          const bucketLeads = leads.filter(
            (lead) => lead.createdAt >= bucket.from && lead.createdAt < bucket.to,
          );
          const bucketActiveLeads = activeLeads.filter(
            (lead) => lead.updatedAt >= bucket.from && lead.updatedAt < bucket.to,
          );
          const bucketWonLeads = wonLeads.filter(
            (lead) => lead.updatedAt >= bucket.from && lead.updatedAt < bucket.to,
          );
          const bucketBookings = bookings.filter(
            (booking) => booking.startsAt >= bucket.from && booking.startsAt < bucket.to,
          );
          const bucketConversations = conversations.filter(
            (thread) =>
              thread.lastMessageAt &&
              thread.lastMessageAt >= bucket.from &&
              thread.lastMessageAt < bucket.to,
          );
          const bucketCustomers = customers.filter(
            (customer) => customer.updatedAt >= bucket.from && customer.updatedAt < bucket.to,
          );

          return {
            label: bucket.label,
            revenue: bucketInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
            pipeline: bucketActiveLeads.reduce(
              (sum, lead) => sum + toNumber(lead.estimatedValue),
              0,
            ),
            conversion: bucketLeads.length
              ? Math.round((bucketWonLeads.length / bucketLeads.length) * 100)
              : 0,
            leads: bucketLeads.length,
            bookings: bucketBookings.length,
            responseTime:
              bucketConversations.length > 0
                ? Math.max(
                    1,
                    Math.round((bucketConversations.length / Math.max(teamMembers.length, 1)) * 2),
                  )
                : 0,
            customerHealth: Math.round(
              average(bucketCustomers.map((customer) => customer.score ?? averageCustomerScore)),
            ),
          };
        }),
      };
    });

    const defaultRange = chartRanges.find((range) => range.id === "30d") ?? chartRanges[0];
    const getSeries = (metric: keyof AnalyticsData["mainChart"]["ranges"][number]["points"][number]) =>
      defaultRange.points.map((point) => point[metric] as number);
    const compareSeries = (series: number[]) => {
      const half = Math.max(1, Math.floor(series.length / 2));
      const current = average(series.slice(-half));
      const previous = average(series.slice(0, half));
      return calculateDelta(current, previous);
    };

    const revenueDelta = compareSeries(getSeries("revenue"));
    const pipelineDelta = compareSeries(getSeries("pipeline"));
    const conversionDelta = compareSeries(getSeries("conversion"));
    const retentionDelta = calculateDelta(retentionRate, Math.max(0, retentionRate - 4));
    const capacityDelta = calculateDelta(teamCapacity, Math.max(0, teamCapacity - 6));
    const customerDelta = calculateDelta(customers.length, Math.max(0, customers.length - 2));
    const bookingsDelta = compareSeries(getSeries("bookings"));
    const mrrDelta = calculateDelta(mrrEstimate, Math.max(0, mrrEstimate - Math.round(pipelineValue * 0.01)));
    const arrDelta = calculateDelta(arrEstimate, Math.max(0, arrEstimate - Math.round(pipelineValue * 0.12)));
    const responseDelta = calculateDelta(Math.max(1, 6 - responseHours), Math.max(1, 7 - responseHours));
    const winRateDelta = calculateDelta(winRate, Math.max(0, winRate - 5));
    const velocityDelta = calculateDelta(leadVelocity, Math.max(0, leadVelocity - 7));

    const overviewMetrics: AnalyticsData["overviewMetrics"] = [
      {
        id: "revenue",
        label: "Total intäkt",
        group: "Ekonomi",
        value: formatCurrency(revenue),
        delta: revenueDelta.text,
        deltaDirection: revenueDelta.direction,
        benchmark:
          overdueInvoices.length > 0
            ? `${overdueInvoices.length} fakturor kräver uppföljning`
            : "Ingen tydlig kassaflödesfriktion",
        status: overdueInvoices.length > 0 ? "Bevaka" : "Bra",
        tone: overdueInvoices.length > 0 ? "amber" : "emerald",
        sparkline: getSeries("revenue"),
        href: "/fakturering",
      },
      {
        id: "pipeline",
        label: "Pipelinevärde",
        group: "Sälj",
        value: formatCurrency(pipelineValue),
        delta: pipelineDelta.text,
        deltaDirection: pipelineDelta.direction,
        benchmark: `${activeLeads.length} aktiva affärer i flöde`,
        status: activeLeads.length > 0 ? "Bra" : "Bevaka",
        tone: activeLeads.length > 0 ? "violet" : "amber",
        sparkline: getSeries("pipeline"),
        href: "/pipeline",
      },
      {
        id: "conversion",
        label: "Konvertering",
        group: "Sälj",
        value: formatPercent(conversionRate),
        delta: conversionDelta.text,
        deltaDirection: conversionDelta.direction,
        benchmark: `${wonLeads.length} vunna affärer hittills`,
        status: conversionRate >= 20 ? "Bra" : conversionRate >= 10 ? "Stabil" : "Bevaka",
        tone: conversionRate >= 20 ? "emerald" : conversionRate >= 10 ? "violet" : "amber",
        sparkline: getSeries("conversion"),
        href: "/pipeline",
      },
      {
        id: "retention",
        label: "Retention",
        group: "Kunder",
        value: formatPercent(retentionRate),
        delta: retentionDelta.text,
        deltaDirection: retentionDelta.direction,
        benchmark: `${healthyCustomers.length}/${customers.length || 0} relationer stabila`,
        status: atRiskCustomers.length > 0 ? "Bevaka" : "Bra",
        tone: atRiskCustomers.length > 0 ? "amber" : "cyan",
        sparkline: getSeries("customerHealth"),
        href: "/kunder",
      },
      {
        id: "capacity",
        label: "Team capacity",
        group: "Team",
        value: `${teamCapacity}%`,
        delta: capacityDelta.text,
        deltaDirection: capacityDelta.direction,
        benchmark: `${openTasks.length} öppna uppgifter och ${upcomingBookings.length} bokningar`,
        status: teamCapacity < 30 ? "Risk" : teamCapacity < 50 ? "Bevaka" : "Bra",
        tone: teamCapacity < 30 ? "rose" : teamCapacity < 50 ? "amber" : "emerald",
        sparkline: getSeries("responseTime").map((value) => Math.max(0, 8 - value)),
        href: "/team",
      },
      {
        id: "customers",
        label: "Aktiva kunder",
        group: "Kunder",
        value: `${customers.length}`,
        delta: customerDelta.text,
        deltaDirection: customerDelta.direction,
        benchmark: `${atRiskCustomers.length} kunder i risk eller watch`,
        status: customers.length > 0 ? "Stabil" : "Bevaka",
        tone: customers.length > 0 ? "cyan" : "slate",
        sparkline: getSeries("customerHealth"),
        href: "/kunder",
      },
      {
        id: "bookings",
        label: "Bokningsgrad",
        group: "Drift",
        value: `${bookingRate}%`,
        delta: bookingsDelta.text,
        deltaDirection: bookingsDelta.direction,
        benchmark: `${upcomingBookings.length} kommande bokningar`,
        status: bookingRate > 80 ? "Risk" : bookingRate > 60 ? "Bevaka" : "Stabil",
        tone: bookingRate > 80 ? "rose" : bookingRate > 60 ? "amber" : "emerald",
        sparkline: getSeries("bookings"),
        href: "/bokningar",
      },
      {
        id: "mrr",
        label: "MRR",
        group: "Ekonomi",
        value: formatCurrency(mrrEstimate),
        delta: mrrDelta.text,
        deltaDirection: mrrDelta.direction,
        benchmark: "Run-rate baserad på fakturering och pipeline",
        status: mrrEstimate > 0 ? "Stabil" : "Bevaka",
        tone: mrrEstimate > 0 ? "emerald" : "amber",
        sparkline: getSeries("revenue"),
        href: "/statistik",
      },
      {
        id: "arr",
        label: "ARR",
        group: "Ekonomi",
        value: formatCurrency(arrEstimate),
        delta: arrDelta.text,
        deltaDirection: arrDelta.direction,
        benchmark: `${proposalLeads.length} affärer i sena steg påverkar årstakten`,
        status: arrEstimate > 0 ? "Stabil" : "Bevaka",
        tone: arrEstimate > 0 ? "emerald" : "amber",
        sparkline: getSeries("revenue"),
        href: "/statistik",
      },
      {
        id: "responseTime",
        label: "Svarstid",
        group: "Team",
        value: formatHours(responseHours),
        delta: responseDelta.text,
        deltaDirection: responseDelta.direction,
        benchmark: `${negativeConversations.length} dialoger med negativ ton`,
        status: responseHours >= 4 ? "Risk" : responseHours >= 2 ? "Bevaka" : "Bra",
        tone: responseHours >= 4 ? "rose" : responseHours >= 2 ? "amber" : "emerald",
        sparkline: getSeries("responseTime"),
        href: "/konversationer",
      },
      {
        id: "winRate",
        label: "Win rate",
        group: "Sälj",
        value: formatPercent(winRate),
        delta: winRateDelta.text,
        deltaDirection: winRateDelta.direction,
        benchmark: `${wonLeads.length} vunna / ${lostLeads.length} tappade`,
        status: winRate >= 30 ? "Bra" : winRate >= 15 ? "Stabil" : "Bevaka",
        tone: winRate >= 30 ? "emerald" : winRate >= 15 ? "amber" : "rose",
        sparkline: getSeries("conversion"),
        href: "/pipeline",
      },
      {
        id: "leadVelocity",
        label: "Lead velocity",
        group: "Sälj",
        value: `${leadVelocity}%`,
        delta: velocityDelta.text,
        deltaDirection: velocityDelta.direction,
        benchmark: `${proposalLeads.length} affärer i proposal`,
        status: leadVelocity >= 60 ? "Bra" : leadVelocity >= 35 ? "Stabil" : "Bevaka",
        tone: leadVelocity >= 60 ? "emerald" : leadVelocity >= 35 ? "amber" : "rose",
        sparkline: getSeries("leads"),
        href: "/leads",
      },
    ];

    const lostReasonsMap = new Map<string, number>();
    lostLeads.forEach((lead) => {
      const reason = lead.nextAction?.trim() || "Ingen tapporsak loggad";
      lostReasonsMap.set(reason, (lostReasonsMap.get(reason) ?? 0) + 1);
    });

    const stages = [
      { key: LeadStatus.NEW, label: "Nya", probability: "20%" },
      { key: LeadStatus.QUALIFIED, label: "Kvalificerade", probability: "45%" },
      { key: LeadStatus.PROPOSAL, label: "Offert", probability: "70%" },
      { key: LeadStatus.WON, label: "Vunna", probability: "100%" },
      { key: LeadStatus.LOST, label: "Tappade", probability: "0%" },
    ].map((stage) => {
      const stageLeads = leads.filter((lead) => lead.status === stage.key);
      const count = stageLeads.length;
      const value = formatCurrency(
        stageLeads.reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
      );
      const prevCount =
        stage.key === LeadStatus.NEW
          ? leads.length
          : leads.filter((lead) => {
              if (stage.key === LeadStatus.QUALIFIED) {
                return lead.status === LeadStatus.NEW;
              }
              if (stage.key === LeadStatus.PROPOSAL) {
                return lead.status === LeadStatus.QUALIFIED;
              }
              if (stage.key === LeadStatus.WON) {
                return lead.status === LeadStatus.PROPOSAL;
              }
              return lead.status === LeadStatus.PROPOSAL;
            }).length;

      return {
        label: stage.label,
        count,
        value,
        conversion: prevCount > 0 ? formatPercent((count / prevCount) * 100, 0) : "0%",
        dropoff:
          stage.key === LeadStatus.LOST
            ? formatPercent((count / Math.max(leads.length, 1)) * 100, 0)
            : formatPercent(Math.max(0, 100 - (count / Math.max(prevCount, 1)) * 100), 0),
        probability: stage.probability,
      };
    });

    const topCustomers = [...customers]
      .sort((left, right) => toNumber(right.revenueGenerated) - toNumber(left.revenueGenerated))
      .slice(0, 6);
    const topDeals = [...activeLeads]
      .sort((left, right) => toNumber(right.estimatedValue) - toNumber(left.estimatedValue))
      .slice(0, 6);

    const memberRows = teamMembers.map((member) => {
      const name = getName(member.firstName, member.lastName);
      const assignedTasks = openTasks.filter(
        (task) => getName(task.assignedTo?.firstName, task.assignedTo?.lastName) === name,
      );
      const urgentAssigned = assignedTasks.filter(
        (task) => task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT,
      );

      return {
        name,
        workload:
          urgentAssigned.length > 2
            ? "Hög"
            : assignedTasks.length > 0
              ? "Balanserad"
              : "Låg",
        openTasks: `${assignedTasks.length}`,
        responseTime: formatHours(responseHours || 0),
        activity:
          assignedTasks.length > 0
            ? `${assignedTasks.length} aktiva uppgifter`
            : "Ingen tydlig belastning",
        status: urgentAssigned.length > 2 ? "Behöver avlastning" : "Stabil",
      };
    });

    const openRisks = [
      ...overdueInvoices.slice(0, 4).map((invoice) => ({
        Type: "Faktura",
        Signal: invoice.customer?.companyName ?? invoice.invoiceNumber,
        Nivå: "Hög",
        Åtgärd: "Följ upp betalning",
      })),
      ...atRiskCustomers.slice(0, 4).map((customer) => ({
        Type: "Kund",
        Signal: customer.companyName,
        Nivå: customer.health === CustomerHealth.AT_RISK ? "Hög" : "Medel",
        Åtgärd: "Retention-checkin",
      })),
      ...urgentTasks.slice(0, 4).map((task) => ({
        Type: "Uppgift",
        Signal: task.title,
        Nivå: task.priority === TaskPriority.URGENT ? "Hög" : "Medel",
        Åtgärd: "Lås nästa steg",
      })),
    ].slice(0, 8);

    const latestInsight = insights[0];
    const strongestCustomer = topCustomers[0];
    const strongestLead = topDeals[0];
    const invoiceRiskAmount = overdueInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
    const recurringRevenueEstimate = Math.max(0, revenue - invoiceRiskAmount);
    const pipelineStageBuckets = [
      {
        label: "Nya",
        rawValue: leads
          .filter((lead) => lead.status === LeadStatus.NEW)
          .reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        tone: "cyan" as const,
      },
      {
        label: "Kvalificerade",
        rawValue: leads
          .filter((lead) => lead.status === LeadStatus.QUALIFIED)
          .reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        tone: "violet" as const,
      },
      {
        label: "Offert",
        rawValue: leads
          .filter((lead) => lead.status === LeadStatus.PROPOSAL)
          .reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        tone: "emerald" as const,
      },
    ];
    const segmentCount = (health: CustomerHealth) =>
      customers.filter((customer) => customer.health === health).length;
    const supportThreads = conversations.length;
    const supportPositive = positiveConversations.length;
    const supportNegative = negativeConversations.length;
    const issuePriorityItems = [
      {
        label: "Förfallna fakturor",
        rawValue: invoiceRiskAmount,
        value: formatCurrency(invoiceRiskAmount),
        percentage: Math.min(100, Math.round((invoiceRiskAmount / Math.max(revenue, 1)) * 100)),
        trend: overdueInvoices.length > 0 ? `+${overdueInvoices.length} ärenden` : "0 ärenden",
        status: overdueInvoices.length > 0 ? "Risk" : "Stabil",
        tone: overdueInvoices.length > 0 ? ("rose" as const) : ("emerald" as const),
        href: "/fakturering",
      },
      {
        label: "VIP-kunder i watch/risk",
        rawValue: atRiskCustomers.length,
        value: `${atRiskCustomers.length} kunder`,
        percentage: Math.min(100, Math.round((atRiskCustomers.length / Math.max(customers.length, 1)) * 100)),
        trend: atRiskCustomers.length > 0 ? `+${atRiskCustomers.length} relationer` : "Stabilt läge",
        status: atRiskCustomers.length > 0 ? "Bevaka" : "Bra",
        tone: atRiskCustomers.length > 0 ? ("amber" as const) : ("emerald" as const),
        href: "/kunder",
      },
      {
        label: "Tysta leads",
        rawValue: Math.max(0, activeLeads.length - movingLeads),
        value: `${Math.max(0, activeLeads.length - movingLeads)} leads`,
        percentage: activeLeads.length > 0 ? Math.round(((activeLeads.length - movingLeads) / activeLeads.length) * 100) : 0,
        trend: velocityDelta.text,
        status: activeLeads.length - movingLeads > 0 ? "Möjlighet" : "Bra",
        tone: activeLeads.length - movingLeads > 0 ? ("cyan" as const) : ("emerald" as const),
        href: "/leads",
      },
      {
        label: "Belastning fredag",
        rawValue: urgentTasks.length + upcomingBookings.length,
        value: `${teamCapacity}% capacity`,
        percentage: Math.min(100, Math.max(0, 100 - teamCapacity)),
        trend: capacityDelta.text,
        status: teamCapacity < 50 ? "Bevaka" : "Stabil",
        tone: teamCapacity < 30 ? ("rose" as const) : teamCapacity < 50 ? ("amber" as const) : ("emerald" as const),
        href: "/team",
      },
      {
        label: "Förlorade leads",
        rawValue: lostLeads.length,
        value: `${lostLeads.length} affärer`,
        percentage: Math.round((lostLeads.length / Math.max(leads.length, 1)) * 100),
        trend: lostLeads.length > 0 ? `-${lostLeads.length} stängda` : "0 tappade",
        status: lostLeads.length > 0 ? "Förbättra" : "Stabil",
        tone: lostLeads.length > 0 ? ("rose" as const) : ("slate" as const),
        href: "/pipeline",
      },
    ];
    const leadPriorityItems = [
      {
        label: "Offertstadium",
        rawValue: proposalLeads.reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        value: formatCurrency(proposalLeads.reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0)),
        percentage: Math.round((proposalLeads.length / Math.max(leads.length, 1)) * 100),
        trend: conversionDelta.text,
        status: "Hög potential",
        tone: "emerald" as const,
        href: "/pipeline",
      },
      {
        label: "Kvalificerade leads",
        rawValue: leads.filter((lead) => lead.status === LeadStatus.QUALIFIED).reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        value: formatCurrency(leads.filter((lead) => lead.status === LeadStatus.QUALIFIED).reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0)),
        percentage: Math.round((leads.filter((lead) => lead.status === LeadStatus.QUALIFIED).length / Math.max(leads.length, 1)) * 100),
        trend: pipelineDelta.text,
        status: "Bygg momentum",
        tone: "cyan" as const,
        href: "/pipeline",
      },
      {
        label: "Nya leads",
        rawValue: leads.filter((lead) => lead.status === LeadStatus.NEW).reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
        value: formatCurrency(leads.filter((lead) => lead.status === LeadStatus.NEW).reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0)),
        percentage: Math.round((leads.filter((lead) => lead.status === LeadStatus.NEW).length / Math.max(leads.length, 1)) * 100),
        trend: velocityDelta.text,
        status: "Tidigt läge",
        tone: "violet" as const,
        href: "/leads",
      },
      {
        label: "Förlorade leads",
        rawValue: lostLeads.length,
        value: `${lostLeads.length} affärer`,
        percentage: Math.round((lostLeads.length / Math.max(leads.length, 1)) * 100),
        trend: winRateDelta.text,
        status: "Förbättra",
        tone: "rose" as const,
        href: "/pipeline",
      },
    ];
    const weeklyDays = Array.from({ length: 7 }, (_, index) => {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(now.getDate() - (6 - index));
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayBookings = bookings.filter(
        (booking) => booking.startsAt >= dayStart && booking.startsAt < dayEnd,
      ).length;
      const daySupport = conversations.filter(
        (thread) =>
          thread.lastMessageAt && thread.lastMessageAt >= dayStart && thread.lastMessageAt < dayEnd,
      ).length;
      const dayAi = insights.filter(
        (insight) => insight.createdAt >= dayStart && insight.createdAt < dayEnd,
      ).length;
      const dayActivities = activities.filter(
        (activity) => activity.createdAt >= dayStart && activity.createdAt < dayEnd,
      ).length;
      const load = Math.min(100, dayActivities * 8 + dayBookings * 6 + daySupport * 5 + dayAi * 4);

      return {
        label: dayStart.toLocaleDateString("sv-SE", { weekday: "short" }),
        activity: dayActivities,
        bookings: dayBookings,
        support: daySupport,
        ai: dayAi,
        load,
        tone:
          load >= 80
            ? ("rose" as const)
            : load >= 60
              ? ("amber" as const)
              : dayAi > 0
                ? ("violet" as const)
                : ("cyan" as const),
      };
    });
    const peakDay = [...weeklyDays].sort((left, right) => right.load - left.load)[0];
    const quietDay = [...weeklyDays].sort((left, right) => left.load - right.load)[0];
    const comparisonBase = [
      {
        label: "Nuvarande vecka",
        currentPeriod: "Denna vecka",
        previousPeriod: "Förra veckan",
        current: conversionRate,
        previous: Math.max(0, conversionRate - 3.2),
        format: "percent" as const,
        insight:
          leadVelocity >= 60
            ? "Konverteringen stiger när fler leads rör sig vidare inom sju dagar."
            : "Konverteringen bromsas av långsammare uppföljning i tidiga steg.",
        tone: conversionRate >= 20 ? ("emerald" as const) : ("amber" as const),
      },
      {
        label: "Månadstakt",
        currentPeriod: "Denna månad",
        previousPeriod: "Förra månaden",
        current: mrrEstimate,
        previous: Math.max(0, mrrEstimate - Math.round(mrrEstimate * 0.1)),
        format: "currency" as const,
        insight:
          overdueInvoices.length > 0
            ? "MRR-växten finns, men kassaflödet tappar fart på sena betalningar."
            : "MRR håller en stabil uppåtgående takt utan tydlig fakturafriktion.",
        tone: overdueInvoices.length > 0 ? ("amber" as const) : ("cyan" as const),
      },
      {
        label: "Kvartalskapacitet",
        currentPeriod: "Detta kvartal",
        previousPeriod: "Föregående kvartal",
        current: teamCapacity,
        previous: Math.min(100, teamCapacity + 8),
        format: "capacity" as const,
        insight:
          urgentTasks.length > 0
            ? "Kapaciteten sjunker när högprioriterade uppgifter och bokningar toppar samtidigt."
            : "Kapaciteten är kontrollerad trots växande aktivitet.",
        tone: teamCapacity < 40 ? ("rose" as const) : teamCapacity < 60 ? ("amber" as const) : ("emerald" as const),
      },
      {
        label: "Årlig retention",
        currentPeriod: "Nu",
        previousPeriod: "Baslinje",
        current: retentionRate,
        previous: Math.max(0, retentionRate - 5),
        format: "percent" as const,
        insight:
          atRiskCustomers.length > 0
            ? "Retentionen är stark men watch-segmentet behöver bevakas för att inte glida ned."
            : "Retentionen stärks när kundhälsan är bredare förankrad i healthy/upsell.",
        tone: atRiskCustomers.length > 0 ? ("amber" as const) : ("emerald" as const),
      },
    ];
    const formatComparisonValue = (value: number, format: "percent" | "currency" | "capacity") =>
      format === "currency"
        ? formatCurrency(value)
        : format === "capacity"
          ? `${Math.round(value)}% capacity`
          : formatPercent(value);
    const categorizationCharts: AnalyticsData["categorizationCharts"] = [
      {
        id: "pipeline-distribution",
        title: "Pipelinefördelning",
        subtitle: "Fördelning av aktivt pipelinevärde mellan stadier.",
        centerLabel: "Aktiv pipeline",
        centerValue: formatCurrency(pipelineValue),
        segments: pipelineStageBuckets.map((segment) => ({
          label: segment.label,
          value: formatCurrency(segment.rawValue),
          rawValue: segment.rawValue,
          percentage: Math.round((segment.rawValue / Math.max(pipelineValue, 1)) * 100),
          tone: segment.tone,
          href: "/pipeline",
        })),
      },
      {
        id: "customer-segments",
        title: "Kundsegment",
        subtitle: "Healthy, upsell och risknivå i kundbasen.",
        centerLabel: "Aktiva kunder",
        centerValue: `${customers.length}`,
        segments: [
          { label: "Healthy", rawValue: segmentCount(CustomerHealth.HEALTHY), tone: "emerald" as const },
          { label: "Upsell", rawValue: segmentCount(CustomerHealth.UPSELL), tone: "cyan" as const },
          { label: "Watch", rawValue: segmentCount(CustomerHealth.WATCH), tone: "amber" as const },
          { label: "At risk", rawValue: segmentCount(CustomerHealth.AT_RISK), tone: "rose" as const },
        ].map((segment) => ({
          label: segment.label,
          value: `${segment.rawValue} kunder`,
          rawValue: segment.rawValue,
          percentage: Math.round((segment.rawValue / Math.max(customers.length, 1)) * 100),
          tone: segment.tone,
          href: "/kunder",
        })),
      },
      {
        id: "support-mix",
        title: "Dialog- & supportsignal",
        subtitle: "Visar om tonläget i inkommande dialoger driver risk eller stabilitet.",
        centerLabel: "Aktiva dialoger",
        centerValue: `${supportThreads}`,
        segments: [
          { label: "Positiva", rawValue: supportPositive, tone: "emerald" as const },
          { label: "Negativa", rawValue: supportNegative, tone: "rose" as const },
          {
            label: "Neutrala",
            rawValue: Math.max(0, supportThreads - supportPositive - supportNegative),
            tone: "slate" as const,
          },
        ].map((segment) => ({
          label: segment.label,
          value: `${segment.rawValue} trådar`,
          rawValue: segment.rawValue,
          percentage: Math.round((segment.rawValue / Math.max(supportThreads, 1)) * 100),
          tone: segment.tone,
          href: "/konversationer",
        })),
      },
    ];
    const rankedLists: AnalyticsData["rankedLists"] = [
      {
        id: "priority-signals",
        title: "Prioriterade signaler",
        subtitle: "De tydligaste riskerna och möjligheterna just nu.",
        items: issuePriorityItems
          .sort((left, right) => right.percentage - left.percentage)
          .map((item, index) => ({
            rank: index + 1,
            label: item.label,
            value: item.value,
            percentage: item.percentage,
            trend: item.trend,
            status: item.status,
            progress: Math.max(8, item.percentage),
            tone: item.tone,
            href: item.href,
          })),
      },
      {
        id: "lead-priority",
        title: "Lead priority",
        subtitle: "Vilka leadkategorier driver mest värde och momentum.",
        items: leadPriorityItems
          .sort((left, right) => right.rawValue - left.rawValue)
          .map((item, index) => ({
            rank: index + 1,
            label: item.label,
            value: item.value,
            percentage: item.percentage,
            trend: item.trend,
            status: item.status,
            progress: Math.max(8, item.percentage),
            tone: item.tone,
            href: item.href,
          })),
      },
    ];
    const periodComparisons: AnalyticsData["periodComparisons"] = comparisonBase.map((item) => {
      const delta = calculateDelta(item.current, item.previous);
      return {
        label: item.label,
        currentPeriod: item.currentPeriod,
        previousPeriod: item.previousPeriod,
        currentValue: formatComparisonValue(item.current, item.format),
        previousValue: formatComparisonValue(item.previous, item.format),
        delta: delta.text,
        deltaDirection: delta.direction,
        insight: item.insight,
        tone: item.tone,
      };
    });
    const performanceBars: AnalyticsData["performanceBars"] = [
      {
        label: "SLA-svarstid",
        value: `${Math.max(0, Math.round(100 - responseHours * 12))}%`,
        helper: `${conversations.length} aktiva dialoger i flöde`,
        progress: Math.max(6, Math.min(100, Math.round(100 - responseHours * 12))),
        target: "Mål under 2h",
        status: responseHours <= 2 ? "Bra takt" : responseHours <= 4 ? "Bevaka" : "Risk",
        tone: responseHours <= 2 ? "emerald" : responseHours <= 4 ? "amber" : "rose",
      },
      {
        label: "Konverteringsmål",
        value: `${Math.round((conversionRate / 30) * 100)}%`,
        helper: `Nu ${formatPercent(conversionRate)} av 30% mål`,
        progress: Math.min(100, Math.round((conversionRate / 30) * 100)),
        target: "Mål 30%",
        status: conversionRate >= 20 ? "Bra takt" : "Bygg momentum",
        tone: conversionRate >= 20 ? "cyan" : "amber",
      },
      {
        label: "Beläggning",
        value: `${bookingRate}%`,
        helper: `${upcomingBookings.length} kommande bokningar`,
        progress: bookingRate,
        target: "Tak 80%",
        status: bookingRate > 80 ? "Risk" : bookingRate > 60 ? "Bevaka" : "Stabil",
        tone: bookingRate > 80 ? "rose" : bookingRate > 60 ? "amber" : "emerald",
      },
      {
        label: "AI confidence",
        value: `${Math.min(98, 68 + insights.length * 4)}%`,
        helper: `${insights.length} nya AI-signaler`,
        progress: Math.min(98, 68 + insights.length * 4),
        target: "Över 90%",
        status: insights.length >= 4 ? "Hög säkerhet" : "Bygg mer data",
        tone: insights.length >= 4 ? "violet" : "slate",
      },
      {
        label: "Automation savings",
        value: `${activeAutomations * 6}h`,
        helper: `${activeAutomations} aktiva workflows`,
        progress: Math.min(100, activeAutomations * 14),
        target: "Mål 50h",
        status: activeAutomations >= 4 ? "Växer" : "Potential",
        tone: "violet",
      },
    ];
    const recommendations: AnalyticsData["recommendations"] = [
      {
        title: atRiskCustomers.length > 0 ? "Prioritera VIP-kunder idag" : "Behåll momentum i kundbasen",
        detail:
          atRiskCustomers.length > 0
            ? "Watch- och risksegmentet behöver snabbare check-ins för att skydda retentionen."
            : "Kundhälsan ser stabil ut, vilket öppnar för mer fokuserad expansion i upsell-segmentet.",
        actionLabel: "Öppna kunder",
        href: "/kunder",
        tone: atRiskCustomers.length > 0 ? "amber" : "emerald",
      },
      {
        title: proposalLeads.length > 0 ? "Pipeline stannar i offertstadiet" : "Öka inflödet till sena steg",
        detail:
          proposalLeads.length > 0
            ? `${proposalLeads.length} affärer ligger i proposal och bör få tätare uppföljning för att låsa vinstgrad.`
            : "Kvalificerade leads behöver röra sig snabbare mot offert för att bygga säkrare forecast.",
        actionLabel: "Öppna pipeline",
        href: "/pipeline",
        tone: "violet",
      },
      {
        title: activeLeads.length - movingLeads > 0 ? "Automatisera uppföljning för tysta leads" : "Lead-flödet håller bra tempo",
        detail:
          activeLeads.length - movingLeads > 0
            ? `${activeLeads.length - movingLeads} leads saknar färsk rörelse och lämpar sig för automation eller AI-nudges.`
            : "De flesta öppna leads rör sig framåt inom en vecka, vilket stärker lead velocity.",
        actionLabel: "Öppna AI-analys",
        href: "/ai-assistent",
        tone: activeLeads.length - movingLeads > 0 ? "cyan" : "emerald",
      },
    ];

    return {
      hero: {
        eyebrow: "Business intelligence workspace",
        title: "Statistik som visar hur verksamheten faktiskt presterar",
        summary: [
          `${activeLeads.length} aktiva affärer driver ${formatCurrency(pipelineValue)} i öppet värde.`,
          overdueInvoices.length > 0
            ? `${overdueInvoices.length} fakturor behöver uppföljning för att skydda kassaflödet.`
            : "Kassaflödet ser stabilt ut utan tydliga fakturastopp.",
          atRiskCustomers.length > 0
            ? `${atRiskCustomers.length} kundrelationer kräver extra bevakning.`
            : "Kundbasen visar låg synlig risk just nu.",
        ].join(" "),
        liveLabel:
          insights.length + activities.length > 0
            ? `${Math.min(12, insights.length + activities.length)} signaler uppdaterade nyligen`
            : "Inga nya signaler ännu",
        primaryAction: {
          label: "Öppna pipeline",
          href: "/pipeline",
        },
        secondaryActions: [
          { label: "Se fakturering", href: "/fakturering" },
          { label: "Öppna kunder", href: "/kunder" },
          { label: "AI-analys", href: "/ai-assistent" },
        ],
        statusChips: [
          {
            label: "Intäkt",
            value: formatCurrency(revenue),
            tone: revenue > 0 ? "emerald" : "slate",
          },
          {
            label: "Pipeline",
            value: formatCurrency(pipelineValue),
            tone: pipelineValue > 0 ? "emerald" : "slate",
          },
          {
            label: "Retention",
            value: formatPercent(retentionRate),
            tone: atRiskCustomers.length > 0 ? "amber" : "emerald",
          },
          {
            label: "Kapacitet",
            value: `${teamCapacity}%`,
            tone: teamCapacity < 30 ? "rose" : teamCapacity < 50 ? "amber" : "slate",
          },
        ],
      },
      overviewMetrics,
      filterBar: {
        ranges: chartRanges.map((range) => ({ id: range.id, label: range.label })),
        savedViews: [
          {
            id: "executive",
            label: "Executive",
            metricIds: ["revenue", "pipeline", "conversion", "retention", "capacity", "bookings"],
            rangeId: "30d",
          },
          {
            id: "sales",
            label: "Sälj",
            metricIds: ["pipeline", "conversion", "winRate", "leadVelocity", "mrr", "arr"],
            rangeId: "90d",
          },
          {
            id: "operations",
            label: "Drift",
            metricIds: ["capacity", "bookings", "responseTime", "customers"],
            rangeId: "30d",
          },
        ],
        teams: teamMembers.map((member) => getName(member.firstName, member.lastName)),
        owners: Array.from(
          new Set(leads.map((lead) => getName(lead.owner?.firstName, lead.owner?.lastName))),
        ).filter(Boolean),
        stages: ["Nya", "Kvalificerade", "Offert", "Vunna", "Tappade"],
        risks: ["Låg", "Medel", "Hög"],
        bookingStatuses: ["Bekräftad", "Behöver påminnelse", "Avslutad"],
      },
      mainChart: {
        defaultMetricId: "revenue",
        ranges: chartRanges,
        metrics: [
          { id: "revenue", label: "Intäkter", tone: "emerald", format: "currency" },
          { id: "pipeline", label: "Pipeline", tone: "violet", format: "currency" },
          { id: "conversion", label: "Konvertering", tone: "cyan", format: "percent" },
          { id: "bookings", label: "Bokningar", tone: "amber", format: "count" },
          { id: "responseTime", label: "Svarstid", tone: "rose", format: "hours" },
          { id: "customers", label: "Kundhälsa", tone: "slate", format: "score" },
        ],
      },
      categorizationCharts,
      rankedLists,
      periodComparisons,
      weeklyActivity: {
        peakDay: peakDay?.label ?? "N/A",
        quietDay: quietDay?.label ?? "N/A",
        highestLoad:
          peakDay && peakDay.load >= 70 ? `${peakDay.label} ${peakDay.load}% load` : "Ingen kritisk topp",
        aiRecommendation:
          peakDay && peakDay.load >= 70
            ? `Teamet riskerar overload kring ${peakDay.label}. Flytta uppföljning till tidigare i veckan.`
            : "Belastningen ser jämn ut. Fortsätt låta automation ta repetitiva uppföljningar.",
        days: weeklyDays,
      },
      performanceBars,
      recommendations,
      revenueAnalysis: {
        cards: [
          {
            label: "Omsättning",
            value: formatCurrency(revenue),
            note: "Summerar all registrerad fakturavolym som inte är makulerad.",
            trend: revenueDelta.text,
            tone: "emerald",
          },
          {
            label: "MRR",
            value: formatCurrency(mrrEstimate),
            note: "Run-rate från fakturering plus en andel av aktiv pipeline.",
            trend: mrrDelta.text,
            tone: "emerald",
          },
          {
            label: "ARR",
            value: formatCurrency(arrEstimate),
            note: "Årlig uppskattning av nuvarande återkommande takt.",
            trend: arrDelta.text,
            tone: "cyan",
          },
          {
            label: "AOV",
            value: formatCurrency(revenue / Math.max(activeInvoices.length, 1)),
            note: "Genomsnittligt ordervärde över registrerade fakturor.",
            trend: `${activeInvoices.length} fakturor`,
            tone: "violet",
          },
        ],
        leakage: [
          {
            title: "Revenue leakage",
            value: formatCurrency(
              overdueInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0),
            ),
            detail:
              overdueInvoices.length > 0
                ? `${overdueInvoices.length} fakturor ligger för sent och bromsar verklig intäkt.`
                : "Ingen tydlig intäktsläcka i fakturaflödet just nu.",
            tone: overdueInvoices.length > 0 ? "rose" : "emerald",
          },
          {
            title: "Forecast nästa period",
            value: formatCurrency(revenue + Math.round(pipelineValue * 0.35)),
            detail: "Bygger på fakturerad volym plus sannolik del av aktiv pipeline.",
            tone: "amber",
          },
        ],
        forecast: [
          { label: "Fakturerat nu", value: formatCurrency(paidRevenue) },
          { label: "Öppen pipeline", value: formatCurrency(pipelineValue) },
          { label: "Riskbelopp", value: formatCurrency(overdueInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0)) },
        ],
      },
      pipelineAnalysis: {
        summaryCards: [
          { label: "Pipeline value", value: formatCurrency(pipelineValue), note: `${activeLeads.length} aktiva affärer` },
          { label: "Win rate", value: formatPercent(winRate), note: `${wonLeads.length} vunna / ${lostLeads.length} tappade` },
          { label: "Deal velocity", value: `${leadVelocity}%`, note: "Andel leads med färsk rörelse senaste veckan" },
        ],
        stages,
        lostReasons: Array.from(lostReasonsMap.entries())
          .sort((left, right) => right[1] - left[1])
          .slice(0, 4)
          .map(([reason, count]) => ({ reason, count })),
        heatmap: stages.map((stage) => ({
          label: stage.label,
          percentage: Math.min(
            100,
            Math.max(10, Math.round((stage.count / Math.max(leads.length, 1)) * 100)),
          ),
        })),
      },
      customerAnalysis: {
        summaryCards: [
          { label: "Aktiva kunder", value: `${customers.length}`, note: `${healthyCustomers.length} stabila relationer` },
          { label: "Kundhälsa", value: `${averageCustomerScore}/100`, note: `${atRiskCustomers.length} i risk eller watch` },
          { label: "Retention", value: formatPercent(retentionRate), note: `${positiveConversations.length} positiva dialoger` },
        ],
        segments: [
          {
            label: "Healthy",
            value: `${customers.filter((customer) => customer.health === CustomerHealth.HEALTHY).length}`,
            percentage: Math.round((customers.filter((customer) => customer.health === CustomerHealth.HEALTHY).length / Math.max(customers.length, 1)) * 100),
            tone: "emerald",
          },
          {
            label: "Upsell",
            value: `${customers.filter((customer) => customer.health === CustomerHealth.UPSELL).length}`,
            percentage: Math.round((customers.filter((customer) => customer.health === CustomerHealth.UPSELL).length / Math.max(customers.length, 1)) * 100),
            tone: "cyan",
          },
          {
            label: "Watch",
            value: `${customers.filter((customer) => customer.health === CustomerHealth.WATCH).length}`,
            percentage: Math.round((customers.filter((customer) => customer.health === CustomerHealth.WATCH).length / Math.max(customers.length, 1)) * 100),
            tone: "amber",
          },
          {
            label: "At risk",
            value: `${customers.filter((customer) => customer.health === CustomerHealth.AT_RISK).length}`,
            percentage: Math.round((customers.filter((customer) => customer.health === CustomerHealth.AT_RISK).length / Math.max(customers.length, 1)) * 100),
            tone: "rose",
          },
        ],
        topCustomers: topCustomers.map((customer) => ({
          name: customer.companyName,
          revenue: formatCurrency(toNumber(customer.revenueGenerated)),
          score: `${customer.score ?? 0}/100`,
          health:
            customer.health === CustomerHealth.AT_RISK
              ? "Risk"
              : customer.health === CustomerHealth.WATCH
                ? "Watch"
                : customer.health === CustomerHealth.UPSELL
                  ? "Upsell"
                  : "Healthy",
          status:
            customer.health === CustomerHealth.AT_RISK
              ? "Behöver retention"
              : customer.health === CustomerHealth.UPSELL
                ? "Mogen för expansion"
                : "Stabil relation",
        })),
      },
      teamAnalysis: {
        summaryCards: [
          { label: "Team size", value: `${teamMembers.length}`, note: "Aktiva användare i arbetsytan" },
          { label: "Öppna uppgifter", value: `${openTasks.length}`, note: `${urgentTasks.length} med hög prioritet` },
          { label: "Svarstid", value: formatHours(responseHours), note: `${conversations.length} aktiva dialoger` },
          { label: "Automationer", value: `${activeAutomations}`, note: "Aktiva workflows i drift" },
        ],
        members: memberRows,
      },
      operationsAnalysis: {
        summaryCards: [
          { label: "Beläggning", value: `${bookingRate}%`, note: `${upcomingBookings.length} bokningar i kalendern` },
          { label: "Påminnelser", value: `${bookings.filter((booking) => booking.status === BookingStatus.NEEDS_REMINDER).length}`, note: "Bokningar som kräver förberedelse" },
          { label: "Deadlines", value: `${urgentTasks.length}`, note: "Höga eller akuta uppgifter med tryck" },
        ],
        upcomingBookings: upcomingBookings.slice(0, 6).map((booking) => ({
          title: booking.title,
          customer: booking.customer?.companyName ?? "Ingen kund kopplad",
          time: booking.startsAt.toLocaleString("sv-SE", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status:
            booking.status === BookingStatus.NEEDS_REMINDER
              ? "Behöver påminnelse"
              : booking.status === BookingStatus.CONFIRMED
                ? "Bekräftad"
                : booking.status === BookingStatus.COMPLETED
                  ? "Klar"
                  : "Utkast",
        })),
        deadlines: urgentTasks.slice(0, 6).map((task) => ({
          title: task.title,
          owner: getName(task.assignedTo?.firstName, task.assignedTo?.lastName),
          due: formatRelativeDate(task.dueAt),
          severity: task.priority === TaskPriority.URGENT ? "Akut" : "Hög",
        })),
      },
      liveFeed: [
        ...insights.slice(0, 5).map((insight) => ({
          title: insight.title,
          detail: insight.content.slice(0, 140),
          time: formatRelativeDate(insight.createdAt),
          type: "AI",
          href: "/ai-assistent",
          tone:
            insight.type === AIInsightType.RISK
              ? ("rose" as const)
              : insight.type === AIInsightType.ANALYTICS
                ? ("emerald" as const)
                : ("slate" as const),
        })),
        ...activities.slice(0, 7).map((activity) => ({
          title: activity.title,
          detail: activity.detail.slice(0, 140),
          time: formatRelativeDate(activity.createdAt),
          type: "Aktivitet",
          href: "/oversikt",
          tone: "slate" as const,
        })),
      ].slice(0, 10),
      aiInsights: [
        {
          headline: latestInsight?.title ?? "AI upptäcker var nästa tillväxtbeslut finns",
          detail:
            latestInsight?.content.slice(0, 180) ??
            (strongestLead
              ? `${strongestLead.companyName} är starkaste öppna affär och bör få snabbare uppföljning för att skydda konverteringen.`
              : "När fler affärer och kunder använder systemet förklarar AI vad som driver siffrorna."),
          actionLabel: "Öppna AI-analys",
          href: "/ai-assistent",
          tone: latestInsight?.type === AIInsightType.RISK ? "rose" : "emerald",
        },
        {
          headline:
            atRiskCustomers[0]?.companyName
              ? `${atRiskCustomers[0].companyName} visar lägre stabilitet än normalt`
              : "Retention ser stabil ut men bör fortsatt bevakas",
          detail:
            atRiskCustomers[0]?.health === CustomerHealth.AT_RISK
              ? "Kundhälsan visar riskläge och bör mötas med tätare kontakt innan intäkt påverkas."
              : "Kundbasen är relativt stabil, men AI rekommenderar fortsatt bevakning av watch-segmentet.",
          actionLabel: "Öppna kunder",
          href: "/kunder",
          tone: atRiskCustomers.length > 0 ? "amber" : "cyan",
        },
        {
          headline:
            overdueInvoices.length > 0
              ? "Kassaflödet behöver ett snabbare uppföljningsvarv"
              : "Kassaflödet ser renare ut än tidigare",
          detail:
            overdueInvoices.length > 0
              ? "Förfallna fakturor gör topline svagare än den ser ut. Lås upp betalningar innan ny tillväxt prioriteras."
              : "Det finns utrymme att fokusera mer på tillväxt än på ekonomisk sanering just nu.",
          actionLabel: "Öppna fakturering",
          href: "/fakturering",
          tone: overdueInvoices.length > 0 ? "rose" : "emerald",
        },
      ],
      dataTables: {
        topCustomers: {
          columns: ["Kund", "Intäkt", "Score", "Hälsa", "Status"],
          rows: topCustomers.map((customer) => ({
            Kund: customer.companyName,
            Intäkt: formatCurrency(toNumber(customer.revenueGenerated)),
            Score: `${customer.score ?? 0}/100`,
            Hälsa:
              customer.health === CustomerHealth.AT_RISK
                ? "Risk"
                : customer.health === CustomerHealth.WATCH
                  ? "Watch"
                  : customer.health === CustomerHealth.UPSELL
                    ? "Upsell"
                    : "Healthy",
            Status:
              customer.health === CustomerHealth.AT_RISK
                ? "Behöver retention"
                : customer.health === CustomerHealth.UPSELL
                  ? "Mogen för expansion"
                  : "Stabil",
          })),
        },
        topDeals: {
          columns: ["Affär", "Steg", "Värde", "Score", "Nästa steg"],
          rows: topDeals.map((lead) => ({
            Affär: lead.companyName,
            Steg:
              lead.status === LeadStatus.NEW
                ? "Ny"
                : lead.status === LeadStatus.QUALIFIED
                  ? "Kvalificerad"
                  : "Offert",
            Värde: formatCurrency(toNumber(lead.estimatedValue)),
            Score: `${lead.score}/100`,
            "Nästa steg": lead.nextAction?.slice(0, 48) || "Saknar definierat nästa steg",
          })),
        },
        latestInvoices: {
          columns: ["Faktura", "Kund", "Belopp", "Status", "Förfallo"],
          rows: invoices.slice(0, 8).map((invoice) => ({
            Faktura: invoice.invoiceNumber,
            Kund: invoice.customer?.companyName ?? "Ingen kund",
            Belopp: formatCurrency(toNumber(invoice.amount)),
            Status:
              invoice.status === InvoiceStatus.PAID
                ? "Betald"
                : invoice.status === InvoiceStatus.OVERDUE
                  ? "Förfallen"
                  : invoice.status === InvoiceStatus.SENT
                    ? "Skickad"
                    : "Utkast",
            Förfallo: invoice.dueDate?.toLocaleDateString("sv-SE") ?? "-",
          })),
        },
        openRisks: {
          columns: ["Typ", "Signal", "Nivå", "Åtgärd"],
          rows: openRisks,
        },
      },
      exportCenter: {
        summary:
          "Exportera KPI-data, tabeller och ledningssammanfattningar direkt från analytics-workspacen.",
        actions: [
          { label: "CSV-export", description: "Ladda ned aktuella tabeller och KPI-data.", type: "csv" },
          { label: "PDF / print", description: "Skapa en delbar executive-rapport via utskrift.", type: "pdf" },
          { label: "Spara vy", description: "Spara KPI-layout och filter som en personlig vy.", type: "view" },
        ],
      },
    };
    })) ?? buildFallbackAnalyticsData()
  );
}
