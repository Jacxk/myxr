import "server-only";

import { db } from "~/server/db";
import { UserDiscordApi } from "~/utils/discord/user-api";
import { GuildMutation } from "./guild";

export const UserMutation = {
  updateGuildMemberShip: async (userId: string, force?: boolean) => {
    const user = await db.user.findFirst({
      where: { id: userId },
      select: { updatedAt: true },
    });

    if (!user?.updatedAt) return;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
    if (!force && user.updatedAt > fiveMinutesAgo) return;

    const guilds = await UserDiscordApi.getGuilds(userId);

    const existingGuildIds = guilds.map((guild) => guild.id);
    if (existingGuildIds.length > 0)
      await db.guildMembership.deleteMany({
        where: {
          userId,
          NOT: {
            guildId: {
              in: existingGuildIds,
            },
          },
        },
      });

    for (const guild of guilds) {
      await GuildMutation.upsertGuild(guild);

      const data = {
        guildId: guild.id,
        userId,
      };

      await db.guildMembership.upsert({
        where: { userId_guildId: { guildId: guild.id, userId: userId } },
        create: data,
        update: data,
      });
    }

    await db.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  },
};
