import "server-only";

import {
  ChannelType,
  type APIChannel,
  type APIGuild,
  type APIGuildMember,
  type APIRole,
  type APISoundboardSound,
} from "discord-api-types/v10";
import { type CreateSoundParams, type DiscordError } from "./types";
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

      return { items: data.items };
    } catch (error: unknown) {
      return { error: error as DiscordError };
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

  async getAllTextChannels(guildId: string) {
    const channels = await createDiscordRequest<APIChannel[]>(
      `/guilds/${guildId}/channels`,
      BOT_AUTHORIZATION,
    );

    return channels.filter((channel) => channel.type === ChannelType.GuildText);
  },

  async getAllGuilds() {
    const data = await createDiscordRequest<APIGuild[]>(
      "users/@me/guilds",
      BOT_AUTHORIZATION,
    );

    return data;
  },
};
