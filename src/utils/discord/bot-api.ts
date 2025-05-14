import {
  type APIGuild,
  type APIGuildMember,
  type APIMessage,
  type APIRole,
  type APISoundboardSound,
} from "discord-api-types/v10";
import { getEmojiUrl } from "~/components/emoji-image";
import { env } from "~/env";
import { type SoundMutations } from "../db/mutations/sound";
import { type CreateSoundParams } from "./types";
import { BOT_AUTHORIZATION, createDiscordRequest } from "./utils";

export const BotDiscordApi = {
  async createSound({
    guildId,
    name,
    emoji,
    sound,
  }: CreateSoundParams): Promise<APISoundboardSound> {
    const body = JSON.stringify({
      name,
      sound,
      emoji_name: emoji,
    });
    return createDiscordRequest<APISoundboardSound>(
      `/guilds/${guildId}/soundboard-sounds`,
      BOT_AUTHORIZATION,
      {
        body,
        method: "POST",
      },
    );
  },

  async getSoundBoard(guildId: string) {
    try {
      const data = await createDiscordRequest<{ items: APISoundboardSound[] }>(
        `/guilds/${guildId}/soundboard-sounds`,
        BOT_AUTHORIZATION,
      );

      return data.items;
    } catch {
      return [];
    }
  },

  async deleteSound(guildId: string, soundId: string) {
    await createDiscordRequest(
      `/guilds/${guildId}/soundboard-sounds/${soundId}`,
      BOT_AUTHORIZATION,
      {
        method: "DELETE",
        no_content_type: true,
      },
    );
  },

  async isBotInGuild(guildId: string): Promise<boolean> {
    try {
      await createDiscordRequest<APIGuild>(
        `/guilds/${guildId}`,
        BOT_AUTHORIZATION,
      );
      return true;
    } catch {
      return false;
    }
  },

  async getGuildRoles(guildId: string) {
    return createDiscordRequest<APIRole[]>(
      `/guilds/${guildId}/roles`,
      BOT_AUTHORIZATION,
    );
  },

  async getUserRoles(guildId: string, userId: string) {
    const data = await createDiscordRequest<APIGuildMember>(
      `/guilds/${guildId}/members/${userId}`,
      BOT_AUTHORIZATION,
    );

    return {
      roles: data.roles,
    };
  },

  async sendNewSoundNotification(
    sound: Awaited<ReturnType<typeof SoundMutations.createSound>>["value"],
    channelId?: string,
  ) {
    if (!channelId) return;

    const data = await createDiscordRequest<APIMessage>(
      `/channels/${channelId}/messages`,
      BOT_AUTHORIZATION,
      {
        body: JSON.stringify({
          embeds: [
            {
              color: 39129,
              timestamp: sound.createdAt.toISOString(),
              url: `${env.NEXT_PUBLIC_BASE_URL}/sound/${sound.id}`,
              author: {
                url: `${env.NEXT_PUBLIC_BASE_URL}/user/${sound.createdById}`,
                name: sound.createdBy.name,
                icon_url: sound.createdBy.image,
              },
              title: sound.name,
              description: "New sound uploaded",
              thumbnail: {
                url: getEmojiUrl(sound.emoji),
              },
            },
          ],
        }),
      },
    );

    return { success: true, message: data.id };
  },
};
