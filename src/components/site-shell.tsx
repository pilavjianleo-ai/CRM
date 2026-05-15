"use client";

import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { footerLinks, siteNav } from "@/lib/site-content";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_85%_16%,rgba(132,204,22,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(247,247,245,0.98)_100%)]" />
      <div className="relative mx-auto max-w-[1320px] px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-20 rounded-[28px] border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">Relations System</p>
                <p className="truncate text-xs text-slate-500">
                  Intelligent Business OS for moderna tjänsteföretag
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {siteNav.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/portal-access"
                className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                Portalaccess
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logga in
              </Link>
              <Link
                href="/registrera"
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
              >
                Starta gratis
              </Link>
              <button className="inline-flex rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-slate-50 lg:hidden">
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className={compact ? "pt-14" : "pt-10"}>{children}</main>

        <footer className="mt-20 border-t border-slate-200 py-10 text-sm text-slate-500">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold text-slate-950">Relations System</p>
              <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                Ett strukturerat, modernt Business OS som kopplar ihop hemsida,
                portal, kundflöden, drift, fakturering och AI i ett lugnt system.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-slate-950"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
