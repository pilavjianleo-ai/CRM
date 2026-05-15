"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  FileText,
  HeartPulse,
  MessageSquareText,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { CustomerQuickCreateCard } from "@/components/crm-quick-create";
import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import type { CustomersData } from "@/lib/server/business-data";

const customerTabs = [
  "Översikt",
  "Tidslinje",
  "Bokningar",
  "Offerter",
  "Fakturor",
  "Konversationer",
  "Anteckningar",
  "Dokument",
] as const;

type CustomerTab = (typeof customerTabs)[number];

export function CustomersPage({
  data,
}: {
  data?: CustomersData;
}) {
  const customers = data?.customers ?? [];
  const timeline = data?.timeline ?? [];
  const featuredCustomer = data?.featuredCustomer ?? null;
  const healthSummary = data?.healthSummary ?? [];
  const nextSteps = featuredCustomer?.nextSteps ?? [];
  const bookingItems = featuredCustomer?.bookingItems ?? [];
  const invoiceItems = featuredCustomer?.invoiceItems ?? [];
  const conversationItems = featuredCustomer?.conversationItems ?? [];
  const noteItems = featuredCustomer?.noteItems ?? [];
  const operationsItems = featuredCustomer?.operationsItems ?? [];
  const quickActions = featuredCustomer?.quickActions ?? [];
  const [activeTab, setActiveTab] = useState<CustomerTab>("Översikt");

  const tabContent = {
    Översikt: (
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Relation och ekonomi
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Intäkter", value: featuredCustomer?.revenue ?? "-" },
              { label: "Bokningar", value: featuredCustomer?.bookings ?? "-" },
              { label: "Senaste svar", value: featuredCustomer?.lastReply ?? "-" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] border border-slate-200 bg-white p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-sammanfattning
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {featuredCustomer?.summary ??
                "Kundöversikten fylls när verkliga kunder, bokningar, fakturor och aktiviteter finns i arbetsytan."}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Nästa steg
          </p>
          <div className="mt-4 space-y-3">
            {nextSteps.map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-slate-200 bg-white p-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
            {nextSteps.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                Nästa steg visas när vald kund har verkliga signaler från bokningar, fakturor, dialoger eller aktiviteter.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    Tidslinje: (
      <div className="space-y-3">
        {timeline.map((item) => (
          <div
            key={item.title}
            className="flex gap-4 rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <div className="flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-950">{item.title}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
            </div>
          </div>
        ))}
        {timeline.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Ingen verklig tidslinje finns ännu. Skapa kunder, bokningar, meddelanden eller uppgifter för att bygga historiken.
          </div>
        ) : null}
      </div>
    ),
    Bokningar: (
      <div className="grid gap-3">
        {bookingItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <p className="text-xs text-slate-500">{item.meta}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
        {bookingItems.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Inga verkliga bokningar finns för vald kund ännu.
          </div>
        ) : null}
      </div>
    ),
    Offerter: (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
        Offertmodulen har ännu ingen verklig kundkopplad datamodell i listvyn. Öppna{" "}
        <Link
          href={featuredCustomer?.id ? `/kunder/${featuredCustomer.id}` : "/offerter"}
          className="font-medium text-emerald-700 hover:text-emerald-800"
        >
          kundprofilen eller offertytan
        </Link>{" "}
        för nästa steg.
      </div>
    ),
    Fakturor: (
      <div className="grid gap-3">
        {invoiceItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-[22px] border p-4 ${
              item.tone === "emerald"
                ? "border-emerald-200 bg-emerald-50"
                : item.tone === "amber"
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <p className="text-xs text-slate-500">{item.meta}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
        {invoiceItems.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Inga verkliga fakturor finns för vald kund ännu.
          </div>
        ) : null}
      </div>
    ),
    Konversationer: (
      <div className="grid gap-3">
        {conversationItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <p className="text-xs text-slate-500">{item.meta}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
        {conversationItems.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Ingen verklig konversation finns för vald kund ännu.
          </div>
        ) : null}
      </div>
    ),
    Anteckningar: (
      <div className="grid gap-3">
        {noteItems.map((item) => (
          <div
            key={item.title}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-medium text-slate-950">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
          </div>
        ))}
        {noteItems.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Inga sparade anteckningar eller sammanfattningar finns för vald kund ännu.
          </div>
        ) : null}
      </div>
    ),
    Dokument: (
      <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
        Dokumentmodulen är ännu inte kopplad till verkliga filer i kundlistvyn. När den byggs ut visas uppladdningar, avtal och underlag här i stället för platshållare.
      </div>
    ),
  } satisfies Record<CustomerTab, React.ReactNode>;

  return (
    <CrmShell
      title="Kundrelationer med full kontext"
      description="Varje kund får en tydlig arbetsyta med hälsa, historik, bokningar, offerter, fakturor, konversationer och nästa steg."
    >
      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
        <div className="grid gap-5">
          <CustomerQuickCreateCard />

          <ShellCard
            title="Kundprofil i fokus"
            eyebrow="Header"
            action="Öppna full profil"
          >
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-slate-950">
                      {featuredCustomer?.name ?? "Ingen kund vald ännu"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {featuredCustomer?.contact ?? "Skapa en kund för att bygga den operativa kundytan."}
                    </p>
                  </div>
                  {featuredCustomer ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                      {featuredCustomer.health} {featuredCustomer.score}
                    </span>
                  ) : null}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {featuredCustomer?.id ? (
                    <Link
                      href={`/kunder/${featuredCustomer.id}`}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      Ny aktivitet
                    </Link>
                  ) : (
                    <button className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700">
                      Ny aktivitet
                    </button>
                  )}
                  {featuredCustomer?.id ? (
                    <Link
                      href={`/kunder/${featuredCustomer.id}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Skicka meddelande
                    </Link>
                  ) : (
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Skicka meddelande
                    </button>
                  )}
                  {featuredCustomer?.id ? (
                    <Link
                      href={`/kunder/${featuredCustomer.id}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Skapa bokning
                    </Link>
                  ) : (
                    <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      Skapa bokning
                    </button>
                  )}
                </div>
              </div>
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Relationens läge
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Hälsa", value: featuredCustomer?.health ?? "-" },
                    { label: "Kundscore", value: featuredCustomer ? String(featuredCustomer.score) : "-" },
                    { label: "Senaste svar", value: featuredCustomer?.lastReply ?? "-" },
                    { label: "Bokningar", value: featuredCustomer?.bookings ?? "-" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-slate-200 bg-white p-4"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ShellCard>

          <ShellCard title="Arbeta i kundprofilen" eyebrow="Sektioner" action={activeTab}>
            <div className="flex flex-wrap gap-2">
              {customerTabs.map((tab) => {
                const Icon =
                  tab === "Bokningar"
                    ? CalendarDays
                    : tab === "Offerter"
                      ? FileText
                      : tab === "Konversationer"
                        ? MessageSquareText
                        : tab === "Anteckningar"
                          ? NotebookPen
                          : Sparkles;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm transition ${
                      activeTab === tab
                        ? "bg-emerald-600 text-white shadow-[0_0_0_1px_rgba(5,150,105,0.18)]"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="mt-5">{tabContent[activeTab]}</div>
          </ShellCard>

          <div className="grid gap-5 lg:grid-cols-3">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <ShellCard
                  key={customer.name}
                  title={customer.name}
                  eyebrow={customer.health}
                  className="p-4"
                >
                  <div className="space-y-3">
                    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Kundscore
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">
                        {customer.score}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        Genererade intäkter: {customer.revenue}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {customer.summary}
                      </p>
                    </div>
                    <Link
                      href={`/kunder/${customer.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-emerald-700"
                    >
                      Öppna profil
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </ShellCard>
              ))
            ) : (
              <div className="lg:col-span-3 rounded-[24px] border border-dashed border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500">
                Inga kunder finns ännu. Skapa en kund för att få en verklig kundprofil, hälsoscore och tidslinje.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5">
          <ShellCard title="Kundhälsa" eyebrow="Övervaka" action="Granska risker">
            <div className="space-y-3">
              {healthSummary.map((item) => {
                const Icon =
                  item.title === "Stabila konton"
                    ? HeartPulse
                    : item.title === "Konton att bevaka"
                      ? AlertTriangle
                      : Sparkles;

                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-950">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.value}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.note}
                    </p>
                  </div>
                );
              })}
              {healthSummary.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Hälsosammanfattningen visas när kunddata finns i arbetsytan.
                </div>
              ) : null}
            </div>
          </ShellCard>

          <ShellCard title="Bokningar och fakturor" eyebrow="Kontext" action="Öppna drift">
            <div className="space-y-3">
              {operationsItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-slate-200 bg-white p-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <CalendarDays className="h-4 w-4 text-emerald-700" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              ))}
              {operationsItems.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Driftsignaler visas när vald kund har verkliga bokningar, fakturor, dialoger eller aktivitetsloggar.
                </div>
              ) : null}
            </div>
          </ShellCard>

          <ShellCard title="Snabbkommandon" eyebrow="Nästa steg" action="Öppna AI">
            <div className="space-y-3">
              {quickActions.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm leading-6 text-slate-600">{item.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" />
                </Link>
              ))}
              {quickActions.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Snabbkommandon visas när det finns en vald kund att arbeta vidare med.
                </div>
              ) : null}
            </div>
          </ShellCard>
        </div>
      </div>
    </CrmShell>
  );
}
