import { PipelinePage } from "@/components/pipeline-page";
import { getPipelineData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getPipelineData();

  return <PipelinePage data={data ?? undefined} />;
}
