import "server-only";

import { type RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { env } from "~/env";
import {
  NotificationHandler,
  type BaseNotificationPayload,
} from "../NotificationService";

export class DiscordNotificationHandler<
  T extends RESTPostAPIChannelMessageJSONBody,
> extends NotificationHandler<T> {
  private url: string;

  constructor(channelId: string) {
    super();
    this.url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  }

  async handle(payload: BaseNotificationPayload<T>): Promise<void> {
    if (!payload.metadata) return;

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
        },
        body: JSON.stringify(payload.metadata),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to send Discord notification:", error);
      throw error;
    }
  }
}
