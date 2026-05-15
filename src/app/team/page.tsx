import { WorkspaceRole } from "@prisma/client";

import { auth } from "@/auth";
import { TeamPage } from "@/components/team-page";
import { getTeamData } from "@/lib/server/business-data";

export default async function Page() {
  const [data, session] = await Promise.all([getTeamData(), auth()]);

  return (
    <TeamPage
      data={data ?? undefined}
      currentUserRole={(session?.user?.role as WorkspaceRole | undefined) ?? WorkspaceRole.MEMBER}
    />
  );
}
