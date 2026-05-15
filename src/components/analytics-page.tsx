"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
    ChevronDown,
  ChevronUp,
  Download,
  Minus,
} from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import type { AnalyticsData, AnalyticsMetricId } from "@/lib/server/analytics-workspace-data";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const sectionClass =
  "rounded-[30px] border border-slate-200/70 bg-white/95 shadow-[0_12px_32px_rgba(15,23,42,0.04)]";

type DetailTab = "revenue" | "pipeline" | "customers" | "operations" | "tables";

function toneChipClass(tone: AnalyticsData["overviewMetrics"][number]["tone"]) {
  if (tone === "emerald") return "border-emerald-200/80 bg-emerald-50/80 text-emerald-700";
  if (tone === "cyan") return "border-sky-200/80 bg-sky-50/80 text-sky-700";
  if (tone === "violet") return "border-violet-200/80 bg-violet-50/80 text-violet-700";
  if (tone === "amber") return "border-amber-200/80 bg-amber-50/80 text-amber-700";
  if (tone === "rose") return "border-rose-200/80 bg-rose-50/80 text-rose-700";
  return "border-slate-200/80 bg-slate-50/80 text-slate-700";
}

function toneSurfaceClass(tone: AnalyticsData["overviewMetrics"][number]["tone"]) {
  if (tone === "emerald") return "bg-[linear-gradient(180deg,rgba(236,253,245,0.72),rgba(255,255,255,0.98))]";
  if (tone === "cyan") return "bg-[linear-gradient(180deg,rgba(240,249,255,0.78),rgba(255,255,255,0.98))]";
  if (tone === "violet") return "bg-[linear-gradient(180deg,rgba(245,243,255,0.78),rgba(255,255,255,0.98))]";
  if (tone === "amber") return "bg-[linear-gradient(180deg,rgba(255,251,235,0.78),rgba(255,255,255,0.98))]";
  if (tone === "rose") return "bg-[linear-gradient(180deg,rgba(255,241,242,0.78),rgba(255,255,255,0.98))]";
  return "bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.98))]";
}

function statusChipClass(status: string) {
  if (status === "Bra" || status === "Stabil" || status === "Nära mål" || status === "Bra takt") {
    return "border-emerald-200/80 bg-emerald-50/80 text-emerald-700";
  }
  if (
    status === "Bevaka" ||
    status === "Bygg momentum" ||
    status === "Växer" ||
    status === "Hög potential"
  ) {
    return "border-amber-200/80 bg-amber-50/80 text-amber-700";
  }
  if (status === "Risk") return "border-rose-200/80 bg-rose-50/80 text-rose-700";
  return "border-slate-200/80 bg-slate-50/80 text-slate-700";
}

function chartColor(tone: AnalyticsData["overviewMetrics"][number]["tone"]) {
  if (tone === "emerald") return "#059669";
  if (tone === "cyan") return "#0284c7";
  if (tone === "violet") return "#7c3aed";
  if (tone === "amber") return "#d97706";
  if (tone === "rose") return "#e11d48";
  return "#64748b";
}

function dotClass(tone: AnalyticsData["overviewMetrics"][number]["tone"]) {
  if (tone === "emerald") return "bg-emerald-500";
  if (tone === "cyan") return "bg-sky-500";
  if (tone === "violet") return "bg-violet-500";
  if (tone === "amber") return "bg-amber-500";
  if (tone === "rose") return "bg-rose-500";
  return "bg-slate-400";
}

function getTrendMeta(direction: AnalyticsData["overviewMetrics"][number]["deltaDirection"]) {
  if (direction === "up") return { icon: ArrowUpRight, className: "text-emerald-700" };
  if (direction === "down") return { icon: ArrowDownRight, className: "text-rose-700" };
  return { icon: Minus, className: "text-slate-400" };
}

function formatMetricValue(
  value: number,
  format: AnalyticsData["mainChart"]["metrics"][number]["format"],
) {
  if (format === "currency") {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "percent") return `${value.toFixed(1).replace(".", ",")}%`;
  if (format === "hours") return `${value.toFixed(1).replace(".", ",")}h`;
  if (format === "score") return `${Math.round(value)}/100`;
  return `${Math.round(value)}`;
}

