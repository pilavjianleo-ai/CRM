import { NextResponse } from "next/server";
import { TaskPriority } from "@prisma/client";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

type SearchResult = {
  id: string;
  type: "Kund" | "Lead" | "Bokning" | "Uppgift" | "Faktura" | "AI-insikt";
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

export async function GET(request: Request) {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.workspaceId || !prisma) {
    return NextResponse.json({ results: [] satisfies SearchResult[] }, { status: 200 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  const workspaceId = session.user.workspaceId;
  try {
    const [customers, leads, bookings, tasks, invoices, insights] = await Promise.all([
      prisma.customer.findMany({
        where: {
          workspaceId,
          OR: [
            { companyName: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 4,
        select: {
          id: true,
          companyName: true,
          contactName: true,
          email: true,
        },
      }),
      prisma.lead.findMany({
        where: {
          workspaceId,
          OR: [
            { companyName: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { nextAction: { contains: query, mode: "insensitive" } },
            { source: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 4,
        select: {
          id: true,
          companyName: true,
          contactName: true,
          status: true,
          estimatedValue: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { customer: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ startsAt: "asc" }],
        take: 4,
        select: {
          id: true,
          title: true,
          startsAt: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      }),
      prisma.task.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { customer: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ updatedAt: "desc" }],
        take: 4,
        select: {
          id: true,
          title: true,
          priority: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      }),
      prisma.invoice.findMany({
        where: {
          workspaceId,
          OR: [
            { invoiceNumber: { contains: query, mode: "insensitive" } },
            { customer: { companyName: { contains: query, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ createdAt: "desc" }],
        take: 4,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          amount: true,
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      }),
      prisma.aIInsight.findMany({
        where: {
          workspaceId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: [{ createdAt: "desc" }],
        take: 4,
        select: {
          id: true,
          title: true,
          type: true,
        },
      }),
    ]);

    const priorityMap: Record<TaskPriority, string> = {
      LOW: "Låg prioritet",
      MEDIUM: "Medium prioritet",
      HIGH: "Hög prioritet",
      URGENT: "Akut prioritet",
    };

    const results: SearchResult[] = [
      ...customers.map((customer) => ({
        id: `customer-${customer.id}`,
        type: "Kund" as const,
        title: customer.companyName,
        subtitle: customer.contactName ?? customer.email ?? "Ingen kontakt sparad",
        meta: "Kundprofil",
        href: `/kunder/${customer.id}`,
      })),
      ...leads.map((lead) => ({
        id: `lead-${lead.id}`,
        type: "Lead" as const,
        title: lead.companyName,
        subtitle: lead.contactName ?? "Ingen kontaktperson",
        meta: `${lead.status} · ${lead.estimatedValue.toString()} kr`,
        href: "/leads",
      })),
      ...bookings.map((booking) => ({
        id: `booking-${booking.id}`,
        type: "Bokning" as const,
        title: booking.customer?.companyName ?? booking.title,
        subtitle: booking.title,
        meta: booking.startsAt.toLocaleString("sv-SE", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        href: "/bokningar",
      })),
      ...tasks.map((task) => ({
        id: `task-${task.id}`,
        type: "Uppgift" as const,
        title: task.title,
        subtitle: task.customer?.companyName ?? "Intern uppgift",
        meta: priorityMap[task.priority],
        href: "/uppgifter",
      })),
      ...invoices.map((invoice) => ({
        id: `invoice-${invoice.id}`,
        type: "Faktura" as const,
        title: invoice.invoiceNumber,
        subtitle: invoice.customer?.companyName ?? "Ingen kund kopplad",
        meta: `${invoice.amount.toString()} kr · ${invoice.status}`,
        href: "/fakturering",
      })),
      ...insights.map((insight) => ({
        id: `insight-${insight.id}`,
        type: "AI-insikt" as const,
        title: insight.title,
        subtitle: insight.type,
        meta: "Öppna AI-assistent",
        href: "/ai-assistent",
      })),
    ].slice(0, 12);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }
}
