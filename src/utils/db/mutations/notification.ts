import { type BaseNotificationPayload } from "~/lib/notifications/NotificationService";
import { db } from "~/server/db";

export const NotificationMutations = {
  createNotifications: (payload: BaseNotificationPayload) => {
    return db.notification.create({
      data: {
        title: payload.title,
        description: payload.description,
        createdAt: payload.createdAt,
        metadata: payload.metadata as Prisma.InputJsonValue,
        userId: payload.userId,
      },
    });
  },
};
