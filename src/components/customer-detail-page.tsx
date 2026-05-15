"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  ListTodo,
  LoaderCircle,
  MessageSquareText,
  NotebookPen,
  Sparkles,
} from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import {
  createCustomerMessageAction,
  createCustomerTaskAction,
  saveCustomerNotesAction,
} from "@/lib/actions/crm";
import type { CustomerDetailData } from "@/lib/server/business-data";

const customerTabs = [
  "Översikt",
  "Tidslinje",
  "Bokningar",
  "Offerter",
  "Fakturor",
  "Konversationer",
  "Uppgifter",
  "Anteckningar",
  "Dokument",
] as const;

type CustomerTab = (typeof customerTabs)[number];

function CustomerNotesPanel({
  customerId,
  initialNotes,
}: {
  customerId: string;
  initialNotes: string;
}) {
  const [state, action, pending] = useActionState(
    saveCustomerNotesAction,
    initialActionState,
  );
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const noteItems = notes
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-4">
      <form action={action} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="customerId" value={customerId} />
        <div className="grid gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Interna anteckningar
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Spara lärdomar, relationella detaljer, preferenser och saker teamet
              behöver komma ihåg.
            </p>
          </div>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Skriv viktiga anteckningar om kunden..."
            rows={8}
            className="min-h-[220px] rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={`text-sm ${
                state.status === "error" ? "text-rose-500" : "text-slate-500"
              }`}
            >
              {state.message ?? "Syns bara internt i arbetsytan."}
            </p>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Spara anteckningar
            </button>
          </div>
        </div>
      </form>

      <div className="grid gap-3">
        {noteItems.length > 0 ? (
          noteItems.map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
            >
              {item}
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Inga manuella anteckningar ännu. Lägg till lärdomar, preferenser och
            viktiga relationella detaljer här.
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerActivityComposer({
  customerId,
  onCreated,
}: {
  customerId: string;
  onCreated: () => void;
}) {
  const [state, action, pending] = useActionState(
    createCustomerTaskAction,
    initialActionState,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"MEDIUM" | "HIGH" | "URGENT" | "LOW">(
    "HIGH",
  );
  const [dueAt, setDueAt] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      setTitle("");
      setDescription("");
      setPriority("HIGH");
      setDueAt("");
      onCreated();
    }
  }, [onCreated, state.status]);

  return (
    <ShellCard title="Ny aktivitet" eyebrow="Kopplad till kundprofilen">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="customerId" value={customerId} />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-3">
            <input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Vad ska goras for kunden?"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
            />
            <textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kort beskrivning, ansvar eller intern kontext..."
              rows={4}
              className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
            />
          </div>
          <div className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Prioritet
              </span>
              <select
                name="priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as "MEDIUM" | "HIGH" | "URGENT" | "LOW",
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              >
                <option value="LOW">Låg</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">Hög</option>
                <option value="URGENT">Akut</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Deadline
              </span>
              <input
                name="dueAt"
                type="date"
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              />
            </label>
          </div>
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
            {state.message ??
              "Skapar en riktig intern uppgift kopplad till kunden och den inloggade anvandaren."}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Skapa aktivitet
          </button>
        </div>
      </form>
    </ShellCard>
  );
}

function CustomerMessageComposer({
  customerId,
  onSent,
}: {
  customerId: string;
  onSent: () => void;
}) {
  const [state, action, pending] = useActionState(
    createCustomerMessageAction,
    initialActionState,
  );
  const [channel, setChannel] = useState<
    "EMAIL" | "SMS" | "WHATSAPP" | "MESSENGER" | "INSTAGRAM" | "PHONE"
  >("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      setChannel("EMAIL");
      setSubject("");
      setBody("");
      onSent();
    }
  }, [onSent, state.status]);

  return (
    <ShellCard title="Skicka meddelande" eyebrow="Kunddialog">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="customerId" value={customerId} />
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Kanal
              </span>
              <select
                name="channel"
                value={channel}
                onChange={(event) =>
                  setChannel(
                    event.target.value as
                      | "EMAIL"
                      | "SMS"
                      | "WHATSAPP"
                      | "MESSENGER"
                      | "INSTAGRAM"
                      | "PHONE",
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
              >
                <option value="EMAIL">E-post</option>
                <option value="SMS">SMS</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="MESSENGER">Messenger</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="PHONE">Samtal</option>
              </select>
            </label>
            <input
              name="subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Amnesrad eller syfte"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
            />
          </div>
          <textarea
            name="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Skriv meddelandet som ska sparas i dialogen..."
            rows={6}
            className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
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
            {state.message ??
              "Meddelandet sparas i kundens konversationer och blir synligt i inkorgen."}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Spara meddelande
          </button>
        </div>
      </form>
    </ShellCard>
  );
}

export function CustomerDetailPage({ data }: { data: CustomerDetailData }) {
  const [activeTab, setActiveTab] = useState<CustomerTab>("Översikt");
  const [showActivityComposer, setShowActivityComposer] = useState(false);
  const [showMessageComposer, setShowMessageComposer] = useState(false);

  const tabContent = {
    Översikt: (
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Relation och hälsa
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.stats.map((item) => (
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
            <p className="mt-2 text-sm leading-6 text-slate-600">{data.summary}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Nästa steg
          </p>
          <div className="mt-4 space-y-3">
            {data.nextActions.map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-slate-200 bg-white p-4"
              >
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    Tidslinje: (
      <div className="space-y-3">
        {data.timeline.map((item) => (
          <div
            key={`${item.title}-${item.time}`}
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
      </div>
    ),
    Bokningar: (
      <div className="space-y-3">
        {data.bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{booking.title}</p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                {booking.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {booking.time} · {booking.owner}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{booking.location}</p>
          </div>
        ))}
      </div>
    ),
    Offerter: (
      <div className="grid gap-3">
        {data.quotes.map((item) => (
          <div
            key={item.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {item.number} · {item.amount} · Giltig till {item.validUntil}
            </p>
          </div>
        ))}
      </div>
    ),
    Fakturor: (
      <div className="space-y-3">
        {data.invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{invoice.number}</p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                {invoice.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {invoice.amount} · Förfaller {invoice.due}
            </p>
          </div>
        ))}
      </div>
    ),
    Konversationer: (
      <div className="space-y-3">
        {data.conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="rounded-[22px] border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">{conversation.subject}</p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                {conversation.channel} · {conversation.sentiment}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{conversation.lastMessage}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{conversation.preview}</p>
          </div>
        ))}
      </div>
    ),
    Uppgifter: (
      <div className="grid gap-3">
        {data.tasks.length > 0 ? (
          data.tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-[22px] border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-950">{task.title}</p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  {task.status} · {task.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Deadline: {task.due}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
            Inga oppna aktiviteter kopplade till kunden annu.
          </div>
        )}
      </div>
    ),
    Anteckningar: (
      <CustomerNotesPanel customerId={data.id} initialNotes={data.notes} />
    ),
    Dokument: (
      <div className="grid gap-3">
        {data.documents.map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
          >
            {item}
          </div>
        ))}
      </div>
    ),
  } satisfies Record<CustomerTab, React.ReactNode>;

  return (
    <CrmShell
      title={`${data.name} som egen kundprofil`}
      description="Arbeta direkt i en riktig kundroute med relation, ekonomi, tidslinje, dialog, bokningar och nästa steg samlade i samma vy."
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/kunder"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till kunder
          </Link>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowActivityComposer((current) => !current)}
              className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Ny aktivitet
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("Konversationer");
                setShowMessageComposer((current) => !current);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Skicka meddelande
            </button>
          </div>
        </div>

        {showActivityComposer ? (
          <CustomerActivityComposer
            customerId={data.id}
            onCreated={() => setActiveTab("Uppgifter")}
          />
        ) : null}

        {showMessageComposer ? (
          <CustomerMessageComposer
            customerId={data.id}
            onSent={() => setActiveTab("Konversationer")}
          />
        ) : null}

        <ShellCard title="Kundprofil i fokus" eyebrow="Header" action={data.health}>
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{data.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Huvudkontakt: {data.contact}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {data.contactEmail} · {data.contactPhone}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  {data.health} {data.score}
                </span>
              </div>
              <div className="mt-5 rounded-[22px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Senaste AI-bild
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{data.summary}</p>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Relationens läge
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Hälsa", value: data.health },
                  { label: "Kundscore", value: String(data.score) },
                  { label: "Senaste svar", value: data.lastReply },
                  { label: "Öppna uppgifter", value: data.openTasksCount },
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
                  : tab === "Offerter" || tab === "Fakturor"
                    ? FileText
                    : tab === "Uppgifter"
                      ? ListTodo
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

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <ShellCard title="Operativa signaler" eyebrow="Vad som behöver hända nu">
            <div className="space-y-3">
              {data.nextActions.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700" />
                </button>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Dokument och kommersiellt lager" eyebrow="Snapshot">
            <div className="space-y-3">
              {[...data.documents, ...data.quotes.map((quote) => `${quote.number} · ${quote.title}`)]
                .slice(0, 5)
                .map((item) => (
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
