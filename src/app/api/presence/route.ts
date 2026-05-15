import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.id || !session.user.workspaceId || !prisma) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    await prisma.user.updateMany({
      where: {
        id: session.user.id,
        workspaceId: session.user.workspaceId,
      },
      data: {
        lastSeenAt: new Date(),
        isActive: true,
      },
    });
  } catch {
    return NextResponse.json({ status: "ignored" });
  }

  return NextResponse.json({ status: "success" });
}
