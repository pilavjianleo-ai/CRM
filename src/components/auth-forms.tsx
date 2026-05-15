"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { initialActionState } from "@/lib/actions/action-state";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
} from "@/lib/actions/auth";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-emerald-50/30";

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
      className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(5,150,105,0.16)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {label}
      </span>
    </button>
  );
}

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialActionState);

  return (
    <form className="space-y-4" action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/oversikt"} />
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">E-post</label>
        <input
          name="email"
          className={inputClassName}
          placeholder="namn@bolag.se"
          defaultValue="philip@relationssystem.se"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">Lösenord</label>
        <input
          name="password"
          type="password"
          className={inputClassName}
          placeholder="Skriv ditt lösenord"
          defaultValue="Demo123!"
        />
      </div>
      <SubmitButton label="Logga in" pending={pending} />
      <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Demo-inloggning: `philip@relationssystem.se` / `Demo123!`
      </div>
      {state.status === "error" ? (
        <p className="text-sm text-rose-300">{state.message}</p>
      ) : null}
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialActionState);

  return (
    <form className="space-y-4" action={action}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800">Förnamn</label>
          <input name="firstName" className={inputClassName} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-800">Efternamn</label>
          <input name="lastName" className={inputClassName} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">Företag</label>
        <input name="company" className={inputClassName} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">E-post</label>
        <input name="email" className={inputClassName} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">Lösenord</label>
        <input name="password" type="password" className={inputClassName} />
      </div>
      <SubmitButton label="Skapa konto" pending={pending} />
      {state.status === "error" ? (
        <p className="text-sm text-rose-300">{state.message}</p>
      ) : null}
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initialActionState,
  );

  return (
    <form className="space-y-4" action={action}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">E-post</label>
        <input
          name="email"
          className={inputClassName}
          placeholder="namn@bolag.se"
        />
      </div>
      <SubmitButton label="Skicka återställningslänk" pending={pending} />
      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "error" ? "text-rose-500" : "text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
