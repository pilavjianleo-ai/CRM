"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CirclePlus,
  Command,
  CreditCard,
  FileText,
  Gauge,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PanelLeft,
  PanelRight,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type GlobalSearchResult = {
  id: string;
  type: "Kund" | "Lead" | "Bokning" | "Uppgift" | "Faktura" | "AI-insikt";
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

type CommandAction = {
  id: string;
  kind: "command";
  label: string;
  subtitle: string;
  meta: string;
  href: string;
  keywords: string[];
};

type CommandPaletteItem =
  | CommandAction
  | (GlobalSearchResult & {
      kind: "result";
      label: string;
      badge: GlobalSearchResult["type"];
    });

type NotificationItem = {
  id: string;
  type:
    | "SYSTEM"
    | "LEAD"
    | "CUSTOMER"
    | "BOOKING"
    | "TASK"
    | "INVOICE"
    | "AUTOMATION"
    | "CONVERSATION"
    | "AI";
  priority: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

const sidebarGroups: NavGroup[] = [
  {
    label: "Kommandocenter",
    items: [
      { label: "Översikt", href: "/oversikt", icon: LayoutDashboard },
      { label: "AI-assistent", href: "/ai-assistent", icon: Bot },
      { label: "Statistik", href: "/statistik", icon: Gauge },
    ],
  },
  {
    label: "Relationer och sälj",
    items: [
      { label: "Leads", href: "/leads", icon: Target },
      { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
      { label: "Kunder", href: "/kunder", icon: Building2 },
      { label: "Konversationer", href: "/konversationer", icon: MessageSquareText },
      { label: "Offerter", href: "/offerter", icon: FileText },
    ],
  },
  {
    label: "Drift",
    items: [
      { label: "Bokningar", href: "/bokningar", icon: CalendarDays },
      { label: "Uppgifter", href: "/uppgifter", icon: BookOpen },
      { label: "Automationer", href: "/automationer", icon: Zap },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Team", href: "/team", icon: Users },
      { label: "Fakturering", href: "/fakturering", icon: CreditCard },
      { label: "Inställningar", href: "/installningar", icon: Settings },
    ],
  },
];

const bottomNav = [
  { label: "Översikt", href: "/oversikt", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Target },
  { label: "Kunder", href: "/kunder", icon: Building2 },
  { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
  { label: "AI", href: "/ai-assistent", icon: Bot },
];

const commandActions: CommandAction[] = [
  {
    id: "command-create-customer",
    kind: "command",
    label: "Skapa kund",
    subtitle: "Öppna kundytan för att skapa eller uppdatera kunddata.",
    meta: "Kommando",
    href: "/kunder",
    keywords: ["skapa kund", "ny kund", "kund", "customer", "lägg till kund"],
  },
  {
    id: "command-create-lead",
    kind: "command",
    label: "Skapa lead",
    subtitle: "Öppna leads för ny registrering och kvalificering.",
    meta: "Kommando",
    href: "/leads",
    keywords: ["skapa lead", "nytt lead", "lead", "registrera lead"],
  },
  {
    id: "command-open-pipeline",
    kind: "command",
    label: "Öppna pipeline",
    subtitle: "Gå direkt till säljflödet och prioriterade affärer.",
    meta: "Kommando",
    href: "/pipeline",
    keywords: ["pipeline", "öppna pipeline", "visa pipeline", "säljflöde"],
  },
  {
    id: "command-create-booking",
    kind: "command",
    label: "Boka möte",
    subtitle: "Öppna bokningar för ny bokning eller planering.",
    meta: "Kommando",
    href: "/bokningar",
    keywords: ["boka möte", "ny bokning", "booking", "boka", "kalender"],
  },
  {
    id: "command-overdue-tasks",
    kind: "command",
    label: "Visa försenade uppgifter",
    subtitle: "Öppna uppgifter med fokus på det som blockerar flödet.",
    meta: "Kommando",
    href: "/uppgifter",
    keywords: ["försenade tasks", "försenade uppgifter", "overdue", "visa tasks", "uppgifter"],
  },
  {
    id: "command-create-automation",
    kind: "command",
    label: "Skapa automation",
    subtitle: "Öppna automationer för nytt arbetsflöde eller AI-recept.",
    meta: "Kommando",
    href: "/automationer",
    keywords: ["skapa automation", "ny automation", "automation", "workflow"],
  },
  {
    id: "command-create-invoice",
    kind: "command",
    label: "Skapa faktura",
    subtitle: "Gå till fakturering för att skapa och följa upp kundfakturor.",
    meta: "Kommando",
    href: "/fakturering",
    keywords: ["skapa faktura", "ny faktura", "invoice", "fakturering"],
  },
  {
    id: "command-open-ai",
    kind: "command",
    label: "Öppna AI-assistent",
    subtitle: "Kör analys, utkast och operativa AI-åtgärder.",
    meta: "Kommando",
    href: "/ai-assistent",
    keywords: ["ai", "öppna ai", "assistent", "analysera", "sammanfatta"],
  },
  {
    id: "command-open-team",
    kind: "command",
    label: "Öppna team",
    subtitle: "Se teamyta, ansvar och arbetsfördelning.",
    meta: "Kommando",
    href: "/team",
    keywords: ["team", "tilldela teammedlem", "medlem", "assignment"],
  },
];

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function fuzzyIncludes(query: string, target: string) {
  if (!query) {
    return true;
  }

  let index = 0;

  for (const character of target) {
    if (character === query[index]) {
      index += 1;
    }

    if (index === query.length) {
      return true;
    }
  }

  return false;
}

function matchesCommand(query: string, command: CommandAction) {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  return command.keywords.some((keyword) => {
    const normalizedKeyword = normalizeSearchValue(keyword);

    return (
      normalizedKeyword.includes(normalizedQuery) ||
      fuzzyIncludes(normalizedQuery.replace(/\s+/g, ""), normalizedKeyword.replace(/\s+/g, ""))
    );
  });
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `${diffMinutes} min sedan`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h sedan`;
  }

  return date.toLocaleDateString("sv-SE", {
    month: "short",
    day: "numeric",
  });
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const sharedClassName = `group relative flex items-center rounded-[20px] px-3.5 py-2.5 text-sm transition ${
    active
      ? "bg-[linear-gradient(135deg,rgba(244,253,249,0.98),rgba(255,255,255,0.98))] text-slate-950 shadow-[0_12px_24px_rgba(15,23,42,0.05)] ring-1 ring-emerald-100/90"
      : "text-slate-500 hover:bg-white/95 hover:text-slate-900"
  } ${collapsed ? "justify-center" : "gap-3"} ${item.disabled ? "opacity-60" : ""}`;

  const content = (
    <>
      {!collapsed ? (
        <span
          className={`absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full transition ${
            active ? "bg-emerald-500/90" : "bg-transparent group-hover:bg-slate-200"
          }`}
        />
      ) : null}
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
          active
            ? "bg-white text-emerald-700 shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
            : "bg-slate-100/90 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {!collapsed && active ? (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Aktiv
        </span>
      ) : null}
      {!collapsed && item.disabled ? (
        <span className="ml-auto rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Snart
        </span>
      ) : null}
    </>
  );

  if (item.disabled) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <Link href={item.href} className={sharedClassName}>
      {content}
    </Link>
  );
}

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className}`}
      >
        <LogOut className="h-4 w-4 text-slate-500" />
        Logga ut
      </button>
    </form>
  );
}

function QuickCreatePanel({ onNavigate }: { onNavigate: () => void }) {
  const actions = [
    { label: "Nytt lead", href: "/leads" },
    { label: "Ny kund", href: "/kunder" },
    { label: "Ny bokning", href: "/bokningar" },
    { label: "Ny offert", href: "/offerter" },
  ];

  return (
    <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-[24px] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <p className="px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
        Snabbval
      </p>
      <div className="space-y-1.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={onNavigate}
            className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
          >
            {action.label}
            <CirclePlus className="h-4 w-4 text-emerald-700" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CrmShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const notificationsPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  }, [pathname]);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);

    try {
      const response = await fetch("/api/notifications?limit=8", {
        cache: "no-store",
      });

      if (!response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = (await response.json()) as {
        notifications?: NotificationItem[];
        unreadCount?: number;
      };
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const response = await fetch(
          `/api/search/global?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setSearchResults([]);
          return;
        }

        const data = (await response.json()) as { results?: GlobalSearchResult[] };
        setSearchResults(data.results ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [loadNotifications, pathname]);

  useEffect(() => {
    async function sendPresencePing() {
      try {
        await fetch("/api/presence", {
          method: "POST",
          cache: "no-store",
        });
      } catch {
        // Ignore transient presence failures.
      }
    }

    void sendPresencePing();

    const interval = window.setInterval(() => {
      void sendPresencePing();
    }, 60000);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void sendPresencePing();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const commandMatches = useMemo(
    () => commandActions.filter((command) => matchesCommand(searchQuery, command)).slice(0, 6),
    [searchQuery],
  );

  const paletteItems = useMemo<CommandPaletteItem[]>(
    () => [
      ...commandMatches,
      ...searchResults.map((result) => ({
        ...result,
        kind: "result" as const,
        label: result.title,
        badge: result.type,
      })),
    ],
    [commandMatches, searchResults],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchOpen, searchQuery, paletteItems.length]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }

      if (!notificationsPanelRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function executePaletteItem(item: CommandPaletteItem) {
    setSearchOpen(false);
    setQuickCreateOpen(false);
    router.push(item.href);
  }

  async function markNotificationsRead(notificationId?: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        notificationId ? { notificationId } : { markAll: true },
      ),
    });

    await loadNotifications();
  }

  async function openNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      await markNotificationsRead(notification.id);
    }

    setNotificationsOpen(false);

    if (notification.href) {
      router.push(notification.href);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(132,204,22,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(247,247,245,0.98)_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-5 px-3 pb-28 pt-3 sm:px-4 lg:px-6 lg:pb-6">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className={`sticky top-3 hidden h-[calc(100vh-24px)] shrink-0 overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.9))] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex lg:flex-col ${
            sidebarCollapsed ? "w-[104px]" : "w-[286px]"
          }`}
        >
          <div
            className={`rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.94))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${
              sidebarCollapsed ? "flex justify-center" : ""
            }`}
          >
            <div className={sidebarCollapsed ? "" : "flex items-start justify-between gap-4"}>
              {!sidebarCollapsed ? (
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
                    Scandinavian AI OS
                  </p>
                  <h1 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-slate-950">
                    Relations System
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">
                    Operativt command center för team, kunder och intäkt.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    System live
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Fokus pa vardagsarbete
                  </div>
                </div>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50/80 text-emerald-600">
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
              {!sidebarCollapsed ? (
                <button
                  onClick={() => setSidebarCollapsed((value) => !value)}
                  className="rounded-2xl border border-slate-200/80 bg-white/90 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <nav className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed ? (
                  <div className="mb-2 flex items-center gap-3 px-3.5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      {group.label}
                    </p>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(203,213,225,0.9),rgba(16,185,129,0.14))]" />
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.label}
                      item={item}
                      active={isActivePath(pathname, item.href)}
                      collapsed={sidebarCollapsed}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="rounded-[26px] border border-emerald-100/80 bg-[linear-gradient(180deg,rgba(244,253,249,0.98),rgba(255,255,255,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/ai-assistent"
                  className="flex h-11 items-center justify-center rounded-2xl bg-white/95 text-slate-900 transition hover:bg-emerald-50/80"
                >
                  <BrainCircuit className="h-5 w-5 text-emerald-600" />
                </Link>
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="flex h-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 text-slate-700 transition hover:bg-slate-50"
                >
                  <PanelRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50/80 text-emerald-600">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">AI Copilot</p>
                    <p className="text-xs leading-5 text-slate-500">
                      Analysera, prioritera och skapa åtgärder från verklig data.
                    </p>
                  </div>
                </div>
                <Link
                  href="/ai-assistent"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,rgba(5,150,105,0.98),rgba(15,118,110,0.92))] px-4 py-3 text-sm font-medium text-white shadow-[0_14px_24px_rgba(5,150,105,0.16)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_28px_rgba(5,150,105,0.2)]"
                >
                  Öppna assistent
                  <Sparkles className="h-4 w-4" />
                </Link>
                <LogoutButton className="mt-3 flex w-full" />
              </>
            )}
          </div>
        </motion.aside>

        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="sticky top-3 z-20 flex flex-col gap-2.5 rounded-[26px] border border-slate-200/80 bg-white/92 p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-900 lg:hidden">
                  <LayoutDashboard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Business OS</p>
                  <h2 className="text-lg font-semibold text-slate-950 sm:text-[1.45rem]">
                    {title}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{description}</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Globe className="h-4 w-4 text-emerald-600" />
                  Webbplats
                </Link>
                <Link
                  href="/ai-assistent"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  AI-snabbval
                </Link>
                <LogoutButton />
                <div className="relative">
                  <button
                    onClick={() => setQuickCreateOpen((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_10px_20px_rgba(5,150,105,0.14)] transition hover:bg-emerald-700"
                  >
                    <CirclePlus className="h-4 w-4" />
                    Skapa nytt
                  </button>
                  {quickCreateOpen ? (
                    <QuickCreatePanel onNavigate={() => setQuickCreateOpen(false)} />
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <div ref={searchContainerRef} className="relative min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-slate-500">
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(event) => {
                      if (!searchOpen || paletteItems.length === 0) {
                        if (event.key === "Escape") {
                          setSearchOpen(false);
                        }
                        return;
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setSelectedIndex((current) => (current + 1) % paletteItems.length);
                        return;
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setSelectedIndex(
                          (current) => (current - 1 + paletteItems.length) % paletteItems.length,
                        );
                        return;
                      }

                      if (event.key === "Enter") {
                        event.preventDefault();
                        executePaletteItem(paletteItems[selectedIndex]);
                        return;
                      }

                      if (event.key === "Escape") {
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Sök kunder, leads, bokningar, uppgifter, fakturor och AI-insikter..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <span className="ml-auto hidden rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-400 sm:inline-flex">
                    <Command className="mr-1 h-3 w-3" />
                    K
                  </span>
                </div>

                {searchOpen ? (
                  <div className="absolute inset-x-0 top-full z-30 mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                    <div className="border-b border-slate-100 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Command Bar
                    </div>
                    <div className="max-h-[420px] overflow-y-auto p-2">
                      {searchQuery.trim().length < 2 ? (
                        <>
                          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            Snabbkommandon
                          </div>
                          {commandActions.slice(0, 6).map((command, index) => (
                            <button
                              key={command.id}
                              type="button"
                              onMouseEnter={() => setSelectedIndex(index)}
                              onClick={() => executePaletteItem(command)}
                              className={`block w-full rounded-[20px] px-3 py-3 text-left transition ${
                                selectedIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-950">
                                    {command.label}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">{command.subtitle}</p>
                                </div>
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                                  Kommando
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : searchLoading ? (
                        <div className="px-3 py-4 text-sm text-slate-500">Söker i arbetsytan...</div>
                      ) : paletteItems.length > 0 ? (
                        paletteItems.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => executePaletteItem(item)}
                            className={`block w-full rounded-[20px] px-3 py-3 text-left transition ${
                              selectedIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-950">
                                  {item.kind === "command" ? item.label : item.title}
                                </p>
                                <p className="mt-1 truncate text-sm text-slate-500">
                                  {item.kind === "command" ? item.subtitle : item.subtitle}
                                </p>
                              </div>
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                                {item.kind === "command" ? "Kommando" : item.badge}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">{item.meta}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-slate-500">
                          Inga träffar eller kommandon för &quot;{searchQuery.trim()}&quot;.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-2.5 text-sm text-emerald-700">
                  <Activity className="h-3.5 w-3.5" />
                  Liveaktivitet
                </div>
                <div ref={notificationsPanelRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen((current) => !current);
                      if (!notificationsOpen) {
                        void loadNotifications();
                      }
                    }}
                    className="relative flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-slate-700 transition hover:bg-slate-50"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>

                  {notificationsOpen ? (
                    <div className="absolute right-0 top-full z-30 mt-3 w-[360px] overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-950">Notifieringar</p>
                          <p className="text-xs text-slate-500">
                            {unreadCount > 0
                              ? `${unreadCount} olästa just nu`
                              : "Allt är läst just nu"}
                          </p>
                        </div>
                        {unreadCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => void markNotificationsRead()}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Markera alla som lästa
                          </button>
                        ) : null}
                      </div>
                      <div className="max-h-[420px] overflow-y-auto p-2">
                        {notificationsLoading ? (
                          <div className="px-3 py-4 text-sm text-slate-500">
                            Hämtar notifieringar...
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => void openNotification(notification)}
                              className={`block w-full rounded-[20px] px-3 py-3 text-left transition hover:bg-slate-50 ${
                                notification.readAt ? "" : "bg-emerald-50/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-950">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {notification.body}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">
                                    {notification.type}
                                  </span>
                                  {!notification.readAt ? (
                                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white">
                                      Ny
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <p className="mt-2 text-xs text-slate-400">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm leading-6 text-slate-500">
                            Inga notifieringar ännu. När leads, bokningar, uppgifter, AI-svar och automationer skapas dyker de upp här.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 sm:col-span-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lime-50 text-lime-600">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-950">Teamet</p>
                    <p className="text-xs text-slate-500">Öppna teamytan.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {children}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] border border-slate-200/80 bg-white/92 p-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <Link
        href="/ai-assistent"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(5,150,105,0.95),rgba(132,204,22,0.95))] text-white shadow-[0_16px_30px_rgba(5,150,105,0.24)] transition hover:scale-[1.03] lg:bottom-6 lg:right-6"
      >
        <Sparkles className="h-5 w-5" />
      </Link>

      <div className="fixed inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(247,247,245,0.9),transparent)]" />
    </div>
  );
}
