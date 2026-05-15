"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  FileCheck,
  FileClock,
  FilePenLine,
  FileSearch,
  LoaderCircle,
  Signature,
  Sparkles,
} from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { createQuoteAction, updateQuoteStatusAction } from "@/lib/actions/crm";
import type { QuotesData } from "@/lib/server/business-data";

function QuoteComposer({ customerOptions }: { customerOptions: QuotesData["customerOptions"] }) {
  const [state, action, pending] = useActionState(createQuoteAction, initialActionState);
  const [customerId, setCustomerId] = useState(customerOptions[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState<
    "DRAFT" | "SENT" | "VIEWED" | "APPROVED" | "REJECTED" | "EXPIRED"
  >("DRAFT");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setCustomerId((current) => current || customerOptions[0]?.id || "");
  }, [customerOptions]);

  useEffect(() => {
    if (state.status === "success") {
      setTitle("");
      setAmount("");
      setValidUntil("");
      setStatus("DRAFT");
      setDescription("");
    }
  }, [state.status]);

  return (
    <ShellCard title="Skapa offert" eyebrow="Riktig dataskrivning" action="Ny offert">
      {customerOptions.length > 0 ? (
        <form action={action} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Kund</span>
              <select
                name="customerId"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              >
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Status</span>
              <select
                name="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "DRAFT"
                      | "SENT"
                      | "VIEWED"
                      | "APPROVED"
                      | "REJECTED"
                      | "EXPIRED",
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              >
                <option value="DRAFT">Utkast</option>
                <option value="SENT">Skickad</option>
                <option value="VIEWED">Oppnad</option>
                <option value="APPROVED">Godkand</option>
                <option value="REJECTED">Avbojd</option>
                <option value="EXPIRED">Utgangen</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Titel</span>
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Serviceavtal 2026"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Belopp</span>
              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="25000"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
              />
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Giltig till
              </span>
              <input
                name="validUntil"
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              />
            </label>
          </div>
          <textarea
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Beskriv scope, leverans, antaganden och tydligt nasta steg."
            rows={4}
            className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-sm ${
                state.status === "error"
                  ? "text-rose-500"
                  : state.status === "success"
                    ? "text-emerald-700"
                    : "text-slate-500"
              }`}
            >
              {state.message ?? "Sparar en riktig offert i databasen for vald kund."}
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Skapa offert
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
          Skapa minst en kund först, sa kan du sedan skapa riktiga offerter här.
        </div>
      )}
    </ShellCard>
  );
}

function QuoteRow({ quote }: { quote: QuotesData["quotes"][number] }) {
  const [state, action, pending] = useActionState(updateQuoteStatusAction, initialActionState);
  const statusOptions: Record<
    QuotesData["quotes"][number]["state"],
    { nextStatus: string; nextLabel: string }
  > = {
    Utkast: { nextStatus: "SENT", nextLabel: "Markera som skickad" },
    Skickad: { nextStatus: "VIEWED", nextLabel: "Markera som oppnad" },
    Oppnad: { nextStatus: "APPROVED", nextLabel: "Markera som godkand" },
    Godkand: { nextStatus: "SENT", nextLabel: "Ateroppna" },
    Avbojd: { nextStatus: "DRAFT", nextLabel: "Skapa ny version" },
    Utgangen: { nextStatus: "DRAFT", nextLabel: "Fornya offert" },
  };

  const nextAction = statusOptions[quote.state];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-slate-950">{quote.title}</p>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
              {quote.quoteNumber}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            <Link href={`/kunder/${quote.customerId}`} className="font-medium text-slate-700 hover:text-emerald-700">
              {quote.customerName}
            </Link>
            {" · "}
            {quote.amount}
            {" · "}
            Giltig till {quote.validUntil}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          {quote.state}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{quote.note}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-400">Agare: {quote.owner}</p>
        <form action={action} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="quoteId" value={quote.id} />
          <input type="hidden" name="status" value={nextAction.nextStatus} />
          <p
            className={`text-xs ${
              state.status === "error"
                ? "text-rose-500"
                : state.status === "success"
                  ? "text-emerald-700"
                  : "text-slate-400"
            }`}
          >
            {state.message ?? "Byt status direkt fran listan."}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
            {nextAction.nextLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export function QuotesPage({ data }: { data?: QuotesData }) {
  const quotesData: QuotesData = data ?? {
    statusCards: [
      {
        label: "Utkast",
        value: "0",
        note: "Offerter visas nar riktiga poster finns i databasen.",
        tone: "slate",
      },
      {
        label: "Skickade",
        value: "0",
        note: "Skickade offerter blir levande nar teamet arbetar i modulen.",
        tone: "amber",
      },
      {
        label: "Godkanda",
        value: "0",
        note: "Godkanda offerter syns nar de sparas och uppdateras.",
        tone: "emerald",
      },
      {
        label: "Riskzon",
        value: "0",
        note: "Avbojda eller utgangna offerter samlas har.",
        tone: "rose",
      },
    ],
    quotes: [],
    customerOptions: [],
    suggestions: [
      "Skapa forsta offerten for att bygga en riktig kommersiell historik.",
      "Folj upp skickade offerter direkt fran samma vy.",
      "Koppla senare godkanda offerter till bokning och fakturering.",
    ],
    principles: [
      "Varje offert ska ha tydlig agare och status.",
      "Kommersiella steg ska ga att folja i samma system som kunden.",
      "Offertflodet ska vara operativt, inte bara presenteras som demo.",
    ],
  };

  return (
    <CrmShell
      title="Offerter med tydlig status och nästa steg"
      description="Skapa, följ upp och driva riktiga offerter i samma arbetsyta som kunder, bokningar och fakturering."
    >
      <div className="grid gap-5">
        <QuoteComposer customerOptions={quotesData.customerOptions} />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Offerter just nu" eyebrow="Kommersiellt lager" action="Status">
              <div className="grid gap-4 lg:grid-cols-4">
                {quotesData.statusCards.map((item) => {
                  const Icon =
                    item.label === "Utkast"
                      ? FilePenLine
                      : item.label === "Skickade"
                        ? FileClock
                        : item.label === "Godkanda"
                          ? FileCheck
                          : FileSearch;
                  const toneClass =
                    item.tone === "emerald"
                      ? "border-emerald-200 bg-emerald-50"
                      : item.tone === "amber"
                        ? "border-amber-200 bg-amber-50"
                        : item.tone === "rose"
                          ? "border-rose-200 bg-rose-50"
                          : "border-slate-200 bg-white";

                  return (
                    <div key={item.label} className={`rounded-[24px] border p-4 ${toneClass}`}>
                      <Icon className="h-5 w-5 text-emerald-700" />
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            </ShellCard>

            <ShellCard title="Senaste offerter" eyebrow="Verklig historik" action="Aktiv lista">
              <div className="space-y-3">
                {quotesData.quotes.length > 0 ? (
                  quotesData.quotes.map((quote) => <QuoteRow key={quote.id} quote={quote} />)
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    Inga offerter finns ännu. Skapa första offerten ovan for att aktivera den kommersiella historiken.
                  </div>
                )}
              </div>
            </ShellCard>
          </div>

          <div className="grid gap-5">
            <ShellCard title="Approval flow" eyebrow="Process">
              <div className="space-y-3">
                {quotesData.principles.map((step) => (
                  <div
                    key={step}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="AI-stod" eyebrow="Assistentlager">
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Operativ offertcoachning
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  AI kan nu arbeta ovanpa verkliga kunder, offerter och aktiviteter. Anvand den for att skriva scope, foresla uppfoljning och identifiera nar en offert bor bli ett mote i stallet for ett till mejl.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-950">
                  <Signature className="h-4 w-4 text-emerald-700" />
                  E-signering och godkannandeflode kan byggas som nasta lager ovanpa den riktiga offertmodellen.
                </div>
                <div className="mt-4 space-y-2">
                  {quotesData.suggestions.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-emerald-200/70 bg-white/80 p-3 text-sm leading-6 text-slate-600"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </ShellCard>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
