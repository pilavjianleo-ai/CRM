"use client";

import { useState } from "react";
import { CalendarDays, LoaderCircle, Send, Sparkles } from "lucide-react";

import { ShellCard } from "@/components/shell-card";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30";

async function submitJson<T>(url: string, body: T) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as { ok: boolean; message: string };

  if (!response.ok) {
    throw new Error(result.message || "Något gick fel.");
  }

  return result;
}

export function PublicIntakeSection() {
  const [leadPending, setLeadPending] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  return (
    <section className="py-16">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
          Fungerande flöden
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Ta emot leads och bokningar direkt från hemsidan
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          Härifrån kan du redan nu skapa riktiga poster i systemet via backend,
          inte bara UI-demo.
        </p>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <ShellCard title="Skapa lead" eyebrow="Hemsidans formulär" className="p-5">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLeadPending(true);
              setLeadError(null);
              setLeadMessage(null);

              const formData = new FormData(event.currentTarget);

              try {
                const result = await submitJson("/api/public/leads", {
                  name: formData.get("name"),
                  company: formData.get("company"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  message: formData.get("message"),
                  source: "hemsida",
                });

                setLeadMessage(result.message);
                event.currentTarget.reset();
              } catch (error) {
                setLeadError(
                  error instanceof Error ? error.message : "Leadet kunde inte skapas.",
                );
              } finally {
                setLeadPending(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" className={inputClassName} placeholder="Namn" />
              <input name="company" className={inputClassName} placeholder="Företag" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="email" className={inputClassName} placeholder="E-post" />
              <input name="phone" className={inputClassName} placeholder="Telefon" />
            </div>
            <textarea
              name="message"
              className={`${inputClassName} min-h-28 resize-none`}
              placeholder="Berätta kort vad du behöver hjälp med"
            />
            <button
              disabled={leadPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-4 text-sm font-medium text-white shadow-[0_0_40px_rgba(34,211,238,0.18)] transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leadPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Skicka lead till systemet
            </button>
            {leadMessage ? (
              <p className="text-sm text-emerald-300">{leadMessage}</p>
            ) : null}
            {leadError ? <p className="text-sm text-rose-300">{leadError}</p> : null}
          </form>
        </ShellCard>

        <ShellCard title="Skapa bokning" eyebrow="Kundbokning" className="p-5">
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBookingPending(true);
              setBookingError(null);
              setBookingMessage(null);

              const formData = new FormData(event.currentTarget);

              try {
                const result = await submitJson("/api/public/bookings", {
                  name: formData.get("name"),
                  company: formData.get("company"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  service: formData.get("service"),
                  address: formData.get("address"),
                  date: formData.get("date"),
                  time: formData.get("time"),
                  notes: formData.get("notes"),
                  source: "hemsida",
                });

                setBookingMessage(result.message);
                event.currentTarget.reset();
              } catch (error) {
                setBookingError(
                  error instanceof Error
                    ? error.message
                    : "Bokningen kunde inte skapas.",
                );
              } finally {
                setBookingPending(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" className={inputClassName} placeholder="Namn" />
              <input name="company" className={inputClassName} placeholder="Företag" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="email" className={inputClassName} placeholder="E-post" />
              <input name="phone" className={inputClassName} placeholder="Telefon" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="service" className={inputClassName} defaultValue="">
                <option value="" disabled>
                  Välj tjänst
                </option>
                <option value="Hemstädning">Hemstädning</option>
                <option value="Fönsterputs">Fönsterputs</option>
                <option value="Trädgårdsservice">Trädgårdsservice</option>
                <option value="Installation">Installation</option>
              </select>
              <input name="address" className={inputClassName} placeholder="Adress" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="date" type="date" className={inputClassName} />
              <input name="time" type="time" className={inputClassName} />
            </div>
            <textarea
              name="notes"
              className={`${inputClassName} min-h-28 resize-none`}
              placeholder="Eventuella anteckningar"
            />
            <button
              disabled={bookingPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/6 px-5 py-4 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bookingPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
              Boka direkt i systemet
            </button>
            {bookingMessage ? (
              <p className="text-sm text-emerald-300">{bookingMessage}</p>
            ) : null}
            {bookingError ? (
              <p className="text-sm text-rose-300">{bookingError}</p>
            ) : null}
          </form>

          <div className="mt-5 rounded-[24px] border border-cyan-400/10 bg-cyan-400/5 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Vad som händer
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Bokningen skapar kund, bokning, AI-insikt och uppgift för uppföljning i
              samma flöde.
            </p>
          </div>
        </ShellCard>
      </div>
    </section>
  );
}
