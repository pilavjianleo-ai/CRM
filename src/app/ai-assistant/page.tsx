import { AIAssistantPage } from "@/components/ai-assistant-page";
import { getAIAssistantData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getAIAssistantData();

  return <AIAssistantPage data={data ?? undefined} />;
}
