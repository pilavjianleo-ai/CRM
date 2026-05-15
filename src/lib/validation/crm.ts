import { z } from "zod";

const leadStageSchema = z.enum([
  "NEW",
  "QUALIFIED",
  "PROPOSAL",
  "WON",
  "LOST",
]);

export const createCustomerSchema = z.object({
  companyName: z.string().min(2, "Skriv företagsnamn."),
  contactName: z.string().min(2, "Skriv kontaktperson."),
  email: z.email("Skriv en giltig e-postadress.").optional().or(z.literal("")),
  phone: z.string().min(6, "Skriv ett telefonnummer.").optional().or(z.literal("")),
});

export const createLeadSchema = z.object({
  companyName: z.string().min(2, "Skriv företagsnamn."),
  contactName: z.string().min(2, "Skriv kontaktperson."),
  email: z.email("Skriv en giltig e-postadress.").optional().or(z.literal("")),
  phone: z.string().min(6, "Skriv ett telefonnummer.").optional().or(z.literal("")),
  estimatedValue: z.coerce.number().min(0, "Värdet måste vara 0 eller mer."),
});

export const updateLeadSchema = z.object({
  leadId: z.string().min(1, "Lead saknas."),
  companyName: z.string().min(2, "Skriv företagsnamn."),
  contactName: z.string().min(2, "Skriv kontaktperson."),
  email: z.email("Skriv en giltig e-postadress.").optional().or(z.literal("")),
  phone: z.string().min(6, "Skriv ett telefonnummer.").optional().or(z.literal("")),
  estimatedValue: z.coerce.number().min(0, "Värdet måste vara 0 eller mer."),
  probability: z.coerce.number().min(0, "Sannolikheten måste vara 0 eller mer.").max(100, "Sannolikheten får vara max 100."),
  temperature: z.enum(["COLD", "WARM", "HOT"]),
  source: z.string().max(200, "Källan får vara max 200 tecken.").optional().or(z.literal("")),
  nextAction: z.string().min(2, "Skriv nästa steg.").max(500, "Nästa steg får vara max 500 tecken."),
  ownerId: z.string().optional().or(z.literal("")),
});

export const createBookingSchema = z.object({
  companyName: z.string().min(2, "Skriv företagsnamn."),
  service: z.string().min(2, "Skriv tjänst."),
  date: z.string().min(4, "Välj datum."),
  time: z.string().min(2, "Välj tid."),
  location: z.string().min(4, "Skriv plats eller adress."),
});

export const updateLeadStageSchema = z.object({
  leadId: z.string().min(1, "Lead saknas."),
  stage: leadStageSchema,
});

export const updateCustomerNotesSchema = z.object({
  customerId: z.string().min(1, "Kund saknas."),
  notes: z
    .string()
    .max(5000, "Anteckningarna får vara max 5000 tecken.")
    .transform((value) => value.trim()),
});

export const createCustomerTaskSchema = z.object({
  customerId: z.string().min(1, "Kund saknas."),
  title: z.string().min(2, "Skriv vad som ska goras.").max(160, "Titeln ar for lang."),
  description: z
    .string()
    .max(2000, "Beskrivningen far vara max 2000 tecken.")
    .optional()
    .or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueAt: z.string().optional().or(z.literal("")),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1, "Uppgift saknas."),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "ARCHIVED"]),
});

export const createCustomerMessageSchema = z.object({
  customerId: z.string().min(1, "Kund saknas."),
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP", "MESSENGER", "INSTAGRAM", "PHONE"]),
  subject: z.string().max(160, "Amnesraden ar for lang.").optional().or(z.literal("")),
  body: z.string().min(2, "Skriv ett meddelande.").max(5000, "Meddelandet ar for langt."),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Kund saknas."),
  amount: z.coerce.number().positive("Beloppet maste vara storre an 0."),
  dueDate: z.string().min(4, "Valj forfallodatum."),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "VOID"]),
});

export const createQuoteSchema = z.object({
  customerId: z.string().min(1, "Kund saknas."),
  title: z.string().min(2, "Skriv ett offertnamn.").max(160, "Titeln ar for lang."),
  amount: z.coerce.number().positive("Beloppet maste vara storre an 0."),
  validUntil: z.string().min(4, "Valj giltigt till-datum."),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "APPROVED", "REJECTED", "EXPIRED"]),
  description: z
    .string()
    .max(3000, "Beskrivningen far vara max 3000 tecken.")
    .optional()
    .or(z.literal("")),
});

export const updateQuoteStatusSchema = z.object({
  quoteId: z.string().min(1, "Offert saknas."),
  status: z.enum(["DRAFT", "SENT", "VIEWED", "APPROVED", "REJECTED", "EXPIRED"]),
});

export const createAutomationFlowSchema = z.object({
  name: z.string().min(2, "Skriv namn pa automationen.").max(120, "Namnet ar for langt."),
  description: z
    .string()
    .max(2000, "Beskrivningen far vara max 2000 tecken.")
    .optional()
    .or(z.literal("")),
  triggerType: z.string().min(2, "Skriv trigger."),
  actionType: z.string().min(2, "Skriv atgard."),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]),
});

export const updateAutomationStatusSchema = z.object({
  automationId: z.string().min(1, "Automation saknas."),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]),
});

export const runAIAssistantSchema = z.object({
  prompt: z.string().min(4, "Skriv vad AI ska hjaalpa dig med.").max(4000, "Prompten ar for lang."),
});

export const materializeAIInsightSchema = z.object({
  insightId: z.string().min(1, "AI-insikten saknas."),
});

export const updateTeamMemberRoleSchema = z.object({
  memberId: z.string().min(1, "Teammedlem saknas."),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export const updateTeamMemberActiveSchema = z.object({
  memberId: z.string().min(1, "Teammedlem saknas."),
  isActive: z.enum(["true", "false"]),
});
