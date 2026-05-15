"use client";

import { Bell, Bot, Paintbrush, Users } from "lucide-react";
import { CrmShell } from "@/components/crm-shell";
import { ShellCard } from "@/components/shell-card";

export function SettingsPage() {
  return (
    <CrmShell
      title="Inställningar som styr arbetsytan"
      description="Hantera arbetsyta, aviseringar, branding och AI-regler i en strukturerad inställningsyta som känns som en del av Business OS, inte en teknisk bakgård."
    >
      <div className="grid gap-5">
        <ShellCard title="Inställningsområden" eyebrow="Workspace controls" action="Spara ändringar">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Arbetsyta",
                text: "Namn, företagsuppgifter och grundinställningar för teamet.",
                icon: Users,
              },
              {
                title: "Aviseringar",
                text: "Styr påminnelser, kundnotiser och interna signaler.",
                icon: Bell,
              },
              {
                title: "Branding",
                text: "Anpassa logotyp, färgprofil och upplevelsen mot kund.",
                icon: Paintbrush,
              },
              {
                title: "AI-inställningar",
                text: "Välj ton, regler och hur AI ska hjälpa i olika flöden.",
                icon: Bot,
              },
            ].map((section) => {
              const Icon = section.icon;

              return (
                <div
                  key={section.title}
                  className="rounded-[24px] border border-slate-200 bg-white p-5"
                >
                  <Icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-4 text-sm font-medium text-slate-950">{section.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {section.text}
                  </p>
                </div>
              );
            })}
          </div>
        </ShellCard>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="grid gap-5">
            <ShellCard title="Hur inställningarna påverkar systemet" eyebrow="Operativ effekt" action="Öppna arbetsyta">
              <div className="grid gap-3 lg:grid-cols-2">
                {[
                  "Arbetsytan ska vara enkel att förstå för teamet och tydlig mot kund.",
                  "Aviseringar ska stödja rätt timing, inte skapa mer brus.",
                  "Branding ska kännas premium men inte bryta systemets lugn.",
                  "AI-regler ska vara konsekventa mellan leads, kunder, bokningar och dialoger.",
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

            <ShellCard title="Föreslagna nästa justeringar" eyebrow="Rekommenderat">
              <div className="space-y-3">
                {[
                  "Tighta interna aviseringar så att bara kritiska signaler bryter igenom direkt.",
                  "Skapa en tydligare AI-ton för uppföljningar och kunddialoger.",
                  "Synka kundnära branding med publika delar av webbplatsen.",
                ].map((item) => (
                  <button
                    key={item}
                  className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white p-4 text-left transition hover:bg-slate-50"
                  >
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                  <Bot className="h-4 w-4 shrink-0 text-emerald-700" />
                  </button>
                ))}
              </div>
            </ShellCard>
          </div>

          <div className="grid gap-5">
            <ShellCard title="Systemdisciplin" eyebrow="Grundprinciper">
              <div className="space-y-3">
                {[
                  "Inställningar ska förklara vad de påverkar, inte bara visa fält.",
                  "Det ska vara tydligt vilka val som påverkar teamet, kunden och AI-lagret.",
                  "Bra inställningar minskar friktion i vardagen snarare än att skapa tekniskt arbete.",
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

            <ShellCard title="Prioriterade områden" eyebrow="Just nu">
              <div className="space-y-3">
                {[
                  "AI-ton och säkerhetsregler",
                  "Interna aviseringar och risknotiser",
                  "Workspace-identitet och kundnära branding",
                ].map((item) => (
                  <div
                    key={item}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm font-medium text-slate-950"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </ShellCard>
          </div>
        </div>
      </div>
    </CrmShell>
  );
}
