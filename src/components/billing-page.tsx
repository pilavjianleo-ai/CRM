"use client";

import { useActionState } from "react";
import { useEffect, useState } from "react";
import { CreditCard, LoaderCircle, Receipt, ShieldCheck } from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { createInvoiceAction } from "@/lib/actions/crm";
import type { BillingData } from "@/lib/server/business-data";

const fallbackData: BillingData = {
  overview: [
    {
      label: "Plan",
      value: "STARTER",
      note: "Demo-data visas tills fakturor och kunder finns i databasen.",
    },
    {
      label: "Nästa förfallo",
      value: "Ingen öppen",
      note: "Skapa en riktig faktura för att få levande data här.",
    },
    {
      label: "Aktiva användare",
      value: "0",
      note: "Visas från arbetsytans användare när databasen är tillgänglig.",
    },
  ],
  invoices: [],
  paymentMethod: {
    label: "Säker manuell betalhantering",
    note: "Extern betalprovider är ännu inte inkopplad.",
  },
  billingSignals: [
    "Fakturering läser nu riktiga data när arbetsytan har kund- och fakturaposter.",
    "Skapa första fakturan från formuläret för att aktivera flödet.",
    "Försenade fakturor kommer att synas här när de finns i databasen.",
  ],
  nextSteps: [
    "Skapa första fakturan för en kund.",
    "Följ upp öppna fakturor från samma vy.",
    "Utöka senare med betalprovider och automatiska påminnelser.",
  ],
  trustNotes: [
    "Fakturor är workspace-isolerade.",
    "Status och belopp sparas i databasen.",
    "UI:t är nu kopplat till riktiga actions i stället för ren demo.",
  ],
  customerOptions: [],
};

function InvoiceComposer({ customerOptions }: { customerOptions: BillingData["customerOptions"] }) {
  const [state, action, pending] = useActionState(createInvoiceAction, initialActionState);
  const [customerId, setCustomerId] = useState(customerOptions[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID">("SENT");

  useEffect(() => {
    setCustomerId((current) => current || customerOptions[0]?.id || "");
  }, [customerOptions]);

  useEffect(() => {
    if (state.status === "success") {
      setAmount("");
      setDueDate("");
      setStatus("SENT");
    }
  }, [state.status]);

  return (
    <ShellCard title="Skapa faktura" eyebrow="Riktig dataskrivning" action="Kundfaktura">
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
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Förfaller</span>
              <input
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Status</span>
              <select
                name="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID",
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              >
                <option value="DRAFT">Utkast</option>
                <option value="SENT">Skickad</option>
                <option value="PAID">Betald</option>
                <option value="OVERDUE">Försenad</option>
                <option value="VOID">Makulerad</option>
              </select>
            </label>
          </div>
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
              {state.message ?? "Skapar en riktig fakturapost i databasen för vald kund."}
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Skapa faktura
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
          Skapa minst en kund först, så kan du sedan skapa riktiga fakturor här.
        </div>
      )}
    </ShellCard>
  );
}

export function BillingPage({ data }: { data?: BillingData }) {
  const billingData = data ?? fallbackData;

  return (
    <CrmShell
      title="Fakturering som en tydlig affärsyta"
      description="Se abonnemang, betalningsstatus, fakturahistorik och ekonomiska risker i en strukturerad vy som hör ihop med resten av systemet."
    >
      <div className="grid gap-5">
        <InvoiceComposer customerOptions={billingData.customerOptions} />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Abonnemang och nästa dragning" eyebrow="Workspace plan" action="Ändra plan">
              <div className="grid gap-4 lg:grid-cols-3">
                {billingData.overview.map((item) => (
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
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Senaste fakturor" eyebrow="Historik" action="Ladda ner">
              <div className="space-y-3">
                {billingData.invoices.length > 0 ? (
                  billingData.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-950">{invoice.id}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {invoice.customer} · {invoice.date} · {invoice.total}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        {invoice.state}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    Inga fakturor ännu. Skapa en första faktura ovan för att starta historiken.
                  </div>
                )}
              </div>
            </ShellCard>
          </div>

          <div className="grid gap-5">
            <ShellCard title="Betalningsmetod" eyebrow="Kort">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-950">
                  <CreditCard className="h-4 w-4 text-emerald-700" />
                  {billingData.paymentMethod.label}
                </p>
                <p className="mt-2 text-sm text-slate-500">{billingData.paymentMethod.note}</p>
              </div>
            </ShellCard>

            <ShellCard title="Faktureringsstatus" eyebrow="Trygghet">
              <div className="space-y-3">
                {billingData.trustNotes.map((item, index) => {
                  const Icon = index === 0 ? Receipt : ShieldCheck;
                  return (
                    <div
                      key={item}
                      className="rounded-[22px] border border-slate-200 bg-white p-4"
                    >
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  );
                })}
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ShellCard title="Ekonomiska signaler" eyebrow="Vad att bevaka" action="Öppna fakturering">
            <div className="space-y-3">
              {billingData.billingSignals.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Kommande ekonomiåtgärder" eyebrow="Nästa steg">
            <div className="space-y-3">
              {billingData.nextSteps.map((item) => (
                <div
                  key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left"
                >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <CreditCard className="h-4 w-4 shrink-0 text-emerald-700" />
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Förtroende och säkerhet" eyebrow="Compliance">
            <div className="space-y-3">
              {billingData.trustNotes.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </ShellCard>
        </div>
      </div>
    </CrmShell>
  );
}
