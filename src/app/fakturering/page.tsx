import { BillingPage } from "@/components/billing-page";
import { getBillingData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getBillingData();

  return <BillingPage data={data ?? undefined} />;
}
