import "server-only";

import { db } from "~/server/db";

export const GuildQuery = {
  getGuild: async (guildId: string) => {
    return db.guild.findFirst({
      where: { id: guildId },
    });
  },

  getGuildSounds: async (guildId: string) => {
    return await db.guildSound.findMany({
      where: { guildId },
      include: { sound: { include: { createdBy: true } }, guild: true },
    });
  },

  getSoundMasterRoles: async (guildId: string) => {
    return db.guild.findFirst({
      where: { id: guildId },
      select: {
        soundMasterRoles: true,
      },
    });
  },

  getAllSoundMasterRoles: () => {
    return db.guild.findMany({
      select: {
        soundMasterRoles: true,
        id: true,
      },
    });
  },

  getUserGuilds: async (userId: string) => {
    const data = await db.user.findFirst({
      where: { id: userId },
      select: { guilds: { select: { guild: true, canManage: true } } },
    });

    return data;
  },

  getGuildCount: () => {
    return db.guild.count();
  },

  getNotificationChannel: (guildId: string) => {
    return db.guild.findFirst({
      where: { id: guildId },
      select: {
        notificationsChannel: true,
      },
    });
  },
  getGuildsWithSoundsCount: async () => {
    const [data] = await db.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count
      FROM "Guild" guild
      WHERE EXISTS (
        SELECT 1
        FROM "GuildSound" guildSound
        WHERE guildSound."guildId" = guild.id
      )
    `;

    return data.count;
  },
};
