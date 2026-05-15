import { BusinessOsHome } from "@/components/business-os-home";
import { getOverviewData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getOverviewData();

  return <BusinessOsHome data={data ?? undefined} />;
}
