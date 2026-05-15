import { notFound } from "next/navigation";

import { CustomerDetailPage } from "@/components/customer-detail-page";
import { getCustomerDetailData } from "@/lib/server/business-data";

export default async function Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const data = await getCustomerDetailData(customerId);

  if (!data) {
    notFound();
  }

  return <CustomerDetailPage data={data} />;
}
