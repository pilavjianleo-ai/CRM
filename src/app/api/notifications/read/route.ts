import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const markNotificationsSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.id || !session.user.workspaceId || !prisma) {
    return NextResponse.json({ status: "ignored" });
  }

  const body = await request.json().catch(() => null);
  const parsed = markNotificationsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Ogiltig notifieringsförfrågan." }, { status: 400 });
  }

  if (parsed.data.markAll) {
    try {
      await prisma.notification.updateMany({
        where: {
          workspaceId: session.user.workspaceId,
          userId: session.user.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });
    } catch {
      return NextResponse.json({ status: "ignored" });
    }

    return NextResponse.json({ status: "success" });
  }

  if (!parsed.data.notificationId) {
    return NextResponse.json({ message: "Notifiering saknas." }, { status: 400 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        id: parsed.data.notificationId,
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
      },
      data: {
        readAt: new Date(),
      },
    });
  } catch {
    return NextResponse.json({ status: "ignored" });
  }

  return NextResponse.json({ status: "success" });
}
