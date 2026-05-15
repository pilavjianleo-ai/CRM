"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Orbit,
  Radar,
  Send,
  Sparkles,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import {
  initialActionState,
  initialAIAssistantActionState,
  type ActionState,
  type AIAssistantActionState,
} from "@/lib/actions/action-state";
import {
  createAutomationFromAIInsightAction,
  createTaskFromAIInsightAction,
  runAIAssistantAction,
} from "@/lib/actions/crm";
import type { AIAssistantData } from "@/lib/server/business-data";

const fallbackData: AIAssistantData = {
  hero: {
    eyebrow: "AI-native workspace",
    title: "Aktivera AI-workspace med verklig kontext",
    summary:
      "Nar kunder, leads, bokningar och uppgifter fylls pa blir AI-assistenten ett operativt lager som prioriterar, analyserar och driver arbete framåt.",
    watchLabel: "AI invantar mer historik i arbetsytan",
    primaryCommand: {
      label: "Kor dagens AI-plan",
      prompt: "Sammanfatta arbetsytan och foresla tre nasta steg som driver verksamheten framåt.",
    },
    secondaryCommands: [
      {
        label: "Analysera pipeline",
        prompt: "Analysera pipelinen och hitta flaskhalsar i dagens affarsflode.",
      },
      {
        label: "Prioritera kunder",
        prompt: "Prioritera vilka kunder som bor fa mest uppmarksamhet idag.",
      },
      {
        label: "Skapa workflow",
        prompt: "Foresla vilket workflow eller vilken automation som skulle ge mest effekt denna vecka.",
      },
    ],
    statusChips: [
      { label: "AI-minne", value: "0 sparade insikter", tone: "slate" },
      { label: "Risksignaler", value: "0", tone: "slate" },
      { label: "Workflows", value: "0 aktiva", tone: "slate" },
      { label: "Kontekst", value: "0 signaler", tone: "slate" },
    ],
  },
  quickRunCommands: [
    {
      label: "Riskdetektion",
      detail: "Identifiera kunder, leads och fakturor som kräver direkt uppmärksamhet.",
      prompt:
        "Identifiera vilka kunder, leads eller fakturor som ar storst risk just nu och ge en prioriterad handlingslista.",
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
  ],
  watchlist: [],
  workflowCards: [
    {
      title: "Bygg forsta workflowet",
      detail: "Lat AI foresla vilket operativt flode som ger mest effekt att automatisera forst.",
      cta: "Skapa workflow",
      href: "/automationer",
      prompt: "Foresla vilken automation som bor byggas forst i arbetsytan och varfor.",
      tone: "emerald",
    },
  ],
  contextStats: [],
  contextNarrative: [
    "Nar verkliga kunder, leads, bokningar och uppgifter finns kan AI lasa arbetsytan naturligt.",
    "Sparade AI-insikter blir minne som gar att materialisera till uppgifter och workflows.",
  ],
  memoryFeed: [],
  recentInsights: [],
  messages: [],
  openAIConfigured: false,
  latestInsight: undefined,
};

type PromptAction = (formData: FormData) => void;

function quickToneClass(tone: AIAssistantData["quickRunCommands"][number]["tone"]) {
  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50/70";
  }

  if (tone === "amber") {
    return "border-amber-200 bg-amber-50/70";
  }

  if (tone === "violet") {
    return "border-violet-200 bg-violet-50/70";
  }

  return "border-slate-200 bg-slate-50/70";
}

function watchToneClass(tone: AIAssistantData["watchlist"][number]["tone"]) {
  if (tone === "rose") {
    return "border-rose-200 bg-rose-50/70";
  }

  if (tone === "amber") {
    return "border-amber-200 bg-amber-50/70";
  }

  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50/70";
  }

  return "border-slate-200 bg-white";
}

function workflowToneClass(tone: AIAssistantData["workflowCards"][number]["tone"]) {
  if (tone === "emerald") {
    return "from-emerald-100 via-white to-white";
  }

  if (tone === "amber") {
    return "from-amber-100 via-white to-white";
  }

  return "from-violet-100 via-white to-white";
}

function statusToneClass(tone: AIAssistantData["hero"]["statusChips"][number]["tone"]) {
  if (tone === "emerald") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "amber") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (tone === "violet") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function PromptSubmitCard({
  label,
  detail,
  prompt,
  tone,
  formAction,
  pending,
}: {
  label: string;
  detail: string;
  prompt: string;
  tone: AIAssistantData["quickRunCommands"][number]["tone"];
  formAction: PromptAction;
  pending: boolean;
}) {
  return (
    <form action={formAction} className={`rounded-[24px] border p-4 ${quickToneClass(tone)}`}>
      <input type="hidden" name="prompt" value={prompt} />
      <p className="text-sm font-medium text-slate-950">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Kor nu
      </button>
    </form>
  );
}

