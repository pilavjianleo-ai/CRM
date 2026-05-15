"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { updateLeadStageAction } from "@/lib/actions/crm";

const stageChoices = [
  { value: "NEW", label: "Ny" },
  { value: "QUALIFIED", label: "Kontaktad" },
  { value: "PROPOSAL", label: "Offert skickad" },
  { value: "WON", label: "Bokad" },
  { value: "LOST", label: "Förlorad" },
] as const;

type PipelineStageValue = (typeof stageChoices)[number]["value"];

type PipelineDeal = {
  id: string;
  name: string;
  value: string;
  score: number;
  status: string;
  nextAction: string;
  owner: string;
  latestActivity: string;
  note: string;
};

type PipelineStage = {
  title: string;
  stageKey: PipelineStageValue;
  value: string;
  deals: PipelineDeal[];
};

function PipelineDealCard({
  deal,
  stageKey,
  canPersist,
  onDragStart,
  dragDisabled,
}: {
  deal: PipelineDeal;
  stageKey: PipelineStageValue;
  canPersist: boolean;
  onDragStart: (dealId: string) => void;
  dragDisabled: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    updateLeadStageAction,
    initialActionState,
  );
  const [selectedStage, setSelectedStage] = useState<PipelineStageValue>(stageKey);

  useEffect(() => {
    setSelectedStage(stageKey);
  }, [stageKey]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div
      draggable={canPersist && !dragDisabled}
      onDragStart={() => {
        if (canPersist && !dragDisabled) {
          onDragStart(deal.id);
        }
      }}
      className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-950">{deal.name}</p>
          <p className="mt-1 text-xs text-slate-500">{deal.value}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
          Score {deal.score}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(5,150,105,0.92),rgba(132,204,22,0.92))]"
          style={{ width: `${deal.score}%` }}
        />
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-500">
        <div className="flex items-center justify-between gap-3">
          <span>Status</span>
          <span className="text-slate-700">{deal.status}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Ägare</span>
          <span className="text-slate-700">{deal.owner}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Senaste aktivitet</span>
          <span className="text-right text-slate-700">{deal.latestActivity}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{deal.note}</p>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Nästa steg
        </p>
        <p className="mt-2 text-sm text-slate-700">{deal.nextAction}</p>
      </div>
      <form action={action} className="mt-4 grid gap-3">
        <input type="hidden" name="leadId" value={deal.id} />
        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Flytta i pipeline
          </span>
          <select
            name="stage"
            value={selectedStage}
            onChange={(event) =>
              setSelectedStage(event.target.value as PipelineStageValue)
            }
            disabled={!canPersist || pending}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {stageChoices.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={`text-sm ${
              state.status === "error" ? "text-rose-500" : "text-slate-500"
            }`}
          >
            {!canPersist
              ? "Demo-data kan inte sparas."
              : state.message ?? "Ändringen sparas direkt i systemet."}
          </p>
          <button
            type="submit"
            disabled={!canPersist || pending || selectedStage === stageKey}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Spara steg
          </button>
        </div>
      </form>
    </div>
  );
}

