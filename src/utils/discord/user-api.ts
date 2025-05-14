import { type APIGuild } from "discord-api-types/v10";
import { discordAuthorization } from "../db";
import { DiscordPermission } from "./types";
import { createDiscordRequest, hasPermission } from "./utils";

export const UserDiscordApi = {
  async getGuilds(userId: string) {
    try {
      const authorization = await discordAuthorization(userId);
      const data = await createDiscordRequest<APIGuild[]>(
        "users/@me/guilds",
        authorization,
      );

      return data.filter(
        (guild: APIGuild) =>
          guild.owner ??
          hasPermission(
            guild.permissions,
            DiscordPermission.MANAGE_GUILD_EXPRESSIONS,
          ),
      );
    } catch {
      return [];
    }
  },
};
