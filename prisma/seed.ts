import {
  AIInsightType,
  AutomationStatus,
  BookingStatus,
  ConversationChannel,
  ConversationDirection,
  ConversationSentiment,
  CustomerHealth,
  EntityType,
  InvoiceStatus,
  LeadStatus,
  LeadTemperature,
  PrismaClient,
  TaskPriority,
  TaskStatus,
  WorkspacePlan,
  WorkspaceRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demoPasswordHash = await hash("Demo123!", 12);
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: "relations-demo" },
  });

  if (existingWorkspace) {
    await prisma.workspace.delete({
      where: { id: existingWorkspace.id },
    });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: "Relations Demo",
      slug: "relations-demo",
      plan: WorkspacePlan.GROWTH,
      industry: "Tjänsteföretag",
      companySize: 12,
      primaryColor: "#22d3ee",
      users: {
        create: [
          {
            email: "philip@relationssystem.se",
            passwordHash: demoPasswordHash,
            firstName: "Philip",
            lastName: "Pilav",
            title: "Grundare",
          },
          {
            email: "emma@relationssystem.se",
            passwordHash: demoPasswordHash,
            firstName: "Emma",
            lastName: "Lund",
            title: "Servicechef",
          },
          {
            email: "sara@relationssystem.se",
            passwordHash: demoPasswordHash,
            firstName: "Sara",
            lastName: "Holm",
            title: "Kundansvarig",
          },
        ],
      },
    },
    include: {
      users: true,
    },
  });

  const userMap = Object.fromEntries(
    workspace.users.map((user) => [user.email, user]),
  );
  const owner = userMap["philip@relationssystem.se"];
  const emma = userMap["emma@relationssystem.se"];
  const sara = userMap["sara@relationssystem.se"];

  await prisma.workspaceMember.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: owner.id,
        role: WorkspaceRole.OWNER,
      },
      {
        workspaceId: workspace.id,
        userId: emma.id,
        role: WorkspaceRole.ADMIN,
      },
      {
        workspaceId: workspace.id,
        userId: sara.id,
        role: WorkspaceRole.MEMBER,
      },
    ],
  });

  const [nordicFix, atelierHem, solhem] = await Promise.all([
    prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        ownerId: sara.id,
        companyName: "Nordic Fix AB",
        contactName: "Daniel Nystrom",
        email: "daniel@nordicfix.se",
        phone: "+46 70 100 10 10",
        score: 92,
        health: CustomerHealth.HEALTHY,
        revenueGenerated: 88000,
        lastActivityAt: new Date(),
      },
    }),
    prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        ownerId: sara.id,
        companyName: "Ateljé Hem",
        contactName: "Elin Berg",
        email: "elin@ateljehem.se",
        phone: "+46 70 300 30 30",
        score: 81,
        health: CustomerHealth.WATCH,
        revenueGenerated: 46000,
        lastActivityAt: new Date(),
      },
    }),
    prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        ownerId: owner.id,
        companyName: "Solhem Services",
        contactName: "Johan West",
        email: "johan@solhem.se",
        phone: "+46 70 400 40 40",
        score: 97,
        health: CustomerHealth.UPSELL,
        revenueGenerated: 124000,
        lastActivityAt: new Date(),
      },
    }),
  ]);

  const bergLead = await prisma.lead.create({
    data: {
      workspaceId: workspace.id,
      ownerId: owner.id,
      companyName: "Berg & Co",
      contactName: "Lina Berg",
      email: "lina@bergco.se",
      status: LeadStatus.PROPOSAL,
      temperature: LeadTemperature.HOT,
      score: 93,
      estimatedValue: 88000,
      probability: 87,
      nextAction: "Ring före lunch",
      lastContactAt: new Date(),
    },
  });

  await Promise.all([
    prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        ownerId: emma.id,
        companyName: "North Studio",
        contactName: "Maja Lind",
        email: "maja@northstudio.se",
        status: LeadStatus.NEW,
        temperature: LeadTemperature.HOT,
        score: 74,
        estimatedValue: 42000,
        probability: 44,
        nextAction: "Skicka offertutkast",
      },
    }),
    prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        ownerId: sara.id,
        companyName: "Luma Group",
        contactName: "Oskar Larsson",
        email: "oskar@lumagroup.se",
        status: LeadStatus.PROPOSAL,
        temperature: LeadTemperature.WARM,
        score: 66,
        estimatedValue: 47000,
        probability: 53,
        nextAction: "Hantera prisinvändning",
      },
    }),
  ]);

  const [bookingOne, bookingTwo] = await Promise.all([
    prisma.booking.create({
      data: {
        workspaceId: workspace.id,
        customerId: nordicFix.id,
        assignedToId: emma.id,
        title: "Servicebesök Nordic Fix AB",
        status: BookingStatus.CONFIRMED,
        startsAt: new Date("2026-05-12T09:30:00.000Z"),
        endsAt: new Date("2026-05-12T11:00:00.000Z"),
        location: "Stockholm",
        notes: "Skicka påminnelse 60 minuter innan.",
      },
    }),
    prisma.booking.create({
      data: {
        workspaceId: workspace.id,
        customerId: atelierHem.id,
        assignedToId: owner.id,
        title: "Ombokning Ateljé Hem",
        status: BookingStatus.NEEDS_REMINDER,
        startsAt: new Date("2026-05-12T12:15:00.000Z"),
        endsAt: new Date("2026-05-12T13:30:00.000Z"),
        location: "Uppsala",
        notes: "Skicka personlig påminnelse via sms.",
      },
    }),
  ]);

  await prisma.task.createMany({
    data: [
      {
        workspaceId: workspace.id,
        assignedToId: owner.id,
        leadId: bergLead.id,
        title: "Följ upp Berg & Co",
        description: "Ring medan intent fortfarande är hög.",
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueAt: new Date("2026-05-12T11:00:00.000Z"),
      },
      {
        workspaceId: workspace.id,
        assignedToId: emma.id,
        bookingId: bookingOne.id,
        customerId: nordicFix.id,
        title: "Bekräfta bokning för Nordic Fix AB",
        description: "Skicka kort bekräftelse innan besöket.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueAt: new Date("2026-05-12T08:30:00.000Z"),
      },
      {
        workspaceId: workspace.id,
        assignedToId: sara.id,
        customerId: atelierHem.id,
        title: "Granska churn-signal för Ateljé Hem",
        description: "Personlig uppföljning rekommenderas.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
      },
    ],
  });

  const conversation = await prisma.conversationThread.create({
    data: {
      workspaceId: workspace.id,
      customerId: nordicFix.id,
      channel: ConversationChannel.EMAIL,
      subject: "Nästa steg efter offert",
      sentiment: ConversationSentiment.POSITIVE,
      lastMessageAt: new Date(),
      messages: {
        create: [
          {
            authorId: owner.id,
            direction: ConversationDirection.OUTBOUND,
            body: "Hej! Här kommer nästa steg efter offerten och förslag på tid.",
          },
          {
            direction: ConversationDirection.INBOUND,
            body: "Tack, det ser bra ut. Kan vi ta en avstämning i morgon?",
          },
        ],
      },
    },
  });

  const automation = await prisma.automationFlow.create({
    data: {
      workspaceId: workspace.id,
      name: "Nytt lead -> uppföljning",
      description: "Skickar första uppföljningen och skapar uppgift för ansvarig.",
      triggerType: "new_lead",
      actionType: "email_and_task",
      status: AutomationStatus.ACTIVE,
    },
  });

  const [, invoiceTwo] = await Promise.all([
    prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        customerId: solhem.id,
        invoiceNumber: "INV-2026-051",
        amount: 1490,
        status: InvoiceStatus.PAID,
        dueDate: new Date("2026-05-27T00:00:00.000Z"),
        paidAt: new Date("2026-05-01T00:00:00.000Z"),
      },
    }),
    prisma.invoice.create({
      data: {
        workspaceId: workspace.id,
        customerId: nordicFix.id,
        invoiceNumber: "INV-2026-052",
        amount: 42500,
        status: InvoiceStatus.SENT,
        dueDate: new Date("2026-05-30T00:00:00.000Z"),
      },
    }),
  ]);

  await prisma.aIInsight.createMany({
    data: [
      {
        workspaceId: workspace.id,
        customerId: atelierHem.id,
        createdById: sara.id,
        entityType: EntityType.CUSTOMER,
        type: AIInsightType.RISK,
        title: "Tidiga churn-signaler",
        content: "Svarstiden har blivit långsammare och tonen i dialogen är svalare.",
        confidence: 83,
      },
      {
        workspaceId: workspace.id,
        leadId: bergLead.id,
        createdById: owner.id,
        entityType: EntityType.LEAD,
        type: AIInsightType.NEXT_ACTION,
        title: "Ring före lunch",
        content: "Leadet har hög intent och bästa nästa steg är ett samtal i dag.",
        confidence: 91,
      },
      {
        workspaceId: workspace.id,
        bookingId: bookingTwo.id,
        createdById: emma.id,
        entityType: EntityType.BOOKING,
        type: AIInsightType.SUMMARY,
        title: "Bokning behöver påminnelse",
        content: "Personlig sms-påminnelse rekommenderas för att minska risken för ombokning.",
        confidence: 88,
      },
      {
        workspaceId: workspace.id,
        invoiceId: invoiceTwo.id,
        createdById: owner.id,
        entityType: EntityType.INVOICE,
        type: AIInsightType.ANALYTICS,
        title: "Högvärdesfaktura öppen",
        content: "Den öppna fakturan bör följas upp innan nästa servicebesök bokas.",
        confidence: 80,
      },
      {
        workspaceId: workspace.id,
        conversationId: conversation.id,
        createdById: owner.id,
        entityType: EntityType.CONVERSATION,
        type: AIInsightType.SUMMARY,
        title: "Positiv offertdialog",
        content: "Kunden är redo för nästa steg och vill boka en avstämning inom kort.",
        confidence: 94,
      },
      {
        workspaceId: workspace.id,
        automationId: automation.id,
        createdById: sara.id,
        entityType: EntityType.AUTOMATION,
        type: AIInsightType.AUTOMATION,
        title: "Automation sparar tid",
        content: "Flödet för nya leads minskar responstid och håller ansvarig säljare i rörelse.",
        confidence: 89,
      },
    ],
  });

  console.log(`Seed klar för arbetsyta: ${workspace.name}`);
  console.log("Demo-inloggning: philip@relationssystem.se / Demo123!");
}

main()
  .catch((error) => {
    console.error("Seed misslyckades:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