export function PipelinePage({
  data,
}: {
  data?: {
    stages?: PipelineStage[];
  };
}) {
  const router = useRouter();
  const pipelineStages = useMemo(() => data?.stages ?? [], [data?.stages]);
  const canPersist = Boolean(data?.stages);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("Alla");
  const [stageFilter, setStageFilter] = useState("Alla");
  const [boardStages, setBoardStages] = useState<PipelineStage[]>(() => pipelineStages);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragMessage, setDragMessage] = useState<string>("");
  const [isDraggingStage, startDragTransition] = useTransition();

  useEffect(() => {
    setBoardStages(pipelineStages);
  }, [pipelineStages]);

  const ownerOptions = useMemo(() => {
    return [
      "Alla",
      ...Array.from(
        new Set(
          boardStages.flatMap((stage) =>
            stage.deals.map((deal) => deal.owner),
          ),
        ),
      ),
    ];
  }, [boardStages]);

  const stageOptions = useMemo(() => {
    return ["Alla", ...boardStages.map((stage) => stage.title)];
  }, [boardStages]);

  const filteredStages = useMemo(() => {
    return boardStages
      .map((stage) => {
        const matchesStage =
          stageFilter === "Alla" || stage.title === stageFilter;

        if (!matchesStage) {
          return { ...stage, deals: [] };
        }

        const deals = stage.deals.filter((deal) => {
          const matchesSearch =
            search.trim() === "" ||
            deal.name.toLowerCase().includes(search.toLowerCase()) ||
            deal.nextAction.toLowerCase().includes(search.toLowerCase()) ||
            deal.note.toLowerCase().includes(search.toLowerCase());
          const matchesOwner =
            ownerFilter === "Alla" || deal.owner === ownerFilter;

          return matchesSearch && matchesOwner;
        });

        return { ...stage, deals };
      })
      .filter((stage) => stage.deals.length > 0);
  }, [boardStages, ownerFilter, search, stageFilter]);

  const visibleDeals = filteredStages.flatMap((stage) => stage.deals);
  const highPriorityDeals = visibleDeals.filter((deal) => deal.score >= 85).length;
  const stalledDeals = visibleDeals.filter((deal) =>
    deal.latestActivity.toLowerCase().includes("dagar") ||
    deal.latestActivity.toLowerCase().includes("no reply"),
  ).length;
  const strongestStage =
    [...boardStages].sort((a, b) => b.deals.length - a.deals.length)[0]?.title ?? "Ingen ännu";

  const coachItems = useMemo(() => {
    const sortedDeals = [...visibleDeals].sort((a, b) => b.score - a.score);
    return [
      sortedDeals[0]
        ? `${sortedDeals[0].name} är starkaste affären just nu. ${sortedDeals[0].nextAction}`
        : null,
      stalledDeals > 0
        ? `${stalledDeals} affärer tappar fart och bör få mänsklig uppföljning i dag.`
        : null,
      highPriorityDeals > 0
        ? `${highPriorityDeals} affärer ligger över score 85 och bör prioriteras före lägre intent.`
        : null,
    ].filter(Boolean) as string[];
  }, [highPriorityDeals, stalledDeals, visibleDeals]);

  const frictionItems = useMemo(() => {
    return boardStages.slice(0, -1).map((stage, index) => {
      const nextStage = boardStages[index + 1];
      const ratio =
        stage.deals.length > 0
          ? Math.round((nextStage.deals.length / Math.max(stage.deals.length, 1)) * 100)
          : 0;

      return {
        label: `${stage.title} -> ${nextStage.title}`,
        value: `${Math.min(ratio, 100)}%`,
        note:
          ratio < 40
            ? "Flödet tappar fart här och kräver tydligare nästa steg."
            : ratio < 70
              ? "Steget rör sig, men borde få snabbare mänsklig uppföljning."
              : "Bra rörelse mellan stegen just nu.",
      };
    });
  }, [boardStages]);

  function moveDeal(stagesToMove: PipelineStage[], dealId: string, targetStageKey: PipelineStageValue) {
    let draggedDeal: PipelineDeal | null = null;
    const withoutDeal = stagesToMove.map((stage) => ({
      ...stage,
      deals: stage.deals.filter((deal) => {
        if (deal.id === dealId) {
          draggedDeal = deal;
          return false;
        }

        return true;
      }),
    }));

    if (!draggedDeal) {
      return stagesToMove;
    }

    const dealToMove = draggedDeal;

    return withoutDeal.map((stage) =>
      stage.stageKey === targetStageKey
        ? {
            ...stage,
            deals: [dealToMove, ...stage.deals],
          }
        : stage,
    );
  }

  function handleDrop(targetStageKey: PipelineStageValue) {
    if (!canPersist || !draggedDealId) {
      return;
    }

    const currentStage = boardStages.find((stage) =>
      stage.deals.some((deal) => deal.id === draggedDealId),
    );

    if (!currentStage || currentStage.stageKey === targetStageKey) {
      setDraggedDealId(null);
      return;
    }

    const optimisticStages = moveDeal(boardStages, draggedDealId, targetStageKey);
    setBoardStages(optimisticStages);
    setDraggedDealId(null);

    const formData = new FormData();
    formData.set("leadId", draggedDealId);
    formData.set("stage", targetStageKey);

    startDragTransition(async () => {
      const result = await updateLeadStageAction(initialActionState, formData);

      setDragMessage(result.message ?? "");

      if (result.status === "error") {
        setBoardStages(pipelineStages);
        return;
      }

      router.refresh();
    });
  }

  return (
    <CrmShell
      title="Pipeline med tydliga steg, ansvar och nästa drag"
      description="Arbeta i ett strukturerat flöde från ny möjlighet till bokad och slutförd affär, med AI-stöd där det faktiskt hjälper."
    >
      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.85fr]">
        <div className="grid gap-5">
          <ShellCard title="Pipelineöversikt" eyebrow="Viktade intäkter" action="Öppna prognos">
            <div className="grid gap-4 lg:grid-cols-4">
              {[
                { label: "Synliga affärer", value: `${visibleDeals.length}`, note: "Efter nuvarande sök och filter" },
                { label: "Hög prioritet", value: `${highPriorityDeals}`, note: "Score 85 eller högre" },
                { label: "Behöver räddas", value: `${stalledDeals}`, note: "Tappat fart eller saknar svar" },
                  { label: "Starkaste steg", value: strongestStage, note: "Flest synliga affärer just nu" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Arbeta i flödet" eyebrow="Sök och filtrera">
            <div className="grid gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Sök företag eller nästa steg..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {ownerOptions.map((owner) => (
                  <button
                    key={owner}
                    onClick={() => setOwnerFilter(owner)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                      ownerFilter === owner
                        ? "bg-emerald-600 text-white shadow-[0_0_0_1px_rgba(5,150,105,0.18)]"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {owner}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {stageOptions.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                      stageFilter === stage
                        ? "bg-emerald-600 text-white shadow-[0_0_0_1px_rgba(5,150,105,0.18)]"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {stage}
                  </button>
                ))}
              </div>
              {dragMessage ? (
                <p className="text-sm text-emerald-700">{dragMessage}</p>
              ) : null}
              {isDraggingStage ? (
                <p className="text-sm text-slate-500">Uppdaterar pipelinen...</p>
              ) : null}
            </div>
          </ShellCard>

          <div className="grid gap-5 2xl:grid-cols-3 xl:grid-cols-2">
            {filteredStages.map((stage) => (
              <section
                key={stage.title}
                onDragOver={(event) => {
                  if (canPersist) {
                    event.preventDefault();
                  }
                }}
                onDrop={() => handleDrop(stage.stageKey)}
                className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">{stage.title}</p>
                    <p className="text-xs text-slate-500">{stage.value}</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                    {stage.deals.length} affärer
                  </span>
                </div>

                <div className="space-y-3">
                  {stage.deals.map((deal) => (
                    <PipelineDealCard
                      key={deal.id}
                      deal={deal}
                      stageKey={stage.stageKey}
                      canPersist={canPersist}
                      onDragStart={setDraggedDealId}
                      dragDisabled={isDraggingStage}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {filteredStages.length === 0 ? (
            <ShellCard title="Ingen affär matchar" eyebrow="Tomt resultat">
              <p className="text-sm leading-7 text-slate-600">
                Prova ett bredare sök eller byt ägarfilter för att visa fler affärer i pipelinen.
              </p>
            </ShellCard>
          ) : null}
        </div>

        <div className="grid gap-5">
          <ShellCard title="AI-coachning" eyebrow="Coach" action="Öppna AI">
            <div className="space-y-3">
              {coachItems.length > 0 ? (
                coachItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-white p-4"
                  >
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))
              ) : (
                <div
                  className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4"
                >
                  <p className="text-sm leading-6 text-slate-500">
                    När riktiga affärer finns i pipelinen syns coachning här baserat på verkliga scores och steg.
                  </p>
                </div>
              )}
            </div>
          </ShellCard>

          <ShellCard title="Friktion mellan steg" eyebrow="Insikter">
            <div className="space-y-4">
              {frictionItems.length > 0 ? (
                frictionItems.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-emerald-700">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(5,150,105,0.9),rgba(132,204,22,0.9))]"
                        style={{ width: item.value }}
                      />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-sm leading-6 text-slate-500">
                    Friktionen mellan steg visas här när det finns tillräckligt med affärer i flera steg.
                  </p>
                </div>
              )}
            </div>
          </ShellCard>

          <ShellCard title="Åtgärder" eyebrow="Nästa drag">
            <div className="space-y-3">
              <Link
                href="/leads"
                className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
              >
                <span className="text-sm leading-6 text-slate-600">Redigera leads med svag uppföljning.</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" />
              </Link>
              <Link
                href="/uppgifter"
                className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
              >
                <span className="text-sm leading-6 text-slate-600">Skapa uppgifter för affärer som måste räddas.</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" />
              </Link>
              <Link
                href="/ai-assistent"
                className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
              >
                <span className="text-sm leading-6 text-slate-600">Kör AI för uppföljning, risk eller offertförslag.</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" />
              </Link>
            </div>
          </ShellCard>

          <ShellCard title="Prognosens tillit" eyebrow="AI-signal">
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Tillit {visibleDeals.length > 0 ? `${Math.min(95, 55 + highPriorityDeals * 5)}%` : "0%"}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {visibleDeals.length > 0
                  ? "Prognosen bygger nu på verkliga synliga affärer, deras score och hur de rör sig mellan stegen."
                  : "När affärer finns i pipelinen visas en verklig prognossignal här."}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-950">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                {strongestStage !== "Ingen ännu"
                  ? `Starkast momentum just nu i steget ${strongestStage}`
                  : "Inget steg har tydligt momentum ännu"}
              </div>
            </div>
          </ShellCard>
        </div>
      </div>
    </CrmShell>
  );
}
