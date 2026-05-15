import { BookingsPage } from "@/components/bookings-page";
import { getBookingsData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getBookingsData();

  return <BookingsPage data={data ?? undefined} />;
}
