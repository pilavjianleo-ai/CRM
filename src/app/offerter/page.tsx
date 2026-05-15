import { QuotesPage } from "@/components/quotes-page";
import { getQuotesData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getQuotesData();
  return <QuotesPage data={data ?? undefined} />;
}
