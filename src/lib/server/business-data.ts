import {
  AIInsightType,
  AutomationStatus,
  BookingStatus,
  ConversationChannel,
  ConversationSentiment,
  CustomerHealth,
  InvoiceStatus,
  LeadStatus,
  Prisma,
  QuoteStatus,
  TaskPriority,
  TaskStatus,
  WorkspaceRole,
} from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";

import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/server/workspace";

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

async function getWorkspaceContext() {
  noStore();

  const prisma = getPrisma();

  if (!prisma) {
    return null;
  }

  const workspace = await getPrimaryWorkspace(prisma);

  if (!workspace) {
    return null;
  }

  return { prisma, workspace };
}

type WorkspaceContext = NonNullable<Awaited<ReturnType<typeof getWorkspaceContext>>>;

function isDynamicServerUsageError(error: unknown) {
  const errorWithDigest = error as { digest?: unknown };

  return (
    error instanceof Error &&
    ("digest" in error || error.message.includes("Dynamic server usage")) &&
    ((typeof errorWithDigest.digest === "string" &&
      errorWithDigest.digest === "DYNAMIC_SERVER_USAGE") ||
      error.message.includes("Dynamic server usage"))
  );
}

async function withWorkspaceContext<T>(
  loader: (context: WorkspaceContext) => Promise<T>,
): Promise<T | null> {
  try {
    const context = await getWorkspaceContext();

    if (!context) {
      return null;
    }

    return await loader(context);
  } catch (error) {
    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    console.error("Kunde inte läsa affärsdata från databasen.", error);
    return null;
  }
}

export type OverviewData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    liveLabel: string;
    focus: {
      label: string;
      value: string;
      note: string;
    };
    opportunity: {
      label: string;
      value: string;
      note: string;
    };
    risk: {
      label: string;
      value: string;
      note: string;
    };
    teamStatus: {
      label: string;
      value: string;
      note: string;
    };
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
  kpiLayer: Array<{
    group: "Intäkt" | "Sälj" | "Kunder" | "Team" | "Drift";
    label: string;
    value: string;
    trend: string;
    momentum: string;
    comparison: string;
    benchmark: string;
    reason: string;
    action: string;
    href: string;
    riskLevel: string;
    tone: "emerald" | "cyan" | "violet" | "amber" | "rose" | "slate";
  }>;
  priorityEngine: {
    headline: string;
    summary: string;
    items: Array<{
      title: string;
      detail: string;
      meta: string;
      impact: string;
      href: string;
      cta: string;
      tone: "rose" | "amber" | "emerald" | "slate";
    }>;
  };
  liveOperations: {
    headline: string;
    summary: string;
    items: Array<{
      title: string;
      detail: string;
      time: string;
      type: string;
      href: string;
      cta: string;
      tone: "emerald" | "amber" | "rose" | "slate" | "violet";
    }>;
  };
  revenueEngine: {
    headline: string;
    summary: string;
    strongestStage: string;
    totalValue: string;
    href: string;
    stages: Array<{
      label: string;
      count: number;
      value: string;
      percentage: number;
    }>;
  };
  teamPulse: {
    headline: string;
    summary: string;
    memberCount: string;
    activeConversationCount: string;
    memberInitials: string[];
    workloadLabel: string;
    note: string;
    items: Array<{
      label: string;
      value: string;
      note: string;
    }>;
  };
  customerRadar: {
    headline: string;
    summary: string;
    items: Array<{
      name: string;
      score: number;
      revenue: string;
      state: string;
      note: string;
      href: string;
      tone: "emerald" | "amber" | "rose";
    }>;
  };
  operationsDeck: {
    headline: string;
    summary: string;
    items: Array<{
      title: string;
      status: string;
      detail: string;
      meta: string;
      href: string;
      cta: string;
      tone: "emerald" | "amber" | "rose" | "slate";
    }>;
  };
  aiCommand: {
    headline: string;
    summary: string;
    command: string;
    focusPoints: string[];
    recommendations: Array<{
      title: string;
      detail: string;
      href: string;
      cta: string;
    }>;
    actions: Array<{
      label: string;
      href: string;
    }>;
  };
};

