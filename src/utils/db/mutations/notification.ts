import "server-only";

import { type Prisma } from "@prisma/client";
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

  markAllAsRead: (userId: string) => {
    return db.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  },

  markAsRead: (notificationId: string) => {
    return db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  markManyAsRead: (notificationIds: string[]) => {
    return db.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { read: true },
    });
  },

  deleteAll: (userId: string) => {
    return db.notification.deleteMany({
      where: { userId },
    });
  },

  deleteMany: (notificationIds: string[]) => {
    return db.notification.deleteMany({
      where: { id: { in: notificationIds } },
    });
  },

  deleteSingle: (id: string) => {
    return db.notification.delete({
      where: { id },
    });
  },
};