function getMetricSeriesKey(metricId: AnalyticsMetricId) {
  if (metricId === "revenue" || metricId === "mrr" || metricId === "arr") return "revenue";
  if (metricId === "pipeline") return "pipeline";
  if (metricId === "conversion" || metricId === "winRate" || metricId === "leadVelocity") {
    return "conversion";
  }
  if (metricId === "bookings" || metricId === "capacity") return "bookings";
  if (metricId === "responseTime") return "responseTime";
  return "customerHealth";
}

function getMetricPointValue(
  point: AnalyticsData["mainChart"]["ranges"][number]["points"][number] | undefined,
  metricId: AnalyticsMetricId,
) {
  if (!point) return 0;
  return point[getMetricSeriesKey(metricId)];
}

function MainChart({
  points,
  metricId,
  tone,
}: {
  points: AnalyticsData["mainChart"]["ranges"][number]["points"];
  metricId: AnalyticsMetricId;
  tone: AnalyticsData["overviewMetrics"][number]["tone"];
}) {
  const width = 860;
  const height = 300;
  const metricKey = getMetricSeriesKey(metricId);
  const values = points.map((point) => point[metricKey]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const spread = Math.max(1, max - min);
  const linePoints = values.map((value, index) => {
    const x = 28 + (index / Math.max(values.length - 1, 1)) * (width - 56);
    const y = height - 30 - ((value - min) / spread) * (height - 76);
    return { x, y };
  });
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1]?.x ?? width - 28} ${height - 28} L ${linePoints[0]?.x ?? 28} ${height - 28} Z`;
  const color = chartColor(tone);
  const gradientId = `analytics-area-${metricId}`;

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.98))] p-4 sm:p-5">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = 24 + line * 62;
          return (
            <line
              key={line}
              x1="22"
              x2={width - 22}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 8"
            />
          );
        })}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {linePoints.map((point, index) => (
          <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="3.5" fill={color} />
        ))}
      </svg>
      <div className="mt-3 flex items-center justify-between gap-3 overflow-x-auto text-xs text-slate-500">
        {points.map((point) => (
          <span key={point.label} className="min-w-[44px] text-center">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Array<Record<string, string>> }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500">
        Tabellen fylls automatiskt när mer verksamhetsdata finns tillgänglig.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-sm">
          <thead className="bg-slate-50/80 text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 text-slate-700">
            {rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${Object.values(row).join("-")}`} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 align-top">
                    {row[column] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadCsv(filename: string, columns: string[], rows: Array<Record<string, string>>) {
  const csv = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.6rem]">
        {title}
      </h2>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-[140px]">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-300"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
export function AnalyticsPage({ data }: { data?: AnalyticsData }) {
  const analytics = data;
  const [selectedRangeId, setSelectedRangeId] = useState(
    analytics?.filterBar.ranges[1]?.id ?? analytics?.filterBar.ranges[0]?.id ?? "30d",
  );
  const [selectedMetricId, setSelectedMetricId] = useState<AnalyticsMetricId>(
    analytics?.mainChart.defaultMetricId ?? "revenue",
  );
  const [selectedTeam, setSelectedTeam] = useState("Alla team");
  const [selectedOwner, setSelectedOwner] = useState("Alla ansvariga");
  const [selectedStage, setSelectedStage] = useState("Alla steg");
  const [selectedRisk, setSelectedRisk] = useState("Alla risknivåer");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("revenue");
  const [selectedTable, setSelectedTable] =
    useState<keyof AnalyticsData["dataTables"]>("topCustomers");

  const metricMap = useMemo(
    () => new Map((analytics?.overviewMetrics ?? []).map((item) => [item.id, item])),
    [analytics],
  );

  const selectedRange =
    analytics?.mainChart.ranges.find((range) => range.id === selectedRangeId) ??
    analytics?.mainChart.ranges[0];
  const selectedMetricMeta =
    analytics?.mainChart.metrics.find((metric) => metric.id === selectedMetricId) ??
    analytics?.mainChart.metrics[0];
  const selectedMetricTone =
    metricMap.get(selectedMetricId)?.tone ?? selectedMetricMeta?.tone ?? "emerald";

  if (!analytics || !selectedRange || !selectedMetricMeta) {
    return (
      <CrmShell
        title="Statistik"
        description="Analytics workspacen fylls när mer verksamhetsdata finns tillgänglig."
      >
        <div className={`${sectionClass} p-6 text-sm text-slate-600`}>
          Statistikpanelen väntar på mer data från leads, kunder, bokningar, fakturor och teamaktivitet.
        </div>
      </CrmShell>
    );
  }

  const chartTabs: Array<{ id: AnalyticsMetricId; label: string }> = [
    { id: "revenue", label: "Revenue" },
    { id: "pipeline", label: "Pipeline" },
    { id: "conversion", label: "Growth" },
    { id: "bookings", label: "Activity" },
    { id: "customers", label: "Retention" },
  ];
  const currentMetricValue = formatMetricValue(
    getMetricPointValue(selectedRange.points[selectedRange.points.length - 1], selectedMetricId),
    selectedMetricMeta.format,
  );
  const currentMetricStartValue = formatMetricValue(
    getMetricPointValue(selectedRange.points[0], selectedMetricId),
    selectedMetricMeta.format,
  );
  const priorityList = analytics.rankedLists[0]?.items.slice(0, 4) ?? [];
  const topPriority = priorityList[0];
  const riskValue =
    !topPriority || topPriority.percentage < 45 ? "Låg" : topPriority.percentage < 75 ? "Medel" : "Hög";
  const growthInsight = analytics.periodComparisons[0];
  const executiveCards = [
    {
      label: "Total revenue",
      value: metricMap.get("revenue")?.value ?? analytics.hero.statusChips[0]?.value ?? "-",
      note: metricMap.get("revenue")?.benchmark ?? "Totala intäkter mot nuvarande baseline.",
      delta: metricMap.get("revenue")?.delta,
      tone: metricMap.get("revenue")?.tone ?? "emerald",
    },
    {
      label: "Pipeline",
      value: metricMap.get("pipeline")?.value ?? analytics.hero.statusChips[1]?.value ?? "-",
      note: metricMap.get("pipeline")?.benchmark ?? "Öppet värde i aktiv försäljningspipeline.",
      delta: metricMap.get("pipeline")?.delta,
      tone: metricMap.get("pipeline")?.tone ?? "violet",
    },
    {
      label: "Growth",
      value: growthInsight?.delta ?? metricMap.get("conversion")?.delta ?? "-",
      note: growthInsight?.insight ?? metricMap.get("conversion")?.benchmark ?? "Tillväxt just nu.",
      delta: growthInsight?.currentValue,
      tone: growthInsight?.tone ?? metricMap.get("conversion")?.tone ?? "cyan",
    },
    {
      label: "Risknivå",
      value: riskValue,
      note: topPriority ? `${topPriority.label} är högst prioriterad just nu.` : "Ingen tydlig risk toppar just nu.",
      delta: topPriority?.trend,
      tone: topPriority?.tone ?? "slate",
    },
  ];
  const coreMetrics = analytics.overviewMetrics.filter((metric) =>
    ["conversion", "retention", "responseTime", "capacity", "winRate", "leadVelocity"].includes(metric.id),
  );
  const tableTabs: Array<{ id: keyof AnalyticsData["dataTables"]; label: string }> = [
    { id: "topCustomers", label: "Kunder" },
    { id: "topDeals", label: "Affärer" },
    { id: "latestInvoices", label: "Fakturor" },
    { id: "openRisks", label: "Risker" },
  ];
  const tableConfig = analytics.dataTables[selectedTable];
  const detailPreview = [
    {
      tab: "revenue" as const,
      title: "Revenue analytics",
      text: "Forecast, leakage och topline-trender öppnas vid behov.",
    },
    {
      tab: "pipeline" as const,
      title: "Pipeline details",
      text: "Steg, dropoff och förlorade orsaker ligger sekundärt.",
    },
    {
      tab: "tables" as const,
      title: "Datatabeller",
      text: "Export och djupare operativ data visas först när du behöver dem.",
    },
  ];
  const activeFilters = [
    selectedTeam !== "Alla team" ? selectedTeam : null,
    selectedOwner !== "Alla ansvariga" ? selectedOwner : null,
    selectedStage !== "Alla steg" ? selectedStage : null,
    selectedRisk !== "Alla risknivåer" ? selectedRisk : null,
  ].filter((value): value is string => Boolean(value));
  const chartStoryMap: Partial<Record<AnalyticsMetricId, string>> = {
    revenue: analytics.periodComparisons[1]?.insight,
    pipeline: topPriority?.label ? `${topPriority.label} påverkar forecast mest just nu.` : undefined,
    conversion: analytics.periodComparisons[0]?.insight,
    bookings: analytics.weeklyActivity.aiRecommendation,
    customers: analytics.periodComparisons[3]?.insight,
  };
  const detailButtons: Array<{ id: DetailTab; label: string }> = [
    { id: "revenue", label: "Revenue" },
    { id: "pipeline", label: "Pipeline" },
    { id: "customers", label: "Customers" },
    { id: "operations", label: "Operations" },
    { id: "tables", label: "Tables" },
  ];

  return (
    <CrmShell
      title="Statistik"
      description="En lugn executive dashboard för intäkt, pipeline, risk och nästa bästa beslut."
    >
      <div className="grid gap-6 pb-8">
        <motion.section {...fadeUp} transition={{ duration: 0.28 }} className={`${sectionClass} sticky top-4 z-20 p-4 sm:p-5`}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Filters</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {analytics.filterBar.savedViews.map((view) => (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => {
                      setSelectedRangeId(view.rangeId);
                      const nextMetric = chartTabs.find((tab) => view.metricIds.includes(tab.id))?.id ?? view.metricIds[0] ?? "revenue";
                      setSelectedMetricId(nextMetric);
                    }}
                    className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-white"
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect label="Team" value={selectedTeam} options={["Alla team", ...analytics.filterBar.teams]} onChange={setSelectedTeam} />
              <FilterSelect label="Ansvarig" value={selectedOwner} options={["Alla ansvariga", ...analytics.filterBar.owners]} onChange={setSelectedOwner} />
              <FilterSelect label="Steg" value={selectedStage} options={["Alla steg", ...analytics.filterBar.stages]} onChange={setSelectedStage} />
              <FilterSelect label="Risk" value={selectedRisk} options={["Alla risknivåer", ...analytics.filterBar.risks]} onChange={setSelectedRisk} />
            </div>
          </div>
          {activeFilters.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/70 pt-4">
              {activeFilters.map((filter) => (
                <span key={filter} className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs text-slate-600">
                  {filter}
                </span>
              ))}
            </div>
          ) : null}
        </motion.section>

        <motion.section {...fadeUp} transition={{ duration: 0.3 }} className={`${sectionClass} overflow-hidden p-6 sm:p-7`}>
          <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeader
                eyebrow="Executive Summary"
                title="Forsta verksamheten pa fem sekunder."
                description="Fyra signaler visar laget direkt. Resten visas forst nar det verkligen behovs."
              />
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600">
                  {analytics.hero.eyebrow}
                </span>
                <span className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  {analytics.hero.liveLabel}
                </span>
              </div>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-600">{analytics.hero.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={analytics.hero.primaryAction.href} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
                  {analytics.hero.primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {analytics.hero.secondaryActions[0] ? (
                  <Link href={analytics.hero.secondaryActions[0].href} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    {analytics.hero.secondaryActions[0].label}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {executiveCards.map((card) => (
                <div key={card.label} className={`rounded-[26px] border border-slate-200/70 p-5 ${toneSurfaceClass(card.tone)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                    {card.delta ? <span className={`rounded-full border px-2.5 py-1 text-[11px] ${toneChipClass(card.tone)}`}>{card.delta}</span> : null}
                  </div>
                  <p className="mt-5 text-[2rem] font-semibold tracking-[-0.06em] text-slate-950 sm:text-[2.25rem]">{card.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.note}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
        <motion.section {...fadeUp} transition={{ duration: 0.32 }} className={`${sectionClass} p-5 sm:p-6`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              eyebrow="Main Insight Area"
              title="En huvudgraf. Ett tydligt fokus."
              description="Byt signal utan att byta kontext. Samma graf visar det viktigaste just nu."
            />
            <div className="flex flex-wrap gap-2">
              {chartTabs.map((metric) => (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => setSelectedMetricId(metric.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selectedMetricId === metric.id
                      ? `${toneChipClass(metricMap.get(metric.id)?.tone ?? "slate")} shadow-[0_8px_18px_rgba(15,23,42,0.05)]`
                      : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Vald signal</p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-[-0.06em] text-slate-950">{currentMetricValue}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Från {currentMetricStartValue} till {currentMetricValue} under {selectedRange.label.toLowerCase()}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analytics.filterBar.ranges.map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setSelectedRangeId(range.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        selectedRangeId === range.id
                          ? "border-slate-300 bg-slate-950 text-white"
                          : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <MainChart points={selectedRange.points} metricId={selectedMetricId} tone={selectedMetricTone} />
            </div>
            <div className="grid gap-4 content-start">
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Insikt</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">{selectedMetricMeta.label}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {chartStoryMap[selectedMetricId] ?? "Signalen visar hur verksamheten ror sig over tid och var fokus bor ligga."}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Nuvarande period</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                    <span className="text-sm text-slate-600">Vald vy</span>
                    <span className="text-sm font-medium text-slate-950">{selectedRange.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                    <span className="text-sm text-slate-600">Teamfilter</span>
                    <span className="text-sm font-medium text-slate-950">{selectedTeam}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                    <span className="text-sm text-slate-600">Riskfilter</span>
                    <span className="text-sm font-medium text-slate-950">{selectedRisk}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeUp} transition={{ duration: 0.34 }} className={`${sectionClass} p-5 sm:p-6`}>
          <SectionHeader
            eyebrow="Core Metrics"
            title="Kompakta KPI:er med tydlig status."
            description="Bara signaler som hjalper dig fatta beslut snabbare visas i primarflodet."
          />
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {coreMetrics.map((metric) => {
              const trend = getTrendMeta(metric.deltaDirection);
              const TrendIcon = trend.icon;
              return (
                <Link key={metric.id} href={metric.href} className="rounded-[22px] border border-slate-200/70 bg-white px-4 py-4 transition hover:bg-slate-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{metric.label}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">{metric.group}</p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusChipClass(metric.status)}`}>{metric.status}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-xl font-semibold tracking-[-0.04em] text-slate-950">{metric.value}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <TrendIcon className={`h-3.5 w-3.5 ${trend.className}`} />
                      {metric.delta}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.section {...fadeUp} transition={{ duration: 0.36 }} className={`${sectionClass} p-5 sm:p-6`}>
            <SectionHeader
              eyebrow="Smart Trends"
              title="Trender som forklarar laget."
              description="Snabba jamforelser visar vad som faktiskt har andrats, inte bara vad som syns i siffrorna."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-3">
                {analytics.periodComparisons.slice(0, 3).map((item) => {
                  const trend = getTrendMeta(item.deltaDirection);
                  const TrendIcon = trend.icon;
                  return (
                    <div key={item.label} className="rounded-[22px] border border-slate-200/70 bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-950">{item.label}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{item.currentPeriod} mot {item.previousPeriod}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] ${toneChipClass(item.tone)}`}>{item.delta}</span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{item.currentPeriod}</p>
                          <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">{item.currentValue}</p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{item.previousPeriod}</p>
                          <p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-700">{item.previousValue}</p>
                        </div>
                      </div>
                      <div className="mt-4 inline-flex items-start gap-2 text-sm leading-6 text-slate-600">
                        <TrendIcon className={`mt-0.5 h-4 w-4 shrink-0 ${trend.className}`} />
                        {item.insight}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">Veckopuls</p>
                    <p className="mt-1 text-sm text-slate-500">Aktivitet och belastning dag for dag.</p>
                  </div>
                  <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] text-slate-600">Peak: {analytics.weeklyActivity.peakDay}</span>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2">
                  {analytics.weeklyActivity.days.map((day) => (
                    <div key={day.label} className="text-center">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{day.label}</p>
                      <div className="mx-auto mt-3 flex h-24 w-7 items-end overflow-hidden rounded-full bg-white">
                        <div className="w-full rounded-full transition-all" style={{ height: `${Math.max(10, day.load)}%`, background: `linear-gradient(180deg, ${chartColor(day.tone)}, rgba(255,255,255,0.92))` }} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{day.load}%</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{analytics.weeklyActivity.aiRecommendation}</p>
              </div>
            </div>
          </motion.section>

          <motion.section {...fadeUp} transition={{ duration: 0.38 }} className={`${sectionClass} p-5 sm:p-6`}>
            <SectionHeader
              eyebrow="Prioritetssektion"
              title="Vad kraver uppmarksamhet nu?"
              description="En ren ranking med de tydligaste riskerna och mojligheterna i verksamheten."
            />
            <div className="mt-6 space-y-3">
              {priorityList.map((item) => (
                <Link key={`${item.rank}-${item.label}`} href={item.href} className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200/70 bg-white px-4 py-4 transition hover:bg-slate-50/70">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-[11px] font-medium text-slate-600">{item.rank}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-950">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.value}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusChipClass(item.status)}`}>{item.status}</span>
                    <p className="mt-2 text-sm font-medium text-slate-900">{item.trend}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section {...fadeUp} transition={{ duration: 0.4 }} className={`${sectionClass} p-5 sm:p-6`}>
          <SectionHeader
            eyebrow="Actionable Intelligence"
            title="Tre tydliga rekommendationer."
            description="AI visar vad som bor goras nu, inte tolv boxar att tolka."
          />
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {analytics.recommendations.slice(0, 3).map((item) => (
              <Link key={item.title} href={item.href} className={`rounded-[24px] border border-slate-200/70 p-5 transition hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)] ${toneSurfaceClass(item.tone)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotClass(item.tone)}`} />
                    <p className="text-sm font-medium text-slate-950">{item.title}</p>
                  </div>
                  <span className="rounded-full border border-violet-200/80 bg-violet-50/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-violet-700">AI</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.detail}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-950">
                  {item.actionLabel}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
        <motion.section {...fadeUp} transition={{ duration: 0.42 }} className={`${sectionClass} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-slate-200/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <SectionHeader
              eyebrow="Detailed Analytics"
              title="Sekundara detaljer nar du vill ga djupare."
              description="Tabeller och fordjupning halls undan tills du aktivt oppnar dem."
            />
            <button
              type="button"
              onClick={() => setDetailsOpen((current) => !current)}
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {detailsOpen ? "Dolj detaljer" : "Visa detaljer"}
              {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {detailsOpen ? (
            <div className="p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap gap-2">
                {detailButtons.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      detailTab === tab.id
                        ? "border-slate-300 bg-slate-950 text-white"
                        : "border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {detailTab === "revenue" ? (
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {analytics.revenueAnalysis.cards.map((card) => (
                      <div key={card.label} className={`rounded-[22px] border border-slate-200/70 p-4 ${toneSurfaceClass(card.tone)}`}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${toneChipClass(card.tone)}`}>{card.trend}</span>
                        </div>
                        <p className="mt-3 text-[1.45rem] font-semibold tracking-[-0.04em] text-slate-950">{card.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{card.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Forecast</p>
                      <div className="mt-4 space-y-3">
                        {analytics.revenueAnalysis.forecast.map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm">
                            <span className="text-slate-600">{item.label}</span>
                            <span className="font-medium text-slate-950">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Revenue leakage</p>
                      <div className="mt-4 space-y-3">
                        {analytics.revenueAnalysis.leakage.map((item) => (
                          <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${dotClass(item.tone)}`} />
                              <p className="text-sm font-medium text-slate-950">{item.title}</p>
                            </div>
                            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {detailTab === "pipeline" ? (
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {analytics.pipelineAnalysis.summaryCards.map((card) => (
                        <div key={card.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                          <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">{card.value}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{card.note}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Stage analytics</p>
                      <div className="mt-4 space-y-3">
                        {analytics.pipelineAnalysis.stages.slice(0, 4).map((stage) => (
                          <div key={stage.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-950">{stage.label}</p>
                                <p className="mt-1 text-sm text-slate-500">{stage.count} affarer · {stage.value}</p>
                              </div>
                              <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] text-slate-600">{stage.probability}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                              <span>Konvertering: {stage.conversion}</span>
                              <span>Dropoff: {stage.dropoff}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Conversion heatmap</p>
                      <div className="mt-4 space-y-3">
                        {analytics.pipelineAnalysis.heatmap.map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="text-slate-600">{item.label}</span>
                              <span className="font-medium text-slate-950">{item.percentage}%</span>
                            </div>
                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a,#475569)]" style={{ width: `${item.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Lost reasons</p>
                      <div className="mt-4 space-y-3">
                        {analytics.pipelineAnalysis.lostReasons.length > 0 ? analytics.pipelineAnalysis.lostReasons.map((item) => (
                          <div key={item.reason} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm">
                            <span className="text-slate-600">{item.reason}</span>
                            <span className="font-medium text-slate-950">{item.count}</span>
                          </div>
                        )) : <p className="text-sm text-slate-500">Inga tapporsaker registrerade ännu.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {detailTab === "customers" ? (
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {analytics.customerAnalysis.summaryCards.map((card) => (
                        <div key={card.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                          <p className="mt-3 text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">{card.value}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{card.note}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Segmentering</p>
                      <div className="mt-4 space-y-3">
                        {analytics.customerAnalysis.segments.map((segment) => (
                          <div key={segment.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-950">{segment.label}</p>
                                <p className="mt-1 text-sm text-slate-500">{segment.value} kunder</p>
                              </div>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] ${toneChipClass(segment.tone)}`}>{segment.percentage}%</span>
                            </div>
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full rounded-full ${dotClass(segment.tone)}`} style={{ width: `${Math.max(segment.percentage, 6)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                    <p className="text-sm font-medium text-slate-950">Mest vardefulla kunder</p>
                    <div className="mt-4 space-y-3">
                      {analytics.customerAnalysis.topCustomers.map((customer) => (
                        <div key={customer.name} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-950">{customer.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{customer.health} · {customer.status}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium text-slate-950">{customer.revenue}</p>
                            <p className="mt-1 text-slate-500">Score {customer.score}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {detailTab === "operations" ? (
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Performance system</p>
                      <div className="mt-4 space-y-3">
                        {analytics.performanceBars.map((item) => (
                          <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-950">{item.label}</p>
                                <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                              </div>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] ${toneChipClass(item.tone)}`}>{item.status}</span>
                            </div>
                            <div className="mt-4 flex items-end justify-between gap-3">
                              <p className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{item.value}</p>
                              <p className="text-xs text-slate-400">{item.target}</p>
                            </div>
                            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full" style={{ width: `${Math.max(6, item.progress)}%`, background: `linear-gradient(90deg, ${chartColor(item.tone)}, rgba(255,255,255,0.95))` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Kommande bokningar</p>
                      <div className="mt-4 space-y-3">
                        {analytics.operationsAnalysis.upcomingBookings.map((booking) => (
                          <div key={`${booking.title}-${booking.time}`} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-950">{booking.title}</p>
                                <p className="mt-1 text-sm text-slate-500">{booking.customer}</p>
                              </div>
                              <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] text-slate-600">{booking.status}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{booking.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">Team snapshot</p>
                      <div className="mt-4 space-y-3">
                        {analytics.teamAnalysis.members.slice(0, 4).map((member) => (
                          <div key={member.name} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-slate-950">{member.name}</p>
                                <p className="mt-1 text-sm text-slate-500">{member.activity}</p>
                              </div>
                              <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] text-slate-600">{member.status}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                              <span>Workload: {member.workload}</span>
                              <span>Tasks: {member.openTasks}</span>
                              <span>Svarstid: {member.responseTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {detailTab === "tables" ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {tableTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedTable(tab.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition ${
                            selectedTable === tab.id
                              ? "border-slate-300 bg-slate-950 text-white"
                              : "border-slate-200/80 bg-slate-50/80 text-slate-600 hover:bg-white"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadCsv(`${selectedTable}.csv`, tableConfig.columns, tableConfig.rows)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download className="h-4 w-4" />
                      Exportera CSV
                    </button>
                  </div>
                  <DataTable columns={tableConfig.columns} rows={tableConfig.rows} />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              {detailPreview.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => {
                    setDetailTab(item.tab);
                    setDetailsOpen(true);
                  }}
                  className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-5 text-left transition hover:bg-white"
                >
                  <p className="text-sm font-medium text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </button>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </CrmShell>
  );
}
