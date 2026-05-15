"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(132,204,22,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.75)_0%,rgba(247,247,245,0.98)_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-950">
                  Relations System
                </span>
                <span className="block text-xs text-slate-500">
                  AI-drivet Business OS
                </span>
              </span>
            </Link>

            <h1 className="mt-10 text-3xl font-semibold text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              {description}
            </p>

            <div className="mt-10 space-y-4 text-sm text-slate-600">
              {[
                "Tydligt gränssnitt som går att förstå direkt",
                "AI som hjälper med uppföljning, offert och kundinsikter",
                "Byggt för daglig användning av riktiga team",
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            {children}
            {footer ? <div className="mt-6 text-sm text-slate-500">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