export async function getOverviewData(): Promise<OverviewData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(now.getDate() - 3);

    const [
      paidInvoices,
      activeLeadsCount,
      weeklyBookingsCount,
      pipelineGroups,
      customerLeaders,
      openTasks,
      bookings,
      activities,
      aiRecommendations,
      conversionStats,
      retentionCounts,
      teamMembers,
      activeConversationCount,
      staleLeads,
      overdueInvoices,
      riskCustomers,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          workspaceId: workspace.id,
          status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] },
        },
        _sum: { amount: true },
      }),
      prisma.lead.count({
        where: {
          workspaceId: workspace.id,
          status: { in: [LeadStatus.NEW, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL] },
        },
      }),
      prisma.booking.count({
        where: {
          workspaceId: workspace.id,
          startsAt: {
            gte: now,
            lte: nextWeek,
          },
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.NEEDS_REMINDER,
              BookingStatus.DRAFT,
            ],
          },
        },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        where: { workspaceId: workspace.id },
        _count: { _all: true },
        _sum: { estimatedValue: true },
      }),
      prisma.customer.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ score: "desc" }, { revenueGenerated: "desc" }],
        take: 3,
      }),
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        },
        include: {
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
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
        },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
        take: 5,
      }),
      prisma.booking.findMany({
        where: {
          workspaceId: workspace.id,
          startsAt: {
            gte: now,
          },
        },
        include: {
          customer: true,
          assignedTo: true,
        },
        orderBy: { startsAt: "asc" },
        take: 4,
      }),
      prisma.activityLog.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.aIInsight.findMany({
        where: {
          workspaceId: workspace.id,
          type: {
            in: [
              AIInsightType.RISK,
              AIInsightType.UPSELL,
              AIInsightType.AUTOMATION,
              AIInsightType.NEXT_ACTION,
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.lead.aggregate({
        where: { workspaceId: workspace.id },
        _count: {
          id: true,
        },
      }),
      prisma.customer.groupBy({
        by: ["health"],
        where: { workspaceId: workspace.id },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        take: 4,
        select: {
          firstName: true,
          lastName: true,
        },
      }),
      prisma.conversationThread.count({
        where: { workspaceId: workspace.id },
      }),
      prisma.lead.findMany({
        where: {
          workspaceId: workspace.id,
          status: {
            in: [LeadStatus.NEW, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL],
          },
          OR: [{ lastContactAt: null }, { lastContactAt: { lt: threeDaysAgo } }],
        },
        orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
        take: 3,
        select: {
          id: true,
          companyName: true,
          status: true,
          score: true,
          nextAction: true,
          lastContactAt: true,
          estimatedValue: true,
        },
      }),
      prisma.invoice.findMany({
        where: {
          workspaceId: workspace.id,
          status: {
            in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE],
          },
          dueDate: {
            lt: now,
          },
        },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        take: 3,
      }),
      prisma.customer.findMany({
        where: {
          workspaceId: workspace.id,
          health: {
            in: [CustomerHealth.WATCH, CustomerHealth.AT_RISK],
          },
        },
        orderBy: [{ updatedAt: "desc" }, { score: "asc" }],
        take: 3,
      }),
    ]);

    const revenue = toNumber(paidInvoices._sum.amount);
    const activePipelineValue = pipelineGroups.reduce(
      (sum, item) => sum + toNumber(item._sum.estimatedValue),
      0,
    );
    // Approximate recurring run-rate from current invoiced revenue plus a modest share of active pipeline.
    const recurringRunRateBase = revenue + Math.round(activePipelineValue * 0.2);
    const monthlyRecurringEstimate = Math.round(recurringRunRateBase / 12);
    const yearlyRecurringEstimate = monthlyRecurringEstimate * 12;
    const annualRecurringEstimate = Math.round(revenue + monthlyRecurringEstimate * 12 * 0.35);
    const retentionStableCount = retentionCounts
      .filter(
        (item) =>
          item.health === CustomerHealth.HEALTHY ||
          item.health === CustomerHealth.UPSELL,
      )
      .reduce((sum, item) => sum + item._count._all, 0);
    const retentionRate = customerLeaders.length
      ? Math.round((retentionStableCount / Math.max(retentionCounts.reduce((sum, item) => sum + item._count._all, 0), 1)) * 100)
      : 0;
    const trackedCustomerCount = Math.max(
      retentionCounts.reduce((sum, item) => sum + item._count._all, 0),
      1,
    );
    const conversionRate = pipelineGroups.length
      ? Math.round(
          ((pipelineGroups.find((group) => group.status === LeadStatus.WON)?._count._all ?? 0) /
            Math.max(conversionStats._count.id, 1)) *
            1000,
        ) / 10
      : 0;
    const wonCount = pipelineGroups.find((group) => group.status === LeadStatus.WON)?._count._all ?? 0;
    const lostCount = pipelineGroups.find((group) => group.status === LeadStatus.LOST)?._count._all ?? 0;
    const proposalCount =
      pipelineGroups.find((group) => group.status === LeadStatus.PROPOSAL)?._count._all ?? 0;
    const closedDealCount = wonCount + lostCount;
    const winRate = closedDealCount > 0 ? Math.round((wonCount / closedDealCount) * 1000) / 10 : 0;

    const statusMap: Record<LeadStatus, string> = {
      NEW: "Nya",
      QUALIFIED: "Kvalificerade",
      PROPOSAL: "Offert",
      WON: "Vunna",
      LOST: "Förlorade",
    };

    const healthMap: Record<CustomerHealth, string> = {
      HEALTHY: "Stabil",
      WATCH: "Bevaka",
      AT_RISK: "Risk",
      UPSELL: "Upsell",
    };

    const bookingStatusMap: Record<BookingStatus, string> = {
      DRAFT: "Utkast",
      CONFIRMED: "Bekräftad",
      NEEDS_REMINDER: "Behöver påminnelse",
      COMPLETED: "Slutförd",
      CANCELLED: "Avbokad",
    };

    const taskPriorityMap: Record<TaskPriority, string> = {
      LOW: "Låg",
      MEDIUM: "Medium",
      HIGH: "Hög",
      URGENT: "Akut",
    };

    const insightActionMap: Record<
      AIInsightType,
      { href: string; cta: string; tone: "rose" | "amber" | "emerald" | "slate"; rank: number }
    > = {
      SUMMARY: { href: "/ai-assistent", cta: "Öppna AI", tone: "slate", rank: 55 },
      RISK: { href: "/kunder", cta: "Skydda relation", tone: "rose", rank: 86 },
      UPSELL: { href: "/kunder", cta: "Öppna kund", tone: "emerald", rank: 68 },
      NEXT_ACTION: { href: "/ai-assistent", cta: "Visa nästa steg", tone: "amber", rank: 72 },
      ANALYTICS: { href: "/statistik", cta: "Öppna analys", tone: "slate", rank: 60 },
      AUTOMATION: { href: "/automationer", cta: "Skapa workflow", tone: "emerald", rank: 76 },
    };

    const memberInitials = teamMembers.map((member) => {
      const first = member.firstName?.[0] ?? "";
      const last = member.lastName?.[0] ?? "";

      return `${first}${last}`.trim() || "TM";
    });

    const latestInsight = aiRecommendations[0];
    const pipelineStages = pipelineGroups.filter((group) => group.status !== LeadStatus.LOST);
    const totalPipelineDeals = pipelineStages.reduce((sum, group) => sum + group._count._all, 0);
    const strongestStage =
      [...pipelineStages].sort((a, b) => b._count._all - a._count._all)[0] ?? null;
    const overdueCount = overdueInvoices.length;
    const riskCount = riskCustomers.length + overdueCount;
    const averageCustomerScore = Math.round(
      customerLeaders.reduce((sum, customer) => sum + customer.score, 0) /
        Math.max(customerLeaders.length, 1),
    );
    const bookingsNeedingAttention = bookings.filter(
      (booking) =>
        booking.status === BookingStatus.NEEDS_REMINDER || booking.startsAt < tomorrow,
    );
    const workloadScore = openTasks.length * 2 + weeklyBookingsCount * 3 + riskCount * 2;
    const workloadLabel =
      workloadScore >= 22
        ? "Högt operativt tryck"
        : workloadScore >= 12
          ? "Balanserat tryck"
          : "Lugnare driftläge";
    const leadMomentum =
      staleLeads.length > 0
        ? `${staleLeads.length} leads tappar momentum`
        : activeLeadsCount > 0
          ? "Leadflödet håller tempo"
          : "Ingen aktiv leadrörelse ännu";
    const leadVelocity = activeLeadsCount > 0
      ? Math.max(0, Math.round(((activeLeadsCount - staleLeads.length) / activeLeadsCount) * 100))
      : 0;
    const bookingLoadRate = Math.min(
      100,
      Math.round((weeklyBookingsCount / Math.max((teamMembers.length || 1) * 3, 1)) * 100),
    );
    const activityTempo = activities.length + bookings.length + aiRecommendations.length;
    const responsePressure = Math.min(
      100,
      Math.round((activeConversationCount / Math.max(teamMembers.length || 1, 1)) * 100),
    );

    const queueCandidatesWithRank: Array<
      OverviewData["priorityEngine"]["items"][number] & { rank: number }
    > = [
      ...openTasks.map((task) => {
        const isUrgent = task.priority === TaskPriority.URGENT;
        const isHigh = task.priority === TaskPriority.HIGH;
        const isOverdue = Boolean(task.dueAt && task.dueAt < now);
        const ownerName = [task.assignedTo?.firstName, task.assignedTo?.lastName]
          .filter(Boolean)
          .join(" ");
        const tone: OverviewData["priorityEngine"]["items"][number]["tone"] =
          isUrgent || isOverdue ? "rose" : isHigh ? "amber" : "slate";

        return {
          rank:
            (isUrgent ? 100 : isHigh ? 88 : task.priority === TaskPriority.MEDIUM ? 74 : 60) +
            (isOverdue ? 12 : 0),
          title: task.title,
          detail:
            task.description ??
            (task.customer?.companyName
              ? `Påverkar kunden ${task.customer.companyName} och bör stängas innan mer arbete startas.`
              : task.lead?.companyName
                ? `Påverkar leadet ${task.lead.companyName} och bör inte tappa fart.`
                : "Intern operativ uppgift som behöver ett tydligt nästa steg."),
          meta: `${taskPriorityMap[task.priority]} prioritet${task.dueAt ? ` · ${formatRelativeDate(task.dueAt)}` : ""}${ownerName ? ` · ${ownerName}` : ""}`,
          impact:
            task.customer?.companyName || task.lead?.companyName
              ? "Påverkar direkt kund- eller affärsflöde."
              : "Påverkar teamets operativa genomförande.",
          href: "/uppgifter",
          cta: "Öppna uppgift",
          tone,
        };
      }),
      ...overdueInvoices.map((invoice) => ({
        rank: 94,
        title: `Faktura ${invoice.invoiceNumber} är förfallen`,
        detail: `${invoice.customer?.companyName ?? "Kund saknas"} väntar på uppföljning för ${formatCurrency(toNumber(invoice.amount))}.`,
        meta: `Förfallen ${invoice.dueDate ? formatRelativeDate(invoice.dueDate) : "utan datum"}`,
        impact: "Skyddar kassaflöde och minskar ekonomisk friktion.",
        href: "/fakturering",
        cta: "Följ upp faktura",
        tone: "rose" as const,
      })),
      ...staleLeads.map((lead) => {
        const tone: OverviewData["priorityEngine"]["items"][number]["tone"] =
          lead.score >= 80 ? "amber" : "slate";

        return {
          rank: 78 + Math.round(lead.score / 8),
          title: `${lead.companyName} tappar momentum`,
          detail:
            lead.nextAction?.trim() ||
            `Leadet saknar färsk uppföljning och har ${formatCurrency(toNumber(lead.estimatedValue))} i potentiellt värde.`,
          meta: lead.lastContactAt
            ? `Senast kontakt ${formatRelativeDate(lead.lastContactAt)}`
            : "Ingen kontakt registrerad ännu",
          impact: "Återställer rörelse i pipelinen innan möjligheten kyls ned.",
          href: "/leads",
          cta: "Återuppta dialog",
          tone,
        };
      }),
      ...bookings.map((booking) => {
        const tone: OverviewData["priorityEngine"]["items"][number]["tone"] =
          booking.status === BookingStatus.NEEDS_REMINDER ? "amber" : "emerald";

        return {
          rank:
            booking.status === BookingStatus.NEEDS_REMINDER
              ? 84
              : booking.startsAt < tomorrow
                ? 76
                : 62,
          title: `Säkra bokningen för ${booking.customer?.companyName ?? booking.title}`,
          detail: `${booking.title} kräver förberedelse och tydlig ansvarig innan mötet startar.`,
          meta: `${booking.startsAt.toLocaleDateString("sv-SE", {
            month: "short",
            day: "numeric",
          })} · ${booking.startsAt.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          impact: "Minskar leveransrisk och säkrar kundupplevelsen före mötet.",
          href: "/bokningar",
          cta: "Öppna bokning",
          tone,
        };
      }),
      ...aiRecommendations.map((insight) => ({
        rank: insightActionMap[insight.type].rank,
        title: insight.title,
        detail: insight.content,
        meta: `AI ${insight.type.toLowerCase().replaceAll("_", " ")}`,
        impact:
          insight.type === AIInsightType.RISK
            ? "Lyfter risk innan den slår mot kund eller intäkt."
            : insight.type === AIInsightType.AUTOMATION
              ? "Kan spara manuell tid direkt i teamets flöde."
              : "Ger operativt nästa steg baserat på faktisk verksamhetsdata.",
        href: insightActionMap[insight.type].href,
        cta: insightActionMap[insight.type].cta,
        tone: insightActionMap[insight.type].tone,
      })),
    ];

    const queueCandidates = queueCandidatesWithRank
      .sort((left, right) => right.rank - left.rank)
      .slice(0, 5)
      .map(({ rank: _rank, ...item }) => item);

    const customerRadarSource = riskCustomers.length > 0 ? riskCustomers : customerLeaders;
    const topPriority = queueCandidates[0] ?? null;
    const focusQueueLoad = queueCandidates.length;
    const churnRiskRate = Math.round((riskCustomers.length / trackedCustomerCount) * 100);
    const estimatedResponseHours =
      activeConversationCount > 0
        ? Math.max(1, Math.round((activeConversationCount / Math.max(teamMembers.length || 1, 1)) * 2))
        : 0;
    const topRiskCustomer = riskCustomers[0] ?? customerRadarSource[0] ?? null;
    const topOpportunityLead =
      [...staleLeads].sort((left, right) => toNumber(right.estimatedValue) - toNumber(left.estimatedValue))[0] ??
      null;
    const heroSummary =
      queueCandidates.length > 0
        ? [
            topPriority
              ? `${topPriority.title} är dagens starkaste operativa fokus.`
              : `${queueCandidates.length} prioriterade beslut ligger i kö just nu.`,
            activeLeadsCount > 0
              ? `${activeLeadsCount} aktiva leads driver ${formatCurrency(activePipelineValue)} i pipeline.`
              : "Ingen aktiv pipeline ännu.",
            weeklyBookingsCount > 0
              ? `${weeklyBookingsCount} bokningar kräver operativ kontroll denna vecka.`
              : "Kalendern är lugn nog för att bygga nästa steg proaktivt.",
            riskCount > 0
              ? `${riskCount} riskhändelser behöver bevakning innan de påverkar fart eller intäkt.`
              : "Risknivån är låg just nu och teamet kan fokusera på framdrift.",
          ].join(" ")
        : "Arbetsytan har ännu låg aktivitet. När kunder, leads, bokningar och uppgifter fylls på blir denna vy företagets dagliga operativa hjärna.";

    const liveOperationsItems: OverviewData["liveOperations"]["items"] = [
      ...activities.map((activity) => ({
        title: activity.title,
        detail: activity.detail,
        time: activity.createdAt.toLocaleString("sv-SE", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "Teamaktivitet",
        href: "/oversikt",
        cta: "Visa översikt",
        tone: "slate" as const,
      })),
      ...aiRecommendations.slice(0, 2).map((insight) => ({
        title: insight.title,
        detail: insight.content,
        time: formatRelativeDate(insight.createdAt),
        type: "AI-detektion",
        href: insightActionMap[insight.type].href,
        cta: insightActionMap[insight.type].cta,
        tone:
          insight.type === AIInsightType.RISK
            ? ("rose" as const)
            : insight.type === AIInsightType.AUTOMATION
              ? ("violet" as const)
              : ("amber" as const),
      })),
      ...bookings.slice(0, 2).map((booking) => ({
        title: booking.customer?.companyName ?? booking.title,
        detail: `${booking.title} är ${bookingStatusMap[booking.status].toLowerCase()} och ligger nära i kalendern.`,
        time: formatRelativeDate(booking.startsAt),
        type: "Bokning",
        href: "/bokningar",
        cta: "Öppna bokning",
        tone:
          booking.status === BookingStatus.NEEDS_REMINDER
            ? ("amber" as const)
            : ("emerald" as const),
      })),
      ...staleLeads.slice(0, 2).map((lead) => ({
        title: `${lead.companyName} kräver uppföljning`,
        detail:
          lead.nextAction?.trim() ||
          `Senaste kontakt är för gammal för ett lead med ${formatCurrency(toNumber(lead.estimatedValue))} i värde.`,
        time: lead.lastContactAt ? formatRelativeDate(lead.lastContactAt) : "Ingen kontakt ännu",
        type: "Leadsignal",
        href: "/leads",
        cta: "Öppna leads",
        tone: lead.score >= 80 ? ("amber" as const) : ("slate" as const),
      })),
    ]
      .sort((left, right) => (left.time < right.time ? 1 : -1))
      .slice(0, 6);

    const customerRadarItems: OverviewData["customerRadar"]["items"] = customerRadarSource.map((customer) => ({
      name: customer.companyName,
      score: customer.score,
      revenue: formatCurrency(toNumber(customer.revenueGenerated)),
      state: healthMap[customer.health],
      note:
        customer.health === CustomerHealth.AT_RISK
          ? "Risk för tappad relation eller utebliven uppföljning."
          : customer.health === CustomerHealth.WATCH
            ? "Behöver mer aktiv uppföljning innan relationen svalnar."
            : customer.health === CustomerHealth.UPSELL
              ? "Bra timing för expansion eller nytt erbjudande."
              : "Stabil relation med bra service- och intäktsläge.",
      href: "/kunder",
      tone:
        customer.health === CustomerHealth.AT_RISK
          ? "rose"
          : customer.health === CustomerHealth.WATCH
            ? "amber"
            : "emerald",
    }));

    const operationsDeckItems: OverviewData["operationsDeck"]["items"] = [
      ...bookings.slice(0, 3).map((booking) => ({
        title: booking.customer?.companyName ?? booking.title,
        status: bookingStatusMap[booking.status],
        detail:
          booking.notes?.trim() ||
          `${booking.title} behöver ett tydligt ansvar och ett konkret nästa steg före start.`,
        meta: `${booking.startsAt.toLocaleDateString("sv-SE", {
          month: "short",
          day: "numeric",
        })} · ${booking.startsAt.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        href: "/bokningar",
        cta: "Hantera bokning",
        tone:
          booking.status === BookingStatus.NEEDS_REMINDER
            ? ("amber" as const)
            : booking.startsAt < tomorrow
              ? ("emerald" as const)
              : ("slate" as const),
      })),
      ...overdueInvoices.slice(0, 2).map((invoice) => ({
        title: `${invoice.customer?.companyName ?? "Kund"} · ${invoice.invoiceNumber}`,
        status: "Förfallen",
        detail: `${formatCurrency(toNumber(invoice.amount))} behöver följas upp för att skydda kassaflödet.`,
        meta: invoice.dueDate ? formatRelativeDate(invoice.dueDate) : "Utan förfallodatum",
        href: "/fakturering",
        cta: "Öppna fakturering",
        tone: "rose" as const,
      })),
    ].slice(0, 5);

    return {
      hero: {
        eyebrow: "AI-native command center",
        title:
          topPriority?.title ??
          latestInsight?.title ??
          "Företaget är lugnt just nu, men command centret är redo",
        summary: heroSummary,
        liveLabel:
          liveOperationsItems.length > 0
            ? `${liveOperationsItems.length} operativa signaler uppdaterade nyss`
            : "Inga nya signaler ännu",
        focus: {
          label: "Dagens fokus",
          value: topPriority?.title ?? "Bygg dagens första prioritet",
          note:
            topPriority?.impact ??
            "När fler signaler finns lyfter systemet fram exakt vad som förtjänar först energi.",
        },
        opportunity: {
          label: "Största möjlighet",
          value:
            topOpportunityLead?.companyName ??
            (strongestStage ? statusMap[strongestStage.status] : "Skapa ny pipelineenergi"),
          note: topOpportunityLead
            ? `${formatCurrency(toNumber(topOpportunityLead.estimatedValue))} i potential väntar på snabb uppföljning.`
            : strongestStage
              ? `${statusMap[strongestStage.status]} bär störst volym och bör få mest operativt fokus.`
              : "När fler affärer finns lyfts den största möjligheten automatiskt här.",
        },
        risk: {
          label: "Största risk",
          value:
            overdueInvoices[0]?.invoiceNumber ??
            topRiskCustomer?.companyName ??
            "Ingen kritisk risksignal ännu",
          note: overdueInvoices[0]
            ? `Förfallen faktura hos ${overdueInvoices[0].customer?.companyName ?? "kund"} påverkar kassaflödet direkt.`
            : topRiskCustomer
              ? `${healthMap[topRiskCustomer.health]} relation som behöver mänsklig uppföljning nu.`
              : "Riskmotorn får mer precision när fler aktiviteter, dialoger och fakturor finns.",
        },
        teamStatus: {
          label: "Teamets läge",
          value: workloadLabel,
          note:
            teamMembers.length > 0
              ? `${teamMembers.length} teammedlemmar bär ${openTasks.length} öppna uppgifter och ${weeklyBookingsCount} bokningar denna vecka.`
              : "När teamet arbetar i systemet byggs en levande kapacitetsbild här.",
        },
        primaryAction: topPriority
          ? {
              label: topPriority.cta,
              href: topPriority.href,
            }
          : {
              label: "Öppna AI-assistent",
              href: "/ai-assistent",
            },
        secondaryActions: [
          { label: "Oppna AI-workspace", href: "/ai-assistent" },
          { label: "Öppna pipeline", href: "/pipeline" },
          { label: "Se uppgifter", href: "/uppgifter" },
          { label: "Öppna bokningar", href: "/bokningar" },
        ],
        statusChips: [
          {
            label: "Intäkt",
            value: formatCurrency(revenue),
            tone: revenue > 0 ? "emerald" : "slate",
          },
          {
            label: "Pipeline",
            value: `${activeLeadsCount} aktiva`,
            tone: activeLeadsCount > 0 ? "emerald" : "slate",
          },
          {
            label: "Risker",
            value: `${riskCount}`,
            tone: riskCount > 0 ? "rose" : "slate",
          },
          {
            label: "Dialoger",
            value: `${activeConversationCount}`,
            tone: activeConversationCount > 0 ? "amber" : "slate",
          },
        ],
      },
      kpiLayer: [
        {
          group: "Intäkt",
          label: "MRR",
          value: formatCurrency(monthlyRecurringEstimate),
          trend:
            monthlyRecurringEstimate > 0
              ? "Månatlig run-rate från faktura- och pipelinebild"
              : "Ingen tydlig återkommande run-rate ännu",
          momentum:
            activePipelineValue > 0
              ? "Pipeline bidrar till kommande återkommande intäkt"
              : "Bygg mer återkommande volym genom fler aktiva affärer",
          comparison:
            monthlyRecurringEstimate > 0
              ? `${formatCurrency(yearlyRecurringEstimate)} i årstakt`
              : "Ingen årsbas ännu",
          benchmark:
            activeLeadsCount > 0
              ? `${activeLeadsCount} aktiva affärer kan öka run-raten`
              : "Fler aktiva affärer behövs för stabil run-rate",
          reason:
            overdueCount > 0
              ? "Försenade betalningar påverkar kvaliteten i den uppskattade run-raten."
              : "Run-raten bygger på fakturerad volym och aktiv pipeline.",
          action:
            overdueCount > 0
              ? "Säkra betalningar och flytta pipeline mot stängt."
              : "Bygg fler återkommande eller återkommande-liknande intäktsflöden.",
          href: "/fakturering",
          riskLevel: overdueCount > 0 ? "Medel" : "Låg",
          tone: overdueCount > 0 ? "amber" : "emerald",
        },
        {
          group: "Intäkt",
          label: "YRR",
          value: formatCurrency(yearlyRecurringEstimate),
          trend:
            yearlyRecurringEstimate > 0
              ? "Årlig run-rate baserat på nuvarande takt"
              : "Ingen tydlig årstakt ännu",
          momentum:
            activePipelineValue > 0
              ? "Starkare pipeline kan snabbt lyfta årstakten"
              : "Årstakten stärks när fler affärer blir aktiva",
          comparison:
            yearlyRecurringEstimate > revenue
              ? "Årstakten är större än fakturerad volym just nu"
              : "Fakturerad volym ligger nära årstakten",
          benchmark:
            strongestStage && strongestStage._count._all > 0
              ? `${statusMap[strongestStage.status]} driver nuvarande årstakt`
              : "Ingen stark säljfas driver årstakt ännu",
          reason:
            monthlyRecurringEstimate > 0
              ? "YRR speglar ett årligt värde av nuvarande månatliga takt."
              : "För låg månatlig volym för att ge tydlig årstakt.",
          action:
            proposalCount > 0
              ? "Stäng affärer i offertsteget för att höja årstakten."
              : "Bygg mer pipeline för att skapa en tydlig årstakt.",
          href: "/statistik",
          riskLevel: proposalCount > 0 ? "Medel" : "Låg",
          tone: proposalCount > 0 ? "violet" : "slate",
        },
        {
          group: "Intäkt",
          label: "ARR-estimat",
          value: formatCurrency(annualRecurringEstimate),
          trend:
            annualRecurringEstimate > 0
              ? "Annualiserad intäktsbild utifrån faktura och run-rate"
              : "Ingen tydlig annualiserad bas ännu",
          momentum:
            activePipelineValue > 0
              ? "Pipeline kan lyfta ARR-estimatet när affärer stängs"
              : "Mer återkommande volym behövs för starkare ARR-estimat",
          comparison:
            annualRecurringEstimate >= yearlyRecurringEstimate
              ? "ARR-estimat ligger över årstakten"
              : "ARR-estimat ligger nära årstakten",
          benchmark:
            revenue > 0
              ? `${formatCurrency(revenue)} i registrerad fakturavolym just nu`
              : "Ingen större registrerad fakturabas ännu",
          reason:
            overdueCount > 0
              ? "Försenade betalningar gör den annualiserade bilden mindre stabil."
              : "ARR-estimatet bygger på fakturavolym plus återkommande run-rate.",
          action:
            overdueCount > 0
              ? "Säkra betalningar och lås in mer återkommande intäkt."
              : "Öka andelen affärer som kan bli återkommande eller långsiktiga.",
          href: "/statistik",
          riskLevel: overdueCount > 0 ? "Medel" : "Låg",
          tone: overdueCount > 0 ? "amber" : "emerald",
        },
        {
          group: "Intäkt",
          label: "MRR / intäktstryck",
          value: formatCurrency(revenue),
          trend: revenue > 0 ? "Verklig intäkt finns i systemet" : "Ingen fakturerad volym ännu",
          momentum:
            overdueCount > 0
              ? `${overdueCount} fakturor bromsar kassaflödet`
              : "Kassaflödet är stabilt utifrån registrerade fakturor",
          comparison:
            activePipelineValue > revenue
              ? "Pipeline större än fakturerad volym"
              : "Fakturerad volym leder just nu",
          benchmark:
            activePipelineValue > revenue
              ? "Öppen pipeline överstiger redan fakturerad volym"
              : "Fakturerad volym leder fortfarande nuläget",
          reason:
            overdueCount > 0
              ? "Försenade betalningar drar ned intäktens kvalitet trots att belopp finns registrerade."
              : "Fakturaflödet visar just nu låg ekonomisk friktion.",
          action:
            overdueCount > 0 ? "Följ upp förfallna fakturor idag." : "Fortsätt omsätta pipeline till faktura.",
          href: "/fakturering",
          riskLevel: overdueCount > 0 ? "Förhöjd" : "Låg",
          tone: overdueCount > 0 ? "amber" : "emerald",
        },
        {
          group: "Sälj",
          label: "Aktiv pipeline",
          value: formatCurrency(activePipelineValue),
          trend: `${activeLeadsCount} aktiva leads`,
          momentum: leadMomentum,
          comparison:
            strongestStage && strongestStage._count._all > 0
              ? `${statusMap[strongestStage.status]} driver mest volym`
              : "Ingen tydlig stegdominans ännu",
          benchmark:
            strongestStage && strongestStage._count._all > 0
              ? `Starkast just nu: ${statusMap[strongestStage.status]}`
              : "Bygg upp säljflödet med fler aktiva affärer",
          reason:
            staleLeads.length > 0
              ? "Flera affärer har bra potential men saknar färsk kontakt."
              : "Leadflödet visar ingen tydlig friktion just nu.",
          action:
            staleLeads.length > 0
              ? "Återstarta leads som tappat fart."
              : "Tryck fler affärer till nästa steg i pipelinen.",
          href: "/pipeline",
          riskLevel: staleLeads.length > 0 ? "Medel" : "Låg",
          tone: "emerald",
        },
        {
          group: "Sälj",
          label: "Konvertering",
          value: `${conversionRate}%`,
          trend: wonCount > 0 ? `${wonCount} vunna affärer registrerade` : "Inga vunna affärer ännu",
          momentum:
            proposalCount > 0
              ? `${proposalCount} affärer ligger nära beslut`
              : "Få affärer är tillräckligt långt framme i säljflödet",
          comparison:
            proposalCount > wonCount
              ? "Fler affärer väntar på beslut än är stängda"
              : "Fler stängda affärer än väntande beslut",
          benchmark: activeLeadsCount > 0 ? `${activeLeadsCount} affärer matar kvoten` : "Ingen aktiv volym ännu",
          reason:
            proposalCount > 0
              ? "Offertsteget avgör om dagens rörelse blir faktisk konvertering."
              : "Låg rörelse i sena steg håller tillbaka utväxlingen.",
          action:
            proposalCount > 0
              ? "Ring affärer i offertsteget idag."
              : "Bygg fler kvalificerade och offererade affärer.",
          href: "/leads",
          riskLevel: proposalCount > 0 ? "Medel" : "Förhöjd",
          tone: "violet",
        },
        {
          group: "Sälj",
          label: "Win rate",
          value: `${winRate}%`,
          trend:
            closedDealCount > 0
              ? `${wonCount} vunna av ${closedDealCount} stängda affärer`
              : "För få stängda affärer för tydlig win rate",
          momentum:
            proposalCount > 0
              ? `${proposalCount} affärer kan snart påverka kvoten`
              : "Få sena affärer driver win rate just nu",
          comparison:
            winRate >= 40 ? "Stark stängningsgrad" : winRate >= 20 ? "Måttlig stängningsgrad" : "Låg stängningsgrad",
          benchmark:
            closedDealCount > 0
              ? `${lostCount} förlorade affärer sätter mottryck`
              : "Ingen stabil benchmark ännu",
          reason:
            lostCount > wonCount
              ? "För många affärer tappas innan stängning."
              : "Stängningsgraden hålls uppe av relativt fler vunna affärer.",
          action:
            proposalCount > 0
              ? "Tryck på affärer nära beslut för att lyfta win rate."
              : "Bygg fler affärer i sena steg för en tydligare stängningsgrad.",
          href: "/pipeline",
          riskLevel: winRate >= 40 ? "Låg" : winRate >= 20 ? "Medel" : "Förhöjd",
          tone: winRate >= 40 ? "emerald" : winRate >= 20 ? "amber" : "rose",
        },
        {
          group: "Sälj",
          label: "Lead velocity",
          value: `${leadVelocity}%`,
          trend:
            activeLeadsCount > 0
              ? `${activeLeadsCount - staleLeads.length} av ${activeLeadsCount} leads håller tempo`
              : "Ingen aktiv leadvolym ännu",
          momentum:
            staleLeads.length > 0
              ? `${staleLeads.length} leads bromsar flödet`
              : "Leadflödet ser friskt ut just nu",
          comparison:
            leadVelocity >= 70 ? "Hög leadhastighet" : leadVelocity >= 40 ? "Måttlig leadhastighet" : "Låg leadhastighet",
          benchmark:
            activeLeadsCount > 0
              ? `${proposalCount} affärer har redan nått offertsteget`
              : "Fler leads krävs för benchmark",
          reason:
            staleLeads.length > 0
              ? "Leads utan färsk kontakt sänker hastigheten i säljmaskinen."
              : "Leadflödet rör sig utan tydlig friktion.",
          action:
            staleLeads.length > 0
              ? "Återaktivera leads som saknar färsk uppföljning."
              : "Fortsätt flytta kvalificerade leads mot offert.",
          href: "/leads",
          riskLevel: leadVelocity >= 70 ? "Låg" : leadVelocity >= 40 ? "Medel" : "Förhöjd",
          tone: leadVelocity >= 70 ? "emerald" : leadVelocity >= 40 ? "amber" : "rose",
        },
        {
          group: "Drift",
          label: "Bokningsbelastning",
          value: `${weeklyBookingsCount}`,
          trend: `${bookings.length} närmast i kalendern kräver förberedelse`,
          momentum:
            bookingsNeedingAttention.length > 0
              ? `${bookingsNeedingAttention.length} bokningar behöver extra uppmärksamhet`
              : "Kalendern ser under kontroll ut",
          comparison:
            bookingLoadRate >= 80
              ? "Hög veckobelastning"
              : bookingLoadRate >= 45
                ? "Balanserad veckobelastning"
                : "Luft i kalendern",
          benchmark: `${bookingLoadRate}% av uppskattad veckokapacitet`,
          reason:
            bookingsNeedingAttention.length > 0
              ? "Påminnelser och nära starter ökar risken för operativt slarv."
              : "Nuvarande bokningsläge ger teamet utrymme att planera i tid.",
          action:
            bookingsNeedingAttention.length > 0
              ? "Bekräfta ansvar och förberedelser för dagens bokningar."
              : "Fyll kalendern utan att överbelasta teamet.",
          href: "/bokningar",
          riskLevel: bookingsNeedingAttention.length > 0 ? "Medel" : "Låg",
          tone: "amber",
        },
        {
          group: "Kunder",
          label: "Kundhälsa",
          value: `${retentionRate}%`,
          trend: `${averageCustomerScore}/100 i snittscore på starkaste relationerna`,
          momentum:
            riskCustomers.length > 0
              ? `${riskCustomers.length} relationer kräver skydd`
              : "Kundbasen ser stabil ut i nuläget",
          comparison:
            riskCustomers.length > 0
              ? "Riskrelationer påverkar retentionen"
              : "Kundbasen har låg synlig churn-press",
          benchmark:
            customerRadarItems[0]?.name
              ? `${customerRadarItems[0].name} är starkaste tydliga kundsignal`
              : "Fler kundrelationer behövs för benchmark",
          reason:
            riskCustomers.length > 0
              ? "Bevaknings- och riskkunder drar ned tryggheten i retentionen."
              : "Kundhälsan hålls uppe av få tydliga risksignaler.",
          action:
            riskCustomers.length > 0
              ? "Starta check-in mot riskkunder idag."
              : "Identifiera nästa upsell- eller expansionsfönster.",
          href: "/kunder",
          riskLevel: riskCustomers.length > 0 ? "Medel" : "Låg",
          tone: "cyan",
        },
        {
          group: "Kunder",
          label: "Churn-risk",
          value: `${churnRiskRate}%`,
          trend:
            riskCustomers.length > 0
              ? `${riskCustomers.length} relationer ligger i risk eller bevakning`
              : "Ingen tydlig churn-risk i kundbasen just nu",
          momentum:
            churnRiskRate >= 25
              ? "För stor del av kundbasen kräver aktiv bevakning"
              : churnRiskRate >= 10
                ? "En del av kundbasen behöver tätare uppföljning"
                : "Låg synlig churn-press",
          comparison:
            churnRiskRate >= 25
              ? "Hög churn-press"
              : churnRiskRate >= 10
                ? "Måttlig churn-press"
                : "Låg churn-press",
          benchmark:
            trackedCustomerCount > 1
              ? `${trackedCustomerCount} spårade relationer i kundbasen`
              : "Få spårade relationer ännu",
          reason:
            riskCustomers.length > 0
              ? "Risk- och bevakningskunder driver upp churn-trycket."
              : "Kundbasen visar just nu få tydliga riskrelationer.",
          action:
            riskCustomers.length > 0
              ? "Starta retention-checkins med riskkunder idag."
              : "Behåll tät uppföljning för att hålla churn-risken låg.",
          href: "/kunder",
          riskLevel: churnRiskRate >= 25 ? "Hög" : churnRiskRate >= 10 ? "Medel" : "Låg",
          tone: churnRiskRate >= 25 ? "rose" : churnRiskRate >= 10 ? "amber" : "emerald",
        },
        {
          group: "Team",
          label: "Team load",
          value: workloadLabel,
          trend: `${openTasks.length} öppna uppgifter · ${activeConversationCount} aktiva dialoger`,
          momentum:
            topPriority != null
              ? `${queueCandidates.length} prioriterade beslut väntar`
              : "Belastningen är fortfarande låg",
          comparison:
            workloadScore >= 22
              ? "Teamet ligger i högtryck"
              : workloadScore >= 12
                ? "Teamet ligger i balanserat tryck"
                : "Teamet har ledig kapacitet",
          benchmark:
            teamMembers.length > 0
              ? `${teamMembers.length} personer i arbetsytan`
              : "Inget team uppläst ännu",
          reason:
            openTasks.length > 0 || weeklyBookingsCount > 0
              ? "Uppgifter och bokningar konkurrerar om samma kapacitet."
              : "Teamtrycket är lågt tills fler aktiviteter förs in i systemet.",
          action:
            queueCandidates.length > 0
              ? "Fördela ägarskap i prioritetskön."
              : "Bygg tydliga arbetsflöden innan tempot ökar.",
          href: "/team",
          riskLevel: workloadScore >= 22 ? "Hög" : workloadScore >= 12 ? "Medel" : "Låg",
          tone: workloadScore >= 22 ? "rose" : "slate",
        },
        {
          group: "Kunder",
          label: "Risksignaler",
          value: `${riskCount}`,
          trend:
            riskCount > 0
              ? `${riskCustomers.length} riskkunder och ${overdueCount} ekonomiska risker`
              : "Inga tydliga risksignaler registrerade",
          momentum:
            riskCount > 0
              ? "Flera signaler behöver aktiv bevakning"
              : "Verksamheten ser stabil ut i nuläget",
          comparison:
            riskCount >= 4
              ? "Kritisk signalnivå"
              : riskCount > 0
                ? "Förhöjd signalnivå"
                : "Låg signalnivå",
          benchmark:
            riskCustomers.length > 0
              ? `${riskCustomers.length} relationer ligger i risk eller bevakning`
              : "Ingen riskklunga i kundbasen",
          reason:
            overdueCount > 0 || riskCustomers.length > 0
              ? "Både kundhälsa och kassaflöde påverkar riskbilden."
              : "Varken kundbasen eller ekonomin visar tydlig friktion just nu.",
          action:
            riskCount > 0
              ? "Gå igenom riskkunder och förfallna fakturor idag."
              : "Behåll tät uppföljning för att hålla risknivån låg.",
          href: riskCustomers.length > 0 ? "/kunder" : "/fakturering",
          riskLevel: riskCount >= 4 ? "Hög" : riskCount > 0 ? "Medel" : "Låg",
          tone: riskCount >= 4 ? "rose" : riskCount > 0 ? "amber" : "emerald",
        },
        {
          group: "Team",
          label: "Dialogtryck",
          value: `${activeConversationCount}`,
          trend:
            activeConversationCount > 0
              ? `${activeConversationCount} aktiva kunddialoger pågår`
              : "Inga aktiva dialoger ännu",
          momentum:
            activeConversationCount > teamMembers.length
              ? "Högre svarstryck än teamstorleken"
              : "Dialogtrycket är under kontroll",
          comparison:
            responsePressure >= 100
              ? "Fler dialoger än teamkapacitet"
              : responsePressure >= 50
                ? "Måttligt svarstryck"
                : "Lugnt inflöde",
          benchmark:
            teamMembers.length > 0
              ? `${teamMembers.length} personer delar på inflödet`
              : "Inget team kopplat ännu",
          reason:
            activeConversationCount > 0
              ? "Dialoger konkurrerar direkt med säljarbete, uppföljning och leverans."
              : "När fler konversationer kommer in ökar behovet av tydlig svarsfördelning.",
          action:
            activeConversationCount > 0
              ? "Fördela dialogägarskap och svara först där kundvärdet är störst."
              : "Bygg dialogflöde och rutiner för snabb uppföljning.",
          href: "/konversationer",
          riskLevel:
            responsePressure >= 100 ? "Hög" : responsePressure >= 50 ? "Medel" : "Låg",
          tone:
            responsePressure >= 100
              ? "rose"
              : responsePressure >= 50
                ? "amber"
                : "slate",
        },
        {
          group: "Team",
          label: "Svarstid",
          value: estimatedResponseHours > 0 ? `${estimatedResponseHours}h` : "0h",
          trend:
            activeConversationCount > 0
              ? "Uppskattad svarstid utifrån dialogtryck och teamstorlek"
              : "Ingen aktiv dialogkö ännu",
          momentum:
            estimatedResponseHours >= 4
              ? "Svarsläget riskerar att bli trögt"
              : estimatedResponseHours >= 2
                ? "Svarsläget är acceptabelt men bör bevakas"
                : "Snabb uppskattad svarsförmåga",
          comparison:
            estimatedResponseHours >= 4
              ? "Långsam uppskattad svarstid"
              : estimatedResponseHours >= 2
                ? "Måttlig uppskattad svarstid"
                : "Snabb uppskattad svarstid",
          benchmark:
            teamMembers.length > 0
              ? `${teamMembers.length} personer delar dialogflödet`
              : "Ingen teamkapacitet kopplad ännu",
          reason:
            activeConversationCount > 0
              ? "Fler samtidiga dialoger ökar väntetiden om ägarskap är otydligt."
              : "Svarstid börjar bli meningsfull när fler dialoger är aktiva.",
          action:
            activeConversationCount > 0
              ? "Fördela dialogägare och prioritera högvärdeskunder först."
              : "Bygg rutiner för snabb första respons.",
          href: "/konversationer",
          riskLevel: estimatedResponseHours >= 4 ? "Hög" : estimatedResponseHours >= 2 ? "Medel" : "Låg",
          tone: estimatedResponseHours >= 4 ? "rose" : estimatedResponseHours >= 2 ? "amber" : "emerald",
        },
        {
          group: "Drift",
          label: "Aktivitetstempo",
          value: `${activityTempo}`,
          trend:
            activityTempo > 0
              ? `${activities.length} aktiviteter, ${bookings.length} bokningar och ${aiRecommendations.length} AI-signaler`
              : "Lågt operativt tempo ännu",
          momentum:
            activityTempo >= 10
              ? "Arbetsytan visar tydlig rörelse"
              : activityTempo >= 4
                ? "Stabil men begränsad rörelse"
                : "Låg signalvolym i nuläget",
          comparison:
            activityTempo >= 10
              ? "Hög signaltäthet"
              : activityTempo >= 4
                ? "Måttlig signaltäthet"
                : "Låg signaltäthet",
          benchmark:
            activityTempo >= 10
              ? "Tillräckligt mycket data för en stark översiktsbild"
              : "Mer aktivitet ger bättre beslutsunderlag",
          reason:
            activityTempo > 0
              ? "Översikten blir bättre när aktivitet, bokningar och AI-insikter samspelar."
              : "För låg aktivitet gör att systemet ännu inte kan visa full operativ bild.",
          action:
            activityTempo > 0
              ? "Behåll tempot och för in allt viktigt arbete i systemet."
              : "Börja registrera fler aktiviteter, bokningar och kundhändelser.",
          href: "/oversikt",
          riskLevel: activityTempo >= 10 ? "Låg" : activityTempo >= 4 ? "Medel" : "Förhöjd",
          tone: activityTempo >= 10 ? "emerald" : activityTempo >= 4 ? "amber" : "slate",
        },
        {
          group: "Sälj",
          label: "Fokuskö",
          value: `${focusQueueLoad}`,
          trend:
            focusQueueLoad > 0
              ? `${focusQueueLoad} prioriterade beslut väntar`
              : "Ingen aktiv besluts- eller blockeringskö ännu",
          momentum:
            focusQueueLoad >= 5
              ? "Hög belastning i dagens prioriteringskö"
              : focusQueueLoad >= 3
                ? "Flera beslut kräver uppmärksamhet"
                : "Få aktiva fokusposter",
          comparison:
            focusQueueLoad >= 5
              ? "Tung fokusbild"
              : focusQueueLoad >= 3
                ? "Normal fokusbild"
                : "Lätt fokusbild",
          benchmark:
            topPriority?.title
              ? `Starkaste fokus: ${topPriority.title}`
              : "Ingen dominant prioritet ännu",
          reason:
            focusQueueLoad > 0
              ? "Tasks, bokningar, fakturor och AI-signaler tävlar om samma operativa fokus."
              : "När fler processer blir aktiva prioriterar systemet dem här.",
          action:
            focusQueueLoad > 0
              ? "Jobba uppifrån och ned i prioritetslistan."
              : "Bygg tydliga nästa steg så systemet kan prioritera bättre.",
          href: "/uppgifter",
          riskLevel:
            focusQueueLoad >= 5 ? "Hög" : focusQueueLoad >= 3 ? "Medel" : "Låg",
          tone:
            focusQueueLoad >= 5
              ? "rose"
              : focusQueueLoad >= 3
                ? "amber"
                : "slate",
        },
      ],
      priorityEngine: {
        headline: "Prioriteringsmotor 2.0",
        summary:
          queueCandidates.length > 0
            ? "AI grupperar dagens viktigaste arbete utifrån deadlines, risk, pipelinefart och teamfriktion."
            : "När uppgifter, dialoger, bokningar och affärer får mer aktivitet byggs dagens prioriterade arbetslista här.",
        items: queueCandidates,
      },
      liveOperations: {
        headline: "Live operations feed",
        summary:
          liveOperationsItems.length > 0
            ? "Här syns teamets senaste rörelser, AI-detektioner och verksamhetssignaler i ett gemensamt flöde."
            : "När verksamheten börjar röra sig fylls feeden med verkliga händelser, automationer och AI-signaler.",
        items: liveOperationsItems,
      },
      revenueEngine: {
        headline: "Intäktsmotor",
        summary:
          strongestStage && strongestStage._count._all > 0
            ? `${statusMap[strongestStage.status]} bär mest volym just nu och bör få mest operativ energi.`
            : "När riktiga leads finns i arbetsytan får du en levande bild av säljflödet här.",
        strongestStage:
          strongestStage?.status ? statusMap[strongestStage.status] : "Ingen ännu",
        totalValue: formatCurrency(activePipelineValue),
        href: "/pipeline",
        stages: pipelineStages.map((group) => ({
          label: statusMap[group.status],
          count: group._count._all,
          value: formatCurrency(toNumber(group._sum.estimatedValue)),
          percentage: totalPipelineDeals
            ? Math.max(
                12,
                Math.round((group._count._all / totalPipelineDeals) * 100),
              )
            : 0,
        })),
      },
      teamPulse: {
        headline: "Teampuls",
        summary:
          teamMembers.length > 0
            ? `Teamet bär ${openTasks.length} öppna uppgifter, ${weeklyBookingsCount} bokningar och ${activeConversationCount} aktiva dialoger just nu.`
            : "När teamet börjar arbeta i systemet visas närvaro, kapacitet och belastning här.",
        memberCount: `${teamMembers.length}`,
        activeConversationCount: `${activeConversationCount}`,
        memberInitials,
        workloadLabel,
        note:
          activeConversationCount > 0
            ? `${activeConversationCount} aktiva kunddialoger pågår samtidigt som ${queueCandidates.length} prioriterade beslut väntar.`
            : `${queueCandidates.length} prioriterade beslut väntar och teamet behöver tydlig ägarbild.`,
        items: [
          {
            label: "Öppna uppgifter",
            value: `${openTasks.length}`,
            note: "Visar faktiskt operativt arbete som pågår eller väntar.",
          },
          {
            label: "Dialogtryck",
            value: `${activeConversationCount}`,
            note: "Hjälper teamet förstå hur mycket kundkontakt som lever samtidigt.",
          },
          {
            label: "Veckobokningar",
            value: `${weeklyBookingsCount}`,
            note: "Visar hur tung driftveckan är i förhållande till teamkapacitet.",
          },
        ],
      },
      customerRadar: {
        headline: "Kundradar",
        summary:
          customerRadarItems.length > 0
            ? "Här samlas relationer som bör skyddas, expanderas eller följas upp först."
            : "När kunder får historik, hälsoscore och intäkt blir kundradarn en levande riskskärm.",
        items: customerRadarItems,
      },
      operationsDeck: {
        headline: "Drift och bokningar",
        summary:
          operationsDeckItems.length > 0
            ? "Driver dagens leveransläge, kommande tider och finansiella blockers i samma yta."
            : "När bokningar och fakturor finns i drift visas kapacitet och blockers här.",
        items: operationsDeckItems,
      },
      aiCommand: {
        headline:
          latestInsight?.title ??
          "AI driver dagens fokus, risker och nästa steg",
        summary:
          latestInsight?.content ??
          `AI väger nu samman ${queueCandidates.length} prioriterade actions, ${activeLeadsCount} aktiva leads och ${weeklyBookingsCount} bokningar för att orkestrera dagen.`,
        command:
          latestInsight?.title ??
          (strongestStage
            ? `Analysera steget ${statusMap[strongestStage.status]} och föreslå tre drag som ökar rörelse och konvertering.`
            : "Sammanfatta arbetsytan och föreslå tre nästa steg."),
        focusPoints: [
          topPriority?.title ?? "Skapa prioriteringslista",
          overdueCount > 0 ? `${overdueCount} förfallna fakturor` : "Inga förfallna fakturor",
          riskCustomers.length > 0 ? `${riskCustomers.length} riskkunder` : "Stabil kundbas",
          `${activeLeadsCount} aktiva leads`,
        ],
        recommendations: [
          {
            title: "Prioritera dagens arbete",
            detail:
              topPriority?.detail ??
              "Låt AI sortera uppgifter, leads och bokningar i rätt ordning för dagen.",
            href: topPriority?.href ?? "/ai-assistent",
            cta: topPriority?.cta ?? "Öppna AI-assistent",
          },
          {
            title: "Bygg nästa workflow",
            detail:
              bookingsNeedingAttention[0]
                ? `Skapa ett workflow kring ${bookingsNeedingAttention[0].customer?.companyName ?? bookingsNeedingAttention[0].title} för påminnelse, ansvar och uppföljning.`
                : "Låt AI föreslå vilket operativt flöde som ska automatiseras först.",
            href: "/automationer",
            cta: "Skapa workflow",
          },
          {
            title: "Sammanfatta verksamheten",
            detail:
              topRiskCustomer != null
                ? `Be AI förklara varför ${topRiskCustomer.companyName} ligger i fokus och vad teamet bör göra härnäst.`
                : "Be AI ge en samlad lägesbild över risk, tillväxt och drift.",
            href: "/ai-assistent",
            cta: "Kör AI-analys",
          },
        ],
        actions: [
          { label: "Öppna AI-assistent", href: "/ai-assistent" },
          { label: "Skapa automation", href: "/automationer" },
          {
            label:
              topPriority?.cta ?? "Se dagens prioriteringar",
            href: topPriority?.href ?? "/oversikt",
          },
        ],
      },
    };
  });
}

