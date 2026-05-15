"use server";

import {
  AIInsightType,
  ActivityType,
  AutomationStatus,
  BookingStatus,
  ConversationChannel,
  ConversationDirection,
  CustomerHealth,
  EntityType,
  InvoiceStatus,
  LeadStatus,
  LeadTemperature,
  NotificationPriority,
  NotificationType,
  QuoteStatus,
  TaskPriority,
  TaskStatus,
  WorkspaceRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type {
  ActionState,
  AIAssistantActionState,
} from "@/lib/actions/action-state";
import { getPrisma } from "@/lib/prisma";
import {
  createAutomationFlowSchema,
  createBookingSchema,
  createCustomerSchema,
  createCustomerMessageSchema,
  createCustomerTaskSchema,
  createInvoiceSchema,
  createLeadSchema,
  createQuoteSchema,
  materializeAIInsightSchema,
  runAIAssistantSchema,
  updateLeadSchema,
  updateTeamMemberActiveSchema,
  updateTeamMemberRoleSchema,
  updateAutomationStatusSchema,
  updateCustomerNotesSchema,
  updateLeadStageSchema,
  updateQuoteStatusSchema,
  updateTaskStatusSchema,
} from "@/lib/validation/crm";

function buildDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

async function getActionContext() {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.id || !session.user.workspaceId || !prisma) {
    return null;
  }

  return {
    prisma,
    userId: session.user.id,
    workspaceId: session.user.workspaceId,
    role: session.user.role as WorkspaceRole,
  };
}

async function createNotification(
  context: NonNullable<Awaited<ReturnType<typeof getActionContext>>>,
  input: {
    type: NotificationType;
    title: string;
    body: string;
    href?: string;
    entityType?: EntityType;
    entityId?: string;
    priority?: NotificationPriority;
    userId?: string;
  },
) {
  await context.prisma.notification.create({
    data: {
      workspaceId: context.workspaceId,
      userId: input.userId ?? context.userId,
      type: input.type,
      priority: input.priority ?? NotificationPriority.MEDIUM,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
    },
  });
}

async function createActivityLog(
  context: NonNullable<Awaited<ReturnType<typeof getActionContext>>>,
  input: {
    type: ActivityType;
    title: string;
    detail: string;
    entityType: EntityType;
    entityId?: string;
    customerId?: string;
    leadId?: string;
    bookingId?: string;
    taskId?: string;
    invoiceId?: string;
    conversationId?: string;
  },
) {
  await context.prisma.activityLog.create({
    data: {
      workspaceId: context.workspaceId,
      actorId: context.userId,
      type: input.type,
      title: input.title,
      detail: input.detail,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      customerId: input.customerId ?? null,
      leadId: input.leadId ?? null,
      bookingId: input.bookingId ?? null,
      taskId: input.taskId ?? null,
      invoiceId: input.invoiceId ?? null,
      conversationId: input.conversationId ?? null,
    },
  });
}

function canManageTeam(role: WorkspaceRole) {
  return role === WorkspaceRole.OWNER || role === WorkspaceRole.ADMIN;
}

function inferAIInsightType(prompt: string): AIInsightType {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("automation") || normalized.includes("flöde")) {
    return AIInsightType.AUTOMATION;
  }

  if (
    normalized.includes("risk") ||
    normalized.includes("churn") ||
    normalized.includes("tappa") ||
    normalized.includes("förlora")
  ) {
    return AIInsightType.RISK;
  }

  if (normalized.includes("analysera") || normalized.includes("statistik")) {
    return AIInsightType.ANALYTICS;
  }

  if (normalized.includes("nästa steg") || normalized.includes("uppgift")) {
    return AIInsightType.NEXT_ACTION;
  }

  return AIInsightType.SUMMARY;
}

function getAssistantText(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "choices" in payload &&
    Array.isArray(payload.choices) &&
    payload.choices[0] &&
    typeof payload.choices[0] === "object" &&
    payload.choices[0] !== null &&
    "message" in payload.choices[0]
  ) {
    const message = (payload.choices[0] as { message?: { content?: unknown } }).message;
    const content = message?.content;

    if (typeof content === "string") {
      return content.trim();
    }

    if (Array.isArray(content)) {
      return content
        .map((item) =>
          typeof item === "object" &&
          item !== null &&
          "text" in item &&
          typeof item.text === "string"
            ? item.text
            : "",
        )
        .join("\n")
        .trim();
    }
  }

  return "";
}

function getAutomationActionLabel(type: AIInsightType) {
  if (type === AIInsightType.AUTOMATION) {
    return "Implementera rekommenderat AI-flöde";
  }

  if (type === AIInsightType.NEXT_ACTION) {
    return "Skapa uppföljningsflöde från AI-insikten";
  }

  if (type === AIInsightType.RISK) {
    return "Bygg riskhantering och mänsklig uppföljning";
  }

  if (type === AIInsightType.ANALYTICS) {
    return "Automatisera uppföljning baserat på AI-analys";
  }

  return "Aktivera AI-rekommenderat arbetsflöde";
}

