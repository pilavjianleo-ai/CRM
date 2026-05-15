"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import type { ActionState } from "@/lib/actions/action-state";
import {
  createBookingAction,
  createCustomerAction,
  createLeadAction,
} from "@/lib/actions/crm";
import { ShellCard } from "@/components/shell-card";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30";

const initialState: ActionState = { status: "idle" };

function SubmitButton({
  label,
  pending,
}: {
  label: string;
  pending: boolean;
}) {
  return (
    <button
      disabled={pending}
      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="inline-flex items-center gap-2">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {label}
      </span>
    </button>
  );
}

function StateMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`text-sm ${
        state.status === "error" ? "text-rose-500" : "text-emerald-700"
      }`}
    >
      {state.message}
    </p>
  );
}

export function LeadQuickCreateCard() {
  const [state, action, pending] = useActionState(createLeadAction, initialState);

  return (
    <ShellCard title="Skapa lead" eyebrow="Intern registrering" className="p-5">
      <form action={action} className="space-y-3">
        <input name="companyName" className={inputClassName} placeholder="Företag" />
        <input name="contactName" className={inputClassName} placeholder="Kontaktperson" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="email" className={inputClassName} placeholder="E-post" />
          <input name="phone" className={inputClassName} placeholder="Telefon" />
        </div>
        <input
          name="estimatedValue"
          type="number"
          min="0"
          className={inputClassName}
          placeholder="Estimerat värde"
        />
        <div className="flex items-center justify-between gap-3">
          <StateMessage state={state} />
          <SubmitButton label="Spara lead" pending={pending} />
        </div>
      </form>
    </ShellCard>
  );
}

export function CustomerQuickCreateCard() {
  const [state, action, pending] = useActionState(
    createCustomerAction,
    initialState,
  );

  return (
    <ShellCard title="Ny kund" eyebrow="Snabbregistrering" className="p-5">
      <form action={action} className="space-y-3">
        <input name="companyName" className={inputClassName} placeholder="Företag" />
        <input name="contactName" className={inputClassName} placeholder="Kontaktperson" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="email" className={inputClassName} placeholder="E-post" />
          <input name="phone" className={inputClassName} placeholder="Telefon" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <StateMessage state={state} />
          <SubmitButton label="Spara kund" pending={pending} />
        </div>
      </form>
    </ShellCard>
  );
}

export function BookingQuickCreateCard() {
  const [state, action, pending] = useActionState(
    createBookingAction,
    initialState,
  );

  return (
    <ShellCard title="Ny bokning" eyebrow="Intern bokning" className="p-5">
      <form action={action} className="space-y-3">
        <input name="companyName" className={inputClassName} placeholder="Företag" />
        <input name="service" className={inputClassName} placeholder="Tjänst" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="date" type="date" className={inputClassName} />
          <input name="time" type="time" className={inputClassName} />
        </div>
        <input name="location" className={inputClassName} placeholder="Adress eller plats" />
        <div className="flex items-center justify-between gap-3">
          <StateMessage state={state} />
          <SubmitButton label="Skapa bokning" pending={pending} />
        </div>
      </form>
    </ShellCard>
  );
}
