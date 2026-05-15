import { LeadsPage } from "@/components/leads-page";
import { getLeadsData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getLeadsData();

  return <LeadsPage data={data ?? undefined} />;
}
