"use client";

import { useActionState } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, LoaderCircle, Mail, Search, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LeadQuickCreateCard } from "@/components/crm-quick-create";
import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { updateLeadAction, updateLeadStageAction } from "@/lib/actions/crm";
import type { LeadsData } from "@/lib/server/business-data";

function LeadCard({
  lead,
  owners,
}: {
  lead: LeadsData["stages"][number]["leads"][number];
  owners: LeadsData["owners"];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editState, editAction, editPending] = useActionState(
    updateLeadAction,
    initialActionState,
  );
  const [stageState, stageAction, stagePending] = useActionState(
    updateLeadStageAction,
    initialActionState,
  );

  useEffect(() => {
    if (editState.status === "success" || stageState.status === "success") {
      router.refresh();
    }
  }, [editState.status, router, stageState.status]);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-950">{lead.company}</p>
          <p className="mt-1 text-xs text-slate-500">
            {lead.contactName} · {lead.ownerName}
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
          {lead.temperature}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Sannolikhet</p>
          <p className="mt-2 text-sm font-medium text-slate-950">{lead.probabilityLabel}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Värde</p>
          <p className="mt-2 text-sm font-medium text-slate-950">{lead.value}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Nästa steg</p>
        <p className="mt-2 text-sm text-slate-700">{lead.nextAction}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI-insikt
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{lead.insight}</p>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-slate-500">
        <div className="flex items-center justify-between gap-3">
          <span>Senaste aktivitet</span>
          <span className="text-slate-700">{lead.contact}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Källa</span>
          <span className="truncate text-slate-700">{lead.source}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Score</span>
          <span className="text-slate-700">{lead.score}</span>
        </div>
      </div>

      <form action={stageAction} className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <input type="hidden" name="leadId" value={lead.id} />
        <select
          name="stage"
          defaultValue={lead.stageKey}
          disabled={stagePending}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
        >
          <option value="NEW">Ny</option>
          <option value="QUALIFIED">Kvalificerad</option>
          <option value="PROPOSAL">Offert</option>
          <option value="WON">Vunnen</option>
          <option value="LOST">Förlorad</option>
        </select>
        <button
          type="submit"
          disabled={stagePending}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {stagePending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Flytta steg
        </button>
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-emerald-700"
        >
          Redigera lead
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {stageState.message ? (
        <p className={`mt-2 text-xs ${stageState.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {stageState.message}
        </p>
      ) : null}

      {editing ? (
        <form action={editAction} className="mt-4 grid gap-3 rounded-[22px] border border-slate-200 bg-white p-4">
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Företag</span>
              <input
                name="companyName"
                defaultValue={lead.company}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Kontaktperson</span>
              <input
                name="contactName"
                defaultValue={lead.contactName}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">E-post</span>
              <input
                name="email"
                defaultValue={lead.email}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Telefon</span>
              <input
                name="phone"
                defaultValue={lead.phone}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Värde</span>
              <input
                name="estimatedValue"
                type="number"
                min="0"
                defaultValue={lead.estimatedValue}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Sannolikhet</span>
              <input
                name="probability"
                type="number"
                min="0"
                max="100"
                defaultValue={lead.probability}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Temperatur</span>
              <select
                name="temperature"
                defaultValue={
                  lead.temperature === "Het"
                    ? "HOT"
                    : lead.temperature === "Varm"
                      ? "WARM"
                      : "COLD"
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="COLD">Kall</option>
                <option value="WARM">Varm</option>
                <option value="HOT">Het</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-xs text-slate-500">Ägare</span>
              <select
                name="ownerId"
                defaultValue={lead.ownerId}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="">Ej tilldelad</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-2">
            <span className="text-xs text-slate-500">Källa</span>
            <input
              name="source"
              defaultValue={lead.source === "Ingen källa sparad ännu" ? "" : lead.source}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs text-slate-500">Nästa steg</span>
            <textarea
              name="nextAction"
              defaultValue={lead.nextAction}
              rows={3}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm ${editState.status === "error" ? "text-rose-600" : "text-slate-500"}`}>
              {editState.message ?? "Sparar riktiga leadändringar i databasen."}
            </p>
            <button
              type="submit"
              disabled={editPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Spara lead
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function LeadsPage({ data }: { data?: LeadsData }) {
  const stages = data?.stages ?? [];
  const stats = data?.stats ?? [];
  const owners = data?.owners ?? [];
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("Alla");

  const ownerOptions = useMemo(
    () => ["Alla", ...owners.map((owner) => owner.name)],
    [owners],
  );

  const filteredStages = useMemo(() => {
    return stages
      .map((stage) => ({
        ...stage,
        leads: stage.leads.filter((lead) => {
          const searchValue = search.trim().toLowerCase();
          const matchesSearch =
            searchValue === "" ||
            lead.company.toLowerCase().includes(searchValue) ||
            lead.contactName.toLowerCase().includes(searchValue) ||
            lead.nextAction.toLowerCase().includes(searchValue) ||
            lead.source.toLowerCase().includes(searchValue);
          const matchesOwner = ownerFilter === "Alla" || lead.ownerName === ownerFilter;

          return matchesSearch && matchesOwner;
        }),
      }))
      .filter((stage) => stage.leads.length > 0);
  }, [ownerFilter, search, stages]);

  return (
    <CrmShell
      title="Leads med verkliga nästa steg"
      description="Skapa, redigera, prioritera och flytta leads utan statiska mellanlager."
    >
      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="grid gap-5">
          <LeadQuickCreateCard />

          <ShellCard title="Leadöversikt" eyebrow="Verkliga data" action={`${stages.length} steg`}>
            {stats.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-slate-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                Inga leads finns ännu. Skapa ett lead för att fylla den operativa vyn.
              </div>
            )}
          </ShellCard>

          <ShellCard title="Arbeta med leads" eyebrow="Sök och ansvar">
            <div className="grid gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Sök företag, kontakt eller nästa steg..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {ownerOptions.map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setOwnerFilter(owner)}
                    className={`rounded-2xl px-4 py-3 text-sm transition ${
                      ownerFilter === owner
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {owner}
                  </button>
                ))}
              </div>
            </div>
          </ShellCard>

          {filteredStages.length > 0 ? (
            <div className="grid gap-5 2xl:grid-cols-4 xl:grid-cols-2">
              {filteredStages.map((stage, stageIndex) => (
                <motion.section
                  key={stage.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stageIndex * 0.06, duration: 0.35 }}
                  className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">{stage.name}</p>
                      <p className="text-xs text-slate-500">
                        {stage.count} leads · {stage.total}
                      </p>
                    </div>
                    <Link
                      href="/pipeline"
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-white"
                    >
                      Öppna pipeline
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {stage.leads.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} owners={owners} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            <ShellCard title="Ingen lead matchar" eyebrow="Tomt resultat">
              <p className="text-sm leading-7 text-slate-600">
                Prova ett bredare sök eller byt ägarfilter för att visa fler leads.
              </p>
            </ShellCard>
          )}
        </div>

        <div className="grid gap-5">
          <ShellCard title="Operativa signaler" eyebrow="AI-kvalificering">
            <div className="space-y-3">
              {data?.signals?.length ? (
                data.signals.map((signal) => (
                  <div key={signal.title} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-950">{signal.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{signal.text}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Signaler visas här när riktiga leads börjar röra sig i pipelinen.
                </div>
              )}
            </div>
          </ShellCard>

          <ShellCard title="Nästa bästa steg" eyebrow="I dag" action="Öppna uppgifter">
            <div className="space-y-3">
              {data?.suggestedActions?.length ? (
                data.suggestedActions.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="mt-1 text-emerald-700">
                      <Target className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  När leads finns i databasen kommer systemet föreslå verkliga nästa steg här.
                </div>
              )}
            </div>
          </ShellCard>

          <ShellCard title="Kommunikationshistorik" eyebrow="Senaste signaler">
            <div className="space-y-3">
              {data?.communications?.length ? (
                data.communications.map((thread) => (
                  <div key={thread.company} className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-950">
                      <Mail className="h-4 w-4 text-emerald-700" />
                      {thread.company}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{thread.text}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Kommunikationssignaler byggs från riktiga leads och deras nästa steg.
                </div>
              )}
            </div>
          </ShellCard>

          <ShellCard title="Leadtemperatur" eyebrow="Snapshot">
            <div className="grid grid-cols-3 gap-3">
              {data?.temperatureSummary?.length ? (
                data.temperatureSummary.map((item) => {
                  const Icon =
                    item.label === "Heta" ? Flame : item.label === "Varma" ? Sparkles : Target;

                  return (
                    <div key={item.label} className="rounded-[20px] border border-slate-200 bg-white p-4 text-center">
                      <Icon className="mx-auto h-4 w-4 text-emerald-700" />
                      <p className="mt-3 text-lg font-semibold text-slate-950">{item.value}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 rounded-[20px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Temperaturfördelning visas här när leads finns i arbetsytan.
                </div>
              )}
            </div>
          </ShellCard>
        </div>
      </div>
    </CrmShell>
  );
}