export type LeadsData = {
  stats: Array<{ label: string; value: string; note: string }>;
  owners: Array<{ id: string; name: string }>;
  stages: Array<{
    name: string;
    stageKey: LeadStatus;
    count: number;
    total: string;
    leads: Array<{
      id: string;
      stageKey: LeadStatus;
      company: string;
      contactName: string;
      email: string;
      phone: string;
      ownerId: string;
      ownerName: string;
      status: string;
      contact: string;
      probability: number;
      probabilityLabel: string;
      value: string;
      estimatedValue: number;
      insight: string;
      nextAction: string;
      source: string;
      score: number;
      temperature: "Kall" | "Varm" | "Het";
    }>;
  }>;
  signals: Array<{ title: string; text: string }>;
  suggestedActions: string[];
  communications: Array<{ company: string; text: string }>;
  temperatureSummary: Array<{ label: string; value: string }>;
};

export async function getLeadsData(): Promise<LeadsData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const [leads, owners] = await Promise.all([
      prisma.lead.findMany({
        where: { workspaceId: workspace.id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          aiInsights: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: [{ status: "asc" }, { score: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.user.findMany({
        where: {
          workspaceId: workspace.id,
          isActive: true,
        },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      }),
    ]);

    const activeCount = leads.filter(
      (lead) =>
        lead.status === LeadStatus.NEW ||
        lead.status === LeadStatus.QUALIFIED ||
        lead.status === LeadStatus.PROPOSAL,
    ).length;
    const avgScore = Math.round(
      leads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(leads.length, 1),
    );
    const gapCount = leads.filter((lead) => {
      if (!lead.lastContactAt) {
        return true;
      }

      const daysSinceLastContact =
        (Date.now() - lead.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);

      return daysSinceLastContact >= 3;
    }).length;

    const statusMap: Record<LeadStatus, string> = {
      NEW: "Nya",
      QUALIFIED: "Kvalificerade",
      PROPOSAL: "Offert",
      WON: "Vunna",
      LOST: "Förlorade",
    };

    const temperatureMap = {
      COLD: "Kall",
      WARM: "Varm",
      HOT: "Het",
    } as const;

    const stageOrder = [
      LeadStatus.NEW,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL,
      LeadStatus.WON,
      LeadStatus.LOST,
    ] as const;

    const stages = stageOrder
      .map((status) => {
        const items = leads.filter((lead) => lead.status === status);

        return {
          name: statusMap[status],
          stageKey: status,
          count: items.length,
          total: formatCurrency(
            items.reduce((sum, lead) => sum + toNumber(lead.estimatedValue), 0),
          ),
          leads: items.map((lead) => ({
            id: lead.id,
            stageKey: status,
            company: lead.companyName,
            contactName: lead.contactName ?? "Ingen kontaktperson",
            email: lead.email ?? "",
            phone: lead.phone ?? "",
            ownerId: lead.owner?.id ?? "",
            ownerName:
              `${lead.owner?.firstName ?? ""} ${lead.owner?.lastName ?? ""}`.trim() ||
              "Ej tilldelad",
            status: temperatureMap[lead.temperature],
            contact: formatRelativeDate(lead.lastContactAt ?? lead.updatedAt ?? lead.createdAt),
            probability: lead.probability,
            probabilityLabel: `${lead.probability}%`,
            value: formatCurrency(toNumber(lead.estimatedValue)),
            estimatedValue: toNumber(lead.estimatedValue),
            insight:
              lead.aiInsights[0]?.content ??
              lead.nextAction ??
              "AI-insikt kommer när mer aktivitet finns.",
            nextAction: lead.nextAction ?? "Definiera nästa steg",
            source: lead.source ?? "Ingen källa sparad ännu",
            score: lead.score,
            temperature: temperatureMap[lead.temperature],
          })),
        };
      })
      .filter((stage) => stage.count > 0);

    const hotLeads = leads.filter((lead) => lead.temperature === "HOT").length;
    const warmLeads = leads.filter((lead) => lead.temperature === "WARM").length;
    const coldLeads = leads.filter((lead) => lead.temperature === "COLD").length;
    const highIntentNoFollowUp = leads.filter((lead) => {
      if (lead.score < 80) {
        return false;
      }

      if (!lead.lastContactAt) {
        return true;
      }

      const daysSinceLastContact =
        (Date.now() - lead.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);

      return daysSinceLastContact >= 2;
    }).length;

    const proposalCount = leads.filter((lead) => lead.status === LeadStatus.PROPOSAL).length;
    const wonCount = leads.filter((lead) => lead.status === LeadStatus.WON).length;

    return {
      stats: [
        {
          label: "Aktiva leads",
          value: `${activeCount}`,
          note: "Leadvolym från databasen.",
        },
        {
          label: "Genomsnittlig AI-score",
          value: `${avgScore}`,
          note: "Beräknad utifrån nuvarande leadscore.",
        },
        {
          label: "Uppföljningsgap",
          value: `${gapCount}`,
          note: "Leads som saknar ny kontakt eller uppföljning.",
        },
      ],
      owners: owners.map((owner) => ({
        id: owner.id,
        name: `${owner.firstName} ${owner.lastName}`.trim(),
      })),
      stages,
      signals: [
        {
          title: `${highIntentNoFollowUp} starka leads behöver uppföljning`,
          text: "Leads med hög score och för svag senaste aktivitet bör få mänsklig kontakt direkt.",
        },
        {
          title: `${proposalCount} affärer ligger i offertsteget`,
          text: "Offertsteget bör drivas med tydligt nästa beslut och snabb mänsklig uppföljning.",
        },
        {
          title: `${wonCount} affärer är redan vunna`,
          text: "Vunna leads bör snabbt konverteras till nästa operativa åtgärd i bokningar eller uppgifter.",
        },
      ],
      suggestedActions: [
        highIntentNoFollowUp > 0
          ? "Kontakta högscore-leads som inte fått svar inom 48 timmar."
          : "Fortsätt hålla tempot uppe på nya och kvalificerade leads.",
        proposalCount > 0
          ? "Ring affärer i offertsteget i stället för att vänta på passiv mailrespons."
          : "Få fler affärer att röra sig från kvalificering till offert.",
        coldLeads > warmLeads
          ? "Städa kalla leads och återaktivera bara de som har tydlig köpsignal."
          : "Fördela uppföljningar så att varma och heta leads får snabbast respons.",
      ],
      communications: leads
        .slice()
        .sort(
          (a, b) =>
            (b.lastContactAt ?? b.updatedAt ?? b.createdAt).getTime() -
            (a.lastContactAt ?? a.updatedAt ?? a.createdAt).getTime(),
        )
        .slice(0, 4)
        .map((lead) => ({
          company: lead.companyName,
          text: lead.nextAction ?? lead.source ?? "Ingen kommunikationssignal sparad ännu.",
        })),
      temperatureSummary: [
        { label: "Heta", value: `${hotLeads}` },
        { label: "Varma", value: `${warmLeads}` },
        { label: "Kalla", value: `${coldLeads}` },
      ],
    };
  });
}

export type CustomersData = {
  featuredCustomer: {
    id: string;
    name: string;
    contact: string;
    health: string;
    score: number;
    revenue: string;
    bookings: string;
    lastReply: string;
    summary: string;
    nextSteps: string[];
    bookingItems: Array<{
      id: string;
      title: string;
      meta: string;
      detail: string;
    }>;
    invoiceItems: Array<{
      id: string;
      title: string;
      meta: string;
      detail: string;
      tone: "emerald" | "amber" | "slate";
    }>;
    conversationItems: Array<{
      id: string;
      title: string;
      meta: string;
      detail: string;
    }>;
    noteItems: Array<{
      title: string;
      detail: string;
    }>;
    operationsItems: Array<{
      title: string;
      text: string;
    }>;
    quickActions: Array<{
      label: string;
      href: string;
    }>;
  } | null;
  customers: Array<{
    id: string;
    name: string;
    score: number;
    revenue: string;
    health: string;
    summary: string;
  }>;
  timeline: Array<{
    title: string;
    detail: string;
    time: string;
  }>;
  healthSummary: Array<{
    title: string;
    value: string;
    note: string;
  }>;
};

export type QuotesData = {
  statusCards: Array<{
    label: string;
    value: string;
    note: string;
    tone: "slate" | "amber" | "emerald" | "rose";
  }>;
  quotes: Array<{
    id: string;
    quoteNumber: string;
    customerId: string;
    customerName: string;
    title: string;
    amount: string;
    state: string;
    validUntil: string;
    owner: string;
    note: string;
  }>;
  customerOptions: Array<{
    id: string;
    label: string;
  }>;
  suggestions: string[];
  principles: string[];
};

export type TeamData = {
  summary: Array<{ label: string; value: string; note: string }>;
  members: Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    role: WorkspaceRole;
    status: string;
    statusTone: "emerald" | "amber" | "slate" | "rose";
    isActive: boolean;
    lastSeen: string;
    openTasks: number;
    highPriorityTasks: number;
    bookingsToday: number;
    activeLeads: number;
    customers: number;
    workloadLabel: string;
    workloadScore: number;
  }>;
  recommendations: Array<{
    title: string;
    detail: string;
    href: string;
  }>;
  aiInsights: Array<{
    title: string;
    detail: string;
    time: string;
  }>;
};

export async function getTeamData(): Promise<TeamData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [users, totalOpenTasks, totalBookingsToday, aiInsights] = await Promise.all([
      prisma.user.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ isActive: "desc" }, { lastSeenAt: "desc" }, { firstName: "asc" }],
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          title: true,
          isActive: true,
          lastSeenAt: true,
          memberships: {
            where: { workspaceId: workspace.id },
            take: 1,
            select: { role: true },
          },
          assignedTasks: {
            where: {
              status: {
                in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
              },
            },
            select: {
              id: true,
              priority: true,
            },
          },
          assignedBookings: {
            where: {
              startsAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
              status: {
                in: [BookingStatus.DRAFT, BookingStatus.CONFIRMED, BookingStatus.NEEDS_REMINDER],
              },
            },
            select: {
              id: true,
            },
          },
          ownedLeads: {
            where: {
              status: {
                in: [LeadStatus.NEW, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL],
              },
            },
            select: {
              id: true,
            },
          },
          ownedCustomers: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.task.count({
        where: {
          workspaceId: workspace.id,
          status: {
            in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
          },
        },
      }),
      prisma.booking.count({
        where: {
          workspaceId: workspace.id,
          startsAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: [BookingStatus.DRAFT, BookingStatus.CONFIRMED, BookingStatus.NEEDS_REMINDER],
          },
        },
      }),
      prisma.aIInsight.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { entityType: "WORKSPACE" },
            { type: AIInsightType.ANALYTICS },
            { type: AIInsightType.NEXT_ACTION },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          title: true,
          content: true,
          createdAt: true,
        },
      }),
    ]);

    const members = users.map((user) => {
      const role = user.memberships[0]?.role ?? WorkspaceRole.MEMBER;
      const openTasks = user.assignedTasks.length;
      const highPriorityTasks = user.assignedTasks.filter(
        (task) => task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT,
      ).length;
      const bookingsToday = user.assignedBookings.length;
      const activeLeads = user.ownedLeads.length;
      const customers = user.ownedCustomers.length;
      const minutesSinceLastSeen = user.lastSeenAt
        ? Math.max(1, Math.round((Date.now() - user.lastSeenAt.getTime()) / (1000 * 60)))
        : null;

      let status = "Offline";
      let statusTone: TeamData["members"][number]["statusTone"] = "slate";

      if (!user.isActive) {
        status = "Inaktiv";
        statusTone = "rose";
      } else if (bookingsToday > 0 && minutesSinceLastSeen !== null && minutesSinceLastSeen <= 120) {
        status = "I fält";
        statusTone = "amber";
      } else if (minutesSinceLastSeen !== null && minutesSinceLastSeen <= 10) {
        status = "Online";
        statusTone = "emerald";
      } else if (minutesSinceLastSeen !== null && minutesSinceLastSeen <= 90) {
        status = "Nyligen aktiv";
        statusTone = "amber";
      }

      const workloadScore = openTasks * 2 + highPriorityTasks * 3 + bookingsToday * 3 + activeLeads * 2;
      const workloadLabel =
        workloadScore >= 18 ? "Hög belastning" : workloadScore >= 10 ? "Balanserad" : "Ledig kapacitet";

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        title: user.title ?? "Teammedlem",
        role,
        status,
        statusTone,
        isActive: user.isActive,
        lastSeen: user.lastSeenAt ? formatRelativeDate(user.lastSeenAt) : "Ingen aktivitet ännu",
        openTasks,
        highPriorityTasks,
        bookingsToday,
        activeLeads,
        customers,
        workloadLabel,
        workloadScore,
      };
    });

    const overloadedMember = [...members].sort((a, b) => b.workloadScore - a.workloadScore)[0];
    const availableMember = [...members].sort((a, b) => a.workloadScore - b.workloadScore)[0];
    const membersInField = members.filter((member) => member.status === "I fält").length;
    const onlineMembers = members.filter(
      (member) => member.status === "Online" || member.status === "I fält",
    ).length;
    const admins = members.filter(
      (member) => member.role === WorkspaceRole.OWNER || member.role === WorkspaceRole.ADMIN,
    ).length;

    const recommendations = [
      overloadedMember && availableMember && overloadedMember.id !== availableMember.id
        ? {
            title: `Balansera ${overloadedMember.name} mot ${availableMember.name}`,
            detail: `${overloadedMember.name} har ${overloadedMember.openTasks} öppna uppgifter medan ${availableMember.name} har lägre belastning.`,
            href: "/uppgifter",
          }
        : null,
      membersInField > 0
        ? {
            title: "Synka dagens fältkapacitet",
            detail: `${membersInField} teammedlemmar har bokningar i dag. Kontrollera att rätt personer äger rätt kunder och tider.`,
            href: "/bokningar",
          }
        : null,
      members.some((member) => member.activeLeads >= 3)
        ? {
            title: "Säkra ägarskap i pipelinen",
            detail: "Flera leads ligger på samma personer. Gå igenom om ägarskap och uppföljning är jämnt fördelade.",
            href: "/pipeline",
          }
        : null,
    ].filter(Boolean) as TeamData["recommendations"];

    return {
      summary: [
        {
          label: "Online nu",
          value: `${onlineMembers}`,
          note: "Bygger på verklig senast sedd-status.",
        },
        {
          label: "Öppna uppgifter",
          value: `${totalOpenTasks}`,
          note: "Aktiva tasks tilldelade teamet.",
        },
        {
          label: "Bokningar i dag",
          value: `${totalBookingsToday}`,
          note: "Visar leverans- och fältbelastning för dagen.",
        },
        {
          label: "Admins och owners",
          value: `${admins}`,
          note: "Medlemmar som kan styra roller och drift.",
        },
      ],
      members,
      recommendations,
      aiInsights: aiInsights.map((insight) => ({
        title: insight.title,
        detail: insight.content,
        time: formatRelativeDate(insight.createdAt),
      })),
    };
  });
}

