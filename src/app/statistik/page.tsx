import { AnalyticsPage } from "@/components/analytics-page";
import { getAnalyticsData } from "@/lib/server/analytics-workspace-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getAnalyticsData();

  return <AnalyticsPage data={data ?? undefined} />;
}
