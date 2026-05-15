import { z } from "zod";

export const publicLeadSchema = z.object({
  name: z.string().min(2, "Skriv ett namn."),
  company: z.string().min(2, "Skriv företagsnamn."),
  email: z.email("Skriv en giltig e-postadress."),
  phone: z.string().min(6, "Skriv ett telefonnummer."),
  message: z.string().max(1000, "Meddelandet är för långt.").optional(),
  source: z.string().optional(),
});

export const publicBookingSchema = z.object({
  name: z.string().min(2, "Skriv ett namn."),
  company: z.string().min(2, "Skriv företagsnamn."),
  email: z.email("Skriv en giltig e-postadress."),
  phone: z.string().min(6, "Skriv ett telefonnummer."),
  service: z.string().min(2, "Välj tjänst."),
  address: z.string().min(4, "Skriv adress."),
  date: z.string().min(4, "Välj datum."),
  time: z.string().min(2, "Välj tid."),
  notes: z.string().max(1000, "Anteckningen är för lång.").optional(),
  source: z.string().optional(),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
