import {
  NotificationHandler,
  type BaseNotificationPayload,
} from "../NotificationService";

export class DatabaseNotificationHandler<
  T = unknown,
> extends NotificationHandler<T> {
  async handle(payload: BaseNotificationPayload<T>): Promise<void> {
    try {
      // Here you would implement your database storage logic
      // For example, using Prisma:
      // await prisma.notification.create({
      //   data: {
      //     title: payload.title,
      //     message: payload.message,
      //     timestamp: payload.timestamp,
      //     metadata: payload.metadata,
      //   },
      // });
      console.log("Storing notification in database:", payload);
    } catch (error) {
      console.error("Failed to store notification in database:", error);
      throw error;
    }
  }
}
