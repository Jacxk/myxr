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

  getUserGuilds: async (userId: string) => {
    const data = await db.user.findFirst({
      where: { id: userId },
      select: { guilds: { select: { guild: true } } },
    });

    return data?.guilds;
  },

  getGuildCount: () => {
    return db.guild.count();
  },
};