export async function getCustomersData(): Promise<CustomersData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const customers = await prisma.customer.findMany({
      where: { workspaceId: workspace.id },
      include: {
        bookings: {
          orderBy: { startsAt: "desc" },
          take: 3,
        },
        invoices: {
          orderBy: [{ createdAt: "desc" }],
          take: 3,
        },
        aiInsights: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        conversations: {
          orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
          take: 3,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
      },
      orderBy: [{ score: "desc" }, { revenueGenerated: "desc" }],
      take: 6,
    });

    if (customers.length === 0) {
      return null;
    }

  const featured = customers[0];
  const healthMap: Record<CustomerHealth, string> = {
    HEALTHY: "Stabil",
    WATCH: "Bevaka",
    AT_RISK: "Risk",
    UPSELL: "Upsell",
  };
    const bookingStatusMap: Record<BookingStatus, string> = {
      DRAFT: "Utkast",
      CONFIRMED: "Bekräftad",
      NEEDS_REMINDER: "Behöver påminnelse",
      COMPLETED: "Slutförd",
      CANCELLED: "Avbokad",
    };
    const invoiceStatusMap: Record<InvoiceStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      PAID: "Betald",
      OVERDUE: "Förfallen",
      VOID: "Makulerad",
    };
    const quoteStatusMap: Record<QuoteStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      VIEWED: "Oppnad",
      APPROVED: "Godkand",
      REJECTED: "Avbojd",
      EXPIRED: "Utgangen",
    };
    const channelMap: Record<ConversationChannel, string> = {
      EMAIL: "E-post",
      SMS: "SMS",
      WHATSAPP: "WhatsApp",
      MESSENGER: "Messenger",
      INSTAGRAM: "Instagram",
      PHONE: "Telefonsamtal",
    };
    const sentimentMap: Record<ConversationSentiment, string> = {
      POSITIVE: "Positiv ton",
      NEUTRAL: "Neutral ton",
      NEGATIVE: "Negativ ton",
    };

    const healthCounts = customers.reduce(
      (acc, customer) => {
        acc[customer.health] = (acc[customer.health] ?? 0) + 1;
        return acc;
      },
      {} as Record<CustomerHealth, number>,
    );

    const nextBooking = featured.bookings.find((booking) => booking.startsAt >= now) ?? null;
    const unpaidInvoices = featured.invoices.filter(
      (invoice) => invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE,
    );
    const unpaidInvoiceAmount = unpaidInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.amount),
      0,
    );
    const latestConversation = featured.conversations[0] ?? null;
    const latestActivity = featured.activityLogs[0] ?? null;
    const nextSteps = [
      featured.health === CustomerHealth.UPSELL
        ? "Planera ett konkret upsell-samtal medan relationen ar stark."
        : null,
      featured.health === CustomerHealth.WATCH || featured.health === CustomerHealth.AT_RISK
        ? "Lagg in en manuell check-in for att sanka risken i relationen."
        : null,
      nextBooking
        ? `Bekrafta bokningen ${formatRelativeDate(nextBooking.startsAt)} och sakra uppfoljningen direkt efter besoket.`
        : null,
      unpaidInvoices.length > 0
        ? `Folj upp ${unpaidInvoices.length} oppna fakturor for att undvika stopp i nasta steg.`
        : null,
      !latestConversation
        ? "Starta en ny dialog for att fa igang en levande kundrelation i systemet."
        : null,
    ].filter(Boolean) as string[];

    return {
      featuredCustomer: {
        id: featured.id,
        name: featured.companyName,
        contact: featured.contactName
          ? `Huvudkontakt: ${featured.contactName}`
          : "Ingen huvudkontakt satt",
        health: healthMap[featured.health],
        score: featured.score,
        revenue: formatCurrency(toNumber(featured.revenueGenerated)),
        bookings: `${featured.bookings.length}`,
        lastReply: featured.conversations[0]?.lastMessageAt
          ? featured.conversations[0].lastMessageAt!.toLocaleDateString("sv-SE")
          : "Ingen dialog ännu",
        summary:
          featured.aiInsights[0]?.content ??
          "Kundprofilen saknar ännu AI-sammanfattning.",
        nextSteps:
          nextSteps.length > 0
            ? nextSteps.slice(0, 3)
            : ["Oppna kundprofilen och skapa forsta aktivitet, dialog eller bokning for att driva relationen framat."],
        bookingItems: featured.bookings.map((booking) => ({
          id: booking.id,
          title: booking.title,
          meta: `${bookingStatusMap[booking.status]} · ${booking.startsAt.toLocaleString("sv-SE", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          detail:
            booking.location?.trim() ||
            booking.notes?.trim() ||
            "Ingen plats eller intern notering angiven for bokningen.",
        })),
        invoiceItems: featured.invoices.map((invoice) => ({
          id: invoice.id,
          title: `${invoice.invoiceNumber} · ${formatCurrency(toNumber(invoice.amount))}`,
          meta:
            invoice.dueDate != null
              ? `${invoiceStatusMap[invoice.status]} · Forfaller ${invoice.dueDate.toLocaleDateString("sv-SE")}`
              : invoiceStatusMap[invoice.status],
          detail:
            invoice.status === InvoiceStatus.PAID
              ? "Betalningen ar registrerad och relationen kan fortsatta utan ekonomisk friktion."
              : invoice.status === InvoiceStatus.OVERDUE
                ? "Fakturan ar forfallen och bor foljas upp innan nasta leveranssteg."
                : invoice.status === InvoiceStatus.SENT
                  ? "Fakturan ar skickad och invantar betalning eller manuell uppfoljning."
                  : "Fakturan ar i forberedande lage och bor granskas innan den skickas.",
          tone:
            invoice.status === InvoiceStatus.PAID
              ? "emerald"
              : invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE
                ? "amber"
                : "slate",
        })),
        conversationItems: featured.conversations.map((conversation) => ({
          id: conversation.id,
          title: conversation.subject?.trim() || `${channelMap[conversation.channel]} med ${featured.companyName}`,
          meta: `${channelMap[conversation.channel]} · ${formatRelativeDate(
            conversation.lastMessageAt ?? conversation.updatedAt,
          )}`,
          detail: sentimentMap[conversation.sentiment],
        })),
        noteItems: [
          featured.notes?.trim()
            ? {
                title: "Intern anteckning",
                detail: featured.notes.trim(),
              }
            : null,
          featured.aiInsights[0]?.content
            ? {
                title: "Senaste AI-sammanfattning",
                detail: featured.aiInsights[0].content,
              }
            : null,
          [featured.contactName, featured.email, featured.phone].some(Boolean)
            ? {
                title: "Kontaktuppgifter",
                detail: [featured.contactName, featured.email, featured.phone].filter(Boolean).join(" · "),
              }
            : null,
        ].filter(Boolean) as Array<{ title: string; detail: string }>,
        operationsItems: [
          nextBooking
            ? {
                title: "Nasta bokning",
                text: `${nextBooking.title} ar ${bookingStatusMap[nextBooking.status].toLowerCase()} och ligger ${formatRelativeDate(nextBooking.startsAt)}.`,
              }
            : null,
          unpaidInvoices.length > 0
            ? {
                title: "Oppna fakturor",
                text: `${unpaidInvoices.length} fakturor motsvarar ${formatCurrency(unpaidInvoiceAmount)} som fortfarande kraver uppfoljning.`,
              }
            : null,
          latestActivity
            ? {
                title: "Senaste aktivitet",
                text: `${latestActivity.title}: ${latestActivity.detail}`,
              }
            : null,
          latestConversation
            ? {
                title: "Senaste dialog",
                text: `${channelMap[latestConversation.channel]} med ${sentimentMap[latestConversation.sentiment].toLowerCase()}.`,
              }
            : null,
        ].filter(Boolean) as Array<{ title: string; text: string }>,
        quickActions: [
          {
            label: "Oppna full profil",
            href: `/kunder/${featured.id}`,
          },
          {
            label: "Visa bokningar",
            href: "/bokningar",
          },
          unpaidInvoices.length > 0
            ? {
                label: "Folj fakturor",
                href: "/fakturering",
              }
            : null,
          {
            label: "Be AI sammanfatta kunden",
            href: "/ai-assistent",
          },
        ].filter(Boolean) as Array<{ label: string; href: string }>,
      },
      customers: customers.slice(0, 3).map((customer) => ({
        id: customer.id,
        name: customer.companyName,
        score: customer.score,
        revenue: formatCurrency(toNumber(customer.revenueGenerated)),
        health: healthMap[customer.health],
        summary:
          customer.aiInsights[0]?.content ??
          "AI-sammanfattning byggs när mer aktivitet kommer in.",
      })),
      timeline: featured.activityLogs.map((activity) => ({
        title: activity.title,
        detail: activity.detail,
        time: formatRelativeDate(activity.createdAt),
      })),
      healthSummary: [
        {
          title: "Stabila konton",
          value: `${healthCounts.HEALTHY ?? 0}`,
          note: "Relationer med låg risk och hög stabilitet.",
        },
        {
          title: "Konton att bevaka",
          value: `${(healthCounts.WATCH ?? 0) + (healthCounts.AT_RISK ?? 0)}`,
          note: "Kunder som kräver mänsklig uppföljning.",
        },
        {
          title: "Redo för upsell",
          value: `${healthCounts.UPSELL ?? 0}`,
          note: "Kunder med stark relation och tillväxtpotential.",
        },
      ],
    };
  });
}

export async function getQuotesData(): Promise<QuotesData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const [quotes, customers] = await Promise.all([
      prisma.quote.findMany({
        where: { workspaceId: workspace.id },
        include: {
          customer: true,
          createdBy: true,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 12,
      }),
      prisma.customer.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ companyName: "asc" }],
        select: {
          id: true,
          companyName: true,
        },
      }),
    ]);

    const quoteStatusMap: Record<QuoteStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      VIEWED: "Oppnad",
      APPROVED: "Godkand",
      REJECTED: "Avbojd",
      EXPIRED: "Utgangen",
    };

    return {
      statusCards: [
        {
          label: "Utkast",
          value: `${quotes.filter((quote) => quote.status === QuoteStatus.DRAFT).length}`,
          note: "Offerter som fortfarande arbetas fram internt.",
          tone: "slate",
        },
        {
          label: "Skickade",
          value: `${quotes.filter((quote) => quote.status === QuoteStatus.SENT || quote.status === QuoteStatus.VIEWED).length}`,
          note: "Offerter ute hos kund som kraver uppfoljning eller beslut.",
          tone: "amber",
        },
        {
          label: "Godkanda",
          value: `${quotes.filter((quote) => quote.status === QuoteStatus.APPROVED).length}`,
          note: "Redo att omsattas till bokning, leverans eller fakturering.",
          tone: "emerald",
        },
        {
          label: "Riskzon",
          value: `${quotes.filter((quote) => quote.status === QuoteStatus.REJECTED || quote.status === QuoteStatus.EXPIRED).length}`,
          note: "Offerter som tappat momentum eller kraver ny forankring.",
          tone: "rose",
        },
      ],
      quotes: quotes.map((quote) => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        customerId: quote.customerId,
        customerName: quote.customer.companyName,
        title: quote.title,
        amount: formatCurrency(toNumber(quote.amount)),
        state: quoteStatusMap[quote.status],
        validUntil: quote.validUntil
          ? quote.validUntil.toLocaleDateString("sv-SE")
          : "Ingen sista dag",
        owner:
          [quote.createdBy?.firstName, quote.createdBy?.lastName].filter(Boolean).join(" ") ||
          "Ej tilldelad",
        note:
          quote.description?.trim() ||
          (quote.status === QuoteStatus.APPROVED
            ? "Godkand offert som bor flyttas vidare till drift och ekonomi."
            : quote.status === QuoteStatus.VIEWED
              ? "Kunden har oppnat offerten. Lagg en aktiv uppfoljning nu."
              : quote.status === QuoteStatus.SENT
                ? "Offerten ar skickad och invantar respons."
                : quote.status === QuoteStatus.REJECTED
                  ? "Offerten blev avbojd och bor analyseras for nasta forsok."
                  : quote.status === QuoteStatus.EXPIRED
                    ? "Giltighetstiden har passerat och offerten bor fornyas eller stangas."
                    : "Finslipa scope, pris och nasta steg innan offerten skickas."),
      })),
      customerOptions: customers.map((customer) => ({
        id: customer.id,
        label: customer.companyName,
      })),
      suggestions: [
        "Folj upp oppnade offerter inom 24 timmar medan intresset ar varmt.",
        "Skapa bokning eller faktura direkt nar en offert blivit godkand.",
        "Analysera avbojda offerter for att hitta pris- eller scopeglapp.",
      ],
      principles: [
        "Varje offert ska ha tydlig agare, giltighetstid och nasta steg.",
        "Skickad offert ar inte slutet pa saljflodet utan starten pa uppfoljningen.",
        "Godkanda offerter ska snabbt overlamnas till bokning, leverans eller fakturering.",
      ],
    };
  });
}

export type PipelineData = {
  stages: Array<{
    title: string;
    stageKey: LeadStatus;
    value: string;
    deals: Array<{
      id: string;
      name: string;
      value: string;
      score: number;
      status: string;
      nextAction: string;
      owner: string;
      latestActivity: string;
      note: string;
    }>;
  }>;
};

export async function getPipelineData(): Promise<PipelineData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const leads = await prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        owner: true,
        aiInsights: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ status: "asc" }, { score: "desc" }, { updatedAt: "desc" }],
    });

    const stageOrder = [
      LeadStatus.NEW,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL,
      LeadStatus.WON,
      LeadStatus.LOST,
    ] as const;

    const stageTitleMap: Record<(typeof stageOrder)[number], string> = {
      NEW: "Ny",
      QUALIFIED: "Kontaktad",
      PROPOSAL: "Offert skickad",
      WON: "Bokad",
      LOST: "Förlorad",
    };

    const leadStateMap: Record<(typeof stageOrder)[number], string> = {
      NEW: "Ny kontakt",
      QUALIFIED: "I dialog",
      PROPOSAL: "Inväntar beslut",
      WON: "Vunnen",
      LOST: "Förlorad",
    };

    return {
      stages: stageOrder
        .map((status) => {
          const stageLeads = leads.filter((lead) => lead.status === status);

          return {
            title: stageTitleMap[status],
            stageKey: status,
            value: formatCurrency(
              stageLeads.reduce(
                (sum, lead) => sum + toNumber(lead.estimatedValue),
                0,
              ),
            ),
            deals: stageLeads.map((lead) => ({
              id: lead.id,
              name: lead.companyName,
              value: formatCurrency(toNumber(lead.estimatedValue)),
              score: lead.score,
              status: leadStateMap[status],
              nextAction: lead.nextAction ?? "Definiera nästa steg",
              owner: lead.owner?.firstName ?? "Ej tilldelad",
              latestActivity: formatRelativeDate(
                lead.lastContactAt ?? lead.updatedAt ?? lead.createdAt,
              ),
              note:
                lead.aiInsights[0]?.content ??
                lead.source ??
                "Ingen AI-insikt ännu. Fortsatt aktivitet bygger bättre coachning.",
            })),
          };
        })
        .filter((stage) => stage.deals.length > 0),
    };
  });
}

export type CustomerDetailData = {
  id: string;
  name: string;
  contact: string;
  contactEmail: string;
  contactPhone: string;
  health: string;
  score: number;
  revenue: string;
  bookingsCount: string;
  invoicesCount: string;
  openTasksCount: string;
  lastReply: string;
  summary: string;
  notes: string;
  stats: Array<{ label: string; value: string }>;
  timeline: Array<{ title: string; detail: string; time: string }>;
  bookings: Array<{
    id: string;
    title: string;
    time: string;
    status: string;
    owner: string;
    location: string;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    amount: string;
    status: string;
    due: string;
  }>;
  conversations: Array<{
    id: string;
    channel: string;
    subject: string;
    sentiment: string;
    lastMessage: string;
    preview: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    due: string;
  }>;
  quotes: Array<{
    id: string;
    title: string;
    number: string;
    amount: string;
    status: string;
    validUntil: string;
  }>;
  documents: string[];
  nextActions: string[];
};

export async function getCustomerDetailData(
  customerId: string,
): Promise<CustomerDetailData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const customer = await prisma.customer.findFirst({
      where: {
        workspaceId: workspace.id,
        id: customerId,
      },
      include: {
        bookings: {
          include: {
            assignedTo: true,
          },
          orderBy: { startsAt: "desc" },
          take: 6,
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { lastMessageAt: "desc" },
          take: 6,
        },
        aiInsights: {
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        tasks: {
          where: {
            status: {
              in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
            },
          },
          orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
          take: 6,
        },
      },
    });

    if (!customer) {
      return null;
    }

    const healthMap: Record<CustomerHealth, string> = {
      HEALTHY: "Stabil",
      WATCH: "Bevaka",
      AT_RISK: "Risk",
      UPSELL: "Upsell",
    };

    const bookingStatusMap: Record<BookingStatus, string> = {
      DRAFT: "Utkast",
      CONFIRMED: "Bekräftad",
      NEEDS_REMINDER: "Behöver påminnelse",
      COMPLETED: "Slutförd",
      CANCELLED: "Avbokad",
    };

    const invoiceStatusMap: Record<InvoiceStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      PAID: "Betald",
      OVERDUE: "Förfallen",
      VOID: "Makulerad",
    };
    const quoteStatusMap: Record<QuoteStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      VIEWED: "Oppnad",
      APPROVED: "Godkand",
      REJECTED: "Avbojd",
      EXPIRED: "Utgangen",
    };

    const timeline = customer.activityLogs.slice(0, 8).map((activity) => ({
      title: activity.title,
      detail: activity.detail,
      time: formatRelativeDate(activity.createdAt),
    }));

    return {
      id: customer.id,
      name: customer.companyName,
      contact: customer.contactName ?? "Ingen huvudkontakt satt",
      contactEmail: customer.email ?? "Ingen e-post registrerad",
      contactPhone: customer.phone ?? "Inget telefonnummer registrerat",
      health: healthMap[customer.health],
      score: customer.score,
      revenue: formatCurrency(toNumber(customer.revenueGenerated)),
      bookingsCount: `${customer.bookings.length}`,
      invoicesCount: `${customer.invoices.length}`,
      openTasksCount: `${customer.tasks.length}`,
      lastReply: customer.conversations[0]?.lastMessageAt
        ? formatRelativeDate(customer.conversations[0].lastMessageAt)
        : "Ingen dialog ännu",
      summary:
        customer.aiInsights[0]?.content ??
        "Kundprofilen får djupare AI-sammanfattning när mer aktivitet kommer in.",
      notes: customer.notes ?? "",
      stats: [
        { label: "Intäkter", value: formatCurrency(toNumber(customer.revenueGenerated)) },
        { label: "Bokningar", value: `${customer.bookings.length}` },
        { label: "Fakturor", value: `${customer.invoices.length}` },
        { label: "Offerter", value: `${customer.quotes.length}` },
      ],
      timeline,
      bookings: customer.bookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        time: `${booking.startsAt.toLocaleDateString("sv-SE")} · ${booking.startsAt.toLocaleTimeString(
          "sv-SE",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )}`,
        status: bookingStatusMap[booking.status],
        owner: booking.assignedTo?.firstName ?? "Ej tilldelad",
        location: booking.location ?? "Plats saknas",
      })),
      invoices: customer.invoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.invoiceNumber,
        amount: formatCurrency(toNumber(invoice.amount)),
        status: invoiceStatusMap[invoice.status],
        due: invoice.dueDate
          ? invoice.dueDate.toLocaleDateString("sv-SE")
          : "Ingen förfallodag",
      })),
      conversations: customer.conversations.map((conversation) => ({
        id: conversation.id,
        channel: conversation.channel.toLowerCase(),
        subject: conversation.subject ?? "Ingen ämnesrad",
        sentiment:
          conversation.sentiment === "POSITIVE"
            ? "Positiv"
            : conversation.sentiment === "NEGATIVE"
              ? "Negativ"
              : "Neutral",
        lastMessage: formatRelativeDate(conversation.lastMessageAt),
        preview:
          conversation.messages[0]?.body ??
          "Ingen meddelandehistorik tillgänglig ännu.",
      })),
      tasks: customer.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status === TaskStatus.IN_PROGRESS ? "Pågår" : "Att göra",
        priority: task.priority === "HIGH" ? "Hög" : task.priority === "LOW" ? "Låg" : "Medium",
        due: task.dueAt ? task.dueAt.toLocaleDateString("sv-SE") : "Ingen deadline",
      })),
      quotes: customer.quotes.map((quote) => ({
        id: quote.id,
        title: quote.title,
        number: quote.quoteNumber,
        amount: formatCurrency(toNumber(quote.amount)),
        status: quoteStatusMap[quote.status],
        validUntil: quote.validUntil
          ? quote.validUntil.toLocaleDateString("sv-SE")
          : "Ingen sista dag",
      })),
      documents: [
        ...customer.invoices.slice(0, 2).map((invoice) => `Faktura ${invoice.invoiceNumber}`),
        ...customer.bookings.slice(0, 2).map((booking) => `Underlag: ${booking.title}`),
      ].slice(0, 4),
      nextActions:
        customer.aiInsights.length > 0
          ? customer.aiInsights.slice(0, 3).map((insight) => insight.content)
          : customer.quotes.length > 0
            ? [
                "Folj upp senaste offerten med ett tydligt beslutssteg och ansvarig agare.",
                "Koppla godkanda offerter till bokning eller fakturering direkt i nasta steg.",
                "Analysera om scope eller pris behover justeras innan nasta kunddialog.",
              ]
            : [
                "Lägg in en personlig check-in för att stärka relationen.",
                "Koppla nästa bokning till tydlig uppföljning efter genomförande.",
                "Skapa ett återkommande erbjudande om kunden visar stabil användning.",
              ],
    };
  });
}

export type BookingsData = {
  stats: Array<{ label: string; value: string; note: string }>;
  bookings: Array<{
    customer: string;
    time: string;
    status: string;
    owner: string;
    detail: string;
  }>;
};

export async function getBookingsData(): Promise<BookingsData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const bookings = await prisma.booking.findMany({
      where: { workspaceId: workspace.id },
      include: {
        customer: true,
        assignedTo: true,
        aiInsights: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { startsAt: "asc" },
      take: 8,
    });

  const statusMap: Record<BookingStatus, string> = {
    DRAFT: "Utkast",
    CONFIRMED: "Bekräftad",
    NEEDS_REMINDER: "Behöver påminnelse",
    COMPLETED: "Slutförd",
    CANCELLED: "Avbokad",
  };

    return {
      stats: [
        {
          label: "Bokningar idag",
          value: `${bookings.length}`,
          note: "Bygger på kommande bokningar i databasen.",
        },
        {
          label: "Fyllnadsgrad",
          value: `${Math.min(100, bookings.length * 12)}%`,
          note: "En enkel kapacitetsindikator utifrån antal planerade jobb.",
        },
        {
          label: "Team i fält",
          value: `${new Set(bookings.map((booking) => booking.assignedToId).filter(Boolean)).size}`,
          note: "Antal användare som är kopplade till bokningar.",
        },
      ],
      bookings: bookings.slice(0, 3).map((booking) => ({
        customer: booking.customer?.companyName ?? booking.title,
        time: `${booking.startsAt.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${booking.endsAt.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        status: statusMap[booking.status],
        owner: booking.assignedTo?.firstName ?? "Ej tilldelad",
        detail:
          booking.aiInsights[0]?.content ??
          booking.notes ??
          "Ingen extra kommentar ännu.",
      })),
    };
  });
}

