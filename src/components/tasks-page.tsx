"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Brain, CheckCircle2, Clock3, LoaderCircle, Sparkles } from "lucide-react";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { updateTaskStatusAction } from "@/lib/actions/crm";
import type { TasksData } from "@/lib/server/business-data";

const fallbackData: TasksData = {
  stats: [
    { label: "Öppna nu", value: "4", note: "Demo-data visas tills arbetsytan har riktig task-data." },
    { label: "Klart idag", value: "6", note: "Visar tidigare demoindikator." },
    { label: "Försenade", value: "2", note: "Visar tidigare demoindikator." },
    { label: "AI-fokus", value: "3", note: "Visar tidigare demoindikator." },
  ],
  tasks: [
  {
    id: "demo-berg-co",
    title: "Följ upp Berg & Co",
    context: "Lead · Berg & Co",
    priority: "Hög",
    due: "Idag 11:00",
  },
  {
    id: "demo-green-studio",
    title: "Skicka offert till Green Studio",
    context: "Kund · Offert",
    priority: "Hög",
    due: "Idag 14:00",
  },
  {
    id: "demo-atelje-hem",
    title: "Kontrollera churn-signal för Ateljé Hem",
    context: "Kund · Risk",
    priority: "Medium",
    due: "Imorgon",
  },
  {
    id: "demo-fredagsschema",
    title: "Bekräfta fredagsschema",
    context: "Bokningar · Drift",
    priority: "Medium",
    due: "Imorgon",
  },
  ],
  aiFocus: [
    "Börja med Berg & Co. Det är den mest tidskänsliga uppgiften.",
    "Offerten till Green Studio bör gå ut innan kl. 14 för bäst svarstid.",
    "Ateljé Hem behöver en mänsklig check-in snarare än ett automatiskt utskick.",
  ],
};

function TaskRow({
  task,
  canPersist,
}: {
  task: TasksData["tasks"][number];
  canPersist: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateTaskStatusAction,
    initialActionState,
  );

  return (
    <form action={action}>
      <input type="hidden" name="taskId" value={task.id} />
      <input type="hidden" name="status" value="DONE" />
      <label className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
        <button
          type="submit"
          disabled={!canPersist || pending}
          className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-transparent text-emerald-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Markera ${task.title} som klar`}
        >
          {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-950">{task.title}</p>
              {task.customerId && task.customerName ? (
                <Link
                  href={`/kunder/${task.customerId}`}
                  className="mt-1 inline-flex text-xs text-emerald-700 transition hover:text-emerald-800"
                >
                  Öppna {task.customerName}
                </Link>
              ) : null}
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
              {task.priority}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {task.context} · {task.due}
          </p>
          <p
            className={`mt-2 text-xs ${
              state.status === "error"
                ? "text-rose-500"
                : state.status === "success"
                  ? "text-emerald-700"
                  : "text-slate-400"
            }`}
          >
            {!canPersist
              ? "Demo-data kan inte uppdateras."
              : state.message ?? "Markera som klar när arbetet är gjort."}
          </p>
        </div>
      </label>
    </form>
  );
}

export function TasksPage({ data }: { data?: TasksData }) {
  const taskData = data ?? fallbackData;
  const canPersist = Boolean(data);
  const statMap = new Map(taskData.stats.map((item) => [item.label, item]));

  return (
    <CrmShell
      title="Uppgifter som dagligt operativt lager"
      description="Prioritera rätt nästa steg, förstå varför uppgiften finns och håll ihop sälj, kunder, bokningar och riskarbete i ett tydligt flöde."
    >
      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Idag" eyebrow="Arbetslista" action="Ny uppgift">
              <div className="space-y-3">
                {taskData.tasks.length > 0 ? (
                  taskData.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} canPersist={canPersist} />
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500">
                    Inga öppna uppgifter just nu. Nya aktiviteter från kund- eller leadvyer
                    dyker upp här direkt.
                  </div>
                )}
              </div>
            </ShellCard>

            <ShellCard title="Arbeta i rätt ordning" eyebrow="Prioritering" action="Öppna AI">
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  "Börja med uppgifter som påverkar intäkt eller risk samma dag.",
                  "Offert- och kunduppföljning ska inte ligga bakom interna adminsteg.",
                  "Driftuppgifter ska grupperas när de påverkar bokningar eller teamkapacitet.",
                  "AI-rekommendationer ska hjälpa med ordning, inte skapa fler listor.",
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
            <ShellCard title="AI-genererat fokus" eyebrow="Rekommenderat">
              <div className="space-y-3">
                {taskData.aiFocus.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Snabbstatus" eyebrow="Överblick">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Klart idag", icon: CheckCircle2 },
                  { label: "Försenade", icon: Clock3 },
                  { label: "AI-fokus", icon: Brain },
                  { label: "Öppna nu", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const stat = statMap.get(item.label);

                  return (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-slate-200 bg-white p-4"
                    >
                      <Icon className="h-4 w-4 text-emerald-700" />
                      <p className="mt-3 text-xl font-semibold text-slate-950">
                        {stat?.value ?? "-"}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {stat?.label ?? item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ShellCard>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <ShellCard title="Det som blockerar flödet" eyebrow="Risker">
            <div className="space-y-3">
              {[
                "Försenade uppgifter drabbar ofta offert- och kundmoment först.",
                "Om drift och sälj blandas utan prioritet blir fel sak klar först.",
                "Tysta kunder ska bli uppgifter tidigt innan relationen kyls ner.",
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

          <ShellCard title="Kommandon att köra nu" eyebrow="Åtgärder">
            <div className="space-y-3">
              {[
                "Skapa uppgift från riskkund i kundvyn.",
                "Tilldela eftermiddagens viktigaste uppföljning.",
                "Omvandla AI-insikt till konkret nästa steg.",
              ].map((item) => (
                <button
                  key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <Brain className="h-4 w-4 shrink-0 text-emerald-700" />
                </button>
              ))}
            </div>
          </ShellCard>

          <ShellCard title="Arbetsdisciplin" eyebrow="Team pattern">
            <div className="space-y-3">
              {[
                "En bra uppgiftsyta ska minska kontextväxling, inte skapa mer.",
                "Varje uppgift ska vara kopplad till kund, lead, bokning eller risk.",
                "Rätt nästa steg ska vara tydligare än själva listan.",
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
