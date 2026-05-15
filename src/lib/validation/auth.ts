import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Skriv en giltig e-postadress."),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Skriv förnamn."),
  lastName: z.string().min(2, "Skriv efternamn."),
  company: z.string().min(2, "Skriv företagsnamn."),
  email: z.email("Skriv en giltig e-postadress."),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Skriv en giltig e-postadress."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