export type TasksData = {
  stats: Array<{ label: string; value: string; note: string }>;
  tasks: Array<{
    id: string;
    title: string;
    context: string;
    priority: string;
    due: string;
    customerId?: string;
    customerName?: string;
  }>;
  aiFocus: string[];
};

export async function getTasksData(): Promise<TasksData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const [openTasks, completedTodayCount] = await Promise.all([
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        },
        include: {
          customer: true,
          lead: true,
          booking: true,
        },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "desc" }],
        take: 16,
      }),
      prisma.task.count({
        where: {
          workspaceId: workspace.id,
          status: TaskStatus.DONE,
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const overdueCount = openTasks.filter(
      (task) => task.dueAt && task.dueAt.getTime() < Date.now(),
    ).length;

    const priorityMap: Record<TaskPriority, string> = {
      LOW: "Låg",
      MEDIUM: "Medium",
      HIGH: "Hög",
      URGENT: "Akut",
    };

    const aiFocus = openTasks.slice(0, 3).map((task) => {
      const taskTarget =
        task.customer?.companyName ??
        task.lead?.companyName ??
        task.booking?.title ??
        "arbetsytan";

      if (task.priority === TaskPriority.URGENT || task.priority === TaskPriority.HIGH) {
        return `Börja med ${task.title}. Den påverkar ${taskTarget} och ligger högt i prioritet.`;
      }

      if (task.dueAt) {
        return `Planera ${task.title} innan ${task.dueAt.toLocaleDateString("sv-SE")} för att hålla flödet mot ${taskTarget}.`;
      }

      return `Ge ${task.title} en tydlig tid i dag så att nästa steg för ${taskTarget} inte tappas bort.`;
    });

    return {
      stats: [
        {
          label: "Öppna nu",
          value: `${openTasks.length}`,
          note: "Aktiva uppgifter från databasen i arbetsytan.",
        },
        {
          label: "Klart idag",
          value: `${completedTodayCount}`,
          note: "Uppgifter som markerats klara sedan midnatt.",
        },
        {
          label: "Försenade",
          value: `${overdueCount}`,
          note: "Öppna uppgifter där deadline redan har passerat.",
        },
        {
          label: "AI-fokus",
          value: `${Math.min(5, Math.max(aiFocus.length, 1))}`,
          note: "Prioriterade rekommendationer baserat på verkliga uppgifter.",
        },
      ],
      tasks: openTasks.map((task) => {
        const contextParts = [
          task.customer ? `Kund · ${task.customer.companyName}` : null,
          task.lead ? `Lead · ${task.lead.companyName}` : null,
          task.booking ? `Bokning · ${task.booking.title}` : null,
          task.description ?? null,
        ].filter(Boolean);

        return {
          id: task.id,
          title: task.title,
          context:
            contextParts[0] ??
            "Intern aktivitet",
          priority: priorityMap[task.priority],
          due: task.dueAt
            ? formatRelativeDate(task.dueAt)
            : "Ingen deadline",
          customerId: task.customerId ?? undefined,
          customerName: task.customer?.companyName ?? undefined,
        };
      }),
      aiFocus:
        aiFocus.length > 0
          ? aiFocus
          : [
              "Börja med det som påverkar kundrelation eller intäkt först.",
              "Sätt en tydlig deadline på nya aktiviteter för bättre tempo.",
              "Låt inte interna adminsteg blockera uppföljning mot kund.",
            ],
    };
  });
}

