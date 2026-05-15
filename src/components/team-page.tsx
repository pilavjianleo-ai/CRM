"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useEffect } from "react";
import { Activity, BriefcaseBusiness, LoaderCircle, ShieldCheck, Users } from "lucide-react";
import { WorkspaceRole } from "@prisma/client";
import { useRouter } from "next/navigation";

import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";
import { initialActionState } from "@/lib/actions/action-state";
import { updateTeamMemberActiveAction, updateTeamMemberRoleAction } from "@/lib/actions/crm";
import type { TeamData } from "@/lib/server/business-data";

function TeamMemberCard({
  member,
  canManage,
  onChanged,
}: {
  member: TeamData["members"][number];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [roleState, roleAction, rolePending] = useActionState(
    updateTeamMemberRoleAction,
    initialActionState,
  );
  const [activeState, activeAction, activePending] = useActionState(
    updateTeamMemberActiveAction,
    initialActionState,
  );

  useEffect(() => {
    if (roleState.status === "success" || activeState.status === "success") {
      onChanged();
    }
  }, [activeState.status, onChanged, roleState.status]);

  const toneClass =
    member.statusTone === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : member.statusTone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : member.statusTone === "rose"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-slate-950">
            {member.name
              .split(" ")
              .map((part) => part[0] ?? "")
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-950">{member.name}</p>
              <span className={`rounded-full border px-3 py-1 text-xs ${toneClass}`}>
                {member.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {member.title} · {member.email}
            </p>
            <p className="mt-1 text-xs text-slate-400">Senast sedd {member.lastSeen}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Uppgifter</p>
            <p className="mt-1 text-sm font-medium text-slate-950">{member.openTasks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Bokningar</p>
            <p className="mt-1 text-sm font-medium text-slate-950">{member.bookingsToday}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Leads</p>
            <p className="mt-1 text-sm font-medium text-slate-950">{member.activeLeads}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Belastning</p>
            <p className="mt-1 text-sm font-medium text-slate-950">{member.workloadLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          {member.highPriorityTasks > 0
            ? `${member.highPriorityTasks} högprioriterade uppgifter kräver fokus.`
            : "Ingen högprioriterad uppgift blockerar just nu."}{" "}
          {member.customers > 0 ? `${member.customers} kunder är kopplade till medlemmen.` : ""}
        </div>

        <form action={roleAction} className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-white p-3">
          <input type="hidden" name="memberId" value={member.id} />
          <select
            name="role"
            defaultValue={member.role}
            disabled={!canManage || rolePending}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
          <button
            type="submit"
            disabled={!canManage || rolePending}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rolePending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Spara roll
          </button>
        </form>

        <form action={activeAction} className="flex items-center gap-2 rounded-[20px] border border-slate-200 bg-white p-3">
          <input type="hidden" name="memberId" value={member.id} />
          <input type="hidden" name="isActive" value={member.isActive ? "false" : "true"} />
          <button
            type="submit"
            disabled={!canManage || activePending}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {activePending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {member.isActive ? "Markera inaktiv" : "Aktivera"}
          </button>
        </form>
      </div>

      {roleState.message ? (
        <p className={`mt-3 text-xs ${roleState.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {roleState.message}
        </p>
      ) : null}
      {activeState.message ? (
        <p className={`mt-2 text-xs ${activeState.status === "error" ? "text-rose-600" : "text-emerald-700"}`}>
          {activeState.message}
        </p>
      ) : null}
    </div>
  );
}

export function TeamPage({
  data,
  currentUserRole,
}: {
  data?: TeamData;
  currentUserRole: WorkspaceRole;
}) {
  const router = useRouter();
  const canManage =
    currentUserRole === WorkspaceRole.OWNER || currentUserRole === WorkspaceRole.ADMIN;

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <CrmShell
      title="Team i verklig drift"
      description="Styr kapacitet, ansvar, aktivitet och roller från en lugn operativ vy med verkliga data."
    >
      <div className="grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard
              title="Teamöversikt"
              eyebrow="Live"
              action={data ? `${data.members.length} medlemmar` : "Ingen data"}
            >
              {data?.summary?.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {data.summary.map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                  Teamöversikten fylls när arbetsytan har verkliga användare och aktivitet.
                </div>
              )}
            </ShellCard>

            <ShellCard
              title="Medlemmar och ansvar"
              eyebrow="Kapacitet"
              action={canManage ? "Roller kan ändras" : "Läsbehörighet"}
            >
              <div className="space-y-3">
                {data?.members?.length ? (
                  data.members.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      canManage={canManage}
                      onChanged={() => router.refresh()}
                    />
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    Inga teammedlemmar hittades i arbetsytan ännu.
                  </div>
                )}
              </div>
            </ShellCard>
          </div>

          <div className="grid gap-5">
            <ShellCard title="Operativa signaler" eyebrow="Manager view">
              <div className="space-y-3">
                {data?.recommendations?.length ? (
                  data.recommendations.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-[22px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    När belastning, bokningar och leads börjar röra sig visas operativa rekommendationer här.
                  </div>
                )}
              </div>
            </ShellCard>

            <ShellCard title="AI och teamrytmer" eyebrow="Insikter">
              <div className="space-y-3">
                {data?.aiInsights?.length ? (
                  data.aiInsights.map((item) => (
                    <div key={`${item.title}-${item.time}`} className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-sm font-medium text-slate-950">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                      <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                    När AI-insikter sparas för arbetsytan syns de här som teamnära rekommendationer.
                  </div>
                )}
              </div>
            </ShellCard>

            <ShellCard title="Snabbvägar" eyebrow="Operativt">
              <div className="grid gap-3">
                <Link
                  href="/uppgifter"
                  className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                >
                  <Activity className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm text-slate-700">Öppna uppgifter och omfördela arbete</span>
                </Link>
                <Link
                  href="/bokningar"
                  className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm text-slate-700">Se dagens leverans- och fältbelastning</span>
                </Link>
                <Link
                  href="/installningar"
                  className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm text-slate-700">Hantera systemregler och arbetsyta</span>
                </Link>
              </div>
            </ShellCard>
          </div>
        </div>

        <ShellCard title="Ledningsbild" eyebrow="Nu">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <Users className="h-4 w-4 text-emerald-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Roller och ansvar</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Roller hämtas från riktiga workspace-medlemskap och kan ändras direkt i teamvyn.
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <Activity className="h-4 w-4 text-emerald-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Live status</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Status bygger på verklig `lastSeenAt`, aktiv flagga, öppna uppgifter och bokningar i dag.
              </p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white p-4">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <p className="mt-3 text-sm font-medium text-slate-950">Behörighet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Endast admins och owners kan ändra roller eller aktivera och inaktivera teammedlemmar.
              </p>
            </div>
          </div>
        </ShellCard>
      </div>
    </CrmShell>
  );
}