export async function createCustomerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createCustomerSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.upsert({
    where: {
      workspaceId_companyName: {
        workspaceId: context.workspaceId,
        companyName: parsed.data.companyName,
      },
    },
    create: {
      workspaceId: context.workspaceId,
      ownerId: context.userId,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      score: 68,
      health: CustomerHealth.HEALTHY,
      lastActivityAt: new Date(),
    },
    update: {
      contactName: parsed.data.contactName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      lastActivityAt: new Date(),
    },
  });

  await createNotification(context, {
    type: NotificationType.CUSTOMER,
    priority: NotificationPriority.MEDIUM,
    title: `Kund sparad: ${parsed.data.companyName}`,
    body: "Kundprofilen uppdaterades och är nu tillgänglig i arbetsytan.",
    href: "/kunder",
    entityType: EntityType.CUSTOMER,
  });

  await createActivityLog(context, {
    type: ActivityType.CUSTOMER_CREATED,
    title: `Kund sparad: ${parsed.data.companyName}`,
    detail: `Kontakt ${parsed.data.contactName} lades till eller uppdaterades i kundprofilen.`,
    entityType: EntityType.CUSTOMER,
    entityId: customer.id,
    customerId: customer.id,
  });

  revalidatePath("/kunder");
  revalidatePath("/oversikt");
  revalidatePath("/ai-assistent");

  return { status: "success", message: "Kunden sparades." };
}

export async function createLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createLeadSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedValue: formData.get("estimatedValue"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const lead = await context.prisma.lead.create({
    data: {
      workspaceId: context.workspaceId,
      ownerId: context.userId,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: LeadStatus.NEW,
      temperature: LeadTemperature.WARM,
      score: 70,
      estimatedValue: parsed.data.estimatedValue,
      probability: 35,
      source: "Intern registrering",
      nextAction: "Kontakta lead inom 15 minuter",
      lastContactAt: new Date(),
    },
  });

  await createNotification(context, {
    type: NotificationType.LEAD,
    priority: NotificationPriority.HIGH,
    title: `Nytt lead: ${parsed.data.companyName}`,
    body: "Leadet skapades och har lagts till i pipelinen.",
    href: "/pipeline",
    entityType: EntityType.LEAD,
  });

  await createActivityLog(context, {
    type: ActivityType.LEAD_CREATED,
    title: `Lead skapat: ${parsed.data.companyName}`,
    detail: "Leadet skapades i pipelinen med första nästa steg för snabb uppföljning.",
    entityType: EntityType.LEAD,
    entityId: lead.id,
    leadId: lead.id,
  });

  revalidatePath("/leads");
  revalidatePath("/oversikt");
  revalidatePath("/pipeline");

  return { status: "success", message: "Leadet skapades." };
}

