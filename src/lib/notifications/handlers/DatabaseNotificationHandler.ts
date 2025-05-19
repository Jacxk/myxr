import "server-only";

import { NotificationMutations } from "~/utils/db/mutations/notification";
import {
  NotificationHandler,
  type BaseNotificationPayload,
} from "../NotificationService";

export class DatabaseNotificationHandler<
  T = unknown,
> extends NotificationHandler<T> {
  async handle(payload: BaseNotificationPayload<T>): Promise<void> {
    try {
      await NotificationMutations.createNotifications(payload);
    } catch (error) {
      console.error("Failed to store notification in database:", error);
      throw error;
    }
  }
}
