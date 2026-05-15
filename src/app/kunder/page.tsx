import { CustomersPage } from "@/components/customers-page";
import { getCustomersData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getCustomersData();

  return <CustomersPage data={data ?? undefined} />;
}
