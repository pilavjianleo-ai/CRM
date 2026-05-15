import { WorkspacePlan, WorkspaceRole } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

export async function getPrimaryWorkspace(prisma: PrismaClient) {
  try {
    return (
      (await prisma.workspace.findUnique({
        where: { slug: "relations-demo" },
      })) ??
      (await prisma.workspace.findFirst({
        orderBy: { createdAt: "asc" },
      }))
    );
  } catch {
    return null;
  }
}

export async function ensureWorkspace(prisma: PrismaClient) {
  const existing = await getPrimaryWorkspace(prisma);

  if (existing) {
    return existing;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: "Relations Inbox",
      slug: "relations-demo",
      plan: WorkspacePlan.STARTER,
      industry: "Tjänsteföretag",
      users: {
        create: {
          email: "system@relationssystem.se",
          firstName: "System",
          lastName: "Användare",
          title: "Automation",
        },
      },
    },
    include: {
      users: true,
    },
  });

  const owner = workspace.users[0];

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: owner.id,
      role: WorkspaceRole.OWNER,
    },
  });

  return workspace;
}

export async function getWorkspaceWithDefaultUser(prisma: PrismaClient) {
  const workspace = await ensureWorkspace(prisma);
  const owner =
    (await prisma.user.findFirst({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "asc" },
    })) ?? null;

  return { workspace, owner };
}
