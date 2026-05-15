import {
  AIInsightType,
  BookingStatus,
  CustomerHealth,
  EntityType,
  LeadStatus,
  LeadTemperature,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { getWorkspaceWithDefaultUser } from "@/lib/server/workspace";
import type {
  PublicBookingInput,
  PublicLeadInput,
} from "@/lib/validation/intake";

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export async function createPublicLead(input: PublicLeadInput) {
  const prisma = getPrisma();

  if (!prisma) {
    throw new Error("Databasen är inte konfigurerad ännu.");
  }

  const { workspace, owner } = await getWorkspaceWithDefaultUser(prisma);

  const customer = await prisma.customer.upsert({
    where: {
      workspaceId_companyName: {
        workspaceId: workspace.id,
        companyName: input.company,
      },
    },
    create: {
      workspaceId: workspace.id,
      ownerId: owner?.id,
      companyName: input.company,
      contactName: input.name,
      email: input.email,
      phone: input.phone,
      score: 58,
      health: CustomerHealth.HEALTHY,
      notes: input.message,
      lastActivityAt: new Date(),
    },
    update: {
      contactName: input.name,
      email: input.email,
      phone: input.phone,
      notes: input.message,
      lastActivityAt: new Date(),
    },
  });

  const lead = await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      ownerId: owner?.id,
      companyName: input.company,
      contactName: input.name,
      email: input.email,
      phone: input.phone,
      status: LeadStatus.NEW,
      temperature: LeadTemperature.WARM,
      score: 72,
      estimatedValue: 25000,
      probability: 44,
      source: input.source ?? "Hemsidans formulär",
      nextAction: "Kontakta lead inom 15 minuter",
      lastContactAt: new Date(),
    },
  });

  await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      assignedToId: owner?.id,
      customerId: customer.id,
      leadId: lead.id,
      title: `Följ upp nytt lead från ${input.company}`,
      description: input.message ?? "Lead inkom via hemsidan.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
  });

  await prisma.aIInsight.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer.id,
      leadId: lead.id,
      createdById: owner?.id,
      entityType: EntityType.LEAD,
      type: AIInsightType.NEXT_ACTION,
      title: `Nytt lead från ${input.company}`,
      content:
        "Leadet är skapat från hemsidan. AI rekommenderar snabb första kontakt och tydligt nästa steg.",
      confidence: 82,
    },
  });

  return { leadId: lead.id, customerId: customer.id };
}

export async function createPublicBooking(input: PublicBookingInput) {
  const prisma = getPrisma();

  if (!prisma) {
    throw new Error("Databasen är inte konfigurerad ännu.");
  }

  const { workspace, owner } = await getWorkspaceWithDefaultUser(prisma);
  const startsAt = buildDateTime(input.date, input.time);
  const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);

  const customer = await prisma.customer.upsert({
    where: {
      workspaceId_companyName: {
        workspaceId: workspace.id,
        companyName: input.company,
      },
    },
    create: {
      workspaceId: workspace.id,
      ownerId: owner?.id,
      companyName: input.company,
      contactName: input.name,
      email: input.email,
      phone: input.phone,
      score: 64,
      health: CustomerHealth.HEALTHY,
      notes: input.notes,
      lastActivityAt: new Date(),
    },
    update: {
      contactName: input.name,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
      lastActivityAt: new Date(),
    },
  });

  const booking = await prisma.booking.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer.id,
      assignedToId: owner?.id,
      title: input.service,
      status: BookingStatus.CONFIRMED,
      startsAt,
      endsAt,
      location: input.address,
      notes: input.notes ?? `Bokning skapad via ${input.source ?? "publik bokning"}.`,
    },
  });

  await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      assignedToId: owner?.id,
      customerId: customer.id,
      bookingId: booking.id,
      title: `Bekräfta bokning för ${input.company}`,
      description: `Ny bokning för ${input.service}. Kontrollera schema och skicka påminnelse.`,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
  });

  await prisma.aIInsight.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer.id,
      bookingId: booking.id,
      createdById: owner?.id,
      entityType: EntityType.BOOKING,
      type: AIInsightType.SUMMARY,
      title: `Ny bokning från ${input.company}`,
      content:
        "Bokningen är skapad, kunden är uppdaterad och systemet rekommenderar att skicka bekräftelse och påminnelse.",
      confidence: 89,
    },
  });

  return { bookingId: booking.id, customerId: customer.id };
}
