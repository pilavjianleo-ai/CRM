import { AutomationPage } from "@/components/automation-page";
import { getAutomationData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getAutomationData();

  return <AutomationPage data={data ?? undefined} />;
}
