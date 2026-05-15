import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/auth-forms";

export default function Page() {
  return (
    <AuthShell
      title="Glömt lösenord"
      description="Skriv din e-post så skickar vi en säker länk för att återställa lösenordet."
      footer={
        <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">
          Tillbaka till inloggning
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