export async function updateLeadAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateLeadSchema.safeParse({
    leadId: formData.get("leadId"),
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedValue: formData.get("estimatedValue"),
    probability: formData.get("probability"),
    temperature: formData.get("temperature"),
    source: formData.get("source"),
    nextAction: formData.get("nextAction"),
    ownerId: formData.get("ownerId"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const lead = await context.prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!lead) {
    return { status: "error", message: "Leadet kunde inte hittas." };
  }

  const duplicateLead = await context.prisma.lead.findFirst({
    where: {
      workspaceId: context.workspaceId,
      companyName: parsed.data.companyName.trim(),
      id: {
        not: lead.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateLead) {
    return { status: "error", message: "Det finns redan ett lead med det företagsnamnet." };
  }

  let ownerId: string | null = null;

  if (parsed.data.ownerId) {
    const owner = await context.prisma.user.findFirst({
      where: {
        id: parsed.data.ownerId,
        workspaceId: context.workspaceId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!owner) {
      return { status: "error", message: "Vald ägare kunde inte hittas i arbetsytan." };
    }

    ownerId = owner.id;
  }

  const temperatureOffset = {
    COLD: -12,
    WARM: 0,
    HOT: 10,
  } as const;

  const score = Math.max(
    0,
    Math.min(100, Math.round(parsed.data.probability + temperatureOffset[parsed.data.temperature])),
  );

  await context.prisma.lead.update({
    where: {
      id: lead.id,
    },
    data: {
      ownerId,
      companyName: parsed.data.companyName.trim(),
      contactName: parsed.data.contactName.trim(),
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      estimatedValue: parsed.data.estimatedValue,
      probability: parsed.data.probability,
      temperature: parsed.data.temperature,
      source: parsed.data.source?.trim() || null,
      nextAction: parsed.data.nextAction.trim(),
      score,
      lastContactAt: new Date(),
    },
  });

  await createNotification(context, {
    type: NotificationType.LEAD,
    priority:
      parsed.data.probability >= 80 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Lead uppdaterat: ${parsed.data.companyName.trim()}`,
    body: parsed.data.nextAction.trim(),
    href: "/leads",
    entityType: EntityType.LEAD,
    entityId: lead.id,
  });

  await createActivityLog(context, {
    type: ActivityType.LEAD_UPDATED,
    title: `Lead uppdaterat: ${parsed.data.companyName.trim()}`,
    detail: `Nästa steg sattes till "${parsed.data.nextAction.trim()}".`,
    entityType: EntityType.LEAD,
    entityId: lead.id,
    leadId: lead.id,
  });

  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `${parsed.data.companyName.trim()} uppdaterades.`,
  };
}

export async function createBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createBookingSchema.safeParse({
    companyName: formData.get("companyName"),
    service: formData.get("service"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.upsert({
    where: {
      workspaceId_companyName: {
        workspaceId: context.workspaceId,
        companyName: parsed.data.companyName,
      },
    },
    create: {
      workspaceId: context.workspaceId,
      ownerId: context.userId,
      companyName: parsed.data.companyName,
      score: 60,
      health: CustomerHealth.HEALTHY,
      lastActivityAt: new Date(),
    },
    update: {
      lastActivityAt: new Date(),
    },
  });

  const startsAt = buildDateTime(parsed.data.date, parsed.data.time);
  const endsAt = new Date(startsAt.getTime() + 90 * 60 * 1000);

  const booking = await context.prisma.booking.create({
    data: {
      workspaceId: context.workspaceId,
      customerId: customer.id,
      assignedToId: context.userId,
      title: parsed.data.service,
      status: BookingStatus.CONFIRMED,
      startsAt,
      endsAt,
      location: parsed.data.location,
    },
  });

  await context.prisma.task.create({
    data: {
      workspaceId: context.workspaceId,
      assignedToId: context.userId,
      customerId: customer.id,
      bookingId: booking.id,
      title: `Bekräfta bokning för ${customer.companyName}`,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
  });

  await createNotification(context, {
    type: NotificationType.BOOKING,
    priority: NotificationPriority.HIGH,
    title: `Bokning skapad för ${customer.companyName}`,
    body: `Bokningen ${booking.title} ligger nu i kalendern och har en uppföljningsuppgift.`,
    href: "/bokningar",
    entityType: EntityType.BOOKING,
    entityId: booking.id,
  });

  await createActivityLog(context, {
    type: ActivityType.BOOKING_CREATED,
    title: `Bokning skapad för ${customer.companyName}`,
    detail: `${booking.title} bokades ${startsAt.toLocaleDateString("sv-SE")} och kopplades till kunden.`,
    entityType: EntityType.BOOKING,
    entityId: booking.id,
    customerId: customer.id,
    bookingId: booking.id,
  });

  revalidatePath("/bokningar");
  revalidatePath("/oversikt");
  revalidatePath("/uppgifter");

  return { status: "success", message: "Bokningen skapades." };
}

export async function updateLeadStageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateLeadStageSchema.safeParse({
    leadId: formData.get("leadId"),
    stage: formData.get("stage"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const lead = await context.prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      status: true,
      companyName: true,
    },
  });

  if (!lead) {
    return { status: "error", message: "Leadet kunde inte hittas." };
  }

  if (lead.status === parsed.data.stage) {
    return { status: "success", message: "Leadet ligger redan i valt steg." };
  }

  const probabilityByStage: Record<LeadStatus, number> = {
    NEW: 20,
    QUALIFIED: 45,
    PROPOSAL: 70,
    WON: 100,
    LOST: 0,
  };

  await context.prisma.lead.update({
    where: {
      id: lead.id,
    },
    data: {
      status: parsed.data.stage,
      probability: probabilityByStage[parsed.data.stage],
      lastContactAt: new Date(),
    },
  });

  await createNotification(context, {
    type: NotificationType.LEAD,
    priority:
      parsed.data.stage === LeadStatus.WON ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Lead flyttat: ${lead.companyName}`,
    body: `Leadet ligger nu i steget ${parsed.data.stage}.`,
    href: "/pipeline",
    entityType: EntityType.LEAD,
    entityId: lead.id,
  });

  await createActivityLog(context, {
    type: ActivityType.LEAD_STAGE_CHANGED,
    title: `Lead flyttat: ${lead.companyName}`,
    detail: `Steg ändrades till ${parsed.data.stage}.`,
    entityType: EntityType.LEAD,
    entityId: lead.id,
    leadId: lead.id,
  });

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `${lead.companyName} flyttades till nytt steg.`,
  };
}

export async function saveCustomerNotesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateCustomerNotesSchema.safeParse({
    customerId: formData.get("customerId"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!customer) {
    return { status: "error", message: "Kunden kunde inte hittas." };
  }

  await context.prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      notes: parsed.data.notes || null,
      lastActivityAt: new Date(),
    },
  });

  await createActivityLog(context, {
    type: ActivityType.CUSTOMER_NOTES_UPDATED,
    title: `Anteckningar uppdaterade för ${customer.companyName}`,
    detail:
      parsed.data.notes.length > 0
        ? "Interna anteckningar sparades i kundprofilen."
        : "Interna anteckningar rensades från kundprofilen.",
    entityType: EntityType.CUSTOMER,
    entityId: customer.id,
    customerId: customer.id,
  });

  revalidatePath("/kunder");
  revalidatePath(`/kunder/${customer.id}`);
  revalidatePath("/oversikt");

  return {
    status: "success",
    message:
      parsed.data.notes.length > 0
        ? "Anteckningarna sparades."
        : "Anteckningarna rensades.",
  };
}

export async function createCustomerTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createCustomerTaskSchema.safeParse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueAt: formData.get("dueAt"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!customer) {
    return { status: "error", message: "Kunden kunde inte hittas." };
  }

  const task = await context.prisma.task.create({
    data: {
      workspaceId: context.workspaceId,
      assignedToId: context.userId,
      customerId: customer.id,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      status: TaskStatus.TODO,
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ? new Date(`${parsed.data.dueAt}T09:00:00`) : null,
    },
  });

  await createNotification(context, {
    type: NotificationType.TASK,
    priority:
      parsed.data.priority === TaskPriority.URGENT || parsed.data.priority === TaskPriority.HIGH
        ? NotificationPriority.HIGH
        : NotificationPriority.MEDIUM,
    title: `Ny uppgift för ${customer.companyName}`,
    body: parsed.data.title.trim(),
    href: "/uppgifter",
    entityType: EntityType.TASK,
    entityId: customer.id,
  });

  await createActivityLog(context, {
    type: ActivityType.TASK_CREATED,
    title: `Aktivitet skapad för ${customer.companyName}`,
    detail: parsed.data.title.trim(),
    entityType: EntityType.TASK,
    entityId: task.id,
    customerId: customer.id,
    taskId: task.id,
  });

  await context.prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/kunder");
  revalidatePath(`/kunder/${customer.id}`);
  revalidatePath("/oversikt");
  revalidatePath("/uppgifter");

  return {
    status: "success",
    message: `Aktiviteten skapades för ${customer.companyName}.`,
  };
}

export async function updateTaskStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateTaskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const task = await context.prisma.task.findFirst({
    where: {
      id: parsed.data.taskId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      title: true,
      customerId: true,
    },
  });

  if (!task) {
    return { status: "error", message: "Uppgiften kunde inte hittas." };
  }

  await context.prisma.task.update({
    where: {
      id: task.id,
    },
    data: {
      status: parsed.data.status,
    },
  });

  await createNotification(context, {
    type: NotificationType.TASK,
    priority: NotificationPriority.LOW,
    title:
      parsed.data.status === "DONE"
        ? `Uppgift klar: ${task.title}`
        : `Uppgift uppdaterad: ${task.title}`,
    body:
      parsed.data.status === "DONE"
        ? "Uppgiften markerades som klar."
        : "Uppgiftens status ändrades.",
    href: "/uppgifter",
    entityType: EntityType.TASK,
    entityId: task.id,
  });

  await createActivityLog(context, {
    type: ActivityType.TASK_UPDATED,
    title:
      parsed.data.status === "DONE"
        ? `Uppgift klar: ${task.title}`
        : `Uppgift uppdaterad: ${task.title}`,
    detail:
      parsed.data.status === "DONE"
        ? "Uppgiften markerades som klar."
        : `Status ändrades till ${parsed.data.status}.`,
    entityType: EntityType.TASK,
    entityId: task.id,
    customerId: task.customerId ?? undefined,
    taskId: task.id,
  });

  revalidatePath("/uppgifter");
  revalidatePath("/oversikt");

  if (task.customerId) {
    revalidatePath(`/kunder/${task.customerId}`);
  }

  return {
    status: "success",
    message:
      parsed.data.status === "DONE"
        ? `Uppgiften "${task.title}" markerades som klar.`
        : `Uppgiften "${task.title}" uppdaterades.`,
  };
}

export async function createCustomerMessageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createCustomerMessageSchema.safeParse({
    customerId: formData.get("customerId"),
    channel: formData.get("channel"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!customer) {
    return { status: "error", message: "Kunden kunde inte hittas." };
  }

  const thread = await context.prisma.conversationThread.findFirst({
    where: {
      workspaceId: context.workspaceId,
      customerId: customer.id,
      channel: parsed.data.channel as ConversationChannel,
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    select: {
      id: true,
    },
  });

  const subject =
    parsed.data.subject?.trim() ||
    `Kontakt med ${customer.companyName}`;

  const threadId = thread?.id
    ? thread.id
    : (
        await context.prisma.conversationThread.create({
          data: {
            workspaceId: context.workspaceId,
            customerId: customer.id,
            channel: parsed.data.channel as ConversationChannel,
            subject,
            sentiment: "NEUTRAL",
            lastMessageAt: new Date(),
          },
          select: {
            id: true,
          },
        })
      ).id;

  await context.prisma.conversationThread.update({
    where: {
      id: threadId,
    },
    data: {
      subject,
      lastMessageAt: new Date(),
    },
  });

  await context.prisma.conversationMessage.create({
    data: {
      threadId,
      authorId: context.userId,
      direction: ConversationDirection.OUTBOUND,
      body: parsed.data.body.trim(),
    },
  });

  await createNotification(context, {
    type: NotificationType.CONVERSATION,
    priority: NotificationPriority.MEDIUM,
    title: `Meddelande skickat till ${customer.companyName}`,
    body: subject,
    href: "/konversationer",
    entityType: EntityType.CONVERSATION,
    entityId: threadId,
  });

  await createActivityLog(context, {
    type: ActivityType.MESSAGE_CREATED,
    title: `Meddelande skickat till ${customer.companyName}`,
    detail: subject,
    entityType: EntityType.CONVERSATION,
    entityId: threadId,
    customerId: customer.id,
    conversationId: threadId,
  });

  await context.prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/konversationer");
  revalidatePath(`/kunder/${customer.id}`);
  revalidatePath("/kunder");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Meddelandet sparades för ${customer.companyName}.`,
  };
}

export async function createInvoiceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createInvoiceSchema.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!customer) {
    return { status: "error", message: "Kunden kunde inte hittas." };
  }

  const invoiceCount = await context.prisma.invoice.count({
    where: {
      workspaceId: context.workspaceId,
    },
  });

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, "0")}`;

  const invoice = await context.prisma.invoice.create({
    data: {
      workspaceId: context.workspaceId,
      customerId: customer.id,
      invoiceNumber,
      amount: parsed.data.amount,
      status: parsed.data.status as InvoiceStatus,
      dueDate: new Date(`${parsed.data.dueDate}T12:00:00`),
      paidAt: parsed.data.status === "PAID" ? new Date() : null,
    },
  });

  await createNotification(context, {
    type: NotificationType.INVOICE,
    priority:
      parsed.data.status === "OVERDUE" ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Faktura ${invoiceNumber} skapad`,
    body: `${customer.companyName} · ${parsed.data.amount} kr`,
    href: "/fakturering",
    entityType: EntityType.INVOICE,
  });

  await createActivityLog(context, {
    type: ActivityType.INVOICE_CREATED,
    title: `Faktura ${invoiceNumber} skapad`,
    detail: `${customer.companyName} · ${parsed.data.amount} kr`,
    entityType: EntityType.INVOICE,
    entityId: invoice.id,
    customerId: customer.id,
    invoiceId: invoice.id,
  });

  await context.prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/fakturering");
  revalidatePath("/kunder");
  revalidatePath(`/kunder/${customer.id}`);
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Fakturan ${invoiceNumber} skapades för ${customer.companyName}.`,
  };
}

export async function createQuoteAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createQuoteSchema.safeParse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    amount: formData.get("amount"),
    validUntil: formData.get("validUntil"),
    status: formData.get("status"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const customer = await context.prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      companyName: true,
    },
  });

  if (!customer) {
    return { status: "error", message: "Kunden kunde inte hittas." };
  }

  const quoteCount = await context.prisma.quote.count({
    where: {
      workspaceId: context.workspaceId,
    },
  });

  const quoteNumber = `OFF-${new Date().getFullYear()}-${String(quoteCount + 1).padStart(3, "0")}`;
  const quoteStatus = parsed.data.status as QuoteStatus;
  const now = new Date();

  const quote = await context.prisma.quote.create({
    data: {
      workspaceId: context.workspaceId,
      customerId: customer.id,
      createdById: context.userId,
      quoteNumber,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      amount: parsed.data.amount,
      status: quoteStatus,
      validUntil: new Date(`${parsed.data.validUntil}T12:00:00`),
      sentAt:
        quoteStatus === QuoteStatus.SENT ||
        quoteStatus === QuoteStatus.VIEWED ||
        quoteStatus === QuoteStatus.APPROVED
          ? now
          : null,
      viewedAt:
        quoteStatus === QuoteStatus.VIEWED || quoteStatus === QuoteStatus.APPROVED ? now : null,
      approvedAt: quoteStatus === QuoteStatus.APPROVED ? now : null,
    },
  });

  await createNotification(context, {
    type: NotificationType.SYSTEM,
    priority:
      quoteStatus === QuoteStatus.APPROVED ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Offert ${quoteNumber} skapad`,
    body: `${customer.companyName} · ${parsed.data.title.trim()}`,
    href: "/offerter",
    entityType: EntityType.QUOTE,
    entityId: quote.id,
  });

  await createActivityLog(context, {
    type: ActivityType.QUOTE_CREATED,
    title: `Offert ${quoteNumber} skapad`,
    detail: `${customer.companyName} · ${parsed.data.title.trim()}`,
    entityType: EntityType.QUOTE,
    entityId: quote.id,
    customerId: customer.id,
  });

  await context.prisma.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/offerter");
  revalidatePath("/kunder");
  revalidatePath(`/kunder/${customer.id}`);
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Offerten ${quoteNumber} skapades för ${customer.companyName}.`,
  };
}

export async function updateQuoteStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateQuoteStatusSchema.safeParse({
    quoteId: formData.get("quoteId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const quote = await context.prisma.quote.findFirst({
    where: {
      id: parsed.data.quoteId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      quoteNumber: true,
      title: true,
      customerId: true,
      customer: {
        select: {
          companyName: true,
        },
      },
    },
  });

  if (!quote) {
    return { status: "error", message: "Offerten kunde inte hittas." };
  }

  const quoteStatus = parsed.data.status as QuoteStatus;
  const now = new Date();

  await context.prisma.quote.update({
    where: {
      id: quote.id,
    },
    data: {
      status: quoteStatus,
      sentAt:
        quoteStatus === QuoteStatus.SENT ||
        quoteStatus === QuoteStatus.VIEWED ||
        quoteStatus === QuoteStatus.APPROVED
          ? now
          : undefined,
      viewedAt:
        quoteStatus === QuoteStatus.VIEWED || quoteStatus === QuoteStatus.APPROVED ? now : undefined,
      approvedAt: quoteStatus === QuoteStatus.APPROVED ? now : null,
    },
  });

  await createNotification(context, {
    type: NotificationType.SYSTEM,
    priority:
      quoteStatus === QuoteStatus.APPROVED ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Offert ${quote.quoteNumber} uppdaterad`,
    body: `Status är nu ${parsed.data.status}.`,
    href: "/offerter",
    entityType: EntityType.QUOTE,
    entityId: quote.id,
  });

  await createActivityLog(context, {
    type: ActivityType.QUOTE_UPDATED,
    title: `Offert ${quote.quoteNumber} uppdaterad`,
    detail: `Status andrades till ${parsed.data.status}.`,
    entityType: EntityType.QUOTE,
    entityId: quote.id,
    customerId: quote.customerId,
  });

  await context.prisma.customer.update({
    where: {
      id: quote.customerId,
    },
    data: {
      lastActivityAt: new Date(),
    },
  });

  revalidatePath("/offerter");
  revalidatePath("/kunder");
  revalidatePath(`/kunder/${quote.customerId}`);
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Offerten ${quote.quoteNumber} för ${quote.customer.companyName} uppdaterades.`,
  };
}

export async function createAutomationFlowAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = createAutomationFlowSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    triggerType: formData.get("triggerType"),
    actionType: formData.get("actionType"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const automation = await context.prisma.automationFlow.create({
    data: {
      workspaceId: context.workspaceId,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      triggerType: parsed.data.triggerType.trim(),
      actionType: parsed.data.actionType.trim(),
      status: parsed.data.status as AutomationStatus,
    },
  });

  await createNotification(context, {
    type: NotificationType.AUTOMATION,
    priority:
      parsed.data.status === "ACTIVE" ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
    title: `Automation skapad: ${parsed.data.name.trim()}`,
    body: `${parsed.data.triggerType.trim()} -> ${parsed.data.actionType.trim()}`,
    href: "/automationer",
    entityType: EntityType.AUTOMATION,
  });

  await createActivityLog(context, {
    type: ActivityType.AUTOMATION_CREATED,
    title: `Automation skapad: ${parsed.data.name.trim()}`,
    detail: `${parsed.data.triggerType.trim()} -> ${parsed.data.actionType.trim()}`,
    entityType: EntityType.AUTOMATION,
    entityId: automation.id,
  });

  revalidatePath("/automationer");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Automationen "${parsed.data.name.trim()}" skapades.`,
  };
}

export async function updateAutomationStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = updateAutomationStatusSchema.safeParse({
    automationId: formData.get("automationId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const automation = await context.prisma.automationFlow.findFirst({
    where: {
      id: parsed.data.automationId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!automation) {
    return { status: "error", message: "Automationen kunde inte hittas." };
  }

  await context.prisma.automationFlow.update({
    where: {
      id: automation.id,
    },
    data: {
      status: parsed.data.status as AutomationStatus,
    },
  });

  await createNotification(context, {
    type: NotificationType.AUTOMATION,
    priority: NotificationPriority.MEDIUM,
    title: `Automation uppdaterad: ${automation.name}`,
    body: `Status är nu ${parsed.data.status}.`,
    href: "/automationer",
    entityType: EntityType.AUTOMATION,
    entityId: automation.id,
  });

  await createActivityLog(context, {
    type: ActivityType.AUTOMATION_UPDATED,
    title: `Automation uppdaterad: ${automation.name}`,
    detail: `Status ändrades till ${parsed.data.status}.`,
    entityType: EntityType.AUTOMATION,
    entityId: automation.id,
  });

  revalidatePath("/automationer");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Automationen "${automation.name}" uppdaterades.`,
  };
}

export async function runAIAssistantAction(
  _prevState: AIAssistantActionState,
  formData: FormData,
): Promise<AIAssistantActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = runAIAssistantSchema.safeParse({
    prompt: formData.get("prompt"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return {
      status: "error",
      message: "OPENAI_API_KEY saknas. Lägg till den i miljövariablerna för att köra riktig AI.",
      prompt: parsed.data.prompt,
    };
  }

  const [
    workspace,
    leads,
    customers,
    tasks,
    bookings,
    threads,
    invoices,
    automations,
  ] = await Promise.all([
    context.prisma.workspace.findUnique({
      where: { id: context.workspaceId },
      select: { name: true, plan: true, industry: true, companySize: true },
    }),
    context.prisma.lead.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 6,
      select: {
        companyName: true,
        status: true,
        score: true,
        probability: true,
        estimatedValue: true,
        nextAction: true,
      },
    }),
    context.prisma.customer.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      take: 6,
      select: {
        companyName: true,
        score: true,
        health: true,
        revenueGenerated: true,
        notes: true,
      },
    }),
    context.prisma.task.findMany({
      where: {
        workspaceId: context.workspaceId,
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] },
      },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        title: true,
        priority: true,
        status: true,
        dueAt: true,
        customer: {
          select: { companyName: true },
        },
      },
    }),
    context.prisma.booking.findMany({
      where: {
        workspaceId: context.workspaceId,
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 6,
      select: {
        title: true,
        status: true,
        startsAt: true,
        customer: {
          select: { companyName: true },
        },
      },
    }),
    context.prisma.conversationThread.findMany({
      where: { workspaceId: context.workspaceId },
      include: {
        customer: { select: { companyName: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 5,
    }),
    context.prisma.invoice.findMany({
      where: { workspaceId: context.workspaceId },
      include: {
        customer: { select: { companyName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    context.prisma.automationFlow.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        name: true,
        triggerType: true,
        actionType: true,
        status: true,
      },
    }),
  ]);

  const workspaceContext = {
    workspace: {
      name: workspace?.name ?? "Okänd arbetsyta",
      plan: workspace?.plan ?? null,
      industry: workspace?.industry ?? null,
      companySize: workspace?.companySize ?? null,
    },
    metrics: {
      leads: leads.length,
      customers: customers.length,
      openTasks: tasks.length,
      upcomingBookings: bookings.length,
      recentConversations: threads.length,
      recentInvoices: invoices.length,
      activeAutomations: automations.filter(
        (automation) => automation.status === AutomationStatus.ACTIVE,
      ).length,
    },
    leads: leads.map((lead) => ({
      companyName: lead.companyName,
      status: lead.status,
      score: lead.score,
      probability: lead.probability,
      estimatedValue: lead.estimatedValue.toString(),
      nextAction: lead.nextAction,
    })),
    customers: customers.map((customer) => ({
      companyName: customer.companyName,
      score: customer.score,
      health: customer.health,
      revenueGenerated: customer.revenueGenerated.toString(),
      notes: customer.notes,
    })),
    tasks: tasks.map((task) => ({
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueAt: task.dueAt?.toISOString() ?? null,
      customer: task.customer?.companyName ?? null,
    })),
    bookings: bookings.map((booking) => ({
      title: booking.title,
      status: booking.status,
      startsAt: booking.startsAt.toISOString(),
      customer: booking.customer?.companyName ?? null,
    })),
    conversations: threads.map((thread) => ({
      customer: thread.customer?.companyName ?? null,
      channel: thread.channel,
      latestMessage: thread.messages[0]?.body ?? null,
      lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
    })),
    invoices: invoices.map((invoice) => ({
      invoiceNumber: invoice.invoiceNumber,
      customer: invoice.customer?.companyName ?? null,
      amount: invoice.amount.toString(),
      status: invoice.status,
      dueDate: invoice.dueDate?.toISOString() ?? null,
    })),
    automations: automations,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Du ar en svensk AI-assistent i ett Business OS. Svara alltid pa svenska, anvand verklig affarskontext fran arbetsytan och hall svaret konkret, operativt och anvandbart. Om du rekommenderar atgarder, ge 3-5 tydliga nasta steg.",
        },
        {
          role: "user",
          content: `Arbetsytekontext:\n${JSON.stringify(
            workspaceContext,
            null,
            2,
          )}\n\nFraga:\n${parsed.data.prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return {
      status: "error",
      message: `OpenAI-anropet misslyckades: ${response.status} ${errorText.slice(0, 200)}`,
      prompt: parsed.data.prompt,
    };
  }

  const payload = (await response.json()) as unknown;
  const assistantText = getAssistantText(payload);

  if (!assistantText) {
    return {
      status: "error",
      message: "AI-svaret kunde inte tolkas.",
      prompt: parsed.data.prompt,
    };
  }

  const insight = await context.prisma.aIInsight.create({
    data: {
      workspaceId: context.workspaceId,
      createdById: context.userId,
      entityType: EntityType.WORKSPACE,
      type: inferAIInsightType(parsed.data.prompt),
      title: parsed.data.prompt.trim().slice(0, 120),
      content: assistantText,
      confidence: 84,
    },
  });

  await createNotification(context, {
    type: NotificationType.AI,
    priority: NotificationPriority.MEDIUM,
    title: "AI-svar klart",
    body: parsed.data.prompt.trim().slice(0, 120),
    href: "/ai-assistent",
    entityType: EntityType.WORKSPACE,
  });

  await createActivityLog(context, {
    type: ActivityType.AI_INSIGHT_CREATED,
    title: "AI-insikt skapad",
    detail: assistantText.slice(0, 220),
    entityType: EntityType.WORKSPACE,
    entityId: context.workspaceId,
  });

  revalidatePath("/ai-assistent");
  revalidatePath("/ai-assistant");
  revalidatePath("/oversikt");
  revalidatePath("/statistik");

  return {
    status: "success",
    message: "AI-svaret skapades och sparades i arbetsytan.",
    prompt: parsed.data.prompt,
    response: assistantText,
    model,
  };
}

export async function createTaskFromAIInsightAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = materializeAIInsightSchema.safeParse({
    insightId: formData.get("insightId"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const insight = await context.prisma.aIInsight.findFirst({
    where: {
      id: parsed.data.insightId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      customerId: true,
      leadId: true,
    },
  });

  if (!insight) {
    return { status: "error", message: "AI-insikten kunde inte hittas." };
  }

  const task = await context.prisma.task.create({
    data: {
      workspaceId: context.workspaceId,
      assignedToId: context.userId,
      title: `AI-åtgärd: ${insight.title}`.slice(0, 160),
      description: insight.content.slice(0, 2000),
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    },
  });

  await createNotification(context, {
    type: NotificationType.TASK,
    priority: NotificationPriority.HIGH,
    title: "AI-insikt blev uppgift",
    body: insight.title,
    href: "/uppgifter",
    entityType: EntityType.TASK,
  });

  await createActivityLog(context, {
    type: ActivityType.TASK_CREATED,
    title: "AI-insikt blev uppgift",
    detail: insight.title,
    entityType: EntityType.TASK,
    entityId: task.id,
    customerId: insight.customerId ?? undefined,
    leadId: insight.leadId ?? undefined,
    taskId: task.id,
  });

  revalidatePath("/ai-assistent");
  revalidatePath("/ai-assistant");
  revalidatePath("/uppgifter");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: "AI-insikten omvandlades till en riktig uppgift.",
  };
}

export async function updateTeamMemberRoleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  if (!canManageTeam(context.role)) {
    return { status: "error", message: "Du saknar behörighet att ändra roller." };
  }

  const parsed = updateTeamMemberRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  if (parsed.data.memberId === context.userId) {
    return { status: "error", message: "Du kan inte ändra din egen roll här." };
  }

  const member = await context.prisma.user.findFirst({
    where: {
      id: parsed.data.memberId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      memberships: {
        where: { workspaceId: context.workspaceId },
        take: 1,
        select: { role: true },
      },
    },
  });

  if (!member?.memberships[0]) {
    return { status: "error", message: "Teammedlemmen kunde inte hittas." };
  }

  if (member.memberships[0].role === WorkspaceRole.OWNER && context.role !== WorkspaceRole.OWNER) {
    return { status: "error", message: "Bara owner kan ändra en annan owner." };
  }

  if (parsed.data.role === WorkspaceRole.OWNER && context.role !== WorkspaceRole.OWNER) {
    return { status: "error", message: "Bara owner kan tilldela owner-roll." };
  }

  await context.prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId: context.workspaceId,
        userId: member.id,
      },
    },
    data: {
      role: parsed.data.role,
    },
  });

  await createNotification(context, {
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.MEDIUM,
    title: "Roll uppdaterad",
    body: `${member.firstName} ${member.lastName}`.trim() || "Teammedlem",
    href: "/team",
    entityType: EntityType.USER,
    entityId: member.id,
    userId: member.id,
  });

  revalidatePath("/team");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `Rollen uppdaterades för ${(member.firstName + " " + member.lastName).trim()}.`,
  };
}

export async function updateTeamMemberActiveAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  if (!canManageTeam(context.role)) {
    return { status: "error", message: "Du saknar behörighet att ändra teamstatus." };
  }

  const parsed = updateTeamMemberActiveSchema.safeParse({
    memberId: formData.get("memberId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const nextActiveState = parsed.data.isActive === "true";

  if (parsed.data.memberId === context.userId && !nextActiveState) {
    return { status: "error", message: "Du kan inte inaktivera dig själv här." };
  }

  const member = await context.prisma.user.findFirst({
    where: {
      id: parsed.data.memberId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  if (!member) {
    return { status: "error", message: "Teammedlemmen kunde inte hittas." };
  }

  await context.prisma.user.update({
    where: {
      id: member.id,
    },
    data: {
      isActive: nextActiveState,
      lastSeenAt: nextActiveState ? new Date() : member.isActive ? new Date() : undefined,
    },
  });

  await createNotification(context, {
    type: NotificationType.SYSTEM,
    priority: nextActiveState ? NotificationPriority.LOW : NotificationPriority.HIGH,
    title: nextActiveState ? "Teammedlem aktiverad" : "Teammedlem inaktiverad",
    body: `${member.firstName} ${member.lastName}`.trim() || "Teammedlem",
    href: "/team",
    entityType: EntityType.USER,
    entityId: member.id,
    userId: member.id,
  });

  revalidatePath("/team");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: nextActiveState
      ? `${(member.firstName + " " + member.lastName).trim()} är nu aktiv igen.`
      : `${(member.firstName + " " + member.lastName).trim()} markerades som inaktiv.`,
  };
}

export async function createAutomationFromAIInsightAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await getActionContext();

  if (!context) {
    return { status: "error", message: "Du måste vara inloggad." };
  }

  const parsed = materializeAIInsightSchema.safeParse({
    insightId: formData.get("insightId"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const insight = await context.prisma.aIInsight.findFirst({
    where: {
      id: parsed.data.insightId,
      workspaceId: context.workspaceId,
    },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      automationId: true,
      customerId: true,
      leadId: true,
    },
  });

  if (!insight) {
    return { status: "error", message: "AI-insikten kunde inte hittas." };
  }

  if (insight.automationId) {
    return { status: "success", message: "Den här AI-insikten är redan kopplad till en automation." };
  }

  const automationCount = await context.prisma.automationFlow.count({
    where: {
      workspaceId: context.workspaceId,
    },
  });

  const automation = await context.prisma.automationFlow.create({
    data: {
      workspaceId: context.workspaceId,
      name: `${insight.title.trim().slice(0, 90)} #${automationCount + 1}`,
      description: insight.content.slice(0, 2000),
      triggerType: "AI-insikt",
      actionType: getAutomationActionLabel(insight.type),
      status: AutomationStatus.DRAFT,
    },
    select: {
      id: true,
      name: true,
    },
  });

  await context.prisma.aIInsight.update({
    where: {
      id: insight.id,
    },
    data: {
      automationId: automation.id,
    },
  });

  await createNotification(context, {
    type: NotificationType.AUTOMATION,
    priority: NotificationPriority.MEDIUM,
    title: "AI-insikt blev automation",
    body: automation.name,
    href: "/automationer",
    entityType: EntityType.AUTOMATION,
    entityId: automation.id,
  });

  await createActivityLog(context, {
    type: ActivityType.AUTOMATION_CREATED,
    title: "AI-insikt blev automation",
    detail: automation.name,
    entityType: EntityType.AUTOMATION,
    entityId: automation.id,
    customerId: insight.customerId ?? undefined,
    leadId: insight.leadId ?? undefined,
  });

  revalidatePath("/ai-assistent");
  revalidatePath("/ai-assistant");
  revalidatePath("/automationer");
  revalidatePath("/oversikt");

  return {
    status: "success",
    message: `AI-insikten omvandlades till automationen "${automation.name}".`,
  };
}
