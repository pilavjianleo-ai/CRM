import { auth } from "@/auth";
import { TeamPage } from "@/components/team-page";
import { getTeamData } from "@/lib/server/business-data";
import { WORKSPACE_ROLES, type WorkspaceRoleValue } from "@/lib/workspace-role";

export default async function Page() {
  const [data, session] = await Promise.all([getTeamData(), auth()]);

  return (
    <TeamPage
      data={data ?? undefined}
      currentUserRole={
        ((session?.user?.role as WorkspaceRoleValue | undefined) ?? WORKSPACE_ROLES.MEMBER)
      }
    />
  );
}
