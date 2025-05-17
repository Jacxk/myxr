import { type APIEmbed } from "discord-api-types/v10";
import {
  NotificationHandler,
  type BaseNotificationPayload,
} from "../NotificationService";

export class DiscordNotificationHandler extends NotificationHandler<
  APIEmbed[]
> {
  private url: string;

  constructor(channelId: string) {
    super();
    this.url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  }

  async handle(payload: BaseNotificationPayload<APIEmbed[]>): Promise<void> {
    if (!payload.metadata) return;

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
