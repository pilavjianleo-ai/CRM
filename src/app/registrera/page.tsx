import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/oversikt");
  }

  return (
    <AuthShell
      title="Skapa konto"
      description="Kom igång snabbt med ett lugnt, modernt företagssystem byggt för dagligt arbete."
      footer={
        <>
          Har du redan konto?{" "}
          <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">
            Logga in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
