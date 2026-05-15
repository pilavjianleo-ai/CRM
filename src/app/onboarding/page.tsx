import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function Page() {
  return (
    <AuthShell
      title="Kom igång snabbt"
      description="Några enkla steg för att göra systemet relevant direkt för ditt företag."
      footer={
        <Link href="/oversikt" className="text-cyan-300 transition hover:text-cyan-200">
          Hoppa till översikten
        </Link>
      }
    >
      <div className="space-y-4">
        {[
          "1. Välj företagstyp och arbetsflöde",
          "2. Importera kunder eller leads",
          "3. Koppla kalender och e-post",
          "4. Aktivera första AI-flödet",
        ].map((step) => (
          <div
            key={step}
            className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm leading-6 text-slate-300"
          >
            {step}
          </div>
        ))}

        <button className="w-full rounded-2xl bg-cyan-400/15 px-4 py-3 text-sm font-medium text-white shadow-[0_0_40px_rgba(34,211,238,0.18)] transition hover:bg-cyan-400/20">
          Fortsätt
        </button>
      </div>
    </AuthShell>
  );
}
