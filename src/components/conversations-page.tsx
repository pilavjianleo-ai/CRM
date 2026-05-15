"use client";

import Link from "next/link";
import { Mail, MessageCircle, PhoneCall, Sparkles } from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import type { ConversationsData } from "@/lib/server/business-data";

const fallbackThreads = [
  {
    id: "demo-nordic-fix",
    customer: "Nordic Fix AB",
    channel: "E-post",
    summary: "Vill ha bekräftelse på nästa steg efter offerten.",
    mood: "Positiv",
    action: "Svara i dag",
  },
  {
    id: "demo-atelje-hem",
    customer: "Ateljé Hem",
    channel: "SMS",
    summary: "Har blivit tyst efter senaste prisfrågan.",
    mood: "Osäker",
    action: "Följ upp personligt",
  },
  {
    id: "demo-green-studio",
    customer: "Green Studio",
    channel: "WhatsApp",
    summary: "Undrar om ni kan tidigarelägga morgondagens jobb.",
    mood: "Neutral",
    action: "Bekräfta tid",
  },
];

const fallbackData: ConversationsData = {
  threads: fallbackThreads,
  aiSummary: [
    "2 dialoger behöver svar i dag för att inte tappa fart.",
    "Nordic Fix AB svarar bäst på kort, tydlig e-post med nästa steg.",
    "Ateljé Hem bör få mänsklig uppföljning i stället för automatiskt utskick.",
  ],
  channelStats: [
    { label: "E-post", value: "14" },
    { label: "Chatt", value: "8" },
    { label: "Samtal", value: "3" },
  ],
};

export function ConversationsPage({ data }: { data?: ConversationsData }) {
  const conversationData = data ?? fallbackData;

  return (
    <CrmShell
      title="Konversationer som ett samlat kundcenter"
      description="Se dialoger, kanalstatus, nästa steg och AI-stöd i en strukturerad inkorg där teamet snabbt kan agera med rätt kontext."
    >
      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Inkorg" eyebrow="Konversationer" action="Ny konversation">
              <div className="space-y-3">
                {conversationData.threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {thread.customer}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {thread.channel} · {thread.mood}
                        </p>
                        {thread.customerId ? (
                          <Link
                            href={`/kunder/${thread.customerId}`}
                            className="mt-2 inline-flex text-xs text-emerald-700 transition hover:text-emerald-800"
                          >
                            Öppna kundprofil
                          </Link>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        {thread.action}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {thread.summary}
                    </p>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Svar och nästa steg" eyebrow="Operativ översikt" action="Öppna kund">
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  "Två dialoger kräver mänskligt svar i dag för att inte tappa momentum.",
                  "Kunder i offertsteg ska få kortare, tydligare nästa steg i svaren.",
                  "En kund vill tidigarelägga bokning och behöver snabb bekräftelse.",
                  "Systemet bör föreslå ring-uppgift när osäkerhet och tystnad kombineras.",
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
          </div>

          <div className="grid gap-5">
            <ShellCard title="AI-sammanfattning" eyebrow="Hjälp i realtid">
              <div className="space-y-3">
                {conversationData.aiSummary.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Kanaler" eyebrow="Överblick">
              <div className="grid grid-cols-3 gap-3">
                {conversationData.channelStats.map((item) => {
                  const Icon =
                    item.label === "E-post"
                      ? Mail
                      : item.label === "Samtal"
                        ? PhoneCall
                        : MessageCircle;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-slate-200 bg-white p-4 text-center"
                    >
                      <Icon className="mx-auto h-4 w-4 text-emerald-700" />
                      <p className="mt-3 text-lg font-semibold text-slate-950">
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

            <ShellCard title="Snabbsvar" eyebrow="AI">
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Föreslaget svar
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Hej! Tack för din fråga. Vi kan bekräfta nästa steg redan i dag och
                  föreslår att vi bokar in en kort avstämning för att säkra rätt plan.
                </p>
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ShellCard title="Mänskligt svar först" eyebrow="När AI inte räcker">
            <div className="space-y-3">
              {[
                "Prisfrågor och osäker ton bör inte bara få automatiserat svar.",
                "Känsliga kunder ska få snabb ägarledd uppföljning.",
                "När kunden vill ändra bokning behöver drift och dialog synkas direkt.",
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

          <ShellCard title="Svarsmallar att använda" eyebrow="Kanalanpassat">
            <div className="space-y-3">
              {[
                "Kort premiummejl med tydligt nästa steg.",
                "Snabbt sms vid påminnelse eller ombokning.",
                "Personlig check-in när kundrelationen känns osäker.",
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

          <ShellCard title="Dialog till åtgärd" eyebrow="Nästa steg">
            <div className="space-y-3">
              {[
                "Skapa uppgift från tyst dialog.",
                "Spara AI-sammanfattning på kundens tidslinje.",
                "Starta uppföljningsflöde efter uteblivet svar.",
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
        </div>
      </div>
    </CrmShell>
  );
}
