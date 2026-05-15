"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CirclePlay,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { PublicIntakeSection } from "@/components/public-intake-section";
import { SiteShell } from "@/components/site-shell";
import { ShellCard } from "@/components/shell-card";
import {
  faqItems,
  featurePillars,
  operatingSystemLayers,
  pricingTiers,
  testimonials,
} from "@/lib/site-content";

export function MarketingHome() {
  return (
    <SiteShell>
      <div className="relative">
        <section className="grid gap-10 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Byggt för riktiga företag som jobbar varje dag
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Skapa tillvaxt med ett intelligent foretagssystem.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Samla leads, bokningar, fakturering, kunddialoger, analys och AI i en
              ljus, strukturerad och premium plattform som ar enkel att arbeta i varje dag.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registrera"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-medium text-white shadow-[0_12px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
              >
                Starta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo-booking"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <CirclePlay className="h-4 w-4" />
                Boka demo
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { value: "41%", label: "snabbare uppföljning" },
                { value: "29%", label: "bättre konvertering" },
                { value: "0", label: "onödiga adminflikar" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <ShellCard
              title="Dagens fokus"
              eyebrow="Livevy"
              action="AI sammanfattning"
              className="p-6"
            >
              <div className="grid gap-4">
                <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-slate-950">
                    Du vet exakt vad som är viktigast idag.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    3 varma leads behöver uppföljning, 1 viktig kund visar tidiga
                    risksignaler och 4 bokningar behöver bekräftas.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Intäkter denna vecka
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      428 000 kr
                    </p>
                    <p className="mt-2 text-sm text-emerald-700">+12,4%</p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Nästa steg
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Kontakta 2 heta leads, skicka 1 offert och säkra morgondagens
                      jobb.
                    </p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    AI-insikter
                  </p>
                  <div className="mt-3 space-y-3">
                    {[
                      "Skapa en återaktiveringsautomation för 14 inaktiva kunder.",
                      "Ring Berg & Co idag, sannolikheten att stänga affären är hög.",
                      "Skicka påminnelse till 2 bokningar innan kl. 17.00.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ShellCard>
          </motion.div>
        </section>

        <PublicIntakeSection />

        <section className="grid gap-5 border-y border-slate-200 py-16 lg:grid-cols-2">
          <ShellCard title="Problemet idag" eyebrow="Gamla system">
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <p>Tjansteforetag tappar fart nar leads, bokningar, fakturering och kommunikation ligger i separata verktyg.</p>
              <p>Team letar efter kontext, missar uppfoljningar och jobbar utan en gemensam systembild.</p>
              <p>Resultatet blir lagre konvertering, mer friktion och en arbetsmodell som aldrig kanns lugn.</p>
            </div>
          </ShellCard>

          <ShellCard title="The structured solution" eyebrow="Business OS">
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <p>Relations System ger varje arbetsflode ett hem, varje sida en tydlig roll och varje handling en plats i hierarkin.</p>
              <p>AI stottar arbetet inuti systemet i stallet for att ligga som ett fristaende gimmicklager.</p>
              <p>Resultatet blir ett mer premium, mer operativt och mer skalbart satt att driva ett tjansteforetag.</p>
            </div>
          </ShellCard>
        </section>

        <section id="funktioner" className="py-16">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Produktlager
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Ett premiumsystem genom hela kund- och operationslivscykeln
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Hemsida, onboarding, arbetsyta, portal, bokning, fakturering,
              automation, analys och AI foljer samma logik i stallet for att kannas som separata produkter.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featurePillars.map((feature) => {
              const Icon = feature.icon;

              return (
                <ShellCard key={feature.title} title={feature.title} className="p-5">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </ShellCard>
              );
            })}
          </div>
        </section>

        <section id="sa-funkar-det" className="py-16">
          <div className="grid gap-5 lg:grid-cols-4">
            {operatingSystemLayers.map((step, index) => (
              <ShellCard
                key={step.title}
                title={step.title}
                eyebrow={`Steg 0${index + 1}`}
                className="p-5"
              >
                <p className="text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </ShellCard>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <ShellCard title="Structured product preview" eyebrow="Portal experience" action="Open portal">
              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  "Översikt med dagliga prioriteringar",
                  "Pipeline med lead score, value, owner, and next step",
                  "Customer records with history, bookings, invoices, and notes",
                  "Booking operations with reminders, assignments, and status context",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard title="Automation preview" eyebrow="Workflow logic">
              <div className="space-y-3">
                {[
                  "New lead enters from form and triggers AI qualification.",
                  "Warm lead without reply creates a follow-up task and draft message.",
                  "Booking confirmed updates customer timeline and team schedule.",
                  "Completed job opens retention and upsell opportunities automatically.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>
          </div>
        </section>

        <section className="py-16">
          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <ShellCard key={item.name} title={item.name} eyebrow={item.title}>
                <p className="text-sm leading-7 text-slate-600">{item.quote}</p>
              </ShellCard>
            ))}
          </div>
        </section>

        <section id="priser" className="py-16">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
              Priser
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Priser byggda for operativ mognad, inte funktionskaos
            </h2>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {pricingTiers.map((plan) => (
              <ShellCard
                key={plan.name}
                title={plan.name}
                eyebrow={plan.featured ? "Mest vald" : "Plan"}
                className={plan.featured ? "border-cyan-400/20" : ""}
              >
                <p className="text-4xl font-semibold text-slate-950">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-500">{plan.cadence}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description}</p>
                <div className="mt-5 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Utforska {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </ShellCard>
            ))}
          </div>
        </section>

        <section id="faq" className="py-16">
          <div className="grid gap-5 lg:grid-cols-2">
            {faqItems.map((item) => (
              <ShellCard key={item.title} title={item.title} eyebrow="FAQ">
                <p className="text-sm leading-7 text-slate-600">{item.description}</p>
              </ShellCard>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
