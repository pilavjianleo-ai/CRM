"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { WorkspaceRole } from "@prisma/client";

import { signIn, signOut } from "@/auth";
import {
  initialActionState,
  type ActionState,
} from "@/lib/actions/action-state";
import { getPrisma } from "@/lib/prisma";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";

function isCredentialsError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const authError = error as Error & { type?: string };

  return (
    authError.type === "CredentialsSignin" ||
    authError.message.includes("CredentialsSignin")
  );
}

function createWorkspaceSlug(company: string) {
  const normalized = company
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `${normalized || "arbetsyta"}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Kunde inte läsa inloggningen.",
    };
  }

  const callbackUrl =
    typeof formData.get("callbackUrl") === "string" &&
    formData.get("callbackUrl") !== ""
      ? String(formData.get("callbackUrl"))
      : "/oversikt";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isCredentialsError(error)) {
      return {
        status: "error",
        message: "Fel e-post eller lösenord.",
      };
    }

    throw error;
  }

  return initialActionState;
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Kunde inte skapa konto.",
    };
  }

  const prisma = getPrisma();

  if (!prisma) {
    return {
      status: "error",
      message: "Databasen är inte konfigurerad ännu.",
    };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: parsed.data.email,
    },
  });

  if (existingUser) {
    return {
      status: "error",
      message: "Det finns redan ett konto med den e-postadressen.",
    };
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.company,
      slug: createWorkspaceSlug(parsed.data.company),
      industry: "Tjänsteföretag",
      users: {
        create: {
          email: parsed.data.email,
          passwordHash,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          title: "Ägare",
        },
      },
    },
    include: {
      users: true,
    },
  });

  const user = workspace.users[0];

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/onboarding",
  });

  return initialActionState;
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Kunde inte behandla förfrågan.",
    };
  }

  const prisma = getPrisma();

  if (prisma) {
    await prisma.user.findFirst({
      where: { email: parsed.data.email },
    });
  }

  return {
    status: "success",
    message:
      "Om adressen finns i systemet skickar vi en återställningslänk när e-postflödet är aktiverat.",
  };
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
  redirect("/");
}