export type ConversationsData = {
  threads: Array<{
    id: string;
    customer: string;
    channel: string;
    summary: string;
    mood: string;
    action: string;
    customerId?: string;
  }>;
  aiSummary: string[];
  channelStats: Array<{
    label: string;
    value: string;
  }>;
};

export async function getConversationsData(): Promise<ConversationsData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const threads = await prisma.conversationThread.findMany({
      where: { workspaceId: workspace.id },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 12,
    });

    const channelMap: Record<ConversationChannel, string> = {
      EMAIL: "E-post",
      SMS: "SMS",
      WHATSAPP: "WhatsApp",
      MESSENGER: "Messenger",
      INSTAGRAM: "Instagram",
      PHONE: "Samtal",
    };

    const moodMap: Record<ConversationSentiment, string> = {
      POSITIVE: "Positiv",
      NEUTRAL: "Neutral",
      NEGATIVE: "Osäker",
    };

    const emailCount = threads.filter((thread) => thread.channel === ConversationChannel.EMAIL).length;
    const chatCount = threads.filter(
      (thread) =>
        thread.channel === ConversationChannel.SMS ||
        thread.channel === ConversationChannel.WHATSAPP ||
        thread.channel === ConversationChannel.MESSENGER ||
        thread.channel === ConversationChannel.INSTAGRAM,
    ).length;
    const callCount = threads.filter((thread) => thread.channel === ConversationChannel.PHONE).length;

    const aiSummary = threads.slice(0, 3).map((thread) => {
      const name = thread.customer?.companyName ?? "kunden";
      const latest = thread.messages[0]?.body ?? "Ingen senaste dialog tillgänglig.";

      if (thread.sentiment === ConversationSentiment.NEGATIVE) {
        return `${name} behöver mänsklig uppföljning snart. Senaste signalen var: "${latest}"`;
      }

      if (thread.channel === ConversationChannel.EMAIL) {
        return `${name} ligger i e-postflödet. Håll svaret kort och tydligt med nästa steg.`;
      }

      return `${name} har ny aktivitet i ${channelMap[thread.channel].toLowerCase()}. Följ upp medan dialogen fortfarande är varm.`;
    });

    return {
      threads: threads.map((thread) => {
        const latestPreview =
          thread.messages[0]?.body ?? "Ingen meddelandehistorik tillgänglig ännu.";
        const action =
          thread.sentiment === ConversationSentiment.NEGATIVE
            ? "Följ upp personligt"
            : thread.lastMessageAt &&
                Date.now() - thread.lastMessageAt.getTime() < 1000 * 60 * 60 * 24
              ? "Svara i dag"
              : "Bekräfta nästa steg";

        return {
          id: thread.id,
          customer: thread.customer?.companyName ?? "Okänd kund",
          channel: channelMap[thread.channel],
          summary: latestPreview,
          mood: moodMap[thread.sentiment],
          action,
          customerId: thread.customerId ?? undefined,
        };
      }),
      aiSummary:
        aiSummary.length > 0
          ? aiSummary
          : [
              "2 dialoger behöver svar i dag för att inte tappa fart.",
              "Korta och tydliga svar med nästa steg fungerar bäst i aktiva trådar.",
              "Osäkra kunder bör få mänsklig uppföljning före automation.",
            ],
      channelStats: [
        { label: "E-post", value: `${emailCount}` },
        { label: "Chatt", value: `${chatCount}` },
        { label: "Samtal", value: `${callCount}` },
      ],
    };
  });
}

export type BillingData = {
  overview: Array<{ label: string; value: string; note: string }>;
  invoices: Array<{
    id: string;
    customer: string;
    date: string;
    total: string;
    state: string;
  }>;
  paymentMethod: {
    label: string;
    note: string;
  };
  billingSignals: string[];
  nextSteps: string[];
  trustNotes: string[];
  customerOptions: Array<{ id: string; label: string }>;
};

export async function getBillingData(): Promise<BillingData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const [recentInvoices, customerOptions, activeUsers] = await Promise.all([
      prisma.invoice.findMany({
        where: { workspaceId: workspace.id },
        include: { customer: true },
        orderBy: [{ createdAt: "desc" }],
        take: 8,
      }),
      prisma.customer.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { companyName: "asc" },
        select: {
          id: true,
          companyName: true,
        },
      }),
      prisma.user.count({
        where: { workspaceId: workspace.id },
      }),
    ]);

    const statusMap: Record<InvoiceStatus, string> = {
      DRAFT: "Utkast",
      SENT: "Skickad",
      PAID: "Betald",
      OVERDUE: "Försenad",
      VOID: "Makulerad",
    };

    const nextDueInvoice = recentInvoices.find(
      (invoice) => invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE,
    );

    const paidCount = recentInvoices.filter((invoice) => invoice.status === InvoiceStatus.PAID).length;
    const overdueCount = recentInvoices.filter(
      (invoice) => invoice.status === InvoiceStatus.OVERDUE,
    ).length;

    return {
      overview: [
        {
          label: "Plan",
          value: workspace.plan,
          note: "Aktuell arbetsyta och abonnemangsplan.",
        },
        {
          label: "Nästa förfallo",
          value: nextDueInvoice?.dueDate
            ? nextDueInvoice.dueDate.toLocaleDateString("sv-SE")
            : "Ingen öppen",
          note: nextDueInvoice
            ? `${nextDueInvoice.invoiceNumber} väntar på betalning.`
            : "Inga öppna kundfakturor just nu.",
        },
        {
          label: "Aktiva användare",
          value: `${activeUsers}`,
          note: "Användare kopplade till arbetsytan.",
        },
      ],
      invoices: recentInvoices.map((invoice) => ({
        id: invoice.invoiceNumber,
        customer: invoice.customer?.companyName ?? "Intern faktura",
        date: invoice.createdAt.toLocaleDateString("sv-SE"),
        total: formatCurrency(toNumber(invoice.amount)),
        state: statusMap[invoice.status],
      })),
      paymentMethod: {
        label: "Säker manuell betalhantering",
        note: "Kort- och abonnemangsdetaljer är ännu inte kopplade till extern betalleverantör.",
      },
      billingSignals: [
        `${paidCount} fakturor är markerade som betalda i arbetsytan.`,
        overdueCount > 0
          ? `${overdueCount} fakturor är försenade och bör följas upp nu.`
          : "Inga försenade fakturor just nu.",
        "Fakturering hämtar nu verklig kund- och fakturadata från databasen.",
      ],
      nextSteps: [
        "Skapa nästa faktura direkt från denna vy när ett jobb är klart.",
        "Följ upp skickade eller försenade fakturor innan de påverkar kassaflödet.",
        "Använd kundprofilerna för att se fakturahistorik per relation.",
      ],
      trustNotes: [
        "Alla fakturor är isolerade per workspace.",
        "Status och belopp läses från verkliga poster i databasen.",
        "Nästa steg är extern betalprovider och automatiska påminnelser.",
      ],
      customerOptions: customerOptions.map((customer) => ({
        id: customer.id,
        label: customer.companyName,
      })),
    };
  });
}

export type AutomationData = {
  flows: Array<{
    id: string;
    name: string;
    trigger: string;
    action: string;
    state: string;
    description: string;
  }>;
  stats: Array<{ label: string; value: string }>;
  suggestions: string[];
  principles: string[];
};

export async function getAutomationData(): Promise<AutomationData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const flows = await prisma.automationFlow.findMany({
      where: { workspaceId: workspace.id },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
    });

    const statusMap: Record<AutomationStatus, string> = {
      DRAFT: "Utkast",
      ACTIVE: "Aktiv",
      PAUSED: "Pausad",
      ARCHIVED: "Arkiverad",
    };

    const activeCount = flows.filter((flow) => flow.status === AutomationStatus.ACTIVE).length;
    const aiCount = flows.filter(
      (flow) =>
        flow.actionType.toLowerCase().includes("ai") ||
        flow.description?.toLowerCase().includes("ai"),
    ).length;

    return {
      flows: flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        trigger: flow.triggerType,
        action: flow.actionType,
        state: statusMap[flow.status],
        description: flow.description ?? "Ingen extra beskrivning ännu.",
      })),
      stats: [
        { label: "Aktiva", value: `${activeCount}` },
        { label: "AI-flöden", value: `${aiCount}` },
        { label: "Sparade steg", value: `${flows.length}` },
      ],
      suggestions: [
        "Skapa ett flöde för leads som inte svarar inom 48 timmar.",
        "Automatisera påminnelser dagen före bokning.",
        "Starta återaktivering för kunder utan aktivitet senaste 30 dagarna.",
      ],
      principles: [
        "Varje automation ska ha tydlig trigger, åtgärd och affärsnytta.",
        "Flöden ska vara enkla att förstå för hela teamet.",
        "Automation ska stötta mänskligt arbete, inte dölja det.",
      ],
    };
  });
}

export type AIAssistantData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    watchLabel: string;
    primaryCommand: {
      label: string;
      prompt: string;
    };
    secondaryCommands: Array<{
      label: string;
      prompt: string;
    }>;
    statusChips: Array<{
      label: string;
      value: string;
      tone: "emerald" | "amber" | "violet" | "slate";
    }>;
  };
  quickRunCommands: Array<{
    label: string;
    detail: string;
    prompt: string;
    tone: "emerald" | "amber" | "violet" | "slate";
  }>;
  watchlist: Array<{
    title: string;
    detail: string;
    href: string;
    tone: "rose" | "amber" | "emerald" | "slate";
  }>;
  workflowCards: Array<{
    title: string;
    detail: string;
    cta: string;
    href: string;
    prompt: string;
    tone: "emerald" | "amber" | "violet";
  }>;
  contextStats: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  contextNarrative: string[];
  memoryFeed: Array<{
    title: string;
    detail: string;
    time: string;
    type: string;
  }>;
  recentInsights: Array<{
    id: string;
    title: string;
    preview: string;
    time: string;
    type: string;
    automationCreated: boolean;
  }>;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    text: string;
  }>;
  openAIConfigured: boolean;
  latestInsight?: {
    id: string;
    title: string;
    preview: string;
    time: string;
    type: string;
    automationCreated: boolean;
  };
};

