import "server-only";

import { db } from "~/server/db";

export const NotificationQueries = {
  getNotifications: (userId: string) => {
    return db.notification.findMany({ where: { userId } });
  },
};
