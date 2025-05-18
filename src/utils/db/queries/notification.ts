import "server-only";

import { db } from "~/server/db";

export const NotificationQueries = {
  getNotifications: (
    userId: string,
    { limit = 10, cursor }: { limit?: number; cursor?: string | null } = {},
  ) => {
    return db.notification.findMany({
      take: limit + 1,
      where: { userId },
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },
};