export async function getAIAssistantData(): Promise<AIAssistantData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const [insights, leads, customers, bookings, tasks, invoices, automations, activities] =
      await Promise.all([
        prisma.aIInsight.findMany({
          where: {
            workspaceId: workspace.id,
            entityType: "WORKSPACE",
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
        prisma.lead.findMany({
          where: { workspaceId: workspace.id },
          orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
          take: 6,
          select: {
            id: true,
            companyName: true,
            status: true,
            score: true,
            probability: true,
            estimatedValue: true,
            nextAction: true,
            lastContactAt: true,
          },
        }),
        prisma.customer.findMany({
          where: { workspaceId: workspace.id },
          orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
          take: 5,
          select: {
            id: true,
            companyName: true,
            score: true,
            health: true,
            revenueGenerated: true,
            updatedAt: true,
          },
        }),
        prisma.booking.findMany({
          where: {
            workspaceId: workspace.id,
            startsAt: { gte: new Date() },
          },
          orderBy: { startsAt: "asc" },
          take: 4,
          select: {
            id: true,
            title: true,
            startsAt: true,
            status: true,
            customer: { select: { companyName: true } },
            assignedTo: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.task.findMany({
          where: {
            workspaceId: workspace.id,
            status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
          },
          orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
          take: 6,
          select: {
            id: true,
            title: true,
            priority: true,
            dueAt: true,
            customer: { select: { companyName: true } },
            lead: { select: { companyName: true } },
          },
        }),
        prisma.invoice.findMany({
          where: { workspaceId: workspace.id },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          take: 4,
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            amount: true,
            dueDate: true,
            customer: { select: { companyName: true } },
          },
        }),
        prisma.automationFlow.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { updatedAt: "desc" },
          take: 4,
          select: {
            id: true,
            name: true,
            status: true,
            triggerType: true,
            actionType: true,
            updatedAt: true,
          },
        }),
        prisma.activityLog.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const healthMap: Record<CustomerHealth, string> = {
      HEALTHY: "Stabil",
      WATCH: "Bevaka",
      AT_RISK: "Risk",
      UPSELL: "Upsell",
    };
    const insightTypeMap: Record<AIInsightType, string> = {
      SUMMARY: "Sammanfattning",
      RISK: "Risk",
      UPSELL: "Mojlighet",
      NEXT_ACTION: "Nasta steg",
      ANALYTICS: "Analys",
      AUTOMATION: "Automation",
    };
    const bookingStatusMap: Record<BookingStatus, string> = {
      DRAFT: "Utkast",
      CONFIRMED: "Bekraftad",
      NEEDS_REMINDER: "Behov av paminnelse",
      COMPLETED: "Slutford",
      CANCELLED: "Avbokad",
    };

    const messages = insights
      .slice()
      .reverse()
      .flatMap((insight) => [
        {
          id: `${insight.id}-user`,
          role: "user" as const,
          text: insight.title,
        },
        {
          id: `${insight.id}-assistant`,
          role: "assistant" as const,
          text: insight.content,
        },
      ]);

    const latestInsight = insights[0]
      ? {
          id: insights[0].id,
          title: insights[0].title,
          preview: insights[0].content,
          time: formatRelativeDate(insights[0].createdAt),
          type: insightTypeMap[insights[0].type],
          automationCreated: Boolean(insights[0].automationId),
        }
      : undefined;

    const atRiskCustomers = customers.filter(
      (customer) =>
        customer.health === CustomerHealth.AT_RISK ||
        customer.health === CustomerHealth.WATCH,
    );
    const overdueInvoices = invoices.filter(
      (invoice) =>
        invoice.status === InvoiceStatus.OVERDUE ||
        (invoice.status === InvoiceStatus.SENT && invoice.dueDate && invoice.dueDate < now),
    );
    const urgentTasks = tasks.filter(
      (task) =>
        task.priority === TaskPriority.URGENT || task.priority === TaskPriority.HIGH,
    );
    const staleLeads = leads.filter(
      (lead) =>
        lead.status !== LeadStatus.WON &&
        lead.status !== LeadStatus.LOST &&
        (!lead.lastContactAt || lead.lastContactAt < twoDaysAgo),
    );
    const activeAutomations = automations.filter(
      (automation) => automation.status === AutomationStatus.ACTIVE,
    ).length;

    const watchCandidates: Array<AIAssistantData["watchlist"][number] & { rank: number }> = [
      ...overdueInvoices.map((invoice) => ({
        rank: 96,
        title: `Kassaflode riskerar att sacka i ${invoice.invoiceNumber}`,
        detail: `${invoice.customer?.companyName ?? "Okand kund"} har ${formatCurrency(toNumber(invoice.amount))} som behover foljas upp direkt.`,
        href: "/fakturering",
        tone: "rose" as const,
      })),
      ...atRiskCustomers.map((customer) => ({
        rank: customer.health === CustomerHealth.AT_RISK ? 92 : 78,
        title: `${customer.companyName} kraver relationsinsats`,
        detail: `${healthMap[customer.health]} med score ${customer.score}. AI bor planera en retention- eller check-in-sekvens nu.`,
        href: "/kunder",
        tone:
          customer.health === CustomerHealth.AT_RISK ? ("rose" as const) : ("amber" as const),
      })),
      ...staleLeads.map((lead) => ({
        rank: 74 + Math.round(lead.score / 8),
        title: `${lead.companyName} tappar momentum`,
        detail:
          lead.nextAction?.trim() ||
          `Leadet ar i steget ${lead.status.toLowerCase()} med ${formatCurrency(toNumber(lead.estimatedValue))} i potential och behov av nytt nasta steg.`,
        href: "/leads",
        tone: lead.score >= 80 ? ("amber" as const) : ("slate" as const),
      })),
      ...urgentTasks.slice(0, 2).map((task) => ({
        rank: task.priority === TaskPriority.URGENT ? 88 : 76,
        title: `Teamet blockerar pa ${task.title}`,
        detail: `${
          task.customer?.companyName ?? task.lead?.companyName ?? "Intern process"
        } krav ar fortfarande oppet och AI kan bryta ner det till tydligare arbetssteg.`,
        href: "/uppgifter",
        tone:
          task.priority === TaskPriority.URGENT ? ("rose" as const) : ("amber" as const),
      })),
      ...bookings.slice(0, 2).map((booking) => ({
        rank: booking.status === BookingStatus.NEEDS_REMINDER ? 75 : 60,
        title: `AI bevakar ${booking.customer?.companyName ?? booking.title}`,
        detail: `${booking.title} ar ${bookingStatusMap[booking.status].toLowerCase()} och sker ${formatRelativeDate(booking.startsAt)}.`,
        href: "/bokningar",
        tone:
          booking.status === BookingStatus.NEEDS_REMINDER
            ? ("amber" as const)
            : ("emerald" as const),
      })),
    ];

    const watchlist = watchCandidates
      .sort((left, right) => right.rank - left.rank)
      .slice(0, 5)
      .map(({ rank: _rank, ...item }) => item);

    const workflowCards: AIAssistantData["workflowCards"] = [
      {
        title: "Prioritera dagens kunddialoger",
        detail:
          atRiskCustomers[0]
            ? `Lat AI planera vilka dialoger som ska tas forst med ${atRiskCustomers[0].companyName} och ovriga relationer som ar i riskzonen.`
            : "Lat AI avgora vilka kunddialoger som fortjanar mest uppmarksamhet idag.",
        cta: "Kora retentionflode",
        href: "/kunder",
        prompt: atRiskCustomers[0]
          ? `Skapa en retention-plan for ${atRiskCustomers[0].companyName} och prioritera vilka kunddialoger teamet maste ta idag.`
          : "Prioritera dagens viktigaste kunddialoger och foresla en tydlig kontaktordning.",
        tone: "amber",
      },
      {
        title: "Orkestrera pipeline och leads",
        detail:
          staleLeads[0]
            ? `AI kan analysera varfor ${staleLeads[0].companyName} tappar fart och skapa nasta steg for liknande leads.`
            : "AI kan hitta flaskhalsar i pipelinen och skapa tydliga uppfoljningssteg.",
        cta: "Analysera pipeline",
        href: "/pipeline",
        prompt:
          staleLeads[0]
            ? `Identifiera vilka leads som riskerar att tappa momentum, inklusive ${staleLeads[0].companyName}, och foresla ett konkret uppfoljningsflode.`
            : "Identifiera flaskhalsar i pipeline och foresla tre operativa atgarder som okar rorelse.",
        tone: "violet",
      },
      {
        title: "Bygg AI-drivna workflows",
        detail:
          bookings[0]
            ? `Koppla bokningar, uppgifter och paminnelser till ett smart arbetsflode kring ${bookings[0].customer?.companyName ?? bookings[0].title}.`
            : "Lat AI skapa en ny automation som minskar manuellt arbete i vardagen.",
        cta: "Skapa workflow",
        href: "/automationer",
        prompt:
          bookings[0]
            ? `Foresla ett workflow som hanterar bokningen ${bookings[0].title}, tillhorande uppfoljning och eventuella paminnelser.`
            : "Foresla vilken automation som bor byggas forst i arbetsytan och varfor.",
        tone: "emerald",
      },
    ];

    const quickRunCommands: AIAssistantData["quickRunCommands"] = [
      {
        label: "Riskdetektion",
        detail: "Identifiera kunder, leads och fakturor som kraver direkt uppmarksamhet.",
        prompt: "Identifiera vilka kunder, leads eller fakturor som ar storst risk just nu och ge en prioriterad handlingslista.",
        tone: "amber",
      },
      {
        label: "Dagens fokus",
        detail: "Lat AI skapa dagens operativa plan utifran faktisk aktivitet i arbetsytan.",
        prompt: "Prioritera dagens viktigaste kunddialoger, uppgifter och bokningar i en operativ plan.",
        tone: "emerald",
      },
      {
        label: "Teamets belastning",
        detail: "Analysera vad teamet riskerar att fastna i och vad som bor automatiseras.",
        prompt: "Analysera teamets belastning och peka ut vilka arbetsmoment som bor automatiseras eller omfordelas.",
        tone: "violet",
      },
      {
        label: "Kassaflode",
        detail: "Be AI hitta stopp i fakturaflodet och foresla nasta steg.",
        prompt: "Analysera kassaflodesrisk utifran oppna och forfallna fakturor och ge tre tydliga nasta steg.",
        tone: "slate",
      },
    ];

    const recentInsights = insights.slice(0, 4).map((insight) => ({
      id: insight.id,
      title: insight.title,
      preview: insight.content,
      time: formatRelativeDate(insight.createdAt),
      type: insightTypeMap[insight.type],
      automationCreated: Boolean(insight.automationId),
    }));

    const memoryFeed: AIAssistantData["memoryFeed"] = [
      ...insights.slice(0, 3).map((insight) => ({
        title: insight.title,
        detail: insight.content.slice(0, 180),
        time: formatRelativeDate(insight.createdAt),
        type: insightTypeMap[insight.type],
      })),
      ...activities.slice(0, 3).map((activity) => ({
        title: activity.title,
        detail: activity.detail.slice(0, 180),
        time: formatRelativeDate(activity.createdAt),
        type: "Aktivitet",
      })),
    ]
      .sort((left, right) => (left.time < right.time ? 1 : -1))
      .slice(0, 6);

    const topLead = leads[0];
    const topCustomer = customers[0];
    const heroTitle =
      watchlist[0]?.title ??
      latestInsight?.title ??
      "AI ar redo att driva arbetsytan framåt";
    const heroSummary =
      watchlist.length > 0
        ? [
            `${watchlist.length} operativa signaler bevakas aktivt just nu.`,
            staleLeads.length > 0
              ? `${staleLeads.length} leads riskerar att tappa fart.`
              : "Leadflodet ar stabilt just nu.",
            overdueInvoices.length > 0
              ? `${overdueInvoices.length} fakturor skapar kassaflodesrisk.`
              : "Inga forfallna fakturor sticker ut just nu.",
          ].join(" ")
        : "AI-assistenten ar redo att lasa arbetsytan, prioritera arbete och skapa nasta steg sa snart mer signaldata finns.";
    const primaryPrompt =
      watchlist[0]?.tone === "rose"
        ? "Analysera de mest kritiska riskerna i arbetsytan och skapa en konkret handlingsplan for idag."
        : topLead
          ? `Identifiera vilka leads som riskerar att tappa momentum, inklusive ${topLead.companyName}, och foresla tydliga nasta steg.`
          : "Sammanfatta arbetsytan och foresla tre nasta steg som driver verksamheten framåt.";

    return {
      hero: {
        eyebrow: "AI-native workspace",
        title: heroTitle,
        summary: heroSummary,
        watchLabel:
          latestInsight?.time
            ? `AI uppdaterade senast ${latestInsight.time}`
            : "AI bevakar arbetsytan men invantar mer historik",
        primaryCommand: {
          label: "Kor dagens AI-plan",
          prompt: primaryPrompt,
        },
        secondaryCommands: [
          {
            label: "Analysera pipeline",
            prompt:
              topLead
                ? `Analysera pipelinen med fokus pa ${topLead.companyName} och vilka affarer som kravs for att skapa mer rorelse.`
                : "Analysera pipelinen och hitta flaskhalsar i dagens affarsflode.",
          },
          {
            label: "Prioritera kunder",
            prompt:
              topCustomer
                ? `Prioritera vilka kunder som kravs mest uppmarksamhet just nu, inklusive ${topCustomer.companyName}.`
                : "Prioritera vilka kunder som bor fa mest uppmarksamhet idag.",
          },
          {
            label: "Skapa workflow",
            prompt:
              "Foresla vilket workflow eller vilken automation som skulle ge mest effekt denna vecka.",
          },
        ],
        statusChips: [
          {
            label: "AI-minne",
            value: `${insights.length} sparade insikter`,
            tone: insights.length > 0 ? "emerald" : "slate",
          },
          {
            label: "Risksignaler",
            value: `${watchlist.filter((item) => item.tone === "rose").length}`,
            tone:
              watchlist.some((item) => item.tone === "rose") ? "amber" : "slate",
          },
          {
            label: "Workflows",
            value: `${activeAutomations} aktiva`,
            tone: activeAutomations > 0 ? "violet" : "slate",
          },
          {
            label: "Kontekst",
            value: `${leads.length + customers.length + tasks.length + bookings.length} signaler`,
            tone: "emerald",
          },
        ],
      },
      quickRunCommands,
      watchlist,
      workflowCards,
      contextStats: [
        {
          label: "Leads i minnet",
          value: `${leads.length}`,
          note: topLead
            ? `${topLead.companyName} ar starkast just nu`
            : "AI invantar fler affarssignaler",
        },
        {
          label: "Kundsignaler",
          value: `${customers.length}`,
          note: atRiskCustomers.length > 0
            ? `${atRiskCustomers.length} relationer ar i bevakning`
            : "Kundbasen ser stabil ut i nulaget",
        },
        {
          label: "Oppna arbetssteg",
          value: `${tasks.length}`,
          note: urgentTasks.length > 0
            ? `${urgentTasks.length} ar hogt prioriterade`
            : "Inga akuta uppgifter sticker ut",
        },
        {
          label: "Kalendertryck",
          value: `${bookings.length}`,
          note: bookings[0]
            ? `${bookings[0].customer?.companyName ?? bookings[0].title} ligger narmast`
            : "Ingen kommande bokning inlast",
        },
      ],
      contextNarrative: [
        topLead
          ? `${topLead.companyName} leder pipelinen med score ${topLead.score} och ${topLead.probability}% sannolikhet.`
          : "AI saknar fortfarande en stark lead att utga ifran.",
        topCustomer
          ? `${topCustomer.companyName} ar starkaste relation just nu med ${healthMap[topCustomer.health].toLowerCase()} halsa.`
          : "Inga kundrelationer ar tillrackligt rika for djupare AI-analys an.",
        bookings[0]
          ? `Nasta bokning ar ${bookings[0].customer?.companyName ?? bookings[0].title} ${formatRelativeDate(bookings[0].startsAt)}.`
          : "Kalendern ar lugn just nu, vilket gor det enkelt att planera nya floden.",
        activeAutomations > 0
          ? `${activeAutomations} automationer ar aktiva och kan byggas ut av AI.`
          : "AI kan foresla forsta workflowet for att minska manuellt arbete.",
      ],
      memoryFeed,
      recentInsights,
      messages,
      openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
      latestInsight,
    };
  });
}

export type AnalyticsData = {
  hero: {
    eyebrow: string;
    title: string;
    summary: string;
    liveLabel: string;
    primaryDecision: {
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
  executiveMetrics: Array<{
    label: string;
    value: string;
    momentum: string;
    impact: string;
    note: string;
    tone: "emerald" | "cyan" | "violet" | "amber";
  }>;
  performanceLenses: Array<{
    label: string;
    value: string;
    benchmark: string;
    momentum: string;
    insight: string;
    tone: "emerald" | "amber" | "violet" | "slate";
  }>;
  growthDrivers: Array<{
    title: string;
    detail: string;
    value: string;
  }>;
  frictionPoints: Array<{
    title: string;
    detail: string;
    severity: string;
  }>;
  decisionQueue: Array<{
    title: string;
    detail: string;
    cta: string;
    href: string;
    tone: "rose" | "amber" | "emerald" | "slate";
  }>;
  operationalSignals: Array<{
    label: string;
    value: string;
    note: string;
    percentage: number;
  }>;
  intelligenceFeed: Array<{
    title: string;
    detail: string;
    time: string;
    tone: "emerald" | "amber" | "rose" | "slate";
  }>;
  aiNarrative: {
    headline: string;
    summary: string;
    bullets: string[];
    href: string;
  };
};

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
  return withWorkspaceContext(async ({ prisma, workspace }) => {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const [
      invoiceAgg,
      recentInvoices,
      leadsAgg,
      hotLeads,
      customerAgg,
      customerSummary,
      bookingsUpcoming,
      tasksOpen,
      conversations,
      insights,
      activities,
      activeAutomations,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { workspaceId: workspace.id },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { workspaceId: workspace.id },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      prisma.lead.groupBy({
        by: ["status"],
        where: { workspaceId: workspace.id },
        _count: { _all: true },
        _sum: { estimatedValue: true },
      }),
      prisma.lead.findMany({
        where: {
          workspaceId: workspace.id,
          status: {
            in: [LeadStatus.NEW, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL],
          },
        },
        orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
        take: 5,
        select: {
          companyName: true,
          status: true,
          score: true,
          estimatedValue: true,
          lastContactAt: true,
          nextAction: true,
        },
      }),
      prisma.customer.aggregate({
        where: { workspaceId: workspace.id },
        _avg: { score: true },
      }),
      prisma.customer.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ updatedAt: "desc" }],
        take: 8,
        select: {
          companyName: true,
          score: true,
          health: true,
          revenueGenerated: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          workspaceId: workspace.id,
          startsAt: {
            gte: now,
            lte: nextWeek,
          },
        },
        include: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: { startsAt: "asc" },
        take: 8,
      }),
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
        },
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
        },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
        take: 8,
      }),
      prisma.conversationThread.findMany({
        where: { workspaceId: workspace.id },
        orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
        take: 8,
        select: {
          sentiment: true,
          lastMessageAt: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      }),
      prisma.aIInsight.findMany({
        where: {
          workspaceId: workspace.id,
          type: {
            in: [AIInsightType.ANALYTICS, AIInsightType.SUMMARY, AIInsightType.RISK],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.activityLog.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.automationFlow.count({
        where: {
          workspaceId: workspace.id,
          status: AutomationStatus.ACTIVE,
        },
      }),
    ]);

    const won = leadsAgg.find((item) => item.status === LeadStatus.WON)?._count._all ?? 0;
    const proposal = leadsAgg.find((item) => item.status === LeadStatus.PROPOSAL)?._count._all ?? 0;
    const activeLeadGroups = leadsAgg.filter(
      (item) =>
        item.status === LeadStatus.NEW ||
        item.status === LeadStatus.QUALIFIED ||
        item.status === LeadStatus.PROPOSAL,
    );
    const totalLeads = leadsAgg.reduce((sum, item) => sum + item._count._all, 0);
    const activeLeadCount = activeLeadGroups.reduce((sum, item) => sum + item._count._all, 0);
    const pipelineValue = activeLeadGroups.reduce(
      (sum, item) => sum + toNumber(item._sum.estimatedValue),
      0,
    );
    const conversionRate = Math.round((won / Math.max(totalLeads, 1)) * 1000) / 10;
    const revenue = toNumber(invoiceAgg._sum.amount);
    const averageCustomerScore = Math.round(customerAgg._avg.score ?? 0);
    const atRiskCustomers = customerSummary.filter(
      (customer) =>
        customer.health === CustomerHealth.AT_RISK ||
        customer.health === CustomerHealth.WATCH,
    );
    const upsellCustomers = customerSummary.filter(
      (customer) => customer.health === CustomerHealth.UPSELL,
    );
    const overdueInvoices = recentInvoices.filter(
      (invoice) =>
        invoice.status === InvoiceStatus.OVERDUE ||
        (invoice.status === InvoiceStatus.SENT && invoice.dueDate && invoice.dueDate < now),
    );
    const overdueAmount = overdueInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.amount),
      0,
    );
    const urgentTasks = tasksOpen.filter(
      (task) =>
        task.priority === TaskPriority.URGENT || task.priority === TaskPriority.HIGH,
    );
    const needsReminderBookings = bookingsUpcoming.filter(
      (booking) => booking.status === BookingStatus.NEEDS_REMINDER,
    );
    const negativeThreads = conversations.filter(
      (thread) => thread.sentiment === ConversationSentiment.NEGATIVE,
    );
    const freshThreads = conversations.filter(
      (thread) => thread.lastMessageAt && thread.lastMessageAt >= yesterday,
    );
    const bookingCapacityBase = Math.max(workspace.companySize ?? 4, 4) * 3;
    const occupancyRate = Math.min(
      100,
      Math.round((bookingsUpcoming.length / Math.max(bookingCapacityBase, 1)) * 100),
    );
    const strongestLead = hotLeads[0] ?? null;
    const strongestCustomer =
      [...customerSummary].sort(
        (left, right) => toNumber(right.revenueGenerated) - toNumber(left.revenueGenerated),
      )[0] ?? null;
    const latestInsight = insights[0] ?? null;

    const executiveMetrics: AnalyticsData["executiveMetrics"] = [
      {
        label: "Intaktstryck",
        value: formatCurrency(revenue),
        momentum:
          pipelineValue > revenue
            ? "Pipeline overtraffar redan fakturerat varde"
            : "Fakturerat varde leder fortfarande tillvaxtbilden",
        impact:
          strongestCustomer
            ? `${strongestCustomer.companyName} ar storsta registrerade intaktsmotor just nu`
            : "Fler betalande kunder behovs for starkare intaktssignal",
        note: "Summerar faktisk fakturadata och staller den mot nuvarande affarsrorelse.",
        tone: "emerald",
      },
      {
        label: "Konverteringsstyrka",
        value: `${conversionRate}%`,
        momentum:
          proposal > 0
            ? `${proposal} affarer ligger i proposal och driver nasta skifte`
            : "Fa eller inga proposal-affarer driver just nu konvertering",
        impact:
          activeLeadCount > 0
            ? `${activeLeadCount} aktiva leads bygger underlaget for nasta vunna affar`
            : "Ingen aktiv pipeline driver konvertering annu",
        note: "Matar vunna affarer mot total leadvolym i arbetsytan.",
        tone: "violet",
      },
      {
        label: "Kundhalsa",
        value: `${averageCustomerScore}/100`,
        momentum:
          atRiskCustomers.length > 0
            ? `${atRiskCustomers.length} relationer ar i risk- eller bevakningslage`
            : "Kundbasen ser stabil ut utan tydliga riskkluster",
        impact:
          upsellCustomers.length > 0
            ? `${upsellCustomers.length} relationer ar mogna for expansion`
            : "Fa tydliga upsell-fonster i nulaget",
        note: "Bygger pa verklig kundscore och halsa over de senaste relationerna.",
        tone: "cyan",
      },
      {
        label: "Operativ belastning",
        value: `${occupancyRate}%`,
        momentum:
          needsReminderBookings.length > 0
            ? `${needsReminderBookings.length} bokningar saknar fortfarande trygg operativ forberedelse`
            : "Kalendern ar under kontroll utan tydliga bokningsblockers",
        impact:
          urgentTasks.length > 0
            ? `${urgentTasks.length} uppgifter med hog prioritet riskerar att bromsa leverans`
            : "Inga akuta uppgifter bromsar teamet just nu",
        note: "Vager bokningar, teamkapacitet och prioriterade uppgifter i samma beslutsbild.",
        tone: "amber",
      },
    ];

    const performanceLenses: AnalyticsData["performanceLenses"] = [
      {
        label: "Pipelinevarde",
        value: formatCurrency(pipelineValue),
        benchmark:
          strongestLead
            ? `${strongestLead.companyName} bär starkaste affarssignalen`
            : "Bygg fler kvalificerade leads",
        momentum:
          activeLeadCount > 0 ? `${activeLeadCount} affarer ar fortsatt oppna` : "0 aktiva leads",
        insight:
          strongestLead
            ? `${strongestLead.companyName} ligger hogst i score och bor fa snabb uppfoljning for att inte tappa fart.`
            : "Nar fler leads finns kan analysmotorn peka ut exakt var friktionen byggs upp.",
        tone: "violet",
      },
      {
        label: "Kassaflodesrisk",
        value: overdueInvoices.length > 0 ? formatCurrency(overdueAmount) : "0 kr",
        benchmark:
          overdueInvoices.length > 0
            ? `${overdueInvoices.length} fakturor ar forfallna eller for sena`
            : "Ingen omedelbar fakturarisk",
        momentum:
          overdueInvoices.length > 0 ? "Behov av uppfoljning nu" : "Stabilt lage",
        insight:
          overdueInvoices[0]
            ? `${overdueInvoices[0].customer?.companyName ?? overdueInvoices[0].invoiceNumber} ar forsta stoppet som bor losas for att skydda intakten.`
            : "Nar fakturaflodet ar rent kan teamet fokusera mer pa tillvaxt och expansion.",
        tone: overdueInvoices.length > 0 ? "amber" : "emerald",
      },
      {
        label: "Dialoghalsa",
        value: `${freshThreads.length}/${conversations.length || 0}`,
        benchmark:
          negativeThreads.length > 0
            ? `${negativeThreads.length} dialoger har negativ ton`
            : "Ingen negativ samtalston sticker ut",
        momentum:
          freshThreads.length > 0
            ? `${freshThreads.length} tradar har haft aktivitet senaste dygnet`
            : "Lagt dialogtempo senaste dygnet",
        insight:
          negativeThreads[0]?.customer?.companyName
            ? `${negativeThreads[0].customer.companyName} bor prioriteras eftersom sentimentet redan lutar negativt.`
            : "Dialoglaget ar tillrackligt lugnt for proaktiv uppfoljning och mer strukturerad service.",
        tone: negativeThreads.length > 0 ? "amber" : "slate",
      },
      {
        label: "Automationsgrad",
        value: `${activeAutomations}`,
        benchmark: activeAutomations > 0 ? "Aktiva floden stottar driften" : "Manuell drift dominerar",
        momentum:
          activeAutomations > 1
            ? "Automationer avlastar flera delar av verksamheten"
            : "Fa aktiva workflows driver annu skala",
        insight:
          activeAutomations > 0
            ? "Nasta steg ar att rikta automationer mot de luckor som faktiskt syns i analysen."
            : "Det finns tydligt utrymme att automatisera uppfoljning, retention eller bokningslogik.",
        tone: activeAutomations > 0 ? "emerald" : "slate",
      },
    ];

    const growthDrivers: AnalyticsData["growthDrivers"] = [
      {
        title: "Pipeline med konkret intaktspotential",
        detail:
          activeLeadCount > 0
            ? `${activeLeadCount} aktiva leads representerar ${formatCurrency(pipelineValue)} i oppet varde. Det ar det tydligaste tillvaxtsparet att skydda just nu.`
            : "Det finns inte tillrackligt med aktiv pipeline for att skapa en tydlig tillvaxtmotor an.",
        value: formatCurrency(pipelineValue),
      },
      {
        title: "Kunder med expansionslage",
        detail:
          upsellCustomers.length > 0
            ? `${upsellCustomers.length} kunder ligger i upsell-lage och bor fa ett tydligt kommersiellt nasta steg.`
            : "Inga starka upsell-signaler sticker ut just nu, vilket talar for fokus pa retention och nykundsflode.",
        value: `${upsellCustomers.length} mojligheter`,
      },
      {
        title: "Dialogtempo och faktisk aktivitet",
        detail:
          freshThreads.length > 0
            ? `${freshThreads.length} dialoger har varit levande senaste dygnet, vilket ger battre forutsattning for snabbare beslut och kortare ledtid.`
            : "Dialogtempot ar lagt, vilket kan betyda att sälj- och servicearbete tappar fart innan nasta steg tas.",
        value: `${freshThreads.length} aktiva tradar`,
      },
    ];

    const frictionPoints: AnalyticsData["frictionPoints"] = [
      {
        title: "Kassaflode kan lackage",
        detail:
          overdueInvoices.length > 0
            ? `${overdueInvoices.length} fakturor riskerar att skjuta fram intakter och gor tillvaxten mer skenbar an verklig.`
            : "Ingen tydlig fakturafriktion i nulaget.",
        severity: overdueInvoices.length > 0 ? "Hog" : "Lag",
      },
      {
        title: "Kundrisk byggs i relationerna",
        detail:
          atRiskCustomers.length > 0
            ? `${atRiskCustomers.length} relationer ligger i bevakning eller risk. Det bromsar retention innan det syns i topline-siffrorna.`
            : "Ingen tydlig kundrisk sticker ut i arbetsytan just nu.",
        severity: atRiskCustomers.length > 0 ? "Medium" : "Lag",
      },
      {
        title: "Prioriterade arbetssteg blockerar flode",
        detail:
          urgentTasks.length > 0
            ? `${urgentTasks.length} uppgifter med hog prioritet ligger fortfarande oppna och riskerar att bromsa leverans, uppfoljning eller fakturering.`
            : "Inga tydliga operativa blockers i uppgiftslagret.",
        severity: urgentTasks.length > 0 ? "Medium" : "Lag",
      },
    ];

    const decisionQueue: AnalyticsData["decisionQueue"] = [
      overdueInvoices[0]
        ? {
            title: `Skydda kassaflodet kring ${overdueInvoices[0].customer?.companyName ?? overdueInvoices[0].invoiceNumber}`,
            detail: `Folj upp forfallen eller sen faktura pa ${formatCurrency(toNumber(overdueInvoices[0].amount))} innan intaktsbilden blir missvisande.`,
            cta: "Oppna fakturering",
            href: "/fakturering",
            tone: "rose" as const,
          }
        : null,
      strongestLead
        ? {
            title: `Flytta ${strongestLead.companyName} snabbare genom pipelinen`,
            detail:
              strongestLead.nextAction?.trim() ||
              `Leadet har hogst score just nu och bor fa ett konkret nasta steg innan momentum forsvinner.`,
            cta: "Oppna leads",
            href: "/leads",
            tone: "emerald" as const,
          }
        : null,
      atRiskCustomers[0]
        ? {
            title: `Sakra relationen med ${atRiskCustomers[0].companyName}`,
            detail: `Kundhalsan visar ${atRiskCustomers[0].health === CustomerHealth.AT_RISK ? "forhojd risk" : "bevakningslage"} och bor mätas i dialog, inte bara i score.`,
            cta: "Oppna kunder",
            href: "/kunder",
            tone: "amber" as const,
          }
        : null,
      needsReminderBookings[0]
        ? {
            title: `Forbered bokningen for ${needsReminderBookings[0].customer?.companyName ?? needsReminderBookings[0].title}`,
            detail: "Paminnelser eller forberedelser saknas och riskerar att sanka kvaliteten i leveransen senare i veckan.",
            cta: "Oppna bokningar",
            href: "/bokningar",
            tone: "slate" as const,
          }
        : null,
      {
        title: "Lat AI analysera beslutslagret",
        detail:
          "Anvand AI-workspacen for att fa ett strategiskt resonemang om var tillvaxt, risk och kapacitetsfriktion faktiskt kommer ifran.",
        cta: "Oppna AI-workspace",
        href: "/ai-assistent",
        tone: "slate" as const,
      },
    ].filter(Boolean) as AnalyticsData["decisionQueue"];

    const operationalSignals: AnalyticsData["operationalSignals"] = [
      {
        label: "Pipelinevolym",
        value: `${activeLeadCount} aktiva`,
        note: `${formatCurrency(pipelineValue)} i oppet affarsvarde`,
        percentage: Math.max(12, Math.min(100, Math.round((activeLeadCount / Math.max(totalLeads, 1)) * 100))),
      },
      {
        label: "Belaggning",
        value: `${occupancyRate}%`,
        note: `${bookingsUpcoming.length} bokningar kommande vecka`,
        percentage: occupancyRate,
      },
      {
        label: "Dialogtryck",
        value: `${freshThreads.length}`,
        note: `${negativeThreads.length} med negativ ton`,
        percentage: Math.min(100, freshThreads.length * 14),
      },
      {
        label: "Automationsstod",
        value: `${activeAutomations}`,
        note: "Aktiva workflows som avlastar drift",
        percentage: Math.min(100, activeAutomations * 22),
      },
    ];

    const intelligenceFeed: AnalyticsData["intelligenceFeed"] = [
      ...insights.map((insight) => ({
        title: insight.title,
        detail: insight.content.slice(0, 180),
        time: formatRelativeDate(insight.createdAt),
        tone:
          insight.type === AIInsightType.RISK
            ? ("rose" as const)
            : insight.type === AIInsightType.ANALYTICS
              ? ("emerald" as const)
              : ("slate" as const),
      })),
      ...activities.map((activity) => ({
        title: activity.title,
        detail: activity.detail.slice(0, 180),
        time: formatRelativeDate(activity.createdAt),
        tone: "slate" as const,
      })),
    ].slice(0, 6);

    const heroTitle =
      decisionQueue[0]?.title ??
      latestInsight?.title ??
      "Beslutsmotorn invantar starkare verksamhetssignaler";
    const heroSummary =
      [
        activeLeadCount > 0
          ? `${activeLeadCount} aktiva leads driver ${formatCurrency(pipelineValue)} i oppet affarsvarde.`
          : "Pipelinen saknar fortfarande tydligt aktivt affarsflode.",
        overdueInvoices.length > 0
          ? `${overdueInvoices.length} fakturor skapar direkt kassaflodesrisk.`
          : "Ingen akut fakturarisk bromsar nulaget.",
        atRiskCustomers.length > 0
          ? `${atRiskCustomers.length} kundrelationer krav er extra uppmarksamhet innan retentionen forsvagas.`
          : "Kundbasen visar ingen stor riskklunga just nu.",
      ].join(" ");

    return {
      hero: {
        eyebrow: "AI-native intelligence layer",
        title: heroTitle,
        summary: heroSummary,
        liveLabel:
          intelligenceFeed.length > 0
            ? `${intelligenceFeed.length} signaler uppdaterade nyligen`
            : "Inga nya intelligence-signaler annu",
        primaryDecision: decisionQueue[0]
          ? {
              label: decisionQueue[0].cta,
              href: decisionQueue[0].href,
            }
          : {
              label: "Oppna AI-workspace",
              href: "/ai-assistent",
            },
        secondaryActions: [
          { label: "Oppna AI-workspace", href: "/ai-assistent" },
          { label: "Se pipeline", href: "/pipeline" },
          { label: "Oppna fakturering", href: "/fakturering" },
        ],
        statusChips: [
          {
            label: "Intakter",
            value: formatCurrency(revenue),
            tone: revenue > 0 ? "emerald" : "slate",
          },
          {
            label: "Pipeline",
            value: formatCurrency(pipelineValue),
            tone: pipelineValue > 0 ? "emerald" : "slate",
          },
          {
            label: "Risker",
            value: `${overdueInvoices.length + atRiskCustomers.length + negativeThreads.length}`,
            tone:
              overdueInvoices.length + atRiskCustomers.length + negativeThreads.length > 0
                ? "rose"
                : "slate",
          },
          {
            label: "Kapacitet",
            value: `${occupancyRate}%`,
            tone: occupancyRate >= 75 ? "amber" : "slate",
          },
        ],
      },
      executiveMetrics,
      performanceLenses,
      growthDrivers,
      frictionPoints,
      decisionQueue,
      operationalSignals,
      intelligenceFeed,
      aiNarrative: {
        headline:
          latestInsight?.title ??
          "AI-analytikern ser tillvaxt, friktion och risk i samma bild",
        summary:
          latestInsight?.content ??
          "Nar AI-insikter byggs upp over tid forklarar systemet inte bara vad som har hant, utan varfor det hander och vilket beslut som ger mest effekt nu.",
        bullets: [
          strongestLead
            ? `${strongestLead.companyName} ar starkaste leadsignal och bor fa direkt uppfoljning.`
            : "Fler kvalificerade leads behovs for en tydligare tillvaxtmotor.",
          overdueInvoices.length > 0
            ? "Kassaflodesrisken ar tydligare an topline-siffran antyder, eftersom forfallna fakturor redan ligger kvar i systemet."
            : "Intaktsbilden ar renare nar fakturaflodet inte visar tydliga stopp.",
          negativeThreads.length > 0
            ? "Dialogsentimentet visar var servicefriktion kan bli ett framtida retentionproblem."
            : "Dialogklimatet ser stabilt ut, vilket gor laget battre for proaktiv expansion.",
        ],
        href: "/ai-assistent",
      },
    };
  });
}
