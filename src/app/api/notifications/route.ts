import { NextResponse } from "next/server";
import { NotificationPriority, NotificationType } from "@prisma/client";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

type NotificationResponse = {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export async function GET(request: Request) {
  const session = await auth();
  const prisma = getPrisma();

  if (!session?.user?.id || !session.user.workspaceId || !prisma) {
    return NextResponse.json({ notifications: [] satisfies NotificationResponse[], unreadCount: 0 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "8"), 20);

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          workspaceId: session.user.workspaceId,
          userId: session.user.id,
        },
        orderBy: { createdAt: "desc" },
        take: Number.isFinite(limit) ? limit : 8,
        select: {
          id: true,
          type: true,
          priority: true,
          title: true,
          body: true,
          href: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: {
          workspaceId: session.user.workspaceId,
          userId: session.user.id,
          readAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        ...notification,
        readAt: notification.readAt?.toISOString() ?? null,
        createdAt: notification.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch {
    return NextResponse.json({ notifications: [] satisfies NotificationResponse[], unreadCount: 0 });
  }
}