function AIInsightActionsPanel({
  latestInsight,
}: {
  latestInsight: NonNullable<AIAssistantData["latestInsight"]>;
}) {
  const router = useRouter();
  const [taskState, taskAction, taskPending] = useActionState<ActionState, FormData>(
    createTaskFromAIInsightAction,
    initialActionState,
  );
  const [automationState, automationAction, automationPending] = useActionState<
    ActionState,
    FormData
  >(createAutomationFromAIInsightAction, initialActionState);

  useEffect(() => {
    if (taskState.status === "success" || automationState.status === "success") {
      router.refresh();
    }
  }, [automationState.status, router, taskState.status]);

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Senaste AI-minnet
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            {latestInsight.title}
          </h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          {latestInsight.type} · {latestInsight.time}
        </span>
      </div>

      <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-sm leading-7 text-slate-700">
          {latestInsight.preview.slice(0, 320)}
          {latestInsight.preview.length > 320 ? "..." : ""}
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <form action={taskAction} className="rounded-[22px] border border-slate-200 bg-white p-4">
          <input type="hidden" name="insightId" value={latestInsight.id} />
          <p className="text-sm font-medium text-slate-950">Skapa uppgift</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Materialisera AI-beslutet till ett verkligt arbetssteg i systemet.
          </p>
          <button
            type="submit"
            disabled={taskPending}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {taskPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Skapa uppgift
          </button>
          <p
            className={`mt-3 text-xs ${
              taskState.status === "error"
                ? "text-rose-500"
                : taskState.status === "success"
                  ? "text-emerald-700"
                  : "text-slate-400"
            }`}
          >
            {taskState.message ?? "Gor AI-insikten till en tydlig task med riktig historik."}
          </p>
        </form>

        <form
          action={automationAction}
          className="rounded-[22px] border border-slate-200 bg-white p-4"
        >
          <input type="hidden" name="insightId" value={latestInsight.id} />
          <p className="text-sm font-medium text-slate-950">Skapa workflow</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lat AI-minnet bli ett automationsutkast som skapar verklig rorelse.
          </p>
          <button
            type="submit"
            disabled={automationPending || latestInsight.automationCreated}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {automationPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Workflow className="h-4 w-4" />}
            {latestInsight.automationCreated ? "Workflow skapat" : "Skapa workflow"}
          </button>
          <p
            className={`mt-3 text-xs ${
              automationState.status === "error"
                ? "text-rose-500"
                : automationState.status === "success"
                  ? "text-emerald-700"
                  : "text-slate-400"
            }`}
          >
            {automationState.message ??
              (latestInsight.automationCreated
                ? "Detta AI-minne ar redan kopplat till ett workflow."
                : "Skapar ett operativt workflow direkt fran AI-insikten.")}
          </p>
        </form>
      </div>
    </section>
  );
}

