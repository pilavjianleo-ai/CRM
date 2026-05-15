"use client";

import { useActionState } from "react";
import { useEffect, useState } from "react";
import { Bot, LoaderCircle, Play, Zap } from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import {
  createAutomationFlowAction,
  updateAutomationStatusAction,
} from "@/lib/actions/crm";
import type { AutomationData } from "@/lib/server/business-data";

const fallbackData: AutomationData = {
  flows: [
  {
    id: "demo-lead-followup",
    name: "Nytt lead -> uppföljning",
    trigger: "Nytt lead",
    action: "Skicka e-post + skapa uppgift",
    state: "Aktiv",
    description: "Demo-flöde tills riktiga automationer finns i databasen.",
  },
  {
    id: "demo-missed-booking",
    name: "Missad bokning -> rädda relation",
    trigger: "Missad bokning",
    action: "Skicka sms + be om ny tid",
    state: "Utkast",
    description: "Demo-flöde tills riktiga automationer finns i databasen.",
  },
  {
    id: "demo-winback",
    name: "Tyst kund -> återaktivera",
    trigger: "30 dagar utan aktivitet",
    action: "AI skriver meddelande + påminn teamet",
    state: "Aktiv",
    description: "Demo-flöde tills riktiga automationer finns i databasen.",
  },
  ],
  stats: [
    { label: "Aktiva", value: "2" },
    { label: "AI-flöden", value: "1" },
    { label: "Sparade steg", value: "3" },
  ],
  suggestions: [
    "Skapa ett flöde för varma leads som inte svarar inom 48 timmar.",
    "Automatisera påminnelser till kunder med bokning nästa dag.",
    "Bygg ett omdömesflöde efter slutfört jobb när nöjdheten är hög.",
  ],
  principles: [
    "Varje automation ska ha tydlig trigger, åtgärd och affärsnytta.",
    "Flöden ska vara lätta att förstå även för teamet som inte byggt dem.",
    "Automation ska stötta arbete, inte skapa dold komplexitet.",
  ],
};

function AutomationComposer() {
  const [state, action, pending] = useActionState(
    createAutomationFlowAction,
    initialActionState,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("");
  const [actionType, setActionType] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED">(
    "DRAFT",
  );

  useEffect(() => {
    if (state.status === "success") {
      setName("");
      setDescription("");
      setTriggerType("");
      setActionType("");
      setStatus("DRAFT");
    }
  }, [state.status]);

  return (
    <ShellCard title="Ny automation" eyebrow="Riktigt flöde" action="Skapa">
      <form action={action} className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Namn på automation"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
          <select
            name="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED")
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
          >
            <option value="DRAFT">Utkast</option>
            <option value="ACTIVE">Aktiv</option>
            <option value="PAUSED">Pausad</option>
            <option value="ARCHIVED">Arkiverad</option>
          </select>
          <input
            name="triggerType"
            value={triggerType}
            onChange={(event) => setTriggerType(event.target.value)}
            placeholder="Trigger, t.ex. Nytt lead"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
          <input
            name="actionType"
            value={actionType}
            onChange={(event) => setActionType(event.target.value)}
            placeholder="Åtgärd, t.ex. Skapa uppgift"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30"
          />
        </div>
        <textarea
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Beskriv vad flödet gör och varför det finns."
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
            {state.message ?? "Sparar automationen i databasen för aktuell arbetsyta."}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Skapa automation
          </button>
        </div>
      </form>
    </ShellCard>
  );
}

function AutomationRow({
  flow,
  canPersist,
}: {
  flow: AutomationData["flows"][number];
  canPersist: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateAutomationStatusAction,
    initialActionState,
  );
  const nextStatus =
    flow.state === "Aktiv" ? "PAUSED" : flow.state === "Pausad" ? "ACTIVE" : "ACTIVE";
  const nextLabel =
    flow.state === "Aktiv" ? "Pausa" : flow.state === "Pausad" ? "Aktivera" : "Aktivera";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-950">{flow.name}</p>
          <p className="mt-1 text-sm text-slate-500">Trigger: {flow.trigger}</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          {flow.state}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">Åtgärd: {flow.action}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{flow.description}</p>
      <form action={action} className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <input type="hidden" name="automationId" value={flow.id} />
        <input type="hidden" name="status" value={nextStatus} />
        <p
          className={`text-xs ${
            state.status === "error"
              ? "text-rose-500"
              : state.status === "success"
                ? "text-emerald-700"
                : "text-slate-400"
          }`}
        >
          {!canPersist
            ? "Demo-data kan inte uppdateras."
            : state.message ?? "Byt status direkt från listan."}
        </p>
        <button
          type="submit"
          disabled={!canPersist || pending}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
          {nextLabel}
        </button>
      </form>
    </div>
  );
}

export function AutomationPage({ data }: { data?: AutomationData }) {
  const automationData = data ?? fallbackData;
  const canPersist = Boolean(data);

  return (
    <CrmShell
      title="Automationer som styr verkliga arbetsflöden"
      description="Bygg strukturerade flöden för uppföljning, påminnelser och återaktivering utan att skapa kaos eller onödig komplexitet."
    >
      <div className="grid gap-5">
        <AutomationComposer />

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Aktiva flöden" eyebrow="Automationer" action="Ny automation">
              <div className="space-y-3">
                {automationData.flows.length > 0 ? (
                  automationData.flows.map((flow) => (
                    <AutomationRow key={flow.id} flow={flow} canPersist={canPersist} />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    Inga automationer ännu. Skapa ditt första riktiga flöde ovan.
                  </div>
                )}
              </div>
            </ShellCard>

            <ShellCard title="Hur flödena används" eyebrow="Operativ struktur" action="Öppna builder">
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  "Leadflöden ska driva snabb första uppföljning och tydligt nästa steg.",
                  "Bokningsflöden ska skydda kundupplevelsen när något ändras eller riskerar att missas.",
                  "Retentionflöden ska återaktivera tysta kunder utan att kännas generiska.",
                  "AI ska användas där ton, timing och prioritering behöver bli smartare.",
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
            <ShellCard title="AI-förslag" eyebrow="Vad du kan automatisera">
              <div className="space-y-3">
                {automationData.suggestions.map((item) => (
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
              <div className="grid grid-cols-3 gap-3">
                {automationData.stats.map((item) => {
                  const Icon =
                    item.label === "Aktiva" ? Play : item.label === "AI-flöden" ? Bot : Zap;
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
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ShellCard title="Builder-principer" eyebrow="Färre men bättre flöden">
            <div className="space-y-3">
              {automationData.principles.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Flöden att starta nu" eyebrow="Rekommenderat">
            <div className="space-y-3">
              {automationData.suggestions.map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <Play className="h-4 w-4 shrink-0 text-emerald-700" />
                </button>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="AI som automationslager" eyebrow="Intelligens">
            <div className="space-y-3">
              {[
                "AI ska avgöra ton och timing där det ökar svarsfrekvensen.",
                "Mänsklig uppföljning ska prioriteras när signalerna är osäkra.",
                "Systemet ska kunna föreslå nästa automation utifrån verkligt beteende i portalen.",
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
