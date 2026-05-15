"use client";

import { CalendarDays, Clock3, MapPinned, Sparkles } from "lucide-react";
import { BookingQuickCreateCard } from "@/components/crm-quick-create";
import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";

const defaultBookings = [
  {
    customer: "Nordic Fix AB",
    time: "09:30 - 11:00",
    status: "Bekräftad",
    owner: "Emma",
    detail: "Kunden ska få en påminnelse 60 minuter innan.",
  },
  {
    customer: "Ateljé Hem",
    time: "12:15 - 13:30",
    status: "Behöver påminnelse",
    owner: "Jonas",
    detail: "AI föreslår ett kort sms för att minska risken för ombokning.",
  },
  {
    customer: "Green Studio",
    time: "15:00 - 16:30",
    status: "Rutt optimerad",
    owner: "Sara",
    detail: "Resvägen är uppdaterad för att spara 18 minuter.",
  },
];

export function BookingsPage({
  data,
}: {
  data?: {
    stats?: Array<{ label: string; value: string; note: string }>;
    bookings?: typeof defaultBookings;
  };
}) {
  const bookings = data?.bookings ?? defaultBookings;
  const stats =
    data?.stats ??
    [
      { label: "Bokningar idag", value: "12", note: "4 behöver aktiv uppföljning" },
      { label: "Fyllnadsgrad", value: "91%", note: "Fredag har fortfarande luckor" },
      { label: "Team i fält", value: "5", note: "Alla är schemalagda" },
    ];

  return (
    <CrmShell
      title="Bokningar som daglig driftvy"
      description="Planera dagen, upptäck friktion tidigt och håll team, kund och kapacitet synkade i ett tydligt operativt flöde."
    >
      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <BookingQuickCreateCard />

            <ShellCard title="Kapacitet och schema" eyebrow="Veckoöversikt" action="Ny bokning">
              <div className="grid gap-4 lg:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-slate-200 bg-white p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-4">
                {[
                  { day: "Mån", value: "76%", tone: "bg-emerald-500" },
                  { day: "Tis", value: "82%", tone: "bg-emerald-500" },
                  { day: "Ons", value: "96%", tone: "bg-lime-500" },
                  { day: "Fre", value: "61%", tone: "bg-emerald-400" },
                ].map((item) => (
                  <div
                    key={item.day}
                    className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-950">{item.day}</p>
                      <p className="text-xs text-slate-500">{item.value}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Dagens bokningar" eyebrow="Schema" action="Öppna kalender">
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.customer}
                    className="rounded-[24px] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {booking.customer}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.time} · {booking.owner}
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {booking.detail}
                    </p>
                  </div>
                ))}
              </div>
            </ShellCard>
          </div>

          <div className="grid gap-5">
            <ShellCard title="Driftprioriteringar" eyebrow="AI-förslag">
              <div className="space-y-3">
                {[
                  "Skicka påminnelse till 2 bokningar innan arbetsdagen slutar.",
                  "Flytta ett jobb på fredag för att få bättre beläggning i teamet.",
                  "Lägg till restid i ett kundbesök som riskerar att bli för tight.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Snabbstatus" eyebrow="Drift">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Påminnelser", value: "4", icon: Clock3 },
                  { label: "Krockar", value: "0", icon: CalendarDays },
                  { label: "Ruttändringar", value: "1", icon: MapPinned },
                  { label: "AI-tillit", value: "94%", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-slate-200 bg-white p-4"
                    >
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {item.value}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ShellCard title="Operativa risker" eyebrow="Friktion att hantera" action="Öppna schema">
            <div className="space-y-3">
              {[
                "En eftermiddagsrutt riskerar att bli för tight om trafiken ökar.",
                "Två kunder behöver proaktiv bekräftelse för att minimera ombokning.",
                "Fredag har luckor som kan fyllas med kortare servicejobb.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Team och ansvar" eyebrow="Bemanning">
            <div className="space-y-3">
              {[
                "Emma täcker de två högst prioriterade kundbesöken i dag.",
                "Jonas behöver avsluta ett jobb tidigare för att hålla eftermiddagsschemat.",
                "Sara har bäst marginal och kan ta en extra bokning om det behövs.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Nästa operativa steg" eyebrow="Kommandon">
            <div className="space-y-3">
              {[
                "Skapa påminnelseflöde för morgondagens kunder.",
                "Optimera om fredagsschemat för bättre fyllnadsgrad.",
                "Lägg upp uppgifter efter dagens slutförda jobb.",
              ].map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <Sparkles className="h-4 w-4 shrink-0 text-emerald-700" />
                </button>
              ))}
            </div>
          </ShellCard>
        </div>
      </div>
    </CrmShell>
  );
}