export function AIAssistantPage({ data }: { data?: AIAssistantData }) {
  const assistantData = data ?? fallbackData;
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AIAssistantActionState, FormData>(
    runAIAssistantAction,
    initialAIAssistantActionState,
  );
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      setPrompt("");
      router.refresh();
    }
  }, [router, state.status]);

  const messages = useMemo(() => {
    if (state.status === "success" && state.prompt && state.response) {
      return [
        ...assistantData.messages,
        { id: "live-user", role: "user" as const, text: state.prompt },
        { id: "live-assistant", role: "assistant" as const, text: state.response },
      ];
    }

    return assistantData.messages;
  }, [assistantData.messages, state.prompt, state.response, state.status]);

  const recentMessages = messages.slice(-6);

  return (
    <CrmShell
      title="AI-operatör för verksamheten"
      description="Låt AI läsa arbetsytan, bevaka risker, prioritera arbete och omvandla beslut till riktiga workflows, uppgifter och nästa steg."
    >
      <div className="grid gap-6">
        <section className="relative overflow-hidden rounded-[36px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.92)_48%,rgba(255,255,255,0.98))] p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(168,85,247,0.1),transparent_24%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-emerald-700">
                <BrainCircuit className="h-3.5 w-3.5" />
                {assistantData.hero.eyebrow}
              </div>
              <h2 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                {assistantData.hero.title}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                {assistantData.hero.summary}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <form action={formAction}>
                  <input
                    type="hidden"
                    name="prompt"
                    value={assistantData.hero.primaryCommand.prompt}
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-[0_16px_28px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {assistantData.hero.primaryCommand.label}
                  </button>
                </form>
                {assistantData.hero.secondaryCommands.map((command) => (
                  <form key={command.label} action={formAction}>
                    <input type="hidden" name="prompt" value={command.prompt} />
                    <button
                      type="submit"
                      disabled={pending}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {command.label}
                    </button>
                  </form>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:max-w-2xl">
                {assistantData.hero.statusChips.map((chip) => (
                  <div
                    key={chip.label}
                    className={`rounded-[22px] border px-4 py-4 ${statusToneClass(chip.tone)}`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.22em] opacity-70">
                      {chip.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {chip.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      AI observerar nu
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">
                      {assistantData.hero.watchLabel}
                    </h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Radar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {assistantData.contextNarrative.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`flex items-center gap-3 rounded-[26px] border px-4 py-4 ${
                  assistantData.openAIConfigured
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
                  {assistantData.openAIConfigured ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <TriangleAlert className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    {assistantData.openAIConfigured ? "Extern AI ar aktiv" : "Extern AI ar tillfalligt offline"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {assistantData.openAIConfigured
                      ? "AI kan kora full analys over arbetsytans verkliga kontext."
                      : "Workspace-data och AI-minne visas fortfarande, men nya externa AI-svar kraver API-nyckel."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  AI watchlist
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Operativa signaler
                </h3>
              </div>
              <Orbit className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-5 space-y-3">
              {assistantData.watchlist.length > 0 ? (
                assistantData.watchlist.map((item) => (
                  <div
                    key={`${item.title}-${item.href}`}
                    className={`rounded-[24px] border p-4 ${watchToneClass(item.tone)}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                      </div>
                      <Link
                        href={item.href}
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Oppna
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 p-5 text-sm leading-6 text-slate-500">
                  AI-watchlisten fylls nar systemet ser risker, momentumtapp, blockerare eller mojligheter i verklig data.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  AI workflows
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Starta rorelse i systemet
                </h3>
              </div>
              <Workflow className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="mt-5 grid gap-4">
              {assistantData.workflowCards.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-[26px] border border-slate-200 bg-gradient-to-br p-5 ${workflowToneClass(item.tone)}`}
                >
                  <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <form action={formAction}>
                      <input type="hidden" name="prompt" value={item.prompt} />
                      <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {item.cta}
                      </button>
                    </form>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Oppna modul
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  AI command console
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                  Mindre chat, mer kommandon
                </h3>
              </div>
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {assistantData.quickRunCommands.map((item) => (
                <PromptSubmitCard
                  key={item.label}
                  label={item.label}
                  detail={item.detail}
                  prompt={item.prompt}
                  tone={item.tone}
                  formAction={formAction}
                  pending={pending}
                />
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4">
              <div className="space-y-3">
                {recentMessages.length > 0 ? (
                  recentMessages.map((message) => {
                    const isAssistant = message.role === "assistant";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-[22px] border px-4 py-3 text-sm leading-7 ${
                            isAssistant
                              ? "border-emerald-100 bg-emerald-50 text-slate-700"
                              : "border-slate-200 bg-white text-slate-900"
                          }`}
                        >
                          <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {isAssistant ? "AI-operator" : "Kommando"}
                          </p>
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500">
                    Inga sparade AI-beslut ännu. Kor ett kommando sa skapas ett riktigt AI-minne med historik i arbetsytan.
                  </div>
                )}
              </div>

              <form action={formAction} className="mt-4 rounded-[24px] border border-slate-200 bg-white p-3">
                <div className="flex items-end gap-3">
                  <textarea
                    name="prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Skriv ett business command, till exempel: Identifiera vilka leads som riskerar att tappa momentum eller skapa en retention-plan for tysta kunder..."
                    rows={4}
                    className="min-h-24 flex-1 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p
                    className={`text-sm ${
                      state.status === "error"
                        ? "text-rose-500"
                        : state.status === "success"
                          ? "text-emerald-700"
                          : "text-slate-500"
                    }`}
                  >
                    {state.message ??
                      (assistantData.openAIConfigured
                        ? "AI far arbetsytekontext fran verkliga kunder, leads, bokningar, fakturor, uppgifter och automationer."
                        : "Extern AI ar inte aktiv just nu, men kontext, minne och AI-historik visas fortfarande i workspace-lagret.")}
                  </p>
                  {state.model ? (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                      Modell: {state.model}
                    </span>
                  ) : null}
                </div>
              </form>
            </div>
          </section>

          <div className="grid gap-6">
            {assistantData.latestInsight ? (
              <AIInsightActionsPanel latestInsight={assistantData.latestInsight} />
            ) : null}

            <section className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Kontextmesh
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    Vad AI forstar just nu
                  </h3>
                </div>
                <BrainCircuit className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {assistantData.contextStats.length > 0 ? (
                  assistantData.contextStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 rounded-[22px] border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm leading-6 text-slate-500">
                    Kontextstatistiken fylls nar arbetsytan far verklig anvandning och AI kan lasa fler signaler.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    AI-minne
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    Historik och larande
                  </h3>
                </div>
                <Clock3 className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="mt-5 space-y-3">
                {assistantData.memoryFeed.length > 0 ? (
                  assistantData.memoryFeed.map((item) => (
                    <div
                      key={`${item.title}-${item.time}`}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {item.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm leading-6 text-slate-500">
                    Nar AI-insikter och aktivitetsloggar byggs upp far du ett verkligt minne och ett tydligare beslutslager har.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Senaste AI-beslut
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    Sparade insikter
                  </h3>
                </div>
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-5 space-y-3">
                {assistantData.recentInsights.length > 0 ? (
                  assistantData.recentInsights.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.preview.slice(0, 180)}
                        {item.preview.length > 180 ? "..." : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {item.time}
                        </p>
                        <span className="text-xs text-slate-500">
                          {item.automationCreated ? "Workflow skapat" : "Vantar pa materialisering"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm leading-6 text-slate-500">
                    Sparade AI-beslut visas har sa snart de borjar byggas upp i arbetsytan.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
