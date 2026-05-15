import { ConversationsPage } from "@/components/conversations-page";
import { getConversationsData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getConversationsData();

  return <ConversationsPage data={data ?? undefined} />;
}
