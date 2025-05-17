// Abstract base class for all notifications with generic metadata type
export abstract class NotificationHandler<T = unknown> {
  abstract handle(payload: BaseNotificationPayload<T>): Promise<void>;
}

// Type for the notification payload with generic metadata
export type BaseNotificationPayload<T = unknown> = {
  userId: string;
  title: string;
  description: string;
  createdAt: Date;
  metadata?: T;
};

// Main notification service that manages different handlers
export class NotificationService<T = unknown> {
  private handlers: NotificationHandler<T>[] = [];

  addHandler(handler: NotificationHandler<T>): void {
    this.handlers.push(handler);
  }

  async notify(payload: BaseNotificationPayload<T>): Promise<void> {
    const promises = this.handlers.map((handler) => handler.handle(payload));
    await Promise.all(promises);
  }
}

// Example usage:
/*
import { DiscordNotificationHandler } from './handlers/DiscordNotificationHandler';
import { DatabaseNotificationHandler } from './handlers/DatabaseNotificationHandler';

// Define your metadata type
type SoundMetadata = {
  userId: string;
  soundId: string;
  soundName: string;
};

// Create a notification service with the specific metadata type
const notificationService = new NotificationService<SoundMetadata>();

// Add Discord notifications
const discordHandler = new DiscordNotificationHandler<SoundMetadata>('YOUR_DISCORD_WEBHOOK_URL');
notificationService.addHandler(discordHandler);

// Add database notifications
const dbHandler = new DatabaseNotificationHandler<SoundMetadata>();
notificationService.addHandler(dbHandler);

// Send a notification with typed metadata
await notificationService.notify({
  title: 'New Sound Created',
  message: 'User John created a new sound called "Summer Vibes"',
  metadata: {
    userId: '123',
    soundId: '456',
    soundName: 'Summer Vibes'
  },
});
*/
