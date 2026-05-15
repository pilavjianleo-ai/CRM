import { TasksPage } from "@/components/tasks-page";
import { getTasksData } from "@/lib/server/business-data";

export default async function Page() {
  const data = await getTasksData();

  return <TasksPage data={data ?? undefined} />;
}
