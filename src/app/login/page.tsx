import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { auth } from "@/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();

  if (session) {
    redirect("/oversikt");
  }

  const params = await searchParams;

  return (
    <AuthShell
      title="Logga in"
      description="Fortsätt där teamet slutade och få direkt koll på kunder, uppgifter, bokningar och AI-insikter."
      footer={
        <>
          Ingen användare än?{" "}
          <Link href="/registrera" className="text-cyan-300 transition hover:text-cyan-200">
            Skapa konto
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-300">Logga in med dina riktiga uppgifter eller demo-kontot.</p>
          <Link href="/glomt-losenord" className="text-sm text-cyan-300 transition hover:text-cyan-200">
            Glömt lösenord?
          </Link>
        </div>
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </AuthShell>
  );
}
